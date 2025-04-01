# AI Tattoo Assistant

AI Tattoo Assistant is a full-stack web application that uses AI to streamline the tattoo consultation and appointment process. Built with ASP.NET Core, PostgreSQL, and Angular, the app connects clients with tattoo artists through a conversational AI interface.

## Features

- 🤖 **AI Chat Interface** – Users chat with an OpenAI-powered assistant to describe their tattoo idea, get estimates, and upload reference images.
- 🧾 **Price Negotiation** – The AI assists in setting a price before booking.
- 📅 **Appointment Booking** – Once a price is agreed upon, users can book an appointment with available tattoo artists.
- 🧠 **Smart Backend** – Built with .NET 8 and PostgreSQL to handle AI prompts, user sessions, and appointment data.
- 🌐 **Modern Frontend** – Angular client for a responsive, smooth user experience.
- 🐳 **Dockerized** – Easily run the app locally using Docker and `docker-compose`.

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

## License

This project is open-source and available under the MIT License.
