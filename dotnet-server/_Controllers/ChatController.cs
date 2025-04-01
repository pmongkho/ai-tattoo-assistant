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

        // Here, for demonstration, we're using an in-memory list.
        // In a real application, you'd likely use session state or a database.
        private static List<ChatMessage> _conversationHistory = new List<ChatMessage>
        {
            // Start with your system prompt.
            new ChatMessage("system", @"You are a professional tattoo consultation assistant.
When a client sends you a message, guide the conversation by asking for tattoo details in this order:
1. Ask what the subject matter of the tattoo is.
2. Ask which tattoo style the client prefers (options include: Traditional & Old School, Neo Traditional, Fine Line, Tribal, Watercolor, Blackwork, Color Realism, Japanese Traditional, Trash Polka, Geometric, Patchwork, Black and Grey Realism, Anime, Black and Grey, Continuous Line Contour, Sketch).
3. Ask where on the body the client would like the tattoo placed (options include: Head, Face, Mouth, Neck, Shoulder, Arm Pit, Upper Arm, Lower Arm, Inner Upper Arm, Inner Lower Arm, Chest, Ribs, Stomach, Back, Hip, Groin, Upper Leg, Lower Leg, Foot, Hands, or Other).
4. Ask what size in inches the client would like the tattoo to be.
5. Ask about price expectations or confirm if the provided price is acceptable.
6. If the price is agreed upon, ask if the client would like to book an appointment and offer scheduling options.
Do not ask for specific design details or reference photos at this time.")
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
