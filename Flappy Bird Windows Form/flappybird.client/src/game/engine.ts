// Pure game logic ported from the original WinForms Form1.cs (MOO ICT Flappy Bird tutorial).
// Coordinates and sizes come from the original Form1.Designer.cs layout.

export interface GameSettings {
  pipeSpeed: number;
  fastPipeSpeed: number;
  speedUpScore: number;
  gravity: number;
  flapStrength: number;
  tickIntervalMs: number;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const BOARD = { width: 622, height: 707 } as const;

export const LAYOUT = {
  bird: { left: 69, top: 228, width: 82, height: 69 },
  pipeTop: { left: 495, top: -59, width: 100, height: 266 },
  pipeBottom: { left: 362, top: 418, width: 109, height: 286 },
  ground: { left: -16, top: 633, width: 655, height: 126 },
  scoreText: { left: 181, top: 661 },
} as const;

// Pipe recycling thresholds and reset positions from the original game loop.
const PIPE_BOTTOM_EXIT = -150;
const PIPE_BOTTOM_RESET = 800;
const PIPE_TOP_EXIT = -180;
const PIPE_TOP_RESET = 950;
// The bird may leave the top of the screen by this many pixels before the game ends.
const BIRD_MIN_TOP = -25;

export interface GameState {
  birdTop: number;
  pipeTopLeft: number;
  pipeBottomLeft: number;
  score: number;
  pipeSpeed: number;
  flapping: boolean;
  gameOver: boolean;
}

export function createInitialState(settings: GameSettings): GameState {
  return {
    birdTop: LAYOUT.bird.top,
    pipeTopLeft: LAYOUT.pipeTop.left,
    pipeBottomLeft: LAYOUT.pipeBottom.left,
    score: 0,
    pipeSpeed: settings.pipeSpeed,
    flapping: false,
    gameOver: false,
  };
}

/** Same semantics as System.Drawing.Rectangle.IntersectsWith (edges touching do not intersect). */
export function intersects(a: Rect, b: Rect): boolean {
  return (
    a.left < b.left + b.width &&
    b.left < a.left + a.width &&
    a.top < b.top + b.height &&
    b.top < a.top + a.height
  );
}

export function birdRect(state: GameState): Rect {
  return { ...LAYOUT.bird, top: state.birdTop };
}

export function pipeTopRect(state: GameState): Rect {
  return { ...LAYOUT.pipeTop, left: state.pipeTopLeft };
}

export function pipeBottomRect(state: GameState): Rect {
  return { ...LAYOUT.pipeBottom, left: state.pipeBottomLeft };
}

export function setFlapping(state: GameState, flapping: boolean): GameState {
  return state.flapping === flapping ? state : { ...state, flapping };
}

/** Advances the game by one timer tick. */
export function tick(state: GameState, settings: GameSettings): GameState {
  if (state.gameOver) {
    return state;
  }

  const velocity = state.flapping ? -settings.flapStrength : settings.gravity;
  let { score } = state;
  let pipeBottomLeft = state.pipeBottomLeft - state.pipeSpeed;
  let pipeTopLeft = state.pipeTopLeft - state.pipeSpeed;
  const birdTop = state.birdTop + velocity;

  if (pipeBottomLeft < PIPE_BOTTOM_EXIT) {
    pipeBottomLeft = PIPE_BOTTOM_RESET;
    score++;
  }
  if (pipeTopLeft < PIPE_TOP_EXIT) {
    pipeTopLeft = PIPE_TOP_RESET;
    score++;
  }

  const next: GameState = {
    ...state,
    birdTop,
    pipeBottomLeft,
    pipeTopLeft,
    score,
    pipeSpeed: score > settings.speedUpScore ? settings.fastPipeSpeed : state.pipeSpeed,
  };

  const bird = birdRect(next);
  next.gameOver =
    intersects(bird, pipeBottomRect(next)) ||
    intersects(bird, pipeTopRect(next)) ||
    intersects(bird, LAYOUT.ground) ||
    birdTop < BIRD_MIN_TOP;

  return next;
}
