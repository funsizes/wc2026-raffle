<script lang="ts">
  import { HIST_SRC_LABELS } from '$lib/data/rankings';
  import { RAFFLE, RAFFLE2, type RaffleGroup } from '$lib/data/raffle';
  import {
    formatMonthDay,
    formatShortDate,
    formatWeekdayDate,
    t
  } from '$lib/i18n/locale.svelte';
  import type { Match } from '$lib/types';
  import {
    dailyMoversForDate,
    finishedMatchDates,
    hasPriorBaselineBeforeDate,
    prevCalendarDate
  } from '$lib/utils/daily-movers';
  import { getPrData } from '$lib/utils/rankings';
  import Flag from './Flag.svelte';

  interface Props {
    allMatches: Match[] | null;
    prSourceIdx: number;
    raffleGroup: RaffleGroup;
  }

  let { allMatches, prSourceIdx, raffleGroup: histGroup }: Props = $props();

  const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  let histDateIdx = $state(-1);

  const histRaffle = $derived(histGroup === 'g1' ? RAFFLE : RAFFLE2);

  const dates = $derived(finishedMatchDates(allMatches));
  const safeIdx = $derived(
    dates.length
      ? histDateIdx < 0
        ? dates.length - 1
        : Math.max(0, Math.min(histDateIdx, dates.length - 1))
      : 0
  );
  const date = $derived(dates[safeIdx] ?? '');

  const dateLabel = $derived(date ? formatShortDate(date) : '—');

  const recap = $derived.by(() => {
    if (!allMatches || !date) return null;
    return dailyMoversForDate(histRaffle, allMatches, date);
  });

  const movers = $derived(recap?.movers ?? null);

  const fullDate = $derived(date ? formatWeekdayDate(date) : '');

  const srcLbl = $derived(
    prSourceIdx === -1
      ? t('history.avgSources', { count: 14 })
      : HIST_SRC_LABELS[prSourceIdx]
  );
  const vsLbl = $derived(
    date && allMatches && hasPriorBaselineBeforeDate(allMatches, date)
      ? t('history.vsDate', { date: formatMonthDay(prevCalendarDate(date)) })
      : t('history.dayOneSnapshot')
  );

  $effect(() => {
    histGroup;
    histDateIdx = -1;
  });

  function goToPrevDate() {
    if (safeIdx > 0) histDateIdx = safeIdx - 1;
  }

  function goToNextDate() {
    if (safeIdx < dates.length - 1) histDateIdx = safeIdx + 1;
  }

  function signedDelta(value: number): string {
    if (value > 0) return `+${value}`;
    return `${value}`;
  }

  function deltaCls(value: number): string {
    if (value > 0) return 'sc-delta-pos';
    if (value < 0) return 'sc-delta-neg';
    return 'sc-delta-flat';
  }
</script>

<div class="hist-controls">
  <div class="hist-date-nav">
    <button type="button" class="hist-nav-btn" disabled={safeIdx === 0} onclick={goToPrevDate}
      >◀</button
    >
    <span class="hist-date-label">{dateLabel}</span>
    <button
      type="button"
      class="hist-nav-btn"
      disabled={safeIdx >= dates.length - 1}
      onclick={goToNextDate}>▶</button
    >
  </div>
</div>

{#if !allMatches}
  <div class="sc-empty">{t('history.matchesLoading')}<br />{t('history.checkBack')}</div>
{:else if dates.length === 0}
  <div class="sc-empty">
    {t('history.noHistory')}<br />{t('history.noFinishedMatches')}
  </div>
{:else if movers && movers.length === 0}
  <div class="sc-card">
    <div class="sc-head">
      <div class="sc-title">{t('history.recapTitle')}</div>
      <div class="sc-sub">{fullDate}</div>
    </div>
    <div class="sc-empty">{t('history.noTeamMatches')}</div>
  </div>
{:else if movers}
  <div class="sc-card">
    <div class="sc-head">
      <div class="sc-title">{t('history.recapTitle')}</div>
      <div class="sc-sub">{fullDate}</div>
      <div class="sc-meta">{t('history.positionChange')} {vsLbl} · {t('pr.rankShort')}: {srcLbl}</div>
    </div>
    <div class="sc-col-heads">
      <span>#</span><span></span><span>{t('history.player')}</span>
      <span>{t('history.move')}</span>
      <span class="sc-col-num">{t('history.gdTotal')}</span>
      <span class="sc-col-num">{t('history.gdDelta')}</span>
      <span class="sc-col-num">{t('history.goalsTotal')}</span>
      <span class="sc-col-num">{t('history.goalsDelta')}</span>
      <span>{t('history.prRank')}</span>
    </div>
    {#each movers as mover (mover.entry.name + mover.entry.team)}
      {@const e = mover.entry}
      {@const prData = getPrData(e, prSourceIdx)}
      {@const wentOut = mover.eliminatedToday && e.p.score < 7}
      {@const moveCls = wentOut
        ? 'sc-out'
        : mover.rankDelta > 0
          ? 'sc-up'
          : mover.rankDelta < 0
            ? 'sc-down'
            : 'sc-same'}
      {@const moveStr = wentOut
        ? t('history.eliminated')
        : mover.eliminatedToday
          ? e.p.label
          : mover.rankDelta > 0
            ? `▲${mover.rankDelta}`
            : mover.rankDelta < 0
              ? `▼${Math.abs(mover.rankDelta)}`
              : '='}
      {@const gd = e.p.gd}
      {@const gdStr = gd > 0 ? `+${gd}` : `${gd}`}
      {@const gdCls = gd >= 0 ? 'sc-gd-pos' : 'sc-gd-neg'}
      {@const gdDeltaStr = signedDelta(mover.gdDelta)}
      {@const gsDeltaStr = signedDelta(mover.gsDelta)}
      {@const rankCls = MEDALS[mover.rank] ? `r${mover.rank}` : ''}
      {@const rankDisp = MEDALS[mover.rank] || `#${mover.rank}`}
      <div class="sc-row" class:sc-row-out={wentOut}>
        <div class="sc-rank-cell {rankCls}">{rankDisp}</div>
        <div class="sc-flag-cell">
          <Flag entry={e} icons />
        </div>
        <div class="sc-info-cell">
          <span class="sc-owner">{e.name}</span>
          <span class="sc-team">{e.team}</span>
        </div>
        <div class="sc-move-cell {moveCls}">{moveStr}</div>
        <div class="sc-num-cell sc-num-total {gdCls}">{gdStr}</div>
        <div class="sc-num-cell sc-num-delta {deltaCls(mover.gdDelta)}">{gdDeltaStr}</div>
        <div class="sc-num-cell sc-num-total sc-goals-total">{e.p.gs}</div>
        <div class="sc-num-cell sc-num-delta {deltaCls(mover.gsDelta)}">{gsDeltaStr}</div>
        <div class="sc-pr-cell">
          <span class="sc-pr-num">{prData ? `#${Math.round(prData.display)}` : '—'}</span>
        </div>
      </div>
    {/each}
  </div>
{/if}
