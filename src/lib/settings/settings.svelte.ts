const settingsState = $state({ open: false });

export function openSettings(): void {
  settingsState.open = true;
}

export function closeSettings(): void {
  settingsState.open = false;
}

export function isSettingsOpen(): boolean {
  return settingsState.open;
}
