using System.Text;
using DotNet.Models;
using DotNet.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DotNet.Controllers
{
    [ApiController]
    [Route("api/meta")]
    public class MetaWebhookController : ControllerBase
    {
        private readonly string _verifyToken;
        private readonly ILogger<MetaWebhookController> _logger;

        public MetaWebhookController(
            IConfiguration configuration,
            ILogger<MetaWebhookController> logger)
        {
            _verifyToken = configuration["MetaAccess:FbVerifyToken"] ?? "tattoo-verify-prod";
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Verify(
            [FromQuery(Name = "hub.mode")] string? mode,
            [FromQuery(Name = "hub.challenge")] string? challenge,
            [FromQuery(Name = "hub.verify_token")] string? verifyToken)
        {
            try
            {
                if (string.IsNullOrEmpty(mode) || string.IsNullOrEmpty(challenge) || string.IsNullOrEmpty(verifyToken))
                {
                    return BadRequest("Missing hub parameters.");
                }

                return (mode.Equals("subscribe", StringComparison.OrdinalIgnoreCase) && verifyToken == _verifyToken)
                    ? Content(challenge)
                    : Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying Meta webhook.");
                return StatusCode(500, "Failed to verify webhook.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Receive(
            [FromBody] MetaEvent metaEvent,
            [FromServices] ITenantService tenantService,
            [FromServices] IMessagingIntegrationService messagingIntegrationService)
        {
            if (metaEvent.Entry.Count == 0)
            {
                return Ok();
            }

            foreach (var entry in metaEvent.Entry)
            {
                if (entry.Messaging.Count == 0)
                {
                    continue;
                }

                var tenant = await tenantService.FindByMetaIdAsync(entry.Id);
                if (tenant == null)
                {
                    _logger.LogWarning("Received Meta webhook for unknown tenant id {MetaId}", entry.Id);
                    continue;
                }

                var accessToken = tenantService.DecryptToken(tenant.EncryptedPageAccessToken);
                var platform = entry.Id == tenant.InstagramAccountId ? "instagram" : "facebook";

                foreach (var msg in entry.Messaging)
                {
                    var text = msg.Message?.Text;
                    if (string.IsNullOrWhiteSpace(text))
                    {
                        continue;
                    }

                    string replyText;
                    try
                    {
                        replyText = await messagingIntegrationService.ProcessIncomingMessageAsync(platform, tenant, msg.Sender.Id, text);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to process Meta message for sender {Sender}", msg.Sender.Id);
                        continue;
                    }

                    if (!string.IsNullOrEmpty(replyText) && !string.IsNullOrEmpty(accessToken))
                    {
                        await SendMetaReplyAsync(msg.Sender.Id, replyText, accessToken);
                    }
                }
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
