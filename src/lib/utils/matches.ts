import type { Match } from '$lib/types';

export const MATCHES_URL_FULL = 'https://wc2026-raffle-assets.s3.us-east-1.amazonaws.com/matches.json';
export const MATCHES_URL_SLIM = 'https://wc2026-raffle-assets.s3.us-east-1.amazonaws.com/matches-slim.json';

const MATCHES_SOURCE_STORAGE_KEY = 'wc2026_matches_source';

export type MatchesUrlOption = 'full' | 'slim';

function resolveMatchesUrlOption(stored: string | null): MatchesUrlOption {
  if (stored === 'slim' || stored === 'full') {
    return stored;
  }

  return 'full';
}

export function getMatchesUrlOption(): MatchesUrlOption {
  if (typeof localStorage === 'undefined') return 'full';

  const stored =
    localStorage.getItem(MATCHES_SOURCE_STORAGE_KEY) ??
    localStorage.getItem('wc2026_matches_url');

  return resolveMatchesUrlOption(stored);
}

export function getMatchesUrl(): string {
  return getMatchesUrlOption() === 'slim' ? MATCHES_URL_SLIM : MATCHES_URL_FULL;
}

export function setMatchesUrlOption(option: MatchesUrlOption): void {
  localStorage.setItem(MATCHES_SOURCE_STORAGE_KEY, option);
}

export async function fetchMatches(): Promise<Match[] | null> {
  try {
    const res = await fetch(getMatchesUrl(), { cache: 'no-store' });

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

export function getTomorrowMatches(matches: Match[]): Match[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = localDateKey(tomorrow);

  return matches
    .filter((m) => localDateKey(new Date(m.utcDate)) === tomorrowKey)
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
}

export function getRecentMatches(matches: Match[], hours: number): Match[] {
  const now = Date.now();
  const today = localDateKey(new Date());

  return matches
    .filter((m) => {
      const kickoff = new Date(m.utcDate).getTime();
      const hoursAgo = (now - kickoff) / 3_600_000;

      return (
        hoursAgo >= 0 &&
        hoursAgo < hours &&
        localDateKey(new Date(m.utcDate)) !== today
      );
    })
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
}

export function countLiveMatches(matches: Match[] | null): number {
  if (!matches) return 0;

  return matches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED').length;
}

export function isLiveMatch(match: Match): boolean {
  return match.status === 'IN_PLAY' || match.status === 'PAUSED';
}
