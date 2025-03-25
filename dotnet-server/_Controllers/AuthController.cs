using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;
using Resend;
using Google.Apis.Auth;
using DotNet.Models;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;

namespace DotNet.Controllers; // ✅ Ensure correct namespace

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IResend _resendClient;
    private readonly IConfiguration _config;

    public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IResend resendClient, IConfiguration config)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _resendClient = resendClient;
        _config = config;
    }

    // ✅ LOGIN WITH EMAIL (MAGIC LINK)
    [HttpPost("login-email")]
    public async Task<IActionResult> LoginWithEmail([FromBody] EmailLoginRequest model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            user = new ApplicationUser { UserName = model.Email, Email = model.Email };
            await _userManager.CreateAsync(user);
        }

        var token = await _userManager.GenerateUserTokenAsync(user, TokenOptions.DefaultProvider, "email-login");
        var tokenBytes = Encoding.UTF8.GetBytes(token);
        var encodedToken = WebEncoders.Base64UrlEncode(tokenBytes);

        var callbackUrl = $"{Request.Scheme}://{Request.Host}/api/auth/verify-email?email={model.Email}&token={encodedToken}";

        var emailMessage = new EmailMessage
        {
            From = "Auth <onboarding@resend.dev>",
            To = new EmailAddressList { model.Email },
            Subject = "Login to Your Account",
            HtmlBody = $"Click <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>here</a> to log in."
        };

        await _resendClient.EmailSendAsync(emailMessage);

        return Ok(new { Message = "Magic link sent! Check your email." });
    }

    // ✅ VERIFY EMAIL LOGIN (LOGIN COMPLETION)
    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmailLogin([FromQuery] string email, [FromQuery] string token)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return Unauthorized("Invalid email.");

        var tokenBytes = WebEncoders.Base64UrlDecode(token);
        var decodedToken = Encoding.UTF8.GetString(tokenBytes);

        var isValid = await _userManager.VerifyUserTokenAsync(user, TokenOptions.DefaultProvider, "email-login", decodedToken);
        if (!isValid) return Unauthorized("Invalid or expired token.");

        // Generate JWT
        var jwtToken = GenerateJwtToken(user);
        
        var clientUrl = _config["Client:ClientUrl"] ?? "http://localhost:4200";


        // 🔁 Redirect to Angular app with token
        return Redirect($"{clientUrl}/verify-email?email={email}&token={jwtToken}");
    }

  [HttpPost("login-google")]
    public async Task<IActionResult> LoginWithGoogle([FromBody] GoogleAuthRequest model)
    {
        if (string.IsNullOrEmpty(model.IdToken))
        {
            return BadRequest(new { Error = "ID token is required" });
        }

        try
        {
            // Verify the Firebase ID token
            FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(model.IdToken);
            
            // Get user information from the token
            string uid = decodedToken.Uid;
            string email = decodedToken.Claims.TryGetValue("email", out object emailObj) 
                ? emailObj.ToString() 
                : null;
                
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { Error = "Email not found in token" });
            }

            // Log successful validation
            Console.WriteLine($"Successfully validated Firebase token for: {email}");

            // Find or create user in your database
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                // Create a new user
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    // You can store the Firebase UID if needed
                    // FirebaseUid = uid
                };
                
                var result = await _userManager.CreateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest(new { Error = "Failed to create user", Details = result.Errors });
                }
            }

            // Generate JWT Token for your application
            var jwtToken = GenerateJwtToken(user);
            return Ok(new { Token = jwtToken });
        }
        catch (FirebaseAuthException fireEx)
        {
            // Handle Firebase authentication errors
            Console.WriteLine($"Firebase Auth Error: {fireEx.Message}");
            return Unauthorized(new { 
                Error = "Invalid Firebase token", 
                Details = fireEx.Message,
                ErrorCode = fireEx.ErrorCode
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Google auth error: {ex.Message}");
            return Unauthorized(new { Error = "Authentication failed", Details = ex.Message });
        }
    }
    
    // Debug endpoint
    [HttpGet("debug-firebase-config")]
    public IActionResult DebugFirebaseConfig()
    {
        return Ok(new { 
            ProjectId = _config["Firebase:ProjectId"],
            HasProjectId = !string.IsNullOrEmpty(_config["Firebase:ProjectId"]),
            HasServiceAccount = !string.IsNullOrEmpty(_config["Firebase:ServiceAccountJson"])
        });
    }
    
    // Add this to your AuthController.cs
    [HttpGet("validate-token")]
    public async Task<IActionResult> ValidateToken()
    {
        // The JWT middleware will validate the token before reaching this point
        // If we get here, the token is valid
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
    
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { Error = "Invalid token" });
        }
    
        var user = await _userManager.FindByEmailAsync(userEmail);
        if (user == null)
        {
            return Unauthorized(new { Error = "User not found" });
        }
    
        return Ok(new { 
            Email = userEmail,
            UserName = userName
        });
    }

    
    // ✅ GENERATE JWT TOKEN
    private string GenerateJwtToken(ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            audience: _config["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// ✅ Google Auth Request Model
public class GoogleAuthRequest
{
    public required string IdToken { get; init; }
}

// ✅ Email Login Request Model
public class EmailLoginRequest
{
    public required string Email { get; init; } // ✅ Using `init;` for immutability
}
