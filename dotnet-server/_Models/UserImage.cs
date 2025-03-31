// dotnet-server/_Models/UserImage.cs
using System;

namespace DotNet.Models
{
    public class UserImage
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string ImageType { get; set; } = string.Empty; // "Reference" or "Placement"
        public string Description { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ApplicationUser User { get; set; } = null!;
    }
}   