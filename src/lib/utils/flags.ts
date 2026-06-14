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

export type FlagFormat = 'png' | 'webp';

/** Standard 4:3 flag boxes from flagcdn — every flag is the same pixel size. */
export const FLAG_BOX_SIZES = {
  sm: { width: 24, height: 18 },
  md: { width: 40, height: 30 },
  lg: { width: 48, height: 36 }
} as const;

export interface FlagSrcOptions {
  /** Fixed height (h{N}). Default — matches CSS that constrains flag height. */
  height?: number;
  /** Fixed width (w{N}). Width is uniform; height still varies by flag. */
  width?: number;
  /** Fixed width×height (e.g. 40x30) — same size for every flag. */
  boxWidth?: number;
  boxHeight?: number;
  format?: FlagFormat;
  /** Vector flag instead of fixed-dimension bitmap. */
  svg?: boolean;
}

const DEFAULT_FLAG_HEIGHT = 24;

export function getFlagCode(entry: FlagEntry): string | null {
  if (!entry) return null;
  const key = (entry.api || entry.team || '').toLowerCase();
  return FLAG_CODES[key] ?? null;
}

/** CSS class for flag-icons — e.g. `fi-gb-eng`. See https://flagicons.lipis.dev/ */
export function getFlagIconClass(entry: FlagEntry): string | null {
  const code = getFlagCode(entry);
  return code ? `fi-${code}` : null;
}

export function getFlagSrc(entry: FlagEntry, options: FlagSrcOptions = {}): string | null {
  const code = getFlagCode(entry);
  if (code) {
    const {
      height = DEFAULT_FLAG_HEIGHT,
      width,
      boxWidth,
      boxHeight,
      format = 'png',
      svg = false
    } = options;

    if (svg) return `https://flagcdn.com/${code}.svg`;
    if (boxWidth != null && boxHeight != null) {
      return `https://flagcdn.com/${boxWidth}x${boxHeight}/${code}.${format}`;
    }
    if (width != null) return `https://flagcdn.com/w${width}/${code}.${format}`;
    return `https://flagcdn.com/h${height}/${code}.${format}`;
  }

  return entry?.flagUrl ?? null;
}

export function getFlagEmoji(entry: FlagEntry): string {
  return entry?.flag || '🏳️';
}
