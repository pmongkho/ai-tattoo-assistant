using DotNet.Data;
using DotNet.Models;
using DotNet.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace DotNet.Controllers
{
    [ApiController]
    [Route("api/tenants")]
    public class TenantController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ITenantService _tenantService;
        private readonly MetaConnectSessionStore _sessionStore;
        private readonly IMetaOAuthService _metaOAuthService;
        private readonly MetaOptions _metaOptions;
        private readonly ILogger<TenantController> _logger;

        public TenantController(
            ApplicationDbContext db,
            ITenantService tenantService,
            MetaConnectSessionStore sessionStore,
            IMetaOAuthService metaOAuthService,
            IOptions<MetaOptions> metaOptions,
            ILogger<TenantController> logger)
        {
            _db = db;
            _tenantService = tenantService;
            _sessionStore = sessionStore;
            _metaOAuthService = metaOAuthService;
            _metaOptions = metaOptions.Value;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenants = await _db.Tenants.AsNoTracking().ToListAsync();

            var response = tenants.Select(t =>
            {
                var role = TenantRoleCatalog.Resolve(t.Plan);
                return new
                {
                    t.Id,
                    t.Name,
                    t.MetaPageId,
                    t.InstagramAccountId,
                    t.ArtistUserId,
                    t.Plan,
                    Role = role.Role,
                    Capabilities = role.Capabilities,
                    t.TrialEndsAt
                };
            });

            return Ok(response);
        }

        [HttpGet("roles")]
        public IActionResult GetAvailableRoles()
        {
            var roles = TenantRoleCatalog
                .All()
                .Select(r => new
                {
                    r.Plan,
                    r.Role,
                    r.DisplayName,
                    r.Description,
                    r.Capabilities
                });

            return Ok(roles);
        }

        public class ConnectSessionRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Plan { get; set; } = "starter";
            public string? ArtistUserId { get; set; }
            public string? Role { get; set; }
        }

        [HttpPost("connect/session")]
        public IActionResult StartConnectSession([FromBody] ConnectSessionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Name is required" });
            }

            var roleDefinition = TenantRoleCatalog.Resolve(request.Plan, request.Role);
            var session = _sessionStore.Create(request.Name, request.Plan, roleDefinition, request.ArtistUserId);
            var authorizationUrl = _metaOAuthService.BuildAuthorizationUrl(session.State);

            var dto = new ConnectSessionResponseDto(
                session.State,
                authorizationUrl,
                session.Plan,
                session.RoleDefinition.Role,
                session.RoleDefinition.Capabilities);

            return Ok(dto);
        }

        [HttpGet("connect/session/{state}")]
        public IActionResult GetConnectSessionStatus([FromRoute] string state)
        {
            var session = _sessionStore.Get(state);
            if (session is null)
            {
                return NotFound();
            }

            return Ok(session.ToDto());
        }

        [AllowAnonymous]
        [HttpGet("connect/callback")]
        public async Task<IActionResult> MetaCallback(
            [FromQuery] string? code,
            [FromQuery] string? state,
            [FromQuery] string? error,
            [FromQuery(Name = "error_description")] string? errorDescription,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(state))
            {
                return BuildCallbackHtml("Missing OAuth state.", isError: true);
            }

            var session = _sessionStore.Get(state);
            if (session is null)
            {
                return BuildCallbackHtml("The connect session has expired. Please try again.", isError: true);
            }

            if (!string.IsNullOrEmpty(error))
            {
                var failure = string.IsNullOrWhiteSpace(errorDescription) ? error : $"{error}: {errorDescription}";
                _sessionStore.MarkFailed(state, failure);
                return BuildCallbackHtml("Meta login was cancelled. You can close this window.", isError: true);
            }

            if (string.IsNullOrWhiteSpace(code))
            {
                _sessionStore.MarkFailed(state, "Meta did not provide an authorization code.");
                return BuildCallbackHtml("Meta did not provide an authorization code.", isError: true);
            }

            try
            {
                var connectResult = await _metaOAuthService.CompleteAsync(code, cancellationToken);
                await _metaOAuthService.SubscribePageAsync(connectResult.PageId, connectResult.PageAccessToken, cancellationToken);

                var tenant = await _db.Tenants
                    .FirstOrDefaultAsync(
                        t => t.MetaPageId == connectResult.PageId || t.InstagramAccountId == connectResult.InstagramBusinessAccountId,
                        cancellationToken);

                var isNew = tenant is null;
                tenant ??= new Tenant();

                tenant.Name = session.Name;
                tenant.MetaPageId = connectResult.PageId;
                tenant.InstagramAccountId = connectResult.InstagramBusinessAccountId;
                tenant.ArtistUserId = session.ArtistUserId;
                tenant.EncryptedPageAccessToken = _tenantService.EncryptToken(connectResult.PageAccessToken);
                tenant.EncryptedInstagramToken = _tenantService.EncryptToken(connectResult.LongLivedUserToken);
                tenant.Plan = session.Plan;

                if (tenant.Plan == "trial" && tenant.TrialEndsAt == null)
                {
                    tenant.TrialEndsAt = DateTime.UtcNow.AddDays(7);
                }

                if (isNew)
                {
                    await _db.Tenants.AddAsync(tenant, cancellationToken);
                }
                else
                {
                    _db.Tenants.Update(tenant);
                }

                await _db.SaveChangesAsync(cancellationToken);

                _sessionStore.MarkCompleted(state, tenant.Id, connectResult.PageId, connectResult.InstagramBusinessAccountId);
                return BuildCallbackHtml(_metaOptions.PostConnectMessage, isError: false);
            }
            catch (MetaOAuthException ex)
            {
                _logger.LogWarning(ex, "Meta connect failed for state {State}", state);
                _sessionStore.MarkFailed(state, ex.Message);
                return BuildCallbackHtml(ex.Message, isError: true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error completing Meta connect for state {State}", state);
                _sessionStore.MarkFailed(state, "Unexpected error while completing Meta connect.");
                return BuildCallbackHtml("Unexpected error while completing Meta connect.", isError: true);
            }
        }

        private ContentResult BuildCallbackHtml(string message, bool isError)
        {
            var safeMessage = WebUtility.HtmlEncode(message);
            var statusColor = isError ? "#f87171" : "#34d399";
            var statusTitle = isError ? "Connection Failed" : "Connected";
            var status = isError ? "error" : "success";

            var html = $@"<!doctype html>
<html lang=""en"">
<head>
<meta charset=""utf-8"" />
<title>Meta Connect</title>
<style>
body {{ font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }}
.card {{ background: rgba(15, 23, 42, 0.85); border-radius: 16px; border: 1px solid rgba(148, 163, 184, 0.12); padding: 36px; max-width: 460px; text-align: center; box-shadow: 0 25px 45px rgba(15, 23, 42, 0.45); backdrop-filter: blur(18px); }}
.status {{ font-size: 0.85rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: {statusColor}; margin-bottom: 14px; }}
.message {{ font-size: 1.05rem; line-height: 1.6; margin-bottom: 28px; color: #f8fafc; }}
small {{ color: #94a3b8; font-size: 0.9rem; }}
</style>
</head>
<body>
<div class=""card"">
  <div class=""status"">{statusTitle}</div>
  <div class=""message"">{safeMessage}</div>
  <small>You can close this window and return to AI Tattoo Assistant.</small>
</div>
<script>
  if (window.opener) {{
    window.opener.postMessage({{ source: 'meta-connect', status: '{status}' }}, '*');
  }}
  setTimeout(() => window.close(), 1500);
</script>
</body>
</html>";

            return Content(html, "text/html");
        }
    }
}
