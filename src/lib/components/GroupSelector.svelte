<script lang="ts">
  import { BUILD_TIME } from '$lib/build';
  import { RAFFLE_GROUP_OPTIONS, type RaffleGroup } from '$lib/data/raffle';
  import { getLocale, t } from '$lib/i18n/locale.svelte';

  interface Props {
    value?: RaffleGroup;
    onchange?: (group: RaffleGroup) => void;
  }

  let { value = $bindable('g1' as RaffleGroup), onchange }: Props = $props();

  const formattedBuildTime = $derived(
    BUILD_TIME
      ? new Intl.DateTimeFormat(getLocale(), {
          dateStyle: 'medium',
          timeStyle: 'medium'
        }).format(new Date(BUILD_TIME))
      : null
  );

  function select(group: RaffleGroup) {
    value = group;
    onchange?.(group);
  }
</script>

<div class="group-selector-wrap">
  <div class="hist-group-toggle">
    {#each RAFFLE_GROUP_OPTIONS as opt (opt.id)}
      <button
        type="button"
        class="hist-group-btn"
        class:active={value === opt.id}
        onclick={() => select(opt.id)}>{t(`groups.${opt.id}`)}</button
      >
    {/each}
  </div>

  {#if formattedBuildTime}
    <span class="group-selector-build">
      {t('settings.buildTime')}: {formattedBuildTime}
    </span>
  {/if}
</div>
