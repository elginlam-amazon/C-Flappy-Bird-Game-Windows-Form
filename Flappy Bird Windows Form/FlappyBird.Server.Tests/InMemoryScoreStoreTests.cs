using FlappyBird.Server.Scores;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Time.Testing;

namespace FlappyBird.Server.Tests;

public sealed class InMemoryScoreStoreTests
{
    private static InMemoryScoreStore CreateStore(int maxEntries) =>
        new(Options.Create(new LeaderboardOptions { MaxEntries = maxEntries }), new FakeTimeProvider());

    [Fact]
    public void GetTop_OrdersByScoreDescending_EarlierEntryWinsTies()
    {
        var store = CreateStore(10);
        store.Add("a", 3);
        store.Add("b", 7);
        store.Add("c", 3);

        var top = store.GetTop(10);

        Assert.Equal(["b", "a", "c"], top.Select(e => e.PlayerName));
    }

    [Fact]
    public void Add_BeyondCapacity_DropsLowestScores()
    {
        var store = CreateStore(2);
        store.Add("a", 1);
        store.Add("b", 5);
        store.Add("c", 3);

        var top = store.GetTop(10);

        Assert.Equal(["b", "c"], top.Select(e => e.PlayerName));
    }
}
