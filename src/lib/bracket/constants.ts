export const ROOT = 104;

export const CHILDREN: Record<number, [number, number]> = {
  89: [74, 77],
  90: [73, 75],
  91: [76, 78],
  92: [79, 80],
  93: [83, 84],
  94: [81, 82],
  95: [86, 88],
  96: [85, 87],
  97: [89, 90],
  98: [93, 94],
  99: [91, 92],
  100: [95, 96],
  101: [97, 98],
  102: [99, 100],
  104: [101, 102]
};

export const R32_NUMS = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88];
export const R32SET = new Set(R32_NUMS);

export const NODE_NUMS = [
  ...R32_NUMS,
  89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 104
];

export const PARENT: Record<number, number> = {};
for (const [p, kids] of Object.entries(CHILDREN)) {
  for (const c of kids) PARENT[c] = +p;
}

export const STADIUM: Record<string, string> = {
  Atlanta: 'Atlanta',
  'Boston (Foxborough)': 'Boston',
  'Dallas (Arlington)': 'Dallas',
  'Guadalajara (Zapopan)': 'Guadalajara',
  Houston: 'Houston',
  'Kansas City': 'Kansas City',
  'Los Angeles (Inglewood)': 'Los Angeles',
  'Mexico City': 'Mexico City',
  'Miami (Miami Gardens)': 'Miami',
  'Monterrey (Guadalupe)': 'Monterrey',
  'New York/New Jersey (East Rutherford)': 'New York/New Jersey',
  Philadelphia: 'Philadelphia',
  'San Francisco Bay Area (Santa Clara)': 'San Francisco',
  Seattle: 'Seattle',
  Toronto: 'Toronto',
  Vancouver: 'Vancouver'
};

export const NATION: Record<string, 'mx' | 'us' | 'ca'> = {
  Atlanta: 'us',
  'Boston (Foxborough)': 'us',
  'Dallas (Arlington)': 'us',
  'Guadalajara (Zapopan)': 'mx',
  Houston: 'us',
  'Kansas City': 'us',
  'Los Angeles (Inglewood)': 'us',
  'Mexico City': 'mx',
  'Miami (Miami Gardens)': 'us',
  'Monterrey (Guadalupe)': 'mx',
  'New York/New Jersey (East Rutherford)': 'us',
  Philadelphia: 'us',
  'San Francisco Bay Area (Santa Clara)': 'us',
  Seattle: 'us',
  Toronto: 'ca',
  Vancouver: 'ca'
};

export function venueLabel(ground: string): string {
  return ground ? (STADIUM[ground] ?? ground) : '';
}

export function nationClass(ground: string): '' | 'mx' | 'us' | 'ca' {
  return NATION[ground] ?? '';
}

export function levelOf(num: number): number {
  if (R32SET.has(num)) return 1;
  if (num >= 89 && num <= 96) return 2;
  if (num >= 97 && num <= 100) return 3;
  if (num >= 101 && num <= 102) return 4;
  return 5;
}

export const LIVE_MS = 150 * 60_000;
export const SOON_MS = 120 * 60_000;
