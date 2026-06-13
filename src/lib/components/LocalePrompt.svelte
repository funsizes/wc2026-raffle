<script lang="ts">
  import { onMount } from 'svelte';
  import {
    closeLocalePrompt,
    hasLocale,
    initLocale,
    isLocalePromptOpen,
    setLocale,
    t
  } from '$lib/i18n/locale.svelte';
  import type { Locale } from '$lib/i18n/types';

  let open = $state(false);

  onMount(() => {
    initLocale();
    open = !hasLocale();
  });

  $effect(() => {
    if (isLocalePromptOpen()) {
      open = true;
    }
  });

  function choose(next: Locale) {
    setLocale(next);
    open = false;
    closeLocalePrompt();
  }
</script>

{#if open}
  <div class="locale-overlay" role="presentation">
    <div
      class="locale-dialog tb-box"
      role="dialog"
      aria-modal="true"
      aria-labelledby="locale-dialog-title"
    >
      <h3 id="locale-dialog-title">{t('locale.promptTitle')}</h3>
      <p class="locale-subtitle">{t('locale.promptSubtitle')}</p>

      <div class="locale-actions">
        <button type="button" class="locale-btn" onclick={() => choose('en-US')}>
          {t('locale.english')}
        </button>
        <button type="button" class="locale-btn" onclick={() => choose('es-US')}>
          {t('locale.spanish')}
        </button>
      </div>
    </div>
  </div>
{/if}
