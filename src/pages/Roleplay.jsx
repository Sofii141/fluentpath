import { useState, useEffect, useRef } from "react";
import {
  Briefcase, Coffee, Plane, Users, Utensils, Code, Tent, GraduationCap,
  ArrowLeft, Mic, Send, Volume2, ClipboardCheck, Sparkles,
} from "lucide-react";
import { SCENARIOS, INTERVIEWS } from "../data/roleplay";
import { tutorReply, getTutorConfig } from "../lib/ai";
import { speak, createRecognizer, sttSupported } from "../lib/speech";
import { useProgress } from "../context/ProgressContext";

const ICONS = { Briefcase, Coffee, Plane, Users, Utensils, Code, Tent, GraduationCap };

export default function Roleplay() {
  const [active, setActive] = useState(null);
  if (active) return <Scene scenario={active.scenario} isInterview={active.isInterview} onExit={() => setActive(null)} />;

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

      {/* Interview practice */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-600/10 text-brand-600"><Briefcase size={16} /></span>
          <h2 className="font-display text-lg font-bold text-main">Interview Practice</h2>
        </div>
        <p className="mb-3 text-sm text-soft">For job, scholarship, and summer-program interviews. The AI asks real questions and gives you feedback at the end.</p>
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

function Scene({ scenario, isInterview, onExit }) {
  const { addXp, practiceSkill } = useProgress();
  const [messages, setMessages] = useState([{ role: "assistant", content: scenario.opener }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loadingFb, setLoadingFb] = useState(false);
  const recRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, busy, feedback]);
  useEffect(() => { speak(scenario.opener); }, [scenario]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next); setInput(""); setBusy(true);
    try {
      const convo = [{ role: "system", content: scenario.system }, ...next];
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
        { role: "system", content: "You are an expert interview coach evaluating a candidate's English and interview performance. Based on the transcript, give concise, structured feedback in English:\n1) Overall impression (1-2 sentences)\n2) 2 strengths\n3) 2 things to improve (grammar, vocabulary, or content) with the corrected/better version\n4) One stronger sample answer they could have used\nKeep it under 160 words and be encouraging." },
        { role: "user", content: `Interview transcript:\n${transcript}` },
      ]);
      setFeedback(reply);
      addXp(20);
      practiceSkill("roleplay");
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
          {isInterview && (
            <span className="rounded-md bg-brand-600/10 px-2.5 py-1 text-xs font-bold text-brand-600">Interview</span>
          )}
        </div>
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
