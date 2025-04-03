using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using DotNet.Models;
using DotNet.Models.Requests;
using DotNet.Services;
using FirebaseAdmin.Auth;

namespace DotNet.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _config;

    public AuthController(
        IAuthService authService,
        UserManager<ApplicationUser> userManager,
        IConfiguration config)
    {
        _authService = authService;
        _userManager = userManager;
        _config = config;
    }

    [HttpPost("login-email")]
    public async Task<IActionResult> LoginWithEmail([FromBody] EmailLoginRequest model)
    {
        var user = await _authService.FindOrCreateUserByEmailAsync(model.Email);
        var encodedToken = await _authService.GenerateMagicLinkTokenAsync(user);

        var callbackUrl =
            $"{Request.Scheme}://{Request.Host}/api/auth/verify-email?email={model.Email}&token={encodedToken}";
        await _authService.SendMagicLinkEmailAsync(model.Email, callbackUrl);

        return Ok(new { Message = "Magic link sent! Check your email." });
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmailLogin([FromQuery] string email, [FromQuery] string token)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return Unauthorized("Invalid email.");

        var isValid = await _authService.VerifyMagicLinkTokenAsync(user, token);
        if (!isValid) return Unauthorized("Invalid or expired token.");

        // Generate JWT
        var jwtToken = _authService.GenerateJwtToken(user);

        var clientUrl = Environment.GetEnvironmentVariable("ANGULAR_CLIENT_URL") ?? "http://localhost:4200";

        // Redirect to Angular app with token
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
            var user = await _authService.ValidateGoogleTokenAsync(model.IdToken);
            var jwtToken = _authService.GenerateJwtToken(user);
            return Ok(new { Token = jwtToken });
        }
        catch (FirebaseAuthException fireEx)
        {
            return Unauthorized(new
            {
                Error = "Invalid Firebase token",
                Details = fireEx.Message,
                ErrorCode = fireEx.ErrorCode
            });
        }
        catch (Exception ex)
        {
            return Unauthorized(new { Error = "Authentication failed", Details = ex.Message });
        }
    }

    // Debug endpoint
    [HttpGet("debug-firebase-config")]
    public IActionResult DebugFirebaseConfig()
    {
        return Ok(new
        {
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

        return Ok(new
        {
            Email = userEmail,
            UserName = userName
        });
    }
}
