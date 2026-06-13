import { STAGE_ORDER } from '$lib/data/raffle';
import type { Match, Progress, RaffleEntry } from '$lib/types';
import { sameTeam } from './teams';

export function didWin(rafApi: string, match: Match): boolean {
  if (match.score.winner === 'DRAW') return false;
  const isHome = sameTeam(match.homeTeam.name, rafApi);
  return (
    (isHome && match.score.winner === 'HOME_TEAM') ||
    (!isHome && match.score.winner === 'AWAY_TEAM')
  );
}

export function calcProgress(entry: RaffleEntry, all: Match[]): Progress {
  const mine = all.filter(
    (m) => sameTeam(m.homeTeam.name, entry.api) || sameTeam(m.awayTeam.name, entry.api)
  );
  const done = mine.filter((m) => m.status === 'FINISHED');

  let gs = 0;
  let gc = 0;
  for (const m of done) {
    const isHome = sameTeam(m.homeTeam.name, entry.api);
    const ft = m.score.fullTime;
    gs += isHome ? ft.home : ft.away;
    gc += isHome ? ft.away : ft.home;
  }
  const gd = gs - gc;

  if (done.length === 0) {
    return { score: 0, label: 'Not started', gs, gd, active: false };
  }

  for (let i = STAGE_ORDER.length - 1; i >= 0; i--) {
    const stage = STAGE_ORDER[i];
    const stageDone = done.filter((m) => m.stage === stage);
    if (stageDone.length === 0) continue;

    if (stage === 'GROUP_STAGE') {
      const inKO = mine.some((m) => m.stage !== 'GROUP_STAGE');
      const gsComplete = mine.filter((m) => m.stage === 'GROUP_STAGE').every((m) => m.status === 'FINISHED');
      const active = inKO || !gsComplete;
      return { score: inKO ? 2 : 1, label: inKO ? 'Round of 32' : 'Group Stage', gs, gd, active };
    }

    const last = stageDone.sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())[0];
    const won = didWin(entry.api, last);

    switch (stage) {
      case 'FINAL':
        return { score: won ? 8 : 7, label: won ? '🏆 Champion!' : '🥈 Runner-Up', gs, gd, active: false };
      case 'THIRD_PLACE':
        return { score: won ? 6 : 5, label: won ? '🥉 3rd Place' : '4th Place', gs, gd, active: false };
      case 'SEMI_FINALS':
        return { score: won ? 7 : 5, label: won ? 'In Final' : '3rd Place Match', gs, gd, active: true };
      case 'QUARTER_FINALS':
        return { score: won ? 5 : 4, label: won ? 'In Semifinals' : 'QF Exit', gs, gd, active: won };
      case 'LAST_16':
        return { score: won ? 4 : 3, label: won ? 'In Quarterfinals' : 'R16 Exit', gs, gd, active: won };
      case 'LAST_32':
        return { score: won ? 3 : 2, label: won ? 'In Round of 16' : 'R32 Exit', gs, gd, active: won };
    }
  }

  return { score: 1, label: 'Group Stage', gs, gd, active: true };
}
