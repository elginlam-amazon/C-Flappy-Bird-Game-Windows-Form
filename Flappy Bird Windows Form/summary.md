# Migration summary: Flappy Bird WinForms → React (TypeScript, Vite) + ASP.NET Core (net10.0)

## Structure
- `flappybird.client/`: React 19 + TypeScript + Vite 5 SPA.
  - `src/game/engine.ts`: pure port of the `Form1.cs` game loop (gravity/flap, pipe movement and recycling at -150/-180 → 800/950, scoring, speed-up after score 5, `Rectangle.IntersectsWith` collision, top-of-screen limit). Layout constants are taken from `Form1.Designer.cs`.
  - `src/game/FlappyBirdGame.tsx`: renders the 622x707 board with the original sprites and z-order. Holding Space flies up and releasing it falls. A 20 ms interval replaces the WinForms `Timer`.
  - `src/assets/`: the original PNGs, moved from `Resources/`.
- `FlappyBird.Server/`: ASP.NET Core minimal API.
  - `GET /api/game/settings` returns the game tuning values from the `Game` config section in `appsettings.json`, so they can be overridden per environment. Values are validated at startup.
  - Serves the built SPA from `wwwroot` with an `index.html` fallback. Unknown `/api/*` routes return 404.
  - `dotnet publish` runs `npm ci && npm run build` and includes the bundle.
- `FlappyBird.Server.Tests/`: xUnit + `WebApplicationFactory` endpoint tests.
- The WinForms project has been removed. The solution is renamed to `FlappyBird.sln`.

## Run
- Dev: `dotnet run --project FlappyBird.Server --launch-profile http` (port 5080), then `npm run dev` in `flappybird.client` (port 5173, proxies `/api` to the backend; override with `VITE_API_PROXY_TARGET`).
- Prod: `dotnet publish FlappyBird.Server -c Release`.
- Tests: `dotnet test FlappyBird.sln` and `npm test` in `flappybird.client`.

## Result
- `dotnet build`: 0 errors, 0 warnings. `dotnet test`: 5/5 passing. `npm test`: 13/13 passing. `npm run build` and `dotnet publish` succeed.

## Behaviour notes
- The score label shows the current score. The original assigned the label text before scoring on the same tick, so on game over it could show one point less.
- As in the original, the game does not restart. Reload the page to play again.

## Next steps
- The API has no authentication. It only exposes read-only, non-sensitive game settings, but add auth or rate limiting if write endpoints such as high scores are added.
- Vite is pinned to 5.x because the build agent runs Node 18. Upgrade to Vite 7+ once Node 20.19+ is available.
- Test gameplay manually in a browser. The automated tests cover the game logic and the API, not visual layout.
