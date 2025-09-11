using System;
using System.Collections.Generic;
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

            // Updated system prompt with a clearer consultation workflow
            string systemPrompt = @"You are a tattoo consultation assistant. Gather the client's preferences in a clear, logical order.
Ask one question at a time, and confirm each answer before moving on. Keep track of previous answers so you don't repeat the same questions.
Follow this sequence:

1. Subject or theme (e.g., tiger, floral, lettering).
2. Style (e.g., Black & Grey Realism, Fine Line, Japanese Traditional).
3. Placement on the body, including exact spot if necessary.
4. Size (in inches).
5. Budget or price range (allow 'TBD').
6. Availability: ask for days/times. If they respond with a conflict, summarize and clarify.
7. Contact info (phone number).

Conclude with a clear summary of all collected info, then notify them about next steps (e.g., ""We'll submit to the booking system. You'll get updates by text/email."").

After the user gives each answer, respond with short, context-aware acknowledgments before asking the next question. Start the conversation by greeting the client and asking what subject or theme they are thinking of for their tattoo.";

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

