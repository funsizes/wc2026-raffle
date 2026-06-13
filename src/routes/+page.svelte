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
  import { formatTime, t } from '$lib/i18n/locale.svelte';

  // Automatically updates if the query string changes
  const groupQueryParam = $derived($page.url.searchParams.get('group') || 'g1');

  type TabId = 'tab-leaderboard' | 'tab-raffle' | 'tab-rankings' | 'tab-rules' | 'tab-history';

  const TABS = $derived([
    { id: 'tab-leaderboard' as TabId, label: t('tabs.leaderboard') },
    { id: 'tab-raffle' as TabId, label: t('tabs.raffle') },
    { id: 'tab-rankings' as TabId, label: t('tabs.rankings') },
    { id: 'tab-rules' as TabId, label: t('tabs.rules') },
    { id: 'tab-history' as TabId, label: t('tabs.history') }
  ]);

  let allMatches = $state<Match[] | null>(null);
  let prSourceIdx = $state(-1);
  let showMatchPR = $state(false);

  let activeTab = $state<TabId>('tab-leaderboard');
  let activeMatchTab = $state<MatchTabId>('tab-today');

  let isRefreshing = $state(false);
  let lastUpdateTime = $state<string | null>(null);

  let raffleGroup = $state<RaffleGroup>(groupQueryParam as unknown as RaffleGroup);
  let showGroupSelector = $state(true);

  const statusText = $derived.by(() => {
    if (isRefreshing) return t('status.refreshing');
    if (lastUpdateTime) return t('status.lastUpdated', { time: lastUpdateTime });
    return t('status.autoRefresh');
  });

  const activeRaffle = $derived(raffleGroup === 'g1' ? RAFFLE : RAFFLE2);
  const liveCount = $derived(countLiveMatches(allMatches));
  const todayMatches = $derived(allMatches ? filterTodayMatches(allMatches) : []);
  const recentMatches = $derived(allMatches ? getRecentMatches(allMatches, 24) : []);
  const tomorrowMatches = $derived(allMatches ? getTomorrowMatches(allMatches) : []);

  type MatchTabId = 'tab-recent' | 'tab-today' | 'tab-tomorrow';

  const MATCH_TABS = $derived([
    { id: 'tab-recent' as MatchTabId, label: t('matchTabs.recent'), data: recentMatches },
    { id: 'tab-today' as MatchTabId, label: t('matchTabs.today'), data: todayMatches },
    { id: 'tab-tomorrow' as MatchTabId, label: t('matchTabs.tomorrow'), data: tomorrowMatches }
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
    isRefreshing = true;
    allMatches = await fetchMatches();
    lastUpdateTime = formatTime(new Date().toISOString());
    isRefreshing = false;
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
      <span onclick={onTitleClick}>⚽</span> {t('app.title')}
    </h1>

    {#if showGroupSelector}
      <p class="group-selector">
        <GroupSelector bind:value={raffleGroup} />
      </p>
    {/if}
  </div>
  <div class="header-right">
    {#if liveCount > 0}
      <span class="live-chip">{t('app.live')}</span>
    {/if}
  </div>
</header>

<main>
  <section>
    <div class="sec-title">
      <span>{t('matches.title')}</span>

      <div class="match-pr-selector">
        <label class="pr-match-toggle" style="color:var(--muted)">
          <input type='checkbox' bind:checked={showMatchPR} />
          {t('matches.showPrs')}
        </label>
      </div>
    </div>

    <div class="matches-grid">
      {#if allMatches === null}
        <p style="font-size:.8rem;color:var(--muted)">
          {t('matches.loading')}
        </p>
      {:else if todayMatches.length === 0 && recentMatches.length === 0}
        <p style="font-size:.8rem;color:var(--muted)">
          {t('matches.empty')}
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
    <div class="sec-title">{t('leaderboard.teams', { count: activeRaffle.length })}</div>

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
