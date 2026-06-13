import type { LeaderboardEntry, Match, RaffleEntry } from '$lib/types';
import { calcProgress } from './progress';
import { saveDailyHistory, saveSnapshotIfNew } from './snapshots';

export function sortLeaderboard(raffle: RaffleEntry[], all: Match[] | null): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = raffle.map((r) => ({
    ...r,
    p: all ? calcProgress(r, all) : { score: 0, label: 'Pending', gs: 0, gd: 0, active: false }
  }));

  entries.sort((a, b) => {
    if (b.p.score !== a.p.score) return b.p.score - a.p.score;
    if (b.p.gd !== a.p.gd) return b.p.gd - a.p.gd;
    if (b.p.gs !== a.p.gs) return b.p.gs - a.p.gs;
    return a.name.localeCompare(b.name);
  });

  return entries;
}

export function persistLeaderboard(label: string, entries: LeaderboardEntry[]): void {
  saveSnapshotIfNew(label, entries);
  saveDailyHistory(label, entries);
}
