using System;

namespace DotNet.Models
{
    public class TattooConsultationData
    {
        public string? Subject { get; set; }
        public string? Style { get; set; }
        public string? Placement { get; set; }
        public string? Size { get; set; }
        public string? References { get; set; }
        public string? Budget { get; set; }
        // When the client is free or unavailable
        public string? Availability { get; set; }
        // Separate contact details so we can validate each piece
        public string? Name { get; set; }
        public string? Phone { get; set; }
    }
}
