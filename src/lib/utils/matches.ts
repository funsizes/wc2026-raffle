import type { Match } from '$lib/types';
import { t } from '$lib/i18n/locale.svelte';

const LEGACY_BUCKET = 'https://wc2026-raffle-assets.s3.us-east-1.amazonaws.com';
const WCSORTEO2026_BUCKET = 'https://wcsorteo2026-assets.s3.us-east-1.amazonaws.com';

export const MATCHES_URL_FULL = `${LEGACY_BUCKET}/matches.json`;
export const MATCHES_URL_SLIM = `${LEGACY_BUCKET}/matches-slim.json`;
export const MATCHES_URL_FULL_WCSORTEO2026 = `${WCSORTEO2026_BUCKET}/matches.json`;
export const MATCHES_URL_SLIM_WCSORTEO2026 = `${WCSORTEO2026_BUCKET}/matches-slim.json`;

const MATCHES_SOURCE_STORAGE_KEY = 'wc2026_matches_source';
const MATCHES_BUCKET_STORAGE_KEY = 'wc2026_matches_bucket';
const MATCHES_BUCKET_MIGRATION_KEY = 'wc2026_matches_bucket_v2';

export type MatchesUrlOption = 'full' | 'slim';
export type MatchesBucketOption = 'legacy' | 'wcsorteo2026';

const DEFAULT_MATCHES_BUCKET: MatchesBucketOption = 'wcsorteo2026';

function resolveMatchesUrlOption(stored: string | null): MatchesUrlOption {
  if (stored === 'slim' || stored === 'full') {
    return stored;
  }

  return 'slim';
}

function resolveMatchesBucketOption(stored: string | null): MatchesBucketOption {
  if (stored === 'wcsorteo2026' || stored === 'legacy') {
    return stored;
  }

  return DEFAULT_MATCHES_BUCKET;
}

/** One-time migration: move legacy default / explicit legacy users to wcsorteo2026. */
export function migrateMatchesBucketOption(): void {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem(MATCHES_BUCKET_MIGRATION_KEY)) return;

  const stored = localStorage.getItem(MATCHES_BUCKET_STORAGE_KEY);
  if (stored !== 'wcsorteo2026') {
    localStorage.setItem(MATCHES_BUCKET_STORAGE_KEY, 'wcsorteo2026');
  }

  localStorage.setItem(MATCHES_BUCKET_MIGRATION_KEY, '1');
}

export function getMatchesUrlOption(): MatchesUrlOption {
  if (typeof localStorage === 'undefined') return 'slim';

  const stored =
    localStorage.getItem(MATCHES_SOURCE_STORAGE_KEY) ??
    localStorage.getItem('wc2026_matches_url');

  return resolveMatchesUrlOption(stored);
}

export function getMatchesBucketOption(): MatchesBucketOption {
  if (typeof localStorage === 'undefined') return DEFAULT_MATCHES_BUCKET;

  return resolveMatchesBucketOption(localStorage.getItem(MATCHES_BUCKET_STORAGE_KEY));
}

export function getMatchesUrl(): string {
  const bucket = getMatchesBucketOption();
  const source = getMatchesUrlOption();

  if (bucket === 'wcsorteo2026') {
    return source === 'slim' ? MATCHES_URL_SLIM_WCSORTEO2026 : MATCHES_URL_FULL_WCSORTEO2026;
  }

  return source === 'slim' ? MATCHES_URL_SLIM : MATCHES_URL_FULL;
}

export function setMatchesUrlOption(option: MatchesUrlOption): void {
  localStorage.setItem(MATCHES_SOURCE_STORAGE_KEY, option);
}

export function setMatchesBucketOption(option: MatchesBucketOption): void {
  localStorage.setItem(MATCHES_BUCKET_STORAGE_KEY, option);
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

export function matchLocalDate(utcDate: string): string {
  return localDateKey(new Date(utcDate));
}

/** Estimated elapsed time from kickoff until a result affects standings (minutes). */
export const MATCH_RESULT_DURATION_MIN = 105;

/** When a finished match is treated as affecting standings (kickoff + estimated duration). */
export function matchEffectiveEndMs(match: Match): number {
  return new Date(match.utcDate).getTime() + MATCH_RESULT_DURATION_MIN * 60_000;
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

export function groupLetter(group: string | null | undefined): string | null {
  if (!group) return null;

  const match = /^GROUP_([A-Z]+)$/i.exec(group);
  return match ? match[1] : null;
}

export function getMatchStageLabel(match: Pick<Match, 'stage' | 'group'>): string {
  if (match.stage === 'GROUP_STAGE') {
    const letter = groupLetter(match.group);

    if (letter) return t('stage.groupLabel', { letter });
  }

  const key = `stage.${match.stage}`;
  const label = t(key);

  return label === key ? match.stage : label;
}
