#!/bin/bash
set -e

# Print environment variables for debugging (mask sensitive data)
echo "Environment variables:"
echo "ASPNETCORE_ENVIRONMENT: $ASPNETCORE_ENVIRONMENT"
echo "OpenAI__ApiKey: ${OpenAI__ApiKey:0:8}..." # Only print first 8 chars
echo "Configuration files in /app:"
ls -la /app/*.json

# Wait for the database to be ready
echo "Waiting for database to be ready..."
/app/wait-for-it.sh db:5432 -t 30

# Apply migrations
echo "Applying migrations..."
dotnet ef database update || echo "Migration command failed, continuing anyway"

# Start the application
echo "Starting the application..."
exec dotnet dotnet-server.dll
