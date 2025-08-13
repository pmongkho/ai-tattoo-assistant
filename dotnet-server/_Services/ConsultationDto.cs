// _Services/ConsultationDto.cs
using System;
using System.Collections.Generic;

namespace DotNet.Services
{
    /// <summary>Shape of consultation data returned to the Angular client.</summary>
    public class ConsultationDto
    {
        public Guid Id { get; set; }
        public string Status { get; set; } = "pending";
        public DateTime SubmittedAt { get; set; }

        // Optional raw ids if you use them on the client
        public string? ArtistId { get; set; }
        public string? ClientId { get; set; }

        // Rich user summaries for UI (this is what ConsultationService populates)
        public UserDto? Client { get; set; }
        public UserDto? Artist { get; set; }

        // Tattoo request details
        public string? Style { get; set; }
        public string? BodyPart { get; set; }
        public string? ImageUrl { get; set; }
        public string? Size { get; set; }
        public string? PriceExpectation { get; set; }
        public string? Availability { get; set; }

        // Chat history with system messages filtered out
        public List<ChatMessageDto> ChatHistory { get; set; } = new();
    }

    /// <summary>Lightweight chat message for API responses (mirrors DotNet.Models.ChatMessage).</summary>
    public class ChatMessageDto
    {
        public string Role { get; set; } = default!;
        public string Content { get; set; } = default!;
        public string? ImageUrl { get; set; }
        public DateTime? Timestamp { get; set; } // optional (your ChatMessage doesn’t currently expose this)
    }

    /// <summary>Minimal user projection for client display.</summary>
    public class UserDto
    {
        public string Id { get; set; } = default!;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
}