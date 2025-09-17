using System.Threading.Tasks;
using DotNet.Models;

namespace DotNet.Services
{
    public interface IMessagingIntegrationService
    {
        Task<string> ProcessIncomingMessageAsync(string platform, Tenant tenant, string senderHandle, string message);
    }
}
