import { useState, useEffect, useRef } from "react";
import { Settings, CheckCircle2, XCircle, Send, Mic, Volume2, RefreshCw, Award } from "lucide-react";
import { DEFAULT_CONFIG, getTutorConfig, saveTutorConfig, pingProvider, tutorReply } from "../lib/ai";
import { speak, createRecognizer, sttSupported } from "../lib/speech";
import { assessSpeech, azureConfigured } from "../lib/pronunciation";
import { usePersistentConversation } from "../lib/conversations";

const scoreColor = (s) => (s >= 80 ? "var(--color-emerald-500)" : s >= 60 ? "var(--color-amber-500)" : "var(--color-rose-500)");

const TUTOR_SYSTEM =
  "You are Emma, a friendly and encouraging English conversation and PRONUNCIATION tutor. " +
  "Keep replies short (2-4 sentences) so the conversation flows. Speak natural, everyday English. " +
  "When the student makes an important grammar mistake, gently correct it with the better version and a very short reason. " +
  "Your main focus is PRONUNCIATION: whenever a pronunciation note is provided about the student's speech, you MUST, after a brief natural reply, add a short coaching tip on HOW to pronounce the weakest word — break it into syllables, mark the STRESSED syllable in CAPS, and give a simple sound hint (e.g. \"comfortable = KUMF-ter-bul, the first syllable is stressed\"). Always end with a question to keep her talking.";

export default function Tutor() {
  const [cfg, setCfg] = useState(getTutorConfig() || DEFAULT_CONFIG);
  const [showSettings, setShowSettings] = useState(!getTutorConfig());
  const [status, setStatus] = useState(null); // {ok, models?, error?}
  const [pinging, setPinging] = useState(false);

  const { messages, setMessages, reset } = usePersistentConversation("tutor", {
    type: "tutor", title: "Chat with Emma",
    initial: [{ role: "assistant", content: "Hi! I'm Emma, your English tutor. What would you like to talk about today?" }],
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [listening, setListening] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const recRef = useRef(null);
  const scrollRef = useRef(null);
  const pro = azureConfigured(); // pronunciation scoring available?

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, busy]);

  const test = async () => {
    setPinging(true);
    saveTutorConfig(cfg);
    setStatus(await pingProvider(cfg));
    setPinging(false);
  };

  const saveCfg = () => { saveTutorConfig(cfg); setShowSettings(false); };

  const send = async (textArg, pron) => {
    const text = (textArg ?? input).trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text, pron }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const convo = [
        { role: "system", content: TUTOR_SYSTEM },
        ...next.map((m) => ({ role: m.role, content: m.content })),
      ];
      // If we have pronunciation scores, tell Emma which words to coach.
      if (pron?.words?.length) {
        const weak = pron.words
          .filter((w) => w.accuracy < 80)
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 2)
          .map((w) => `"${w.word}" (${w.accuracy}%)`);
        if (weak.length) {
          convo.push({
            role: "system",
            content: `Pronunciation note (not shown to the student): she spoke aloud and her weakest-pronounced words were ${weak.join(", ")}. After your brief reply, add a short, friendly tip on HOW to pronounce the weakest one (syllables, stressed syllable in CAPS, simple sound hint).`,
          });
        }
      }
      const reply = await tutorReply(convo);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (autoSpeak) speak(reply);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ Couldn't reach the model. ${e.message}. Open Settings to check your local Ollama setup.` }]);
    }
    setBusy(false);
  };

  // With Azure: capture speech, score pronunciation, and auto-send to Emma.
  const micPro = async () => {
    if (assessing) return;
    setAssessing(true); setListening(true);
    try {
      const r = await assessSpeech();
      if (r.recognized) {
        send(r.recognized, { pronunciation: r.pronunciation, accuracy: r.accuracy, fluency: r.fluency, words: r.words });
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${e.message}` }]);
    }
    setListening(false); setAssessing(false);
  };

  // Without Azure: plain browser transcription into the input box.
  const micBasic = () => {
    if (listening) { recRef.current?.stop(); return; }
    const rec = createRecognizer({
      onResult: ({ finalText, interimText }) => setInput(finalText || interimText),
      onEnd: () => { setListening(false); },
      onError: () => setListening(false),
    });
    if (!rec) return;
    recRef.current = rec; setListening(true); rec.start();
  };

  const mic = () => (pro ? micPro() : micBasic());

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">AI Tutor</h1>
          <p className="mt-1 text-soft">
            Speak with Emma — she corrects your grammar{pro ? " and scores your pronunciation" : ""}. Private & local.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { if (confirm("Start a new chat? The current one is saved in your history.")) reset(); }}
            className="flex items-center gap-1.5 rounded-lg border border-app bg-surface px-3 py-2 text-sm font-medium text-soft hover:text-main">
            New chat
          </button>
          <button onClick={() => setShowSettings((s) => !s)}
            className="flex items-center gap-1.5 rounded-lg border border-app bg-surface px-3 py-2 text-sm font-medium text-soft hover:text-main">
            <Settings size={16} /> Settings
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="rounded-xl border border-app bg-surface p-5 shadow-card space-y-3">
          <h3 className="font-display font-bold text-main">Model connection</h3>
          <p className="text-sm text-soft">
            Default uses a local <b>Ollama</b> server (no API key). Install Ollama, run a model, and you're set.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Provider">
              <select value={cfg.provider} onChange={(e) => setCfg({ ...cfg, provider: e.target.value })}
                className="w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-main">
                <option value="ollama">Ollama (local)</option>
                <option value="openai-compatible">OpenAI-compatible (Groq, LM Studio…)</option>
              </select>
            </Field>
            <Field label="Model">
              <input value={cfg.model} onChange={(e) => setCfg({ ...cfg, model: e.target.value })}
                className="w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-main" placeholder="llama3.1:8b" />
            </Field>
            <Field label="Base URL">
              <input value={cfg.baseUrl} onChange={(e) => setCfg({ ...cfg, baseUrl: e.target.value })}
                className="w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-main" />
            </Field>
            {cfg.provider !== "ollama" && (
              <Field label="API key (optional)">
                <input value={cfg.apiKey} type="password" onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })}
                  className="w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-main" />
              </Field>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={test} disabled={pinging}
              className="flex items-center gap-1.5 rounded-lg border border-app px-3 py-2 text-sm font-semibold text-soft hover:text-main">
              <RefreshCw size={15} className={pinging ? "animate-spin" : ""} /> Test connection
            </button>
            <button onClick={saveCfg} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Save</button>
            {status && (
              <span className={`flex items-center gap-1.5 text-sm font-medium ${status.ok ? "text-emerald-500" : "text-rose-500"}`}>
                {status.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {status.ok ? `Connected${status.models?.length ? ` · ${status.models.length} models` : ""}` : `Not reachable: ${status.error}`}
              </span>
            )}
          </div>
          {status?.ok && status.models?.length > 0 && (
            <p className="text-xs text-mute">Available: {status.models.join(", ")}</p>
          )}
        </div>
      )}

      {/* Chat */}
      <div ref={scrollRef} className="h-[55vh] space-y-3 overflow-y-auto rounded-xl border border-app bg-surface p-4 shadow-card">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user" ? "bg-brand-600 text-white" : "bg-surface-2 text-main"}`}>
              {m.role === "assistant" && (
                <button onClick={() => speak(m.content)} className="float-right ml-2 text-mute hover:text-brand-600"><Volume2 size={14} /></button>
              )}
              {m.content}
            </div>
            {m.pron && <PronChip pron={m.pron} />}
          </div>
        ))}
        {assessing && <div className="text-right text-sm text-mute">Scoring your pronunciation…</div>}
        {busy && <div className="text-sm text-mute">Emma is typing…</div>}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <button onClick={mic} disabled={(!pro && !sttSupported()) || assessing} title={pro ? "Speak — get pronunciation feedback" : "Speak"}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white disabled:opacity-30 ${listening ? "bg-rose-500 animate-pulse" : "bg-brand-600 hover:bg-brand-700"}`}>
          <Mic size={18} />
        </button>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type or speak your message…"
          className="flex-1 rounded-lg border border-app bg-surface px-4 py-2.5 text-sm text-main outline-none focus:border-brand-300" />
        <button onClick={() => send()} disabled={busy}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40">
          <Send size={18} />
        </button>
      </div>
      <label className="flex items-center gap-2 text-sm text-soft">
        <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} className="h-4 w-4 accent-brand-600" />
        Speak replies aloud
      </label>
    </div>
  );
}

/** Compact pronunciation score under a spoken message; tap to see each word. */
function PronChip({ pron }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1 max-w-[80%]">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-app bg-surface px-2.5 py-1 text-xs font-semibold"
        style={{ color: scoreColor(pron.pronunciation) }}>
        <Award size={12} /> Pronunciation {pron.pronunciation}% · acc {pron.accuracy} · flu {pron.fluency}
        <span className="text-mute">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="mt-1 flex flex-wrap gap-1 rounded-lg border border-app bg-surface p-2">
          {(pron.words || []).map((w, i) => (
            <span key={i} className="rounded px-1.5 py-0.5 text-xs font-medium"
              style={{ background: `color-mix(in srgb, ${scoreColor(w.accuracy)} 14%, transparent)`, color: scoreColor(w.accuracy) }}>
              {w.word} {w.accuracy}
            </span>
          ))}
          {(!pron.words || pron.words.length === 0) && <span className="text-xs text-mute">No word detail.</span>}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-mute">{label}</span>
      {children}
    </label>
  );
}
