# SaraTube AI Migration Plan

## Current AI Architecture

The current app has three AI frontend components:

1. `src/components/ai/KidsChatBot.tsx`
   - Current endpoint: `${VITE_SUPABASE_URL}/functions/v1/kids-chat`
   - Sends: `{ messages }`
   - Uses Supabase publishable key in Authorization header
   - Expects streaming response

2. `src/components/ai/GuidedQuizBot.tsx`
   - Current endpoint: `${VITE_SUPABASE_URL}/functions/v1/quiz-advisor`
   - Sends: `{ answers }`
   - Uses Supabase publishable key in Authorization header
   - Expects streaming response

3. `src/components/parent/ParentAIAdvisor.tsx`
   - Current endpoint: `${VITE_SUPABASE_URL}/functions/v1/parent-advisor`
   - Sends: `{ messages, childInfo }`
   - Uses Supabase publishable key in Authorization header
   - Expects streaming response

## Problem

The current AI features depend on:

- Supabase Edge Functions
- Supabase environment variables
- External AI gateway

This does not match the on-premise goal.

## Target AI Architecture

Replace the cloud AI flow with:

Frontend
→ Local backend API
→ Local AI service
→ Ollama local model

## New Local Endpoints

1. `/api/ai/kids-chat`
2. `/api/ai/quiz-advisor`
3. `/api/ai/parent-advisor`

## Migration Strategy

Keep the frontend streaming logic first.

The local backend should return OpenAI-style server-sent events:

`data: {"choices":[{"delta":{"content":"text"}}]}`

and finish with:

`data: [DONE]`

This allows small frontend changes while replacing the cloud AI backend.

## Later Improvements

- Add authentication before calling AI endpoints
- Add rate limiting
- Add admin-only AI endpoints
- Add child safety guardrails
- Add local RAG over videos, categories, and parent rules
- Add monitoring and logs for AI requests
