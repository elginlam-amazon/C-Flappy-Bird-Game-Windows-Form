using System.ComponentModel.DataAnnotations;

namespace FlappyBird.Server.Game;

/// <summary>
/// Gameplay tuning values. Defaults match the original Windows Forms game (Form1.cs);
/// they can be overridden per environment via the "Game" configuration section.
/// </summary>
public sealed class GameSettings
{
    public const string SectionName = "Game";

    /// <summary>Game loop interval in milliseconds (original gameTimer.Interval).</summary>
    [Range(5, 1000)]
    public int TickIntervalMs { get; set; } = 20;

    /// <summary>Pixels the pipes move left per tick at the start.</summary>
    [Range(1, 100)]
    public int PipeSpeed { get; set; } = 8;

    /// <summary>Pipe speed once the score exceeds <see cref="SpeedUpAfterScore"/>.</summary>
    [Range(1, 100)]
    public int FastPipeSpeed { get; set; } = 15;

    /// <summary>The pipes speed up when the score is strictly greater than this value.</summary>
    [Range(0, 10_000)]
    public int SpeedUpAfterScore { get; set; } = 5;

    /// <summary>Pixels the bird falls per tick while the flap key is released.</summary>
    [Range(1, 100)]
    public int Gravity { get; set; } = 15;

    /// <summary>Pixels the bird rises per tick while the flap key is held.</summary>
    [Range(1, 100)]
    public int FlapStrength { get; set; } = 15;
}
