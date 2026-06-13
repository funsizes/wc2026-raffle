<script lang="ts">
  import type { MatchTeam, PowerRankingsData, RaffleEntry } from '$lib/types';
  import Flag from './Flag.svelte';

  interface Props {
    participant?: RaffleEntry | null;
    team: MatchTeam;
    powerRankingsData?: PowerRankingsData | null;
  }

  let { participant = null, team, powerRankingsData: prData = null }: Props = $props();

  const flagEntry = $derived(
    participant || { api: team.name, team: team.name, flag: '🏳️' }
  );

  const teamName = $derived(participant ? participant.team : team.shortName || team.name);
</script>

<div class="match-team">
  <span class="mflag">
    <Flag entry={flagEntry} />
  </span>

  <div class="mname">{teamName}</div>

  {#if participant}
    <div class="mowner">{participant.name}</div>
  {/if}

  {#if prData}
    <div class="match-pr">PR <span class="pr-num">#{Math.round(prData.display)}</span></div>
  {/if}
</div>
