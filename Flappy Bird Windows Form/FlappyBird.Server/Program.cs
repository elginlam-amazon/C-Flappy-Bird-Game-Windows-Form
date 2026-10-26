using FlappyBird.Server;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<GameSettings>()
    .Bind(builder.Configuration.GetSection(GameSettings.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// Serves the built React client (Vite outputs into wwwroot).
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/game/settings", (IOptions<GameSettings> options) => options.Value)
    .WithName("GetGameSettings");

// Unknown API routes are real 404s rather than the SPA's index.html.
app.MapFallback("/api/{**path}", () => Results.NotFound());
app.MapFallbackToFile("index.html");

app.Run();
