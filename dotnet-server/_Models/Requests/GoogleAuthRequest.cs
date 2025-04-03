// DotNet/Models/Requests/GoogleAuthRequest.cs
using System.ComponentModel.DataAnnotations;

namespace DotNet.Models.Requests;

/// <summary>
/// Request model for Google authentication
/// </summary>
public class GoogleAuthRequest
{
    /// <summary>
    /// The Firebase ID token obtained from the client-side authentication
    /// </summary>
    [Required(ErrorMessage = "ID token is required")]
    public required string IdToken { get; init; }
}