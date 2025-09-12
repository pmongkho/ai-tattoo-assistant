using System.Collections.Generic;

namespace DotNet.Models
{
    public class MetaEvent
    {
        public List<MetaEntry> Entry { get; set; } = new();
    }

    public class MetaEntry
    {
        public string Id { get; set; } = string.Empty;
        public List<MetaMessaging> Messaging { get; set; } = new();
    }

    public class MetaMessaging
    {
        public MetaSender Sender { get; set; } = new();
        public MetaMessage Message { get; set; } = new();
    }

    public class MetaSender
    {
        public string Id { get; set; } = string.Empty;
    }

    public class MetaMessage
    {
        public string Text { get; set; } = string.Empty;
    }
}
