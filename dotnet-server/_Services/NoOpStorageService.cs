using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace DotNet.Services
{
    /// <summary>
    /// Fallback <see cref="IStorageService"/> implementation that disables file
    /// storage when no backing provider (e.g. Azure Blob Storage) has been
    /// configured. This prevents the application from failing to resolve
    /// <see cref="ConsultationService"/> at runtime when storage credentials are
    /// missing.
    /// </summary>
    public class NoOpStorageService : IStorageService
    {
        private readonly ILogger<NoOpStorageService> _logger;

        public NoOpStorageService(ILogger<NoOpStorageService> logger)
        {
            _logger = logger;
        }

        public Task<string> UploadFileAsync(IFormFile file)
        {
            _logger.LogWarning("Upload attempted but no storage provider is configured.");
            throw new InvalidOperationException("File storage is not configured.");
        }

        public Task<bool> DeleteFileAsync(string fileName)
        {
            _logger.LogWarning("Delete attempted for {FileName} but no storage provider is configured.", fileName);
            return Task.FromResult(false);
        }

        public string GetFileNameFromUrl(string url)
        {
            return url;
        }
    }
}
