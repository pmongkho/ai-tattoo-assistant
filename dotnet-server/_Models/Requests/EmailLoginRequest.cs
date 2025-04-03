// DotNet/Models/Requests/EmailLoginRequest.cs
using System.ComponentModel.DataAnnotations;

namespace DotNet.Models.Requests;

/// <summary>
/// Request model for email-based authentication
/// </summary>
public class EmailLoginRequest
{
    /// <summary>
    /// The email address to send the magic link to
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public required string Email { get; init; }
}