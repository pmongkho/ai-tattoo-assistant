// dotnet-server/_Models/Consultation.cs
using System;
using System.Collections.Generic; // <-- add
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotNet.Models
{
    public class Consultation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [ForeignKey("Client")]
        public string? ClientId { get; set; }
        public virtual ApplicationUser? Client { get; set; } = null!;

        [ForeignKey("ClientProfile")]
        public Guid? ClientProfileId { get; set; }
        public virtual ClientProfile? ClientProfile { get; set; }


        [ForeignKey("Artist")]
        public string ArtistId { get; set; } = string.Empty;
        public virtual ApplicationUser Artist { get; set; } = null!;


        // Tattoo details (keep for filtering/review)
        public string Style { get; set; } = string.Empty;
        public string BodyPart { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string PriceExpectation { get; set; } = string.Empty;

        // Required before sending to Square
        public string Availability { get; set; } = string.Empty;

        // draft -> awaiting-review -> submitted-to-square
        public string Status { get; set; } = "draft";

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public virtual List<Appointment> Appointments { get; set; } = new List<Appointment>();

        /// <summary>
        /// Tracks the wizard step the assistant should ask about next.
        /// </summary>
        public string CurrentStep { get; set; } = "subject";

        /// <summary>
        /// Ordered chat transcript stored as individual rows instead of a JSON blob.
        /// </summary>
        public virtual ICollection<ConsultationMessage> Messages { get; set; } = new List<ConsultationMessage>();

        // Square linkage ONLY (no PII persisted)
        public string SquareCustomerId { get; set; } = string.Empty;
        public string SquareAppointmentId { get; set; } = string.Empty;
        public string SquareSyncError { get; set; } = string.Empty;
        public string ContactFullName { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;


        // (Optional) REMOVE these if you don’t want to store PII locally:
        // public string ContactFullName { get; set; }
        // public string ContactPhone { get; set; }
    }
}
