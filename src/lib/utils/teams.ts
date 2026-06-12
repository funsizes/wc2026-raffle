import { RAFFLE, RAFFLE2 } from '$lib/data/raffle';
import type { RaffleEntry } from '$lib/types';

export function sameTeam(apiName: string | undefined, raffleApi: string | undefined): boolean {
  if (!apiName || !raffleApi) return false;
  const a = apiName.toLowerCase().trim();
  const b = raffleApi.toLowerCase().trim();
  return a === b || a.includes(b) || b.includes(a);
}

export function findParticipant(teamName: string, raffle: RaffleEntry[] = RAFFLE): RaffleEntry | undefined {
  return raffle.find((r) => sameTeam(teamName, r.api));
}

export function findOwners(teamName: string): string[] {
  const owners: string[] = [];
  for (const r of RAFFLE) if (sameTeam(teamName, r.api)) owners.push(r.name + ' (G1)');
  for (const r of RAFFLE2) if (sameTeam(teamName, r.api)) owners.push(r.name + ' (G2)');
  return owners;
}
