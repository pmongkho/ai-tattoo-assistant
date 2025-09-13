using System.Text;
using System.Text.Json;
using DotNet.Models;
using DotNet.Services;
using Microsoft.AspNetCore.Mvc;

namespace DotNet.Controllers
{
    [ApiController]
    [Route("api/meta")]
    public class MetaWebhookController : ControllerBase
    {
        private readonly TattooController _chatController;
        private readonly ITenantService _tenantService;
        private readonly string _verifyToken = "tattoo-verify-prod";

        public MetaWebhookController(TattooController chatController, ITenantService tenantService)
        {
            _chatController = chatController;
            _tenantService = tenantService;
        }

        [HttpGet]
        public IActionResult Verify(
            [FromQuery(Name = "hub.mode")] string mode,
            [FromQuery(Name = "hub.challenge")] string challenge,
            [FromQuery(Name = "hub.verify_token")] string verifyToken)
        {
            return (mode == "subscribe" && verifyToken == _verifyToken)
                ? Content(challenge)
                : Unauthorized();
        }

        [HttpPost]
        public async Task<IActionResult> Receive([FromBody] MetaEvent metaEvent)
        {
            if (metaEvent.Entry.Count == 0 || metaEvent.Entry[0].Messaging.Count == 0)
            {
                return Ok();
            }

            var entry = metaEvent.Entry[0];
            var msg = entry.Messaging[0];

            var tenant = await _tenantService.FindByMetaIdAsync(entry.Id);
            var accessToken = _tenantService.DecryptToken(tenant?.EncryptedPageAccessToken);

            var response = await _chatController.Consult(new TattooController.ChatRequest
            {
                Message = msg.Message.Text,
                UserId = msg.Sender.Id
            }) as OkObjectResult;

            var replyText = response != null
                ? ((JsonElement)response.Value!).GetProperty("response").GetString() ?? string.Empty
                : string.Empty;

            if (!string.IsNullOrEmpty(replyText) && accessToken != null)
            {
                await SendMetaReplyAsync(msg.Sender.Id, replyText, accessToken);
            }

            return Ok();
        }

        private async Task SendMetaReplyAsync(string recipientId, string text, string pageAccessToken)
        {
            var payload = new
            {
                recipient = new { id = recipientId },
                message = new { text }
            };

            using var http = new HttpClient();
            var uri = $"https://graph.facebook.com/v18.0/me/messages?access_token={pageAccessToken}";
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            await http.PostAsync(uri, content);
        }
    }
}
