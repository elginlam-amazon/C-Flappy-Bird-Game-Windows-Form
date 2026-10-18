# Migration summary: Flappy Bird Windows Form → net10.0-windows

## Changes
- `Flappy Bird Windows Form.csproj`: SDK-style, `net10.0-windows`, `UseWindowsForms`, single TFM (WinForms app, not multi-targeted).
  - Added `EnableWindowsTargeting=true` so the project builds on non-Windows agents (fixes NETSDK1100).
  - Removed the `Microsoft.CSharp` and `System.Data.DataSetExtensions` packages. Nothing uses them, and both are already part of the .NET shared framework.
  - Removed the legacy `ImportWindowsDesktopTargets` property.
  - Moved the metadata from `Properties/AssemblyInfo.cs` (title, product, copyright, version, ComVisible, Guid) into MSBuild properties. `AssemblyName` is still `Flappy Bird Windows Form`.
  - Set `Nullable` and `ImplicitUsings` to disabled so the existing code compiles the same way it did before.
- `App.config`: removed the `<startup><supportedRuntime .NETFramework v4.6.1>` element, which .NET ignores.
- No source code changes were needed. WinForms, System.Drawing (Windows-only, so doc 21 applies without changes) and `ApplicationSettingsBase` are all included in the Windows Desktop shared framework.

## Build
- `dotnet build` on the project and the solution: 0 errors, 0 warnings.

## Next steps
- Run the game on Windows to check rendering, timer and keyboard input. The build was checked on Linux only.
- The repo tracks old .NET Framework build output (`bin/Debug/*.exe`, `obj/Debug/*`). Consider removing it from source control and adding a `.gitignore`.
- Optional: turn on `ApplicationHighDpiMode`/`Application.SetHighDpiMode` if you want high-DPI behaviour. The legacy DPI behaviour was kept on purpose.
