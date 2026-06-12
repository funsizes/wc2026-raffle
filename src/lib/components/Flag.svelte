<script lang="ts">
  import { getFlagEmoji, getFlagSrc, type FlagEntry } from '$lib/utils/flags';

  interface Props {
    entry?: FlagEntry;
    class?: string;
  }

  let { entry = null, class: className = '' }: Props = $props();

  const src = $derived(getFlagSrc(entry));
  const emoji = $derived(getFlagEmoji(entry));
</script>

{#if src}
  <img {src} alt={entry?.team || entry?.api || 'flag'} class="flag-img {className}" />
{:else}
  {emoji}
{/if}
