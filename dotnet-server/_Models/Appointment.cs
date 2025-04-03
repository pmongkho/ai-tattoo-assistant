// dotnet-server/_Models/Appointment.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotNet.Models
{
    public class Appointment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        
        [ForeignKey("Consultation")]
        public Guid? ConsultationId { get; set; }
        
        public virtual Consultation? Consultation { get; set; }
        
        [ForeignKey("Client")]
        public string ClientId { get; set; } = string.Empty;
        
        public virtual ApplicationUser Client { get; set; } = null!;
        
        [ForeignKey("Artist")]
        public string ArtistId { get; set; } = string.Empty;
        
        public virtual ApplicationUser Artist { get; set; } = null!;
        
        public DateTime ScheduledFor { get; set; }
        
        public string SquareEventId { get; set; } = string.Empty;
        
        public string Status { get; set; } = "scheduled"; // "scheduled", "completed", "cancelled"
    }
}