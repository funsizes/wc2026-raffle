<script lang="ts">
  import type { RaffleEntry } from '$lib/types';
  import Flag from './Flag.svelte';

  interface Props {
    raffle: RaffleEntry[];
  }

  let { raffle }: Props = $props();
</script>

<div class="picks-grid">
  {#each raffle as r (r.pick)}
    <div class="pick-card">
      <div class="pick-num">Pick #{r.pick}</div>
      <span class="pick-flag"><Flag entry={r} /></span>
      <div class="pick-name">{r.name}</div>
      <div class="pick-team">{r.team}</div>
    </div>
  {/each}
</div>
