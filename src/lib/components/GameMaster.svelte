<script lang="ts">
  import { t } from '$lib/i18n/locale.svelte';
  import { closeGameMaster, isGameMasterOpen } from '$lib/settings/gamemaster.svelte';
  import { clearAppLocalStorage } from '$lib/utils/storage';

  let open = $state(false);
  let clearing = $state(false);

  $effect(() => {
    if (isGameMasterOpen()) {
      open = true;
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
