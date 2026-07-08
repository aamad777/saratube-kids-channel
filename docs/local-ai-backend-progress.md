# SaraTube Local AI Backend Progress

## Completed

A local backend API was created in:

- backend-api/

The backend currently supports:

- GET /api/health
- POST /api/ai/test

## Ollama Setup

Ollama is running as a Docker container:

- Container name: ollama
- Image: ollama/ollama:0.31.1
- Port: 11434

The systemd Ollama service was disabled because Docker Ollama was already using port 11434.

## Available Models

Current local models include:

- mistral
- nomic-embed-text

## Test Result

The backend AI test endpoint works.

Example request:

curl -X POST http://localhost:4000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain Docker image vs container in one simple sentence."}'

Example result:

{
  "status": "ok",
  "model": "mistral",
  "response": "A Docker image is a lightweight, static snapshot of an application and its dependencies, while a Docker container is a run-time instance of that image."
}

## Current Architecture

Frontend
-> Backend API
-> Ollama local AI
-> Mistral model

## Next Goal

Create real SaraTube AI endpoints:

- POST /api/ai/kids-chat
- POST /api/ai/quiz-advisor
- POST /api/ai/parent-advisor

These endpoints should replace the old Supabase AI function URLs.
