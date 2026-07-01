import type { LeaderboardEntry, Match, RaffleEntry } from '$lib/types';
import { sortLeaderboard } from './leaderboard';
import { matchEffectiveEndMs, matchLocalDate } from './matches';
import { dateStr } from './snapshots';

export { MATCH_RESULT_DURATION_MIN, matchEffectiveEndMs } from './matches';

export const RANK_SLICE_HOURS = 2;
export const RANK_SLICES_PER_DAY = 24 / RANK_SLICE_HOURS;

export interface TimeSlice {
  date: string;
  sliceIndex: number;
  /** Standings include FINISHED matches whose effective end time is at or before this instant. */
  at: Date;
}

export interface LeaderboardSlice {
  slice: TimeSlice;
  entries: LeaderboardEntry[];
}

export interface PlayerRankPoint {
  at: Date;
  sliceIndex: number;
  rank: number;
  gd: number;
  score: number;
}

export interface PlayerRankSeries {
  name: string;
  team: string;
  points: PlayerRankPoint[];
}

export function startOfLocalDay(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function endOfLocalDayExclusive(date: string): Date {
  return new Date(startOfLocalDay(date).getTime() + 24 * 3_600_000);
}

export function matchesFinishedBy(instant: Date, matches: Match[]): Match[] {
  const t = instant.getTime();
  return matches.filter(
    (m) => m.status === 'FINISHED' && matchEffectiveEndMs(m) <= t
  );
}

export function matchesFinishedOnOrBeforeDate(matches: Match[], date: string): Match[] {
  return matchesFinishedBy(endOfLocalDayExclusive(date), matches);
}

export function hasPriorBaselineBeforeDate(matches: Match[], date: string): boolean {
  const dayStart = startOfLocalDay(date).getTime();
  return matches.some(
    (m) => m.status === 'FINISHED' && matchEffectiveEndMs(m) < dayStart
  );
}

export function leaderboardAsOf(
  raffle: RaffleEntry[],
  matches: Match[],
  instant: Date
): LeaderboardEntry[] {
  // Pass the full schedule (not just matches finished by `instant`) so calcProgress can still
  // see already-known future bracket matchups (e.g. a team already drawn into the next round)
  // while only counting results up to `instant` toward score/goals.
  return sortLeaderboard(raffle, matches, instant.getTime());
}

export function leaderboardAsOfDate(
  raffle: RaffleEntry[],
  matches: Match[],
  date: string
): LeaderboardEntry[] {
  return leaderboardAsOf(raffle, matches, endOfLocalDayExclusive(date));
}

export function sliceEndAt(date: string, sliceIndex: number): Date {
  const start = startOfLocalDay(date);
  return new Date(start.getTime() + (sliceIndex + 1) * RANK_SLICE_HOURS * 3_600_000);
}

export function dayTimeSlices(date: string): TimeSlice[] {
  return Array.from({ length: RANK_SLICES_PER_DAY }, (_, sliceIndex) => ({
    date,
    sliceIndex,
    at: sliceEndAt(date, sliceIndex)
  }));
}

export function lastSliceIndexThrough(instant: Date, date: string): number {
  const slices = dayTimeSlices(date);
  let last = -1;
  for (const slice of slices) {
    if (slice.at.getTime() <= instant.getTime()) last = slice.sliceIndex;
    else break;
  }
  return last;
}

export interface LeaderboardSliceOptions {
  /** When true and `date` is today, omit slices whose end is still in the future. */
  throughNow?: boolean;
  now?: Date;
}

export function leaderboardSlicesForDay(
  raffle: RaffleEntry[],
  matches: Match[],
  date: string,
  options: LeaderboardSliceOptions = {}
): LeaderboardSlice[] {
  const now = options.now ?? new Date();
  const maxSlice =
    options.throughNow && date === dateStr(0)
      ? lastSliceIndexThrough(now, date)
      : RANK_SLICES_PER_DAY - 1;

  if (maxSlice < 0) return [];

  return dayTimeSlices(date)
    .filter((slice) => slice.sliceIndex <= maxSlice)
    .map((slice) => ({
      slice,
      entries: leaderboardAsOf(raffle, matches, slice.at)
    }));
}

export function playerRankSeriesForDay(
  raffle: RaffleEntry[],
  matches: Match[],
  date: string,
  options: LeaderboardSliceOptions = {}
): PlayerRankSeries[] {
  const slices = leaderboardSlicesForDay(raffle, matches, date, options);
  const byPlayer = new Map<string, PlayerRankSeries>();

  for (const { slice, entries } of slices) {
    entries.forEach((entry, i) => {
      const key = entry.name + '|' + entry.team;
      if (!byPlayer.has(key)) {
        byPlayer.set(key, { name: entry.name, team: entry.team, points: [] });
      }
      byPlayer.get(key)!.points.push({
        at: slice.at,
        sliceIndex: slice.sliceIndex,
        rank: i + 1,
        gd: entry.p.gd,
        score: entry.p.score
      });
    });
  }

  return [...byPlayer.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Local hour (0–23) at the end of a slice, e.g. slice 0 → 2, slice 11 → 24 (shown as 0 next day). */
export function sliceEndHour(sliceIndex: number): number {
  return ((sliceIndex + 1) * RANK_SLICE_HOURS) % 24;
}
