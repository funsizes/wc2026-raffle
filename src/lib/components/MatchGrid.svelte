<script lang="ts">
  import { STAGE_LABEL } from '$lib/data/raffle';
  import type { Match, RaffleEntry } from '$lib/types';
  import { isLiveMatch } from '$lib/utils/matches';
  import { getPrData } from '$lib/utils/rankings';
  import { findParticipant } from '$lib/utils/teams';
  import MatchTeam from './MatchTeam.svelte';

  interface Props {
    matches: Match[];
    raffle: RaffleEntry[];
    showMatchPR: boolean;
    prSourceIdx: number;
  }

  let { matches, raffle, showMatchPR, prSourceIdx }: Props = $props();
</script>

{#each matches as m (m.utcDate + m.homeTeam.name + m.awayTeam.name)}
  {@const homeParticipant = findParticipant(m.homeTeam.name, raffle)}
  {@const awayParticipant = findParticipant(m.awayTeam.name, raffle)}

  {@const isLive = isLiveMatch(m)}
  {@const isDone = m.status === 'FINISHED'}
  {@const homeParticipantPowerRankingsData = showMatchPR ? getPrData(homeParticipant || { api: m.homeTeam.name, team: m.homeTeam.name }, prSourceIdx) : null}
  {@const awayParticipantPowerRankingsData = showMatchPR ? getPrData(awayParticipant || { api: m.awayTeam.name, team: m.awayTeam.name }, prSourceIdx) : null}

  <div class="match-card" class:live={isLive}>
    <div class="match-meta">
      <span>{STAGE_LABEL[m.stage] || m.stage}</span>

      {#if isDone}
        <span class="status-done">FT</span>
      {:else if isLive}
        <span class="status-live">● LIVE</span>
      {:else}
        <span class="status-upcoming">UPCOMING</span>
      {/if}
    </div>

    <div class="match-body">
      <MatchTeam participant={homeParticipant} team={m.homeTeam} powerRankingsData={homeParticipantPowerRankingsData} />

      {#if isDone}
        <div class="match-score">{m.score.fullTime.home} – {m.score.fullTime.away}</div>
      {:else if isLive}
        <div class="match-score live-score">
          {m.score.fullTime.home ?? 0} – {m.score.fullTime.away ?? 0}
        </div>
      {:else}
        <div class="match-score" style="font-size:1rem;color:var(--gold)">
          {new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      {/if}

      <MatchTeam participant={awayParticipant} team={m.awayTeam} powerRankingsData={awayParticipantPowerRankingsData} />
    </div>
  </div>
{/each}
