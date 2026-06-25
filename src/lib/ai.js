/**
 * Provider-agnostic AI tutor client.
 *
 * Config is stored in localStorage under "englishup.ai":
 *   { provider: "ollama" | "openai-compatible", baseUrl, model, apiKey? }
 *
 * The default is a LOCAL Ollama server — no API key, fully private.
 * The adapter shape lets you swap providers without touching the UI.
 */

const STORAGE_KEY = "englishup.ai";

export const DEFAULT_CONFIG = {
  provider: "ollama",
  baseUrl: "http://localhost:11434",
  model: "llama3.1:8b",
  apiKey: "",
};

export function getTutorConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTutorConfig(cfg) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

/** Quick health check — is the configured provider reachable? */
export async function pingProvider(cfg = getTutorConfig() || DEFAULT_CONFIG) {
  try {
    if (cfg.provider === "ollama") {
      const r = await fetch(`${cfg.baseUrl}/api/tags`, { method: "GET" });
      if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
      const data = await r.json();
      const models = (data.models || []).map((m) => m.name);
      return { ok: true, models };
    }
    return { ok: true, models: [] };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Send a chat conversation and get the assistant's reply text.
 * `messages` is an array of { role: "system"|"user"|"assistant", content }.
 */
export async function tutorReply(messages, { onToken } = {}) {
  const cfg = getTutorConfig() || DEFAULT_CONFIG;

  if (cfg.provider === "ollama") {
    return ollamaChat(cfg, messages, onToken);
  }
  // OpenAI-compatible (works for Groq, OpenAI, LM Studio, etc.)
  return openAICompatChat(cfg, messages, onToken);
}

async function ollamaChat(cfg, messages, onToken) {
  const res = await fetch(`${cfg.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: cfg.model, messages, stream: Boolean(onToken) }),
  });
  if (!res.ok) throw new Error(`Ollama error: HTTP ${res.status}`);

  if (!onToken) {
    const data = await res.json();
    return data.message?.content?.trim() || "";
  }

  // Streaming: Ollama returns newline-delimited JSON objects.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        const piece = obj.message?.content || "";
        if (piece) { full += piece; onToken(piece); }
      } catch { /* partial line */ }
    }
  }
  return full.trim();
}

async function openAICompatChat(cfg, messages, onToken) {
  const res = await fetch(`${cfg.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({ model: cfg.model, messages, stream: false }),
  });
  if (!res.ok) throw new Error(`Provider error: HTTP ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim() || "";
  if (onToken) onToken(text);
  return text;
}
