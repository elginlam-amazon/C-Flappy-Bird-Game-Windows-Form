import { useEffect, useState } from 'react';
import { getGameSettings } from './api';
import { Leaderboard } from './Leaderboard';
import { FlappyBirdGame } from './game/FlappyBirdGame';
import type { GameSettings } from './game/game';

export function App() {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [error, setError] = useState(false);
  const [leaderboardVersion, setLeaderboardVersion] = useState(0);

  useEffect(() => {
    getGameSettings()
      .then(setSettings)
      .catch(() => setError(true));
  }, []);

  return (
    <main className="app">
      <h1>Flappy Bird</h1>
      {error && <p role="alert">Could not load the game. Please refresh the page.</p>}
      {!error && !settings && <p>Loading…</p>}
      {settings && (
        <div className="layout">
          <FlappyBirdGame settings={settings} onScoreSubmitted={() => setLeaderboardVersion((v) => v + 1)} />
          <Leaderboard refreshKey={leaderboardVersion} />
        </div>
      )}
    </main>
  );
}
