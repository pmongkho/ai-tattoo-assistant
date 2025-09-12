using System.Collections.Concurrent;
using System.Collections.Generic;
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

        // Track conversation history per user
        private static readonly ConcurrentDictionary<string, List<ChatMessage>> _conversationHistories = new();

        public TattooController(ChatService chatService, ILogger<TattooController> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        [HttpPost("consult")]
        public async Task<IActionResult> Consult([FromBody] ChatRequest? request)
        {
            _logger.LogInformation("Received request: {Request}", JsonSerializer.Serialize(request));

            if (request == null || string.IsNullOrWhiteSpace(request.Message) || string.IsNullOrWhiteSpace(request.UserId))
            {
                _logger.LogWarning("Request body was null or empty");
                return BadRequest(new { error = "Message and UserId cannot be empty." });
            }

            try
            {
                var history = _conversationHistories.GetOrAdd(request.UserId, _ => new List<ChatMessage>());
                history.Add(new ChatMessage("user", request.Message));

                var aiResponse = await _chatService.GetChatResponseAsync(request.UserId, history);

                history.Add(new ChatMessage("assistant", aiResponse));

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
            public string? UserId { get; set; }
            public string? Message { get; set; }
        }
    }
}

