// DotNet/Controllers/ConsultationController.cs
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using DotNet.Models.Requests;
using DotNet.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace DotNet.Controllers
{
    [ApiController]
    [Route("api/consultations")]
    public class ConsultationController : ControllerBase
    {
        private readonly IConsultationService _consultationService;
        private readonly ILogger<ConsultationController> _logger;

        public ConsultationController(
            IConsultationService consultationService,
            ILogger<ConsultationController> logger)
        {
            _consultationService = consultationService;
            _logger = logger;
        }

        [HttpPost("start")]
        [AllowAnonymous] // ✨ allow public chat start
        public async Task<IActionResult> StartConsultation([FromBody] StartConsultationRequest request)
        {
            try
            {
                var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var consultationId = await _consultationService.StartConsultationAsync(userId, request.ArtistId, request.SquareArtistId);
                return Ok(new { consultationId });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting consultation");
                return StatusCode(500, "Error starting consultation");
            }
        }

        [HttpPost("{id:guid}/message")]
        [AllowAnonymous] // ✨ allow public chat start

        public async Task<IActionResult> SendMessage(Guid id, [FromBody] ConsultationMessageRequest request)
        {
            try
            {
                var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var response = await _consultationService.SendMessageAsync(id, userId, request.Message);
                return Ok(new { response });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                return StatusCode(500, "Error sending message");
            }
        }

        [HttpPost("{id:guid}/message-with-image")]
        [AllowAnonymous] // ✨ allow public chat start
        public async Task<IActionResult> SendMessageWithImage(Guid id, [FromForm] ConsultationMessageWithImageRequest request)
        {
            try
            {
                var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var response = await _consultationService.SendMessageWithImageAsync(id, userId, request.Message, request.Image);
                return Ok(new { response });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message with image");
                return StatusCode(500, "Error sending message with image");
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetConsultation(Guid id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var consultation = await _consultationService.GetConsultationAsync(id, userId);
                return Ok(consultation);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting consultation");
                return StatusCode(500, "Error getting consultation");
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetUserConsultations()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var consultations = await _consultationService.GetUserConsultationsAsync(userId);
                return Ok(consultations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user consultations");
                return StatusCode(500, "Error getting user consultations");
            }
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateConsultationStatus(Guid id, [FromBody] UpdateConsultationStatusRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var success = await _consultationService.UpdateConsultationStatusAsync(id, request.Status, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating consultation status");
                return StatusCode(500, "Error updating consultation status");
            }
        }

        [HttpPost("{id}/submit-to-square")]
        [Authorize]
        public async Task<IActionResult> SubmitToSquare(Guid id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var appointmentId = await _consultationService.SubmitToSquareAsync(id, userId);
                return Ok(new { appointmentId });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                // Missing info / validation errors
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting consultation to Square");
                return StatusCode(500, "Error submitting consultation to Square");
            }
        }
        
    }
}
