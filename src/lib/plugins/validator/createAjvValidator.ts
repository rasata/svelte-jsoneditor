import Ajv from 'ajv-dist'
import { parseJSONPointerWithArrayIndices } from '../../utils/jsonPointer.js'
import type { JSONData, ValidationError } from '../../types'

/**
 * Create a JSON Schema validator powered by Ajv.
 * @param schema
 * @param [schemaDefinitions=undefined]
 *                    An object containing JSON Schema definitions
 *                    which can be referenced using $ref
 * @return Returns a validation function
 */
export function createAjvValidator(schema: JSONData, schemaDefinitions: JSONData = undefined) {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    $data: true
  })

  if (schemaDefinitions) {
    Object.keys(schemaDefinitions).forEach((ref) => {
      ajv.addSchema(schemaDefinitions[ref], ref)
    })
  }

  const validateAjv = ajv.compile(schema)

  return function validate(json: JSONData): ValidationError[] {
    validateAjv(json)
    const ajvErrors = validateAjv.errors || []

    return ajvErrors.map(improveAjvError).map((error) => normalizeAjvError(json, error))
  }
}

/**
 * @param {JSON} json
 * @param {Object} ajvError
 * @return {ValidationError}
 */
function normalizeAjvError(json: JSONData, ajvError) {
  return {
    path: parseJSONPointerWithArrayIndices(json, ajvError.instancePath),
    message: ajvError.message
  }
}

/**
 * Improve the error message of a JSON schema error,
 * for example list the available values of an enum.
 *
 * @param {Object} ajvError
 * @return {Object} Returns the error with improved message
 */
function improveAjvError(ajvError) {
  if (ajvError.keyword === 'enum' && Array.isArray(ajvError.schema)) {
    let enums = ajvError.schema
    if (enums) {
      enums = enums.map((value) => JSON.stringify(value))

      if (enums.length > 5) {
        const more = ['(' + (enums.length - 5) + ' more...)']
        enums = enums.slice(0, 5)
        enums.push(more)
      }
      ajvError.message = 'should be equal to one of: ' + enums.join(', ')
    }
  }

  if (ajvError.keyword === 'additionalProperties') {
    ajvError.message = 'should NOT have additional property: ' + ajvError.params.additionalProperty
  }

  return ajvError
}
