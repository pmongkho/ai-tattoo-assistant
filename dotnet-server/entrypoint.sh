#!/bin/bash
set -e

# Print environment variables for debugging (mask sensitive data)
echo "Environment variables:"
echo "ASPNETCORE_ENVIRONMENT: $ASPNETCORE_ENVIRONMENT"
echo "OpenAI__ApiKey exists: ${OpenAI__ApiKey:+yes}"
echo "JwtSettings__SecretKey exists: ${JwtSettings__SecretKey:+yes}"
echo "ConnectionStrings__DefaultConnection: $ConnectionStrings__DefaultConnection"
echo "Configuration files in /app:"
ls -la /app/*.json

# Wait for the database to be ready
echo "Waiting for database to be ready..."
/app/wait-for-it.sh $DB_HOST:$DB_PORT -t 30

# Apply migrations
echo "Applying migrations..."
dotnet ef database update || echo "Migration command failed, continuing anyway"

# Start the application
echo "Starting the application..."
exec dotnet dotnet-server.dll
