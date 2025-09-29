using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DotNet.Services
{
    public class MetaOAuthService : IMetaOAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly MetaOptions _options;
        private readonly ILogger<MetaOAuthService> _logger;

        private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

        public MetaOAuthService(HttpClient httpClient, IOptions<MetaOptions> options, ILogger<MetaOAuthService> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _logger = logger;

            if (!string.IsNullOrWhiteSpace(_options.GraphApiBase))
            {
                _httpClient.BaseAddress = new Uri(_options.GraphApiBase, UriKind.Absolute);
            }
        }

        public string BuildAuthorizationUrl(string state)
        {
            var scopes = _options.Scopes.Length > 0
                ? string.Join(',', _options.Scopes)
                : string.Join(',', new[]
                {
                    "instagram_manage_messages",
                    "pages_messaging",
                    "pages_manage_metadata",
                    "pages_show_list",
                    "pages_read_engagement",
                    "instagram_basic"
                });

            var parameters = new Dictionary<string, string>
            {
                ["client_id"] = _options.AppId,
                ["redirect_uri"] = _options.RedirectUri,
                ["state"] = state,
                ["response_type"] = "code",
                ["scope"] = scopes
            };

            return QueryHelpers.AddQueryString(_options.OAuthDialogBase, parameters);
        }

        public async Task<MetaConnectResult> CompleteAsync(string code, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                throw new MetaOAuthException("OAuth code is missing.");
            }

            var shortLived = await ExchangeForAccessTokenAsync(new Dictionary<string, string>
            {
                ["client_id"] = _options.AppId,
                ["redirect_uri"] = _options.RedirectUri,
                ["client_secret"] = _options.AppSecret,
                ["code"] = code
            }, cancellationToken);

            var longLived = await ExchangeForAccessTokenAsync(new Dictionary<string, string>
            {
                ["grant_type"] = "fb_exchange_token",
                ["client_id"] = _options.AppId,
                ["client_secret"] = _options.AppSecret,
                ["fb_exchange_token"] = shortLived.AccessToken
            }, cancellationToken);

            var pages = await GetPagesAsync(longLived.AccessToken, cancellationToken);
            var page = pages.FirstOrDefault(p => p.InstagramBusinessAccount?.Id is not null)
                ?? pages.FirstOrDefault();

            if (page is null)
            {
                throw new MetaOAuthException("No Facebook Pages were returned for the authorized user.");
            }

            string? instagramUserId = page.InstagramBusinessAccount?.Id;
            string? instagramUsername = page.InstagramBusinessAccount?.Username;

            if (string.IsNullOrEmpty(instagramUserId))
            {
                // Attempt to hydrate instagram account explicitly if not present.
                var ig = await GetInstagramAccountAsync(page.Id, page.AccessToken, cancellationToken);
                instagramUserId = ig?.Id;
                instagramUsername = ig?.Username ?? instagramUsername;
            }

            if (string.IsNullOrEmpty(instagramUserId))
            {
                throw new MetaOAuthException("Selected page is not linked to an Instagram Business account.");
            }

            return new MetaConnectResult(
                PageId: page.Id,
                PageName: page.Name,
                PageAccessToken: page.AccessToken,
                InstagramBusinessAccountId: instagramUserId,
                InstagramUsername: instagramUsername,
                LongLivedUserToken: longLived.AccessToken);
        }

        public async Task SubscribePageAsync(string pageId, string pageAccessToken, CancellationToken cancellationToken = default)
        {
            var url = $"{pageId}/subscribed_apps";
            using var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["subscribed_fields"] = "messages,messaging_postbacks,instagram_manage_messages",
                ["access_token"] = pageAccessToken
            });

            var response = await _httpClient.PostAsync(url, content, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var error = await TryReadErrorAsync(response, cancellationToken);
                _logger.LogWarning(
                    "Meta subscription call failed for page {PageId} with status {Status}: {Error}",
                    pageId,
                    response.StatusCode,
                    error ?? response.ReasonPhrase);
            }
        }

        private async Task<MetaAccessTokenResponse> ExchangeForAccessTokenAsync(
            IDictionary<string, string> parameters,
            CancellationToken cancellationToken)
        {
            var url = QueryHelpers.AddQueryString("oauth/access_token", parameters!);
            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await TryReadErrorAsync(response, cancellationToken);
                throw new MetaOAuthException($"Failed to exchange OAuth code. {error ?? response.ReasonPhrase}");
            }

            var token = await response.Content.ReadFromJsonAsync<MetaAccessTokenResponse>(SerializerOptions, cancellationToken);
            if (token is null || string.IsNullOrEmpty(token.AccessToken))
            {
                throw new MetaOAuthException("Meta did not return an access token.");
            }

            return token;
        }

        private async Task<IReadOnlyList<MetaPage>> GetPagesAsync(string accessToken, CancellationToken cancellationToken)
        {
            var url = QueryHelpers.AddQueryString(
                "me/accounts",
                new Dictionary<string, string>
                {
                    ["fields"] = "name,id,access_token,instagram_business_account{ id,username }",
                    ["access_token"] = accessToken
                });

            var response = await _httpClient.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var error = await TryReadErrorAsync(response, cancellationToken);
                throw new MetaOAuthException($"Failed to fetch pages. {error ?? response.ReasonPhrase}");
            }

            var payload = await response.Content.ReadFromJsonAsync<MetaPageResponse>(SerializerOptions, cancellationToken);
            if (payload?.Data is null || payload.Data.Count == 0)
            {
                throw new MetaOAuthException("Meta returned no pages for this user.");
            }

            return payload.Data;
        }

        private async Task<MetaInstagramAccount?> GetInstagramAccountAsync(string pageId, string pageAccessToken, CancellationToken cancellationToken)
        {
            var url = QueryHelpers.AddQueryString(
                $"{pageId}",
                new Dictionary<string, string>
                {
                    ["fields"] = "instagram_business_account{ id,username }",
                    ["access_token"] = pageAccessToken
                });

            var response = await _httpClient.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var error = await TryReadErrorAsync(response, cancellationToken);
                _logger.LogWarning(
                    "Failed to hydrate Instagram Business Account for page {PageId}. {Error}",
                    pageId,
                    error ?? response.ReasonPhrase);
                return null;
            }

            var payload = await response.Content.ReadFromJsonAsync<MetaInstagramLookupResponse>(SerializerOptions, cancellationToken);
            return payload?.InstagramBusinessAccount;
        }

        private async Task<string?> TryReadErrorAsync(HttpResponseMessage response, CancellationToken cancellationToken)
        {
            try
            {
                var metaError = await response.Content.ReadFromJsonAsync<MetaErrorResponse>(SerializerOptions, cancellationToken);
                return metaError?.Error?.Message;
            }
            catch
            {
                return null;
            }
        }

        private sealed record MetaAccessTokenResponse(string AccessToken, string? TokenType, int? ExpiresIn);

        private sealed record MetaPageResponse(List<MetaPage> Data);

        private sealed record MetaPage(
            string Id,
            string Name,
            string AccessToken,
            MetaInstagramAccount? InstagramBusinessAccount);

        private sealed record MetaInstagramLookupResponse(MetaInstagramAccount? InstagramBusinessAccount);

        private sealed record MetaInstagramAccount(string Id, string? Username);

        private sealed record MetaErrorResponse(MetaErrorDetail? Error);

        private sealed record MetaErrorDetail(string? Message);
    }

    public sealed class MetaOAuthException : Exception
    {
        public MetaOAuthException(string message) : base(message)
        {
        }
    }
}
