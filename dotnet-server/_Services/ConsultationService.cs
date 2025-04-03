// DotNet/Services/ConsultationService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using DotNet.Data;
using DotNet.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DotNet.Services
{
    public interface IConsultationService
    {
        Task<Guid> StartConsultationAsync(string userId, string artistId);
        Task<string> SendMessageAsync(Guid consultationId, string userId, string message);
        Task<string> SendMessageWithImageAsync(Guid consultationId, string userId, string message, IFormFile image);
        Task<ConsultationDto> GetConsultationAsync(Guid consultationId, string userId);
        Task<List<ConsultationDto>> GetUserConsultationsAsync(string userId);
        Task<bool> UpdateConsultationStatusAsync(Guid consultationId, string status, string userId);
    }

    public class ConsultationService : IConsultationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ChatService _chatService;
        private readonly IStorageService _storageService;
        private readonly ILogger<ConsultationService> _logger;

        // System prompt for consultation
        private static readonly string _systemPrompt = @"You are a professional tattoo consultation assistant.
Guide the conversation naturally by asking ONE question at a time about the client's tattoo preferences.
Follow this sequence of topics, but only move to the next topic after getting an answer to the current one:

1. First, ask what subject matter they're interested in for their tattoo (e.g., portrait, animal, abstract design).
2. Once you know the subject, ask which tattoo style they prefer (e.g., Black and Grey Realism, Japanese Traditional, Fine Line, Neo Traditional, Color).
3. After learning the style, ask where on their body they'd like the tattoo placed.
   - When they mention a general body part, ask for more specific placement details:
     - For arm: Ask if they prefer inner/outer forearm, bicep, tricep, shoulder, or full sleeve
     - For leg: Ask if they prefer thigh, calf, ankle, or shin
     - For torso: Ask if they prefer chest, ribs, stomach, back, or shoulder blade
     - For hand/foot: Ask if they prefer top of hand/foot, wrist, fingers, or ankle
     - For neck/face: Ask for the exact placement (side of neck, behind ear, etc.)
4. Then ask about the approximate size in inches they're considering.
5. Next, discuss price expectations.
6. Finally, if they're ready, discuss appointment scheduling.

Keep your responses friendly, brief, and focused on one question at a time. Don't overwhelm the client with multiple questions in a single message.";

        public ConsultationService(
            ApplicationDbContext context,
            ChatService chatService,
            IStorageService storageService,
            ILogger<ConsultationService> logger)
        {
            _context = context;
            _chatService = chatService;
            _storageService = storageService;
            _logger = logger;
        }

        public async Task<Guid> StartConsultationAsync(string userId, string artistId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    throw new KeyNotFoundException("User not found");
                }

                // Create a new consultation
                var consultation = new Consultation
                {
                    ClientId = userId,
                    ArtistId = artistId,
                    Status = "pending",
                    SubmittedAt = DateTime.UtcNow
                };

                // Initialize chat history with system prompt
                var chatHistory = new List<ChatMessage>
                {
                    new ChatMessage("system", _systemPrompt)
                };

                // Store chat history as JSON
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);

                _context.Consultations.Add(consultation);
                await _context.SaveChangesAsync();

                return consultation.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting consultation");
                throw;
            }
        }

        public async Task<string> SendMessageAsync(Guid consultationId, string userId, string message)
        {
            try
            {
                var consultation = await _context.Consultations
                    .FirstOrDefaultAsync(c => c.Id == consultationId && (c.ClientId == userId || c.ArtistId == userId));

                if (consultation == null)
                {
                    throw new KeyNotFoundException("Consultation not found");
                }

                // Deserialize chat history
                var chatHistory = JsonSerializer.Deserialize<List<ChatMessage>>(
                    consultation.ChatHistory) ?? new List<ChatMessage>();

                // Add user message
                chatHistory.Add(new ChatMessage("user", message));

                // Get AI response
                var aiResponse = await _chatService.GetChatResponseAsync(chatHistory);

                // Add AI response to history
                chatHistory.Add(new ChatMessage("assistant", aiResponse));

                // Update consultation with new chat history
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);

                // Update consultation fields based on conversation
                UpdateConsultationFromChat(consultation, chatHistory);

                await _context.SaveChangesAsync();

                return aiResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                throw;
            }
        }

        public async Task<string> SendMessageWithImageAsync(Guid consultationId, string userId, string message, IFormFile image)
        {
            try
            {
                var consultation = await _context.Consultations
                    .FirstOrDefaultAsync(c => c.Id == consultationId && (c.ClientId == userId || c.ArtistId == userId));

                if (consultation == null)
                {
                    throw new KeyNotFoundException("Consultation not found");
                }

                string imageUrl = null;

                // Upload image if provided
                if (image != null)
                {
                    imageUrl = await _storageService.UploadFileAsync(image);

                    // Save image to UserImages
                    var userImage = new UserImage
                    {
                        UserId = userId,
                        ImageUrl = imageUrl,
                        ImageType = "Reference",
                        Description = message ?? "Consultation reference image",
                        OriginalFileName = image.FileName,
                        FileSize = image.Length,
                        ContentType = image.ContentType
                    };

                    _context.UserImages.Add(userImage);

                    // Update consultation image URL
                    consultation.ImageUrl = imageUrl;
                }

                // Deserialize chat history
                var chatHistory = JsonSerializer.Deserialize<List<ChatMessage>>(
                    consultation.ChatHistory) ?? new List<ChatMessage>();

                // Add user message with image
                if (imageUrl != null)
                {
                    chatHistory.Add(new ChatMessage("user", message ?? "Here's a reference image", imageUrl));
                }
                else
                {
                    chatHistory.Add(new ChatMessage("user", message));
                }

                // Get AI response
                var aiResponse = await _chatService.GetChatResponseWithImageAsync(chatHistory);

                // Add AI response to history
                chatHistory.Add(new ChatMessage("assistant", aiResponse));

                // Update consultation with new chat history
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);

                // Update consultation fields based on conversation
                UpdateConsultationFromChat(consultation, chatHistory);

                await _context.SaveChangesAsync();

                return aiResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message with image");
                throw;
            }
        }

        public async Task<ConsultationDto> GetConsultationAsync(Guid consultationId, string userId)
        {
            try
            {
                var consultation = await _context.Consultations
                    .Include(c => c.Client)
                    .Include(c => c.Artist)
                    .FirstOrDefaultAsync(c => c.Id == consultationId && (c.ClientId == userId || c.ArtistId == userId));

                if (consultation == null)
                {
                    throw new KeyNotFoundException("Consultation not found");
                }

                // Deserialize chat history
                var chatHistory = JsonSerializer.Deserialize<List<ChatMessage>>(
                    consultation.ChatHistory) ?? new List<ChatMessage>();

                // Remove system prompt for client view
                var clientChatHistory = chatHistory.Where(m => m.Role != "system").ToList();

                return new ConsultationDto
                {
                    Id = consultation.Id,
                    Client = new UserDto
                    {
                        Id = consultation.Client.Id,
                        FullName = consultation.Client.FullName,
                        Email = consultation.Client.Email,
                        PhoneNumber = consultation.Client.PhoneNumber,
                        ProfileImageUrl = consultation.Client.ProfileImageUrl
                    },
                    Artist = new UserDto
                    {
                        Id = consultation.Artist.Id,
                        FullName = consultation.Artist.FullName,
                        Email = consultation.Artist.Email,
                        PhoneNumber = consultation.Artist.PhoneNumber,
                        ProfileImageUrl = consultation.Artist.ProfileImageUrl
                    },
                    Style = consultation.Style,
                    BodyPart = consultation.BodyPart,
                    ImageUrl = consultation.ImageUrl,
                    Size = consultation.Size,
                    PriceExpectation = consultation.PriceExpectation,
                    Availability = consultation.Availability,
                    Status = consultation.Status,
                    SubmittedAt = consultation.SubmittedAt,
                    ChatHistory = clientChatHistory
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting consultation");
                throw;
            }
        }

        public async Task<List<ConsultationDto>> GetUserConsultationsAsync(string userId)
        {
            try
            {
                var consultations = await _context.Consultations
                    .Include(c => c.Client)
                    .Include(c => c.Artist)
                    .Where(c => c.ClientId == userId || c.ArtistId == userId)
                    .OrderByDescending(c => c.SubmittedAt)
                    .ToListAsync();

                var consultationDtos = new List<ConsultationDto>();

                foreach (var consultation in consultations)
                {
                    // Deserialize chat history
                    var chatHistory = JsonSerializer.Deserialize<List<ChatMessage>>(
                        consultation.ChatHistory) ?? new List<ChatMessage>();

                    // Remove system prompt for client view
                    var clientChatHistory = chatHistory.Where(m => m.Role != "system").ToList();

                    consultationDtos.Add(new ConsultationDto
                    {
                        Id = consultation.Id,
                        Client = new UserDto
                        {
                            Id = consultation.Client.Id,
                            FullName = consultation.Client.FullName,
                            Email = consultation.Client.Email,
                            PhoneNumber = consultation.Client.PhoneNumber,
                            ProfileImageUrl = consultation.Client.ProfileImageUrl
                        },
                        Artist = new UserDto
                        {
                            Id = consultation.Artist.Id,
                            FullName = consultation.Artist.FullName,
                            Email = consultation.Artist.Email,
                            PhoneNumber = consultation.Artist.PhoneNumber,
                            ProfileImageUrl = consultation.Artist.ProfileImageUrl
                        },
                        Style = consultation.Style,
                        BodyPart = consultation.BodyPart,
                        ImageUrl = consultation.ImageUrl,
                        Size = consultation.Size,
                        PriceExpectation = consultation.PriceExpectation,
                        Availability = consultation.Availability,
                        Status = consultation.Status,
                        SubmittedAt = consultation.SubmittedAt,
                        ChatHistory = clientChatHistory
                    });
                }

                return consultationDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user consultations");
                throw;
            }
        }

        public async Task<bool> UpdateConsultationStatusAsync(Guid consultationId, string status, string userId)
        {
            try
            {
                var consultation = await _context.Consultations
                    .FirstOrDefaultAsync(c => c.Id == consultationId && (c.ClientId == userId || c.ArtistId == userId));

                if (consultation == null)
                {
                    throw new KeyNotFoundException("Consultation not found");
                }

                // Only allow valid status values
                if (status != "pending" && status != "approved" && status != "rejected")
                {
                    throw new ArgumentException("Invalid status value");
                }

                consultation.Status = status;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating consultation status");
                throw;
            }
        }

        private void UpdateConsultationFromChat(Consultation consultation, List<ChatMessage> chatHistory)
        {
            // Extract information from chat history to update consultation fields
            foreach (var message in chatHistory.Where(m => m.Role == "user"))
            {
                // Extract style information
                if (message.Content.Contains("style", StringComparison.OrdinalIgnoreCase))
                {
                    if (message.Content.Contains("realism", StringComparison.OrdinalIgnoreCase))
                        consultation.Style = "Realism";
                    else if (message.Content.Contains("traditional", StringComparison.OrdinalIgnoreCase))
                        consultation.Style = "Traditional";
                    else if (message.Content.Contains("japanese", StringComparison.OrdinalIgnoreCase))
                        consultation.Style = "Japanese";
                    else if (message.Content.Contains("fine line", StringComparison.OrdinalIgnoreCase))
                        consultation.Style = "Fine Line";
                }
                
                // Extract body part information
                if (message.Content.Contains("arm", StringComparison.OrdinalIgnoreCase) ||
                    message.Content.Contains("forearm", StringComparison.OrdinalIgnoreCase) ||
                    message.Content.Contains("sleeve", StringComparison.OrdinalIgnoreCase))
                {
                    consultation.BodyPart = "Arm";
                }
                else if (message.Content.Contains("leg", StringComparison.OrdinalIgnoreCase) ||
                         message.Content.Contains("thigh", StringComparison.OrdinalIgnoreCase) ||
                         message.Content.Contains("calf", StringComparison.OrdinalIgnoreCase))
                {
                    consultation.BodyPart = "Leg";
                }
                else if (message.Content.Contains("back", StringComparison.OrdinalIgnoreCase) ||
                         message.Content.Contains("chest", StringComparison.OrdinalIgnoreCase) ||
                         message.Content.Contains("torso", StringComparison.OrdinalIgnoreCase))
                {
                    consultation.BodyPart = "Torso";
                }
                
                // Extract size information
                if (message.Content.Contains("inch", StringComparison.OrdinalIgnoreCase) ||
                    message.Content.Contains("size", StringComparison.OrdinalIgnoreCase))
                {
                    var sizeRegex = new Regex(@"(\d+)(?:\s*x\s*(\d+))?\s*inch");
                    var match = sizeRegex.Match(message.Content);
                    if (match.Success)
                    {
                        consultation.Size = match.Value;
                    }
                }
                
                // Extract price expectation
                if (message.Content.Contains("price", StringComparison.OrdinalIgnoreCase) ||
                    message.Content.Contains("cost", StringComparison.OrdinalIgnoreCase) ||
                    message.Content.Contains("budget", StringComparison.OrdinalIgnoreCase))
                {
                    var priceRegex = new Regex(@"\$(\d+)");
                    var match = priceRegex.Match(message.Content);
                    if (match.Success)
                    {
                        consultation.PriceExpectation = match.Value;
                    }
                }
                
                // Extract availability information
                if (message.Content.Contains("available", StringComparison.OrdinalIgnoreCase) ||
                    message.Content.Contains("schedule", StringComparison.OrdinalIgnoreCase) ||
                    message.Content.Contains("appointment", StringComparison.OrdinalIgnoreCase))
                {
                    consultation.Availability = message.Content;
                }
            }
        }
    }

    // DTOs for consultation service
    public class ConsultationDto
    {
        public Guid Id { get; set; }
        public UserDto Client { get; set; }
        public UserDto Artist { get; set; }
        public string Style { get; set; }
        public string BodyPart { get; set; }
        public string ImageUrl { get; set; }
        public string Size { get; set; }
        public string PriceExpectation { get; set; }
        public string Availability { get; set; }
        public string Status { get; set; }
        public DateTime SubmittedAt { get; set; }
        public List<ChatMessage> ChatHistory { get; set; }
    }

    public class UserDto
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string ProfileImageUrl { get; set; }
    }
}
