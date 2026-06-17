/** Slim match shapes served from matches-slim.json */

export interface SlimTeam {
  name: string | null;
  shortName?: string;
}

export interface SlimScore {
  winner: string | null;
  fullTime: { home: number | null; away: number | null };
}

export interface SlimMatch {
  utcDate: string;
  status: string;
  stage: string;
  /** e.g. GROUP_A — present for group-stage matches when API provides it. */
  group: string | null;
  /** Match clock minute; null for scheduled matches. */
  minute: number | null;
  /** Stoppage time added at end of half; null when not applicable. */
  injuryTime: number | null;
  homeTeam: SlimTeam;
  awayTeam: SlimTeam;
  score: SlimScore;
}

export interface SlimMatchesPayload {
  matches: SlimMatch[];
}

/** App-facing aliases — same shapes the frontend consumes from S3 */
export type MatchTeam = SlimTeam;
export type Match = SlimMatch;
