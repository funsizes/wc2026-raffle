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

export function filterTodayMatches(all: Match[]): Match[] {
  const todayLocal = new Date().toLocaleDateString('en-CA');
  const now = Date.now();
  return all
    .filter((m) => {
      const gameDate = new Date(m.utcDate).toLocaleDateString('en-CA');
      const hoursAgo = (now - new Date(m.utcDate).getTime()) / 3_600_000;
      return gameDate === todayLocal || (hoursAgo >= 0 && hoursAgo < 30);
    })
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
}

export function countLiveMatches(all: Match[] | null): number {
  if (!all) return 0;
  return all.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED').length;
}

export function isLiveMatch(m: Match): boolean {
  return m.status === 'IN_PLAY' || m.status === 'PAUSED';
}
