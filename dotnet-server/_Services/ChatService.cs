using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using DotNet.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DotNet.Services
{
    public class ChatService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;
        private readonly ILogger<ChatService> _logger;
        private readonly double _temperature;
        private readonly double _topP;
        private static readonly Random _rand = new();

        public const string DefaultSystemPrompt = @"You are a friendly, enthusiastic tattoo consultation assistant. Wait for the client to send the first message. After their first message, greet them with excitement and have a natural back-and-forth conversation to gather tattoo preferences, including subject or theme, style, placement, reference images, size, budget, availability, and contact information. React positively to their ideas and be creative in your phrasing. If they mention a realistic style, clarify whether they want color or black and grey. When they give a broad placement such as arm or leg, ask for the specific area (upper, lower, inner, or outer). Ask if they have any reference pictures of the design or the placement area. Ask one question at a time, acknowledge responses warmly, explicitly request their name and phone number for contact, avoid repeating questions, and finish by summarizing the details and letting them know you'll send Square notifications.";

        private static readonly string[] _systemPromptVariations =
        {
            DefaultSystemPrompt,
            @"You're a personable and upbeat tattoo consultation assistant. Let the client speak first, then reply with an enthusiastic greeting and explore their tattoo idea. Chat naturally to learn the subject, style (clarifying color vs. black and grey for realistic designs), placement (asking for specific areas of limbs), reference images, size, budget, availability, and contact information including name and phone number. Ask a single question at a time, respond warmly with positive reactions, avoid repetition, and close by summarizing details and mentioning Square notifications.",
            @"Act as an encouraging tattoo design guide. Wait for the client's opening message. Respond with a friendly, excited greeting and engage in casual back-and-forth to understand the theme, style—clarifying color or black and grey when realism comes up—placement with specific limb areas, any reference photos, size, budget, schedule, and their name and phone number. Keep questions one-at-a-time, be upbeat, and wrap up with a recap while noting you'll send Square notifications."
        };

        private static string GetRandomSystemPrompt()
        {
            return _systemPromptVariations[_rand.Next(_systemPromptVariations.Length)];
        }

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

            var tempString = Environment.GetEnvironmentVariable("OPENAI_TEMPERATURE") ??
                             configuration["OpenAI:Temperature"];
            _temperature = double.TryParse(tempString, out var temp) ? temp : 0.8;
            var topPString = Environment.GetEnvironmentVariable("OPENAI_TOP_P") ??
                             configuration["OpenAI:TopP"];
            _topP = double.TryParse(topPString, out var topP) ? topP : 1.0;

            // Log configuration (but mask most of the API key)
            var maskedKey = _apiKey?.Length > 8
                ? _apiKey.Substring(0, 8) + "..."
                : "(not set)";
            _logger.LogInformation($"ChatService initialized with model: {_model}, API key: {maskedKey}");

            // Configure HttpClient
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        }

        // dotnet-server/_Services/ChatService.cs
        public async Task<string> GetChatResponseAsync(List<ChatMessage> conversationHistory)
        {
            var url = "https://api.openai.com/v1/chat/completions";

            if (conversationHistory == null)
            {
                conversationHistory = new List<ChatMessage>();
            }

            if (!conversationHistory.Any(m => m.Role == "system"))
            {
                conversationHistory.Insert(0, new ChatMessage("system", GetRandomSystemPrompt()));
            }

            var payload = new
            {
                model = _model,
                messages = conversationHistory,
                temperature = _temperature,
                top_p = _topP
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

            if (string.IsNullOrWhiteSpace(chatResponse))
            {
                _logger.LogWarning("Empty response from OpenAI. Raw content: {Response}", responseContent);
                chatResponse = "I'm sorry, I didn't catch that. Could you please rephrase?";
            }

            return chatResponse;
        }


        public async Task<string> GetChatResponseWithImageAsync(List<ChatMessage> conversationHistory)
        {
            var url = "https://api.openai.com/v1/chat/completions";

            if (conversationHistory == null)
            {
                conversationHistory = new List<ChatMessage>();
            }

            if (!conversationHistory.Any(m => m.Role == "system"))
            {
                conversationHistory.Insert(0, new ChatMessage("system", GetRandomSystemPrompt()));
            }

            // Build the payload with the conversation history
            var messages = new List<object>();

            foreach (var msg in conversationHistory)
            {
                if (msg.ImageUrl != null)
                {
                    // Include image URL for messages with images
                    messages.Add(new
                    {
                        role = msg.Role,
                        content = new object[]
                        {
                            new { type = "text", text = msg.Content },
                            new { type = "image_url", image_url = new { url = msg.ImageUrl } }
                        }
                    });
                }
                else
                {
                    // Regular text-only message
                    messages.Add(new
                    {
                        role = msg.Role,
                        content = msg.Content
                    });
                }
            }

            var payload = new
            {
                model = _model,
                messages = messages,
                temperature = _temperature,
                top_p = _topP
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

            if (string.IsNullOrWhiteSpace(chatResponse))
            {
                _logger.LogWarning("Empty response from OpenAI. Raw content: {Response}", responseContent);
                chatResponse = "I'm sorry, I didn't catch that. Could you please rephrase?";
            }

            return chatResponse;
        }
    }
}

