import type { Match, RaffleEntry } from '$lib/types';
import { sameTeam } from './teams';

export function getMatchesForEntry(entry: RaffleEntry, all: Match[] | null): Match[] {
  if (!all) return [];

  return all
    .filter(
      (m) =>
        sameTeam(m.homeTeam.name, entry.api) || sameTeam(m.awayTeam.name, entry.api)
    )
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
}

export function getOpponentName(match: Match, entryApi: string): string {
  if (sameTeam(match.homeTeam.name, entryApi)) {
    return match.awayTeam.name ?? '—';
  }

  return match.homeTeam.name ?? '—';
}

export function getEntryMatchScore(
  match: Match,
  entryApi: string
): { scored: number; conceded: number } | null {
  if (match.status !== 'FINISHED') return null;

  const isHome = sameTeam(match.homeTeam.name, entryApi);
  const ft = match.score.fullTime;

  return {
    scored: isHome ? (ft.home ?? 0) : (ft.away ?? 0),
    conceded: isHome ? (ft.away ?? 0) : (ft.home ?? 0)
  };
}

export function isUpcomingMatch(match: Match): boolean {
  return match.status !== 'FINISHED';
}
