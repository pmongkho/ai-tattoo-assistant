using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using Square;
using Square.Customers;
using Square.Bookings;
using Square.Catalog;         // Catalog endpoints + models

namespace DotNet.Services
{
    public class SquareAppointmentsService : ISquareAppointmentsService
    {
        private readonly SquareOptions _opts;
        private readonly ILogger<SquareAppointmentsService> _logger;
        private readonly SquareClient _client;
        private readonly string _configuredLocationId;
        private readonly bool _locationIdLooksValid;

        public SquareAppointmentsService(
            IOptions<SquareOptions> options,
            ILogger<SquareAppointmentsService> logger)
        {
            _opts = options.Value;
            _logger = logger;

            _configuredLocationId = (_opts.LocationId ?? string.Empty).Trim();
            _locationIdLooksValid = !string.IsNullOrEmpty(_configuredLocationId)
                && Regex.IsMatch(_configuredLocationId, @"^[A-Za-z0-9_-]{4,64}$");

            if (string.IsNullOrEmpty(_configuredLocationId))
            {
                _opts.LocationId = string.Empty;
                _logger.LogWarning("Square LocationId is not configured. Provide Square:LocationId so bookings can be created.");
            }
            else
            {
                _opts.LocationId = _configuredLocationId.ToUpperInvariant();

                if (_locationIdLooksValid)
                {
                    _logger.LogInformation("Square LocationId configured: {LocationId}", _opts.LocationId);
                }
                else
                {
                    _logger.LogWarning(
                        "Square LocationId '{LocationId}' does not match the expected format; attempting to use it anyway.",
                        _configuredLocationId);
                }
            }

            _opts.TeamMemberId = (_opts.TeamMemberId ?? string.Empty).Trim();
            _opts.ServiceVariationId = (_opts.ServiceVariationId ?? string.Empty).Trim();

            var env = _opts.Environment.Equals("Production", StringComparison.OrdinalIgnoreCase)
                ? SquareEnvironment.Production
                : SquareEnvironment.Sandbox;

            _client = new SquareClient(
                _opts.AccessToken,
                new ClientOptions
                {
                    BaseUrl = env
                }
            );



        }

        public async Task<SquareAppointmentResult> CreateAppointmentAsync(
            string fullName,
            string phoneE164,
            string availabilityNote,
            string style,
            string bodyPart,
            string size,
            string budget,
            string referenceImageUrl)
        {
            var customerId = await UpsertCustomerAsync(fullName, phoneE164,
                note: BuildCustomerNote(style, bodyPart, size, budget, availabilityNote, referenceImageUrl));

            var locationId = _opts.LocationId;
            if (string.IsNullOrWhiteSpace(locationId))
            {
                var reason = string.IsNullOrEmpty(_configuredLocationId)
                    ? "Square LocationId configuration is missing; skipping booking creation."
                    : $"Square LocationId configuration is invalid; skipping booking creation. Value: '{_configuredLocationId}'.";
                _logger.LogWarning(reason);
                return new SquareAppointmentResult(customerId, null, reason, false);
            }

            if (!_locationIdLooksValid)
            {
                _logger.LogWarning(
                    "Square LocationId '{LocationId}' did not pass validation; continuing with sanitized value {SanitizedLocationId}.",
                    _configuredLocationId,
                    locationId);
            }

            if (string.IsNullOrWhiteSpace(_opts.ServiceVariationId))
            {
                var reason = "Square ServiceVariationId is not configured; skipping booking creation.";
                _logger.LogInformation(reason);
                return new SquareAppointmentResult(customerId, null, reason, false);
            }

            if (string.IsNullOrWhiteSpace(_opts.TeamMemberId))
            {
                var reason = "Square TeamMemberId is not configured; skipping booking creation.";
                _logger.LogInformation(reason);
                return new SquareAppointmentResult(customerId, null, reason, false);
            }

            try
            {
                var when = SuggestStartWindowFromAvailability(availabilityNote, _opts.TimeZone, _opts.WorkStartHourLocal, _opts.WorkEndHourLocal)
                           ?? DateTimeOffset.UtcNow.AddDays(3);

                var startRange = when;
                var endRange = when.AddDays(14);

                // Search availability
                var searchReq = new SearchAvailabilityRequest
                {
                    Query = new SearchAvailabilityQuery
                    {
                        Filter = new SearchAvailabilityFilter
                        {
                            StartAtRange = new TimeRange
                            {
                                StartAt = startRange.ToString("o"),
                                EndAt = endRange.ToString("o")
                            },
                            LocationId = locationId,
                            SegmentFilters = new[]
                            {
                                new SegmentFilter
                                {
                                    ServiceVariationId = _opts.ServiceVariationId,
                                    // v42: FilterValue with .Any/.All/.None
                                    TeamMemberIdFilter = new FilterValue
                                    {
                                        Any = new[] { _opts.TeamMemberId }
                                    }
                                }
                            }
                        }
                    }
                };

                var searchResp = await _client.Bookings.SearchAvailabilityAsync(searchReq);
                var slot = searchResp.Availabilities?.FirstOrDefault();
                if (slot == null)
                {
                    var reason = "Square returned no availability slots for the requested window.";
                    _logger.LogWarning(reason);
                    return new SquareAppointmentResult(customerId, null, reason, true);
                }

                var createReq = new CreateBookingRequest
                {
                    IdempotencyKey = Guid.NewGuid().ToString("N"),
                    Booking = new Booking
                    {
                        LocationId = locationId,
                        CustomerId = customerId,
                        StartAt = slot.StartAt, // ISO8601 from availability
                        AppointmentSegments = new[]
                        {
                            new AppointmentSegment
                            {
                                DurationMinutes = _opts.DefaultServiceDurationMinutes,
                                ServiceVariationId = _opts.ServiceVariationId,
                                TeamMemberId = _opts.TeamMemberId
                            }
                        },
                        SellerNote = BuildBookingNote(style, bodyPart, size, budget, availabilityNote, referenceImageUrl)
                    }
                };

                var createResp = await _client.Bookings.CreateAsync(createReq);

                var apptId = createResp.Booking?.Id;

                if (string.IsNullOrWhiteSpace(apptId))
                {
                    var reason = "Square returned no booking id after creation.";
                    _logger.LogWarning(reason);
                    return new SquareAppointmentResult(customerId, null, reason, true);
                }

                _logger.LogInformation("Created Square booking {BookingId} for customer {CustomerId}", apptId, customerId);
                return new SquareAppointmentResult(customerId, apptId, null, true);
            }
            catch (SquareApiException ex)
            {
                var reason = BuildSquareApiErrorMessage(ex);
                _logger.LogError(ex, "Square API error while creating booking");
                return new SquareAppointmentResult(customerId, null, reason, true);
            }
            catch (Exception ex)
            {
                var reason = "Unexpected error while creating Square booking: " + ex.Message;
                _logger.LogError(ex, "Unexpected error while creating booking");
                return new SquareAppointmentResult(customerId, null, reason, true);
            }
        }

        private static string BuildSquareApiErrorMessage(SquareApiException ex)
        {
            if (ex?.Errors != null && ex.Errors.Count > 0)
            {
                var details = ex.Errors
                    .Select(err => string.Join(" ", new[]
                    {
                        err.Category?.ToString(),
                        err.Code?.ToString(),
                        err.Detail
                    }.Where(part => !string.IsNullOrWhiteSpace(part)).Select(part => part!.Trim())))
                    .Where(msg => !string.IsNullOrWhiteSpace(msg))
                    .ToArray();

                if (details.Length > 0)
                {
                    return "Square API error: " + string.Join("; ", details);
                }
            }

            return "Square API error: " + ex?.Message;
        }

        private async Task<string> UpsertCustomerAsync(string fullName, string phoneE164, string note)
        {
            try
            {
                var searchResp = await _client.Customers.SearchAsync(new SearchCustomersRequest
                {
                    Limit = 1,
                    Query = new CustomerQuery
                    {
                        Filter = new CustomerFilter
                        {
                            PhoneNumber = new CustomerTextFilter { Exact = phoneE164 }
                        }
                    }
                });

                var existing = searchResp.Customers?.FirstOrDefault();
                if (existing != null)
                {
                    var mergedNote = string.IsNullOrWhiteSpace(existing.Note) ? note : $"{existing.Note}\n\n{note}";
                    var updateReq = new UpdateCustomerRequest
                    {
                        CustomerId = existing.Id,                    // required in v42
                        GivenName = ExtractFirstName(fullName),
                        FamilyName = ExtractLastName(fullName),
                        PhoneNumber = phoneE164,
                        Note = mergedNote
                    };

                    await _client.Customers.UpdateAsync(updateReq);
                    return existing.Id;
                }
            }
            catch (SquareApiException ex)
            {
                _logger.LogWarning(ex, "SearchCustomers failed; will try to create");
            }

            var createResp = await _client.Customers.CreateAsync(new CreateCustomerRequest
            {
                IdempotencyKey = Guid.NewGuid().ToString("N"),
                GivenName = ExtractFirstName(fullName),
                FamilyName = ExtractLastName(fullName),
                PhoneNumber = phoneE164,
                Note = note
            });

            return createResp.Customer!.Id!;
        }

        private static string BuildCustomerNote(string style, string bodyPart, string size, string budget, string availability, string imgUrl)
            => string.Join(" | ", new[]
            {
                $"Style: {style}",
                $"Placement: {bodyPart}",
                $"Size: {size}",
                $"Budget: {budget}",
                $"Availability: {availability}",
                string.IsNullOrWhiteSpace(imgUrl) ? null : $"Ref Image: {imgUrl}"
            }.Where(s => !string.IsNullOrWhiteSpace(s)));

        private static string BuildBookingNote(string style, string bodyPart, string size, string budget, string availability, string imgUrl)
            => $"Tattoo details — Style: {style}; Placement: {bodyPart}; Size: {size}; Budget: {budget}; Availability: {availability}; Ref: {imgUrl}";

        private static string ExtractFirstName(string fullName)
        {
            var parts = (fullName ?? "").Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            return parts.Length > 0 ? ToTitle(parts[0]) : "";
        }

        private static string ExtractLastName(string fullName)
        {
            var parts = (fullName ?? "").Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            return parts.Length <= 1 ? "" : ToTitle(string.Join(' ', parts.Skip(1)));
        }

        private static string ToTitle(string s) => Regex.Replace(s.ToLowerInvariant(), @"\b\w", m => m.Value.ToUpperInvariant());

        // Clamp to your working hours: start at 12:00, avoid after 22:00
        private static DateTimeOffset? SuggestStartWindowFromAvailability(string availability, string tz, int startHourLocal, int endHourLocal)
        {
            try
            {
                var nowUtc = DateTimeOffset.UtcNow;
                var text = (availability ?? "").ToLowerInvariant();

                var preferEvening = Regex.IsMatch(text, @"evening|after\s*5|after\s*6|pm");
                var preferMorning = Regex.IsMatch(text, @"morning|before\s*noon|am");

                var preferredHour = preferEvening ? Math.Min(Math.Max(18, startHourLocal), endHourLocal - 1)
                                  : preferMorning ? Math.Min(Math.Max(12, startHourLocal), endHourLocal - 1)
                                  : Math.Min(Math.Max(13, startHourLocal), endHourLocal - 1);

                string[] days = { "mon", "tue", "tues", "wed", "thu", "thur", "thurs", "fri", "sat", "sun" };
                var chosen = days.FirstOrDefault(d => text.Contains(d));
                var baseDay = nowUtc;

                if (chosen != null)
                {
                    var dow = chosen.StartsWith("tu") ? System.DayOfWeek.Tuesday :
                              chosen.StartsWith("we") ? System.DayOfWeek.Wednesday :
                              chosen.StartsWith("th") ? System.DayOfWeek.Thursday :
                              chosen.StartsWith("fr") ? System.DayOfWeek.Friday :
                              chosen.StartsWith("sa") ? System.DayOfWeek.Saturday :
                              chosen.StartsWith("su") ? System.DayOfWeek.Sunday :
                              System.DayOfWeek.Monday;

                    var delta = ((int)dow - (int)baseDay.DayOfWeek + 7) % 7;
                    baseDay = baseDay.AddDays(delta == 0 ? 7 : delta);
                }
                else
                {
                    baseDay = baseDay.AddDays(2);
                }

                // If you want real TZ conversion, map tz -> TimeZoneInfo, convert to local, set hour, then back to UTC.
                var target = new DateTimeOffset(baseDay.Year, baseDay.Month, baseDay.Day, preferredHour, 0, 0, TimeSpan.Zero);
                return target;
            }
            catch
            {
                return null;
            }
        }
        
       

    }
}
