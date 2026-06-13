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

export interface MatchTeam {
  name: string;
  shortName?: string;
}

export interface Match {
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  status: string;
  stage: string;
  utcDate: string;
  score: {
    winner: string;
    fullTime: { home: number; away: number };
  };
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

export interface PrData {
  display: number;
  consensus: number;
}
