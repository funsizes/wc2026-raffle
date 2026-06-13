<script lang="ts">
  import '../app.css';
  import GameMaster from '$lib/components/GameMaster.svelte';
  import UserSettings from '$lib/components/UserSettings.svelte';
  import { t } from '$lib/i18n/locale.svelte';
</script>

<svelte:head>
  <title>{t('app.pageTitle')}</title>
</svelte:head>

<UserSettings />
<GameMaster />

<slot />
