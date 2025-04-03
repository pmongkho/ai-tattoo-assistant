// DotNet/Models/Requests/ConsultationRequests.cs
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DotNet.Models.Requests
{
    public class StartConsultationRequest
    {
        [Required]
        public string ArtistId { get; set; }
    }

    public class ConsultationMessageRequest
    {
        [Required]
        public string Message { get; set; }
    }

    public class ConsultationMessageWithImageRequest
    {
        public string Message { get; set; }
        
        [Required]
        public IFormFile Image { get; set; }
    }

    public class UpdateConsultationStatusRequest
    {
        [Required]
        [RegularExpression("pending|approved|rejected", ErrorMessage = "Status must be 'pending', 'approved', or 'rejected'")]
        public string Status { get; set; }
    }
}