<script lang="ts">
  import { PR_SOURCE_LABELS, RANK_SOURCES } from '$lib/data/rankings';

  interface Props {
    value?: number;
  }

  let { value = $bindable(-1) }: Props = $props();

  const selectId = $props.id();
</script>

<div class="pr-selector-bar">
  <label for={selectId}>⚔ Power Ranking Source:</label>

  <select id={selectId} bind:value={value}>
    <option value={-1}>Avg — All {RANK_SOURCES.length} Sources</option>
    {#each PR_SOURCE_LABELS as label, idx (idx)}
      <option value={idx}>{label}</option>
    {/each}
  </select>
</div>
