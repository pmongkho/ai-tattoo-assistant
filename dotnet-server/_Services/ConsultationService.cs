// DotNet/Services/ConsultationService.cs
using System.Text.Json;
using System.Text.RegularExpressions;
using DotNet.Data;
using DotNet.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;


namespace DotNet.Services
{

    public class ConsultationService : IConsultationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IStorageService _storageService;
        private readonly ILogger<ConsultationService> _logger;
        private readonly ISquareAppointmentsService _squareAppointmentsService;
        private readonly UserManager<ApplicationUser> _userManager; // <-- add this
        private readonly ChatService _chatService;


        public ConsultationService(
            ApplicationDbContext context,
            IStorageService storageService,
            ILogger<ConsultationService> logger,
            UserManager<ApplicationUser> userManager, // <-- add this
            ChatService chatService,
            ISquareAppointmentsService squareAppointmentsService)
        {
            _context = context;
            _storageService = storageService;
            _logger = logger;
            _userManager = userManager; // <-- set it
            _chatService = chatService;
            _squareAppointmentsService = squareAppointmentsService;
        }




        private static bool ChatHasSubject(string? chatJson)
        {
            if (string.IsNullOrWhiteSpace(chatJson)) return false;
            try
            {
                var msgs = JsonSerializer.Deserialize<List<ChatMessage>>(chatJson) ?? new();
                return msgs.Any(m => m.Role == "user" && Regex.IsMatch(m.Content ?? "",
                    @"(portrait|animal|flower|skull|script|lettering|abstract|lion|tiger|rose|name|quote|butterfly|dragon)",
                    RegexOptions.IgnoreCase));
            }
            catch
            {
                return false;
            }
        }

        private static bool UserDeclinedImage(Consultation c)
        {
            if (string.IsNullOrWhiteSpace(c.ChatHistory)) return false;
            try
            {
                var msgs = JsonSerializer.Deserialize<List<ChatMessage>>(c.ChatHistory) ?? new();
                return msgs.Any(m => m.Role == "user" &&
                    Regex.IsMatch(m.Content ?? "", @"\b(no|none|nope)\b", RegexOptions.IgnoreCase));
            }
            catch
            {
                return false;
            }
        }

        private static bool LooksLikeFullName(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return false;
            var parts = s.Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            return parts.Length >= 1 && parts.All(p => p.Length >= 2);
        }

        private static bool LooksLikePhone(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return false;
            var digits = new string(s.Where(char.IsDigit).ToArray());
            return digits.Length >= 10; // loose: US-style minimum
        }

        private static bool LooksLikeAvailability(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return false;
            var t = s.ToLowerInvariant();
            // require a day or a time window indicator (either is enough)
            var hasDay = Regex.IsMatch(t,
                @"\b(mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|weekdays?|weekends?)\b");
            var hasTime = Regex.IsMatch(t, @"\b(morning|afternoon|evening|any\s*time|anytime|after\s*\d|before\s*\d|am|pm)\b");
            return hasDay || hasTime;
        }


        private static (string fullName, string phone) ExtractContactFromChat(string? chatJson)
        {
            if (string.IsNullOrWhiteSpace(chatJson)) return ("", "");
            List<ChatMessage> msgs;
            try
            {
                msgs = JsonSerializer.Deserialize<List<ChatMessage>>(chatJson) ?? new();
            }
            catch
            {
                return ("", "");
            }

            string name = null, phone = null;

            foreach (var m in msgs.Where(m => m.Role == "user"))
            {
                var text = m.Content ?? string.Empty;

                // Phone: capture common formats
                var phoneMatch = Regex.Match(text, @"(\+?\d[\d\-\s\(\)]{7,}\d)");
                if (phoneMatch.Success && string.IsNullOrWhiteSpace(phone))
                    phone = NormalizePhone(phoneMatch.Value);

                if (string.IsNullOrWhiteSpace(name))
                {
                    // Prefer two-word names
                    var nameMatch = Regex.Match(text,
                        @"\b([A-Za-z][A-Za-z'’-]+)\s+([A-Za-z][A-Za-z'’-]+(?:\s+[A-Za-z][A-Za-z'’-]+)?)\b");
                    if (nameMatch.Success)
                    {
                        name = ToTitle(nameMatch.Value.Trim());
                    }
                    else if (phoneMatch.Success)
                    {
                        // Fallback: single word immediately before the phone number
                        var beforePhone = text[..phoneMatch.Index];
                        var singleNameMatch = Regex.Match(beforePhone, @"\b([A-Za-z][A-Za-z'’-]+)\b\s*$");
                        if (singleNameMatch.Success)
                            name = ToTitle(singleNameMatch.Value.Trim());
                    }
                }

                if (!string.IsNullOrWhiteSpace(name) && !string.IsNullOrWhiteSpace(phone))
                    break;
            }

            return (name ?? "", phone ?? "");
        }

        private static string NormalizePhone(string raw)
        {
            var digits = new string((raw ?? "").Where(char.IsDigit).ToArray());
            if (digits.Length == 10) return "+1" + digits; // US 10-digit
            if (digits.Length == 11 && digits.StartsWith("1")) return "+" + digits;
            if ((raw ?? "").Trim().StartsWith("+")) return (raw ?? "").Trim();
            return "+" + digits; // fallback
        }

        private static string ToTitle(string s) =>
            Regex.Replace((s ?? "").ToLowerInvariant(), @"\b\w", m => m.Value.ToUpperInvariant());

        private void UpdateStatusIfComplete(Consultation c)
        {
            bool hasSubjectOrImage = !string.IsNullOrWhiteSpace(c.ImageUrl) || ChatHasSubject(c.ChatHistory);
            bool hasStyle = !string.IsNullOrWhiteSpace(c.Style);
            bool hasBody = !string.IsNullOrWhiteSpace(c.BodyPart);
            bool hasSize = !string.IsNullOrWhiteSpace(c.Size);
            bool hasBudget = !string.IsNullOrWhiteSpace(c.PriceExpectation);
            bool hasAvailability = LooksLikeAvailability(c.Availability);

            var (name, phone) = ExtractContactFromChat(c.ChatHistory);
            bool hasName = LooksLikeFullName(!string.IsNullOrWhiteSpace(c.ContactFullName) ? c.ContactFullName : name);
            bool hasPhone = LooksLikePhone(!string.IsNullOrWhiteSpace(c.ContactPhone) ? c.ContactPhone : phone);

            if (hasSubjectOrImage && hasStyle && hasBody && hasSize && hasBudget && hasAvailability && hasName &&
                hasPhone)
            {
                if (string.IsNullOrEmpty(c.Status) || c.Status is "draft" or "pending")
                    c.Status = "awaiting-review";
            }
        }

        // ===== Service methods =====

        public async Task<Guid> StartConsultationAsync(string userId, string artistId, string? squareArtistId)
        {
            try
            {

                var resolvedArtistId = await ResolveArtistIdAsync(artistId, squareArtistId);
                var artistExists = await _userManager.FindByIdAsync(resolvedArtistId);
                if (artistExists == null)
                    throw new ArgumentException("Artist not found");

                if (!string.IsNullOrEmpty(userId))
                {
                    var clientExists = await _userManager.FindByIdAsync(userId);
                    if (clientExists == null)
                        throw new ArgumentException("Client not found");
                }

                var c = new Consultation
                {
                    Id = Guid.NewGuid(),
                    ClientId = string.IsNullOrEmpty(userId) ? null : userId, // allow anonymous
                    ArtistId = resolvedArtistId, // <-- set it HERE
                    Status = "draft",
                    SubmittedAt = DateTime.UtcNow,
                    ChatHistory = "[]" // 🚑 ensure we don't deserialize null
                };

                _context.Consultations.Add(c);
                await _context.SaveChangesAsync();
                return c.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting consultation");
                throw;
            }
        }

        public async Task<Guid> StartExternalConsultationAsync(Guid clientProfileId, string artistId, string? squareArtistId)
        {
            try
            {
                var resolvedArtistId = await ResolveArtistIdAsync(artistId, squareArtistId);
                var artistExists = await _userManager.FindByIdAsync(resolvedArtistId);
                if (artistExists == null)
                    throw new ArgumentException("Artist not found");

                var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(c => c.Id == clientProfileId)
                                    ?? throw new ArgumentException("Client not found");

                var c = new Consultation
                {
                    Id = Guid.NewGuid(),
                    ClientId = null,
                    ClientProfileId = clientProfile.Id,
                    ArtistId = resolvedArtistId,
                    ContactFullName = clientProfile.FullName ?? string.Empty,
                    ContactPhone = clientProfile.PhoneNumber ?? string.Empty,
                    Status = "draft",
                    SubmittedAt = DateTime.UtcNow,
                    ChatHistory = "[]"
                };

                _context.Consultations.Add(c);
                await _context.SaveChangesAsync();
                return c.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting external consultation");
                throw;
            }
        }


        public async Task<string> SendMessageAsync(Guid consultationId, string userId, string message)
        {
            try
            {
                // For anonymous users we can't match on userId (it will be empty).
                // In that case just load by consultationId. Otherwise ensure the
                // requesting user is either the client or artist on the record.
                var query = _context.Consultations.Where(c => c.Id == consultationId);
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    query = query.Where(c => c.ClientId == userId || c.ArtistId == userId);
                }

                var consultation = await query.FirstOrDefaultAsync()
                                   ?? throw new KeyNotFoundException("Consultation not found");

                var chatHistory = string.IsNullOrWhiteSpace(consultation.ChatHistory)
                    ? new List<ChatMessage>()
                    : (JsonSerializer.Deserialize<List<ChatMessage>>(consultation.ChatHistory) ?? new());
                // Log user message
                chatHistory.Add(new ChatMessage("user", message ?? string.Empty));
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);

                // Parse and persist data from this turn
                UpdateConsultationFromChat(consultation, chatHistory);
                PersistContactFromChat(consultation);

                // Use the chat service for a friendly, context-aware reply
                var aiResponse = await _chatService.GetChatResponseAsync(chatHistory);

                // Record assistant message
                chatHistory.Add(new ChatMessage("assistant", aiResponse));
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);

                UpdateStatusIfComplete(consultation);
                await _context.SaveChangesAsync();

                // Try auto-submit when we have availability + contact
                await AutoSubmitIfReadyAsync(consultation);
                await _context.SaveChangesAsync();

                return aiResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                throw;
            }
        }

        public async Task<string> SendExternalMessageAsync(Guid consultationId, Guid clientProfileId, string message)
        {
            try
            {
                var consultation = await _context.Consultations
                    .FirstOrDefaultAsync(c => c.Id == consultationId && c.ClientProfileId == clientProfileId)
                    ?? throw new KeyNotFoundException("Consultation not found");

                var chatHistory = string.IsNullOrWhiteSpace(consultation.ChatHistory)
                    ? new List<ChatMessage>()
                    : (JsonSerializer.Deserialize<List<ChatMessage>>(consultation.ChatHistory) ?? new());
                chatHistory.Add(new ChatMessage("user", message ?? string.Empty));
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);

                UpdateConsultationFromChat(consultation, chatHistory);
                PersistContactFromChat(consultation);

                var aiResponse = await _chatService.GetChatResponseAsync(chatHistory);

                chatHistory.Add(new ChatMessage("assistant", aiResponse));
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);

                UpdateStatusIfComplete(consultation);
                await _context.SaveChangesAsync();

                await AutoSubmitIfReadyAsync(consultation);
                await _context.SaveChangesAsync();

                return aiResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending external message");
                throw;
            }
        }

        public async Task<string> SendMessageWithImageAsync(Guid consultationId, string userId, string message,
            IFormFile image)
        {
            try
            {
                // Allow anonymous users to continue their session by ignoring the
                // user check when no userId is supplied.
                var query = _context.Consultations.Where(c => c.Id == consultationId);
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    query = query.Where(c => c.ClientId == userId || c.ArtistId == userId);
                }

                var consultation = await query.FirstOrDefaultAsync()
                                   ?? throw new KeyNotFoundException("Consultation not found");

                string imageUrl = null;

                if (image != null)
                {
                    imageUrl = await _storageService.UploadFileAsync(image);

                    _context.UserImages.Add(new UserImage
                    {
                        UserId = userId,
                        ImageUrl = imageUrl,
                        ImageType = "Reference",
                        Description = message ?? "Consultation reference image",
                        OriginalFileName = image.FileName,
                        FileSize = image.Length,
                        ContentType = image.ContentType
                    });

                    consultation.ImageUrl = imageUrl;
                }

                var chatHistory = string.IsNullOrWhiteSpace(consultation.ChatHistory)
                    ? new List<ChatMessage>()
                    : (JsonSerializer.Deserialize<List<ChatMessage>>(consultation.ChatHistory) ?? new());
                if (imageUrl != null)
                    chatHistory.Add(new ChatMessage("user", message ?? "Here's a reference image", imageUrl));
                else
                    chatHistory.Add(new ChatMessage("user", message ?? string.Empty));
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);
                UpdateConsultationFromChat(consultation, chatHistory);
                PersistContactFromChat(consultation);

                var aiResponse = await _chatService.GetChatResponseWithImageAsync(chatHistory);

                chatHistory.Add(new ChatMessage("assistant", aiResponse));
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);

                UpdateStatusIfComplete(consultation);
                await _context.SaveChangesAsync();

                await AutoSubmitIfReadyAsync(consultation);
                await _context.SaveChangesAsync();

                return aiResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message with image");
                throw;
            }
        }

        public async Task<string> SendExternalMessageWithImageAsync(Guid consultationId, Guid clientProfileId, string message, IFormFile image)
        {
            try
            {
                var consultation = await _context.Consultations
                    .FirstOrDefaultAsync(c => c.Id == consultationId && c.ClientProfileId == clientProfileId)
                    ?? throw new KeyNotFoundException("Consultation not found");

                string imageUrl = null;

                if (image != null)
                {
                    imageUrl = await _storageService.UploadFileAsync(image);
                    consultation.ImageUrl = imageUrl;
                }

                var chatHistory = string.IsNullOrWhiteSpace(consultation.ChatHistory)
                    ? new List<ChatMessage>()
                    : (JsonSerializer.Deserialize<List<ChatMessage>>(consultation.ChatHistory) ?? new());

                if (imageUrl != null)
                    chatHistory.Add(new ChatMessage("user", message ?? "Here's a reference image", imageUrl));
                else
                    chatHistory.Add(new ChatMessage("user", message ?? string.Empty));
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);

                UpdateConsultationFromChat(consultation, chatHistory);
                PersistContactFromChat(consultation);

                var aiResponse = await _chatService.GetChatResponseWithImageAsync(chatHistory);

                chatHistory.Add(new ChatMessage("assistant", aiResponse));
                consultation.ChatHistory = JsonSerializer.Serialize(chatHistory);

                UpdateStatusIfComplete(consultation);
                await _context.SaveChangesAsync();

                await AutoSubmitIfReadyAsync(consultation);
                await _context.SaveChangesAsync();

                return aiResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending external message with image");
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
                                       .FirstOrDefaultAsync(c =>
                                           c.Id == consultationId && (c.ClientId == userId || c.ArtistId == userId))
                                   ?? throw new KeyNotFoundException("Consultation not found");

                var chatHistory = JsonSerializer.Deserialize<List<ChatMessage>>(consultation.ChatHistory) ?? new();
                                var clientChatHistory = chatHistory
                                                                             .Where(m => m.Role != "system")
                                        .Select(m => new ChatMessageDto { Role = m.Role, Content = m.Content, ImageUrl = m.ImageUrl })
                                       .ToList();
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

        public async Task<ConsultationDto> GetExternalConsultationAsync(Guid consultationId, Guid clientProfileId)
        {
            try
            {
                var consultation = await _context.Consultations
                    .Include(c => c.ClientProfile)
                    .Include(c => c.Artist)
                    .FirstOrDefaultAsync(c => c.Id == consultationId && c.ClientProfileId == clientProfileId)
                    ?? throw new KeyNotFoundException("Consultation not found");

                var chatHistory = JsonSerializer.Deserialize<List<ChatMessage>>(consultation.ChatHistory) ?? new();
                var clientChatHistory = chatHistory
                    .Where(m => m.Role != "system")
                    .Select(m => new ChatMessageDto { Role = m.Role, Content = m.Content, ImageUrl = m.ImageUrl })
                    .ToList();

                return new ConsultationDto
                {
                    Id = consultation.Id,
                    Client = new UserDto
                    {
                        Id = consultation.ClientProfileId.ToString(),
                        FullName = consultation.ClientProfile?.FullName ?? string.Empty,
                        Email = consultation.ClientProfile?.Email ?? string.Empty,
                        PhoneNumber = consultation.ClientProfile?.PhoneNumber ?? string.Empty,
                        ProfileImageUrl = string.Empty
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
                _logger.LogError(ex, "Error getting external consultation");
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
                    var chatHistory = JsonSerializer.Deserialize<List<ChatMessage>>(consultation.ChatHistory) ?? new();
                                        var clientChatHistory = chatHistory
                                                                                     .Where(m => m.Role != "system")
                                            .Select(m => new ChatMessageDto { Role = m.Role, Content = m.Content, ImageUrl = m.ImageUrl })
                                            .ToList();
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

        public async Task<List<ConsultationDto>> GetExternalClientConsultationsAsync(Guid clientProfileId)
        {
            try
            {
                var consultations = await _context.Consultations
                    .Include(c => c.ClientProfile)
                    .Include(c => c.Artist)
                    .Where(c => c.ClientProfileId == clientProfileId)
                    .OrderByDescending(c => c.SubmittedAt)
                    .ToListAsync();

                var consultationDtos = new List<ConsultationDto>();

                foreach (var consultation in consultations)
                {
                    var chatHistory = JsonSerializer.Deserialize<List<ChatMessage>>(consultation.ChatHistory) ?? new();
                    var clientChatHistory = chatHistory
                        .Where(m => m.Role != "system")
                        .Select(m => new ChatMessageDto { Role = m.Role, Content = m.Content, ImageUrl = m.ImageUrl })
                        .ToList();

                    consultationDtos.Add(new ConsultationDto
                    {
                        Id = consultation.Id,
                        Client = new UserDto
                        {
                            Id = consultation.ClientProfileId.ToString(),
                            FullName = consultation.ClientProfile?.FullName ?? string.Empty,
                            Email = consultation.ClientProfile?.Email ?? string.Empty,
                            PhoneNumber = consultation.ClientProfile?.PhoneNumber ?? string.Empty,
                            ProfileImageUrl = string.Empty
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
                _logger.LogError(ex, "Error getting external client consultations");
                throw;
            }
        }

        public async Task<bool> UpdateConsultationStatusAsync(Guid consultationId, string status, string userId)
        {
            try
            {
                var consultation = await _context.Consultations
                                       .FirstOrDefaultAsync(c =>
                                           c.Id == consultationId && (c.ClientId == userId || c.ArtistId == userId))
                                   ?? throw new KeyNotFoundException("Consultation not found");

                if (status is not ("draft" or "awaiting-review" or "submitted-to-square" or "approved" or "rejected"))
                    throw new ArgumentException("Invalid status value");

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
            foreach (var message in chatHistory.Where(m => m.Role == "user"))
            {
                var text = (message.Content ?? string.Empty).Trim();

                // STYLE detection
                if (Regex.IsMatch(text, @"\bchicano\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Chicano";
                else if (Regex.IsMatch(text, @"black\s*(and|&)?\s*gr(e|a)y\s*realism", RegexOptions.IgnoreCase) ||
                         Regex.IsMatch(text, @"\bcolor\s*realism\b", RegexOptions.IgnoreCase) ||
                         Regex.IsMatch(text, @"\b(realism)\b", RegexOptions.IgnoreCase))
                    consultation.Style = text.Contains("color", StringComparison.OrdinalIgnoreCase)
                        ? "Color Realism"
                        : "Black & Grey Realism";
                else if (Regex.IsMatch(text, @"\bfine\s*line\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Fine Line";
                else if (Regex.IsMatch(text, @"\bjapanese\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Japanese";
                else if (Regex.IsMatch(text, @"\bneo[-\s]*traditional\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Neo-Traditional";
                else if (Regex.IsMatch(text, @"\btraditional\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Traditional";
                else if (Regex.IsMatch(text, @"\bwater\s*color\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Watercolor";
                else if (Regex.IsMatch(text, @"\btribal\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Tribal";
                else if (Regex.IsMatch(text, @"\bgeo(metric)?\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Geometric";
                else if (Regex.IsMatch(text, @"\bdotwork\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Dotwork";
                else if (Regex.IsMatch(text, @"\bcolor\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Color";

                // PLACEMENT
                if (Regex.IsMatch(text, @"\bchest\b", RegexOptions.IgnoreCase))
                    consultation.BodyPart = "Chest";
                else if (text.Contains("arm", StringComparison.OrdinalIgnoreCase) ||
                         text.Contains("forearm", StringComparison.OrdinalIgnoreCase) ||
                         text.Contains("sleeve", StringComparison.OrdinalIgnoreCase))
                    consultation.BodyPart = "Arm";
                else if (text.Contains("leg", StringComparison.OrdinalIgnoreCase) ||
                         text.Contains("thigh", StringComparison.OrdinalIgnoreCase) ||
                         text.Contains("calf", StringComparison.OrdinalIgnoreCase))
                    consultation.BodyPart = "Leg";
                else if (Regex.IsMatch(text, @"\b(back|shoulder blade)\b", RegexOptions.IgnoreCase))
                    consultation.BodyPart = "Back";
                else if (Regex.IsMatch(text, @"\b(hand|palm)\b", RegexOptions.IgnoreCase))
                    consultation.BodyPart = "Hand";
                else if (Regex.IsMatch(text, @"\b(foot|feet|ankle)\b", RegexOptions.IgnoreCase))
                    consultation.BodyPart = "Foot";
                else if (Regex.IsMatch(text, @"\bneck\b", RegexOptions.IgnoreCase))
                    consultation.BodyPart = "Neck";
                else if (Regex.IsMatch(text, @"\b(face|head)\b", RegexOptions.IgnoreCase))
                    consultation.BodyPart = "Face";
                else if (Regex.IsMatch(text, @"\b(rib|ribs|side)\b", RegexOptions.IgnoreCase))
                    consultation.BodyPart = "Ribs";
                else if (Regex.IsMatch(text, @"\bshoulder\b", RegexOptions.IgnoreCase))
                    consultation.BodyPart = "Shoulder";
                else if (text.Contains("torso", StringComparison.OrdinalIgnoreCase))
                    consultation.BodyPart = "Torso";

                // SIZE (12x12 OR “12 inches”)
                var sizeMatch = Regex.Match(text, @"\b(\d+)\s*[xX]\s*(\d+)\b|\b(\d+)\s*(inch|inches|in)\b",
                    RegexOptions.IgnoreCase);
                if (sizeMatch.Success)
                {
                    consultation.Size = sizeMatch.Value.Contains('x', StringComparison.OrdinalIgnoreCase)
                        ? $"{sizeMatch.Groups[1].Value}x{sizeMatch.Groups[2].Value} inches"
                        : $"{sizeMatch.Groups[3].Value} inches";
                }

                // BUDGET: accept $1000 / 1000 / “idk / don't know / not sure / tbd”
                if (Regex.IsMatch(text, @"\b(idk|i don'?t know|not sure|tbd)\b", RegexOptions.IgnoreCase))
                {
                    consultation.PriceExpectation = "TBD";
                }
                else
                {
                    var priceMatch = Regex.Match(text, @"\$\s*(\d+)|\b(\d{3,5})\b");
                    if (priceMatch.Success)
                    {
                        consultation.PriceExpectation = priceMatch.Groups[1].Success
                            ? $"${priceMatch.Groups[1].Value}"
                            : $"${priceMatch.Groups[2].Value}";
                    }
                }

                // AVAILABILITY (keep their words; we’ll validate with LooksLikeAvailability)
                if (Regex.IsMatch(text,
                        @"\b(mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|weekdays?|weekends?|morning|afternoon|evening|after\s*\d|before\s*\d|am|pm|free on|can do)\b",
                        RegexOptions.IgnoreCase))
                {
                    consultation.Availability = text;
                }

                // CONTACT (persist early if we spot it)
                var (nm, ph) = ExtractContactFromChat(JsonSerializer.Serialize(new List<ChatMessage>
                    { new ChatMessage("user", text) }));
                if (!string.IsNullOrWhiteSpace(nm) && !LooksLikeFullName(consultation.ContactFullName))
                    consultation.ContactFullName = nm;
                if (!string.IsNullOrWhiteSpace(ph) && !LooksLikePhone(consultation.ContactPhone))
                    consultation.ContactPhone = ph;
            }
        }

        public async Task<string> SubmitToSquareAsync(Guid consultationId, string userId)
        {
            var c = await _context.Consultations
                        .FirstOrDefaultAsync(x =>
                            x.Id == consultationId && (x.ClientId == userId || x.ArtistId == userId))
                    ?? throw new KeyNotFoundException("Consultation not found");

            var missing = new List<string>();
            if (string.IsNullOrWhiteSpace(c.Style)) missing.Add("style");
            if (string.IsNullOrWhiteSpace(c.BodyPart)) missing.Add("placement");
            if (string.IsNullOrWhiteSpace(c.Size)) missing.Add("size");
            if (string.IsNullOrWhiteSpace(c.PriceExpectation)) missing.Add("budget");
            if (!LooksLikeAvailability(c.Availability)) missing.Add("availability");

            var name = LooksLikeFullName(c.ContactFullName)
                ? c.ContactFullName
                : ExtractContactFromChat(c.ChatHistory).fullName;
            var phoneRaw = LooksLikePhone(c.ContactPhone)
                ? c.ContactPhone
                : ExtractContactFromChat(c.ChatHistory).phone;

            if (!LooksLikeFullName(name)) missing.Add("full name");
            if (!LooksLikePhone(phoneRaw)) missing.Add("phone");

            if (missing.Count > 0)
                throw new InvalidOperationException($"Missing required info: {string.Join(", ", missing)}");

            var phone = NormalizePhone(phoneRaw);

            var (customerId, apptId) = await _squareAppointmentsService.CreateAppointmentAsync(
                fullName: name,
                phoneE164: phone,
                availabilityNote: c.Availability,
                style: c.Style,
                bodyPart: c.BodyPart,
                size: c.Size,
                budget: c.PriceExpectation,
                referenceImageUrl: c.ImageUrl
            );

            c.SquareCustomerId = customerId;
            c.SquareAppointmentId = apptId ?? "";
            c.Status = string.IsNullOrEmpty(apptId) ? "awaiting-review" : "submitted-to-square";

            await _context.SaveChangesAsync();
            return apptId;
        }

        private bool IsReadyToSubmit(Consultation c) =>
            LooksLikeFullName(c.ContactFullName) &&
            LooksLikePhone(c.ContactPhone) &&
            LooksLikeAvailability(c.Availability) &&
            string.IsNullOrWhiteSpace(c.SquareAppointmentId);

        private async Task AutoSubmitIfReadyAsync(Consultation c)
        {
            if (!IsReadyToSubmit(c)) return;
            try
            {
                var (customerId, appointmentId) = await _squareAppointmentsService.CreateAppointmentAsync(
                    c.ContactFullName,
                    c.ContactPhone,
                    c.Availability,
                    c.Style,
                    c.BodyPart,
                    c.Size,
                    c.PriceExpectation,
                    c.ImageUrl
                );

                if (!string.IsNullOrWhiteSpace(customerId))
                {
                    c.SquareCustomerId = customerId;
                    c.SquareAppointmentId = appointmentId ?? "";
                    c.Status = string.IsNullOrWhiteSpace(appointmentId) ? "awaiting-review" : "submitted-to-square";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Auto-submit to Square failed for consultation {Id}", c.Id);
            }
        }

        private void PersistContactFromChat(Consultation c)
        {
            var (name, phoneRaw) = ExtractContactFromChat(c.ChatHistory);

            if (!LooksLikeFullName(c.ContactFullName) && LooksLikeFullName(name))
                c.ContactFullName = name;

            if (!LooksLikePhone(c.ContactPhone) && LooksLikePhone(phoneRaw))
                c.ContactPhone = NormalizePhone(phoneRaw);
        }

        // ConsultationService.cs
// Add this helper somewhere in ConsultationService (private method)
// inside ConsultationService
        private async Task<string> ResolveArtistIdAsync(string? artistId, string? squareArtistId)
        {
            if (!string.IsNullOrWhiteSpace(artistId))
            {
                var byId = await _userManager.FindByIdAsync(artistId);
                if (byId != null) return byId.Id;
                _logger.LogWarning("ArtistId '{artistId}' was provided but not found.", artistId);
            }

            if (!string.IsNullOrWhiteSpace(squareArtistId))
            {
                var bySquare = await _userManager.Users
                    .FirstOrDefaultAsync(u => u.SquareArtistId == squareArtistId);
                if (bySquare != null) return bySquare.Id;

                _logger.LogWarning("SquareArtistId '{squareArtistId}' was provided but not found.", squareArtistId);
            }

            throw new ArgumentException("Unknown artist. Provide a valid artistId or squareArtistId.");
        }
        // DTOs for consultation service
    }
}

   