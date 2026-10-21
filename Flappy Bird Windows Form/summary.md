# Migration summary: .NET Framework 4.6.1 → net10.0-windows

## Changes
- `Flappy Bird Windows Form.csproj`: SDK-style, `net10.0-windows`, `UseWindowsForms`.
  - Added `EnableWindowsTargeting` so the project builds on non-Windows agents.
  - `ImplicitUsings`/`Nullable` disabled to keep the legacy code's semantics.
  - Removed `Microsoft.CSharp` and `System.Data.DataSetExtensions` package references. Nothing in the code used them, and both are in the shared framework.
  - Removed the `ImportWindowsDesktopTargets` property. The Windows Desktop SDK already handles it.
  - Moved the assembly metadata from the deleted `Properties/AssemblyInfo.cs` into MSBuild properties and `AssemblyAttribute` items: title, product, copyright, version, ComVisible(false) and Guid. `AssemblyName` stays the same.
- `App.config`: removed the `<startup><supportedRuntime>` element because it only applies to .NET Framework.
- No changes to the source code (`Form1`, `Program`, resources and settings). The game logic is the same.

## Verification
- `dotnet build` on the project and the solution: 0 errors, 0 warnings.

## Next steps
- Run the game on Windows to check rendering and timing. On .NET, WinForms defaults to a different font (Segoe UI 9pt) and different high-DPI handling. If the layout looks different, call `Application.SetDefaultFont` or set `ApplicationHighDpiMode`.
- The `bin/Debug` and `obj/Debug` folders left over from the .NET Framework build are committed to git. Remove them and add a `.gitignore`.
