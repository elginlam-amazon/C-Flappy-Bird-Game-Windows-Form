import { useEffect, useState } from 'react';
import { getTopScores, type ScoreEntry } from './api';

interface Props {
  /** Change this value to reload the leaderboard. */
  refreshKey: number;
}

export function Leaderboard({ refreshKey }: Props) {
  const [scores, setScores] = useState<ScoreEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTopScores()
      .then((result) => {
        if (!cancelled) {
          setScores(result);
          setError(false);
        }
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <aside className="leaderboard" aria-labelledby="leaderboard-title">
      <h2 id="leaderboard-title">High scores</h2>
      {error && <p role="alert">Could not load high scores.</p>}
      {!error && scores === null && <p>Loading…</p>}
      {scores && scores.length === 0 && <p>No scores yet. Be the first!</p>}
      {scores && scores.length > 0 && (
        <ol>
          {scores.map((entry, index) => (
            <li key={`${entry.achievedAt}-${index}`}>
              <span className="name">{entry.playerName}</span> <span className="points">{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
