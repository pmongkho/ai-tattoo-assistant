using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading;

namespace DotNet.Services
{
    public class AzureBlobStorageService : IStorageService
    {
        private readonly BlobContainerClient _containerClient;
        private readonly ILogger<AzureBlobStorageService> _logger;
        private readonly Lazy<Task> _containerInitialization;

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
            // Service constructors are called while ASP.NET Core is resolving a
            // request. Performing a synchronous network operation here turns a
            // transient DNS/Azure outage into an unhandled controller-activation
            // exception. Initialize the container asynchronously when storage is
            // actually used instead.
            _containerInitialization = new Lazy<Task>(
                InitializeContainerAsync,
                LazyThreadSafetyMode.ExecutionAndPublication);
        }

        private async Task InitializeContainerAsync()
        {
            await _containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
        }

        public async Task<string> UploadFileAsync(IFormFile file)
        {
            await _containerInitialization.Value;

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
                await _containerInitialization.Value;

                if (fileName.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                {
                    fileName = GetFileNameFromUrl(fileName);
                }

                await _containerClient.DeleteBlobIfExistsAsync(fileName);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting blob {FileName}", fileName);
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
