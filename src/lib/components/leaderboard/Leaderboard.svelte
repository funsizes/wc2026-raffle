<script lang="ts">
  import type { RaffleGroup } from '$lib/data/raffle';
  import type { LeaderboardEntry } from '$lib/types';
  import LeaderBoardEntry from './LeaderBoardEntry.svelte';

  interface Props {
    entries: LeaderboardEntry[];
    prSourceIdx: number;
    raffleGroup: RaffleGroup;
    showAdminControls?: boolean;
  }

  let { entries, prSourceIdx, raffleGroup, showAdminControls = false }: Props = $props();

  const snapLabel = $derived(raffleGroup === 'g1' ? 'g1' : 'g2');
</script>

{#each entries as e, i (e.name + e.team)}
  <LeaderBoardEntry entry={e} rank={i + 1} {snapLabel} {prSourceIdx} {showAdminControls} />
{/each}
