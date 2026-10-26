using System.ComponentModel.DataAnnotations;

namespace FlappyBird.Server;

/// <summary>
/// Game tuning values served to the React client. Defaults match the original WinForms game
/// and can be overridden per environment via the "Game" configuration section.
/// </summary>
public sealed class GameSettings
{
    public const string SectionName = "Game";

    /// <summary>Starting horizontal pipe speed in pixels per tick.</summary>
    [Range(1, 100)]
    public int PipeSpeed { get; init; } = 8;

    /// <summary>Pipe speed once the score passes <see cref="SpeedUpScore"/>.</summary>
    [Range(1, 100)]
    public int FastPipeSpeed { get; init; } = 15;

    /// <summary>Score above which pipes switch to <see cref="FastPipeSpeed"/>.</summary>
    [Range(0, 1000)]
    public int SpeedUpScore { get; init; } = 5;

    /// <summary>Downward bird speed in pixels per tick while the flap key is released.</summary>
    [Range(1, 100)]
    public int Gravity { get; init; } = 15;

    /// <summary>Upward bird speed in pixels per tick while the flap key is held.</summary>
    [Range(1, 100)]
    public int FlapStrength { get; init; } = 15;

    /// <summary>Game loop interval in milliseconds.</summary>
    [Range(5, 1000)]
    public int TickIntervalMs { get; init; } = 20;
}
