# .NET Framework 4.6.1 → .NET 10 migration summary

## Project
`Flappy Bird Windows Form/Flappy Bird Windows Form.csproj` — Windows Forms desktop game (WinExe).

## Changes
- **Project file**: SDK-style, `net10.0-windows` (Windows Forms requires the `-windows` platform TFM; plain `net10.0` cannot reference `System.Windows.Forms`). Single TFM, since this is an application/UI project.
  - `UseWindowsForms=true`; `EnableWindowsTargeting=true` so the project restores and builds on non-Windows build agents (Linux CI). Replaced the non-standard `ImportWindowsDesktopTargets` property.
  - `AssemblyName` set explicitly to `Flappy Bird Windows Form` (same as the legacy project).
  - `ImplicitUsings` and `Nullable` disabled so the existing code compiles without changes.
  - Assembly metadata from the deleted `Properties/AssemblyInfo.cs` (title, product, copyright, version 1.0.0.0, `ComVisible(false)`, `Guid`) moved into MSBuild properties and `AssemblyAttribute` items.
  - Removed the `Microsoft.CSharp` and `System.Data.DataSetExtensions` NuGet packages. Both are part of the .NET 10 shared framework, and the code uses neither `dynamic` nor `DataSet`.
- **App.config**: removed the `<startup><supportedRuntime ... v4.6.1>` element, which .NET 10 ignores. The file is kept (empty) for any future `ConfigurationManager`/settings use.
- **Source code**: no changes needed. `Form1`, `Program`, `Resources.Designer.cs` and `Settings.Designer.cs` compile as-is on .NET 10. Bitmap resources (`ResXFileRef` PNGs) embed correctly through the Windows Desktop SDK.

## Iteration 2 changes
- **Font and DPI (`Program.cs`)**: added `Application.SetDefaultFont(Microsoft Sans Serif 8.25pt)` and `Application.SetHighDpiMode(HighDpiMode.DpiUnaware)`. `Form1` uses `AutoScaleMode.Font` with `AutoScaleDimensions(6F, 13F)`, which matches the old default font. Under the .NET 6+ default (Segoe UI 9pt) or SystemAware DPI, the form and its picture boxes would be rescaled. The game logic uses fixed pixel values (pipe reset at 800/950, off-screen limits -150/-180/-25, gravity ±15), so rescaling would change gameplay. These two calls restore the .NET Framework 4.6.1 behavior (that app had no DPI manifest, so it ran DPI-unaware). `scoreText` sets its own font (Arial Narrow 24pt) and is unaffected.
- **App.config deleted**: it only held the .NET Framework `<startup>` element. `Settings.Designer.cs` defines no settings and `Settings.Default` is never used, so removing it has no runtime impact.
- **`System.Data.DataSetExtensions`**: already removed in iteration 1. The project has no `PackageReference` entries.
- **`EnableWindowsTargeting`**: now conditional on `'$(OS)' != 'Windows_NT'`. Windows builds don't use it. Linux agents still build without needing an extra pipeline flag. It stays in the project file so a plain `dotnet build` works everywhere.

## Build result
`dotnet build` on the project and the solution (`--no-incremental`): **0 errors, 0 warnings**.

## Next steps
- Runtime validation on Windows still needs a person. This environment is Linux and cannot run the app. Check rendering, the timer, Space-key input, collision detection and the score label. If crisp high-DPI rendering matters more than matching the original exactly, switch to `HighDpiMode.SystemAware` and scale the pixel constants in `Form1.cs` with `DeviceDpi`. That is a product decision.
- Unit tests were not added, because adding them was not requested. The game logic is inside `Form1` event handlers. Testing it would first require moving the score, pipe-speed and collision rules into a separate class, which is a refactor that needs approval.
- Optional modernization: replace the `Program.Main` boilerplate with `ApplicationConfiguration.Initialize()` and the matching `<Application*>` MSBuild properties. It was left as is to keep the existing pattern.
- The `obj/Debug` and `bin` folders contain old .NET Framework build output, and `obj/` is tracked in git. Consider deleting these folders and adding `bin/` and `obj/` to `.gitignore`.
- The solution has no test projects, so there were no unit tests to run.
