using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using DotNet.Models;
using DotNet.Services;
using Microsoft.AspNetCore.Mvc;

namespace DotNet.Controllers
{
    [ApiController]
    [Route("api/tattoo")]
    public class TattooController : ControllerBase
    {
        private readonly ChatService _chatService;

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


        public TattooController(ChatService chatService)
        {
            _chatService = chatService;
        }

        // dotnet-server/_Controllers/ChatController.cs (TattooController)
        [HttpPost("consult")]
        public async Task<IActionResult> Consult([FromBody] ChatRequest request)
        {
            // Add logging
            Console.WriteLine($"Received request: {JsonSerializer.Serialize(request)}");

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                Console.WriteLine("Message is null or empty");
                return BadRequest("Message cannot be empty.");
            }

            try
            {
                // Add the user's new message to the conversation history.
                _conversationHistory.Add(new ChatMessage("user", request.Message));

                // Get the AI's response using the full conversation history.
                var aiResponse = await _chatService.GetChatResponseAsync(_conversationHistory);

                // Append the AI's response to the conversation history.
                _conversationHistory.Add(new ChatMessage("assistant", aiResponse));

                return Ok(new { response = aiResponse });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in consult: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = ex.Message });
            }
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
            catch (Exception ex)
            {
                Console.WriteLine($"OpenAI test failed: {ex.Message}");
                return StatusCode(500, new { Error = "OpenAI test failed", Details = ex.Message });
            }
        }



        public class ChatRequest
        {
            public string? Message { get; set; }
        }
    }
}
