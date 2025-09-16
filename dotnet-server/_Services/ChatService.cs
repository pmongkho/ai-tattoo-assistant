using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
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
        private readonly bool _hasValidApiKey;
        private static readonly Random _rand = new();
        private static readonly ConcurrentDictionary<string, TattooConsultationData> _userData = new();
        private static readonly Regex NameRegex = new(@"\b([A-Za-z][A-Za-z'’\-]+)\s+([A-Za-z][A-Za-z'’\-]+)\b", RegexOptions.Compiled);
        private static readonly Regex PhoneRegex = new(@"\+?\d[\d\s\-()]{7,}\d", RegexOptions.Compiled);

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
   • Torso/Back/Neck/Head → ask for exact location + side. If it's the chest, ask whether it's left, right, or center.
4) Size: ask for inches or common terms (palm-size, hand-size, half-sleeve, etc.).
5) References: ask if they have photos/inspo to upload.
6) Budget: ask for a comfortable range.
7) Availability: ask which dates or days work best and note any days/times they can't do.
8) Contact: ask for their full name and best phone number (both required).

If they ask “how much?” say first:
  “To better assist you, we need a little more info about the tattoo you’re wanting.”
Then continue with size, placement, and detail questions.

Tone tips:
- Give quick, practical pro notes only when helpful (e.g., inner forearm heals nicely; B&G realism ages well).
- Keep momentum: one concise question per message.

Wrap-up:
- Summarize subject, style, placement, size, budget range, and availability.
- Mention that Square notifications will be sent for updates.
- Propose a concrete next step:
  • For small tattoos, offer to book the appointment directly.
  • For half or full day sessions (8–10 hrs), suggest an online consultation.
  • For sleeves or very large/detailed projects, recommend an in-person consultation.
  Aim to lock in the plan.
";

        public const string DesignGuidePrompt = @"Act as an encouraging TATTOO DESIGN GUIDE.
- Wait for the client’s opening message; reply with friendly enthusiasm and ONE focused question at a time.
 - Think like an artist: clarify subject, style (if realism → confirm black & grey vs color), exact placement (get limb sub-areas), size, references, budget, availability (ask for dates/days that work or don't), and full name & phone.
- When price comes up, start with: “To better assist you, we need a little more info about the tattoo you’re wanting,” then ask the next most useful question.
 - Avoid repetition; acknowledge what’s already provided; keep messages short and positive.
- Close by recapping details, noting you’ll send Square notifications, and proposing a consultation slot.
  • Book small tattoos directly.
  • For half or full day sessions (8–10 hrs) move to an online consultation.
  • For sleeves or extensive work, plan an in-person consultation.
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
            _hasValidApiKey = !string.IsNullOrWhiteSpace(_apiKey);

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

            if (_hasValidApiKey)
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            }
            else
            {
                _logger.LogError("OpenAI API key is not configured. Chat responses will use a fallback message until a key is provided.");
            }
        }

        // dotnet-server/_Services/ChatService.cs
        public async Task<string> GetChatResponseAsync(string userId, List<ChatMessage> conversationHistory)
        {
            UpdateUserData(userId, conversationHistory);
            return await GetChatResponseAsync(conversationHistory);
        }

        public async Task<string> GetChatResponseAsync(List<ChatMessage> conversationHistory)
        {
            if (!_hasValidApiKey)
            {
                return BuildFallbackResponse(conversationHistory);
            }

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
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
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

        private void UpdateUserData(string userId, List<ChatMessage> history)
        {
            if (string.IsNullOrWhiteSpace(userId) || history == null)
            {
                return;
            }

            var data = _userData.GetOrAdd(userId, _ => new TattooConsultationData());
            var userMessages = history.Where(m => m.Role == "user").ToList();
            if (userMessages.Count == 0)
            {
                return;
            }

            var lastMessage = userMessages.Last();
            switch (userMessages.Count)
            {
                case 1:
                    data.Subject = lastMessage.Content;
                    break;
                case 2:
                    data.Style = lastMessage.Content;
                    break;
                case 3:
                    data.Placement = lastMessage.Content;
                    break;
                case 4:
                    data.Size = lastMessage.Content;
                    break;
                case 5:
                    data.References = lastMessage.Content;
                    break;
                case 6:
                    data.Budget = lastMessage.Content;
                    break;
                case 7:
                    data.Availability = lastMessage.Content;
                    break;
                case 8:
                    var content = lastMessage.Content ?? string.Empty;
                    var nameMatch = NameRegex.Match(content);
                    if (nameMatch.Success)
                        data.Name = nameMatch.Value;
                    var phoneMatch = PhoneRegex.Match(content);
                    if (phoneMatch.Success)
                        data.Phone = phoneMatch.Value;
                    break;
            }

            _logger.LogInformation("Collected data for {User}: {Data}", userId, JsonSerializer.Serialize(data));
        }


        public async Task<string> GetChatResponseWithImageAsync(List<ChatMessage> conversationHistory)
        {
            if (!_hasValidApiKey)
            {
                return BuildFallbackResponse(conversationHistory);
            }

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
                    var imageUrl = msg.ImageUrl;
                    if (!imageUrl.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                    {
                        try
                        {
                            using var imgResp = await _httpClient.GetAsync(imageUrl);
                            imgResp.EnsureSuccessStatusCode();
                            var bytes = await imgResp.Content.ReadAsByteArrayAsync();
                            var mime = imgResp.Content.Headers.ContentType?.MediaType ?? "image/png";
                            imageUrl = $"data:{mime};base64,{Convert.ToBase64String(bytes)}";
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failed to fetch image from {Url}", imageUrl);
                            imageUrl = null;
                        }
                    }

                    if (imageUrl != null)
                    {
                        messages.Add(new
                        {
                            role = msg.Role,
                            content = new object[]
                            {
                                new { type = "text", text = msg.Content },
                                new { type = "image_url", image_url = new { url = imageUrl } }
                            }
                        });
                        continue;
                    }
                }

                // Regular text-only message or image fetch failed
                messages.Add(new
                {
                    role = msg.Role,
                    content = msg.Content
                });
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
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
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

        private string BuildFallbackResponse(List<ChatMessage>? conversationHistory)
        {
            var snippet = ExtractLatestUserSnippet(conversationHistory);
            var baseMessage = "Thanks for reaching out! Our AI tattoo assistant is warming up right now, so a human artist will follow up soon.";

            if (!string.IsNullOrEmpty(snippet))
            {
                baseMessage += $" I jotted down your note about \"{snippet}\" so the team can pick up right where you left off.";
            }

            baseMessage += " Feel free to keep sharing inspo images or any questions and we'll take it from there.";

            _logger.LogWarning("Returning fallback chat response because the OpenAI API key is not configured.");
            return baseMessage;
        }

        private static string? ExtractLatestUserSnippet(List<ChatMessage>? conversationHistory)
        {
            if (conversationHistory == null || conversationHistory.Count == 0)
            {
                return null;
            }

            for (int i = conversationHistory.Count - 1; i >= 0; i--)
            {
                var message = conversationHistory[i];
                if (!string.Equals(message.Role, "user", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (string.IsNullOrWhiteSpace(message.Content))
                {
                    continue;
                }

                var sanitized = Regex.Replace(message.Content, "\\s+", " ").Trim();
                if (sanitized.Length > 160)
                {
                    sanitized = sanitized.Substring(0, 160).Trim() + "…";
                }

                sanitized = sanitized.Replace("\"", "'");
                return sanitized;
            }

            return null;
        }
    }
}

