using System;
using System.ComponentModel.DataAnnotations;

namespace DotNet.Models
{
    /// <summary>
    /// Represents an artist tenant using the AI Tattoo Assistant service.
    /// Stores identifiers for routing and encrypted access tokens.
    /// </summary>
    public class Tenant
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Display name for the tattoo artist or studio.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Facebook Page ID associated with this tenant.
        /// </summary>
        public string? MetaPageId { get; set; }

        /// <summary>
        /// Instagram Business Account ID associated with this tenant.
        /// </summary>
        public string? InstagramAccountId { get; set; }

        /// <summary>
        /// Encrypted long-lived Page Access Token.
        /// </summary>
        public string? EncryptedPageAccessToken { get; set; }

        /// <summary>
        /// Encrypted Instagram access token.
        /// </summary>
        public string? EncryptedInstagramToken { get; set; }
    }
}
