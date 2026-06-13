import type { RaffleEntry } from '$lib/types';

export type RaffleGroup = 'g1' | 'g2';

export const RAFFLE_LABEL = 'Main Group (30)';
export const RAFFLE2_LABEL = "Gaby's Group (21)";

export const RAFFLE_GROUP_OPTIONS: { id: RaffleGroup; label: string }[] = [
  { id: 'g1', label: `🏆 Luis' Group` },
  { id: 'g2', label: `🏆 Gaby's Group` }
];

export const RAFFLE: RaffleEntry[] = [
  { pick: 1, name: 'Oscar', team: 'Croatia', flag: '🇭🇷', api: 'Croatia' },
  { pick: 2, name: 'Krystie', team: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', flagUrl: 'https://flagcdn.com/gb-eng.svg', api: 'England' },
  { pick: 3, name: 'Andrea', team: 'Belgium', flag: '🇧🇪', api: 'Belgium' },
  { pick: 4, name: 'Celine', team: 'Mexico', flag: '🇲🇽', api: 'Mexico' },
  { pick: 5, name: 'Gerardo', team: 'Germany', flag: '🇩🇪', api: 'Germany' },
  { pick: 6, name: 'Carlos', team: 'Senegal', flag: '🇸🇳', api: 'Senegal' },
  { pick: 7, name: 'Wesley V', team: 'USA', flag: '🇺🇸', api: 'United States' },
  { pick: 8, name: 'Sofia', team: 'Japan', flag: '🇯🇵', api: 'Japan' },
  { pick: 9, name: 'Valentina', team: 'Australia', flag: '🇦🇺', api: 'Australia' },
  { pick: 10, name: 'Anthony', team: 'Morocco', flag: '🇲🇦', api: 'Morocco' },
  { pick: 11, name: 'Fernando', team: 'Austria', flag: '🇦🇹', api: 'Austria' },
  { pick: 12, name: 'Guillermo', team: 'Portugal', flag: '🇵🇹', api: 'Portugal' },
  { pick: 13, name: 'Berto', team: 'Algeria', flag: '🇩🇿', api: 'Algeria' },
  { pick: 14, name: 'David', team: 'Uruguay', flag: '🇺🇾', api: 'Uruguay' },
  { pick: 15, name: 'Gaby', team: 'Argentina', flag: '🇦🇷', api: 'Argentina' },
  { pick: 16, name: 'Pocho', team: 'Switzerland', flag: '🇨🇭', api: 'Switzerland' },
  { pick: 17, name: 'Anderson', team: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', flagUrl: 'https://flagcdn.com/gb-sct.svg', api: 'Scotland' },
  { pick: 18, name: 'Mariale', team: 'Netherlands', flag: '🇳🇱', api: 'Netherlands' },
  { pick: 19, name: 'Abraham', team: 'Canada', flag: '🇨🇦', api: 'Canada' },
  { pick: 20, name: 'Luis M', team: 'Turkey', flag: '🇹🇷', api: 'Turkey' },
  { pick: 21, name: 'Angela', team: 'Colombia', flag: '🇨🇴', api: 'Colombia' },
  { pick: 22, name: 'Jacky', team: 'Paraguay', flag: '🇵🇾', api: 'Paraguay' },
  { pick: 23, name: 'Edwin', team: 'Norway', flag: '🇳🇴', api: 'Norway' },
  { pick: 24, name: 'Wesley C', team: 'Iran', flag: '🇮🇷', api: 'Iran' },
  { pick: 25, name: 'Pacho', team: 'S. Korea', flag: '🇰🇷', api: 'South Korea' },
  { pick: 26, name: 'Mauro', team: 'Egypt', flag: '🇪🇬', api: 'Egypt' },
  { pick: 27, name: 'Diana', team: 'Brazil', flag: '🇧🇷', api: 'Brazil' },
  { pick: 28, name: 'Betty', team: 'France', flag: '🇫🇷', api: 'France' },
  { pick: 29, name: 'Andres', team: 'Ecuador', flag: '🇪🇨', api: 'Ecuador' },
  { pick: 30, name: 'Ivan', team: 'Spain', flag: '🇪🇸', api: 'Spain' }
];

export const RAFFLE2: RaffleEntry[] = [
  { pick: 1, name: 'Gaby', team: 'France', flag: '🇫🇷', api: 'France' },
  { pick: 2, name: 'Marianna', team: 'Brazil', flag: '🇧🇷', api: 'Brazil' },
  { pick: 3, name: 'Sosciore', team: 'Ivory Coast', flag: '🇨🇮', api: 'Ivory Coast' },
  { pick: 4, name: 'Mateo', team: 'Iran', flag: '🇮🇷', api: 'Iran' },
  { pick: 5, name: 'Andres', team: 'Portugal', flag: '🇵🇹', api: 'Portugal' },
  { pick: 6, name: 'Daniela', team: 'Uruguay', flag: '🇺🇾', api: 'Uruguay' },
  { pick: 7, name: 'Andrea', team: 'Morocco', flag: '🇲🇦', api: 'Morocco' },
  { pick: 8, name: 'Luis', team: 'Argentina', flag: '🇦🇷', api: 'Argentina' },
  { pick: 9, name: 'David', team: 'Switzerland', flag: '🇨🇭', api: 'Switzerland' },
  { pick: 10, name: 'Joseph', team: 'Germany', flag: '🇩🇪', api: 'Germany' },
  { pick: 11, name: 'Antonieta', team: 'USA', flag: '🇺🇸', api: 'United States' },
  { pick: 12, name: 'Aquiles', team: 'Mexico', flag: '🇲🇽', api: 'Mexico' },
  { pick: 13, name: 'Ramon', team: 'Canada', flag: '🇨🇦', api: 'Canada' },
  { pick: 14, name: 'Vanessa', team: 'S. Korea', flag: '🇰🇷', api: 'South Korea' },
  { pick: 15, name: 'Teresa', team: 'Turkey', flag: '🇹🇷', api: 'Turkey' },
  { pick: 16, name: 'Camila', team: 'Colombia', flag: '🇨🇴', api: 'Colombia' },
  { pick: 17, name: 'Mariangel', team: 'Netherlands', flag: '🇳🇱', api: 'Netherlands' },
  { pick: 18, name: 'Pilar', team: 'Paraguay', flag: '🇵🇾', api: 'Paraguay' },
  { pick: 19, name: 'Raquel', team: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', flagUrl: 'https://flagcdn.com/gb-eng.svg', api: 'England' },
  { pick: 20, name: 'Alicia', team: 'Algeria', flag: '🇩🇿', api: 'Algeria' },
  { pick: 21, name: 'Carlos', team: 'Norway', flag: '🇳🇴', api: 'Norway' }
];

export const STAGE_ORDER = [
  'GROUP_STAGE',
  'LAST_32',
  'LAST_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'THIRD_PLACE',
  'FINAL'
] as const;

export const STAGE_LABEL: Record<string, string> = {
  GROUP_STAGE: 'Group Stage',
  LAST_32: 'Round of 32',
  LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarterfinals',
  SEMI_FINALS: 'Semifinals',
  THIRD_PLACE: '3rd Place',
  FINAL: 'Final'
};
