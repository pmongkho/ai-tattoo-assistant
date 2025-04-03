// dotnet-server/_Models/ArtistProfile.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotNet.Models
{
    public class ArtistProfile
    {
        [Key]
        [ForeignKey("User")]
        public string UserId { get; set; } = string.Empty;
        
        public string CompanyName { get; set; } = string.Empty;
        
        // Store as array in PostgreSQL
        public string[] Styles { get; set; } = Array.Empty<string>();
        
        public decimal HourlyRate { get; set; }
        
        public string InstagramUrl { get; set; } = string.Empty;
        
        public string Bio { get; set; } = string.Empty;
        
        // Navigation property back to the user
        public virtual ApplicationUser User { get; set; } = null!;
    }
}