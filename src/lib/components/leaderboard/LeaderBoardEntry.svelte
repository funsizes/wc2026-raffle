<script lang="ts">
  import type { LeaderboardEntry } from "$lib/types";
  import { getEntryDelta } from "$lib/utils/snapshots";
  import { getPrData } from "$lib/utils/rankings";
  import { t } from '$lib/i18n/locale.svelte';
  import Flag from "../Flag.svelte";

  interface Props {
    entry: LeaderboardEntry;
    rank: number;
    snapLabel: string;
    prSourceIdx: number;
    showAdminControls?: boolean;
  }

  let { entry: e, rank, snapLabel, prSourceIdx, showAdminControls = false }: Props = $props();

  const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  let isExpanded = $state(false);

  const p = $derived(e.p);
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

  const delta = $derived(getEntryDelta(snapLabel, e, rank));
  const powerRankingData = $derived(getPrData(e, prSourceIdx));
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
      <Flag entry={e} icons />
    </div>

    <div class="lb-info">
      <div class="lb-name">{e.name}</div>
      <div class="lb-team">{e.team}</div>
    </div>

    <div class="lb-stats">
      <div class={goalDifferentialClass}>GD {goalDifferentialDisplayValue}</div>
      <div class="gs-val">{t('leaderboard.goals', { count: p.gs })}</div>
    </div>

    {#if showAdminControls}
      <button class="lb-actions" onclick={() => (isExpanded = !isExpanded)}>
        {isExpanded ? "▲" : "▼"}
      </button>
    {/if}
  </div>

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
