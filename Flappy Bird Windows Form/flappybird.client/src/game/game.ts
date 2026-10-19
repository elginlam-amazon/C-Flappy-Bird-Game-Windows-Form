// Pure game logic ported from the original Windows Forms Form1.cs. No DOM or React here so it can be unit tested.

/** Gameplay tuning values served by the backend (GET /api/game/settings). */
export interface GameSettings {
  tickIntervalMs: number;
  pipeSpeed: number;
  fastPipeSpeed: number;
  speedUpAfterScore: number;
  gravity: number;
  flapStrength: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type GameStatus = 'running' | 'over';

export interface GameState {
  bird: Rect;
  pipeTop: Rect;
  pipeBottom: Rect;
  ground: Rect;
  score: number;
  pipeSpeed: number;
  /** Vertical movement of the bird per tick; negative while flapping. */
  velocity: number;
  status: GameStatus;
}

/** Playfield size: the original form's ClientSize. */
export const FIELD_WIDTH = 622;
export const FIELD_HEIGHT = 707;

// Pipe recycling thresholds and reset positions from the original gameTimerEvent.
const PIPE_BOTTOM_EXIT_X = -150;
const PIPE_BOTTOM_RESET_X = 800;
const PIPE_TOP_EXIT_X = -180;
const PIPE_TOP_RESET_X = 950;
/** The game ends if the bird flies higher than this. */
const CEILING_Y = -25;

/** Initial layout taken from Form1.Designer.cs. */
export function createInitialState(settings: GameSettings): GameState {
  return {
    bird: { x: 69, y: 228, width: 82, height: 69 },
    pipeTop: { x: 495, y: -59, width: 100, height: 266 },
    pipeBottom: { x: 362, y: 418, width: 109, height: 286 },
    ground: { x: -16, y: 633, width: 655, height: 126 },
    score: 0,
    pipeSpeed: settings.pipeSpeed,
    velocity: settings.gravity,
    status: 'running',
  };
}

/** Same semantics as System.Drawing.Rectangle.IntersectsWith (touching edges do not intersect). */
export function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

/** Space key down/up handling (gamekeyisdown / gamekeyisup). */
export function setFlapping(state: GameState, flapping: boolean, settings: GameSettings): GameState {
  if (state.status !== 'running') {
    return state;
  }
  return { ...state, velocity: flapping ? -settings.flapStrength : settings.gravity };
}

/** One game-timer tick (gameTimerEvent). */
export function tick(state: GameState, settings: GameSettings): GameState {
  if (state.status !== 'running') {
    return state;
  }

  const bird = { ...state.bird, y: state.bird.y + state.velocity };
  const pipeBottom = { ...state.pipeBottom, x: state.pipeBottom.x - state.pipeSpeed };
  const pipeTop = { ...state.pipeTop, x: state.pipeTop.x - state.pipeSpeed };
  let score = state.score;

  if (pipeBottom.x < PIPE_BOTTOM_EXIT_X) {
    pipeBottom.x = PIPE_BOTTOM_RESET_X;
    score++;
  }
  if (pipeTop.x < PIPE_TOP_EXIT_X) {
    pipeTop.x = PIPE_TOP_RESET_X;
    score++;
  }

  const crashed =
    intersects(bird, pipeBottom) || intersects(bird, pipeTop) || intersects(bird, state.ground) || bird.y < CEILING_Y;

  const pipeSpeed = score > settings.speedUpAfterScore ? settings.fastPipeSpeed : state.pipeSpeed;

  return {
    ...state,
    bird,
    pipeTop,
    pipeBottom,
    score,
    pipeSpeed,
    status: crashed ? 'over' : 'running',
  };
}
