import { describe, expect, it } from 'vitest';
import { LAYOUT, createInitialState, intersects, setFlapping, tick, type GameSettings, type GameState } from './engine';

const settings: GameSettings = {
  pipeSpeed: 8,
  fastPipeSpeed: 15,
  speedUpScore: 5,
  gravity: 15,
  flapStrength: 15,
  tickIntervalMs: 20,
};

// A state where the bird is safely away from pipes and ground, to isolate one rule at a time.
function safeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(settings), birdTop: 300, pipeTopLeft: 400, pipeBottomLeft: 400, ...overrides };
}

describe('engine', () => {
  it('starts from the original designer layout', () => {
    const s = createInitialState(settings);
    expect(s).toMatchObject({ birdTop: 228, pipeTopLeft: 495, pipeBottomLeft: 362, score: 0, pipeSpeed: 8, gameOver: false });
  });

  it('applies gravity and moves pipes left each tick', () => {
    const next = tick(safeState(), settings);
    expect(next.birdTop).toBe(315);
    expect(next.pipeTopLeft).toBe(392);
    expect(next.pipeBottomLeft).toBe(392);
    expect(next.gameOver).toBe(false);
  });

  it('moves the bird up while flapping', () => {
    const next = tick(setFlapping(safeState(), true), settings);
    expect(next.birdTop).toBe(285);
  });

  it('recycles pipes past their exit threshold and scores each one', () => {
    const next = tick(safeState({ pipeBottomLeft: -145, pipeTopLeft: -175 }), settings);
    expect(next.pipeBottomLeft).toBe(800);
    expect(next.pipeTopLeft).toBe(950);
    expect(next.score).toBe(2);
  });

  it('does not recycle a pipe exactly at the threshold', () => {
    const next = tick(safeState({ pipeBottomLeft: -142, pipeTopLeft: -172 }), settings);
    expect(next.pipeBottomLeft).toBe(-150);
    expect(next.pipeTopLeft).toBe(-180);
    expect(next.score).toBe(0);
  });

  it('switches to the fast pipe speed once score exceeds the threshold', () => {
    expect(tick(safeState({ score: 5 }), settings).pipeSpeed).toBe(8);
    expect(tick(safeState({ score: 6 }), settings).pipeSpeed).toBe(15);
  });

  it('ends the game when the bird hits the ground', () => {
    const next = tick(safeState({ birdTop: LAYOUT.ground.top - LAYOUT.bird.height }), settings);
    expect(next.gameOver).toBe(true);
  });

  it('ends the game when the bird hits a pipe', () => {
    const next = tick(safeState({ pipeBottomLeft: LAYOUT.bird.left + 8, birdTop: 400 }), settings);
    expect(next.gameOver).toBe(true);
  });

  it('ends the game when the bird flies above the screen', () => {
    const next = tick(setFlapping(safeState({ birdTop: -15 }), true), settings);
    expect(next.birdTop).toBe(-30);
    expect(next.gameOver).toBe(true);
  });

  it('does not advance after game over', () => {
    const over = safeState({ gameOver: true });
    expect(tick(over, settings)).toBe(over);
  });

  it('treats touching edges as non-intersecting, like Rectangle.IntersectsWith', () => {
    const a = { left: 0, top: 0, width: 10, height: 10 };
    expect(intersects(a, { left: 10, top: 0, width: 10, height: 10 })).toBe(false);
    expect(intersects(a, { left: 9, top: 9, width: 10, height: 10 })).toBe(true);
  });
});
