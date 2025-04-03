// dotnet-server/_Models/Consultation.cs
using System;
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
        public string ClientId { get; set; } = string.Empty;
        
        public virtual ApplicationUser Client { get; set; } = null!;
        
        [ForeignKey("Artist")]
        public string ArtistId { get; set; } = string.Empty;
        
        public virtual ApplicationUser Artist { get; set; } = null!;
        
        public string Style { get; set; } = string.Empty;
        
        public string BodyPart { get; set; } = string.Empty;
        
        public string ImageUrl { get; set; } = string.Empty;
        
        public string Size { get; set; } = string.Empty;
        
        public string PriceExpectation { get; set; } = string.Empty;
        
        public string Availability { get; set; } = string.Empty;
        
        public string Status { get; set; } = "pending"; // "pending", "approved", "rejected"
        
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property for appointments
        public virtual List<Appointment> Appointments { get; set; } = new List<Appointment>();
        
        // Store the chat history as JSON
        public string ChatHistory { get; set; } = string.Empty;
    }
}