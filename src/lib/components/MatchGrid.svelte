<script lang="ts">
  import { formatTime, t } from '$lib/i18n/locale.svelte';
  import type { Match, RaffleEntry } from '$lib/types';
  import { isLiveMatch } from '$lib/utils/matches';
  import { getPrData } from '$lib/utils/rankings';
  import { findParticipant } from '$lib/utils/teams';
  import swordIcon from '$lib/assets/sword.png';
  import MatchTeam from './MatchTeam.svelte';

  interface Props {
    matches: Match[];
    raffle: RaffleEntry[];
    showMatchPR: boolean;
    prSourceIdx: number;
  }

  let { matches, raffle, showMatchPR, prSourceIdx }: Props = $props();

  function stageLabel(stage: string): string {
    const key = `stage.${stage}`;
    const label = t(key);
    return label === key ? stage : label;
  }
</script>

{#each matches as m (m.utcDate + m.homeTeam.name + m.awayTeam.name)}
  {@const homeParticipant = findParticipant(m.homeTeam.name, raffle)}
  {@const awayParticipant = findParticipant(m.awayTeam.name, raffle)}

  {@const isLive = isLiveMatch(m)}
  {@const isDone = m.status === 'FINISHED'}
  {@const homeParticipantPowerRankingsData = showMatchPR ? getPrData(homeParticipant || { api: m.homeTeam.name ?? '', team: m.homeTeam.name ?? '' }, prSourceIdx) : null}
  {@const awayParticipantPowerRankingsData = showMatchPR ? getPrData(awayParticipant || { api: m.awayTeam.name ?? '', team: m.awayTeam.name ?? '' }, prSourceIdx) : null}

  <div class="match-card" class:live={isLive}>
    <div class="match-meta">
      <span class="match-meta-stage">{stageLabel(m.stage)}</span>

      <span class="match-meta-center">
        {#if homeParticipant && awayParticipant}
          <span class="match-meta-swords">
            <img class="match-meta-sword" src={swordIcon} alt="" width="16" height="16" />
            <img class="match-meta-sword match-meta-sword-flip" src={swordIcon} alt="" width="16" height="16" />
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
        <div class="match-score live-score">
          {m.score.fullTime.home ?? 0} – {m.score.fullTime.away ?? 0}
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
