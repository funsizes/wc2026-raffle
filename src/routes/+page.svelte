<script lang="ts">
  import { page } from '$app/stores';
  import DailySummary from '$lib/components/DailySummary.svelte';
  import GroupSelector from '$lib/components/GroupSelector.svelte';
  import HistoryTab from '$lib/components/HistoryTab.svelte';
  import Leaderboard from '$lib/components/leaderboard/Leaderboard.svelte';
  import MatchGrid from '$lib/components/MatchGrid.svelte';
  import PicksGrid from '$lib/components/PicksGrid.svelte';
  import PowerRankingSourceSelector from '$lib/components/PowerRankingSourceSelector.svelte';
  import RankingsTable from '$lib/components/RankingsTable.svelte';
  import RulesTab from '$lib/components/RulesTab.svelte';
  import { RAFFLE, RAFFLE2, type RaffleGroup } from '$lib/data/raffle';
  import swordIcon from '$lib/assets/sword.png';
  import { MATCH_REFRESH_INTERVAL_SECONDS } from '$lib/config';
  import { formatTime, t } from '$lib/i18n/locale.svelte';
  import { openGameMaster } from '$lib/settings/gamemaster.svelte';
  import { openSettings } from '$lib/settings/settings.svelte';
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
  import { onMount } from 'svelte';

  // Automatically updates if the query string changes
  const groupQueryParam = $derived($page.url.searchParams.get('group') || 'g1');

  type TabId = 'tab-leaderboard' | 'tab-raffle' | 'tab-rankings' | 'tab-rules' | 'tab-history';

  const TABS = $derived([
    { id: 'tab-leaderboard' as TabId, label: t('tabs.leaderboard') },
    { id: 'tab-raffle' as TabId, label: t('tabs.raffle') },
    { id: 'tab-rules' as TabId, label: t('tabs.rules') },
    { id: 'tab-rankings' as TabId, label: t('tabs.rankings') },
    { id: 'tab-history' as TabId, label: t('tabs.history') },
  ]);

  let allMatches = $state<Match[] | null>(null);
  let prSourceIdx = $state(-1);
  let showMatchPR = $state(false);

  let activeTab = $state<TabId>('tab-leaderboard');
  let activeMatchTab = $state<MatchTabId>('tab-today');

  let isRefreshing = $state(false);
  let lastUpdateTime = $state<string | null>(null);

  let raffleGroup = $state<RaffleGroup>(groupQueryParam as unknown as RaffleGroup);
  let showAdminControls = $state(false);

  const statusText = $derived.by(() => {
    const refresh = { seconds: MATCH_REFRESH_INTERVAL_SECONDS };

    if (isRefreshing) return t('status.refreshing');

    if (lastUpdateTime) return t('status.lastUpdated', { time: lastUpdateTime, ...refresh });

    return t('status.autoRefresh', refresh);
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
    lastUpdateTime = formatTime(new Date().toISOString(), {
      compactPeriod: true,
      includeSeconds: true
    });
    isRefreshing = false;
  }

  function selectTab(id: TabId) {
    activeTab = id;
  }

  function selectMatchTab(id: MatchTabId) {
    activeMatchTab = id;
  }

  let titleClickTimes: number[] = [];
  let statusClickTimes: number[] = [];

  function onTitleClick() {
    const now = Date.now();
    titleClickTimes = titleClickTimes.filter((t) => now - t < 4_000);
    titleClickTimes.push(now);

    if (titleClickTimes.length >= 3) {
      showAdminControls = !showAdminControls;
      titleClickTimes = [];
    }
  }

  function onStatusBarClick() {
    const now = Date.now();
    statusClickTimes = statusClickTimes.filter((t) => now - t < 4_000);
    statusClickTimes.push(now);

    if (statusClickTimes.length >= 3) {
      openGameMaster();
      statusClickTimes = [];
    }
  }

  onMount(() => {
    migrateSnapshots();
    refresh();
    const interval = setInterval(refresh, MATCH_REFRESH_INTERVAL_SECONDS * 1000);
    return () => clearInterval(interval);
  });
</script>

<header>
  <div class="header-container">
    <div class="logo">
      <div class="header-title">
        <span onclick={onTitleClick} class="logo-icon">⚽</span>

        <h1>
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
          <span>{t('app.title')}</span>
        </h1>
      </div>
    </div>

    <div class="header-controls">
      <button
        type="button"
        class="settings-toggle-btn"
        aria-label={t('settings.title')}
        onclick={openSettings}
      >
        <i class="fa-solid fa-gear"></i>
      </button>
    </div>

    <div class="header-right">
      {#if liveCount > 0}
        <span class="live-chip">
          <i class="fa-solid fa-circle live-chip-icon" aria-hidden="true"></i>
          {t('app.live')}
        </span>
      {/if}
    </div>
  </div>

  {#if showAdminControls}
    <p class="group-selector">
      <GroupSelector bind:value={raffleGroup} />
    </p>
  {/if}
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

        <div class="matches-grid-footer">
          <p class="matches-legend">
            <span class="match-meta-swords" aria-hidden="true">
              <img class="match-meta-sword" src={swordIcon} alt="" width="16" height="16" />
              <img class="match-meta-sword match-meta-sword-flip" src={swordIcon} alt="" width="16" height="16" />
            </span>
            - {t('matches.matchupLegend')}
          </p>
        </div>
      {/if}
    </div>
  </section>

  <nav class="tab-bar">
    {#each TABS as tab}
      {#if tab.id !== 'tab-history' || showAdminControls}
        <button
          type="button"
          class="tab-btn"
          class:active={activeTab === tab.id}
          onclick={() => selectTab(tab.id)}>{tab.label}</button
        >
      {/if}
    {/each}
  </nav>

  <div id="tab-leaderboard" class="tab-panel" class:active={activeTab === 'tab-leaderboard'}>
    <div class="sec-title">{t('leaderboard.teams', { count: activeRaffle.length })}</div>

    <PowerRankingSourceSelector bind:value={prSourceIdx} />

    <DailySummary entries={lb1} {allMatches} snapLabel="g1" />

    <Leaderboard entries={lb2} {prSourceIdx} {raffleGroup} {showAdminControls} />
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
    {#if showAdminControls}
      <PowerRankingSourceSelector bind:value={prSourceIdx} />

      <HistoryTab {allMatches} {prSourceIdx} {raffleGroup} />
    {/if}
  </div>
</main>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="status-bar" onclick={onStatusBarClick}>
  <span class="dot"></span>{statusText}

  <div style="padding: 1rem 0 0.5rem;">
    <a style="font-size: 0.3rem; color: var(--muted);" href="https://www.flaticon.com/free-icons/settings" title="settings icons">Settings icons created by Pixel perfect - Flaticon</a>
  </div>
</div>
