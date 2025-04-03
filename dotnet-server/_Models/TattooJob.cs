// dotnet-server/_Models/TattooJob.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotNet.Models
{
    public class TattooJob
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        
        [ForeignKey("Creator")]
        public string CreatedById { get; set; } = string.Empty;
        
        public virtual ApplicationUser Creator { get; set; } = null!;
        
        public string Type { get; set; } = string.Empty; // "client_request", "artist_offer"
        
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string Style { get; set; } = string.Empty;
        
        public string ImageUrl { get; set; } = string.Empty;
        
        public decimal Price { get; set; }
        
        public bool IsBooked { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}