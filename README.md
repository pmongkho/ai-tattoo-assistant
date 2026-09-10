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
- **AI Integration**: OpenAI Responses API
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
   - Set `OPENAI_API_KEY` to a project API key from the OpenAI dashboard. The backend sends it only from the server; do not put it in the Angular app or commit it.
   - Optionally set `OPENAI_MODEL` (the default is `gpt-4.1-mini`), `OPENAI_TEMPERATURE`, and `OPENAI_TOP_P`.
   - No Assistants API assistant, thread, or vector-store ID is required. Existing chat history is sent to the Responses API with each request.
   - Configure the database and other service credentials required by your deployment.
   - Provide Azure Blob Storage settings via environment variables or `appsettings.*.json`:
     - `AZURE_STORAGE_CONNECTION_STRING` / `AzureStorage:ConnectionString`
     - `AZURE_STORAGE_CONTAINER` / `AzureStorage:ContainerName`

3. Run the app with Docker:
   ```bash
   docker-compose up --build
   ```

4. Visit the frontend at `http://localhost:4200`

### OpenAI Responses API setup

The server uses `POST /v1/responses` for both text and image-assisted consultations, following OpenAI's [Responses API migration guide](https://developers.openai.com/api/docs/guides/migrate-to-responses). To enable it:

1. Create or select an OpenAI API project, add billing/credits as needed, and create a project API key.
2. Add `OPENAI_API_KEY` to the backend environment in your local shell, Docker/hosting provider, or secret manager, then restart/redeploy the backend.
3. If you override `OPENAI_MODEL`, choose a model available to that API project that supports the Responses API and image input. Remove an old `OPENAI_MODEL=gpt-3.5-turbo` override so the new default can take effect.
4. Verify the integration with `GET /api/tattoo/test-openai` after starting the backend. A missing or rejected key intentionally returns the app's fallback message instead of breaking the consultation flow. A rejected key is disabled for that service instance so it is not repeatedly sent; replace `OPENAI_API_KEY` and restart the backend.

Conversation state remains in this application's consultation history rather than in an OpenAI Assistant or Thread, so this migration does not require migrating Assistant IDs or server-side OpenAI threads.

### Azure Blob Storage recovery

If Azure removed the storage account (for example, after a subscription was
disabled), requests to its former `*.blob.core.windows.net` hostname can fail
with `nodename nor servname provided, or not known`. Retrying the application
cannot repair that condition because the configured storage endpoint no longer
exists.

To restore image uploads:

1. Reactivate the Azure subscription, if it is still recoverable, and check the
   Azure portal for a recoverable storage account. If Azure has permanently
   deleted the account, create a new **StorageV2** account instead.
2. Copy a connection string for the restored or replacement account from
   **Storage account > Access keys**.
3. Replace `AZURE_STORAGE_CONNECTION_STRING` wherever the backend is hosted.
   Remove any old value from the repository-level `.env`, shell profile, IDE
   launch settings, and hosting-provider secrets so it cannot override the new
   value.
4. Set `AZURE_STORAGE_CONTAINER` if a name other than
   `consultation-images` should be used, then restart the backend. The service
   creates the container on the first upload or delete operation.

The connection string restores connectivity only; it cannot restore blobs from
a permanently deleted account. Previously stored image URLs will continue to
refer to the deleted account and must be replaced or removed from the database.

For local development without image uploads, unset
`AZURE_STORAGE_CONNECTION_STRING` (and leave
`AzureStorage:ConnectionString` empty). The backend will use
`NoOpStorageService`; text-only consultation features remain available, while
an attempted image upload reports that file storage is not configured.

The ASP.NET Core warning `Failed to determine the https port for redirect` is
separate from Azure Storage and does not cause the blob DNS failure. Development
runs do not need HTTPS redirection; production deployments should configure an
HTTPS URL or terminate TLS at the hosting proxy.

## Project Structure

- `dotnet-server/` – ASP.NET backend with all API and DB logic
- `angular-client/` – Angular frontend application
- `.env` – Environment variables
- `docker-compose.yml` – For container orchestration

## Meta (Facebook/Instagram) Webhook Setup

- **Callback URL**: Deploy the backend and provide Meta with `https://<your-domain>/api/meta`. When running locally with a tunnel, point the tunnel to the ASP.NET server and append `/api/meta`.
- **Verify Token**: Set the configuration key `MetaAccess:FbVerifyToken` (or environment variable `MetaAccess__FbVerifyToken`) to the value you enter in the Meta developer console. The webhook verification endpoint compares Meta's `hub.verify_token` against this value.
- **Whitespace Handling**: The backend trims any leading/trailing whitespace on both the configured verify token and the value Meta sends, but token characters remain case-sensitive—double-check for typos when copying the token into the developer console.
- **Challenge Handling**: Meta sends a GET request with `hub.mode`, `hub.challenge`, and `hub.verify_token`. The `MetaWebhookController` returns the `hub.challenge` string when the mode is `subscribe` and the token matches; otherwise it rejects the request.
- **Local Test**: Replace the placeholder values and run:
  ```bash
  curl "https://ai-tattoo-assistant.onrender.com/api/meta?hub.mode=subscribe&hub.challenge=YOUR_CHALLENGE&hub.verify_token=tattoo-verify-prod"
  ```
  The command echoes the challenge string when the configured verify token matches (update `hub.verify_token` if you changed `MetaAccess:FbVerifyToken`).


## License

This project is open-source and available under the MIT License.
