using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace DotNet.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Basic profile information
        public string FullName { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        
        // User role for the application
        public string UserRole { get; set; } = string.Empty; // "Artist" or "Client"
        
        // Navigation property for user's uploaded images
        public List<UserImage> UploadedImages { get; set; } = new List<UserImage>();
    }
}
