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

        public SquareAppointmentsService(
            IOptions<SquareOptions> options,
            ILogger<SquareAppointmentsService> logger)
        {
            _opts = options.Value;
            _logger = logger;


            var env = _opts.Environment.Equals("Production", StringComparison.OrdinalIgnoreCase)
                ? SquareEnvironment.Production
                : SquareEnvironment.Sandbox;

            _client = new SquareClient.Builder()
                .Environment(env)
                .AccessToken(_opts.AccessToken)
                .Build();



        }

        public async Task<(string customerId, string? appointmentId)> CreateAppointmentAsync(
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

            if (string.IsNullOrWhiteSpace(_opts.ServiceVariationId))
            {
                _logger.LogInformation("No ServiceVariationId configured; returning customer id without booking.");
                return (customerId, null);
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
                            LocationId = _opts.LocationId,
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
                    _logger.LogWarning("No availability slots returned by Square. Returning customer only.");
                    return (customerId, null);
                }

                var createReq = new CreateBookingRequest
                {
                    IdempotencyKey = Guid.NewGuid().ToString("N"),
                    Booking = new Booking
                    {
                        LocationId = _opts.LocationId,
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
                    _logger.LogWarning("Square returned no booking id. Returning customer only.");
                    return (customerId, null);
                }

                _logger.LogInformation("Created Square booking {BookingId} for customer {CustomerId}", apptId, customerId);
                return (customerId, apptId);
            }
            catch (SquareApiException ex)
            {
                _logger.LogError(ex, "Square API error while creating booking");
                return (customerId, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating booking");
                return (customerId, null);
            }
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
