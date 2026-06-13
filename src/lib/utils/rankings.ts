import { RANKINGS } from '$lib/data/rankings';
import type { PowerRankingsData, RaffleEntry } from '$lib/types';

export function getPrData(raffleEntry: Pick<RaffleEntry, 'api' | 'team'>, prSourceIdx: number): PowerRankingsData | null {
  const key = (raffleEntry.api || raffleEntry.team || '').toLowerCase();
  const found = RANKINGS.find((r) => {
    const rk = r.team.toLowerCase();
    const ra = (r.api || '').toLowerCase();
    return (
      rk === key ||
      rk.includes(key) ||
      key.includes(rk) ||
      (ra && (ra === key || ra.includes(key) || key.includes(ra)))
    );
  });
  if (!found) return null;
  const displayRank = prSourceIdx === -1 ? found.avg : found.s[prSourceIdx];
  return { display: displayRank, consensus: found.rank };
}

export function rkClass(n: number): string {
  return n <= 10 ? 'rk-s1' : n <= 25 ? 'rk-s2' : 'rk-s3';
}
