/** Fixed WC26 knockout schedule — kickoff UTC maps 1:1 to football-data.org fixtures. */
export const BRACKET_SLOTS = [
  { num: 73, kickoffMs: Date.parse('2026-06-28T19:00:00Z'), ground: 'Los Angeles (Inglewood)' },
  { num: 76, kickoffMs: Date.parse('2026-06-29T17:00:00Z'), ground: 'Houston' },
  { num: 74, kickoffMs: Date.parse('2026-06-29T20:30:00Z'), ground: 'Boston (Foxborough)' },
  { num: 75, kickoffMs: Date.parse('2026-06-30T01:00:00Z'), ground: 'Monterrey (Guadalupe)' },
  { num: 78, kickoffMs: Date.parse('2026-06-30T17:00:00Z'), ground: 'Dallas (Arlington)' },
  { num: 77, kickoffMs: Date.parse('2026-06-30T21:00:00Z'), ground: 'New York/New Jersey (East Rutherford)' },
  { num: 79, kickoffMs: Date.parse('2026-07-01T01:00:00Z'), ground: 'Mexico City' },
  { num: 80, kickoffMs: Date.parse('2026-07-01T16:00:00Z'), ground: 'Atlanta' },
  { num: 82, kickoffMs: Date.parse('2026-07-01T20:00:00Z'), ground: 'Seattle' },
  { num: 81, kickoffMs: Date.parse('2026-07-02T00:00:00Z'), ground: 'San Francisco Bay Area (Santa Clara)' },
  { num: 84, kickoffMs: Date.parse('2026-07-02T19:00:00Z'), ground: 'Los Angeles (Inglewood)' },
  { num: 83, kickoffMs: Date.parse('2026-07-02T23:00:00Z'), ground: 'Toronto' },
  { num: 85, kickoffMs: Date.parse('2026-07-03T03:00:00Z'), ground: 'Vancouver' },
  { num: 88, kickoffMs: Date.parse('2026-07-03T18:00:00Z'), ground: 'Dallas (Arlington)' },
  { num: 86, kickoffMs: Date.parse('2026-07-03T22:00:00Z'), ground: 'Miami (Miami Gardens)' },
  { num: 87, kickoffMs: Date.parse('2026-07-04T01:30:00Z'), ground: 'Kansas City' },
  { num: 90, kickoffMs: Date.parse('2026-07-04T17:00:00Z'), ground: 'Houston' },
  { num: 89, kickoffMs: Date.parse('2026-07-04T21:00:00Z'), ground: 'Philadelphia' },
  { num: 91, kickoffMs: Date.parse('2026-07-05T20:00:00Z'), ground: 'New York/New Jersey (East Rutherford)' },
  { num: 92, kickoffMs: Date.parse('2026-07-06T00:00:00Z'), ground: 'Mexico City' },
  { num: 93, kickoffMs: Date.parse('2026-07-06T19:00:00Z'), ground: 'Dallas (Arlington)' },
  { num: 94, kickoffMs: Date.parse('2026-07-07T00:00:00Z'), ground: 'Seattle' },
  { num: 95, kickoffMs: Date.parse('2026-07-07T16:00:00Z'), ground: 'Atlanta' },
  { num: 96, kickoffMs: Date.parse('2026-07-07T20:00:00Z'), ground: 'Vancouver' },
  { num: 97, kickoffMs: Date.parse('2026-07-09T20:00:00Z'), ground: 'Boston (Foxborough)' },
  { num: 98, kickoffMs: Date.parse('2026-07-10T19:00:00Z'), ground: 'Los Angeles (Inglewood)' },
  { num: 99, kickoffMs: Date.parse('2026-07-11T21:00:00Z'), ground: 'Miami (Miami Gardens)' },
  { num: 100, kickoffMs: Date.parse('2026-07-12T01:00:00Z'), ground: 'Kansas City' },
  { num: 101, kickoffMs: Date.parse('2026-07-14T19:00:00Z'), ground: 'Dallas (Arlington)' },
  { num: 102, kickoffMs: Date.parse('2026-07-15T19:00:00Z'), ground: 'Atlanta' },
  { num: 104, kickoffMs: Date.parse('2026-07-19T19:00:00Z'), ground: 'New York/New Jersey (East Rutherford)' }
] as const;

export const KICKOFF_TO_NUM = new Map(BRACKET_SLOTS.map((s) => [s.kickoffMs, s.num]));
export const NUM_TO_GROUND = new Map(BRACKET_SLOTS.map((s) => [s.num, s.ground]));
