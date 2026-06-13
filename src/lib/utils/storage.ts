const APP_STORAGE_PREFIX = 'wc2026_';

export function clearAppLocalStorage(): number {
  const keys: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(APP_STORAGE_PREFIX)) keys.push(key);
  }

  keys.forEach((key) => localStorage.removeItem(key));

  return keys.length;
}
