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
