public class SquareOptions
{
    public string AccessToken { get; set; } = "";
    public string Environment { get; set; } = "Sandbox"; // or "Production"
    public string LocationId { get; set; } = "";
    public string TeamMemberId { get; set; } = "";
    public string ServiceVariationId { get; set; } = "";
    public long ServiceVariationVersion { get; set; }   // NEW: required for bookings
    public int DefaultServiceDurationMinutes { get; set; } = 60;
    public string TimeZone { get; set; } = "America/Chicago";
    public int WorkStartHourLocal { get; set; } = 12;   // 12p
    public int WorkEndHourLocal { get; set; } = 22;     // 10p
}