<script lang="ts">
  import { onMount } from 'svelte';
  import DailySummary from '$lib/components/DailySummary.svelte';
  import HistoryTab from '$lib/components/HistoryTab.svelte';
  import Leaderboard from '$lib/components/leaderboard/Leaderboard.svelte';
  import MatchGrid from '$lib/components/MatchGrid.svelte';
  import PicksGrid from '$lib/components/PicksGrid.svelte';
  import RankingsTable from '$lib/components/RankingsTable.svelte';
  import RulesTab from '$lib/components/RulesTab.svelte';
  import GroupSelector from '$lib/components/GroupSelector.svelte';
  import PowerRankingSourceSelector from '$lib/components/PowerRankingSourceSelector.svelte';
  import { RAFFLE, RAFFLE2, type RaffleGroup } from '$lib/data/raffle';
  import type { Match } from '$lib/types';
  import { persistLeaderboard, sortLeaderboard } from '$lib/utils/leaderboard';
  import {
    countLiveMatches,
    fetchMatches,
    filterTodayMatches,
    getRecentMatches,
    getTomorrowMatches,
  } from '$lib/utils/matches';
  import { migrateSnapshots } from '$lib/utils/snapshots';
  import { page } from '$app/stores';

  // Automatically updates if the query string changes
  const groupQueryParam = $derived($page.url.searchParams.get('group') || 'g1');

  type TabId = 'tab-leaderboard' | 'tab-raffle' | 'tab-rankings' | 'tab-rules' | 'tab-history';

  const TABS: { id: TabId; label: string }[] = [
    { id: 'tab-leaderboard', label: '🏆 Leaderboard' },
    { id: 'tab-raffle', label: '🎟 Raffle Draw' },
    { id: 'tab-rankings', label: '📊 Power Rankings' },
    { id: 'tab-rules', label: '📋 Rules' },
    { id: 'tab-history', label: '📅 Daily History' },
  ];

  let allMatches = $state<Match[] | null>(null);
  let prSourceIdx = $state(-1);
  let showMatchPR = $state(false);

  let activeTab = $state<TabId>('tab-leaderboard');
  let activeMatchTab = $state<MatchTabId>('tab-today');

  let statusText = $state('Auto-refreshes every 90 seconds');
  let raffleGroup = $state<RaffleGroup>(groupQueryParam as unknown as RaffleGroup);
  let showGroupSelector = $state(true);

  const activeRaffle = $derived(raffleGroup === 'g1' ? RAFFLE : RAFFLE2);
  const liveCount = $derived(countLiveMatches(allMatches));
  const todayMatches = $derived(allMatches ? filterTodayMatches(allMatches) : []);
  const recentMatches = $derived(allMatches ? getRecentMatches(allMatches, 24) : []);
  const tomorrowMatches = $derived(allMatches ? getTomorrowMatches(allMatches) : []);

  type MatchTabId = 'tab-recent' | 'tab-today' | 'tab-tomorrow';

  const MATCH_TABS: { id: MatchTabId; label: string; data: Match[] }[] = $derived([
    { id: 'tab-recent' as const, label: 'Recent', data: recentMatches },
    { id: 'tab-today' as const, label: 'Today', data: todayMatches },
    { id: 'tab-tomorrow' as const, label: 'Tomorrow', data: tomorrowMatches },
  ]);

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
    const t = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    statusText = `Last updated ${t} · auto-refreshes every 90 s`;
  }

  function selectTab(id: TabId) {
    activeTab = id;
  }

  function selectMatchTab(id: MatchTabId) {
    activeMatchTab = id;
  }

  let titleClickTimes: number[] = [];

  function onTitleClick() {
    const now = Date.now();
    titleClickTimes = titleClickTimes.filter((t) => now - t < 4_000);
    titleClickTimes.push(now);

    if (titleClickTimes.length >= 3) {
      showGroupSelector = !showGroupSelector;
      titleClickTimes = [];
    }
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
    <h1>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
      <span onclick={onTitleClick}>⚽</span> World Cup 2026 Raffle
    </h1>

    {#if showGroupSelector}
      <p class="group-selector">
        <GroupSelector bind:value={raffleGroup} />
      </p>
    {/if}
  </div>
  <div class="header-right">
    {#if liveCount > 0}
      <span class="live-chip">● LIVE</span>
    {/if}
  </div>
</header>

<main>
  <section>
    <div class="sec-title">
      <span>📅 Matches</span>

      <div class="match-pr-selector">
        <label class="pr-match-toggle" style="color:var(--muted)">
          <input type='checkbox' bind:checked={showMatchPR} />
          Show PRs
        </label>
      </div>
    </div>

    <div class="matches-grid">
      {#if allMatches === null}
        <p style="font-size:.8rem;color:var(--muted)">
          Match data loading — check back shortly.
        </p>
      {:else if todayMatches.length === 0 && recentMatches.length === 0}
        <p style="font-size:.8rem;color:var(--muted)">
          No matches right now — check back soon!
        </p>
      {:else}
        {#if showMatchPR}
          <div>
            <PowerRankingSourceSelector bind:value={prSourceIdx} />
          </div>
        {/if}

        <nav class="tab-bar">
          {#each MATCH_TABS as tab}
            <button
              type="button"
              class="tab-btn"
              class:active={activeMatchTab === tab.id}
              onclick={() => selectMatchTab(tab.id as MatchTabId)}
              >{tab.label}</button
            >
          {/each}
        </nav>

        <MatchGrid
          matches={MATCH_TABS.find((tab) => tab.id === activeMatchTab)?.data ?? []}
            raffle={activeRaffle}
            {showMatchPR}
            {prSourceIdx}
          />
      {/if}
    </div>
  </section>

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

    <PowerRankingSourceSelector bind:value={prSourceIdx} />

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
    <RulesTab {raffleGroup} />
  </div>

  <div id="tab-history" class="tab-panel" class:active={activeTab === 'tab-history'}>
    <PowerRankingSourceSelector bind:value={prSourceIdx} />

    <HistoryTab {allMatches} {prSourceIdx} {raffleGroup} />
  </div>
</main>

<div class="status-bar">
  <span class="dot"></span>{statusText}
</div>
