<script lang="ts">
  import { RANKINGS, RANK_SOURCES } from "$lib/data/rankings";
  import { rkClass } from "$lib/utils/rankings";
  import Flag from "./Flag.svelte";
  import type { RaffleGroup } from "$lib/data/raffle";
    import { sameTeam } from "$lib/utils/teams";
    import { RAFFLE, RAFFLE2 } from "$lib/data/raffle";

  interface Props {
    raffleGroup: RaffleGroup;
  }

  let { raffleGroup }: Props = $props();

  const raffle = $derived(raffleGroup === "g1" ? RAFFLE : RAFFLE2);

  function findOwners(teamName: string): string[] {
    const owners: string[] = [];

    for (const r of raffle)
      if (sameTeam(teamName, r.api)) owners.push(r.name);

    return owners;
  }
</script>

<div class="rankings-source">
  Aggregated from 14 media outlets (ESPN, CBS, USAT, Yahoo, Guardian, Fox
  Sports, The Athletic, Bleacher Report, Elo, FIFA, Opta, Score, PrizePicks,
  Goal) ·
  <a
    href="https://www.reddit.com/r/soccer/comments/1u28hp0/gathered_every_media_power_ranking_of_the_48/"
    target="_blank"
    rel="noopener">Source (Reddit r/soccer)</a
  >
</div>
<div class="rankings-wrap">
  <table class="rankings-table">
    <thead>
      <tr>
        <th>#</th>
        <th class="col-team">Team</th>
        <th>Avg</th>
        {#each RANK_SOURCES as s}<th>{s}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each RANKINGS as r (r.team)}
        {@const owners = findOwners(r.team)}
        <tr>
          <td class="col-rk">{r.rank}</td>
          <td class="col-team">
            <Flag entry={r} />
            {r.team}
            {#each owners as o}<span class="raffle-owner">{o}</span>{/each}
          </td>
          <td class="col-avg">
            <span class="rk-cell {rkClass(Math.round(r.avg))}">{r.avg}</span>
          </td>
          {#each r.s as n}
            <td><span class="rk-cell {rkClass(n)}">{n}</span></td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
