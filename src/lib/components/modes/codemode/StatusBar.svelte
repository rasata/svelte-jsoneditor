<script lang="ts">
  import type { EditorState } from '@codemirror/state'
  import type { Line } from '@codemirror/text'

  export let editorState: EditorState | undefined

  let pos: number
  $: pos = editorState?.selection?.main?.head

  let line: Line
  $: line = editorState?.doc?.lineAt(pos)

  let lineNumber: number | undefined
  $: lineNumber = line ? line.number : undefined

  let columnNumber: number | undefined
  $: columnNumber = line ? pos - line.from + 1 : undefined

  let charCount: number | undefined
  $: charCount = editorState?.selection?.ranges?.reduce((count, range) => {
    return count + range.to - range.from
  }, 0)
</script>

<div class="jse-status-bar">
  {#if lineNumber !== undefined}
    <div class="jse-status-bar-info">Line: {lineNumber}</div>
  {/if}

  {#if columnNumber !== undefined}
    <div class="jse-status-bar-info">Column: {columnNumber}</div>
  {/if}

  {#if charCount !== undefined && charCount > 0}
    <div class="jse-status-bar-info">Selection: {charCount} characters</div>
  {/if}
</div>

<style src="./StatusBar.scss"></style>
