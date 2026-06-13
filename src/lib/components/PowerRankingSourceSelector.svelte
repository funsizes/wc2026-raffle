<script lang="ts">
  import { PR_SOURCE_LABELS, RANK_SOURCES } from '$lib/data/rankings';
  import { t } from '$lib/i18n/locale.svelte';

  interface Props {
    value?: number;
  }

  let { value = $bindable(-1) }: Props = $props();

  const selectId = $props.id();
</script>

<div class="pr-selector-bar">
  <label for={selectId}>{t('pr.sourceLabel')}</label>

  <select id={selectId} bind:value={value}>
    <option value={-1}>{t('pr.avgAll', { count: RANK_SOURCES.length })}</option>
    {#each PR_SOURCE_LABELS as label, idx (idx)}
      <option value={idx}>{label}</option>
    {/each}
  </select>
</div>
