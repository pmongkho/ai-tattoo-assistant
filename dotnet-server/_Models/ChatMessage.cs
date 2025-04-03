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

        public ChatMessage(string role, string content)
        {
            Role = role;
            Content = content;
        }
        
        public ChatMessage(string role, string content, string imageUrl)
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