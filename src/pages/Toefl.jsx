import { useState } from "react";
import { BookOpen, Headphones, Mic, PenLine, ArrowRight, Volume2, Trophy } from "lucide-react";
import { READINGS } from "../data/reading";
import { LISTENING } from "../data/listening";
import { SPEAKING_PROMPTS } from "../data/speaking";
import { MODE_BY_ID } from "../data/writing";
import { speak } from "../lib/speech";
import { useProgress } from "../context/ProgressContext";
import { useLocalStorage } from "../lib/useLocalStorage";

const reading = READINGS[1];
const listening = LISTENING[1];
const speakingPrompt = SPEAKING_PROMPTS[1];
const writingPrompt = MODE_BY_ID.opinion.prompts[0];

const STEPS = ["intro", "reading", "listening", "speaking", "writing", "result"];

export default function Toefl() {
  const { addXp } = useProgress();
  const [history, setHistory] = useLocalStorage("englishup.toefl", []);
  const [step, setStep] = useState(0);
  const [rAns, setRAns] = useState({});
  const [lAns, setLAns] = useState({});
  const [spoke, setSpoke] = useState(false);
  const [wrote, setWrote] = useState("");
  const [result, setResult] = useState(null);

  const go = () => setStep((s) => s + 1);

  const finish = () => {
    const rScore = reading.questions.filter((q, i) => rAns[i] === q.answer).length / reading.questions.length;
    const lScore = listening.questions.filter((q, i) => lAns[i] === q.answer).length / listening.questions.length;
    const sScore = spoke ? 1 : 0;
    const wScore = Math.min(1, wrote.trim().split(/\s+/).filter(Boolean).length / writingPrompt.minWords);
    const sections = { Reading: rScore, Listening: lScore, Speaking: sScore, Writing: wScore };
    const total = Math.round(((rScore + lScore + sScore + wScore) / 4) * 120);
    addXp(40);
    setHistory((h) => [{ date: new Date().toISOString().slice(0, 10), total, sections }, ...h].slice(0, 10));
    setResult({ sections, total });
    setStep(STEPS.indexOf("result"));
  };

  const name = STEPS[step];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">TOEFL Mock Exam</h1>
        <p className="mt-1 text-soft">A short simulation of all four sections with an estimated score.</p>
      </header>

      {/* Progress dots */}
      {name !== "intro" && name !== "result" && (
        <div className="flex items-center gap-2">
          {["reading", "listening", "speaking", "writing"].map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${STEPS.indexOf(s) <= step ? "bg-brand-600" : "bg-surface-2"}`} />
          ))}
        </div>
      )}

      {name === "intro" && (
        <div className="rounded-xl border border-app bg-surface p-6 shadow-card space-y-4">
          <p className="text-main">This mini-exam covers all four TOEFL sections. It takes about 10 minutes. Ready?</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Badge Icon={BookOpen} label="Reading" />
            <Badge Icon={Headphones} label="Listening" />
            <Badge Icon={Mic} label="Speaking" />
            <Badge Icon={PenLine} label="Writing" />
          </div>
          <button onClick={go} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Start exam <ArrowRight size={16} />
          </button>
          {history.length > 0 && (
            <div className="border-t border-app pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-mute">Past attempts</p>
              {history.slice(0, 3).map((h, i) => (
                <div key={i} className="mt-1 flex justify-between text-sm text-soft">
                  <span>{h.date}</span><span className="font-bold text-main">{h.total}/120</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {name === "reading" && (
        <Section title="Reading" Icon={BookOpen}>
          <p className="rounded-lg bg-surface-2 p-4 text-main leading-relaxed">{reading.text}</p>
          <Questions q={reading.questions} ans={rAns} setAns={setRAns} />
          <NextBtn disabled={Object.keys(rAns).length < reading.questions.length} onClick={go} />
        </Section>
      )}

      {name === "listening" && (
        <Section title="Listening" Icon={Headphones}>
          <button onClick={() => speak(listening.script)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            <Volume2 size={15} /> Play audio
          </button>
          <Questions q={listening.questions} ans={lAns} setAns={setLAns} />
          <NextBtn disabled={Object.keys(lAns).length < listening.questions.length} onClick={go} />
        </Section>
      )}

      {name === "speaking" && (
        <Section title="Speaking" Icon={Mic}>
          <p className="rounded-lg bg-surface-2 p-4 text-main">{speakingPrompt.prompt}</p>
          <p className="text-sm text-soft">Speak your answer aloud for ~{speakingPrompt.seconds} seconds, then mark it done.</p>
          <label className="flex items-center gap-2 text-sm text-main">
            <input type="checkbox" checked={spoke} onChange={(e) => setSpoke(e.target.checked)} className="h-4 w-4 accent-brand-600" />
            I delivered my spoken response
          </label>
          <NextBtn disabled={!spoke} onClick={go} />
        </Section>
      )}

      {name === "writing" && (
        <Section title="Writing" Icon={PenLine}>
          <p className="rounded-lg bg-surface-2 p-4 text-main">{writingPrompt.prompt}</p>
          <textarea value={wrote} onChange={(e) => setWrote(e.target.value)} rows={8}
            placeholder="Write your response…" className="w-full rounded-lg border border-app bg-app p-3 text-main outline-none focus:border-brand-300" />
          <p className="text-sm text-mute">{wrote.trim().split(/\s+/).filter(Boolean).length}/{writingPrompt.minWords} words</p>
          <button onClick={finish} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Finish & score</button>
        </Section>
      )}

      {name === "result" && result && (
        <div className="rounded-xl border border-app bg-surface p-6 text-center shadow-card animate-pop">
          <Trophy size={32} className="mx-auto text-brand-600" />
          <p className="mt-3 font-display text-4xl font-extrabold text-main">{result.total}<span className="text-xl text-mute">/120</span></p>
          <p className="text-sm text-soft">Estimated TOEFL score</p>
          <div className="mt-5 space-y-2 text-left">
            {Object.entries(result.sections).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-sm"><span className="text-soft">{k}</span><span className="font-semibold text-main">{Math.round(v * 30)}/30</span></div>
                <div className="mt-1 h-2 rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-600" style={{ width: `${v * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <button onClick={() => { setStep(0); setRAns({}); setLAns({}); setSpoke(false); setWrote(""); setResult(null); }}
            className="mt-5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Try again</button>
        </div>
      )}
    </div>
  );
}

function Section({ title, Icon, children }) {
  return (
    <div className="rounded-xl border border-app bg-surface p-5 shadow-card space-y-4">
      <div className="flex items-center gap-2 font-display font-extrabold text-main"><Icon size={18} className="text-brand-600" /> {title}</div>
      {children}
    </div>
  );
}
function Badge({ Icon, label }) {
  return <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 font-medium text-soft"><Icon size={16} className="text-brand-600" /> {label}</div>;
}
function Questions({ q, ans, setAns }) {
  return (
    <div className="space-y-3">
      {q.map((item, i) => (
        <div key={i}>
          <p className="font-medium text-main">{i + 1}. {item.q}</p>
          <div className="mt-1.5 grid gap-1.5">
            {item.options.map((opt, oi) => (
              <button key={oi} onClick={() => setAns((a) => ({ ...a, [i]: oi }))}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${ans[i] === oi ? "border-brand-300 bg-brand-50 text-brand-700" : "border-app text-soft hover:border-brand-200"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function NextBtn({ disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
      Next <ArrowRight size={16} />
    </button>
  );
}
