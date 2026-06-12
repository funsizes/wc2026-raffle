import type { Match } from '$lib/types';

const MATCHES_URL = 'https://wc2026-raffle-assets.s3.us-east-1.amazonaws.com/matches.json';

export async function fetchMatches(): Promise<Match[] | null> {
  try {
    const res = await fetch(MATCHES_URL, { cache: 'no-store' });

    if (!res.ok) throw new Error(String(res.status));

    const data = await res.json();

    return data.matches || [];
  } catch (e) {
    console.error('Error loading match data', e);
    return null;
  }
}

function localDateKey(d: Date): string {
  // en-CA yields YYYY-MM-DD in the user's local timezone — not for locale, but for a
  // consistent, unambiguous date string we can compare with === (unlike en-US or en-GB).
  return d.toLocaleDateString('en-CA');
}

export function filterTodayMatches(matches: Match[]): Match[] {
  const today = localDateKey(new Date());

  return matches
    .filter((m) => localDateKey(new Date(m.utcDate)) === today)
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
}

export function countLiveMatches(matches: Match[] | null): number {
  if (!matches) return 0;

  return matches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED').length;
}

export function isLiveMatch(match: Match): boolean {
  return match.status === 'IN_PLAY' || match.status === 'PAUSED';
}
