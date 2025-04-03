// Services/AuthService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DotNet.Models;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;
using Resend;

namespace DotNet.Services;

public interface IAuthService
{
    Task<ApplicationUser> FindOrCreateUserByEmailAsync(string email);
    Task<string> GenerateMagicLinkTokenAsync(ApplicationUser user);
    Task<bool> VerifyMagicLinkTokenAsync(ApplicationUser user, string token);
    Task<ApplicationUser> ValidateGoogleTokenAsync(string idToken);
    string GenerateJwtToken(ApplicationUser user);
    Task SendMagicLinkEmailAsync(string email, string callbackUrl);
}

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IResend _resendClient;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IResend resendClient,
        IConfiguration config,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _resendClient = resendClient;
        _config = config;
        _logger = logger;
    }

    public async Task<ApplicationUser> FindOrCreateUserByEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ApplicationUser { UserName = email, Email = email };
            await _userManager.CreateAsync(user);
        }
        return user;
    }

    public async Task<string> GenerateMagicLinkTokenAsync(ApplicationUser user)
    {
        var token = await _userManager.GenerateUserTokenAsync(user, TokenOptions.DefaultProvider, "email-login");
        var tokenBytes = Encoding.UTF8.GetBytes(token);
        return WebEncoders.Base64UrlEncode(tokenBytes);
    }

    public async Task<bool> VerifyMagicLinkTokenAsync(ApplicationUser user, string encodedToken)
    {
        var tokenBytes = WebEncoders.Base64UrlDecode(encodedToken);
        var decodedToken = Encoding.UTF8.GetString(tokenBytes);
        return await _userManager.VerifyUserTokenAsync(user, TokenOptions.DefaultProvider, "email-login", decodedToken);
    }

    public async Task<ApplicationUser> ValidateGoogleTokenAsync(string idToken)
    {
        try
        {
            // Verify the Firebase ID token
            FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
    
            // Get user information from the token
            string email = decodedToken.Claims.TryGetValue("email", out object emailObj) 
                ? emailObj.ToString() 
                : null;
        
            if (string.IsNullOrEmpty(email))
            {
                throw new InvalidOperationException("Email not found in token");
            }

            // Find or create user in your database
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                // Create a new user with a default UserRole of "client"
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    UserRole = "client", // Set a default role that matches your constraint
                    CreatedAt = DateTime.UtcNow
                };
        
                var result = await _userManager.CreateAsync(user);
                if (!result.Succeeded)
                {
                    throw new InvalidOperationException($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }

            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating Google token");
            throw;
        }
    }


    public string GenerateJwtToken(ApplicationUser user)
    {
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.Id),
    new Claim(ClaimTypes.Name, user.UserName),
    new Claim(ClaimTypes.Email, user.Email),
    new Claim(ClaimTypes.Role, user.UserRole) // Add the role claim
};

        // Try to get JWT settings from environment variables first, then from configuration
        string secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? 
                           _config["JwtSettings:SecretKey"] ??
                           "DefaultDevSecretKey_ThisShouldBeChangedInProduction_12345";
    
        string issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? 
                        _config["JwtSettings:Issuer"] ??
                        "DefaultIssuer";
    
        string audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? 
                          _config["JwtSettings:Audience"] ??
                          "DefaultAudience";

        // Log the values being used
        _logger.LogInformation($"Generating JWT token with Issuer: {issuer}, Audience: {audience}");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task SendMagicLinkEmailAsync(string email, string callbackUrl)
    {
        var emailMessage = new EmailMessage
        {
            From = "Auth <onboarding@resend.dev>",
            To = new EmailAddressList { email },
            Subject = "Login to Your Account",
            HtmlBody = $"Click <a href='{System.Text.Encodings.Web.HtmlEncoder.Default.Encode(callbackUrl)}'>here</a> to log in."
        };

        await _resendClient.EmailSendAsync(emailMessage);
    }
}
