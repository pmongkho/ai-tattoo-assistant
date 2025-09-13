using DotNet.Data;
using DotNet.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.DataProtection;

namespace DotNet.Services
{
    /// <summary>
    /// Provides tenant lookups and token encryption/decryption.
    /// </summary>
    public class TenantService : ITenantService
    {
        private readonly ApplicationDbContext _db;
        private readonly IDataProtector _protector;
        private readonly ILogger<TenantService> _logger;

        public TenantService(ApplicationDbContext db, IDataProtectionProvider provider, ILogger<TenantService> logger)
        {
            _db = db;
            _protector = provider.CreateProtector("TenantTokens");
            _logger = logger;
        }

        public async Task<Tenant?> FindByMetaIdAsync(string metaId)
        {
            return await _db.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.MetaPageId == metaId || t.InstagramAccountId == metaId);
        }

        public string? DecryptToken(string? encryptedToken)
        {
            if (string.IsNullOrEmpty(encryptedToken)) return null;
            try
            {
                return _protector.Unprotect(encryptedToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to decrypt tenant token");
                return null;
            }
        }

        public string? EncryptToken(string? token)
        {
            if (string.IsNullOrEmpty(token)) return null;
            try
            {
                return _protector.Protect(token);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to encrypt tenant token");
                return null;
            }
        }
    }
}
