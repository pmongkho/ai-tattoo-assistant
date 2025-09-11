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
            new ChatMessage("system", @"You are a tattoo consultation assistant. Gather the client's preferences in a clear, logical order.
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

Example conversation format:
Assistant: ""Hi! What subject or theme are you thinking of for your tattoo?""
User: ""A tiger.""
Assistant: ""Great! Which style do you prefer: Black & Grey Realism, Fine Line, or something else?""
User: ""Black & Grey Realism.""
Assistant: ""Thanks. Where on your body should the tattoo go?""
[Continue until all steps complete]

After the user gives each answer, respond with short, context-aware acknowledgments before asking the next question.")
        };

        // Track which part of the consultation we're in so we can ensure
        // each question is asked only once and in the correct order
        private enum ConsultationStep
        {
            Introduction,
            Subject,
            Style,
            Placement,
            Size,
            Price,
            Schedule
        }

        private static ConsultationStep _currentStep = ConsultationStep.Introduction;

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

                // If this is the client's very first message, respond without advancing the flow yet.
                if (_currentStep == ConsultationStep.Introduction)
                {
                    var introResponse = await _chatService.GetChatResponseAsync(_conversationHistory);
                    _conversationHistory.Add(new ChatMessage("assistant", introResponse));
                    _currentStep = ConsultationStep.Subject;
                    return Ok(new { response = introResponse });
                }

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
