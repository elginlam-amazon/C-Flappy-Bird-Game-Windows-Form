# .NET Framework → .NET 10 Migration Summary

Project: `Flappy Bird Windows Form/Flappy Bird Windows Form.csproj`
Source: .NET Framework 4.6.1, Windows Forms (WinExe)
Target: `net10.0-windows`, Windows Forms

## Result

`dotnet build` — **Build succeeded, 0 Errors, 0 Warnings** (verified from a clean `bin`/`obj` in both Debug and Release, and at the solution level).

## Changes applied

### Project file (KB 01 – Project File and SDK Migration)

The project was already SDK-style (`Microsoft.NET.Sdk`) targeting `net10.0-windows` with `UseWindowsForms`. Remaining cleanup:

| Change | Reason |
| --- | --- |
| Removed `PackageReference Microsoft.CSharp 4.7.0` | In-box since .NET Core 3.0. The package is a .NET Framework / netstandard-era shim and adds nothing on `net10.0`; carrying it risks NU1701 framework-fallback noise. The project does not use `dynamic`. |
| Removed `PackageReference System.Data.DataSetExtensions 4.5.0` | .NET Framework-only package with no `net10.0` asset. Nothing in the project uses `DataSet`/`DataTable` LINQ extensions (`System.Data` is only a leftover `using` in `Form1.cs`). |
| Removed `<ImportWindowsDesktopTargets>true</ImportWindowsDesktopTargets>` | Legacy property for the .NET Core 3.0 preview / packages-based desktop SDK. Obsolete and ignored under the modern SDK, where `UseWindowsForms` + the `-windows` TFM pull in `Microsoft.WindowsDesktop.App`. |
| Added `<EnableWindowsTargeting>true</EnableWindowsTargeting>` | Required to restore/build the `net10.0-windows` targeting pack on a non-Windows build agent (this migration was built on Linux). Has no effect on a Windows build. |

### Configuration (KB 11 – Configuration and Settings Migration)

- Deleted `App.config`. Its only content was `<startup><supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.6.1" /></startup>`, which is meaningless on .NET 10 (runtime selection is driven by the generated `*.runtimeconfig.json`). `Properties/Settings.settings` defines **no** settings, so there was no `applicationSettings`/`userSettings` content to migrate to `appsettings.json` and no need for the `System.Configuration.ConfigurationManager` package.

### Resources (KB 21 – System.Drawing)

- `Properties/Resources.resx` + `Resources.Designer.cs` and `Form1.resx` were kept unchanged. The SDK's default `EmbeddedResource` globbing with `RootNamespace=Flappy_Bird_Windows_Form` produces exactly the manifest names the generated code expects — verified in the build output: `Flappy_Bird_Windows_Form.Properties.Resources.resources` (57 KB, all four PNGs resolved through their `ResXFileRef` entries) and `Flappy_Bird_Windows_Form.Form1.resources`.
- No `System.Drawing.Common` package reference is needed: for a WinForms app on `net10.0-windows`, `System.Drawing` comes from the `Microsoft.WindowsDesktop.App` shared framework. The app is Windows-only by design (WinForms), so the Linux-safe SkiaSharp/ImageSharp path in KB 21 does not apply.

### Source code

No code changes were required. `Program.cs`, `Form1.cs` and `Form1.Designer.cs` use only APIs that are fully supported on .NET 10 WinForms (`Application.EnableVisualStyles`, `Application.SetCompatibleTextRenderingDefault`, `PictureBox`, `Label`, `System.Windows.Forms.Timer`, `Rectangle.IntersectsWith`, `System.Drawing.Font`/`Color`/`Point`/`Size`). Game logic (gravity, pipe speed, scoring, collision, end-game) is byte-for-byte unchanged.

Nothing in this project touched System.Web, ASP.NET MVC/Web API, Entity Framework, WCF, SignalR, ASMX, Web Forms, cryptography, Swagger or any test framework, so KB docs 02–20, 22–28 and 32–34 had no applicable patterns.

## Behavioral notes

- **High-DPI default changed by the runtime, not by this migration.** On .NET Framework the app ran DPI-unaware; .NET Core 3.0+ WinForms defaults to `PerMonitorV2` DPI awareness. Because the game positions every `PictureBox` with hard-coded pixel coordinates (`ClientSize 622x707`, ground at `y=633`, pipe reset values `800`/`950`), layout and collision geometry still work as written, but the window will be physically larger on a high-DPI display than it was under .NET Framework. No code change was made, since this is the modern default and the pixel math is self-consistent.

## Next steps (non-blocking)

1. **No automated tests exist** in this solution, so "build and test" was validated by a clean build only. The game logic in `Form1.cs` (collision, scoring, speed ramp at `score > 5`) is currently inseparable from the designer-created controls; extracting it into a small testable class would allow unit tests, but that is a refactor beyond the scope of a framework upgrade.
2. **Runtime verification is pending a Windows host.** Per the migration instructions the compiled app was not executed; this environment is Linux and cannot run a WinForms binary. A manual smoke test on Windows is recommended to confirm sprite rendering and the Space-key input.
3. **Optional modernization, deliberately not applied** (each would change generated/designer code without fixing a defect): switching `Program.cs` to the template's `ApplicationConfiguration.Initialize()`, enabling `<Nullable>enable</Nullable>` (the designer's `IContainer components = null` would need annotating), and regenerating `Form1.Designer.cs` in current designer style. The now-unused `using System.Data;` / `using System.Threading.Tasks;` in `Form1.cs` and `Program.cs` were likewise left in place as they produce no warnings.
4. **`Properties/Settings.settings` and `Settings.Designer.cs` are dead code** — an empty settings class with no consumers. Safe to delete, left in place to keep the diff limited to what the upgrade required. If settings are ever added, the `System.Configuration.ConfigurationManager` package will be needed since `ApplicationSettingsBase` persistence is no longer configured by `App.config` on .NET 10.
5. **`EnableWindowsTargeting`** can be dropped if all future builds happen on Windows agents; it is harmless there but signals cross-platform build support that WinForms does not actually have at runtime.
