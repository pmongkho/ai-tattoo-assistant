// dotnet-server/_Models/ConsultationRequests.cs
using System;
using Microsoft.AspNetCore.Http;

namespace DotNet.Models
{
    public class StartConsultationRequest
    {
        public string ArtistId { get; set; }
        public string? SquareArtistId { get; set; }  // Square staff id

    }

    public class ConsultationMessageRequest
    {
        public string Message { get; set; }
    }

    public class ConsultationMessageWithImageRequest
    {
        public string Message { get; set; }
        public IFormFile Image { get; set; }
    }
}