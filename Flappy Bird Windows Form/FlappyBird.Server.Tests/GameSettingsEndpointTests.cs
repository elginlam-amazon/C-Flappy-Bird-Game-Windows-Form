using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FlappyBird.Server.Tests;

public class GameSettingsEndpointTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GetSettings_ReturnsOriginalGameDefaults()
    {
        var client = factory.CreateClient();

        var settings = await client.GetFromJsonAsync<GameSettings>("/api/game/settings");

        Assert.NotNull(settings);
        Assert.Equal(8, settings.PipeSpeed);
        Assert.Equal(15, settings.FastPipeSpeed);
        Assert.Equal(5, settings.SpeedUpScore);
        Assert.Equal(15, settings.Gravity);
        Assert.Equal(15, settings.FlapStrength);
        Assert.Equal(20, settings.TickIntervalMs);
    }

    [Fact]
    public async Task GetSettings_UsesCamelCaseJson()
    {
        var client = factory.CreateClient();

        var json = await client.GetStringAsync("/api/game/settings");

        Assert.Contains("\"pipeSpeed\":8", json);
        Assert.Contains("\"tickIntervalMs\":20", json);
    }

    [Fact]
    public async Task GetSettings_HonoursConfigurationOverrides()
    {
        var client = factory
            .WithWebHostBuilder(b => b.UseSetting("Game:PipeSpeed", "10"))
            .CreateClient();

        var settings = await client.GetFromJsonAsync<GameSettings>("/api/game/settings");

        Assert.Equal(10, settings!.PipeSpeed);
    }

    [Fact]
    public void InvalidSettings_FailAtStartup()
    {
        var invalid = factory.WithWebHostBuilder(b => b.UseSetting("Game:TickIntervalMs", "0"));

        Assert.ThrowsAny<Exception>(() => invalid.CreateClient());
    }

    [Fact]
    public async Task UnknownApiRoute_Returns404InsteadOfSpaFallback()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/game/unknown");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
