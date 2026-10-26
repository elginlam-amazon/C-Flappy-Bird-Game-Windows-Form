import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const settings = { pipeSpeed: 8, fastPipeSpeed: 15, speedUpScore: 5, gravity: 15, flapStrength: 15, tickIntervalMs: 20 };

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('App', () => {
  it('loads settings from the backend and runs the game until the bird hits the ground', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(settings), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    // Only fake the game loop timer so the settings fetch promise still resolves normally.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });

    render(<App />);
    expect(await screen.findByRole('status')).toHaveProperty('textContent', 'Score: 0');
    expect(fetchMock).toHaveBeenCalledWith('/api/game/settings', expect.anything());

    // With no input the bird falls 15px per 20ms tick and reaches the ground within ~2s.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole('status').textContent).toMatch(/Game over!!!$/);
  });

  it('shows an error when settings cannot be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));
    render(<App />);
    expect((await screen.findByRole('alert')).textContent).toContain('HTTP 500');
  });
});
