import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Clock, ListChecks, Sparkles, BookOpen, PenLine, Mail, Image, NotebookPen, Shuffle,
} from "lucide-react";
import { WRITING_MODES } from "../data/writing";
import { useLocalStorage } from "../lib/useLocalStorage";
import { useProgress } from "../context/ProgressContext";
import { tutorReply, getTutorConfig } from "../lib/ai";
import { COLOR_VAR } from "../data/curriculum";
import GenerateBar from "../components/GenerateBar";
import { genWritingPrompt } from "../lib/generator";

const ICONS = { BookOpen, PenLine, Mail, Image, NotebookPen };

export default function Writing() {
  const [mode, setMode] = useState(null);
  const [prompt, setPrompt] = useState(null);

  if (prompt) return <Editor mode={mode} item={prompt} onExit={() => setPrompt(null)} />;
  if (mode) return <PromptPicker mode={mode} onPick={setPrompt} onBack={() => setMode(null)} />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Writing</h1>
        <p className="mt-1 text-soft">Choose how you want to practice. Each mode gives you a prompt, a structure, and AI feedback.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {WRITING_MODES.map((m) => {
          const I = ICONS[m.icon] || PenLine;
          const c = COLOR_VAR[m.color];
          return (
            <button key={m.id} onClick={() => setMode(m)}
              className="flex flex-col rounded-xl border border-app bg-surface p-5 text-left shadow-card hover:border-brand-200">
              <span className="grid h-11 w-11 place-items-center rounded-lg"
                style={{ background: `color-mix(in srgb, ${c} 12%, transparent)`, color: c }}>
                <I size={20} />
              </span>
              <h3 className="mt-3 font-display text-lg font-extrabold text-main">{m.title}</h3>
              <p className="text-sm text-soft">{m.desc}</p>
              <span className="mt-2 text-xs font-semibold text-mute">{m.prompts.length} prompt{m.prompts.length > 1 ? "s" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PromptPicker({ mode, onPick, onBack }) {
  const I = ICONS[mode.icon] || PenLine;
  const c = COLOR_VAR[mode.color];
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-soft hover:text-main">
        <ArrowLeft size={16} /> Writing modes
      </button>
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${c} 12%, transparent)`, color: c }}>
          <I size={22} />
        </span>
        <div>
          <h1 className="font-display text-xl font-extrabold text-main">{mode.title}</h1>
          <p className="text-sm text-soft">{mode.desc}</p>
        </div>
      </div>

      <button onClick={() => onPick(mode.prompts[Math.floor(Math.random() * mode.prompts.length)])}
        className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        <Shuffle size={16} /> Surprise me
      </button>

      <GenerateBar defaultLevel="B2" label="Generate prompt" onGenerate={async (level) => {
        const p = await genWritingPrompt(level, mode.id);
        onPick(p);
      }} />

      <div className="space-y-3">
        {mode.prompts.map((p) => (
          <button key={p.id} onClick={() => onPick(p)}
            className="flex w-full items-start justify-between gap-3 rounded-xl border border-app bg-surface p-4 text-left shadow-card hover:border-brand-200">
            <p className="text-main">{p.prompt}</p>
            <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-soft">{p.level}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Editor({ mode, item, onExit }) {
  const { addXp, practiceSkill } = useProgress();
  const [drafts, setDrafts] = useLocalStorage("englishup.writing", {});
  const [text, setText] = useState(drafts[item.id] || "");
  const [seconds, setSeconds] = useState(item.minutes * 60);
  const [checks, setChecks] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const save = () => {
    setDrafts((d) => ({ ...d, [item.id]: text }));
    addXp(15); practiceSkill("writing");
    setSavedMsg(true); setTimeout(() => setSavedMsg(false), 1500);
  };

  const getAIFeedback = async () => {
    setLoadingAI(true); setFeedback(null);
    try {
      const reply = await tutorReply([
        { role: "system", content: "You are a supportive English writing tutor. Give clear, structured feedback in English on the student's text:\n1) One genuine strength.\n2) 2-3 specific corrections — for EACH one, show the original, the better version, AND a short reason WHY it's better (grammar rule, word choice, or clarity).\n3) One suggestion to make the writing stronger.\nKeep it under 150 words and be encouraging." },
        { role: "user", content: `Task (${mode.title}): ${item.prompt}\n\nMy text:\n${text}` },
      ]);
      setFeedback(reply);
      addXp(10); practiceSkill("writing");
    } catch {
      setFeedback("⚠️ AI tutor not connected. Set up your local model in the AI Tutor tab to get feedback that explains the why of each correction.");
    }
    setLoadingAI(false);
  };

  const aiReady = !!getTutorConfig();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button onClick={onExit} className="flex items-center gap-1.5 text-sm font-medium text-soft hover:text-main">
        <ArrowLeft size={16} /> {mode.title}
      </button>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-main">{mode.title}</h2>
        <span className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold ${seconds < 60 ? "bg-rose-500/10 text-rose-500" : "bg-surface-2 text-soft"}`}>
          <Clock size={15} /> {mm}:{ss}
        </span>
      </div>

      <div className="rounded-xl border border-app bg-surface p-4 shadow-card">
        <p className="text-main">{item.prompt}</p>
      </div>

      <details className="rounded-xl border border-app bg-surface p-4 shadow-card">
        <summary className="cursor-pointer font-semibold text-main">Structure template</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-soft">
          {item.template.map((t, i) => <li key={i}>{t}</li>)}
        </ol>
      </details>

      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10}
        placeholder="Start writing here…"
        className="w-full rounded-xl border border-app bg-surface p-4 text-main outline-none focus:border-brand-300 shadow-card" />

      <div className="flex items-center justify-between text-sm">
        <span className={`font-semibold ${words >= item.minWords ? "text-emerald-500" : "text-mute"}`}>
          {words} / {item.minWords} words
        </span>
        <button onClick={save} className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
          {savedMsg ? "Saved ✓" : "Save draft"}
        </button>
      </div>

      <div className="rounded-xl border border-app bg-surface p-4 shadow-card">
        <div className="flex items-center gap-2 font-semibold text-main"><Sparkles size={16} className="text-brand-600" /> AI feedback (with the why)</div>
        <button onClick={getAIFeedback} disabled={loadingAI || words < 10}
          className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
          {loadingAI ? "Analyzing…" : aiReady ? "Get feedback" : "Get feedback (needs AI Tutor setup)"}
        </button>
        {feedback && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-sm text-main">{feedback}</p>}
      </div>

      <div className="rounded-xl border border-app bg-surface p-4 shadow-card">
        <div className="flex items-center gap-2 font-semibold text-main"><ListChecks size={16} className="text-emerald-500" /> Self-assessment</div>
        <div className="mt-2 space-y-1.5">
          {item.checklist.map((c, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-soft">
              <input type="checkbox" checked={!!checks[i]} onChange={() => setChecks((s) => ({ ...s, [i]: !s[i] }))} className="h-4 w-4 accent-emerald-500" />
              {c}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
