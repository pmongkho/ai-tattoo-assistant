using DotNet.Models;

namespace DotNet.Services
{
    /// <summary>
    /// Service for retrieving tenant-specific configuration and credentials.
    /// </summary>
    public interface ITenantService
    {
        /// <summary>
        /// Resolve a tenant based on a Meta Page ID or Instagram Account ID.
        /// </summary>
        Task<Tenant?> FindByMetaIdAsync(string metaId);

        /// <summary>
        /// Decrypt an access token stored for the tenant.
        /// </summary>
        string? DecryptToken(string? encryptedToken);
    }
}
