# AI Tattoo Assistant

AI Tattoo Assistant is a full-stack web application that uses AI to streamline tattoo consultations. Built with ASP.NET Core, PostgreSQL, and Angular, the app connects clients with tattoo artists through a conversational AI interface.

## Features

- 🤖 **AI Chat Interface** – Users chat with an OpenAI-powered assistant to describe their tattoo idea and share preferences.
- 🧾 **Price Estimation** – The AI helps suggest a price range before any manual follow-up.
- 🧠 **Smart Backend** – Built with .NET 8 and PostgreSQL to handle AI prompts and consultation records.
- 🌐 **Modern Frontend** – Angular client for a responsive, smooth user experience.
- 🐳 **Dockerized** – Easily run the app locally using Docker and `docker-compose`.
- 🏢 **Multi-Tenant Ready** – Backend scaffold includes per-artist isolation and token management.

## Tech Stack

- **Frontend**: Angular, TypeScript
- **Backend**: ASP.NET Core (.NET 8), C#
- **Database**: PostgreSQL
- **AI Integration**: OpenAI Assistants API
- **DevOps**: Docker, Docker Compose

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download)
- [Node.js & npm](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli)
- [Docker](https://www.docker.com/)
- PostgreSQL running locally or a connection string

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/pmongkho/ai-tattoo-assistant.git
   cd ai-tattoo-assistant
   ```

2. Set up your environment:
   - Copy `sample.env` to `.env` and fill in necessary values (e.g. DB connection, OpenAI key).
   - Provide Azure Blob Storage settings via environment variables or `appsettings.*.json`:
     - `AZURE_STORAGE_CONNECTION_STRING` / `AzureStorage:ConnectionString`
     - `AZURE_STORAGE_CONTAINER` / `AzureStorage:ContainerName`

3. Run the app with Docker:
   ```bash
   docker-compose up --build
   ```

4. Visit the frontend at `http://localhost:4200`

## Project Structure

- `dotnet-server/` – ASP.NET backend with all API and DB logic
- `angular-client/` – Angular frontend application
- `.env` – Environment variables
- `docker-compose.yml` – For container orchestration

## Meta (Facebook/Instagram) Webhook Setup

- **Callback URL**: Deploy the backend and provide Meta with `https://<your-domain>/api/meta`. When running locally with a tunnel, point the tunnel to the ASP.NET server and append `/api/meta`.
- **Verify Token**: Set the configuration key `MetaAccess:FbVerifyToken` (or environment variable `MetaAccess__FbVerifyToken`) to the value you enter in the Meta developer console. The webhook verification endpoint compares Meta's `hub.verify_token` against this value.
- **Challenge Handling**: Meta sends a GET request with `hub.mode`, `hub.challenge`, and `hub.verify_token`. The `MetaWebhookController` returns the `hub.challenge` string when the mode is `subscribe` and the token matches; otherwise it rejects the request.

## License

This project is open-source and available under the MIT License.
