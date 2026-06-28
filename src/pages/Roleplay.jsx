import { useState, useEffect, useRef } from "react";
import {
  Briefcase, Coffee, Plane, Users, Utensils, Code, Tent, GraduationCap, Globe,
  ArrowLeft, Mic, Send, Volume2, ClipboardCheck, Sparkles, Lightbulb, BookOpen,
} from "lucide-react";
import { SCENARIOS, INTERVIEWS } from "../data/roleplay";
import { PREP_QUESTIONS, POWER_PHRASES } from "../data/interviewPrep";
import { CV_SUMMARY } from "../data/cv";
import { tutorReply, getTutorConfig } from "../lib/ai";
import { speak, createRecognizer, sttSupported, scorePronunciation } from "../lib/speech";
import { assessPronunciation, azureConfigured } from "../lib/pronunciation";
import { useProgress } from "../context/ProgressContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { usePersistentConversation } from "../lib/conversations";

const ICONS = { Briefcase, Coffee, Plane, Users, Utensils, Code, Tent, GraduationCap, Globe };

const scoreColor = (s) => (s >= 80 ? "var(--color-emerald-500)" : s >= 60 ? "var(--color-amber-500)" : "var(--color-rose-500)");
const splitSentences = (t) => t.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) || [t];

export default function Roleplay() {
  const [active, setActive] = useState(null);
  const [showPrep, setShowPrep] = useState(false);
  if (active) return <Scene scenario={active.scenario} isInterview={active.isInterview} onExit={() => setActive(null)} />;
  if (showPrep) return <InterviewPrep onExit={() => setShowPrep(false)} />;

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Roleplay</h1>
        <p className="mt-1 text-soft">Practice real situations with an AI partner. Build confidence and fluency.</p>
      </header>

      {!getTutorConfig() && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-500">
          Roleplay needs the AI Tutor connected. Set up your local model in the <b>AI Tutor</b> tab first.
        </p>
      )}

      {/* ===== Interview preparation: two modes ===== */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-600/10 text-brand-600"><Briefcase size={16} /></span>
          <h2 className="font-display text-lg font-bold text-main">Interview Preparation</h2>
        </div>
        <p className="mb-3 text-sm text-soft">Two ways to prepare: first sharpen your pronunciation by shadowing model answers, then practice the real interview with feedback.</p>

        {/* Mode 1 — shadow model answers */}
        <button onClick={() => setShowPrep(true)}
          className="mb-3 flex w-full items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-left hover:bg-brand-50">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-600 text-white"><Mic size={20} /></span>
          <div className="flex-1">
            <h3 className="font-display font-extrabold text-brand-700">1 · Shadow model answers (pronunciation)</h3>
            <p className="text-sm text-soft">Hear strong answers built from your CV, repeat each sentence, and get a pronunciation score.</p>
          </div>
          <span className="text-brand-600">→</span>
        </button>

        {/* Mode 2 — real interview */}
        <p className="mb-2 mt-4 text-sm font-semibold text-main">2 · Practice the real interview</p>
        <p className="mb-3 text-xs text-soft">The AI asks real questions, you answer in your own words, and it corrects you and gives feedback at the end.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {INTERVIEWS.map((s) => {
            const I = ICONS[s.icon] || Briefcase;
            return (
              <button key={s.id} onClick={() => setActive({ scenario: s, isInterview: true })}
                className="flex flex-col rounded-xl border border-app bg-surface p-5 text-left shadow-card hover:border-brand-200">
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-600/10 text-brand-600"><I size={20} /></span>
                  <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-soft">{s.level}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-extrabold text-main">{s.title}</h3>
                <p className="text-sm text-soft">{s.desc}</p>
                <span className="mt-2 text-xs font-semibold text-brand-600">Practice with feedback →</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Everyday scenarios */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-violet-500/10 text-violet-500"><Coffee size={16} /></span>
          <h2 className="font-display text-lg font-bold text-main">Real-life Scenarios</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SCENARIOS.map((s) => {
            const I = ICONS[s.icon] || Coffee;
            return (
              <button key={s.id} onClick={() => setActive({ scenario: s, isInterview: false })}
                className="flex flex-col rounded-xl border border-app bg-surface p-5 text-left shadow-card hover:border-brand-200">
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-violet-500/10 text-violet-500"><I size={20} /></span>
                  <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-soft">{s.level}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-extrabold text-main">{s.title}</h3>
                <p className="text-sm text-soft">{s.role}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** One sentence you can hear and then say back, with a pronunciation score. */
function ShadowLine({ text }) {
  const pro = azureConfigured();
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const recRef = useRef(null);

  const record = async () => {
    setError(""); setResult(null);
    if (pro) {
      setBusy(true); setListening(true);
      try { setResult(await assessPronunciation(text)); }
      catch (e) { setError(e.message); }
      setBusy(false); setListening(false);
      return;
    }
    // Free fallback: browser transcription → word-match score.
    if (listening) { recRef.current?.stop(); return; }
    const rec = createRecognizer({
      onResult: () => {},
      onEnd: () => setListening(false),
      onError: () => setListening(false),
    });
    if (!rec) { setError("Speech recognition not supported here."); return; }
    rec.onresult = (ev) => {
      const heard = ev.results[0]?.[0]?.transcript || "";
      const r = scorePronunciation(text, heard);
      setResult({ pronunciation: r.score, words: r.words.map((w) => ({ word: w.word, accuracy: w.ok ? 100 : 0 })) });
    };
    recRef.current = rec; setListening(true); rec.start();
  };

  const score = result?.pronunciation;
  return (
    <div className="rounded-lg border border-app bg-surface p-3">
      <p className="text-sm text-main">{text}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button onClick={() => speak(text)} className="inline-flex items-center gap-1.5 rounded-md border border-app px-2.5 py-1 text-xs font-medium text-soft hover:text-brand-600">
          <Volume2 size={13} /> Listen
        </button>
        <button onClick={record} disabled={busy}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50 ${listening ? "bg-rose-500 animate-pulse" : "bg-brand-600 hover:bg-brand-700"}`}>
          <Mic size={13} /> {busy ? "Scoring…" : listening ? "Listening…" : "Say it"}
        </button>
        {score != null && (
          <span className="text-xs font-bold" style={{ color: scoreColor(score) }}>{score}%</span>
        )}
      </div>
      {result?.words?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {result.words.map((w, i) => (
            <span key={i} className="rounded px-1.5 py-0.5 text-xs font-medium"
              style={{ background: `color-mix(in srgb, ${scoreColor(w.accuracy)} 14%, transparent)`, color: scoreColor(w.accuracy) }}>
              {w.word}
            </span>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function InterviewPrep({ onExit }) {
  const pro = azureConfigured();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={onExit} className="flex items-center gap-1.5 text-sm font-medium text-soft hover:text-main">
        <ArrowLeft size={16} /> Roleplay
      </button>
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main">Shadow Model Answers</h1>
        <p className="mt-1 text-soft">
          For each question, <b>Listen</b> to the model answer, then tap <b>Say it</b> to repeat each sentence and get a pronunciation score{pro ? "" : " (free mode: word match)"}. This is how you make your pronunciation sharp before the real interview.
        </p>
      </header>

      <section className="space-y-3">
        {PREP_QUESTIONS.map((item, i) => (
          <details key={i} className="rounded-xl border border-app bg-surface p-4 shadow-card" open={i === 0}>
            <summary className="cursor-pointer font-semibold text-main">{i + 1}. {item.q}</summary>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-mute"><Lightbulb size={13} className="mt-0.5 shrink-0 text-amber-500" /> {item.tip}</p>
            <button onClick={() => speak(item.answer)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-app px-3 py-1.5 text-sm font-medium text-soft hover:text-brand-600">
              <Volume2 size={14} /> Listen to full answer
            </button>
            <div className="mt-3 space-y-2">
              {splitSentences(item.answer).map((s, j) => <ShadowLine key={j} text={s} />)}
            </div>
          </details>
        ))}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-main"><Sparkles size={18} className="text-brand-600" /> Power phrases (shadow these too)</h2>
        <div className="space-y-2">
          {POWER_PHRASES.map((p, i) => <ShadowLine key={i} text={p.en} />)}
        </div>
      </section>

      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-700">
        <b>Next step:</b> once these feel natural, go back and run the <b>real GDSD interview</b> — answer in your own words and get feedback.
      </div>
    </div>
  );
}

function Scene({ scenario, isInterview, onExit }) {
  const { addXp, practiceSkill } = useProgress();
  const { token } = useAuth();
  // Scenarios flagged useProfile get the learner's CV so the AI personalizes it.
  const systemPrompt = scenario.useProfile
    ? `${scenario.system}\n\n--- Candidate background ---\n${CV_SUMMARY}`
    : scenario.system;
  const { messages, setMessages, resumed, reset } = usePersistentConversation(`roleplay:${scenario.id}`, {
    type: "roleplay", title: scenario.title, initial: [{ role: "assistant", content: scenario.opener }],
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loadingFb, setLoadingFb] = useState(false);
  const recRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, busy, feedback]);
  useEffect(() => { if (!resumed) speak(scenario.opener); }, [scenario]); // eslint-disable-line

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next); setInput(""); setBusy(true);
    try {
      const convo = [{ role: "system", content: systemPrompt }, ...next];
      const reply = await tutorReply(convo);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      speak(reply);
      addXp(4);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${e.message}. Check the AI Tutor connection.` }]);
    }
    setBusy(false);
  };

  const mic = () => {
    if (listening) { recRef.current?.stop(); return; }
    const rec = createRecognizer({
      onResult: ({ finalText, interimText }) => setInput(finalText || interimText),
      onEnd: () => setListening(false), onError: () => setListening(false),
    });
    if (!rec) return; recRef.current = rec; setListening(true); rec.start();
  };

  const getFeedback = async () => {
    const answers = messages.filter((m) => m.role === "user").map((m) => m.content);
    if (answers.length === 0) { setFeedback("Answer at least one question first, then I'll give you feedback."); return; }
    setLoadingFb(true); setFeedback(null);
    try {
      const transcript = messages.map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`).join("\n");
      const reply = await tutorReply([
        { role: "system", content: "You are an expert interview coach evaluating a candidate's English and interview performance. Based on the transcript, give concise, structured feedback in English. Start with a line exactly like 'Interview readiness: X/100' (your honest estimate of how ready they sound). Then:\n1) Overall impression (1-2 sentences)\n2) 2 strengths\n3) 2 things to improve (grammar, vocabulary, or content) with the corrected/better version\n4) One stronger sample answer they could have used\nKeep it under 170 words and be encouraging." },
        { role: "user", content: `Interview transcript:\n${transcript}` },
      ]);
      setFeedback(reply);
      addXp(20);
      practiceSkill("roleplay");
      // Save the feedback to the backend so progress can be reviewed over time.
      if (token) {
        api.saveFeedback({ type: "interview", scenario: scenario.title, transcript, feedback: reply }, token).catch(() => {});
      }
    } catch (e) {
      setFeedback(`⚠️ ${e.message}. Make sure the AI Tutor is connected.`);
    }
    setLoadingFb(false);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <button onClick={onExit} className="flex items-center gap-1.5 text-sm font-medium text-soft hover:text-main">
        <ArrowLeft size={16} /> Roleplay
      </button>
      <div className="rounded-xl border border-app bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-extrabold text-main">{scenario.title}</h2>
            <p className="text-sm text-soft">Talking to: {scenario.role}</p>
          </div>
          <div className="flex items-center gap-2">
            {isInterview && (
              <span className="rounded-md bg-brand-600/10 px-2.5 py-1 text-xs font-bold text-brand-600">Interview</span>
            )}
            {messages.length > 1 && (
              <button onClick={() => { if (confirm("Start this conversation over?")) { reset(); setFeedback(null); } }}
                className="rounded-md border border-app px-2.5 py-1 text-xs font-semibold text-soft hover:text-rose-500">
                Start over
              </button>
            )}
          </div>
        </div>
        {resumed && <p className="mt-2 text-xs text-mute">↩ Resumed your previous session — keep going or start over.</p>}
      </div>

      <div ref={scrollRef} className="h-[48vh] space-y-3 overflow-y-auto rounded-xl border border-app bg-surface p-4 shadow-card">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-brand-600 text-white" : "bg-surface-2 text-main"}`}>
              {m.role === "assistant" && (
                <button onClick={() => speak(m.content)} className="float-right ml-2 text-mute hover:text-brand-600"><Volume2 size={14} /></button>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {busy && <div className="text-sm text-mute">…</div>}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={mic} disabled={!sttSupported()}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white disabled:opacity-30 ${listening ? "bg-rose-500 animate-pulse" : "bg-brand-600 hover:bg-brand-700"}`}>
          <Mic size={18} />
        </button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Your reply…"
          className="flex-1 rounded-lg border border-app bg-surface px-4 py-2.5 text-sm text-main outline-none focus:border-brand-300" />
        <button onClick={send} disabled={busy}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40">
          <Send size={18} />
        </button>
      </div>

      {isInterview && (
        <button onClick={getFeedback} disabled={loadingFb}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50">
          <ClipboardCheck size={16} /> {loadingFb ? "Evaluating your interview…" : "Finish & get feedback"}
        </button>
      )}

      {feedback && (
        <div className="rounded-xl border border-app bg-surface p-4 shadow-card animate-pop">
          <div className="flex items-center gap-2 font-semibold text-main"><Sparkles size={16} className="text-brand-600" /> Interview feedback</div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-main">{feedback}</p>
        </div>
      )}
    </div>
  );
}
