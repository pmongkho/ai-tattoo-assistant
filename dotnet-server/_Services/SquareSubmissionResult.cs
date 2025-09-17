using System;

namespace DotNet.Services;

public record SquareSubmissionResult(
    string? AppointmentId,
    string? SquareCustomerId,
    bool AppointmentCreated,
    string Status,
    string? SquareSyncError)
{
    public bool HasSquareCustomer => !string.IsNullOrWhiteSpace(SquareCustomerId);
}
