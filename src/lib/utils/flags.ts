import type { RaffleEntry } from '$lib/types';

export const FLAG_CODES: Record<string, string> = {
  algeria: 'dz',
  argentina: 'ar',
  australia: 'au',
  austria: 'at',
  belgium: 'be',
  'bosnia/herz': 'ba',
  'bosnia-herzegovina': 'ba',
  brazil: 'br',
  canada: 'ca',
  'cape verde': 'cv',
  'cape verde islands': 'cv',
  colombia: 'co',
  croatia: 'hr',
  czechia: 'cz',
  'czech republic': 'cz',
  "côte d'ivoire": 'ci',
  'ivory coast': 'ci',
  curaçao: 'cw',
  'dr congo': 'cd',
  'congo dr': 'cd',
  ecuador: 'ec',
  egypt: 'eg',
  england: 'gb-eng',
  france: 'fr',
  germany: 'de',
  ghana: 'gh',
  haiti: 'ht',
  iran: 'ir',
  iraq: 'iq',
  japan: 'jp',
  jordan: 'jo',
  'korea republic': 'kr',
  'south korea': 'kr',
  mexico: 'mx',
  morocco: 'ma',
  netherlands: 'nl',
  'new zealand': 'nz',
  norway: 'no',
  panama: 'pa',
  paraguay: 'py',
  portugal: 'pt',
  qatar: 'qa',
  'saudi arabia': 'sa',
  scotland: 'gb-sct',
  senegal: 'sn',
  'south africa': 'za',
  spain: 'es',
  sweden: 'se',
  switzerland: 'ch',
  tunisia: 'tn',
  turkey: 'tr',
  türkiye: 'tr',
  'united states': 'us',
  usa: 'us',
  uruguay: 'uy',
  uzbekistan: 'uz'
};

export type FlagEntry =
  | { team?: string; flag?: string; flagUrl?: string; api?: string }
  | null
  | undefined;

export function getFlagSrc(entry: FlagEntry): string | null {
  if (!entry) return null;
  if (entry.flagUrl) return entry.flagUrl;
  const key = (entry.api || entry.team || '').toLowerCase();
  const code = FLAG_CODES[key];
  return code ? `https://flagcdn.com/${code}.svg` : null;
}

export function getFlagEmoji(entry: FlagEntry): string {
  return entry?.flag || '🏳️';
}
