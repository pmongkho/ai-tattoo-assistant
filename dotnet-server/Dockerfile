# Use the official .NET 8 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory
WORKDIR /app

# Copy the project file and restore dependencies
COPY ["dotnet-server/dotnet-server.csproj", "dotnet-server/"]
RUN dotnet restore "dotnet-server/dotnet-server.csproj"

# Copy the rest of the application
COPY dotnet-server/ dotnet-server/

# Build and publish the application
RUN dotnet publish "dotnet-server/dotnet-server.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

# Install the Entity Framework Core tools
RUN apt-get update && apt-get install -y curl bash && apt-get clean

# Copy the wait-for-it script and entrypoint script
COPY dotnet-server/wait-for-it.sh /app/wait-for-it.sh
COPY dotnet-server/entrypoint.sh /app/entrypoint.sh

# In your Dockerfile, after copying the published files
COPY --from=build /app/publish ./
COPY dotnet-server/appsettings*.json ./


# Make the scripts executable
RUN chmod +x /app/wait-for-it.sh /app/entrypoint.sh

# Expose port
EXPOSE 5000

# Set the entrypoint to our custom script
ENTRYPOINT ["/app/entrypoint.sh"]
