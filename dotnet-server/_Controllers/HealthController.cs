// In a new file: Controllers/HealthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DotNet.Data;
using System;
using System.Threading.Tasks;

namespace DotNet.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HealthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                // Test database connection
                bool canConnect = await _context.Database.CanConnectAsync();
                
                return Ok(new 
                { 
                    status = "healthy",
                    database = canConnect ? "connected" : "disconnected",
                    timestamp = DateTime.UtcNow 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new 
                { 
                    status = "unhealthy",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow 
                });
            }
        }
    }
}