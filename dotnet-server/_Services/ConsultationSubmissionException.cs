using System;
using System.Collections.Generic;
using System.Linq;

namespace DotNet.Services;

public class ConsultationSubmissionException : InvalidOperationException
{
    public IReadOnlyList<string> MissingFields { get; }

    public ConsultationSubmissionException(IEnumerable<string> missingFields)
        : base(BuildMessage(missingFields))
    {
        MissingFields = missingFields?.ToArray() ?? Array.Empty<string>();
    }

    public ConsultationSubmissionException(string message, IEnumerable<string> missingFields)
        : base(message)
    {
        MissingFields = missingFields?.ToArray() ?? Array.Empty<string>();
    }

    private static string BuildMessage(IEnumerable<string> missingFields)
    {
        var list = missingFields?.ToArray() ?? Array.Empty<string>();
        return list.Length == 0
            ? "Missing required information."
            : $"Missing required info: {string.Join(", ", list)}";
    }
}
