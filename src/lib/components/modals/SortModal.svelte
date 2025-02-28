<svelte:options immutable={true} />

<script lang="ts">
  import { isEmpty } from 'lodash-es'
  import { getContext } from 'svelte'
  import Select from 'svelte-select'
  import Header from './Header.svelte'
  import { getNestedPaths } from '../../utils/arrayUtils.js'
  import { isObject } from '../../utils/typeUtils.js'
  import { stringifyPath } from '../../utils/pathUtils.js'
  import { sortArray, sortObjectKeys } from '../../logic/sort.js'
  import { sortModalState } from './sortModalState.js'
  import { compileJSONPointer, getIn } from 'immutable-json-patch'
  import { createDebug } from '../../utils/debug'
  import type { JSONData, OnSort, Path } from '../../types'

  const debug = createDebug('jsoneditor:SortModal')

  export let id: string
  export let json: JSONData // the whole document
  export let selectedPath: Path
  export let onSort: OnSort

  const { close } = getContext('simple-modal')

  const stateId = `${id}:${compileJSONPointer(selectedPath)}`
  const selectedJson = getIn(json, selectedPath)
  $: jsonIsArray = Array.isArray(selectedJson)
  $: paths = jsonIsArray ? getNestedPaths(selectedJson) : undefined
  $: properties = paths ? paths.map(pathToOption) : undefined

  const asc = {
    value: 1,
    label: 'ascending'
  }
  const desc = {
    value: -1,
    label: 'descending'
  }
  const directions = [asc, desc]

  let selectedProperty =
    (sortModalState[stateId] && sortModalState[stateId].selectedProperty) || undefined
  let selectedDirection =
    (sortModalState[stateId] && sortModalState[stateId].selectedDirection) || asc

  $: {
    // if there is only one option, select it and do not render the select box
    if (selectedProperty === undefined && properties && properties.length === 1) {
      selectedProperty = properties[0]
    }
  }

  $: {
    // remember the selected values for the next time we open the SortModal
    // just in memory, not persisted
    sortModalState[stateId] = {
      selectedProperty,
      selectedDirection
    }

    debug('store state in memory', stateId, sortModalState[stateId])
  }

  function pathToOption(path: Path): { value: Path; label: string } {
    return {
      value: path,
      label: isEmpty(path) ? '(whole item)' : stringifyPath(path)
    }
  }

  function handleSort() {
    if (jsonIsArray) {
      if (!selectedProperty) {
        return
      }

      const property = selectedProperty.value
      const direction = selectedDirection.value
      const operations = sortArray(json, selectedPath, property, direction)

      onSort(operations)
    } else if (isObject(selectedJson)) {
      const direction = selectedDirection.value
      const operations = sortObjectKeys(json, selectedPath, direction)

      onSort(operations)
    } else {
      console.error('Cannot sort: no array or object')
    }

    close()
  }

  function focus(element: HTMLElement) {
    element.focus()
  }
</script>

<div class="jse-modal jse-sort">
  <Header title={jsonIsArray ? 'Sort array items' : 'Sort object keys'} />

  <div class="jse-contents">
    <table>
      <colgroup>
        <col width="25%" />
        <col width="75%" />
      </colgroup>
      <tbody>
        <tr>
          <th>Path</th>
          <td>
            <input
              class="jse-path"
              type="text"
              readonly
              title="Selected path"
              value={!isEmpty(selectedPath) ? stringifyPath(selectedPath) : '(whole document)'}
            />
          </td>
        </tr>
        {#if jsonIsArray && (properties.length > 1 || selectedProperty === undefined)}
          <tr>
            <th>Property</th>
            <td>
              <Select showIndicator items={properties} bind:value={selectedProperty} />
            </td>
          </tr>
        {/if}
        <tr>
          <th>Direction</th>
          <td>
            <Select
              showIndicator
              items={directions}
              bind:value={selectedDirection}
              isClearable={false}
            />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="jse-space" />

    <div class="jse-actions">
      <button
        type="button"
        class="jse-primary"
        on:click={handleSort}
        use:focus
        disabled={jsonIsArray ? !selectedProperty : false}
      >
        Sort
      </button>
    </div>
  </div>
</div>

<style src="./SortModal.scss"></style>
