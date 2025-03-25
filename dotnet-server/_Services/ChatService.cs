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

        public ChatService(IConfiguration configuration, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiKey = configuration["OpenAIKey"] ?? "none";
            _model = configuration["OpenAIModel"] ?? "gpt-3.5-turbo";
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
        public async Task<string> GetChatResponseAsync(List<ChatMessage> conversationHistory)
        {
            var url = "https://api.openai.com/v1/chat/completions";

            // System prompt that guides the AI through a structured consultation.
            string systemPrompt = @"You are a professional tattoo consultation assistant.
When a client sends you a message, guide the conversation by asking for tattoo details in the following order:
1. Ask what the subject matter of the tattoo is give some examples like black and grey portraits or an animal, objects or something abstract.
2. Ask which tattoo style the client prefers. For example, choose from:
   - Traditional & Old School, Neo Traditional, Fine Line, Tribal, Watercolor, Blackwork, 
     Color Realism, Japanese Traditional, Trash Polka, Geometric, Patchwork, Black and Grey Realism, 
     Anime, Black and Grey, Continuous Line Contour, Sketch.
3. Ask where on the body the client would like the tattoo placed. Options include:
   Head, Face, Mouth, Neck, Shoulder, Arm Pit, Upper Arm, Lower Arm, Inner Upper Arm, Inner Lower Arm, Take a Photo
   Chest, Ribs, Stomach, Back, Hip, Groin, Upper Leg, Lower Leg, Foot, Hands, or Other.
4. Ask what size in inches the client would like the tattoo to be approximately.
5. Ask about the client's price expectations or confirm if the provided price is acceptable.
6. If the price is agreed upon, ask if the client would like to book an appointment and offer scheduling options.
Do not ask for specific design details or reference photos at this time.";

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
                throw new Exception($"OpenAI API request failed with status code {response.StatusCode}: {errorContent}");
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
