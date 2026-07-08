# Frontend Local AI Test

## Goal

Test that the SaraTube frontend can talk to the local backend API, and the backend API can talk to Ollama.

## Working Flow

Browser
-> React frontend
-> backend-api
-> Ollama
-> mistral model
-> response shown in browser

## Test Page

A temporary test page was created:

- `src/pages/AITestPage.tsx`

A temporary route was added:

- `/ai-test`

Route file:

- `src/App.tsx`

## Backend Endpoint Used

The test page calls:

- `POST /api/ai/parent-advisor`

## Important Network Note

When the site is opened from a Windows browser, `localhost` means the Windows laptop, not the Dell server.

So the frontend API URL must use the Dell server IP, for example:

- `http://192.168.0.101:4000/api/ai/parent-advisor`

## Result

The frontend successfully sent a question to the backend API.
The backend API successfully sent the prompt to Ollama.
Ollama used the local `mistral` model.
The AI answer appeared in the browser.

## Next Step

Create a cleaner configuration so the frontend does not hardcode the Dell IP directly in the source code.
Use an environment variable such as:

- `VITE_API_BASE_URL`
