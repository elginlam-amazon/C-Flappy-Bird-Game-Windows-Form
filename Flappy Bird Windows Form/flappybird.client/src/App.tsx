import { useEffect, useState } from 'react';
import { fetchGameSettings } from './api/gameSettings';
import { FlappyBirdGame } from './game/FlappyBirdGame';
import type { GameSettings } from './game/engine';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; settings: GameSettings };

export default function App() {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    fetchGameSettings(controller.signal)
      .then((settings) => setLoad({ status: 'ready', settings }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setLoad({ status: 'error', message: err instanceof Error ? err.message : String(err) });
      });
    return () => controller.abort();
  }, []);

  if (load.status === 'loading') return <p>Loading…</p>;
  if (load.status === 'error') return <p role="alert">{load.message}</p>;
  return <FlappyBirdGame settings={load.settings} />;
}
