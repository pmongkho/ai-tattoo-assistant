using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace DotNet.Services
{
    public enum MetaConnectStatus
    {
        Pending,
        Completed,
        Failed
    }

    public sealed class MetaConnectSession
    {
        public required string State { get; init; }
        public required string Name { get; init; }
        public required string Plan { get; init; }
        public TenantRoleDefinition RoleDefinition { get; init; } = TenantRoleCatalog.Resolve("trial");
        public string? ArtistUserId { get; init; }
        public MetaConnectStatus Status { get; set; } = MetaConnectStatus.Pending;
        public Guid? TenantId { get; set; }
        public string? MetaPageId { get; set; }
        public string? InstagramAccountId { get; set; }
        public string? Error { get; set; }
        public DateTime CreatedUtc { get; init; } = DateTime.UtcNow;

        public ConnectSessionStatusDto ToDto() => new(
            Status,
            Plan,
            RoleDefinition.Role,
            RoleDefinition.Capabilities.ToArray(),
            TenantId,
            MetaPageId,
            InstagramAccountId,
            Error);
    }

    public sealed record ConnectSessionStatusDto(
        MetaConnectStatus Status,
        string Plan,
        string Role,
        IReadOnlyList<string> Capabilities,
        Guid? TenantId,
        string? MetaPageId,
        string? InstagramAccountId,
        string? Error);

    public sealed record ConnectSessionResponseDto(
        string State,
        string AuthorizationUrl,
        string Plan,
        string Role,
        IReadOnlyList<string> Capabilities);

    public sealed class MetaConnectSessionStore
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<MetaConnectSessionStore> _logger;
        private static readonly TimeSpan SessionLifetime = TimeSpan.FromMinutes(15);

        public MetaConnectSessionStore(IMemoryCache cache, ILogger<MetaConnectSessionStore> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public MetaConnectSession Create(string name, string plan, TenantRoleDefinition roleDefinition, string? artistUserId)
        {
            var state = GenerateState();
            var session = new MetaConnectSession
            {
                State = state,
                Name = name.Trim(),
                Plan = roleDefinition.Plan,
                RoleDefinition = roleDefinition,
                ArtistUserId = string.IsNullOrWhiteSpace(artistUserId) ? null : artistUserId.Trim(),
                CreatedUtc = DateTime.UtcNow
            };

            _cache.Set(state, session, SessionLifetime);
            return session;
        }

        public MetaConnectSession? Get(string state)
        {
            return _cache.TryGetValue(state, out MetaConnectSession? session) ? session : null;
        }

        public void MarkCompleted(string state, Guid tenantId, string pageId, string instagramAccountId)
        {
            if (_cache.TryGetValue(state, out MetaConnectSession? session))
            {
                session.Status = MetaConnectStatus.Completed;
                session.TenantId = tenantId;
                session.MetaPageId = pageId;
                session.InstagramAccountId = instagramAccountId;
                _cache.Set(state, session, TimeSpan.FromMinutes(5));
            }
        }

        public void MarkFailed(string state, string error)
        {
            if (_cache.TryGetValue(state, out MetaConnectSession? session))
            {
                session.Status = MetaConnectStatus.Failed;
                session.Error = error;
                _cache.Set(state, session, TimeSpan.FromMinutes(5));
            }
            else
            {
                _logger.LogWarning("Attempted to mark unknown Meta connect session {State} as failed: {Error}", state, error);
            }
        }

        private static string GenerateState()
        {
            Span<byte> buffer = stackalloc byte[32];
            RandomNumberGenerator.Fill(buffer);
            return Convert.ToBase64String(buffer).Replace('+', '-').Replace('/', '_').TrimEnd('=');
        }
    }
}
