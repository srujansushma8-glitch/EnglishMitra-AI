# EnglishMitra AI Pro

This version connects the website to a real LLM through a Python backend.

## 1. Install Python
Python 3.10+ recommended.

## 2. Install packages
Open a terminal in this folder:

    pip install -r requirements.txt

## 3. Add your API key
Copy `.env.example` to `.env` (or rename `.env.example` to `.env`) and put your key there.

Default provider is Gemini:
    AI_PROVIDER=gemini
    GEMINI_API_KEY=...

You can switch to OpenAI:
    AI_PROVIDER=openai
    OPENAI_API_KEY=...

Do NOT put an API key in `script.js` or `index.html`.

## 4. Start
    python server.py

Open:
    http://127.0.0.1:5000

## What this gives you
- Real LLM conversation
- Conversation history
- English-teacher system prompt
- Correction mode
- Beginner mode
- Role-play mode
- Situation selection
- Browser speech-to-text
- Browser text-to-speech
- Mobile-friendly UI

## Cost
The website code is free, but real AI API calls are not necessarily free. Provider quotas/pricing can change. You need an API key and an account with the chosen provider.

## Security
The API key stays in `.env` on the server and is not sent to the browser. Never commit `.env` to GitHub.

## Deployment
For a public website, deploy the Flask backend to a server and the frontend/backend together, then store the provider API key as a server environment variable. Use HTTPS so microphone access works reliably.
