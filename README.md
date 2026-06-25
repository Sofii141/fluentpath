# EnglishUp 🎓

A web app to learn English from beginner to **TOEFL mastery** — built around evidence-based
language-learning methods: spaced repetition, active recall, comprehensible input, shadowing,
output practice, and interleaving.

> Personal project. Frontend: React + Vite + Tailwind. AI tutor: local LLM via Ollama (no API keys).

## Features

- **Dashboard** — daily streak, XP, daily goal ring, and an auto-generated interleaved session.
- **Learning Path** — a guided CEFR journey (A1 → C1) with unlockable stations.
- **Vocabulary** — flashcards with the SM-2 spaced-repetition algorithm.
- **Listening** — TTS audio with comprehension questions and dictation.
- **Speaking** — shadowing + speech recognition with a pronunciation score.
- **Reading** — tap-to-translate glossary and comprehension quizzes.
- **Writing** — timed prompts, templates, self-assessment, and AI feedback.
- **Roleplay** — voice conversations with AI personas (interview, café, airport, meeting).
- **AI Tutor** — real conversation with a local LLM, provider-agnostic adapter.
- **TOEFL Mock** — a four-section simulation with an estimated score.
- **PWA** — installable, responsive, works offline (except cloud AI).

## Tech highlights

- Web Speech API (`SpeechSynthesis` / `SpeechRecognition`) for voice in/out.
- SM-2 spaced repetition (`src/lib/srs.js`).
- Provider-agnostic AI client (`src/lib/ai.js`) — Ollama local or any OpenAI-compatible endpoint.
- All progress persisted in `localStorage`; no backend required.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## AI Tutor setup (optional, local & free)

1. Install **Ollama**: https://ollama.com/download
2. Pull a model: `ollama pull llama3.1:8b`
3. Open the **AI Tutor** tab → *Settings* → *Test connection*.

CORS note: if the browser can't reach Ollama, start it with
`OLLAMA_ORIGINS=* ollama serve` so the web app is allowed to connect.
