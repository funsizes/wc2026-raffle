<script lang="ts">
  import type { MatchTeam, PowerRankingsData, RaffleEntry } from '$lib/types';
  import { t } from '$lib/i18n/locale.svelte';
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
    <Flag entry={flagEntry} icons />
  </span>

  <div class="mname">{teamName}</div>

  {#if participant}
    <div class="mowner">{participant.name}</div>
  {:else}
    <div class="mname placeholder">-</div>
  {/if}

  {#if prData}
    <div class="match-pr">{t('pr.rankShort')} <span class="pr-num">#{Math.round(prData.display)}</span></div>
  {/if}
</div>
