import { describe, expect, it } from 'vitest';
import { createInitialState, intersects, setFlapping, tick, type GameSettings, type GameState } from './game';

const settings: GameSettings = {
  tickIntervalMs: 20,
  pipeSpeed: 8,
  fastPipeSpeed: 15,
  speedUpAfterScore: 5,
  gravity: 15,
  flapStrength: 15,
};

/** A state with the bird parked safely in open sky, away from pipes and ground. */
function safeState(overrides: Partial<GameState> = {}): GameState {
  const initial = createInitialState(settings);
  return {
    ...initial,
    bird: { ...initial.bird, x: 0, y: 300 },
    pipeTop: { ...initial.pipeTop, x: 400 },
    pipeBottom: { ...initial.pipeBottom, x: 400 },
    ...overrides,
  };
}

describe('intersects', () => {
  it('matches Rectangle.IntersectsWith: overlapping rects intersect, touching edges do not', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    expect(intersects(a, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
    expect(intersects(a, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
  });
});

describe('tick', () => {
  it('moves the bird by its velocity and the pipes left by the pipe speed', () => {
    const next = tick(safeState(), settings);
    expect(next.bird.y).toBe(315);
    expect(next.pipeTop.x).toBe(392);
    expect(next.pipeBottom.x).toBe(392);
    expect(next.status).toBe('running');
  });

  it('recycles each pipe once it leaves the screen and scores a point per pipe', () => {
    const state = safeState({
      pipeBottom: { ...safeState().pipeBottom, x: -145 },
      pipeTop: { ...safeState().pipeTop, x: -175 },
    });
    const next = tick(state, settings);
    expect(next.pipeBottom.x).toBe(800);
    expect(next.pipeTop.x).toBe(950);
    expect(next.score).toBe(2);
  });

  it('speeds up the pipes once the score exceeds the threshold', () => {
    const state = safeState({ score: 5, pipeBottom: { ...safeState().pipeBottom, x: -145 } });
    expect(tick(state, settings).pipeSpeed).toBe(15);
    expect(tick(safeState({ score: 5 }), settings).pipeSpeed).toBe(8);
  });

  it('ends the game when the bird hits the ground', () => {
    const state = safeState({ bird: { ...safeState().bird, y: 560 } });
    expect(tick(state, settings).status).toBe('over');
  });

  it('ends the game when the bird hits a pipe', () => {
    const state = safeState({ bird: { ...safeState().bird, x: 400, y: 100 } });
    expect(tick(state, settings).status).toBe('over');
  });

  it('ends the game when the bird flies off the top', () => {
    const state = safeState({ bird: { ...safeState().bird, y: -15 }, velocity: -15 });
    expect(tick(state, settings).status).toBe('over');
  });

  it('does nothing once the game is over', () => {
    const over = safeState({ status: 'over' });
    expect(tick(over, settings)).toBe(over);
  });
});

describe('setFlapping', () => {
  it('makes the bird rise while flapping and fall when released', () => {
    const flapping = setFlapping(safeState(), true, settings);
    expect(flapping.velocity).toBe(-15);
    expect(setFlapping(flapping, false, settings).velocity).toBe(15);
  });
});
