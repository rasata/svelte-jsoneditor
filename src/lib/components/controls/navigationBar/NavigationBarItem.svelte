<svelte:options immutable={true} />

<script lang="ts">
  import Icon from 'svelte-awesome'
  import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
  import NavigationBarDropdown from '../../../components/controls/navigationBar/NavigationBarDropdown.svelte'
  import { getContext } from 'svelte'
  import type { Path } from '../../../types'

  const { openAbsolutePopup, closeAbsolutePopup } = getContext('absolute-popup')

  export let path: Path
  export let index: number
  export let onSelect: (path: Path) => void
  export let getItems: (path: Path) => (string | number)[]

  let refNavigationBarItem: Element | undefined
  let open = false

  $: itemPath = path.slice(0, index)
  $: selectedItem = path[index]

  function handleSelectItem(item) {
    closeAbsolutePopup()
    onSelect(itemPath.concat(item))
  }

  function openDropdown() {
    if (refNavigationBarItem) {
      open = true

      const props = {
        items: getItems(itemPath),
        selectedItem,
        onSelect: handleSelectItem
      }

      openAbsolutePopup(NavigationBarDropdown, props, {
        anchor: refNavigationBarItem,
        closeOnOuterClick: true,
        onClose: () => {
          open = false
        }
      })
    }
  }
</script>

<div class="jse-navigation-bar-item" bind:this={refNavigationBarItem}>
  <button
    type="button"
    class="jse-navigation-bar-button jse-navigation-bar-arrow"
    class:jse-open={open}
    on:click={openDropdown}
  >
    <Icon data={faAngleRight} />
  </button>
  {#if selectedItem !== undefined}
    <button
      type="button"
      class="jse-navigation-bar-button"
      on:click={() => handleSelectItem(selectedItem)}
    >
      {selectedItem}
    </button>
  {/if}
</div>

<style src="./NavigationBarItem.scss"></style>
