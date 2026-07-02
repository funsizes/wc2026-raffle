<script lang="ts">
  import { formatTime, t } from '$lib/i18n/locale.svelte';
  import { isShowMatchTimeEnabled } from '$lib/settings/gamemaster.svelte';
  import type { Match, RaffleEntry } from '$lib/types';
  import { getMatchStageLabel, isLiveMatch, matchLocalDate } from '$lib/utils/matches';
  import { getPrData } from '$lib/utils/rankings';
  import { findParticipant } from '$lib/utils/teams';
  import swordIcon from '$lib/assets/sword.png';
  import { tick } from 'svelte';
  import MatchTeam from './MatchTeam.svelte';

  interface Props {
    matches: Match[];
    raffle: RaffleEntry[];
    showMatchPR: boolean;
    prSourceIdx: number;
    scrollable?: boolean;
    scrollAnchorDate?: string | null;
    scrollTrigger?: number;
  }

  let {
    matches,
    raffle,
    showMatchPR,
    prSourceIdx,
    scrollable = false,
    scrollAnchorDate = null,
    scrollTrigger = 0
  }: Props = $props();

  let scrollEl = $state<HTMLDivElement | null>(null);

  async function scrollToAnchor() {
    await tick();

    if (!scrollEl || !scrollAnchorDate || matches.length === 0) return;

    const cards = scrollEl.querySelectorAll<HTMLElement>('[data-match-date]');
    if (cards.length === 0) return;

    let target: HTMLElement | null =
      scrollEl.querySelector<HTMLElement>(`[data-match-date="${scrollAnchorDate}"]`);

    if (!target) {
      for (const card of cards) {
        const dateKey = card.dataset.matchDate;
        if (dateKey && dateKey >= scrollAnchorDate) {
          target = card;
          break;
        }
      }
    }

    (target ?? cards[cards.length - 1])?.scrollIntoView({ block: 'start' });
  }

  $effect(() => {
    if (!scrollable) return;

    scrollTrigger;
    void scrollToAnchor();
  });
</script>

{#snippet matchCards()}
  {#each matches as m (m.utcDate + m.homeTeam.name + m.awayTeam.name)}
    {@const homeParticipant = findParticipant(m.homeTeam.name, raffle)}
    {@const awayParticipant = findParticipant(m.awayTeam.name, raffle)}

    {@const isLive = isLiveMatch(m)}
    {@const isDone = m.status === 'FINISHED'}
    {@const homeParticipantPowerRankingsData = showMatchPR
      ? getPrData(
          homeParticipant || { api: m.homeTeam.name ?? '', team: m.homeTeam.name ?? '' },
          prSourceIdx
        )
      : null}
    {@const awayParticipantPowerRankingsData = showMatchPR
      ? getPrData(
          awayParticipant || { api: m.awayTeam.name ?? '', team: m.awayTeam.name ?? '' },
          prSourceIdx
        )
      : null}

    <div
      class="match-card"
      class:live={isLive}
      data-match-date={matchLocalDate(m.utcDate)}
    >
      <div class="match-meta">
        <span class="match-meta-stage">{getMatchStageLabel(m)}</span>

        <span class="match-meta-center">
          {#if homeParticipant && awayParticipant}
            <span class="match-meta-swords">
              <img class="match-meta-sword" src={swordIcon} alt="" width="16" height="16" />
              <img
                class="match-meta-sword match-meta-sword-flip"
                src={swordIcon}
                alt=""
                width="16"
                height="16"
              />
            </span>
          {/if}
        </span>

        {#if isDone}
          <span class="match-meta-status status-done">{t('matchStatus.ft')}</span>
        {:else if isLive}
          <span class="match-meta-status status-live">{t('matchStatus.live')}</span>
        {:else}
          <span class="match-meta-status status-upcoming">{t('matchStatus.upcoming')}</span>
        {/if}
      </div>

      <div class="match-body">
        <MatchTeam
          participant={homeParticipant}
          team={m.homeTeam}
          powerRankingsData={homeParticipantPowerRankingsData}
        />

        {#if isDone}
          <div class="match-score">{m.score.fullTime.home} – {m.score.fullTime.away}</div>
        {:else if isLive}
          <div class="match-score-container">
            <div class="match-score live-score">
              {m.score.fullTime.home ?? 0} – {m.score.fullTime.away ?? 0}
            </div>
            {#if isShowMatchTimeEnabled()}
              <div class="match-time">
                <span class="match-time-minute">{m.minute ?? 0}</span>

                {#if m.injuryTime !== null}
                  <span class="match-time-separator">+</span>
                  <span class="match-time-injury-time">{m.injuryTime}</span>
                {/if}

                <span class="match-time-separator">'</span>
              </div>
            {/if}
          </div>
        {:else}
          <div class="match-score match-time">
            {formatTime(m.utcDate, { compactPeriod: true })}
          </div>
        {/if}

        <MatchTeam
          participant={awayParticipant}
          team={m.awayTeam}
          powerRankingsData={awayParticipantPowerRankingsData}
        />
      </div>
    </div>
  {/each}
{/snippet}

{#if scrollable}
  <div class="matches-scroll" bind:this={scrollEl}>
    {@render matchCards()}
  </div>
{:else}
  {@render matchCards()}
{/if}
