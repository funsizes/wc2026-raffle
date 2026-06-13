<script lang="ts">
  import type { LeaderboardEntry, Match } from '$lib/types';
  import { t } from '$lib/i18n/locale.svelte';
  import { loadSnapshot, teamPlayedToday, teamsPlayedToday } from '$lib/utils/snapshots';
  import Flag from './Flag.svelte';

  interface Props {
    entries: LeaderboardEntry[];
    allMatches: Match[] | null;
    snapLabel: string;
  }

  let { entries, allMatches, snapLabel }: Props = $props();

  const snap = $derived(loadSnapshot(snapLabel, -1) || loadSnapshot(snapLabel, 0));
  const playedToday = $derived(teamsPlayedToday(allMatches));

  const movers = $derived.by(() => {
    if (!snap) return null;
    const list: { e: LeaderboardEntry; rankDelta: number; gdDelta: number }[] = [];
    entries.forEach((e, i) => {
      if (!teamPlayedToday(e.api, playedToday)) return;
      const prev = snap[e.name + '|' + e.team];
      if (!prev) return;
      list.push({ e, rankDelta: prev.rank - (i + 1), gdDelta: e.p.gd - prev.gd });
    });
    if (list.length === 0) return [];
    list.sort(
      (a, b) =>
        Math.abs(b.rankDelta) - Math.abs(a.rankDelta) || Math.abs(b.gdDelta) - Math.abs(a.gdDelta)
    );
    return list;
  });

  const since = $derived(
    loadSnapshot(snapLabel, -1)
      ? t('dailySummary.sinceYesterday')
      : t('dailySummary.sinceFirstLoad')
  );
</script>

<div class="daily-summary">
  {#if snap === null}
    <p class="ds-heading">{t('dailySummary.dayOne')}</p>
  {:else if movers !== null && movers.length === 0}
    <p class="ds-heading">{t('dailySummary.noGames')}</p>
  {:else if movers}
    <p class="ds-heading">{t('dailySummary.movers', { since })}</p>
    <div class="mover-list">
      {#each movers as { e, rankDelta } (e.name + e.team)}
        {@const pillCls = rankDelta > 0 ? 'mp-up' : rankDelta < 0 ? 'mp-down' : ''}
        {@const rankStr =
          rankDelta > 0 ? `▲${rankDelta}` : rankDelta < 0 ? `▼${Math.abs(rankDelta)}` : '='}
        {@const rankCls = rankDelta > 0 ? 'rd-up' : rankDelta < 0 ? 'rd-down' : 'rd-same'}
        {@const gd = e.p.gd}
        {@const gdStr = gd > 0 ? `GD +${gd}` : gd < 0 ? `GD ${gd}` : 'GD 0'}
        <div class="mover-pill {pillCls}">
          <span class="mflag-sm"><Flag entry={e} /></span>
          <strong>{e.name}</strong>
          <span style="color:var(--muted);font-size:.65rem">{e.team}</span>
          <span class="mover-rank {rankCls}">{rankStr}</span>
          <span class="mover-gd">{gdStr}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
