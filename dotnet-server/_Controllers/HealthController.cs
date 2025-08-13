// Controllers/HealthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DotNet.Data;
using System;
using System.Threading.Tasks;
using DotNet.Services;

// NEW SDK namespaces
using Square;              // SquareClient, ClientOptions, SquareEnvironment
using Square.Bookings;     // Bookings API surface + models
using Square.Catalog;      // Catalog API surface + models

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
                var canConnect = await _context.Database.CanConnectAsync();
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

        // GET api/health/square
        //     [HttpGet("square")]
        //     public async Task<IActionResult> SquareHealth(
        //         [FromServices] Microsoft.Extensions.Options.IOptions<DotNet.Services.SquareOptions> opts)
        //     {
        //         var o = opts.Value;
        //
        //         // Build the new-style client.
        //         // If you export SQUARE_TOKEN in the environment, you can omit the token parameter.
        //         var client = new SquareClient(
        //             o.AccessToken, // optional if SQUARE_TOKEN env var is set
        //             new ClientOptions
        //             {
        //                 BaseUrl = o.Environment?.Equals("Production", StringComparison.OrdinalIgnoreCase) == true
        //                     ? SquareEnvironment.Production
        //                     : SquareEnvironment.Sandbox
        //             }
        //         );
        //
        //         // 1) Verify Bookings access by retrieving the business booking profile
        //         var profileResp = await client.Bookings.GetBusinessBookingProfileAsync();
        //         var bookingEnabled = profileResp?.BusinessBookingProfile?.BookingEnabled ?? false;
        //
        //         // 2) Sanity check Catalog by searching for ITEM / ITEM_VARIATION objects
        //         var catalogResp = await client.Catalog.SearchObjectsAsync(
        //             new SearchCatalogObjectsRequest
        //             {
        //                 ObjectTypes = new[] { "ITEM", "ITEM_VARIATION" },
        //                 Limit = 1
        //             }
        //         );
        //
        //         return Ok(new
        //         {
        //             bookingEnabled,
        //             foundItems = catalogResp?.Objects?.Count ?? 0
        //         });
        //     }
        // }
    }
}