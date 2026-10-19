namespace FlappyBird.Server.Scores;

public sealed record ScoreEntry(string PlayerName, int Score, DateTimeOffset AchievedAt);

public sealed record SubmitScoreRequest(string? PlayerName, int Score)
{
    public const int MaxPlayerNameLength = 20;
    public const int MaxScore = 1_000_000;

    public Dictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        var name = PlayerName?.Trim();

        if (string.IsNullOrEmpty(name))
        {
            errors[nameof(PlayerName)] = ["Player name is required."];
        }
        else if (name.Length > MaxPlayerNameLength)
        {
            errors[nameof(PlayerName)] = [$"Player name must be at most {MaxPlayerNameLength} characters."];
        }
        else if (name.Any(char.IsControl))
        {
            errors[nameof(PlayerName)] = ["Player name contains invalid characters."];
        }

        if (Score is < 0 or > MaxScore)
        {
            errors[nameof(Score)] = [$"Score must be between 0 and {MaxScore}."];
        }

        return errors;
    }
}
