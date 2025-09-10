// DotNet/Services/IConsultationService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace DotNet.Services
{
    public interface IConsultationService
    {
        Task<Guid> StartConsultationAsync(string userId, string artistId, string? squareArtistId);
        Task<Guid> StartExternalConsultationAsync(Guid clientProfileId, string artistId, string? squareArtistId);
        Task<string> SendMessageAsync(Guid consultationId, string userId, string message);
        Task<string> SendExternalMessageAsync(Guid consultationId, Guid clientProfileId, string message);
        Task<string> SendMessageWithImageAsync(Guid consultationId, string userId, string message, IFormFile image);
        Task<string> SendExternalMessageWithImageAsync(Guid consultationId, Guid clientProfileId, string message, IFormFile image);
        Task<ConsultationDto> GetConsultationAsync(Guid consultationId, string userId);
        Task<ConsultationDto> GetExternalConsultationAsync(Guid consultationId, Guid clientProfileId);
        Task<List<ConsultationDto>> GetUserConsultationsAsync(string userId);
        Task<List<ConsultationDto>> GetExternalClientConsultationsAsync(Guid clientProfileId);
        Task<bool> UpdateConsultationStatusAsync(Guid consultationId, string status, string userId);
        Task<string> SubmitToSquareAsync(Guid consultationId, string userId);
    }
}