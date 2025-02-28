<svelte:options immutable={true} />

<script lang="ts">
  import { getIn } from 'immutable-json-patch'
  import { range } from 'lodash-es'
  import { isObject, isObjectOrArray } from '../../../utils/typeUtils'
  import { STATE_KEYS } from '../../../constants'
  import { createSelection, SELECTION_TYPE } from '../../../logic/selection'
  import { createDebug } from '../../../utils/debug'
  import NavigationBarItem from '../../../components/controls/navigationBar/NavigationBarItem.svelte'
  import { caseInsensitiveNaturalCompare } from '../../../logic/sort'
  import type { JSONData, OnSelect, Path } from '../../../types'

  const debug = createDebug('jsoneditor:NavigationBar')

  export let json: JSONData
  export let state: JSONData
  export let selection: Selection | undefined
  export let onSelect: OnSelect

  let refNavigationBar: Element | undefined

  $: path = selection ? selection.focusPath : []
  $: hasNextItem = isObjectOrArray(getIn(json, path))

  function scrollToLastItem() {
    setTimeout(() => {
      if (refNavigationBar && refNavigationBar.scrollTo) {
        const left = refNavigationBar.scrollWidth - refNavigationBar.clientWidth
        if (left > 0) {
          debug('scrollTo ', left)
          refNavigationBar.scrollTo({ left, behavior: 'smooth' })
        }
      }
    })
  }

  // trigger scrollToLastItem when path changes
  $: scrollToLastItem(path)

  function getItems(path: Path): (string | number)[] {
    debug('get items for path', path)

    const node = getIn(json, path)
    if (Array.isArray(node)) {
      return range(0, node.length)
    } else if (isObject(node)) {
      const keys = (getIn(state, path.concat(STATE_KEYS)) || Object.keys(node)) as string[]

      const sortedKeys = keys.slice(0)
      sortedKeys.sort(caseInsensitiveNaturalCompare)

      return sortedKeys
    } else {
      // never happens but just for robustness...
      return []
    }
  }

  function handleSelect(path: Path) {
    debug('select path', JSON.stringify(path))

    const newSelection = createSelection(json, state, {
      type: SELECTION_TYPE.MULTI,
      anchorPath: path,
      focusPath: path
    })

    onSelect(newSelection)
  }
</script>

<div class="jse-navigation-bar" bind:this={refNavigationBar}>
  {#each path as item, index (index)}
    <NavigationBarItem {getItems} {path} {index} onSelect={handleSelect} />
  {/each}
  {#if hasNextItem}
    <NavigationBarItem {getItems} {path} index={undefined} onSelect={handleSelect} />
  {/if}
  <div class="jse-navigation-bar-space">
    <!-- ensure the right height (arrows have less height than the text) -->
    {!isObjectOrArray(json) ? 'Navigation bar' : '\u00A0'}
  </div>
</div>

<style src="./NavigationBar.scss"></style>
