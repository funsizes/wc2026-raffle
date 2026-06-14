<script lang="ts">
  import { t } from '$lib/i18n/locale.svelte';
  import { closeGameMaster, isGameMasterOpen } from '$lib/settings/gamemaster.svelte';
  import { clearAppLocalStorage } from '$lib/utils/storage';
  import {
    getMatchesUrlOption,
    setMatchesUrlOption,
    type MatchesUrlOption
  } from '$lib/utils/matches';

  let open = $state(false);
  let clearing = $state(false);
  let matchesSource = $state<MatchesUrlOption>('full');

  $effect(() => {
    if (isGameMasterOpen()) {
      open = true;
      matchesSource = getMatchesUrlOption();
    }
  });

  function dismiss() {
    open = false;
    closeGameMaster();
  }

  function clearStorage() {
    if (clearing) return;
    if (!confirm(t('gameMaster.clearConfirm'))) return;

    clearing = true;
    clearAppLocalStorage();
    location.reload();
  }

  function chooseMatchesSource(option: MatchesUrlOption) {
    if (matchesSource === option) return;

    setMatchesUrlOption(option);
    location.reload();
  }
</script>

{#if open}
  <div class="settings-overlay" role="presentation">
    <div
      class="settings-dialog tb-box"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gamemaster-dialog-title"
    >
      <h3 id="gamemaster-dialog-title">{t('gameMaster.title')}</h3>
      <p class="settings-subtitle">{t('gameMaster.subtitle')}</p>

      <section class="settings-section">
        <div class="settings-section-label">{t('gameMaster.matchesUrl')}</div>
        <div class="hist-group-toggle">
          <button
            type="button"
            class="hist-group-btn"
            class:active={matchesSource === 'full'}
            onclick={() => chooseMatchesSource('full')}
          >
            {t('gameMaster.matchesUrlFull')}
          </button>
          <button
            type="button"
            class="hist-group-btn"
            class:active={matchesSource === 'slim'}
            onclick={() => chooseMatchesSource('slim')}
          >
            {t('gameMaster.matchesUrlSlim')}
          </button>
        </div>
      </section>

      <section class="settings-section">
        <div class="settings-section-label">{t('gameMaster.storage')}</div>
        <button
          type="button"
          class="gamemaster-action-btn"
          disabled={clearing}
          onclick={clearStorage}
        >
          {t('gameMaster.clearStorage')}
        </button>
      </section>

      <button type="button" class="settings-done-btn" onclick={dismiss}>
        {t('gameMaster.done')}
      </button>
    </div>
  </div>
{/if}
