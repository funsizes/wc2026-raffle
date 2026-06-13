<script lang="ts">
  import { onMount } from 'svelte';
  import DailySummary from '$lib/components/DailySummary.svelte';
  import HistoryTab from '$lib/components/HistoryTab.svelte';
  import Leaderboard from '$lib/components/Leaderboard.svelte';
  import MatchGrid from '$lib/components/MatchGrid.svelte';
  import PicksGrid from '$lib/components/PicksGrid.svelte';
  import RankingsTable from '$lib/components/RankingsTable.svelte';
  import RulesTab from '$lib/components/RulesTab.svelte';
  import { RAFFLE, RAFFLE2, RAFFLE2_LABEL, RAFFLE_LABEL } from '$lib/data/raffle';
  import type { Match } from '$lib/types';
  import { persistLeaderboard, sortLeaderboard } from '$lib/utils/leaderboard';
  import {
    countLiveMatches,
    fetchMatches,
    filterTodayMatches
  } from '$lib/utils/matches';
  import { migrateSnapshots } from '$lib/utils/snapshots';

  type TabId = 'tab-main' | 'tab-gaby' | 'tab-raffle' | 'tab-rankings' | 'tab-rules' | 'tab-history';

  const TABS: { id: TabId; label: string }[] = [
    { id: 'tab-main', label: '🏆 Main Group' },
    { id: 'tab-gaby', label: "🏆 Gaby's Group" },
    { id: 'tab-raffle', label: '🎟 Raffle Draw' },
    { id: 'tab-rankings', label: '📊 Power Rankings' },
    { id: 'tab-rules', label: '📋 Rules' },
    { id: 'tab-history', label: '📅 Daily History' }
  ];

  let allMatches = $state<Match[] | null>(null);
  let prSourceIdx = $state(-1);
  let showMatchPR = $state(false);
  let activeTab = $state<TabId>('tab-main');
  let statusText = $state('Auto-refreshes every 90 seconds');

  const activeRaffle = $derived(activeTab === 'tab-gaby' ? RAFFLE2 : RAFFLE);
  const liveCount = $derived(countLiveMatches(allMatches));
  const todayMatches = $derived(allMatches ? filterTodayMatches(allMatches) : []);
  const matchesTitle = $derived(
    liveCount ? "🔴 Live & Today's Matches" : "📅 Today's Matches"
  );

  const lb1 = $derived(sortLeaderboard(RAFFLE, allMatches));
  const lb2 = $derived(sortLeaderboard(RAFFLE2, allMatches));

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
    <p>Winner-take-all · two groups</p>
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
      <option value={-1}>Avg — All 14 Sources</option>
      <option value={0}>ESPN</option>
      <option value={1}>CBS Sports</option>
      <option value={2}>USA Today</option>
      <option value={3}>Yahoo Sports</option>
      <option value={4}>The Guardian</option>
      <option value={5}>Fox Sports</option>
      <option value={6}>The Athletic</option>
      <option value={7}>Bleacher Report</option>
      <option value={8}>Elo Ratings</option>
      <option value={9}>FIFA Rankings</option>
      <option value={10}>Opta</option>
      <option value={11}>Score</option>
      <option value={12}>PrizePicks</option>
      <option value={13}>Goal</option>
    </select>
    <label class="pr-match-toggle">
      <input type="checkbox" bind:checked={showMatchPR} /> Show PR in Matches
    </label>
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

  <div id="tab-main" class="tab-panel" class:active={activeTab === 'tab-main'}>
    <div class="sec-title">🏆 {RAFFLE_LABEL}</div>
    <DailySummary entries={lb1} {allMatches} snapLabel="g1" />
    <Leaderboard entries={lb1} snapLabel="g1" {prSourceIdx} />
  </div>

  <div id="tab-gaby" class="tab-panel" class:active={activeTab === 'tab-gaby'}>
    <div class="sec-title">🏆 {RAFFLE2_LABEL}</div>
    <DailySummary entries={lb2} {allMatches} snapLabel="g2" />
    <Leaderboard entries={lb2} snapLabel="g2" {prSourceIdx} />
  </div>

  <div id="tab-raffle" class="tab-panel" class:active={activeTab === 'tab-raffle'}>
    <div class="sec-title">Main Group (30 participants)</div>
    <PicksGrid raffle={RAFFLE} />
    <div class="sec-title" style="margin-top:2rem">Gaby's Group (21 participants)</div>
    <PicksGrid raffle={RAFFLE2} />
  </div>

  <div id="tab-rankings" class="tab-panel" class:active={activeTab === 'tab-rankings'}>
    <RankingsTable />
  </div>

  <div id="tab-rules" class="tab-panel" class:active={activeTab === 'tab-rules'}>
    <RulesTab />
  </div>

  <div id="tab-history" class="tab-panel" class:active={activeTab === 'tab-history'}>
    <HistoryTab {allMatches} {prSourceIdx} />
  </div>
</main>

<div class="status-bar">
  <span class="dot"></span>{statusText}
</div>
