<svelte:options immutable={true} />

<script lang="ts">
  import Icon from 'svelte-awesome'
  import type { FontAwesomeIcon, MessageAction } from '../../types'

  export let type: 'success' | 'error' = 'success' // 'success' or 'error'
  export let icon: FontAwesomeIcon = undefined
  export let message: string | undefined = undefined
  export let actions: MessageAction[] = []
  export let onClick: () => void | undefined = undefined

  function handleClick() {
    if (onClick) {
      onClick()
    }
  }
</script>

<div class="jse-message jse-{type}">
  <div class="jse-text" class:jse-clickable={onClick !== null} on:click={handleClick}>
    {#if icon}
      <Icon data={icon} />
    {/if}
    {message}
  </div>
  <div class="jse-actions">
    {#each actions as action}
      <button
        type="button"
        on:click={() => action.onClick()}
        on:mousedown={() => action.onMouseDown()}
        class="jse-button jse-action jse-primary"
        title={action.title}
        disabled={action.disabled}
      >
        {#if action.icon}
          <Icon data={action.icon} />
        {/if}
        {action.text}
      </button>
    {/each}
  </div>
</div>

<style src="./Message.scss"></style>
