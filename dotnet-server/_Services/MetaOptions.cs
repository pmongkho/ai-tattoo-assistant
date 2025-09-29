using System;

namespace DotNet.Services
{
    /// <summary>
    /// Strongly typed configuration for Meta (Facebook/Instagram) OAuth + Graph API calls.
    /// </summary>
    public class MetaOptions
    {
        public string AppId { get; set; } = string.Empty;
        public string AppSecret { get; set; } = string.Empty;
        public string RedirectUri { get; set; } = string.Empty;
        public string OAuthDialogBase { get; set; } = "https://www.facebook.com/v21.0/dialog/oauth";
        public string GraphApiBase { get; set; } = "https://graph.facebook.com/v21.0/";
        public string WebhookVerifyToken { get; set; } = "tattoo-verify-prod";
        public string[] Scopes { get; set; } = Array.Empty<string>();
        public string PostConnectMessage { get; set; } = "You can close this window and return to AI Tattoo Assistant.";
    }
}
