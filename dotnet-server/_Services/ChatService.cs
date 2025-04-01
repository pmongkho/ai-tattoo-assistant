using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using DotNet.Models;
using Microsoft.Extensions.Configuration;

namespace DotNet.Services
{
    public class ChatService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;
        private readonly ILogger<ChatService> _logger;


        // dotnet-server/_Services/ChatService.cs
        public ChatService(IConfiguration configuration, HttpClient httpClient, ILogger<ChatService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;

            // Try to get API key from environment variable first, then fallback to configuration
            _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") ??
                      configuration["OpenAI:ApiKey"];

            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogError("OpenAI API key is not configured!");
                throw new InvalidOperationException("OpenAI API key is not configured");
            }

            _model = Environment.GetEnvironmentVariable("OPENAI_MODEL") ??
                     configuration["OpenAI:AiModel"] ??
                     "gpt-3.5-turbo";

            // Log configuration (but mask most of the API key)
            var maskedKey = _apiKey?.Length > 8
                ? _apiKey.Substring(0, 8) + "..."
                : "(not set)";
            _logger.LogInformation($"ChatService initialized with model: {_model}, API key: {maskedKey}");

            // Configure HttpClient
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        }

        // / <summary>
        // / Gets a response from the AI acting as a tattoo consultation assistant.
        // / The system prompt instructs the AI to ask for details in a specific sequence:
        // / 1. Tattoo subject matter.
        // / 2. Tattoo style preference (from a predefined list).
        // / 3. Tattoo placement (from a predefined list).
        // / 4. Desired size in inches.
        // / 5. Price expectations/confirmation.
        // / 6. Appointment booking if price is agreed.
        // / Specific design details and reference photos are not requested at this time.
        // / </summary>
        // / <param name="userMessage">The client's initial message.</param>
        // / <returns>The AI's response with follow-up questions.</returns>
// dotnet-server/_Services/ChatService.cs
        public async Task<string> GetChatResponseAsync(List<ChatMessage> conversationHistory)
        {
            var url = "https://api.openai.com/v1/chat/completions";

            // Updated system prompt that guides the AI to be more conversational
            string systemPrompt = @"You are a professional tattoo consultation assistant.
Guide the conversation naturally by asking ONE question at a time about the client's tattoo preferences.
Follow this sequence of topics, but only move to the next topic after getting an answer to the current one:

1. First, ask what subject matter they're interested in for their tattoo (e.g., portrait, animal, abstract design).
2. Once you know the subject, ask which tattoo style they prefer (e.g., Traditional, Fine Line, Blackwork, Realism).
3. After learning the style, ask where on their body they'd like the tattoo placed.
4. Then ask about the approximate size in inches they're considering.
5. Next, discuss price expectations.
6. Finally, if they're ready, discuss appointment scheduling.

Keep your responses friendly, brief, and focused on one question at a time. Don't overwhelm the client with multiple questions in a single message.";

            // Build the payload with the system prompt and the client's message.
            var payload = new
            {
                model = _model,
                messages = conversationHistory
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("Authorization", $"Bearer {_apiKey}");
            request.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            // Send the request to OpenAI.
            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception(
                    $"OpenAI API request failed with status code {response.StatusCode}: {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();

            // Parse the response JSON to extract the AI's reply.
            using var jsonDoc = JsonDocument.Parse(responseContent);
            var chatResponse = jsonDoc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return chatResponse ?? string.Empty;
        }
    }
}
