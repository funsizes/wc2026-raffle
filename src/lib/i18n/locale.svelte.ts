import { enUS } from './locales/en-US';
import { esUS } from './locales/es-US';
import { LOCALE_STORAGE_KEY, type Locale } from './types';

const dictionaries = {
  'en-US': enUS,
  'es-US': esUS
} as const;

const localeState = $state<{ value: Locale | null }>({ value: null });

export function initLocale(): void {
  if (typeof localStorage === 'undefined') return;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'en-US' || stored === 'es-US') {
    localeState.value = stored;
    applyDocumentLang(stored);
  }
}

export function setLocale(next: Locale): void {
  localeState.value = next;
  localStorage.setItem(LOCALE_STORAGE_KEY, next);
  applyDocumentLang(next);
}

export function hasLocale(): boolean {
  return localeState.value !== null;
}

export function getLocale(): Locale {
  return localeState.value ?? 'en-US';
}

function applyDocumentLang(next: Locale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
  }
}

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : undefined;
}

export function t(
  key: string,
  params?: Record<string, string | number>
): string {
  const active = localeState.value ?? 'en-US';
  let message =
    getNested(dictionaries[active], key) ??
    getNested(dictionaries['en-US'], key) ??
    key;

  if (params) {
    for (const [name, value] of Object.entries(params)) {
      message = message.replaceAll(`{${name}}`, String(value));
    }
  }

  return message;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(localeState.value ?? 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(date: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(localeState.value ?? 'en-US', options).format(
    new Date(date + 'T12:00:00')
  );
}

export function formatTime(isoDate: string): string {
  return new Intl.DateTimeFormat(localeState.value ?? 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(isoDate));
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat(localeState.value ?? 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date + 'T12:00:00'));
}

export function formatWeekdayDate(date: string): string {
  return new Intl.DateTimeFormat(localeState.value ?? 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date + 'T12:00:00'));
}

export function formatMonthDay(date: string): string {
  const [, month, day] = date.split('-');
  return (
    new Intl.DateTimeFormat(localeState.value ?? 'en-US', { month: 'short' }).format(
      new Date(2000, Number(month) - 1, 1)
    ) + ` ${Number(day)}`
  );
}
