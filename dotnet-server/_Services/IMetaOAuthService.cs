using System.Threading;
using System.Threading.Tasks;

namespace DotNet.Services
{
    public record MetaConnectResult(
        string PageId,
        string PageName,
        string PageAccessToken,
        string InstagramBusinessAccountId,
        string? InstagramUsername,
        string LongLivedUserToken);

    public interface IMetaOAuthService
    {
        string BuildAuthorizationUrl(string state);

        Task<MetaConnectResult> CompleteAsync(string code, CancellationToken cancellationToken = default);

        Task SubscribePageAsync(string pageId, string pageAccessToken, CancellationToken cancellationToken = default);
    }
}
