using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using DotNet.Controllers;
using DotNet.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace DotNet.Tests.Controllers;

public class ConsultationControllerSubmitToSquareTests
{
    private readonly Mock<IConsultationService> _consultationServiceMock = new();
    private readonly Mock<ILogger<ConsultationController>> _loggerMock = new();

    [Fact]
    public async Task SubmitToSquare_WhenServiceSucceeds_ReturnsOkWithResult()
    {
        // Arrange
        var consultationId = Guid.NewGuid();
        const string userId = "artist-42";
        var expectedResult = new SquareSubmissionResult("appt-123", "cust-456", true, "Submitted", null);

        _consultationServiceMock
            .Setup(service => service.SubmitToSquareAsync(consultationId, userId))
            .ReturnsAsync(expectedResult);

        var controller = CreateControllerWithUser(userId);

        // Act
        var result = await controller.SubmitToSquare(consultationId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Same(expectedResult, okResult.Value);
        _consultationServiceMock.Verify(service => service.SubmitToSquareAsync(consultationId, userId), Times.Once);
        _consultationServiceMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task SubmitToSquare_WhenSubmissionExceptionThrown_ReturnsBadRequestWithMissingFields()
    {
        // Arrange
        var consultationId = Guid.NewGuid();
        const string userId = "user-123";
        var submissionException = new ConsultationSubmissionException(new[] { "fullName", "phone" });

        _consultationServiceMock
            .Setup(service => service.SubmitToSquareAsync(consultationId, userId))
            .ThrowsAsync(submissionException);

        var controller = CreateControllerWithUser(userId);

        // Act
        var result = await controller.SubmitToSquare(consultationId);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var payload = Assert.NotNull(badRequest.Value);
        var error = GetAnonymousPropertyValue<string>(payload, "error");
        var missingFields = GetAnonymousPropertyValue<IEnumerable<string>>(payload, "missingFields");

        Assert.Equal(submissionException.Message, error);
        Assert.Equal(submissionException.MissingFields, missingFields);
        _consultationServiceMock.Verify(service => service.SubmitToSquareAsync(consultationId, userId), Times.Once);
        _consultationServiceMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task SubmitToSquare_WhenConsultationMissing_ReturnsNotFound()
    {
        // Arrange
        var consultationId = Guid.NewGuid();
        const string userId = "user-123";
        const string notFoundMessage = "Consultation not found";

        _consultationServiceMock
            .Setup(service => service.SubmitToSquareAsync(consultationId, userId))
            .ThrowsAsync(new KeyNotFoundException(notFoundMessage));

        var controller = CreateControllerWithUser(userId);

        // Act
        var result = await controller.SubmitToSquare(consultationId);

        // Assert
        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(notFoundMessage, notFound.Value);
        _consultationServiceMock.Verify(service => service.SubmitToSquareAsync(consultationId, userId), Times.Once);
        _consultationServiceMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task SubmitToSquare_WhenInvalidOperationThrown_ReturnsBadRequest()
    {
        // Arrange
        var consultationId = Guid.NewGuid();
        const string userId = "user-123";
        const string errorMessage = "Missing additional info";

        _consultationServiceMock
            .Setup(service => service.SubmitToSquareAsync(consultationId, userId))
            .ThrowsAsync(new InvalidOperationException(errorMessage));

        var controller = CreateControllerWithUser(userId);

        // Act
        var result = await controller.SubmitToSquare(consultationId);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var payload = Assert.NotNull(badRequest.Value);
        var error = GetAnonymousPropertyValue<string>(payload, "error");

        Assert.Equal(errorMessage, error);
        _consultationServiceMock.Verify(service => service.SubmitToSquareAsync(consultationId, userId), Times.Once);
        _consultationServiceMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task SubmitToSquare_WhenUnexpectedException_ReturnsInternalServerError()
    {
        // Arrange
        var consultationId = Guid.NewGuid();
        const string userId = "user-123";
        var exception = new Exception("Unexpected failure");

        _consultationServiceMock
            .Setup(service => service.SubmitToSquareAsync(consultationId, userId))
            .ThrowsAsync(exception);

        var controller = CreateControllerWithUser(userId);

        // Act
        var result = await controller.SubmitToSquare(consultationId);

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
        var payload = Assert.NotNull(objectResult.Value);
        var error = GetAnonymousPropertyValue<string>(payload, "error");
        var detail = GetAnonymousPropertyValue<string>(payload, "detail");

        Assert.Equal("Error submitting consultation to Square", error);
        Assert.Equal(exception.Message, detail);
        _consultationServiceMock.Verify(service => service.SubmitToSquareAsync(consultationId, userId), Times.Once);
        _consultationServiceMock.VerifyNoOtherCalls();
    }

    private ConsultationController CreateControllerWithUser(string userId)
    {
        var controller = new ConsultationController(_consultationServiceMock.Object, _loggerMock.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, userId)
                    }, authenticationType: "Test"))
                }
            }
        };

        return controller;
    }

    private static TProperty GetAnonymousPropertyValue<TProperty>(object payload, string propertyName)
    {
        var property = payload.GetType().GetProperty(propertyName);
        Assert.NotNull(property);

        var value = property!.GetValue(payload);
        return Assert.IsAssignableFrom<TProperty>(value!);
    }
}
