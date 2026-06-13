const gameMasterState = $state({ open: false });

export function openGameMaster(): void {
  gameMasterState.open = true;
}

export function closeGameMaster(): void {
  gameMasterState.open = false;
}

export function isGameMasterOpen(): boolean {
  return gameMasterState.open;
}
