// dotnet-server/_Models/UserImage.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotNet.Models
{
    public class UserImage
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("User")]
        public string UserId { get; set; } = string.Empty;
        
        public virtual ApplicationUser User { get; set; } = null!;
        
        public string ImageUrl { get; set; } = string.Empty;
        
        public string ImageType { get; set; } = string.Empty; // "Profile", "Reference", "Placement", "Portfolio"
        
        public string Description { get; set; } = string.Empty;
        
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
        
        // Original filename (optional)
        public string OriginalFileName { get; set; } = string.Empty;
        
        // File size in bytes
        public long FileSize { get; set; }
        
        // Content type (MIME type)
        public string ContentType { get; set; } = string.Empty;
    }
}