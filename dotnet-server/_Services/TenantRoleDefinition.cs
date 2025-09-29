using System;
using System.Collections.Immutable;

namespace DotNet.Services
{
    /// <summary>
    /// Describes the capabilities available to a tenant based on their subscription tier.
    /// </summary>
    public sealed record TenantRoleDefinition(
        string Plan,
        string Role,
        string DisplayName,
        string Description,
        IReadOnlyList<string> Capabilities,
        int SortOrder = 0)
    {
        public bool HasCapability(string capability)
            => Capabilities.Contains(capability, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Catalog of supported tenant tiers/roles and their associated capabilities.
    /// </summary>
    public static class TenantRoleCatalog
    {
        private static readonly IReadOnlyDictionary<string, TenantRoleDefinition> _definitions =
            new Dictionary<string, TenantRoleDefinition>(StringComparer.OrdinalIgnoreCase)
            {
                ["trial"] = new(
                    Plan: "trial",
                    Role: "trial",
                    DisplayName: "Trial (7-day)",
                    Description: "Basic autoresponder access while evaluating the product.",
                    Capabilities: ImmutableArray.Create("auto-replies", "templates-basic"),
                    SortOrder: 0),
                ["starter"] = new(
                    Plan: "starter",
                    Role: "manager",
                    DisplayName: "Starter",
                    Description: "DM autoresponder + template tweaks for smaller studios.",
                    Capabilities: ImmutableArray.Create("auto-replies", "templates-basic", "after-hours"),
                    SortOrder: 1),
                ["scale"] = new(
                    Plan: "scale",
                    Role: "lead",
                    DisplayName: "Scale",
                    Description: "Adds advanced keyword routing and after-hours follow-ups.",
                    Capabilities: ImmutableArray.Create("auto-replies", "templates-advanced", "after-hours", "keyword-routing"),
                    SortOrder: 2),
                ["pro"] = new(
                    Plan: "pro",
                    Role: "owner",
                    DisplayName: "Pro",
                    Description: "Full autoresponder suite with analytics + template library.",
                    Capabilities: ImmutableArray.Create("auto-replies", "templates-advanced", "after-hours", "keyword-routing", "analytics"),
                    SortOrder: 3)
            };

        public static TenantRoleDefinition Resolve(string? planOrRole)
        {
            if (!string.IsNullOrWhiteSpace(planOrRole) &&
                _definitions.TryGetValue(planOrRole, out var definition))
            {
                return definition;
            }

            return _definitions["trial"];
        }

        public static TenantRoleDefinition Resolve(string? plan, string? preferredRole)
        {
            if (!string.IsNullOrWhiteSpace(preferredRole) &&
                _definitions.TryGetValue(preferredRole, out var roleDefinition))
            {
                return roleDefinition;
            }

            return Resolve(plan);
        }

        public static IEnumerable<TenantRoleDefinition> All()
            => _definitions.Values.OrderBy(r => r.SortOrder);

        public static string[] ParseCapabilities(string? serializedCapabilities)
        {
            if (string.IsNullOrWhiteSpace(serializedCapabilities))
            {
                return Array.Empty<string>();
            }

            return serializedCapabilities
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToArray();
        }

        public static string SerializeCapabilities(IEnumerable<string> capabilities)
            => string.Join(',', capabilities);
    }
}
