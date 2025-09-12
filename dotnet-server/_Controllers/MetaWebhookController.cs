using System.Text;
using System.Text.Json;
using DotNet.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace DotNet.Controllers
{
    [ApiController]
    [Route("api/meta")]
    public class MetaWebhookController : ControllerBase
    {
        private readonly TattooController _chatController;
        private readonly string _verifyToken = "YOUR_VERIFY_TOKEN";
        private readonly string _pageAccessToken;

        public MetaWebhookController(TattooController chatController, IConfiguration configuration)
        {
            _chatController = chatController;
            _pageAccessToken = configuration["Meta:PageAccessToken"] ?? string.Empty;
        }

        [HttpGet]
        public IActionResult Verify(string hub_mode, string hub_challenge, string hub_verify_token)
            => (hub_mode == "subscribe" && hub_verify_token == _verifyToken)
               ? Ok(hub_challenge)
               : Unauthorized();

        [HttpPost]
        public async Task<IActionResult> Receive([FromBody] MetaEvent metaEvent)
        {
            if (metaEvent.Entry.Count == 0 || metaEvent.Entry[0].Messaging.Count == 0)
            {
                return Ok();
            }

            var msg = metaEvent.Entry[0].Messaging[0];

            var response = await _chatController.Consult(new TattooController.ChatRequest
            {
                Message = msg.Message.Text,
                UserId = msg.Sender.Id
            }) as OkObjectResult;

            var replyText = response != null
                ? ((JsonElement)response.Value!).GetProperty("response").GetString() ?? string.Empty
                : string.Empty;

            if (!string.IsNullOrEmpty(replyText))
            {
                await SendMetaReplyAsync(msg.Sender.Id, replyText);
            }

            return Ok();
        }

        private async Task SendMetaReplyAsync(string recipientId, string text)
        {
            var payload = new
            {
                recipient = new { id = recipientId },
                message = new { text }
            };

            using var http = new HttpClient();
            var uri = $"https://graph.facebook.com/v18.0/me/messages?access_token={_pageAccessToken}";
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            await http.PostAsync(uri, content);
        }
    }
}
