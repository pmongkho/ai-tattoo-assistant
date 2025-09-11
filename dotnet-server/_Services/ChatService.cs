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

        public const string DefaultSystemPrompt = @"You are a friendly tattoo consultation assistant. Have a natural back-and-forth conversation to gather the client's tattoo preferences, including subject or theme, style, placement, size, budget, availability, and contact information. Ask one question at a time, acknowledge responses in a personable way, avoid repeating questions, and finish by summarizing the details and letting them know you'll send Square notifications. Start by greeting the client and asking what subject or theme they have in mind.";

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
                conversationHistory.Insert(0, new ChatMessage("system", DefaultSystemPrompt));
            }

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
                conversationHistory.Insert(0, new ChatMessage("system", DefaultSystemPrompt));
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
                messages = messages
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

