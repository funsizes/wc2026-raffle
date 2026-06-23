import type { LeaderboardEntry, Match, RaffleEntry } from '$lib/types';
import {
  endOfLocalDayExclusive,
  leaderboardAsOf,
  leaderboardAsOfDate
} from './leaderboard-as-of';
import { teamsWithFinishedMatchOnDate, teamPlayedToday } from './snapshots';

export type {
  LeaderboardSlice,
  PlayerRankPoint,
  PlayerRankSeries,
  TimeSlice
} from './leaderboard-as-of';
export {
  dayTimeSlices,
  leaderboardAsOf,
  leaderboardAsOfDate,
  leaderboardSlicesForDay,
  matchEffectiveEndMs,
  matchesFinishedBy,
  matchesFinishedOnOrBeforeDate,
  playerRankSeriesForDay,
  RANK_SLICE_HOURS,
  RANK_SLICES_PER_DAY,
  sliceEndAt,
  sliceEndHour
} from './leaderboard-as-of';

export interface DailyMover {
  entry: LeaderboardEntry;
  rankDelta: number;
  gdDelta: number;
}

export interface DailyMoversResult {
  date: string;
  movers: DailyMover[];
}

export interface DailyMoversOptions {
  /** Reference time for "today" standings; defaults to now (updates on each data refresh). */
  now?: Date;
}

function prevDateKey(date: string): string {
  const d = new Date(date + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA');
}

function nextDateKey(date: string): string {
  const d = new Date(date + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-CA');
}

function isToday(date: string, now: Date): boolean {
  return date === now.toLocaleDateString('en-CA');
}

function rankMap(entries: LeaderboardEntry[]): Map<string, { rank: number; gd: number }> {
  const map = new Map<string, { rank: number; gd: number }>();
  entries.forEach((e, i) => {
    map.set(e.name + '|' + e.team, { rank: i + 1, gd: e.p.gd });
  });
  return map;
}

function computeMovers(
  currentEntries: LeaderboardEntry[],
  prevEntries: LeaderboardEntry[],
  playedOnDate: Set<string>
): DailyMover[] {
  const prev = rankMap(prevEntries);
  const list: DailyMover[] = [];

  currentEntries.forEach((entry, i) => {
    if (!teamPlayedToday(entry.api, playedOnDate)) return;
    const prior = prev.get(entry.name + '|' + entry.team);
    if (!prior) return;
    list.push({
      entry,
      rankDelta: prior.rank - (i + 1),
      gdDelta: entry.p.gd - prior.gd
    });
  });

  list.sort(
    (a, b) =>
      Math.abs(b.rankDelta) - Math.abs(a.rankDelta) ||
      Math.abs(b.gdDelta) - Math.abs(a.gdDelta)
  );

  return list;
}

/**
 * Rank changes for players whose teams finished a match on `date`.
 * Baseline is end-of-previous-day; current is live (now) for today or end-of-day for past dates.
 */
export function dailyMoversForDate(
  raffle: RaffleEntry[],
  allMatches: Match[],
  date: string,
  options: DailyMoversOptions = {}
): DailyMoversResult {
  const now = options.now ?? new Date();
  const prevEntries = leaderboardAsOfDate(raffle, allMatches, prevDateKey(date));
  const asOf = isToday(date, now) ? now : endOfLocalDayExclusive(date);
  const currentEntries = leaderboardAsOf(raffle, allMatches, asOf);
  const playedOnDate = teamsWithFinishedMatchOnDate(allMatches, date);

  return {
    date,
    movers: computeMovers(currentEntries, prevEntries, playedOnDate)
  };
}

export function dailyMoversForDateRange(
  raffle: RaffleEntry[],
  allMatches: Match[],
  startDate: string,
  endDate: string,
  options: DailyMoversOptions = {}
): DailyMoversResult[] {
  const results: DailyMoversResult[] = [];
  let date = startDate;

  while (date <= endDate) {
    results.push(dailyMoversForDate(raffle, allMatches, date, options));
    date = nextDateKey(date);
  }

  return results;
}
