<script lang="ts">
  import {
    getFlagEmoji,
    getFlagIconClass,
    getFlagSrc,
    type FlagEntry,
    type FlagFormat
  } from '$lib/utils/flags';

  interface Props {
    entry?: FlagEntry;
    class?: string;
    /** Use flag-icons SVG sprites (https://flagicons.lipis.dev/) instead of flagcdn. */
    icons?: boolean;
    /** Fixed height via flagcdn h{N} — default; best when CSS sizes by height. */
    height?: number;
    /** Fixed width via flagcdn w{N} — uniform width, variable height. */
    width?: number;
    /** Fixed width×height via flagcdn — same size for every flag. */
    boxWidth?: number;
    boxHeight?: number;
    format?: FlagFormat;
    /** Vector flag instead of fixed-dimension bitmap. */
    svg?: boolean;
  }

  let {
    entry = null,
    class: className = '',
    icons = false,
    height,
    width,
    boxWidth,
    boxHeight,
    format = 'png',
    svg = false
  }: Props = $props();

  const iconClass = $derived(icons ? getFlagIconClass(entry) : null);
  const src = $derived(
    icons ? null : getFlagSrc(entry, { height, width, boxWidth, boxHeight, format, svg })
  );
  const emoji = $derived(getFlagEmoji(entry));
  const label = $derived(entry?.team || entry?.api || 'flag');
</script>

{#if iconClass}
  <span class="fi {iconClass} {className}" role="img" aria-label={label}></span>
{:else if src}
  <img {src} alt={label} class="flag-img {className}" />
{:else}
  {emoji}
{/if}
