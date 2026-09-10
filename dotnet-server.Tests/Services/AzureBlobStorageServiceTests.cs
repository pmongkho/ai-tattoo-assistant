using DotNet.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace dotnet_server.Tests.Services;

public class AzureBlobStorageServiceTests
{
    [Fact]
    public void Constructor_DoesNotConnectToAzure()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AzureStorage:ConnectionString"] =
                    "DefaultEndpointsProtocol=https;AccountName=doesnotexist;" +
                    "AccountKey=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=;EndpointSuffix=invalid",
                ["AzureStorage:ContainerName"] = "consultation-images"
            })
            .Build();

        var exception = Record.Exception(() => new AzureBlobStorageService(
            configuration,
            NullLogger<AzureBlobStorageService>.Instance));

        Assert.Null(exception);
    }
}
