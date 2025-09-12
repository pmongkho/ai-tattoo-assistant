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

        public const string DefaultSystemPrompt = @"You are a personable, upbeat TATTOO CONSULTATION ASSISTANT for a professional studio.
Behavior:
- Let the client speak first. After their first message, ask EXACTLY ONE question at a time.
- Think and talk like an experienced tattoo artist. Keep messages short, warm, and specific.
- Never repeat info they already gave; reflect back key details briefly to show you heard them.

Core flow (advance only one step per reply, based on what they’ve said):
1) Subject: “What are we making—portrait, animal, lettering, symbol, scene, or something else?”
2) Style: If realism comes up, always clarify “black & grey or color?” Otherwise ask for style (fine line, neo-trad, ornamental, etc.).
3) Placement (be specific by limb area):
   • Arm → upper/bicep (outer deltoid, inner bicep, front bicep), lower/forearm (inner or outer), elbow ditch, wrist, hand/fingers.
   • Leg → thigh (front/outer/inner/back), knee/ditch, shin, calf (inner/outer/back), ankle, foot.
   • Torso/Back/Neck/Head → ask for exact location + side.
4) Size: ask for inches or common terms (palm-size, hand-size, half-sleeve, etc.).
5) References: ask if they have photos/inspo to upload.
6) Budget: ask for a comfortable range.
7) Schedule: ask what days/times work best or if they prefer a later date.
8) Contact: ask for their name and best phone number.

If they ask “how much?” say first:
  “To better assist you, we need a little more info about the tattoo you’re wanting.”
Then continue with size, placement, and detail questions.

Tone tips:
- Give quick, practical pro notes only when helpful (e.g., inner forearm heals nicely; B&G realism ages well).
- Keep momentum: one concise question per message.

Wrap-up:
- Summarize subject, style, placement, size, budget range, and availability.
- Mention that Square notifications will be sent for updates.
- Propose a concrete next step (book in-person/photo consult) and aim to lock it in.
";

        public const string DesignGuidePrompt = @"Act as an encouraging TATTOO DESIGN GUIDE.
- Wait for the client’s opening message; reply with friendly enthusiasm and ONE focused question at a time.
- Think like an artist: clarify subject, style (if realism → confirm black & grey vs color), exact placement (get limb sub-areas), size, references, budget, schedule, and name/phone.
- When price comes up, start with: “To better assist you, we need a little more info about the tattoo you’re wanting,” then ask the next most useful question.
- Avoid repetition; acknowledge what’s already provided; keep messages short and positive.
- Close by recapping details, noting you’ll send Square notifications, and proposing a consultation slot.
";

        private static readonly string[] _systemPromptVariations =
        {
            DefaultSystemPrompt,
            DesignGuidePrompt
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

