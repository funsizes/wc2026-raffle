/** Types derived from data/matches.json (football-data.org v4 WC matches). */

export interface FootballDataArea {
  id: number;
  name: string;
  code: string;
  flag: string | null;
}

export interface FootballDataCompetition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface FootballDataSeason {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number | null;
  winner: string | null;
}

export interface FootballDataTeam {
  id: number | null;
  name: string | null;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

export interface FootballDataScoreSide {
  home: number | null;
  away: number | null;
}

export interface FootballDataScore {
  winner: string | null;
  duration: string;
  fullTime: FootballDataScoreSide;
  halfTime: FootballDataScoreSide;
}

export interface FootballDataOdds {
  msg: string;
}

export interface FootballDataReferee {
  id: number;
  name: string;
  type: string;
  nationality: string;
}

export interface FootballDataMatch {
  area: FootballDataArea;
  competition: FootballDataCompetition;
  season: FootballDataSeason;
  id: number;
  utcDate: string;
  status: string;
  /** Present on newer API responses; match clock minute when live or finished. */
  minute?: number | null;
  /** Stoppage time added at end of half (e.g. 2 for "45+2"). */
  injuryTime?: number | null;
  matchday: number | null;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: FootballDataTeam;
  awayTeam: FootballDataTeam;
  score: FootballDataScore;
  odds: FootballDataOdds;
  referees: FootballDataReferee[];
}

export interface FootballDataResultSet {
  count: number;
  first: string;
  last: string;
  played: number;
}

export interface FootballDataFilters {
  season: string;
}

/** Full payload from GET /v4/competitions/WC/matches */
export interface FootballDataMatchesResponse {
  filters: FootballDataFilters;
  resultSet: FootballDataResultSet;
  competition: FootballDataCompetition;
  matches: FootballDataMatch[];
}

/** First fetch-of-day snapshot written to S3 under snapshots/daily/{date}/matches.json */
export interface DailyMatchesSnapshot {
  schemaVersion: 1;
  date: string;
  timezone: string;
  capturedAt: string;
  matchCount: number;
  data: FootballDataMatchesResponse;
}
