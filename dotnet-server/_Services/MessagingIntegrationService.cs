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

        public async Task ProcessIncomingMessageAsync(string platform, string artistId, string senderHandle, string message)
        {
            // Lookup or create an external client based on the sender handle (phone, username, etc.)
            var client = await _context.ClientProfiles.FirstOrDefaultAsync(c => c.PhoneNumber == senderHandle || c.Email == senderHandle);
            if (client == null)
            {
                client = new ClientProfile
                {
                    FullName = senderHandle,
                    PhoneNumber = senderHandle
                };
                _context.ClientProfiles.Add(client);
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

            // TODO: Send 'response' back to the user via the appropriate platform API
            _logger.LogInformation("{Platform} message processed for {Sender}: {Response}", platform, senderHandle, response);
        }
    }
}
