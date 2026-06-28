import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Mic, Pause, Play, CheckCircle2, Circle, CalendarClock, Target, Flame, ArrowRight } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import ProgressRing from "../components/ProgressRing";
import { COLOR_VAR } from "../data/curriculum";

// Application deadline for the GDSD program.
const DEADLINE = new Date("2026-07-28T23:59:59");

export default function Plan() {
  const { data, speakDoneToday, doneToday } = useProgress();
  const daysLeft = Math.max(0, Math.ceil((DEADLINE - new Date()) / 86400000));

  // Daily checklist items.
  const didLesson = Object.keys(doneToday).length > 0;
  const didInterview = !!doneToday.roleplay;
  const tasks = [
    { key: "speak", label: `Speak ${data.speakGoalMin} min with the AI`, done: speakDoneToday, to: "/tutor", hint: "Use the timer below" },
    { key: "shadow", label: "Shadow model answers (pronunciation)", done: !!doneToday.speaking, to: "/roleplay", hint: "Roleplay → Shadow model answers" },
    { key: "interview", label: "Do 1 real interview + feedback", done: didInterview, to: "/roleplay", hint: "Roleplay → GDSD interview" },
    { key: "lesson", label: "1 lesson at your level", done: didLesson, to: "/", hint: "Any skill from your daily plan" },
  ];
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Interview Plan</h1>
        <p className="mt-1 text-soft">Your daily routine to be ready for the GDSD application. Small steps, every day.</p>
      </header>

      {/* Countdown */}
      <div className="flex items-center gap-4 rounded-xl border border-app bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white shadow-card">
        <CalendarClock size={32} />
        <div>
          <p className="text-sm text-brand-100">Applications close July 28, 2026</p>
          <p className="font-display text-2xl font-extrabold">{daysLeft} days left</p>
        </div>
      </div>

      {/* Daily speaking timer */}
      <SpeakingTimer />

      {/* Daily checklist */}
      <section className="rounded-xl border border-app bg-surface p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-main"><Target size={18} className="text-brand-600" /> Today's checklist</h2>
          <span className="text-sm font-semibold text-soft">{doneCount}/{tasks.length}</span>
        </div>
        <div className="space-y-2">
          {tasks.map((t) => (
            <Link key={t.key} to={t.to}
              className={`flex items-center gap-3 rounded-lg border p-3 ${t.done ? "border-emerald-500/30 bg-emerald-500/5" : "border-app hover:border-brand-200"}`}>
              {t.done ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} className="text-mute" />}
              <div className="flex-1">
                <p className={`text-sm font-semibold ${t.done ? "text-soft line-through" : "text-main"}`}>{t.label}</p>
                <p className="text-xs text-mute">{t.hint}</p>
              </div>
              {!t.done && <ArrowRight size={16} className="text-mute" />}
            </Link>
          ))}
        </div>
        {doneCount === tasks.length && (
          <p className="mt-3 rounded-lg bg-emerald-500/10 p-2.5 text-center text-sm font-semibold text-emerald-600">
            Daily plan complete — you're one day closer. 🔥
          </p>
        )}
      </section>
    </div>
  );
}

/** Mandatory daily speaking timer: count down the minimum, then keep going if you want. */
function SpeakingTimer() {
  const { speakGoalSec, speakToday, speakDoneToday, addSpeakSeconds, data, setSpeakGoal } = useProgress();
  const [running, setRunning] = useState(false);
  const pending = useRef(0);
  const [, tick] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      pending.current += 1;
      tick((t) => t + 1);
      if (pending.current >= 3) { addSpeakSeconds(pending.current); pending.current = 0; }
    }, 1000);
    return () => {
      clearInterval(id);
      if (pending.current) { addSpeakSeconds(pending.current); pending.current = 0; }
    };
  }, [running, addSpeakSeconds]);

  const doneSec = speakToday + pending.current;
  const remaining = Math.max(0, speakGoalSec - doneSec);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = Math.min(100, Math.round((doneSec / speakGoalSec) * 100));
  const complete = speakDoneToday || doneSec >= speakGoalSec;

  return (
    <section className="rounded-xl border border-app bg-surface p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-main"><Mic size={18} className="text-rose-500" /> Daily speaking (mandatory)</h2>
        <select value={data.speakGoalMin} onChange={(e) => setSpeakGoal(Number(e.target.value))}
          className="rounded-lg border border-app bg-app px-2 py-1 text-xs font-semibold text-main">
          {[10, 15, 20, 30].map((m) => <option key={m} value={m}>{m} min/day</option>)}
        </select>
      </div>

      <div className="flex items-center gap-5">
        <ProgressRing pct={pct} size={104} stroke={9} color={complete ? COLOR_VAR.emerald : COLOR_VAR.rose}>
          <div className="text-center">
            {complete ? (
              <CheckCircle2 size={26} className="mx-auto text-emerald-500" />
            ) : (
              <span className="font-display text-xl font-extrabold text-main">{mm}:{ss}</span>
            )}
          </div>
        </ProgressRing>

        <div className="flex-1">
          {complete ? (
            <p className="text-sm font-semibold text-emerald-600">Minimum done for today! Keep going if you want — every extra minute helps.</p>
          ) : (
            <p className="text-sm text-soft">Speak with the AI until the timer hits zero. Start it, then go talk with Emma or do a roleplay.</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => setRunning((r) => !r)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white ${running ? "bg-rose-500 hover:bg-rose-600" : "bg-brand-600 hover:bg-brand-700"}`}>
              {running ? <><Pause size={15} /> Pause</> : <><Play size={15} /> {doneSec > 0 ? "Resume" : "Start"}</>}
            </button>
            <Link to="/tutor" className="flex items-center gap-1.5 rounded-lg border border-app px-4 py-2 text-sm font-semibold text-soft hover:text-main">
              Go talk <ArrowRight size={15} />
            </Link>
          </div>
          <p className="mt-2 text-xs text-mute">{Math.floor(doneSec / 60)} min {doneSec % 60}s done today</p>
        </div>
      </div>
    </section>
  );
}
