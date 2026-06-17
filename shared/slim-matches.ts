import type { SlimMatch, SlimMatchesPayload, SlimScore, SlimTeam } from './match-types.js';

function slimTeam(team: unknown): SlimTeam | null {
  if (!team || typeof team !== 'object') return null;

  const { name, shortName } = team as { name?: unknown; shortName?: unknown };

  if (name === null) return { name: null };
  if (typeof name !== 'string' || !name) return null;

  if (typeof shortName === 'string' && shortName && shortName !== name) {
    return { name, shortName };
  }

  return { name };
}

function slimScore(score: unknown): SlimScore {
  const src =
    score && typeof score === 'object'
      ? (score as { winner?: unknown; fullTime?: unknown })
      : {};
  const fullTime =
    src.fullTime && typeof src.fullTime === 'object'
      ? (src.fullTime as { home?: unknown; away?: unknown })
      : {};

  const home = typeof fullTime.home === 'number' ? fullTime.home : null;
  const away = typeof fullTime.away === 'number' ? fullTime.away : null;
  const winner = typeof src.winner === 'string' ? src.winner : null;

  return { winner, fullTime: { home, away } };
}

function slimClock(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function slimMatch(match: unknown): SlimMatch | null {
  if (!match || typeof match !== 'object') return null;

  const m = match as Record<string, unknown>;
  const homeTeam = slimTeam(m.homeTeam);
  const awayTeam = slimTeam(m.awayTeam);

  if (
    typeof m.utcDate !== 'string' ||
    typeof m.status !== 'string' ||
    typeof m.stage !== 'string' ||
    homeTeam === null ||
    awayTeam === null
  ) {
    return null;
  }

  return {
    utcDate: m.utcDate,
    status: m.status,
    stage: m.stage,
    group: typeof m.group === 'string' ? m.group : null,
    minute: slimClock(m.minute),
    injuryTime: slimClock(m.injuryTime),
    homeTeam,
    awayTeam,
    score: slimScore(m.score)
  };
}

export function slimMatchesPayload(input: unknown): SlimMatchesPayload {
  const matches = Array.isArray(input)
    ? input
    : input && typeof input === 'object' && Array.isArray((input as { matches?: unknown }).matches)
      ? (input as { matches: unknown[] }).matches
      : [];

  return {
    matches: matches.map(slimMatch).filter((m): m is SlimMatch => m !== null)
  };
}

export { slimMatch, slimTeam, slimScore };
