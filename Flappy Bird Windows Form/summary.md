# Flappy Bird Windows Form – .NET Framework 4.6.1 → .NET 10 migration

## Result
- `dotnet build "./Flappy Bird Windows Form/Flappy Bird Windows Form.csproj"`: 0 errors, 0 warnings (Debug).
- `dotnet build "Flappy Bird Windows Form.sln" -c Release`: 0 errors, 0 warnings.

## Changes
- **Project file** (`Flappy Bird Windows Form.csproj`): SDK-style, `net10.0-windows`, `WinExe`, `UseWindowsForms`.
  - Added `EnableWindowsTargeting=true` so the Windows-only TFM builds on Linux/CI agents.
  - Removed the non-standard `ImportWindowsDesktopTargets` property.
  - Removed the `Microsoft.CSharp` 4.7.0 and `System.Data.DataSetExtensions` 4.5.0 packages. Both are part of the .NET 10 shared framework, and the code does not use them.
  - Set `AssemblyName` explicitly to `Flappy Bird Windows Form` to match the original output name.
  - Moved the metadata from the deleted `Properties/AssemblyInfo.cs` (title, product, copyright, version 1.0.0.0, COM GUID) into MSBuild properties. `ComVisible(false)` is the SDK default.
  - Kept the designer metadata for `Resources.resx` / `Settings.settings` so the Visual Studio designers keep regenerating the `*.Designer.cs` files.
- **App.config**: deleted. It only had the `<supportedRuntime ... v4.6.1>` startup element, which has no effect on .NET 10.
- **bin/ and obj/**: deleted the old .NET Framework build output (`.exe`, `.pdb`, caches), which was committed to git.
- **Source code**: no changes needed. `Program.cs`, `Form1.cs`, and the designer/resource code compile unchanged on .NET 10. System.Drawing works without changes in a Windows desktop app (KB 21).

## Next steps
- The repository has no `.gitignore`, and `bin/`/`obj/` were committed before. Add a standard .NET `.gitignore` so build output stays out of git.
- High DPI: .NET Framework 4.6.1 ran this app DPI-unaware, and `Program.cs` does not call `Application.SetHighDpiMode`, so behaviour should stay the same. The game uses fixed pixel positions (800/950). Do a manual check on a high-DPI Windows display, because the app cannot run on the Linux build agent.
- Optional modernisation (not done, to keep behaviour unchanged): switch `Program.cs` to `ApplicationConfiguration.Initialize()` and turn on nullable reference types / implicit usings.
