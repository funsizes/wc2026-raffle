<script lang="ts">
  import { STAGE_LABEL } from '$lib/data/raffle';
  import type { Match, RaffleEntry } from '$lib/types';
  import { isLiveMatch } from '$lib/utils/matches';
  import { getPrData } from '$lib/utils/rankings';
  import { findParticipant } from '$lib/utils/teams';
  import Flag from './Flag.svelte';

  interface Props {
    matches: Match[];
    raffle: RaffleEntry[];
    showMatchPR: boolean;
    prSourceIdx: number;
  }

  let { matches, raffle, showMatchPR, prSourceIdx }: Props = $props();
</script>

{#each matches as m (m.utcDate + m.homeTeam.name + m.awayTeam.name)}
  {@const hp = findParticipant(m.homeTeam.name, raffle)}
  {@const ap = findParticipant(m.awayTeam.name, raffle)}
  {@const isLive = isLiveMatch(m)}
  {@const isDone = m.status === 'FINISHED'}
  {@const hPrData = showMatchPR ? getPrData(hp || { api: m.homeTeam.name, team: m.homeTeam.name }, prSourceIdx) : null}
  {@const aPrData = showMatchPR ? getPrData(ap || { api: m.awayTeam.name, team: m.awayTeam.name }, prSourceIdx) : null}
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
      <div class="match-team">
        <span class="mflag"><Flag entry={hp || { api: m.homeTeam.name, team: m.homeTeam.name, flag: '🏳️' }} /></span>
        <div class="mname">{hp ? hp.team : m.homeTeam.shortName || m.homeTeam.name}</div>
        {#if hp}<div class="mowner">{hp.name}</div>{/if}
        {#if hPrData}
          <div class="match-pr">PR <span class="pr-num">#{Math.round(hPrData.display)}</span></div>
        {/if}
      </div>
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
      <div class="match-team">
        <span class="mflag"><Flag entry={ap || { api: m.awayTeam.name, team: m.awayTeam.name, flag: '🏳️' }} /></span>
        <div class="mname">{ap ? ap.team : m.awayTeam.shortName || m.awayTeam.name}</div>
        {#if ap}<div class="mowner">{ap.name}</div>{/if}
        {#if aPrData}
          <div class="match-pr">PR <span class="pr-num">#{Math.round(aPrData.display)}</span></div>
        {/if}
      </div>
    </div>
  </div>
{/each}
