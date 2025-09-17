using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotNet.Models
{
    /// <summary>
    /// Persisted chat message linked to a consultation.
    /// </summary>
    public class ConsultationMessage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [ForeignKey(nameof(Consultation))]
        public Guid ConsultationId { get; set; }

        public int OrderIndex { get; set; }

        [Required]
        public string Role { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Consultation Consultation { get; set; } = null!;
    }
}
