import type { LeaderboardEntry, Match, RankDelta, Snapshot } from '$lib/types';
import { sameTeam } from './teams';

export function dateStr(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * 864e5).toLocaleDateString('en-CA');
}

export function saveSnapshotIfNew(label: string, sortedEntries: LeaderboardEntry[]): void {
  const key = `wc2026_${label}_${dateStr()}`;
  if (localStorage.getItem(key)) return;
  const snap: Snapshot = {};
  sortedEntries.forEach((e, i) => {
    snap[e.name + '|' + e.team] = { rank: i + 1, gd: e.p.gd, gs: e.p.gs };
  });
  try {
    localStorage.setItem(key, JSON.stringify(snap));
  } catch {
    /* ignore quota errors */
  }
}

export function saveDailyHistory(label: string, sortedEntries: LeaderboardEntry[]): void {
  const snap: Snapshot = {};
  sortedEntries.forEach((e, i) => {
    snap[e.name + '|' + e.team] = { rank: i + 1, gd: e.p.gd, gs: e.p.gs };
  });
  try {
    localStorage.setItem(`wc2026_hist_${label}_${dateStr()}`, JSON.stringify(snap));
  } catch {
    /* ignore quota errors */
  }
}

export function loadSnapshot(label: string, offset = -1): Snapshot | null {
  const raw = localStorage.getItem(`wc2026_${label}_${dateStr(offset)}`);
  return raw ? JSON.parse(raw) : null;
}

export function loadHistSnap(label: string, date: string): Snapshot | null {
  const raw =
    localStorage.getItem(`wc2026_hist_${label}_${date}`) ||
    localStorage.getItem(`wc2026_${label}_${date}`);
  return raw ? JSON.parse(raw) : null;
}

export function getEntryDelta(label: string, entry: LeaderboardEntry, currentRank: number): RankDelta | null {
  const snap = loadSnapshot(label, -1) || loadSnapshot(label, 0);
  if (!snap) return null;
  const prev = snap[entry.name + '|' + entry.team];
  if (!prev) return null;
  return {
    rank: prev.rank - currentRank,
    gd: entry.p.gd - prev.gd,
    gs: entry.p.gs - prev.gs
  };
}

export function getSnapshotDates(label: string): string[] {
  const histPfx = `wc2026_hist_${label}_`;
  const oldPfx = `wc2026_${label}_`;
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const dates = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith(histPfx)) dates.add(k.slice(histPfx.length));
    else if (k.startsWith(oldPfx)) {
      const d = k.slice(oldPfx.length);
      if (dateRe.test(d)) dates.add(d);
    }
  }
  return [...dates].filter((d) => dateRe.test(d)).sort();
}

export function migrateSnapshots(): void {
  ['g1', 'g2'].forEach((lbl) => {
    const k = `wc2026_${lbl}_${dateStr()}`;
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        const snap = JSON.parse(raw) as Snapshot;
        const keys = Object.keys(snap);
        if (keys.length && snap[keys[0]].rank === undefined) localStorage.removeItem(k);
      } catch {
        localStorage.removeItem(k);
      }
    }
  });
}

export function teamsPlayedToday(allMatches: Match[] | null): Set<string> {
  const playedToday = new Set<string>();
  if (!allMatches) return playedToday;
  const todayLocal = new Date().toLocaleDateString('en-CA');
  allMatches.forEach((m) => {
    if (m.status !== 'FINISHED') return;
    if (new Date(m.utcDate).toLocaleDateString('en-CA') !== todayLocal) return;
    if (m.homeTeam.name) playedToday.add(m.homeTeam.name);
    if (m.awayTeam.name) playedToday.add(m.awayTeam.name);
  });
  return playedToday;
}

export function teamsPlayedOnDate(allMatches: Match[] | null, date: string): Set<string> {
  const playedOnDate = new Set<string>();
  if (!allMatches) return playedOnDate;

  const dayBefore = new Date(new Date(date + 'T12:00:00').getTime() - 864e5).toLocaleDateString('en-CA');
  const gamesOnDate = allMatches.filter(
    (m) => m.status === 'FINISHED' && new Date(m.utcDate).toLocaleDateString('en-CA') === date
  );
  const gamesToUse =
    gamesOnDate.length > 0
      ? gamesOnDate
      : allMatches.filter(
          (m) => m.status === 'FINISHED' && new Date(m.utcDate).toLocaleDateString('en-CA') === dayBefore
        );
  gamesToUse.forEach((m) => {
    if (m.homeTeam.name) playedOnDate.add(m.homeTeam.name);
    if (m.awayTeam.name) playedOnDate.add(m.awayTeam.name);
  });
  return playedOnDate;
}

export function teamPlayedToday(teamApi: string, playedToday: Set<string>): boolean {
  return [...playedToday].some((t) => sameTeam(t, teamApi));
}
