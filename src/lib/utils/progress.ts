import { STAGE_ORDER } from '$lib/data/raffle';
import { t } from '$lib/i18n/locale.svelte';
import type { Match, Progress, RaffleEntry } from '$lib/types';
import { matchEffectiveEndMs } from './matches';
import { sameTeam } from './teams';

export function didWin(rafApi: string, match: Match): boolean {
  if (match.score.winner === 'DRAW') return false;
  const isHome = sameTeam(match.homeTeam.name, rafApi);
  return (
    (isHome && match.score.winner === 'HOME_TEAM') ||
    (!isHome && match.score.winner === 'AWAY_TEAM')
  );
}

/**
 * `all` must be the full match schedule (including not-yet-finished fixtures) so bracket
 * placement (e.g. a scheduled Round of 32 match) can be detected even before it's played.
 * `asOfMs`, when given, restricts which results count toward score/goals — used to compute
 * historical/"as of" standings without losing visibility into already-known future matchups.
 */
export function calcProgress(entry: RaffleEntry, all: Match[], asOfMs?: number): Progress {
  const mine = all.filter(
    (m) => sameTeam(m.homeTeam.name, entry.api) || sameTeam(m.awayTeam.name, entry.api)
  );
  const isCountedFinish = (m: Match) =>
    m.status === 'FINISHED' && (asOfMs === undefined || matchEffectiveEndMs(m) <= asOfMs);
  const done = mine.filter(isCountedFinish);

  let gs = 0;
  let gc = 0;
  for (const m of done) {
    const isHome = sameTeam(m.homeTeam.name, entry.api);
    const ft = m.score.fullTime;
    gs += isHome ? (ft.home ?? 0) : (ft.away ?? 0);
    gc += isHome ? (ft.away ?? 0) : (ft.home ?? 0);
  }
  const gd = gs - gc;

  if (done.length === 0) {
    return { score: 0, label: t('progress.notStarted'), gs, gd, active: false };
  }

  for (let i = STAGE_ORDER.length - 1; i >= 0; i--) {
    const stage = STAGE_ORDER[i];
    const stageDone = done.filter((m) => m.stage === stage);
    if (stageDone.length === 0) continue;

    if (stage === 'GROUP_STAGE') {
      const inKO = mine.some((m) => m.stage !== 'GROUP_STAGE');
      const gsComplete = mine.filter((m) => m.stage === 'GROUP_STAGE').every(isCountedFinish);
      const active = inKO || !gsComplete;
      return {
        score: inKO ? 2 : 1,
        label: inKO ? t('progress.roundOf32') : t('progress.groupStage'),
        gs,
        gd,
        active
      };
    }

    const last = stageDone.sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())[0];
    const won = didWin(entry.api, last);

    switch (stage) {
      case 'FINAL':
        return {
          score: won ? 8 : 7,
          label: won ? t('progress.champion') : t('progress.runnerUp'),
          gs,
          gd,
          active: false
        };
      case 'THIRD_PLACE':
        return {
          score: won ? 6 : 5,
          label: won ? t('progress.thirdPlace') : t('progress.fourthPlace'),
          gs,
          gd,
          active: false
        };
      case 'SEMI_FINALS':
        return {
          score: won ? 7 : 5,
          label: won ? t('progress.inFinal') : t('progress.thirdPlaceMatch'),
          gs,
          gd,
          active: true
        };
      case 'QUARTER_FINALS':
        return {
          score: won ? 5 : 4,
          label: won ? t('progress.inSemifinals') : t('progress.qfExit'),
          gs,
          gd,
          active: won
        };
      case 'LAST_16':
        return {
          score: won ? 4 : 3,
          label: won ? t('progress.quarterfinals') : t('progress.r16Exit'),
          gs,
          gd,
          active: won
        };
      case 'LAST_32':
        return {
          score: won ? 3 : 2,
          label: won ? t('progress.roundOf16') : t('progress.r32Exit'),
          gs,
          gd,
          active: won
        };
    }
  }

  return { score: 1, label: t('progress.groupStage'), gs, gd, active: true };
}
