<script lang="ts">
  import { t } from '$lib/i18n/locale.svelte';
  import { closeGameMaster, isGameMasterOpen, isShowMatchTimeEnabled, setShowMatchTime } from '$lib/settings/gamemaster.svelte';
  import { clearAppLocalStorage } from '$lib/utils/storage';
  import {
    getMatchesBucketOption,
    getMatchesUrlOption,
    setMatchesBucketOption,
    setMatchesUrlOption,
    type MatchesBucketOption,
    type MatchesUrlOption
  } from '$lib/utils/matches';

  let open = $state(false);
  let clearing = $state(false);
  let matchesSource = $state<MatchesUrlOption>('full');
  let matchesBucket = $state<MatchesBucketOption>('wcsorteo2026');

  $effect(() => {
    if (isGameMasterOpen()) {
      open = true;
      matchesSource = getMatchesUrlOption();
      matchesBucket = getMatchesBucketOption();
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

  function chooseMatchesBucket(option: MatchesBucketOption) {
    if (matchesBucket === option) return;

    setMatchesBucketOption(option);
    location.reload();
  }

  function chooseShowMatchTime(enabled: boolean) {
    if (isShowMatchTimeEnabled() === enabled) return;

    setShowMatchTime(enabled);
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
        <div class="settings-section-label">{t('gameMaster.matchesBucket')}</div>
        <div class="hist-group-toggle">
          <button
            type="button"
            class="hist-group-btn"
            class:active={matchesBucket === 'legacy'}
            onclick={() => chooseMatchesBucket('legacy')}
          >
            {t('gameMaster.matchesBucketLegacy')}
          </button>
          <button
            type="button"
            class="hist-group-btn"
            class:active={matchesBucket === 'wcsorteo2026'}
            onclick={() => chooseMatchesBucket('wcsorteo2026')}
          >
            {t('gameMaster.matchesBucketWcsorteo2026')}
          </button>
        </div>
      </section>

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
        <div class="settings-section-label">{t('gameMaster.showMatchTime')}</div>
        <div class="hist-group-toggle">
          <button
            type="button"
            class="hist-group-btn"
            class:active={!isShowMatchTimeEnabled()}
            onclick={() => chooseShowMatchTime(false)}
          >
            {t('gameMaster.showMatchTimeOff')}
          </button>
          <button
            type="button"
            class="hist-group-btn"
            class:active={isShowMatchTimeEnabled()}
            onclick={() => chooseShowMatchTime(true)}
          >
            {t('gameMaster.showMatchTimeOn')}
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
