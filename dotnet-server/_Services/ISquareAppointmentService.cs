using System.Threading.Tasks;

namespace DotNet.Services;

public record SquareAppointmentResult(
    string CustomerId,
    string? AppointmentId,
    string? FailureReason,
    bool BookingAttempted);

public interface ISquareAppointmentsService
{
    Task<SquareAppointmentResult> CreateAppointmentAsync(
        string fullName,
        string phoneE164,
        string availabilityNote,
        string style,
        string bodyPart,
        string size,
        string budget,
        string referenceImageUrl);
}
