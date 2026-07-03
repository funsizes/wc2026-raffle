/** Openfootball-shaped match entry consumed by the bracket model. */
export interface FeedMatch {
  num: number;
  team1: string | null;
  team2: string | null;
  score?: BracketScore;
  /** ISO 8601 kickoff — preferred over date/time when present. */
  utcDate?: string;
  date?: string;
  time?: string;
  ground?: string;
  status?: string;
}

export interface BracketScore {
  ft?: [number, number];
  et?: [number, number];
  p?: [number, number];
}

export interface BracketNode {
  participants: [string | null, string | null];
  winner: string | null;
  score?: BracketScore;
  label: string;
  utcDate?: string;
  date: string;
  time: string;
  ground: string;
  status?: string;
}

export interface BracketFlag {
  x: number;
  y: number;
  team: string;
  cls: string;
  tip: BracketTip;
  ground: string;
}

export interface BracketTip {
  round: string;
  teams: string;
  score: string;
  when: string;
  status: '' | 'live' | 'soon';
  venue: string;
}
