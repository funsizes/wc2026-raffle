import type { LeaderboardEntry, Match, RaffleEntry } from '$lib/types';
import { sortLeaderboard } from './leaderboard';
import { matchLocalDate } from './matches';
import { dateStr } from './snapshots';

/** Estimated elapsed time from kickoff until a result affects standings (minutes). */
export const MATCH_RESULT_DURATION_MIN = 105;

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

/** When a finished match is treated as affecting standings (kickoff + estimated duration). */
export function matchEffectiveEndMs(match: Match): number {
  return new Date(match.utcDate).getTime() + MATCH_RESULT_DURATION_MIN * 60_000;
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
  return sortLeaderboard(raffle, matchesFinishedBy(instant, matches));
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
