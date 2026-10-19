using System.Net;
using System.Net.Http.Json;
using FlappyBird.Server.Game;
using FlappyBird.Server.Scores;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FlappyBird.Server.Tests;

public sealed class ApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GameSettings_ReturnsOriginalWinFormsDefaults()
    {
        var client = factory.CreateClient();

        var settings = await client.GetFromJsonAsync<GameSettings>("/api/game/settings");

        Assert.NotNull(settings);
        Assert.Equal(20, settings.TickIntervalMs);
        Assert.Equal(8, settings.PipeSpeed);
        Assert.Equal(15, settings.FastPipeSpeed);
        Assert.Equal(5, settings.SpeedUpAfterScore);
        Assert.Equal(15, settings.Gravity);
        Assert.Equal(15, settings.FlapStrength);
    }

    [Fact]
    public async Task SubmitScore_ValidRequest_IsReturnedInLeaderboard()
    {
        var client = factory.CreateClient();
        var name = $"p{Guid.NewGuid():N}"[..12];

        var response = await client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest($"  {name}  ", 999_999));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<ScoreEntry>();
        Assert.Equal(name, created?.PlayerName);

        var top = await client.GetFromJsonAsync<ScoreEntry[]>("/api/scores?top=5");
        Assert.Contains(top!, e => e.PlayerName == name && e.Score == 999_999);
    }

    [Theory]
    [InlineData(null, 1)]
    [InlineData("   ", 1)]
    [InlineData("this-name-is-way-too-long", 1)]
    [InlineData("ok", -1)]
    public async Task SubmitScore_InvalidRequest_ReturnsBadRequest(string? name, int score)
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/scores", new SubmitScoreRequest(name, score));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UnknownApiRoute_ReturnsNotFound()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/does-not-exist");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
