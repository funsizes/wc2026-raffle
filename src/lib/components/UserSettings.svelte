<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getLocale,
    hasLocale,
    initLocale,
    setLocale,
    t
  } from '$lib/i18n/locale.svelte';
  import type { Locale } from '$lib/i18n/types';
  import { LOCALES } from '$lib/i18n/types';
  import { closeSettings, isSettingsOpen } from '$lib/settings/settings.svelte';

  let open = $state(false);
  let firstVisit = $state(false);

  const activeLocale = $derived(getLocale());
  const dialogTitle = $derived(
    firstVisit ? t('settings.firstVisitTitle') : t('settings.title')
  );

  onMount(() => {
    initLocale();
    if (!hasLocale()) {
      firstVisit = true;
      open = true;
    }
  });

  $effect(() => {
    if (isSettingsOpen()) {
      open = true;
    }
  });

  function dismiss() {
    if (firstVisit && !hasLocale()) return;
    open = false;
    firstVisit = false;
    closeSettings();
  }

  function chooseLocale(next: Locale) {
    setLocale(next);
    if (firstVisit) dismiss();
  }
</script>

{#if open}
  <div class="settings-overlay" role="presentation">
    <div
      class="settings-dialog tb-box"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
    >
      <h3 id="settings-dialog-title">{dialogTitle}</h3>

      {#if firstVisit}
        <p class="settings-subtitle">{t('settings.firstVisitSubtitle')}</p>
      {/if}

      <section class="settings-section">
        <div class="settings-section-label">{t('settings.language')}</div>
        <div class="hist-group-toggle">
          {#each LOCALES as locale (locale)}
            <button
              type="button"
              class="hist-group-btn"
              class:active={activeLocale === locale}
              onclick={() => chooseLocale(locale)}
            >
              {t(`settings.locale.${locale}`)}
            </button>
          {/each}
        </div>
      </section>

      {#if !firstVisit}
        <button type="button" class="settings-done-btn" onclick={dismiss}>
          {t('settings.done')}
        </button>
      {/if}
    </div>
  </div>
{/if}
