<script lang="ts">
  import type { LeaderboardEntry } from '$lib/types';
  import { getEntryDelta } from '$lib/utils/snapshots';
  import { getPrData } from '$lib/utils/rankings';
  import Flag from './Flag.svelte';

  interface Props {
    entries: LeaderboardEntry[];
    snapLabel?: string;
    prSourceIdx: number;
  }

  let { entries, snapLabel, prSourceIdx }: Props = $props();

  const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
</script>

{#each entries as e, i (e.name + e.team)}
  {@const rank = i + 1}
  {@const p = e.p}
  {@const rankCls = rank <= 3 ? `rank-${rank}` : ''}
  {@const stateCls = p.score === 0 ? '' : p.active ? 'still-in' : 'out'}
  {@const stageCls =
    p.score === 8 ? 's-champion' : p.active ? 's-active' : p.score === 0 ? 's-pending' : 's-out'}
  {@const gdStr = p.gd >= 0 ? `+${p.gd}` : `${p.gd}`}
  {@const gdCls = p.gd >= 0 ? 'gd-pos' : 'gd-neg'}
  {@const rankDisplay = MEDALS[rank] || rank}
  {@const delta = snapLabel ? getEntryDelta(snapLabel, e, rank) : null}
  {@const prData = getPrData(e, prSourceIdx)}
  {@const prDelta = prData ? Math.round(prData.display) - rank : null}
  <div class="lb-row {rankCls} {stateCls}">
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
    <div class="lb-flag"><Flag entry={e} /></div>
    <div class="lb-info">
      <div class="lb-name">{e.name}</div>
      <div class="lb-team">{e.team}</div>
    </div>
    <div class="lb-stage {stageCls}">{p.label}</div>
    <div class="lb-pr">
      {#if prData}
        <span class="pr-badge">PR #{prData.display}</span>
        <span
          class="pr-delta {prDelta && prDelta > 0
            ? 'pr-up'
            : prDelta && prDelta < 0
              ? 'pr-down'
              : 'pr-even'}"
        >
          {prDelta && prDelta > 0
            ? `▲${prDelta}`
            : prDelta && prDelta < 0
              ? `▼${Math.abs(prDelta)}`
              : '='}
        </span>
      {:else}
        <span class="pr-badge">—</span>
      {/if}
    </div>
    <div class="lb-stats">
      <div class={gdCls}>GD {gdStr}</div>
      <div class="gs-val">{p.gs} goals</div>
    </div>
  </div>
{/each}
