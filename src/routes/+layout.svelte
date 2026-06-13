<script lang="ts">
  import '../app.css';
  import LocalePrompt from '$lib/components/LocalePrompt.svelte';
  import { t } from '$lib/i18n/locale.svelte';
</script>

<svelte:head>
  <title>{t('app.pageTitle')}</title>
</svelte:head>

<LocalePrompt />

<slot />
