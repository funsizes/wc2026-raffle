<script lang="ts">
  import type { LeaderboardEntry, Match } from "$lib/types";
  import { formatMatchCalendarDate, formatTime, t } from '$lib/i18n/locale.svelte';
  import { getEntryDelta } from "$lib/utils/snapshots";
  import {
    getEntryMatchScore,
    getOpponentName,
    isUpcomingMatch
  } from '$lib/utils/entry-matches';
  import { getPrData } from "$lib/utils/rankings";
  import Flag from "../Flag.svelte";

  interface Props {
    entry: LeaderboardEntry;
    rank: number;
    snapLabel: string;
    prSourceIdx: number;
    entryMatches: Match[];
    gamesOpen: boolean;
    onToggleGames: () => void;
    showAdminControls?: boolean;
  }

  let {
    entry,
    rank,
    snapLabel,
    prSourceIdx,
    entryMatches,
    gamesOpen,
    onToggleGames,
    showAdminControls = false
  }: Props = $props();

  const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  let isExpanded = $state(false);

  const p = $derived(entry.p);
  const rankCls = $derived(rank <= 3 ? `rank-${rank}` : "");

  const stateCls = $derived(p.score === 0 ? "" : p.active ? "still-in" : "out");
  const stageCls = $derived(
    p.score === 8
      ? "s-champion"
      : p.active
        ? "s-active"
        : p.score === 0
          ? "s-pending"
          : "s-out",
  );

  const goalDifferentialDisplayValue = $derived(
    p.gd >= 0 ? `+${p.gd}` : `${p.gd}`,
  );

  const goalDifferentialClass = $derived(p.gd >= 0 ? "gd-pos" : "gd-neg");

  const rankDisplay = $derived(MEDALS[rank] || rank);

  const delta = $derived(getEntryDelta(snapLabel, entry, rank));
  const powerRankingData = $derived(getPrData(entry, prSourceIdx));
  const powerRankingDelta = $derived(
    powerRankingData ? Math.round(powerRankingData.display) - rank : null,
  );
</script>

<div class="lb-row {rankCls}">
  <div class="lb-top-row {stateCls}">
    <div class="lb-rank">
      {rankDisplay}
      {#if delta}
        {#if delta.rank > 0}
          <span class="rank-delta rd-up">▲{delta.rank}</span>
        {:else if delta.rank < 0}
          <span class="rank-delta rd-down">▼{Math.abs(delta.rank)}</span>
        {:else}
          <span class="rank-delta rd-same">=</span>
        {/if}
      {/if}
    </div>

    <div class="lb-flag">
      <Flag entry={entry} icons />
    </div>

    <div class="lb-info">
      <div class="lb-name">{entry.name}</div>
      <div class="lb-team">{entry.team}</div>
    </div>

    <div class="lb-stats">
      <div class={goalDifferentialClass}>GD {goalDifferentialDisplayValue}</div>
      <div class="gs-val">{t('leaderboard.goals', { count: p.gs })}</div>
    </div>

    <div class="lb-games-btn-container">
      <button
        type="button"
        class="lb-games-btn"
        aria-label={t('leaderboard.viewGames')}
        aria-expanded={gamesOpen}
        onclick={onToggleGames}
      >
        <i class="fa-solid {gamesOpen ? 'fa-caret-up' : 'fa-caret-down'}" aria-hidden="true"></i>
      </button>
    </div>

    {#if showAdminControls}
      <button
        type="button"
        class="lb-actions"
        aria-expanded={isExpanded}
        onclick={() => (isExpanded = !isExpanded)}
      >
        {isExpanded ? "▲" : "▼"}
      </button>
    {/if}
  </div>

  {#if gamesOpen}
    <div class="lb-games-panel">
      {#if entryMatches.length === 0}
        <p class="lb-games-empty">{t('leaderboard.noGames')}</p>
      {:else}
        <ul class="lb-games-list">
          {#each entryMatches as match (match.utcDate + match.homeTeam.name + match.awayTeam.name)}
            {@const score = getEntryMatchScore(match, entry.api)}
            <li class="lb-games-item">
              <span class="lb-games-date">{formatMatchCalendarDate(match.utcDate)}</span>
              <span class="lb-games-detail">
                {t('leaderboard.vs', { team: getOpponentName(match, entry.api) })}

                {#if isUpcomingMatch(match)}
                  <span class="lb-games-time">
                    · {formatTime(match.utcDate, { compactPeriod: true })}
                  </span>
                {:else if score}
                  <span class="lb-games-score">
                    · {score.scored}–{score.conceded}
                  </span>
                {/if}
              </span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  {#if showAdminControls && isExpanded}
    <div class="lb-bottom-row">
      <div class="lb-stage {stageCls}">{p.label}</div>

      <div class="lb-pr">
        {#if powerRankingData}
          <span class="pr-badge">{t('pr.rank', { rank: powerRankingData.display })}</span>

          <span
            class="pr-delta {powerRankingDelta && powerRankingDelta > 0
              ? 'pr-up'
              : powerRankingDelta && powerRankingDelta < 0
                ? 'pr-down'
                : 'pr-even'}"
          >
            {powerRankingDelta && powerRankingDelta > 0
              ? `▲${powerRankingDelta}`
              : powerRankingDelta && powerRankingDelta < 0
                ? `▼${Math.abs(powerRankingDelta)}`
                : "="}
          </span>
        {:else}
          <span class="pr-badge">—</span>
        {/if}
      </div>
    </div>
  {/if}
</div>
