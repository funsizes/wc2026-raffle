<script lang="ts">
  import { RAFFLE_GROUP_OPTIONS, type RaffleGroup } from '$lib/data/raffle';

  interface Props {
    value?: RaffleGroup;
    onchange?: (group: RaffleGroup) => void;
  }

  let { value = $bindable('g1' as RaffleGroup), onchange }: Props = $props();

  function select(group: RaffleGroup) {
    value = group;
    onchange?.(group);
  }
</script>

<div class="hist-group-toggle">
  {#each RAFFLE_GROUP_OPTIONS as opt (opt.id)}
    <button
      type="button"
      class="hist-group-btn"
      class:active={value === opt.id}
      onclick={() => select(opt.id)}>{opt.label}</button
    >
  {/each}
</div>
