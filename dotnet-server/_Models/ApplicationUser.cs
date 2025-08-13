// dotnet-server/_Models/ApplicationUser.cs
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotNet.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Map to your SQL schema
        public string FullName { get; set; } = string.Empty;
        public string? SquareArtistId { get; set; }   // <-- add this

        
        // Override email to match your schema
        [PersonalData]
        public override string Email { get; set; } = string.Empty;
        
        [PersonalData]
        public override string PhoneNumber { get; set; } = string.Empty;
        
        [PersonalData]
        public string ProfileImageUrl { get; set; } = string.Empty;
        
        // User role matching your SQL CHECK constraint
        [PersonalData]
        public string UserRole { get; set; } = "client"; // "artist" or "client"
        
        // Creation timestamp
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ArtistProfile? ArtistProfile { get; set; }
        
        public virtual List<UserImage> UploadedImages { get; set; } = new List<UserImage>();
        
        public virtual List<Consultation> ClientConsultations { get; set; } = new List<Consultation>();
        
        public virtual List<Consultation> ArtistConsultations { get; set; } = new List<Consultation>();
        
        public virtual List<TattooJob> CreatedJobs { get; set; } = new List<TattooJob>();
        
        public virtual List<Appointment> ClientAppointments { get; set; } = new List<Appointment>();
        
        public virtual List<Appointment> ArtistAppointments { get; set; } = new List<Appointment>();
    }
}