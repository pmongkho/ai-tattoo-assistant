using System.Threading.Tasks;

namespace DotNet.Services
{
    public interface IMessagingIntegrationService
    {
        Task ProcessIncomingMessageAsync(string platform, string artistId, string senderHandle, string message);
    }
}
