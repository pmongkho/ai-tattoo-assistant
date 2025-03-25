using System.Collections.Generic;
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

        [HttpPost("consult")]
        public async Task<IActionResult> Consult([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message cannot be empty.");
            }

            // Add the user's new message to the conversation history.
            _conversationHistory.Add(new ChatMessage("user", request.Message));

            // Get the AI's response using the full conversation history.
            var aiResponse = await _chatService.GetChatResponseAsync(_conversationHistory);

            // Append the AI's response to the conversation history.
            _conversationHistory.Add(new ChatMessage("assistant", aiResponse));

            return Ok(new { response = aiResponse });
        }
    }

    public class ChatRequest
    {
        public string? Message { get; set; }
    }
}
