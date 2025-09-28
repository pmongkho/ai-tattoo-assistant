using System.Collections.Generic;
using DotNet.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace DotNet.Tests.Controllers
{
    public class MetaWebhookControllerTests
    {
        private static MetaWebhookController CreateController(string? verifyToken = "expected-token")
        {
            var settings = new Dictionary<string, string?>
            {
                ["MetaAccess:FbVerifyToken"] = verifyToken
            };

            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(settings)
                .Build();

            return new MetaWebhookController(configuration, NullLogger<MetaWebhookController>.Instance);
        }

        [Fact]
        public void Verify_ReturnsChallenge_WhenTokenMatches()
        {
            // Arrange
            var controller = CreateController();

            // Act
            var result = controller.Verify("subscribe", "challenge-value", "expected-token");

            // Assert
            var contentResult = Assert.IsType<ContentResult>(result);
            Assert.Equal("challenge-value", contentResult.Content);
        }

        [Fact]
        public void Verify_ReturnsBadRequest_WhenParametersMissing()
        {
            // Arrange
            var controller = CreateController();

            // Act
            var result = controller.Verify(null, "challenge", "expected-token");

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Missing hub parameters.", badRequest.Value);
        }

        [Fact]
        public void Verify_ReturnsUnauthorized_WhenTokenDoesNotMatch()
        {
            // Arrange
            var controller = CreateController();

            // Act
            var result = controller.Verify("subscribe", "challenge", "wrong-token");

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }
    }
}
