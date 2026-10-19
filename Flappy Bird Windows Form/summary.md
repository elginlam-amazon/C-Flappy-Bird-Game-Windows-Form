# Migration summary: .NET Framework 4.6.1 → net10.0-windows

## Changes
- `Flappy Bird Windows Form.csproj` (SDK-style, `net10.0-windows`, WinForms):
  - Added `EnableWindowsTargeting=true` so the Windows-only target builds on non-Windows agents (fixed `NETSDK1100`).
  - Removed `Microsoft.CSharp` and `System.Data.DataSetExtensions` package references (in-box on .NET 10, unused).
  - Removed legacy `ImportWindowsDesktopTargets` (superseded by `UseWindowsForms`).
  - Pinned `AssemblyName` to `Flappy Bird Windows Form` to keep the original executable name.
- No source changes were required; embedded resource names (`Flappy_Bird_Windows_Form.Form1.resources`, `Flappy_Bird_Windows_Form.Properties.Resources.resources`) match the original.

## Verification
- `dotnet build` of the project and the solution: 0 errors, 0 warnings.
- No test project exists; runtime/UI behaviour was not verified (Linux build host).

## Next steps
- Smoke-test the game on Windows (rendering, timer, Space key handling).
- `App.config` `<startup><supportedRuntime>` is ignored on .NET 10 and can be removed.
- Tracked legacy build output (`bin/Debug`, `obj/Debug` .NET Framework artifacts) is committed to git; consider deleting it and adding a `.gitignore`.
- Optional: switch `Program.Main` to `ApplicationConfiguration.Initialize()` and set a high-DPI mode.

# Web rewrite: React + TypeScript client, ASP.NET Core backend

## Layout
- `flappybird.client/` – Vite + React 18 + TypeScript. `src/game/game.ts` is a pure port of `Form1.cs` (same layout, physics, pipe recycling, scoring, collision rules); `FlappyBirdGame.tsx` renders it with the original sprites.
- `FlappyBird.Server/` – ASP.NET Core (net10.0) minimal API. Serves the built client from `wwwroot` and exposes:
  - `GET /api/game/settings` – gameplay tuning (`Game` config section, defaults = original values).
  - `GET /api/scores?top=N`, `POST /api/scores` – leaderboard (validated, rate-limited per IP).
- `FlappyBird.Server.Tests/` – xUnit API and store tests.

## Running
- Dev: `dotnet run --project FlappyBird.Server --launch-profile http` and `npm run dev` in `flappybird.client` (Vite proxies `/api` to `http://localhost:5180`).
- Prod: `dotnet publish FlappyBird.Server -c Release` runs `npm ci && npm run build` and bundles the client.

## Next steps (web)
- The leaderboard is in-memory (lost on restart, per-instance); add a persistent store for multi-instance or durable use.
- Score submission is unauthenticated and client-reported, so scores can be forged. Rate limiting only reduces spam. Add auth or server-side validation if that matters.
- Rate limiting is keyed by remote IP; behind a reverse proxy, configure forwarded headers.
- The playfield is a fixed 622x707 px (original size); consider scaling for small screens.
- Decide whether to retire the original WinForms project (left in place).
