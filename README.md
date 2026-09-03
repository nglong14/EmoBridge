# EmoBridge

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Structure](#structure)
- [Technologies Used](#technologies-used)
- [Installation Setup](#installation-setup)
- [API Documentation](#api-documentation)
- [Future Enhancements](#future-enhancements)

---

## Overview
**EmoBridge** is a privacy-conscious emotional AI companion. It utilizes an architecture composed of a modern React frontend, a Node.js Express API gateway, and a Python-based FastAPI service that runs local AI models through Ollama. 

## Features
- **User Authentication**: Secure JWT-based stateless authentication with password hashing (bcrypt).
- **Contact Management**: Keep track of user contacts, including communication channels (SMS, Email) and their respective consent preferences.
- **Conversations & Chat History**: Create and manage multiple chat sessions, retrieve historical messages.
- **Privacy-First AI Inference**: Messages are processed locally using Ollama, ensuring data privacy.
- **Real-Time Streaming**: AI responses stream directly to the client using Server-Sent Events (SSE).

## Structure
The project is organized into multiple packages:
- `frontend/`: The frontend application built with React, TypeScript, and Vite.
- `backend/gateway/`: The Express API gateway that handles authentication, database operations, and user management.
- `backend/ai-service/`: The AI reasoning service written in Python, using FastAPI and Ollama.

## Technologies Used
- **Frontend**: React, TypeScript, Vite
- **Gateway**: Node.js, Express 5, TypeScript, PostgreSQL, Prisma ORM, Zod, Pino (Logging)
- **AI Service**: Python 3.13+, FastAPI, Uvicorn, `uv` (Package Manager), Ollama
- **Infrastructure**: Docker, Docker Compose

## Installation Setup

### Prerequisites
- Docker & Docker Compose
- Node.js (for local development)
- Python 3.13+ and `uv` (for local AI service development)

### Quick Start (Recommended - Docker)
1. Set up your environment variables:
   - Copy `backend/gateway/.env.example` to `backend/gateway/.env`
   - Copy `backend/ai-service/.env.example` to `backend/ai-service/.env`
   - *(Optional)* Set `JWT_SECRET` in a root `.env` file or export it (defaults to a dev placeholder).
2. Start the services:
   ```bash
   docker compose up --build
   ```
3. Run database migrations:
   ```bash
   cd backend/gateway 
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/emobridge npx prisma migrate deploy
   ```

### Local Development (Without Docker)
1. Install dependencies:
   - Frontend: `cd frontend && npm install`
   - Gateway: `cd backend/gateway && npm install`
   - AI Service: `cd backend/ai-service && uv sync`
2. Start PostgreSQL locally and update `.env` files accordingly.
3. Apply migrations: `cd backend/gateway && npx prisma migrate dev`
4. Start Ollama and AI service: `docker compose up ollama ai-service`
5. Start Gateway: `cd backend/gateway && npm run dev`
6. Start Frontend: `cd frontend && npm run dev`

## API Documentation

### Auth (`/auth`)
- `POST /register`: Register a new user (`email`, `password`, `name`).
- `POST /login`: Authenticate and receive a JWT (`email`, `password`).
- `POST /logout`: Stateless logout.
- `GET /me`: Get current authenticated user details.

### Contacts (`/api/contacts`)
- `GET /`: Retrieve all contacts for the authenticated user.
- `POST /`: Create a new contact.
- `PUT /:id`: Update an existing contact.
- `DELETE /:id`: Remove a contact.

### Conversations (`/api/conversations`)
- `GET /`: List all conversations for the user.
- `POST /`: Create a new conversation session.
- `GET /:id/messages`: Retrieve chat history for a specific conversation.
- `PATCH /:id`: Rename a conversation.
- `DELETE /:id`: Delete a conversation and its messages.

### AI Inference
- `POST /inference/chat` (AI Service directly): Accepts chat inference requests and returns responses as Server-Sent Events (SSE).

## Future Enhancements
- **Gateway to AI Service Wiring**: Forward requests through the gateway instead of calling the AI service directly.
- **Continuous Integration/Deployment (CI/CD)**: Set up `.github/workflows/` for automated testing and deployment.
- **Testing Suite**: Integration of test frameworks (Vitest, Jest, Pytest).
- **Proactive Contact Alerting**: Trigger real-time notifications to emergency contacts via Email or SMS based on emotional AI analysis.
- **Linting & Formatting**: Standardize codebase rules via ESLint and Prettier.
- **Agentic Workflow**: Vector database + Agentic workflow to seek support from contact.
