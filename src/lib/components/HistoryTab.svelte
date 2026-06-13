<script lang="ts">
  import { HIST_SRC_LABELS } from '$lib/data/rankings';
  import { RAFFLE, RAFFLE2, type RaffleGroup } from '$lib/data/raffle';
  import {
    formatMonthDay,
    formatShortDate,
    formatWeekdayDate,
    t
  } from '$lib/i18n/locale.svelte';
  import type { Match, RaffleEntry } from '$lib/types';
  import { getPrData } from '$lib/utils/rankings';
  import {
    getSnapshotDates,
    loadHistSnap,
    teamsPlayedOnDate
  } from '$lib/utils/snapshots';
  import { sameTeam } from '$lib/utils/teams';
  import Flag from './Flag.svelte';

  interface Props {
    allMatches: Match[] | null;
    prSourceIdx: number;
    raffleGroup: RaffleGroup;
  }

  let { allMatches, prSourceIdx, raffleGroup: histGroup }: Props = $props();

  const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  let histDateIdx = $state(9999);

  const histRaffle = $derived(histGroup === 'g1' ? RAFFLE : RAFFLE2);

  const dates = $derived(getSnapshotDates(histGroup));
  const safeIdx = $derived(
    dates.length ? Math.max(0, Math.min(histDateIdx, dates.length - 1)) : 0
  );
  const date = $derived(dates[safeIdx] ?? '');
  const prevDate = $derived(safeIdx > 0 ? dates[safeIdx - 1] : null);

  const snap = $derived(date ? loadHistSnap(histGroup, date) : null);
  const prev = $derived(prevDate ? loadHistSnap(histGroup, prevDate) : null);

  const dateLabel = $derived(date ? formatShortDate(date) : '—');

  const movers = $derived.by(() => {
    if (!snap || !allMatches) return null;

    const playedOnDate = teamsPlayedOnDate(allMatches, date);
    const allEntries = Object.entries(snap).map(([key, val]) => {
      const sep = key.indexOf('|');
      const name = key.slice(0, sep);
      const team = key.slice(sep + 1);
      const raf = histRaffle.find((r) => r.name === name && r.team === team);
      return { name, team, raf, rank: val.rank, gd: val.gd, gs: val.gs };
    });

    return allEntries
      .filter((e) => {
        const api = e.raf ? e.raf.api : e.team;
        return [...playedOnDate].some((t) => sameTeam(t, api));
      })
      .map((e) => {
        const prevSnap = prev ? prev[e.name + '|' + e.team] : null;
        const delta = prevSnap != null ? prevSnap.rank - e.rank : null;
        const gdDelta = prevSnap != null ? e.gd - prevSnap.gd : 0;
        return { ...e, delta, gdDelta };
      })
      .sort(
        (a, b) =>
          Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0) ||
          Math.abs(b.gdDelta) - Math.abs(a.gdDelta) ||
          a.rank - b.rank
      );
  });

  const fullDate = $derived(date ? formatWeekdayDate(date) : '');

  const groupLbl = $derived(t(`groups.${histGroup}`));
  const srcLbl = $derived(
    prSourceIdx === -1
      ? t('history.avgSources', { count: 14 })
      : HIST_SRC_LABELS[prSourceIdx]
  );
  const vsLbl = $derived(
    prev && prevDate
      ? t('history.vsDate', { date: formatMonthDay(prevDate) })
      : t('history.dayOneSnapshot')
  );

  $effect(() => {
    histGroup;
    histDateIdx = 9999;
  });
</script>

<div class="hist-controls">
  <div class="hist-date-nav">
    <button type="button" class="hist-nav-btn" disabled={safeIdx === 0} onclick={() => histDateIdx--}
      >◀</button
    >
    <span class="hist-date-label">{dateLabel}</span>
    <button
      type="button"
      class="hist-nav-btn"
      disabled={safeIdx >= dates.length - 1}
      onclick={() => histDateIdx++}>▶</button
    >
  </div>
</div>

{#if dates.length === 0}
  <div class="sc-empty">
    {t('history.noHistory')}<br />{t('history.savesDaily')}<br />{t('history.checkTomorrow')}
  </div>
{:else if !snap}
  <div class="sc-empty">{t('history.noData')}</div>
{:else if !allMatches}
  <div class="sc-empty">{t('history.matchesLoading')}<br />{t('history.checkBack')}</div>
{:else if movers && movers.length === 0}
  <div class="sc-card">
    <div class="sc-head">
      <div class="sc-title">{t('history.recapTitle')}</div>
      <div class="sc-sub">{fullDate} · {groupLbl}</div>
    </div>
    <div class="sc-empty">{t('history.noTeamMatches')}</div>
  </div>
{:else if movers}
  <div class="sc-card">
    <div class="sc-head">
      <div class="sc-title">{t('history.recapTitle')}</div>
      <div class="sc-sub">{fullDate} · {groupLbl}</div>
      <div class="sc-meta">{t('history.positionChange')} {vsLbl} · {t('pr.rankShort')}: {srcLbl}</div>
    </div>
    <div class="sc-col-heads">
      <span>#</span><span></span><span>{t('history.player')}</span>
      <span>{t('history.move')}</span><span>{t('history.gdGoals')}</span><span>{t('history.prRank')}</span>
    </div>
    {#each movers as e (e.name + e.team)}
      {@const prData = getPrData(
        (e.raf || { api: e.team, team: e.team }) as RaffleEntry,
        prSourceIdx
      )}
      {@const moveCls =
        e.delta === null ? 'sc-same' : e.delta > 0 ? 'sc-up' : e.delta < 0 ? 'sc-down' : 'sc-same'}
      {@const moveStr =
        e.delta === null ? '—' : e.delta > 0 ? `▲${e.delta}` : e.delta < 0 ? `▼${Math.abs(e.delta)}` : '='}
      {@const gdStr = e.gd > 0 ? `+${e.gd}` : `${e.gd}`}
      {@const gdCls = e.gd >= 0 ? 'sc-gd-pos' : 'sc-gd-neg'}
      {@const rankCls = MEDALS[e.rank] ? `r${e.rank}` : ''}
      {@const rankDisp = MEDALS[e.rank] || `#${e.rank}`}
      <div class="sc-row">
        <div class="sc-rank-cell {rankCls}">{rankDisp}</div>
        <div class="sc-flag-cell">
          <Flag entry={e.raf || { api: e.team, team: e.team, flag: '🏳️' }} />
        </div>
        <div class="sc-info-cell">
          <span class="sc-owner">{e.name}</span>
          <span class="sc-team">{e.raf ? e.raf.team : e.team}</span>
        </div>
        <div class="sc-move-cell {moveCls}">{moveStr}</div>
        <div class="sc-stats-cell">
          <span class={gdCls}>GD {gdStr}</span><span class="sc-goals"> · {e.gs}⚽</span>
        </div>
        <div class="sc-pr-cell">
          {t('pr.rankShort')} <span class="sc-pr-num">{prData ? `#${Math.round(prData.display)}` : '—'}</span>
        </div>
      </div>
    {/each}
  </div>
{/if}
