import type { GameSettings } from './game/game';

export interface ScoreEntry {
  playerName: string;
  score: number;
  achievedAt: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getGameSettings(): Promise<GameSettings> {
  return request<GameSettings>('/api/game/settings');
}

export function getTopScores(top = 10): Promise<ScoreEntry[]> {
  return request<ScoreEntry[]>(`/api/scores?top=${top}`);
}

export function submitScore(playerName: string, score: number): Promise<ScoreEntry> {
  return request<ScoreEntry>('/api/scores', {
    method: 'POST',
    body: JSON.stringify({ playerName, score }),
  });
}
