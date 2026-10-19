using Microsoft.Extensions.Options;

namespace FlappyBird.Server.Scores;

/// <summary>
/// Thread-safe, bounded, process-local leaderboard. Scores are lost when the process restarts.
/// </summary>
public sealed class InMemoryScoreStore(IOptions<LeaderboardOptions> options, TimeProvider timeProvider) : IScoreStore
{
    private readonly int _maxEntries = options.Value.MaxEntries;
    private readonly List<ScoreEntry> _entries = [];
    private readonly Lock _lock = new();

    public ScoreEntry Add(string playerName, int score)
    {
        var entry = new ScoreEntry(playerName, score, timeProvider.GetUtcNow());

        lock (_lock)
        {
            // Keep the list sorted: highest score first, earlier achievement wins ties.
            var index = _entries.FindIndex(e => e.Score < score);
            if (index < 0)
            {
                index = _entries.Count;
            }

            _entries.Insert(index, entry);

            if (_entries.Count > _maxEntries)
            {
                _entries.RemoveRange(_maxEntries, _entries.Count - _maxEntries);
            }
        }

        return entry;
    }

    public IReadOnlyList<ScoreEntry> GetTop(int count)
    {
        lock (_lock)
        {
            return _entries.Take(count).ToArray();
        }
    }
}
