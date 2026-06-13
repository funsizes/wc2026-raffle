<script lang="ts">
  import chestImg from '$lib/assets/chest.png';
  import { getRafflePot, type RaffleGroup } from '$lib/data/raffle';
  import { formatCurrency, t } from '$lib/i18n/locale.svelte';

  interface Props {
    raffleGroup: RaffleGroup;
  }

  let { raffleGroup }: Props = $props();

  const pot = $derived(getRafflePot(raffleGroup));
  const potDisplay = $derived(formatCurrency(pot.amount));
</script>

<div class="rules-tab">
  <div class="pot-box tb-box">
    <h3>{t('pot.title')}</h3>

    <div class="pot-chest-wrap">
      <img class="chest-img" src={chestImg} alt={t('pot.chestAlt')} width="96" height="96" />

      <div class="pot-details">
        <p class="pot-tagline">{t('pot.tagline')}</p>
        <p class="pot-amount">{potDisplay}</p>
        <p class="pot-meta">{t('pot.entrants', { count: pot.participants })}</p>
      </div>
    </div>
  </div>

  <div class="tb-box">
    <h3>{t('rules.howToWin')}</h3>
    <ol>
      <li>
        <strong>{t('rules.roundReachedTitle')}</strong> —
        {t('rules.roundReachedBody')}
      </li>
      <li>
        <strong>{t('rules.goalDiffTitle')}</strong> —
        {t('rules.goalDiffBody')}
      </li>
      <li>
        <strong>{t('rules.goalsScoredTitle')}</strong> —
        {t('rules.goalsScoredBody')}
      </li>
      <li>
        <strong>{t('rules.coinTossTitle')}</strong> —
        {t('rules.coinTossBody')}
      </li>
    </ol>
    <p style="margin-top:1.25rem;font-size:0.75rem;color:var(--muted);line-height:1.7">
      {t('rules.moversNotePrefix')}<strong style="color:var(--gold)">{t('rules.moversHighlight')}</strong>{t('rules.moversNoteSuffix')}
    </p>
  </div>
</div>
