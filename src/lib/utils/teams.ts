import { RAFFLE, RAFFLE2 } from '$lib/data/raffle';
import type { RaffleEntry } from '$lib/types';

export function sameTeam(apiName: string | null | undefined, raffleApi: string | null | undefined): boolean {
  if (!apiName || !raffleApi) return false;
  const a = apiName.toLowerCase().trim();
  const b = raffleApi.toLowerCase().trim();
  return a === b || a.includes(b) || b.includes(a);
}

export function findParticipant(
  teamName: string | null | undefined,
  raffle: RaffleEntry[] = RAFFLE
): RaffleEntry | undefined {
  return raffle.find((r) => sameTeam(teamName, r.api));
}

