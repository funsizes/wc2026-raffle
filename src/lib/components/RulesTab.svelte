<script lang="ts">
  import chestImg from '$lib/assets/chest.png';
  import { getRafflePot, type RaffleGroup } from '$lib/data/raffle';

  interface Props {
    raffleGroup: RaffleGroup;
  }

  let { raffleGroup }: Props = $props();

  const pot = $derived(getRafflePot(raffleGroup));

  const potDisplay = $derived(
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(pot.amount)
  );
</script>

<div class="rules-tab">
  <div class="pot-box tb-box">
    <h3>👑 Winner's Hoard</h3>

    <div class="pot-chest-wrap">
      <img class="chest-img" src={chestImg} alt="Treasure chest" width="96" height="96" />

      <div class="pot-details">
        <p class="pot-tagline">One champion. One chest. Winner take all.</p>
        <p class="pot-amount">{potDisplay}</p>
        <p class="pot-meta">{pot.participants} entrants</p>
      </div>
    </div>
  </div>

  <div class="tb-box">
    <h3>⚔️ How to Win</h3>
    <ol>
      <li>
        <strong>Round Reached</strong> —
        Whoever's team survives the longest wins outright. Champion takes the gold.
      </li>
      <li>
        <strong>Goal Difference</strong> —
        Eliminated at the same stage? Best combined GD across every match (Groups + all Knockouts) wins.
      </li>
      <li>
        <strong>Goals Scored</strong> —
        Still tied? Most total goals scored across all matches breaks it.
      </li>
      <li>
        <strong>🎲 Coin Toss</strong> —
        If everything above is completely dead even, we flip a coin. Contact the organizer.
      </li>
    </ol>
    <p style="margin-top:1.25rem;font-size:0.75rem;color:var(--muted);line-height:1.7">
      The <strong style="color:var(--gold)">Today's Movers</strong> section only shows participants whose
      team actually played that day — so every movement you see is from real results, not from someone
      else's team losing.
    </p>
  </div>
</div>
