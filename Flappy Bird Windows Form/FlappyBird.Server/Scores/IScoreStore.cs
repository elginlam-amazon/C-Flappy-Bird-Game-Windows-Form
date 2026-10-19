namespace FlappyBird.Server.Scores;

public interface IScoreStore
{
    ScoreEntry Add(string playerName, int score);

    IReadOnlyList<ScoreEntry> GetTop(int count);
}
