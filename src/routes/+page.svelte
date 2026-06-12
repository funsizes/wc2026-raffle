<script lang="ts">
  import { onMount } from 'svelte';
  import DailySummary from '$lib/components/DailySummary.svelte';
  import HistoryTab from '$lib/components/HistoryTab.svelte';
  import Leaderboard from '$lib/components/Leaderboard.svelte';
  import MatchGrid from '$lib/components/MatchGrid.svelte';
  import PicksGrid from '$lib/components/PicksGrid.svelte';
  import RankingsTable from '$lib/components/RankingsTable.svelte';
  import RulesTab from '$lib/components/RulesTab.svelte';
  import { RAFFLE, RAFFLE2, type RaffleGroup } from '$lib/data/raffle';
  import { PR_SOURCE_LABELS, RANK_SOURCES } from '$lib/data/rankings';
  import type { Match } from '$lib/types';
  import { persistLeaderboard, sortLeaderboard } from '$lib/utils/leaderboard';
  import {
    countLiveMatches,
    fetchMatches,
    filterTodayMatches
  } from '$lib/utils/matches';
  import { migrateSnapshots } from '$lib/utils/snapshots';
    import GroupSelector from '$lib/components/GroupSelector.svelte';

  type TabId = 'tab-leaderboard' | 'tab-raffle' | 'tab-rankings' | 'tab-rules' | 'tab-history';

  const TABS: { id: TabId; label: string }[] = [
    { id: 'tab-leaderboard', label: '🏆 Leaderboard' },
    { id: 'tab-raffle', label: '🎟 Raffle Draw' },
    { id: 'tab-rankings', label: '📊 Power Rankings' },
    { id: 'tab-rules', label: '📋 Rules' },
    { id: 'tab-history', label: '📅 Daily History' }
  ];

  let allMatches = $state<Match[] | null>(null);
  let prSourceIdx = $state(-1);
  let showMatchPR = $state(false);
  let activeTab = $state<TabId>('tab-leaderboard');
  let statusText = $state('Auto-refreshes every 90 seconds');
  let raffleGroup = $state<RaffleGroup>('g1');

  const activeRaffle = $derived(raffleGroup === 'g1' ? RAFFLE : RAFFLE2);
  const liveCount = $derived(countLiveMatches(allMatches));
  const todayMatches = $derived(allMatches ? filterTodayMatches(allMatches) : []);
  const matchesTitle = $derived(
    liveCount ? "🔴 Live & Today's Matches" : "📅 Today's Matches"
  );

  // TODO: fix this later on
  const lb1 = $derived(sortLeaderboard(raffleGroup === 'g1' ? RAFFLE : RAFFLE2, allMatches));
  const lb2 = $derived(sortLeaderboard(raffleGroup === 'g2' ? RAFFLE2 : RAFFLE, allMatches));

  $effect(() => {
    if (allMatches) {
      persistLeaderboard('g1', lb1);
      persistLeaderboard('g2', lb2);
    }
  });

  async function refresh() {
    statusText = 'Refreshing…';
    allMatches = await fetchMatches();
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    statusText = `Last updated ${t} · auto-refreshes every 90 s`;
  }

  function selectTab(id: TabId) {
    activeTab = id;
  }

  onMount(() => {
    migrateSnapshots();
    refresh();
    const interval = setInterval(refresh, 90_000);
    return () => clearInterval(interval);
  });
</script>

<header>
  <div class="logo">
    <h1>⚽ World Cup 2026 Raffle</h1>

    <p class="group-selector">
      <GroupSelector bind:value={raffleGroup} />
    </p>
  </div>
  <div class="header-right">
    {#if liveCount > 0}
      <span class="live-chip">● LIVE</span>
    {/if}
  </div>
</header>

<main>
  <section>
    <div class="sec-title">{matchesTitle}</div>
    <div class="matches-grid">
      <label class="pr-match-toggle">
        <input type="checkbox" bind:checked={showMatchPR} />
        Show Power Rankings
      </label>

      {#if allMatches === null}
        <p style="font-size:.8rem;color:var(--muted)">Match data loading — check back shortly.</p>
      {:else if allMatches && todayMatches.length === 0}
        <p style="font-size:.8rem;color:var(--muted)">No matches right now — check back soon!</p>
      {:else if allMatches}
        <MatchGrid
          matches={todayMatches}
          raffle={activeRaffle}
          {showMatchPR}
          {prSourceIdx}
        />
      {/if}
    </div>
  </section>

  <div class="pr-selector-bar">
    <label for="prSourceSelect">⚔ Power Ranking Source:</label>
    <select id="prSourceSelect" bind:value={prSourceIdx}>
      <option value={-1}>Avg — All {RANK_SOURCES.length} Sources</option>
      {#each PR_SOURCE_LABELS as label, idx (idx)}
        <option value={idx}>{label}</option>
      {/each}
    </select>
  </div>

  <nav class="tab-bar">
    {#each TABS as tab}
      <button
        type="button"
        class="tab-btn"
        class:active={activeTab === tab.id}
        onclick={() => selectTab(tab.id)}>{tab.label}</button
      >
    {/each}
  </nav>

  <div id="tab-leaderboard" class="tab-panel" class:active={activeTab === 'tab-leaderboard'}>
    <div class="sec-title">🏆 Teams ({activeRaffle.length})</div>

    <DailySummary entries={lb1} {allMatches} snapLabel="g1" />

    <Leaderboard entries={lb2} {prSourceIdx} {raffleGroup} />
  </div>

  <div id="tab-raffle" class="tab-panel" class:active={activeTab === 'tab-raffle'}>
    <PicksGrid raffle={activeRaffle} />
  </div>

  <div id="tab-rankings" class="tab-panel" class:active={activeTab === 'tab-rankings'}>
    <RankingsTable {raffleGroup} />
  </div>

  <div id="tab-rules" class="tab-panel" class:active={activeTab === 'tab-rules'}>
    <RulesTab />
  </div>

  <div id="tab-history" class="tab-panel" class:active={activeTab === 'tab-history'}>
    <HistoryTab {allMatches} {prSourceIdx} {raffleGroup} />
  </div>
</main>

<div class="status-bar">
  <span class="dot"></span>{statusText}
</div>
