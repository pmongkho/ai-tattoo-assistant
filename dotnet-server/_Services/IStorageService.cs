// dotnet-server/_Services/IStorageService.cs
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace DotNet.Services
{
    public interface IStorageService
    {
        Task<string> UploadFileAsync(IFormFile file);
        Task<bool> DeleteFileAsync(string fileName);
        string GetFileNameFromUrl(string url);
    }
}