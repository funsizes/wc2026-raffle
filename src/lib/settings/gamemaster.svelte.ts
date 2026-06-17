const SHOW_MATCH_TIME_STORAGE_KEY = 'wc2026_show_match_time';

function readShowMatchTime(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(SHOW_MATCH_TIME_STORAGE_KEY) === 'true';
}

const gameMasterState = $state({
  open: false,
  showMatchTime: readShowMatchTime()
});

export function openGameMaster(): void {
  gameMasterState.open = true;
}

export function closeGameMaster(): void {
  gameMasterState.open = false;
}

export function isGameMasterOpen(): boolean {
  return gameMasterState.open;
}

export function isShowMatchTimeEnabled(): boolean {
  return gameMasterState.showMatchTime;
}

export function setShowMatchTime(enabled: boolean): void {
  gameMasterState.showMatchTime = enabled;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SHOW_MATCH_TIME_STORAGE_KEY, String(enabled));
  }
}
