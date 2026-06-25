/**
 * Thin wrappers around the browser Web Speech APIs.
 *  - speak():  text-to-speech (SpeechSynthesis)
 *  - createRecognizer(): speech-to-text (SpeechRecognition)
 * Both degrade gracefully when unsupported.
 */

let cachedVoices = null;

function loadVoices() {
  return new Promise((resolve) => {
    const got = window.speechSynthesis?.getVoices() || [];
    if (got.length) { cachedVoices = got; return resolve(got); }
    if (!window.speechSynthesis) return resolve([]);
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };
  });
}

/** Pick the best English voice available. */
async function pickEnglishVoice(prefer = "en-US") {
  const voices = cachedVoices || (await loadVoices());
  return (
    voices.find((v) => v.lang === prefer) ||
    voices.find((v) => v.lang?.startsWith("en")) ||
    voices[0] ||
    null
  );
}

export const ttsSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Speak a phrase. Returns a promise that resolves when finished. */
export async function speak(text, { rate = 1, lang = "en-US" } = {}) {
  if (!ttsSupported()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.lang = lang;
  const voice = await pickEnglishVoice(lang);
  if (voice) u.voice = voice;
  return new Promise((resolve) => {
    u.onend = resolve;
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

export const sttSupported = () =>
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

/**
 * Create a speech recognizer. Usage:
 *   const rec = createRecognizer({ onResult, onEnd });
 *   rec.start(); ... rec.stop();
 */
export function createRecognizer({ lang = "en-US", interim = true, onResult, onEnd, onError } = {}) {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = interim;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  rec.onresult = (e) => {
    let finalText = "", interimText = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t;
      else interimText += t;
    }
    onResult?.({ finalText: finalText.trim(), interimText: interimText.trim() });
  };
  rec.onend = () => onEnd?.();
  rec.onerror = (e) => onError?.(e.error);
  return rec;
}

/** Compare two phrases word-by-word; returns score 0-100 and per-word match. */
export function scorePronunciation(target, spoken) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9\s']/g, "").split(/\s+/).filter(Boolean);
  const t = norm(target);
  const s = norm(spoken);
  const spokenSet = new Set(s);
  const words = t.map((w) => ({ word: w, ok: spokenSet.has(w) }));
  const matched = words.filter((w) => w.ok).length;
  const score = t.length ? Math.round((matched / t.length) * 100) : 0;
  return { score, words };
}
