<script lang="ts">
  import '../app.css';
  import GameMaster from '$lib/components/GameMaster.svelte';
  import UserSettings from '$lib/components/UserSettings.svelte';
  import { t } from '$lib/i18n/locale.svelte';
  import '@fortawesome/fontawesome-free/css/all.min.css';
  import 'flag-icons/css/flag-icons.min.css';
</script>

<svelte:head>
  <title>{t('app.pageTitle')}</title>
</svelte:head>

<UserSettings />
<GameMaster />

<slot />
