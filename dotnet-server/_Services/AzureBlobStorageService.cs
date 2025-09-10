using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;

namespace DotNet.Services
{
    public class AzureBlobStorageService : IStorageService
    {
        private readonly BlobContainerClient _containerClient;
        private readonly ILogger<AzureBlobStorageService> _logger;

        public AzureBlobStorageService(IConfiguration configuration, ILogger<AzureBlobStorageService> logger)
        {
            _logger = logger;
            var connectionString = Environment.GetEnvironmentVariable("AZURE_STORAGE_CONNECTION_STRING") ??
                                   configuration["AzureStorage:ConnectionString"];
            var containerName = Environment.GetEnvironmentVariable("AZURE_STORAGE_CONTAINER") ??
                                configuration["AzureStorage:ContainerName"] ?? "consultation-images";

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("Azure storage connection string is not configured");
            }

            var serviceClient = new BlobServiceClient(connectionString);
            _containerClient = serviceClient.GetBlobContainerClient(containerName);
            _containerClient.CreateIfNotExists(PublicAccessType.Blob);
        }

        public async Task<string> UploadFileAsync(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var blobName = $"consultations/{Guid.NewGuid()}{extension}";
            var blobClient = _containerClient.GetBlobClient(blobName);

            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

            return blobClient.Uri.ToString();
        }

        public async Task<bool> DeleteFileAsync(string fileName)
        {
            try
            {
                if (fileName.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                {
                    fileName = GetFileNameFromUrl(fileName);
                }

                await _containerClient.DeleteBlobIfExistsAsync(fileName);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting blob {fileName}");
                return false;
            }
        }

        public string GetFileNameFromUrl(string url)
        {
            var uri = new Uri(url);
            var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (segments.Length >= 2)
            {
                return string.Join('/', segments.Skip(1));
            }
            throw new ArgumentException("Invalid blob url", nameof(url));
        }
    }
}
