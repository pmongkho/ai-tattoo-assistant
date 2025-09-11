// dotnet-server/_Models/ChatModel.cs
using System.Text.Json.Serialization;

namespace DotNet.Models
{
    public class ChatMessage
    {
        [JsonPropertyName("role")]
        public string Role { get; set; }

        [JsonPropertyName("content")]
        public string Content { get; set; }

        [JsonPropertyName("image_url")]
        public string? ImageUrl { get; set; }

        // Parameterless constructor required for System.Text.Json deserialization
        public ChatMessage()
        {
        }

        [JsonConstructor]
        public ChatMessage(string role, string content, string? imageUrl = null)
        {
            Role = role;
            Content = content;
            ImageUrl = imageUrl;
        }
    }
    
    // Add a class to store consultation chat data
    public class ConsultationChat
    {
        public Guid ConsultationId { get; set; }
        public List<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}