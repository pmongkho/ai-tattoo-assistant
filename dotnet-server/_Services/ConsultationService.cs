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

        private static readonly string _systemPrompt = @"
You are a professional tattoo consultation assistant.
Be friendly and brief. Ask EXACTLY ONE question at a time.
Do NOT invite the client to come in. Say we will follow up via Square notifications.

Collect these in order and only move forward when the current item is answered:
1) Subject/theme of the tattoo (if the client already gave it, acknowledge and move on).
2) Preferred style (if already given, acknowledge and move on).
3) Body placement (ask for specifics if needed).
4) Approximate size in inches.
5) Budget / price expectations.
6) Availability (days/times that work).
7) FULL NAME (first + last) as it should appear on the appointment.
8) PHONE NUMBER (accept any format; we will normalize).

When all are collected, confirm the summary and say:
“Thanks! I’ll submit this to our booking system. You’ll get Square notifications by text/email. No need to come in unless an appointment is confirmed.”
";

        public ConsultationService(
            ApplicationDbContext context,
            IStorageService storageService,
            ILogger<ConsultationService> logger,
            UserManager<ApplicationUser> userManager, // <-- add this

            ISquareAppointmentsService squareAppointmentsService)
        {
            _context = context;
            _storageService = storageService;
            _logger = logger;
            _userManager = userManager; // <-- set it
            _squareAppointmentsService = squareAppointmentsService;
        }

        // ===== Helpers to decide next question (deterministic) =====

        private static string BuildNextQuestion(Consultation c)
        {
            bool hasSubject = !string.IsNullOrWhiteSpace(c.ImageUrl) || ChatHasSubject(c.ChatHistory);
            if (!hasSubject)
                return "What subject or theme do you want for the tattoo (e.g., lion, floral, lettering, abstract)?";

            if (string.IsNullOrWhiteSpace(c.Style))
                return
                    "Which style do you prefer (e.g., Black & Grey Realism, Chicano, Japanese Traditional, Fine Line, Neo-Traditional, Color)?";

            if (string.IsNullOrWhiteSpace(c.BodyPart))
                return "Where on your body should the tattoo go? If it’s a general area, what exact spot?";

            if (string.IsNullOrWhiteSpace(c.Size))
                return "About how large should it be? Please give a size in inches (e.g., 6x8 inches).";

            if (string.IsNullOrWhiteSpace(c.PriceExpectation))
                return "Do you have a budget or price range in mind? If you’re not sure, just say “TBD”.";

            if (!LooksLikeAvailability(c.Availability))
                return "What day(s) and time window(s) work? For example: “Sat or Sun morning” or “Fri after 6pm.”";

            var name = string.IsNullOrWhiteSpace(c.ContactFullName)
                ? ExtractContactFromChat(c.ChatHistory).fullName
                : c.ContactFullName;
            if (!LooksLikeFullName(name))
                return "What’s your full name (first and last) exactly as you’d like it on the appointment?";

            var phone = string.IsNullOrWhiteSpace(c.ContactPhone)
                ? ExtractContactFromChat(c.ChatHistory).phone
                : c.ContactPhone;
            if (!LooksLikePhone(phone))
                return "What’s the best phone number for Square updates and reminders? (Any format is fine.)";

            return
                "Thanks! I’ll submit this to our booking system now. You’ll get Square notifications by text/email. No need to come in — everything is handled online unless an appointment is confirmed.";
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

        private static bool LooksLikeFullName(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return false;
            var parts = s.Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            return parts.Length >= 2 && parts.All(p => p.Length >= 2);
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
            // must contain a day signal AND a time window
            var hasDay = Regex.IsMatch(t, @"\b(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|weekday|weekend)\b");
            var hasTime = Regex.IsMatch(t, @"\b(morning|afternoon|evening|after\s*\d|before\s*\d|am|pm)\b");
            return hasDay && hasTime;
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
                var text = m.Content ?? "";

                // Name: two words with letters (case-insensitive; we Title-case later)
                var nameMatch = Regex.Match(text,
                    @"\b([A-Za-z][A-Za-z'’-]+)\s+([A-Za-z][A-Za-z'’-]+(?:\s+[A-Za-z][A-Za-z'’-]+)?)\b");
                if (nameMatch.Success && string.IsNullOrWhiteSpace(name))
                    name = ToTitle(nameMatch.Value.Trim());

                // Phone: capture common formats
                var phoneMatch = Regex.Match(text, @"(\+?\d[\d\-\s\(\)]{7,}\d)");
                if (phoneMatch.Success && string.IsNullOrWhiteSpace(phone))
                    phone = NormalizePhone(phoneMatch.Value);

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
                if (string.IsNullOrWhiteSpace(resolvedArtistId))
                    throw new ArgumentException("Unknown artist. Provide a valid artistId or squareArtistId.");

                var c = new Consultation
                {
                    Id = Guid.NewGuid(),
                    ClientId = userId ?? string.Empty, // allow anonymous
                    ArtistId = resolvedArtistId, // <-- set it HERE
                    Status = "started",
                    SubmittedAt = DateTime.UtcNow,
                    ChatHistory = "[]" // 🚑 ensure we don't deserialize null
                };

                var chatHistory = new List<ChatMessage>();
                var firstQ = BuildNextQuestion(c);
                chatHistory.Add(new ChatMessage("assistant", firstQ));
                c.ChatHistory = JsonSerializer.Serialize(chatHistory);

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


        public async Task<string> SendMessageAsync(Guid consultationId, string userId, string message)
        {
            try
            {
                var consultation = await _context.Consultations
                                       .FirstOrDefaultAsync(c =>
                                           c.Id == consultationId && (c.ClientId == userId || c.ArtistId == userId))
                                   ?? throw new KeyNotFoundException("Consultation not found");

                var chatHistory = string.IsNullOrWhiteSpace(consultation.ChatHistory)
                    ? new List<ChatMessage>()
                    : (JsonSerializer.Deserialize<List<ChatMessage>>(consultation.ChatHistory) ?? new());
                // Log user message
                chatHistory.Add(new ChatMessage("user", message ?? string.Empty));

                // Parse and persist data from this turn
                UpdateConsultationFromChat(consultation, chatHistory);
                PersistContactFromChat(consultation);

                // Decide next question (deterministic; no LLM here)
                var nextQ = BuildNextQuestion(consultation);
                var aiResponse = nextQ;

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

        public async Task<string> SendMessageWithImageAsync(Guid consultationId, string userId, string message,
            IFormFile image)
        {
            try
            {
                var consultation = await _context.Consultations
                                       .FirstOrDefaultAsync(c =>
                                           c.Id == consultationId && (c.ClientId == userId || c.ArtistId == userId))
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
                UpdateConsultationFromChat(consultation, chatHistory);
                PersistContactFromChat(consultation);

                var nextQ = BuildNextQuestion(consultation);
                var aiResponse = nextQ;

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

                // STYLE (include Chicano)
                if (Regex.IsMatch(text, @"\bchicano\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Chicano";
                else if (Regex.IsMatch(text, @"black\s*(and|&)?\s*gr(e|a)y\s*realism", RegexOptions.IgnoreCase) ||
                         Regex.IsMatch(text, @"\b(realism)\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Black & Grey Realism";
                else if (Regex.IsMatch(text, @"\bfine\s*line\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Fine Line";
                else if (Regex.IsMatch(text, @"\bjapanese\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Japanese";
                else if (Regex.IsMatch(text, @"\bneo[-\s]*traditional\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Neo-Traditional";
                else if (Regex.IsMatch(text, @"\btraditional\b", RegexOptions.IgnoreCase))
                    consultation.Style = "Traditional";
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
                        @"\b(weekday|weekend|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|morning|afternoon|evening|after\s*\d|before\s*\d|am|pm|free on|can do)\b",
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

   