using System;
using System.Threading.Tasks;
using DotNet.Data;
using DotNet.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DotNet.Services
{
    public class MessagingIntegrationService : IMessagingIntegrationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConsultationService _consultationService;
        private readonly ILogger<MessagingIntegrationService> _logger;

        public MessagingIntegrationService(ApplicationDbContext context, IConsultationService consultationService, ILogger<MessagingIntegrationService> logger)
        {
            _context = context;
            _consultationService = consultationService;
            _logger = logger;
        }

        public async Task<string> ProcessIncomingMessageAsync(string platform, Tenant tenant, string senderHandle, string message)
        {
            if (tenant == null)
            {
                throw new ArgumentNullException(nameof(tenant));
            }

            if (string.IsNullOrWhiteSpace(tenant.ArtistUserId))
            {
                _logger.LogWarning("Tenant {TenantId} missing ArtistUserId mapping; cannot process {Platform} message from {Sender}", tenant.Id, platform, senderHandle);
                throw new InvalidOperationException("Tenant is not linked to an artist user");
            }

            var artistId = tenant.ArtistUserId;

            // Lookup or create an external client based on the sender handle (phone, username, etc.)
            var client = await _context.ClientProfiles.FirstOrDefaultAsync(c =>
                c.ExternalHandle == senderHandle || c.PhoneNumber == senderHandle || c.Email == senderHandle);
            if (client == null)
            {
                client = new ClientProfile
                {
                    FullName = senderHandle,
                    PhoneNumber = senderHandle,
                    ExternalHandle = senderHandle
                };
                _context.ClientProfiles.Add(client);
                await _context.SaveChangesAsync();
            }
            else if (string.IsNullOrWhiteSpace(client.ExternalHandle))
            {
                client.ExternalHandle = senderHandle;
                _context.ClientProfiles.Update(client);
                await _context.SaveChangesAsync();
            }

            // Find existing consultation or start a new one
            var consultation = await _context.Consultations.FirstOrDefaultAsync(c => c.ClientProfileId == client.Id && c.ArtistId == artistId);
            Guid consultationId;
            if (consultation == null)
            {
                consultationId = await _consultationService.StartExternalConsultationAsync(client.Id, artistId, null);
            }
            else
            {
                consultationId = consultation.Id;
            }

            // Send message through consultation service to generate next response
            var response = await _consultationService.SendExternalMessageAsync(consultationId, client.Id, message);

            _logger.LogInformation("{Platform} message processed for {Sender}: {Response}", platform, senderHandle, response);
            return response;
        }
    }
}
