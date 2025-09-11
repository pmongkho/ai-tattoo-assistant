using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using DotNet.Models;
using DotNet.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace DotNet.Controllers
{
    [ApiController]
    [Route("api/tattoo")]
    public class TattooController : ControllerBase
    {
        private readonly ChatService _chatService;
        private readonly ILogger<TattooController> _logger;

        // Chat prompt
        private static List<ChatMessage> _conversationHistory = new List<ChatMessage>
        {
            // Start with your system prompt.
            new ChatMessage("system", @"You are a professional tattoo consultation assistant.
Guide the conversation naturally by asking ONE question at a time about the client's tattoo preferences.
Follow this sequence of topics, but only move to the next topic after getting an answer to the current one:

1. First, ask what subject matter they're interested in for their tattoo (e.g., portrait, animal, abstract design).
2. Once you know the subject, ask which tattoo style they prefer (e.g., Traditional, Fine Line, Black and Grey Realism).
3. After learning the style, ask where on their body they'd like the tattoo placed.
   - When they mention a general body part, ask for more specific placement details:
     - For arm: Ask if they prefer inner/outer forearm, bicep, tricep, shoulder, or full sleeve
     - For leg: Ask if they prefer thigh, calf, ankle, or shin
     - For torso: Ask if they prefer chest, ribs, stomach, back, or shoulder blade
     - For hand/foot: Ask if they prefer top of hand/foot, wrist, fingers, or ankle
     - For neck/face: Ask for the exact placement (side of neck, behind ear, etc.)
4. Then ask about the approximate size in inches they're considering.
5. Next, discuss price expectations.
6. Finally, if they're ready, discuss appointment scheduling.

Keep your responses friendly, brief, and focused on one question at a time. Don't overwhelm the client with multiple questions in a single message.")
        };

        // Track which part of the consultation we're in so we can ensure
        // each question is asked only once and in the correct order
        private enum ConsultationStep
        {
            Subject,
            Style,
            Placement,
            Size,
            Price,
            Schedule
        }

        private static ConsultationStep _currentStep = ConsultationStep.Subject;

        public TattooController(ChatService chatService, ILogger<TattooController> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        // dotnet-server/_Controllers/ChatController.cs (TattooController)
        [HttpPost("consult")]
        public async Task<IActionResult> Consult([FromBody] ChatRequest? request)
        {
            _logger.LogInformation("Received request: {Request}", JsonSerializer.Serialize(request));

            if (request == null)
            {
                _logger.LogWarning("Request body was null");
                return BadRequest(new { error = "Request body is required." });
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                _logger.LogWarning("Message is null or empty");
                return BadRequest(new { error = "Message cannot be empty." });
            }

            try
            {
                // Normalize style names so the AI can easily understand the user's choice
                if (_currentStep == ConsultationStep.Style)
                {
                    request.Message = NormalizeStyle(request.Message);
                }

                _conversationHistory.Add(new ChatMessage("user", request.Message));

                // If we're discussing placement and the client gives only a general area,
                // inject a system message instructing the AI to ask for specifics
                if (_currentStep == ConsultationStep.Placement && NeedsSpecificPlacement(request.Message))
                {
                    var clarification = BuildPlacementClarification(request.Message);
                    _conversationHistory.Add(new ChatMessage("system", clarification));
                }
                else
                {
                    // Advance to the next step only when we have a detailed answer
                    _currentStep = _currentStep switch
                    {
                        ConsultationStep.Subject   => ConsultationStep.Style,
                        ConsultationStep.Style     => ConsultationStep.Placement,
                        ConsultationStep.Placement => ConsultationStep.Size,
                        ConsultationStep.Size      => ConsultationStep.Price,
                        ConsultationStep.Price     => ConsultationStep.Schedule,
                        _                          => _currentStep
                    };
                }

                var aiResponse = await _chatService.GetChatResponseAsync(_conversationHistory);

                _conversationHistory.Add(new ChatMessage("assistant", aiResponse));

                return Ok(new { response = aiResponse });
            }
            catch (HttpRequestException httpEx)
            {
                _logger.LogError(httpEx, "Error communicating with OpenAI");
                return StatusCode(503, new { error = "Error communicating with AI service.", details = httpEx.Message });
            }
            catch (InvalidOperationException invEx)
            {
                _logger.LogError(invEx, "Configuration error");
                return StatusCode(500, new { error = invEx.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in consult");
                return StatusCode(500, new { error = "An unexpected error occurred." });
            }
        }

        private static string NormalizeStyle(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return message;
            }

            var styleMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                {"black and grey", "Black & Grey Realism"},
                {"black & grey", "Black & Grey Realism"},
                {"black grey", "Black & Grey Realism"}
            };

            var match = styleMap.FirstOrDefault(kvp => message.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase));
            return string.IsNullOrEmpty(match.Key) ? message : match.Value;
        }

        private static bool NeedsSpecificPlacement(string message)
        {
            if (string.IsNullOrWhiteSpace(message)) return false;

            var generalAreas = new[] {"arm", "leg", "torso", "hand", "foot", "neck", "face"};
            return generalAreas.Any(area => message.Contains(area, StringComparison.OrdinalIgnoreCase));
        }

        private static string BuildPlacementClarification(string message)
        {
            if (message.Contains("arm", StringComparison.OrdinalIgnoreCase))
            {
                return "The client mentioned the arm. Ask if they prefer inner/outer forearm, bicep, tricep, shoulder, or full sleeve.";
            }
            if (message.Contains("leg", StringComparison.OrdinalIgnoreCase))
            {
                return "The client mentioned the leg. Ask if they prefer thigh, calf, ankle, or shin.";
            }
            if (message.Contains("torso", StringComparison.OrdinalIgnoreCase))
            {
                return "The client mentioned the torso. Ask if they prefer chest, ribs, stomach, back, or shoulder blade.";
            }
            if (message.Contains("hand", StringComparison.OrdinalIgnoreCase) || message.Contains("foot", StringComparison.OrdinalIgnoreCase))
            {
                return "The client mentioned the hand or foot. Ask if they prefer top of hand/foot, wrist, fingers, or ankle.";
            }
            if (message.Contains("neck", StringComparison.OrdinalIgnoreCase) || message.Contains("face", StringComparison.OrdinalIgnoreCase))
            {
                return "The client mentioned the neck or face. Ask for the exact placement such as side of neck or behind the ear.";
            }

            return "The client mentioned a general area. Ask for more specific placement details.";
        }
        
        // Add this to your TattooController
        [HttpGet("test-openai")]
        public async Task<IActionResult> TestOpenAI()
        {
            try
            {
                var testConversation = new List<ChatMessage>
                {
                    new ChatMessage("system", "You are a helpful assistant."),
                    new ChatMessage("user", "Say hello!")
                };

                var response = await _chatService.GetChatResponseAsync(testConversation);
                return Ok(new { Response = response, Success = true });
            }
            catch (HttpRequestException httpEx)
            {
                _logger.LogError(httpEx, "OpenAI test failed due to HTTP error");
                return StatusCode(503, new { Error = "OpenAI test failed", Details = httpEx.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OpenAI test failed");
                return StatusCode(500, new { Error = "OpenAI test failed", Details = ex.Message });
            }
        }



        public class ChatRequest
        {
            public string? Message { get; set; }
        }
    }
}
