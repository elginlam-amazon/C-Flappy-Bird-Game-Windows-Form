using System.Threading.RateLimiting;
using FlappyBird.Server.Game;
using FlappyBird.Server.Scores;
using Microsoft.Extensions.Options;

const string ScoreSubmissionPolicy = "score-submission";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<GameSettings>()
    .Bind(builder.Configuration.GetSection(GameSettings.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddOptions<LeaderboardOptions>()
    .Bind(builder.Configuration.GetSection(LeaderboardOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<IScoreStore, InMemoryScoreStore>();
builder.Services.AddProblemDetails();

// The leaderboard is anonymous, so throttle submissions per client IP.
builder.Services.AddRateLimiter(limiter =>
{
    limiter.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    limiter.AddPolicy(ScoreSubmissionPolicy, context =>
    {
        var permits = context.RequestServices.GetRequiredService<IOptions<LeaderboardOptions>>().Value.SubmissionsPerMinute;
        return RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = permits, Window = TimeSpan.FromMinutes(1) });
    });
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRateLimiter();

var api = app.MapGroup("/api");

api.MapGet("/game/settings", (IOptions<GameSettings> settings) => TypedResults.Ok(settings.Value));

api.MapGet("/scores", (IScoreStore store, int? top) =>
    TypedResults.Ok(store.GetTop(Math.Clamp(top ?? 10, 1, 50))));

api.MapPost("/scores", (SubmitScoreRequest request, IScoreStore store) =>
    {
        var errors = request.Validate();
        if (errors.Count > 0)
        {
            return Results.ValidationProblem(errors);
        }

        var entry = store.Add(request.PlayerName!.Trim(), request.Score);
        return TypedResults.Created("/api/scores", entry);
    })
    .RequireRateLimiting(ScoreSubmissionPolicy);

// Unknown API routes return 404 instead of falling through to the SPA.
api.MapFallback(() => Results.NotFound());

// Client-side routes are served by the React app.
app.MapFallbackToFile("index.html");

app.Run();
