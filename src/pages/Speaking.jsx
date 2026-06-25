import { useState, useRef, useEffect } from "react";
import {
  Mic, MicOff, Volume2, ArrowLeft, ArrowRight, Repeat, MessageSquareQuote,
  Settings, CheckCircle2, XCircle, Sparkles, Award,
} from "lucide-react";
import { SHADOW_SETS, SPEAKING_PROMPTS } from "../data/speaking";
import { speak, createRecognizer, sttSupported, scorePronunciation } from "../lib/speech";
import { assessPronunciation, azureConfigured, getAzureConfig, saveAzureConfig, clearAzureConfig } from "../lib/pronunciation";
import { tutorReply, getTutorConfig } from "../lib/ai";
import { useProgress } from "../context/ProgressContext";
import GenerateBar from "../components/GenerateBar";
import { genSpeaking } from "../lib/generator";

export default function Speaking() {
  const [tab, setTab] = useState("shadow");
  const [set, setSet] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [, force] = useState(0);

  if (set) return <Shadowing set={set} onExit={() => setSet(null)} />;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Speaking</h1>
          <p className="mt-1 text-soft">Repeat after the model and get pronunciation feedback — down to each sound.</p>
        </div>
        <button onClick={() => setShowSettings((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg border border-app bg-surface px-3 py-2 text-sm font-medium text-soft hover:text-main">
          <Settings size={16} /> Pronunciation
        </button>
      </header>

      <ProMode />
      {showSettings && <AzureSettings onClose={() => { setShowSettings(false); force((n) => n + 1); }} />}

      {!sttSupported() && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-500">
          Speech recognition works best in Chrome or Edge.
        </p>
      )}

      <div className="flex gap-2">
        {[["shadow", "Shadowing"], ["prompts", "Open Prompts"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === id ? "bg-brand-600 text-white" : "bg-surface border border-app text-soft"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "shadow" ? (
        <div className="space-y-3">
          <GenerateBar withTopic defaultLevel="B2" label="Generate phrases" onGenerate={async (level, topic) => {
            const phrases = await genSpeaking(level, 5);
            if (!phrases.length) throw new Error("No phrases generated, try again.");
            setSet({ id: `gen-${Date.now()}`, title: `${topic} (${level})`, level, phrases });
          }} />
          <div className="grid gap-3 sm:grid-cols-2">
          {SHADOW_SETS.map((s) => (
            <button key={s.id} onClick={() => setSet(s)}
              className="flex flex-col rounded-xl border border-app bg-surface p-5 text-left shadow-card hover:border-brand-200">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-rose-500/10 text-rose-500"><Mic size={20} /></span>
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-soft">{s.level}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-extrabold text-main">{s.title}</h3>
              <p className="text-sm text-soft">{s.phrases.length} phrases</p>
            </button>
          ))}
          </div>
        </div>
      ) : (
        <OpenPrompts />
      )}
    </div>
  );
}

/** Small banner showing whether pro (Azure) mode is active. */
function ProMode() {
  const pro = azureConfigured();
  return (
    <div className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${pro ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-app bg-surface text-soft"}`}>
      <Award size={16} />
      {pro
        ? <span><b>Pro mode active</b> — phoneme-level scoring via Azure.</span>
        : <span>Free mode. Add an Azure key in <b>Pronunciation</b> settings for phoneme-level scoring.</span>}
    </div>
  );
}

function AzureSettings({ onClose }) {
  const existing = getAzureConfig() || { key: "", region: "eastus" };
  const [key, setKey] = useState(existing.key);
  const [region, setRegion] = useState(existing.region);

  const save = () => { saveAzureConfig({ key: key.trim(), region: region.trim() }); onClose(); };
  const remove = () => { clearAzureConfig(); setKey(""); onClose(); };

  return (
    <div className="rounded-xl border border-app bg-surface p-5 shadow-card space-y-3">
      <h3 className="font-display font-bold text-main">Professional pronunciation (Azure Speech)</h3>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-soft">
        <li>Create a free <b>Speech</b> resource at <span className="text-brand-600">portal.azure.com</span> (free F0 tier).</li>
        <li>Copy <b>Key 1</b> and the <b>Region</b> (e.g. <code className="rounded bg-surface-2 px-1">eastus</code>).</li>
        <li>Paste them here and save. The app switches to phoneme-level scoring automatically.</li>
      </ol>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-mute">Azure key</span>
          <input value={key} type="password" onChange={(e) => setKey(e.target.value)}
            className="w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-main" placeholder="your-azure-key" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-mute">Region</span>
          <input value={region} onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-main" placeholder="eastus" />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={save} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Save</button>
        <button onClick={remove} className="rounded-lg border border-app px-4 py-2 text-sm font-semibold text-soft hover:text-rose-500">Remove key</button>
        <button onClick={onClose} className="rounded-lg border border-app px-4 py-2 text-sm font-semibold text-soft">Cancel</button>
      </div>
      <p className="text-xs text-mute">Your key is stored only in this browser (localStorage) and sent directly to Azure.</p>
    </div>
  );
}

const scoreColor = (s) => (s >= 80 ? "var(--color-emerald-500)" : s >= 60 ? "var(--color-amber-500)" : "var(--color-rose-500)");

function Shadowing({ set, onExit }) {
  const { addXp, practiceSkill } = useProgress();
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [proResult, setProResult] = useState(null);
  const [basicResult, setBasicResult] = useState(null);
  const [openWord, setOpenWord] = useState(null);
  const [tips, setTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef(null);

  const phrase = set.phrases[idx];
  const pro = azureConfigured();

  useEffect(() => () => recRef.current?.abort?.(), []);

  const reset = () => { setHeard(""); setProResult(null); setBasicResult(null); setOpenWord(null); setTips(null); setError(""); };

  // ----- Pro (Azure) path -----
  const recordPro = async () => {
    reset(); setBusy(true); setListening(true);
    try {
      const r = await assessPronunciation(phrase);
      setProResult(r);
      setHeard(r.recognized);
      addXp(Math.round(r.pronunciation / 10));
      practiceSkill("speaking");
    } catch (e) {
      setError(e.message || "Assessment failed");
    }
    setBusy(false); setListening(false);
  };

  // ----- Free (browser) path -----
  const recordBasic = () => {
    if (listening) { recRef.current?.stop(); return; }
    reset();
    const rec = createRecognizer({
      onResult: ({ finalText, interimText }) => setHeard(finalText || interimText),
      onEnd: () => {
        setListening(false);
        setHeard((h) => {
          if (h) {
            const r = scorePronunciation(phrase, h);
            setBasicResult(r);
            addXp(Math.round(r.score / 10));
            practiceSkill("speaking");
          }
          return h;
        });
      },
      onError: () => setListening(false),
    });
    if (!rec) return;
    recRef.current = rec; setListening(true); rec.start();
  };

  const record = () => (pro ? recordPro() : recordBasic());

  const getTips = async () => {
    setLoadingTips(true);
    try {
      const detail = proResult
        ? `Per-word accuracy: ${proResult.words.map((w) => `${w.word}(${w.accuracy})`).join(", ")}`
        : `The student said: "${heard}"`;
      const reply = await tutorReply([
        { role: "system", content: "You are a friendly English pronunciation coach. In under 80 words, give 2-3 specific, actionable tips to improve the student's pronunciation of the target sentence. Mention exact sounds/words. Be encouraging." },
        { role: "user", content: `Target sentence: "${phrase}". ${detail}` },
      ]);
      setTips(reply);
    } catch {
      setTips("⚠️ Connect the AI Tutor (local model) to get personalized tips.");
    }
    setLoadingTips(false);
  };

  const next = () => { setIdx((i) => (i + 1) % set.phrases.length); reset(); };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <button onClick={onExit} className="flex items-center gap-1.5 text-sm font-medium text-soft hover:text-main">
        <ArrowLeft size={16} /> Speaking
      </button>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-main">{set.title}</h2>
        <span className="text-sm text-mute">{idx + 1} / {set.phrases.length}</span>
      </div>

      <div className="rounded-2xl border border-app bg-surface p-7 text-center shadow-card">
        <span className="text-xs font-semibold uppercase tracking-wider text-mute">Repeat this</span>
        <p className="mt-3 font-display text-2xl font-extrabold text-main">{phrase}</p>
        <button onClick={() => speak(phrase)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-app px-3 py-1.5 text-sm font-medium text-soft hover:text-brand-600">
          <Volume2 size={15} /> Listen to model
        </button>
      </div>

      {/* Mic */}
      <div className="flex flex-col items-center gap-3">
        <button onClick={record} disabled={busy}
          className={`grid h-20 w-20 place-items-center rounded-full text-white shadow-lg disabled:opacity-60 ${listening ? "bg-rose-500 animate-pulse" : "bg-brand-600 hover:bg-brand-700"}`}>
          {listening ? <MicOff size={30} /> : <Mic size={30} />}
        </button>
        <p className="text-sm text-soft">
          {busy ? "Analyzing your pronunciation…" : listening ? "Listening… say the phrase" : pro ? "Tap to record (pro scoring)" : "Tap and say the phrase"}
        </p>
      </div>

      {error && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">{error}</p>}

      {heard && !proResult && (
        <div className="rounded-xl border border-app bg-surface p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-mute">You said</p>
          <p className="mt-1 text-main">{heard}</p>
        </div>
      )}

      {/* ---- PRO result (Azure phoneme-level) ---- */}
      {proResult && (
        <div className="space-y-4 animate-pop">
          <div className="grid grid-cols-4 gap-2">
            {[["Overall", proResult.pronunciation], ["Accuracy", proResult.accuracy], ["Fluency", proResult.fluency], ["Complete", proResult.completeness]].map(([label, val]) => (
              <div key={label} className="rounded-xl border border-app bg-surface p-3 text-center shadow-card">
                <div className="font-display text-xl font-extrabold" style={{ color: scoreColor(val) }}>{val}</div>
                <div className="text-[11px] text-soft">{label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-app bg-surface p-4 shadow-card">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mute">Tap a word to see each sound</p>
            <div className="flex flex-wrap gap-1.5">
              {proResult.words.map((w, i) => (
                <button key={i} onClick={() => setOpenWord(openWord === i ? null : i)}
                  className="rounded-md px-2 py-1 text-sm font-semibold"
                  style={{ background: `color-mix(in srgb, ${scoreColor(w.accuracy)} 14%, transparent)`, color: scoreColor(w.accuracy) }}>
                  {w.word} <span className="opacity-70">{w.accuracy}</span>
                </button>
              ))}
            </div>
            {openWord !== null && proResult.words[openWord] && (
              <div className="mt-3 rounded-lg bg-surface-2 p-3">
                <p className="text-sm font-semibold text-main">Sounds in "{proResult.words[openWord].word}"</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {proResult.words[openWord].phonemes.map((p, j) => (
                    <span key={j} className="rounded px-2 py-0.5 text-sm font-mono"
                      style={{ background: `color-mix(in srgb, ${scoreColor(p.accuracy)} 16%, transparent)`, color: scoreColor(p.accuracy) }}>
                      /{p.phoneme}/ {p.accuracy}
                    </span>
                  ))}
                  {proResult.words[openWord].phonemes.length === 0 && <span className="text-sm text-mute">No phoneme detail.</span>}
                </div>
                {proResult.words[openWord].errorType !== "None" && (
                  <p className="mt-2 text-xs font-semibold text-amber-500">Issue: {proResult.words[openWord].errorType}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- FREE result (word match) ---- */}
      {basicResult && (
        <div className="rounded-xl border border-app bg-surface p-5 text-center shadow-card animate-pop">
          <p className="font-display text-3xl font-extrabold" style={{ color: scoreColor(basicResult.score) }}>{basicResult.score}%</p>
          <p className="text-sm text-soft">words recognized correctly</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {basicResult.words.map((w, i) => (
              <span key={i} className={`rounded-md px-2 py-0.5 text-sm font-medium ${w.ok ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                {w.word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI tips (works in both modes) */}
      {(proResult || basicResult) && (
        <div className="rounded-xl border border-app bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2 font-semibold text-main"><Sparkles size={16} className="text-brand-600" /> Coach tips</div>
          <button onClick={getTips} disabled={loadingTips}
            className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
            {loadingTips ? "Thinking…" : getTutorConfig() ? "Get pronunciation tips" : "Get tips (needs AI Tutor)"}
          </button>
          {tips && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-sm text-main">{tips}</p>}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={record} disabled={busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-app bg-surface py-3 text-sm font-semibold text-soft hover:text-main disabled:opacity-40">
          <Repeat size={15} /> Try again
        </button>
        <button onClick={next} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700">
          Next <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function OpenPrompts() {
  const [active, setActive] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [heard, setHeard] = useState("");
  const recRef = useRef(null);
  const timerRef = useRef(null);

  const start = (p) => {
    setActive(p); setSeconds(p.seconds); setHeard(""); setRunning(true);
    const rec = createRecognizer({
      interim: true,
      onResult: ({ finalText }) => setHeard((h) => (finalText ? (h + " " + finalText).trim() : h)),
    });
    if (rec) { rec.continuous = true; recRef.current = rec; rec.start(); }
    timerRef.current = setInterval(() => {
      setSeconds((s) => { if (s <= 1) { stop(); return 0; } return s - 1; });
    }, 1000);
  };

  const stop = () => { setRunning(false); clearInterval(timerRef.current); recRef.current?.stop?.(); };
  useEffect(() => () => { clearInterval(timerRef.current); recRef.current?.abort?.(); }, []);

  return (
    <div className="space-y-3">
      {SPEAKING_PROMPTS.map((p) => (
        <div key={p.id} className="rounded-xl border border-app bg-surface p-5 shadow-card">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-rose-500/10 text-rose-500"><MessageSquareQuote size={19} /></span>
            <div className="flex-1">
              <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-soft">{p.level} · {p.seconds}s</span>
              <p className="mt-1.5 font-medium text-main">{p.prompt}</p>
            </div>
          </div>
          {active?.id === p.id ? (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-extrabold text-brand-600">{seconds}s</span>
                <button onClick={stop} disabled={!running} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Stop</button>
              </div>
              <p className="mt-3 min-h-[3rem] rounded-lg border border-app bg-app p-3 text-sm text-soft">{heard || "Start speaking…"}</p>
            </div>
          ) : (
            <button onClick={() => start(p)} className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              <Mic size={15} /> Start ({p.seconds}s)
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
