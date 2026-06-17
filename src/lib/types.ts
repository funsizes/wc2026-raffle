export type { Match, MatchTeam } from '@wc2026/shared/match-types';

export interface RaffleEntry {
  pick: number;
  name: string;
  team: string;
  flag: string;
  flagUrl?: string;
  api: string;
}

export interface Progress {
  score: number;
  label: string;
  gs: number;
  gd: number;
  active: boolean;
}

export interface RankingEntry {
  rank: number;
  team: string;
  flag: string;
  flagUrl?: string;
  api?: string;
  s: number[];
  avg: number;
}

export interface SnapshotEntry {
  rank: number;
  gd: number;
  gs: number;
}

export type Snapshot = Record<string, SnapshotEntry>;

export interface LeaderboardEntry extends RaffleEntry {
  p: Progress;
}

export interface RankDelta {
  rank: number;
  gd: number;
  gs: number;
}

export interface PowerRankingsData {
  display: number;
  consensus: number;
}
