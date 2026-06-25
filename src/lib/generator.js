/**
 * On-device content generator. Uses the local LLM (Ollama) to create fresh,
 * level-appropriate exercises so the learning path is effectively endless and
 * adapts to the learner. Each generator returns clean JS objects; if the model
 * or JSON parsing fails, callers fall back to built-in sample content.
 *
 * Ollama supports `format: "json"`, which makes the model emit strict JSON.
 */

import { getTutorConfig, DEFAULT_CONFIG } from "./ai";

/** Low-level: ask the local model for JSON and parse it defensively. */
async function generateJSON(system, user) {
  const cfg = getTutorConfig() || DEFAULT_CONFIG;
  if (cfg.provider !== "ollama") {
    // OpenAI-compatible path (Groq/LM Studio): request JSON in the prompt.
    return openAICompatJSON(cfg, system, user);
  }
  const res = await fetch(`${cfg.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.model,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Generator error: HTTP ${res.status}`);
  const data = await res.json();
  return parseLoose(data.message?.content || "");
}

async function openAICompatJSON(cfg, system, user) {
  const res = await fetch(`${cfg.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: system + " Output ONLY valid JSON." },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`Generator error: HTTP ${res.status}`);
  const data = await res.json();
  return parseLoose(data.choices?.[0]?.message?.content || "");
}

/** Parse JSON even if the model wrapped it in prose or code fences. */
function parseLoose(text) {
  try { return JSON.parse(text); } catch { /* try to extract */ }
  const match = text.match(/[[{][\s\S]*[\]}]/);
  if (match) {
    try { return JSON.parse(match[0]); } catch { /* give up */ }
  }
  throw new Error("Could not parse generated content");
}

const LEVEL_HINT = {
  A1: "absolute beginner, very simple words and present tense",
  A2: "elementary, everyday topics and simple sentences",
  B1: "intermediate, common phrasal verbs and connected ideas",
  B2: "upper-intermediate, professional and abstract topics",
  C1: "advanced, academic and nuanced vocabulary (TOEFL level)",
};

// ---------- Vocabulary ----------
export async function genVocab(level = "B2", topic = "general", count = 8) {
  const data = await generateJSON(
    `You create English vocabulary flashcards for a Spanish-speaking learner. Output ONLY JSON: {"cards":[{"term":"","es":"","ex":""}]}. "term" = English word/phrase, "es" = short Spanish meaning, "ex" = natural English example sentence. Target CEFR ${level} (${LEVEL_HINT[level]}). Generate exactly ${count} useful, non-repeating cards.`,
    `Topic: ${topic}. Level: ${level}.`
  );
  return (data.cards || []).filter((c) => c.term && c.es).slice(0, count);
}

// ---------- Listening ----------
export async function genListening(level = "B1") {
  const data = await generateJSON(
    `You create English listening exercises. Output ONLY JSON: {"title":"","script":"","questions":[{"q":"","options":["","",""],"answer":0}],"dictation":""}. "script" = a 3-5 sentence monologue to be read aloud (CEFR ${level}: ${LEVEL_HINT[level]}). 3 comprehension questions, each with 3 options and "answer" = index (0-2) of the correct one. "dictation" = one clear sentence from the script.`,
    `Create one listening exercise at level ${level} on an everyday or professional topic.`
  );
  if (!data.script || !Array.isArray(data.questions)) throw new Error("bad listening");
  return normalizeQuiz(data);
}

// ---------- Reading ----------
export async function genReading(level = "B1") {
  const data = await generateJSON(
    `You create English reading exercises for a Spanish speaker. Output ONLY JSON: {"title":"","text":"","glossary":{"word":"spanish meaning"},"questions":[{"q":"","options":["","",""],"answer":0}]}. "text" = a short paragraph (4-6 sentences, CEFR ${level}: ${LEVEL_HINT[level]}). "glossary" = 6-9 harder words from the text mapped to short Spanish meanings (keys lowercase). 2 comprehension questions with 3 options and "answer" index.`,
    `Create one reading passage at level ${level} on an interesting topic (science, work, culture, technology).`
  );
  if (!data.text || !Array.isArray(data.questions)) throw new Error("bad reading");
  data.glossary = data.glossary || {};
  return normalizeQuiz(data);
}

// ---------- Speaking ----------
export async function genSpeaking(level = "B1", count = 5) {
  const data = await generateJSON(
    `You create English speaking shadowing phrases. Output ONLY JSON: {"phrases":["",""]}. Each phrase is natural spoken English at CEFR ${level} (${LEVEL_HINT[level]}), useful for conversation or interviews. Generate ${count} phrases.`,
    `Level ${level}. ${count} phrases.`
  );
  return (data.phrases || []).filter(Boolean).slice(0, count);
}

// ---------- Writing ----------
export async function genWritingPrompt(level = "B2", mode = "opinion") {
  const data = await generateJSON(
    `You create English writing prompts. Output ONLY JSON: {"prompt":"","template":["","",""],"checklist":["",""],"minWords":80,"minutes":10}. Style: ${mode}. CEFR ${level} (${LEVEL_HINT[level]}). "template" = 3-4 structure steps. "checklist" = 3-4 self-check items.`,
    `Create one ${mode} writing prompt at level ${level}.`
  );
  if (!data.prompt) throw new Error("bad writing");
  return {
    id: `gen-${Date.now()}`,
    level,
    prompt: data.prompt,
    template: data.template || [],
    checklist: data.checklist || [],
    minWords: data.minWords || 80,
    minutes: data.minutes || 10,
  };
}

// ---------- Level test ----------
export async function genLevelTest(level = "B1", count = 6) {
  const data = await generateJSON(
    `You write an English level-check quiz at CEFR ${level} (${LEVEL_HINT[level]}). Output ONLY JSON: {"questions":[{"q":"","options":["","","",""],"answer":0}]}. Mix grammar, vocabulary, and a short reading-comprehension question. Each has 4 options and "answer" = index (0-3) of the correct one. The questions must genuinely test ${level} ability. Generate exactly ${count} questions.`,
    `Create a ${count}-question level check at ${level}.`
  );
  const out = normalizeQuiz(data);
  if (!out.questions.length) throw new Error("bad test");
  return out.questions;
}

/** Coerce question answer indices to numbers and clamp them. */
function normalizeQuiz(data) {
  data.questions = (data.questions || []).map((q) => {
    const opts = (q.options || []).slice(0, 4);
    let answer = Number(q.answer) || 0;
    if (answer < 0 || answer >= opts.length) answer = 0;
    return { q: q.q || "", options: opts, answer };
  }).filter((q) => q.q && q.options.length >= 2);
  return data;
}
