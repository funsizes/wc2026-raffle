<script lang="ts">
  import type { Match, RaffleEntry } from '$lib/types';
  import { t } from '$lib/i18n/locale.svelte';
  import { dailyMoversForDate } from '$lib/utils/daily-movers';
  import { dateStr } from '$lib/utils/snapshots';
  import Flag from './Flag.svelte';

  interface Props {
    raffle: RaffleEntry[];
    allMatches: Match[] | null;
  }

  let { raffle, allMatches }: Props = $props();

  const today = $derived(dateStr(0));

  const summary = $derived.by(() => {
    if (!allMatches) return null;
    return dailyMoversForDate(raffle, allMatches, today);
  });

  const movers = $derived(summary?.movers ?? null);
</script>

<div class="daily-summary">
  {#if !allMatches}
    <p class="ds-heading">{t('dailySummary.noGames')}</p>
  {:else if movers !== null && movers.length === 0}
    <p class="ds-heading">{t('dailySummary.noGames')}</p>
  {:else if movers}
    <p class="ds-heading">
      {t('dailySummary.movers', { since: t('dailySummary.sinceYesterday') })}
    </p>
    <div class="mover-list">
      {#each movers as { entry: e, rankDelta, gdDelta, eliminatedToday } (e.name + e.team)}
        {@const wentOut = eliminatedToday && e.p.score < 7}
        {@const pillCls = wentOut ? 'mp-out' : rankDelta > 0 ? 'mp-up' : rankDelta < 0 ? 'mp-down' : ''}
        {@const rankStr = wentOut
          ? t('dailySummary.eliminated')
          : eliminatedToday
            ? e.p.label
            : rankDelta > 0
              ? `▲${rankDelta}`
              : rankDelta < 0
                ? `▼${Math.abs(rankDelta)}`
                : '='}

        {@const rankCls = wentOut ? 'rd-out' : rankDelta > 0 ? 'rd-up' : rankDelta < 0 ? 'rd-down' : 'rd-same'}
        {@const gdStr =
          gdDelta > 0 ? `GD +${gdDelta}` : gdDelta < 0 ? `GD ${gdDelta}` : 'GD 0'}

        <div class="mover-pill {pillCls}">
          <span class="mflag-sm">
            <Flag entry={e} icons />
          </span>

          <strong class="mover-name">{e.name}</strong>

          <span class="mover-team">{e.team}</span>

          <span class="mover-rank {rankCls}">{rankStr}</span>
          <span class="mover-gd">{gdStr}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
