import { useCallback, useEffect, useState, type FormEvent } from 'react';
import birdImg from '../assets/bird.png';
import groundImg from '../assets/ground.png';
import pipeImg from '../assets/pipe.png';
import pipeDownImg from '../assets/pipedown.png';
import { submitScore } from '../api';
import { FIELD_HEIGHT, FIELD_WIDTH, createInitialState, setFlapping, tick, type GameSettings, type Rect } from './game';

interface Props {
  settings: GameSettings;
  onScoreSubmitted: () => void;
}

function rectStyle(rect: Rect) {
  return { left: rect.x, top: rect.y, width: rect.width, height: rect.height };
}

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'BUTTON'].includes(target.tagName));
}

export function FlappyBirdGame({ settings, onScoreSubmitted }: Props) {
  const [state, setState] = useState(() => createInitialState(settings));
  const running = state.status === 'running';

  // Game timer (original gameTimer, Interval = 20ms).
  useEffect(() => {
    if (!running) {
      return;
    }
    const id = window.setInterval(() => setState((s) => tick(s, settings)), settings.tickIntervalMs);
    return () => window.clearInterval(id);
  }, [running, settings]);

  const flap = useCallback((flapping: boolean) => setState((s) => setFlapping(s, flapping, settings)), [settings]);

  // Space key held = fly up, released = fall (original KeyDown/KeyUp handlers).
  useEffect(() => {
    const handle = (flapping: boolean) => (event: KeyboardEvent) => {
      if (event.code !== 'Space' || isEditableTarget(event.target)) {
        return;
      }
      event.preventDefault(); // stop the page from scrolling
      flap(flapping);
    };
    const onKeyDown = handle(true);
    const onKeyUp = handle(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [flap]);

  const restart = () => setState(createInitialState(settings));

  return (
    <section className="game" aria-label="Flappy Bird game">
      <p className="instructions">Hold Space (or press and hold on the playfield) to fly up. Release to fall.</p>
      <div
        className="field"
        style={{ width: FIELD_WIDTH, height: FIELD_HEIGHT }}
        onPointerDown={() => flap(true)}
        onPointerUp={() => flap(false)}
        onPointerLeave={() => flap(false)}
      >
        {/* Back-to-front order matches the original form's control z-order. */}
        <img className="sprite" src={pipeDownImg} alt="" style={rectStyle(state.pipeTop)} draggable={false} />
        <img className="sprite" src={pipeImg} alt="" style={rectStyle(state.pipeBottom)} draggable={false} />
        <img className="sprite" src={groundImg} alt="" style={rectStyle(state.ground)} draggable={false} />
        <img className="sprite" src={birdImg} alt="Bird" style={rectStyle(state.bird)} draggable={false} />
        <div className="score" role="status" aria-live="polite">
          Score: {state.score}
          {!running && ' Game over!!!'}
        </div>
        {!running && <GameOverPanel score={state.score} onRestart={restart} onScoreSubmitted={onScoreSubmitted} />}
      </div>
    </section>
  );
}

interface GameOverPanelProps {
  score: number;
  onRestart: () => void;
  onScoreSubmitted: () => void;
}

function GameOverPanel({ score, onRestart, onScoreSubmitted }: GameOverPanelProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('saving');
    try {
      await submitScore(name.trim(), score);
      setStatus('saved');
      onScoreSubmitted();
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="game-over" role="dialog" aria-labelledby="game-over-title">
      <h2 id="game-over-title">Game over</h2>
      <p>You scored {score}.</p>
      {status === 'saved' ? (
        <p>Score saved!</p>
      ) : (
        <form onSubmit={onSubmit}>
          <label htmlFor="player-name">Your name</label>
          <input
            id="player-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            required
            autoFocus
          />
          <button type="submit" disabled={status === 'saving' || name.trim() === ''}>
            Save score
          </button>
          {status === 'error' && <p role="alert">Could not save your score. Please try again.</p>}
        </form>
      )}
      <button type="button" onClick={onRestart}>
        Play again
      </button>
    </div>
  );
}
