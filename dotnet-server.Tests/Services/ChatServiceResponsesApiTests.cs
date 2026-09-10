using System.Net;
using System.Text;
using System.Text.Json;
using DotNet.Models;
using DotNet.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace DotNet.Tests.Services;

public class ChatServiceResponsesApiTests
{
    [Fact]
    public async Task GetChatResponseAsync_UsesResponsesApiAndReadsOutputText()
    {
        HttpRequestMessage? capturedRequest = null;
        string? capturedBody = null;
        var handler = new StubHttpMessageHandler(async request =>
        {
            capturedRequest = request;
            capturedBody = await request.Content!.ReadAsStringAsync();
            return JsonResponse("""
                {
                  "output": [
                    { "type": "reasoning", "summary": [] },
                    {
                      "type": "message",
                      "role": "assistant",
                      "content": [
                        { "type": "output_text", "text": "Hello" },
                        { "type": "output_text", "text": " there!" }
                      ]
                    }
                  ]
                }
                """);
        });
        var service = CreateService(handler);

        var result = await service.GetChatResponseAsync(new List<ChatMessage>
        {
            new("system", "Be concise."),
            new("user", "Say hello.")
        });

        Assert.Equal("Hello there!", result);
        Assert.Equal("https://api.openai.com/v1/responses", capturedRequest!.RequestUri!.ToString());
        Assert.Equal("test-key", capturedRequest.Headers.Authorization!.Parameter);

        using var payload = JsonDocument.Parse(capturedBody!);
        Assert.Equal("gpt-4.1-mini", payload.RootElement.GetProperty("model").GetString());
        Assert.Equal("user", payload.RootElement.GetProperty("input")[1].GetProperty("role").GetString());
        Assert.Equal("Say hello.", payload.RootElement.GetProperty("input")[1].GetProperty("content").GetString());
        Assert.False(payload.RootElement.TryGetProperty("messages", out _));
    }

    [Fact]
    public async Task GetChatResponseWithImageAsync_UsesResponsesImageContentTypes()
    {
        string? capturedBody = null;
        var handler = new StubHttpMessageHandler(async request =>
        {
            capturedBody = await request.Content!.ReadAsStringAsync();
            return JsonResponse("""
                { "output": [{ "type": "message", "content": [{ "type": "output_text", "text": "Nice reference." }] }] }
                """);
        });
        var service = CreateService(handler);

        var result = await service.GetChatResponseWithImageAsync(new List<ChatMessage>
        {
            new("system", "Review the reference."),
            new("user", "Here it is.", "data:image/png;base64,AAAA")
        });

        Assert.Equal("Nice reference.", result);
        using var payload = JsonDocument.Parse(capturedBody!);
        var content = payload.RootElement.GetProperty("input")[1].GetProperty("content");
        Assert.Equal("input_text", content[0].GetProperty("type").GetString());
        Assert.Equal("input_image", content[1].GetProperty("type").GetString());
        Assert.Equal("data:image/png;base64,AAAA", content[1].GetProperty("image_url").GetString());
    }

    [Fact]
    public async Task GetChatResponseAsync_WhenApiKeyIsRejected_ReturnsFallbackAndStopsRetrying()
    {
        var requestCount = 0;
        var handler = new StubHttpMessageHandler(_ =>
        {
            requestCount++;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.Unauthorized)
            {
                Content = new StringContent(
                    """{"error":{"message":"Your API key has been invalidated.","code":"token_invalidated"}}""",
                    Encoding.UTF8,
                    "application/json")
            });
        });
        var service = CreateService(handler);
        var history = new List<ChatMessage>
        {
            new("user", "I want a raven tattoo on my forearm.")
        };

        var firstResult = await service.GetChatResponseAsync(history);
        var secondResult = await service.GetChatResponseAsync(history);

        Assert.Contains("human artist will follow up soon", firstResult);
        Assert.Contains("raven tattoo on my forearm", firstResult);
        Assert.Equal(firstResult, secondResult);
        Assert.Equal(1, requestCount);
    }

    private static ChatService CreateService(HttpMessageHandler handler)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["OpenAI:ApiKey"] = "test-key",
                ["OpenAI:AiModel"] = "gpt-4.1-mini"
            })
            .Build();

        return new ChatService(configuration, new HttpClient(handler), NullLogger<ChatService>.Instance);
    }

    private static HttpResponseMessage JsonResponse(string json) => new(HttpStatusCode.OK)
    {
        Content = new StringContent(json, Encoding.UTF8, "application/json")
    };

    private sealed class StubHttpMessageHandler(
        Func<HttpRequestMessage, Task<HttpResponseMessage>> handler) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken) => handler(request);
    }
}
