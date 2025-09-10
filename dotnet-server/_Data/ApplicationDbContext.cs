// dotnet-server/Data/ApplicationDbContext.cs
using DotNet.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;

namespace DotNet.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<ArtistProfile> ArtistProfiles { get; set; }
        public DbSet<Consultation> Consultations { get; set; }
        public DbSet<TattooJob> TattooJobs { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<UserImage> UserImages { get; set; }
        
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            // Configure relationships and constraints
            
            // ArtistProfile to ApplicationUser relationship
            builder.Entity<ArtistProfile>()
                .HasOne(ap => ap.User)
                .WithOne(u => u.ArtistProfile)
                .HasForeignKey<ArtistProfile>(ap => ap.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Configure PostgreSQL array types
            builder.Entity<ArtistProfile>()
                .Property(ap => ap.Styles)
                .HasColumnType("text[]");
                
            // UserImage to ApplicationUser relationship
            builder.Entity<UserImage>()
                .HasOne(ui => ui.User)
                .WithMany(u => u.UploadedImages)
                .HasForeignKey(ui => ui.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Consultation relationships
            builder.Entity<Consultation>()
                .HasOne(c => c.Client)
                .WithMany(u => u.ClientConsultations)
                .HasForeignKey(c => c.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.Entity<Consultation>()
                .HasOne(c => c.Artist)
                .WithMany(u => u.ArtistConsultations)
                .HasForeignKey(c => c.ArtistId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // TattooJob relationships
            builder.Entity<TattooJob>()
                .HasOne(tj => tj.Creator)
                .WithMany(u => u.CreatedJobs)
                .HasForeignKey(tj => tj.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Appointment relationships
            builder.Entity<Appointment>()
                .HasOne(a => a.Consultation)
                .WithMany(c => c.Appointments)
                .HasForeignKey(a => a.ConsultationId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.Entity<Appointment>()
                .HasOne(a => a.Client)
                .WithMany(u => u.ClientAppointments)
                .HasForeignKey(a => a.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.Entity<Appointment>()
                .HasOne(a => a.Artist)
                .WithMany(u => u.ArtistAppointments)
                .HasForeignKey(a => a.ArtistId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Optional index (not unique in case a Square account is shared/misconfigured)
            builder.Entity<ApplicationUser>()
                .HasIndex(u => u.SquareArtistId)
                .HasDatabaseName("IX_AspNetUsers_SquareArtistId");
            builder.Entity<Consultation>()
                .HasOne(c => c.Artist)
                .WithMany()
                .HasForeignKey(c => c.ArtistId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);
                
            // Add check constraints
            builder.Entity<ApplicationUser>()
                .HasCheckConstraint("CK_Users_UserRole", "\"UserRole\" IN ('artist', 'client')");
                
            builder.Entity<Consultation>()
                .HasCheckConstraint(
                    "CK_Consultations_Status",
                    "\"Status\" IN ('draft', 'awaiting-review', 'submitted-to-square', 'approved', 'rejected')");
                
            builder.Entity<TattooJob>()
                .HasCheckConstraint("CK_TattooJobs_Type", "\"Type\" IN ('client_request', 'artist_offer')");
                
            builder.Entity<Appointment>()
                .HasCheckConstraint("CK_Appointments_Status", "\"Status\" IN ('scheduled', 'completed', 'cancelled')");
                
            builder.Entity<UserImage>()
                .HasCheckConstraint("CK_UserImages_ImageType", "\"ImageType\" IN ('Profile', 'Reference', 'Placement', 'Portfolio')");
        }
    }
}
