// dotnet-server/_Services/FirebaseStorageService.cs
using System;
using System.IO;
using System.Threading.Tasks;
using FirebaseAdmin;
using Google.Cloud.Storage.V1;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Web;
using System.Collections.Generic;


namespace DotNet.Services
{
    public class FirebaseStorageService : IStorageService
    {
        private readonly StorageClient _storageClient;
        private readonly ILogger<FirebaseStorageService> _logger;
        private readonly string _bucketName;

        public FirebaseStorageService(
            IConfiguration configuration,
            ILogger<FirebaseStorageService> logger)
        {
            _logger = logger;
            
            // Get bucket name from environment variable or configuration
            _bucketName = Environment.GetEnvironmentVariable("FIREBASE_STORAGE_BUCKET") ?? 
                          configuration["Firebase:StorageBucket"];
            
            if (string.IsNullOrEmpty(_bucketName))
            {
                _logger.LogWarning("Firebase storage bucket is not configured. Using default bucket name.");
                // Use default bucket name based on Firebase project ID
                var app = FirebaseApp.DefaultInstance;
                if (app != null)
                {
                    var projectId = app.Options.ProjectId;
                    _bucketName = $"{projectId}.appspot.com";
                    _logger.LogInformation($"Using default bucket name: {_bucketName}");
                }
                else
                {
                    throw new InvalidOperationException("Firebase app is not initialized and no bucket name is configured");
                }
            }
            
            // Initialize Firebase Storage client
            _storageClient = StorageClient.Create();
            _logger.LogInformation($"Firebase Storage service initialized with bucket: {_bucketName}");
        }

        public async Task<string> UploadFileAsync(IFormFile file)
        {
            try
            {
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                var fileName = $"tattoos/{Guid.NewGuid()}{fileExtension}";
                
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    memoryStream.Position = 0;
                    
                    // Set metadata for the file
                    var metadata = new Google.Apis.Storage.v1.Data.Object
                    {
                        ContentType = file.ContentType,
                        Metadata = new Dictionary<string, string>
                        {
                            { "originalFileName", file.FileName },
                            { "uploadTime", DateTime.UtcNow.ToString("o") }
                        }
                    };
                    
                    // Upload to Firebase Storage
                    var uploadedObject = await _storageClient.UploadObjectAsync(
                        _bucketName,
                        fileName,
                        file.ContentType,
                        memoryStream,
                        new UploadObjectOptions { PredefinedAcl = PredefinedObjectAcl.PublicRead },
                        CancellationToken.None);
                    
                    _logger.LogInformation($"File uploaded successfully: {fileName}");
                    
                    // Return the download URL
                    return $"https://storage.googleapis.com/{_bucketName}/{fileName}";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file to Firebase Storage");
                throw;
            }
        }

        public async Task<bool> DeleteFileAsync(string fileName)
        {
            try
            {
                // If a full URL is provided, extract just the file name
                if (fileName.StartsWith("https://"))
                {
                    fileName = GetFileNameFromUrl(fileName);
                }
                
                await _storageClient.DeleteObjectAsync(_bucketName, fileName);
                _logger.LogInformation($"File deleted successfully: {fileName}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting file {fileName} from Firebase Storage");
                return false;
            }
        }
        
        public string GetFileNameFromUrl(string url)
        {
            try
            {
                // Parse the URL to extract the file path
                if (url.Contains($"{_bucketName}/"))
                {
                    var startIndex = url.IndexOf($"{_bucketName}/") + _bucketName.Length + 1;
                    var fileName = url.Substring(startIndex);
                    
                    // Remove any query parameters
                    if (fileName.Contains("?"))
                    {
                        fileName = fileName.Substring(0, fileName.IndexOf("?"));
                    }
                    
                    return fileName;
                }
                
                throw new ArgumentException("URL does not contain the expected bucket name pattern");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error extracting file name from URL: {url}");
                throw;
            }
        }
    }
}
