using System.ComponentModel.DataAnnotations;

namespace FlappyBird.Server.Scores;

public sealed class LeaderboardOptions
{
    public const string SectionName = "Leaderboard";

    /// <summary>Maximum number of scores retained; lower scores are dropped beyond this.</summary>
    [Range(1, 10_000)]
    public int MaxEntries { get; set; } = 100;

    /// <summary>Maximum score submissions accepted per client IP per minute.</summary>
    [Range(1, 10_000)]
    public int SubmissionsPerMinute { get; set; } = 10;
}
