<script lang="ts">
  import type { RaffleGroup } from '$lib/data/raffle';
  import type { LeaderboardEntry, Match } from '$lib/types';
  import { getMatchesForEntry } from '$lib/utils/entry-matches';
  import LeaderBoardEntry from './LeaderBoardEntry.svelte';

  interface Props {
    entries: LeaderboardEntry[];
    prSourceIdx: number;
    raffleGroup: RaffleGroup;
    allMatches: Match[] | null;
    showAdminControls?: boolean;
  }

  let { entries, prSourceIdx, raffleGroup, allMatches, showAdminControls = false }: Props = $props();

  const snapLabel = $derived(raffleGroup === 'g1' ? 'g1' : 'g2');

  let openGamesKey = $state<string | null>(null);

  function entryKey(entry: LeaderboardEntry): string {
    return `${entry.name}|${entry.team}`;
  }

  function toggleGames(key: string) {
    openGamesKey = openGamesKey === key ? null : key;
  }
</script>

{#each entries as e, i (e.name + e.team)}
  {@const key = entryKey(e)}
  <LeaderBoardEntry
    entry={e}
    rank={i + 1}
    {snapLabel}
    {prSourceIdx}
    entryMatches={getMatchesForEntry(e, allMatches)}
    gamesOpen={openGamesKey === key}
    onToggleGames={() => toggleGames(key)}
    {showAdminControls}
  />
{/each}
