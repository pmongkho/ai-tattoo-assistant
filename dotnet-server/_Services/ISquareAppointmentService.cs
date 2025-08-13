public interface ISquareAppointmentsService
{
    Task<(string customerId, string? appointmentId)> CreateAppointmentAsync(
        string fullName,
        string phoneE164,
        string availabilityNote,
        string style,
        string bodyPart,
        string size,
        string budget,
        string referenceImageUrl);
}
