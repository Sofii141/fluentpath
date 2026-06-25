import { useState, useEffect, useRef } from "react";
import { Bot, Settings, CheckCircle2, XCircle, Send, Mic, Volume2, RefreshCw } from "lucide-react";
import { DEFAULT_CONFIG, getTutorConfig, saveTutorConfig, pingProvider, tutorReply } from "../lib/ai";
import { speak, createRecognizer, sttSupported } from "../lib/speech";

const TUTOR_SYSTEM =
  "You are Emma, a friendly and encouraging English conversation tutor. " +
  "Keep replies short (2-4 sentences) so the conversation flows. Speak natural, everyday English. " +
  "When the student makes an important mistake, gently correct it: show the better version AND add a very short reason why " +
  "(e.g. \"we say 'people' because it's already plural\"). Then continue the chat with a follow-up question to keep them talking.";

export default function Tutor() {
  const [cfg, setCfg] = useState(getTutorConfig() || DEFAULT_CONFIG);
  const [showSettings, setShowSettings] = useState(!getTutorConfig());
  const [status, setStatus] = useState(null); // {ok, models?, error?}
  const [pinging, setPinging] = useState(false);

  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Emma, your English tutor. What would you like to talk about today?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, busy]);

  const test = async () => {
    setPinging(true);
    saveTutorConfig(cfg);
    setStatus(await pingProvider(cfg));
    setPinging(false);
  };

  const saveCfg = () => { saveTutorConfig(cfg); setShowSettings(false); };

  const send = async (textArg) => {
    const text = (textArg ?? input).trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const convo = [{ role: "system", content: TUTOR_SYSTEM }, ...next];
      const reply = await tutorReply(convo);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (autoSpeak) speak(reply);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ Couldn't reach the model. ${e.message}. Open Settings to check your local Ollama setup.` }]);
    }
    setBusy(false);
  };

  const mic = () => {
    if (listening) { recRef.current?.stop(); return; }
    const rec = createRecognizer({
      onResult: ({ finalText, interimText }) => setInput(finalText || interimText),
      onEnd: () => { setListening(false); },
      onError: () => setListening(false),
    });
    if (!rec) return;
    recRef.current = rec; setListening(true); rec.start();
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">AI Tutor</h1>
          <p className="mt-1 text-soft">Have a real conversation. Runs on your local model — private and free.</p>
        </div>
        <button onClick={() => setShowSettings((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg border border-app bg-surface px-3 py-2 text-sm font-medium text-soft hover:text-main">
          <Settings size={16} /> Settings
        </button>
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
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user" ? "bg-brand-600 text-white" : "bg-surface-2 text-main"}`}>
              {m.role === "assistant" && (
                <button onClick={() => speak(m.content)} className="float-right ml-2 text-mute hover:text-brand-600"><Volume2 size={14} /></button>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {busy && <div className="text-sm text-mute">Emma is typing…</div>}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <button onClick={mic} disabled={!sttSupported()}
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-mute">{label}</span>
      {children}
    </label>
  );
}
