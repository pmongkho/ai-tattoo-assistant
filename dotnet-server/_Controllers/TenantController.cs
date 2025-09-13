using DotNet.Data;
using DotNet.Models;
using DotNet.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace DotNet.Controllers
{
    [ApiController]
    [Route("api/tenants")]
    public class TenantController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ITenantService _tenantService;

        public TenantController(ApplicationDbContext db, ITenantService tenantService)
        {
            _db = db;
            _tenantService = tenantService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenants = await _db.Tenants
                .AsNoTracking()
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.MetaPageId,
                    t.InstagramAccountId,
                    t.Plan,
                    t.TrialEndsAt
                })
                .ToListAsync();
            return Ok(tenants);
        }

        public class ConnectRequest
        {
            public string Name { get; set; } = string.Empty;
            public string? MetaPageId { get; set; }
            public string? PageAccessToken { get; set; }
            public string? InstagramAccountId { get; set; }
            public string? InstagramToken { get; set; }
            public string? Plan { get; set; }
            public DateTime? TrialEndsAt { get; set; }
        }

        [HttpPost("connect")]
        public async Task<IActionResult> Connect([FromBody] ConnectRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Name is required" });
            }

            var tenant = await _db.Tenants
                .FirstOrDefaultAsync(t => t.MetaPageId == request.MetaPageId);

            var plan = string.IsNullOrWhiteSpace(request.Plan) ? "trial" : request.Plan;

            if (tenant == null)
            {
                tenant = new Tenant
                {
                    Name = request.Name,
                    MetaPageId = request.MetaPageId,
                    InstagramAccountId = request.InstagramAccountId,
                    EncryptedPageAccessToken = _tenantService.EncryptToken(request.PageAccessToken),
                    EncryptedInstagramToken = _tenantService.EncryptToken(request.InstagramToken),
                    Plan = plan,
                    TrialEndsAt = request.TrialEndsAt
                };
                if (tenant.Plan == "trial" && tenant.TrialEndsAt == null)
                {
                    tenant.TrialEndsAt = DateTime.UtcNow.AddDays(7);
                }
                _db.Tenants.Add(tenant);
            }
            else
            {
                tenant.Name = request.Name;
                tenant.MetaPageId = request.MetaPageId;
                tenant.InstagramAccountId = request.InstagramAccountId;
                tenant.EncryptedPageAccessToken = _tenantService.EncryptToken(request.PageAccessToken);
                tenant.EncryptedInstagramToken = _tenantService.EncryptToken(request.InstagramToken);
                if (!string.IsNullOrWhiteSpace(request.Plan))
                {
                    tenant.Plan = plan;
                }
                if (request.TrialEndsAt.HasValue)
                {
                    tenant.TrialEndsAt = request.TrialEndsAt;
                }
                if (tenant.Plan == "trial" && tenant.TrialEndsAt == null)
                {
                    tenant.TrialEndsAt = DateTime.UtcNow.AddDays(7);
                }
                _db.Tenants.Update(tenant);
            }

            await _db.SaveChangesAsync();
            return Ok(new { tenant.Id });
        }
    }
}
