import type { GameSettings } from '../game/engine';

export async function fetchGameSettings(signal?: AbortSignal): Promise<GameSettings> {
  const response = await fetch('/api/game/settings', { signal });
  if (!response.ok) {
    throw new Error(`Failed to load game settings (HTTP ${response.status})`);
  }
  return (await response.json()) as GameSettings;
}
