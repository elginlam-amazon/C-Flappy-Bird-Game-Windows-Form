import { useEffect, useState, type CSSProperties } from 'react';
import birdImg from '../assets/bird.png';
import groundImg from '../assets/ground.png';
import pipeImg from '../assets/pipe.png';
import pipeDownImg from '../assets/pipedown.png';
import {
  BOARD,
  LAYOUT,
  birdRect,
  createInitialState,
  pipeBottomRect,
  pipeTopRect,
  setFlapping,
  tick,
  type GameSettings,
  type Rect,
} from './engine';
import './FlappyBirdGame.css';

interface Props {
  settings: GameSettings;
}

function boxStyle(rect: Rect): CSSProperties {
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}

export function FlappyBirdGame({ settings }: Props) {
  const [state, setState] = useState(() => createInitialState(settings));

  // Space held = fly up, released = fall (same as the original KeyDown/KeyUp handlers).
  useEffect(() => {
    const handleKey = (flapping: boolean) => (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault(); // stop the page from scrolling
      setState((s) => setFlapping(s, flapping));
    };
    const onDown = handleKey(true);
    const onUp = handleKey(false);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Game loop; stops once the game is over (original gameTimer.Stop()).
  useEffect(() => {
    if (state.gameOver) return;
    const id = window.setInterval(() => setState((s) => tick(s, settings)), settings.tickIntervalMs);
    return () => window.clearInterval(id);
  }, [settings, state.gameOver]);

  const scoreText = `Score: ${state.score}${state.gameOver ? ' Game over!!!' : ''}`;

  // Elements are rendered back-to-front to match the original WinForms z-order.
  return (
    <div className="board" style={{ width: BOARD.width, height: BOARD.height }}>
      <img className="sprite" src={pipeDownImg} alt="" style={boxStyle(pipeTopRect(state))} />
      <img className="sprite" src={pipeImg} alt="" style={boxStyle(pipeBottomRect(state))} />
      <img className="sprite" src={groundImg} alt="" style={boxStyle(LAYOUT.ground)} />
      <img className="sprite" src={birdImg} alt="Bird" style={boxStyle(birdRect(state))} />
      <div className="score" role="status" aria-live="polite" style={LAYOUT.scoreText}>
        {scoreText}
      </div>
    </div>
  );
}
