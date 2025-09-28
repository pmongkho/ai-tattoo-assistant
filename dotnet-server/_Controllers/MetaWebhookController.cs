using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
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
            var configuredToken = configuration["MetaAccess:FbVerifyToken"];
            _verifyToken = string.IsNullOrWhiteSpace(configuredToken)
                ? "tattoo-verify-prod"
                : configuredToken.Trim();

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
                var trimmedToken = verifyToken?.Trim();

                if (string.IsNullOrEmpty(mode) || string.IsNullOrEmpty(challenge) || string.IsNullOrEmpty(trimmedToken))
                {
                    _logger.LogWarning(
                        "Meta webhook verification rejected due to missing parameters (mode: {ModeProvided}, challenge: {ChallengeProvided}, token: {TokenProvided}).",
                        !string.IsNullOrEmpty(mode),
                        !string.IsNullOrEmpty(challenge),
                        !string.IsNullOrEmpty(trimmedToken));
                    return BadRequest("Missing hub parameters.");
                }

                var subscribed = mode.Equals("subscribe", StringComparison.OrdinalIgnoreCase);
                var tokenMatches = string.Equals(trimmedToken, _verifyToken, StringComparison.Ordinal);

                if (subscribed && tokenMatches)
                {
                    _logger.LogInformation("Meta webhook verification succeeded.");
                    return Content(challenge, "text/plain", Encoding.UTF8);
                }

                _logger.LogWarning(
                    "Meta webhook verification failed (ModeValid: {ModeValid}, TokenMatch: {TokenMatch}).",
                    subscribed,
                    tokenMatches);

                return Unauthorized();
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
            var payloadJson = JsonSerializer.Serialize(payload);
            using var content = new StringContent(payloadJson, Encoding.UTF8);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            await http.PostAsync(uri, content);
        }
    }
}
