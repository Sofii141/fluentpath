import { useState } from "react";
import { GraduationCap, ArrowRight } from "lucide-react";
import { useProgress } from "../context/ProgressContext";

const LEVELS = [
  { id: "A1", title: "Beginner", desc: "I know a few words and basic phrases." },
  { id: "A2", title: "Elementary", desc: "I can handle simple, everyday conversations." },
  { id: "B1", title: "Intermediate", desc: "I can talk about familiar topics and get by." },
  { id: "B2", title: "Upper-intermediate", desc: "I'm fairly fluent but want to polish it." },
  { id: "C1", title: "Advanced", desc: "I'm strong and aiming for exam mastery." },
];

/** First-run flow: greet, capture name, and place the learner at a level. */
export default function Onboarding() {
  const { data, setData, setLevel } = useProgress();
  // Returning users who onboarded before the level step jump straight to it.
  const [step, setStep] = useState(data.onboarded ? 1 : 0);
  const [name, setName] = useState(data.name || "");

  // Done only once both name and level are set.
  if (data.onboarded && data.level) return null;

  const finish = (level) => {
    setLevel(level);
    setData((d) => ({ ...d, name: name.trim() || d.name, onboarded: true }));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-app bg-surface p-7 shadow-card animate-pop">
        {step === 0 ? (
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
              <GraduationCap size={28} />
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-main">Welcome to EnglishUp</h1>
            <p className="mt-2 text-soft">Your guided path to confident English and a TOEFL-ready score.</p>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setStep(1)}
              placeholder="What's your name?"
              className="mt-5 w-full rounded-lg border border-app bg-app px-4 py-3 text-center text-main outline-none focus:border-brand-300" />
            <button onClick={() => setStep(1)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700">
              Continue <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div>
            <h1 className="font-display text-xl font-extrabold text-main">What's your English level?</h1>
            <p className="mt-1 text-sm text-soft">We'll tailor every exercise to you — and raise the level as you grow. You can change this anytime.</p>
            <div className="mt-4 space-y-2">
              {LEVELS.map((l) => (
                <button key={l.id} onClick={() => finish(l.id)}
                  className="flex w-full items-center gap-3 rounded-lg border border-app bg-surface p-3 text-left hover:border-brand-300 hover:bg-brand-50">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-600 font-display text-sm font-extrabold text-white">{l.id}</span>
                  <div>
                    <p className="font-semibold text-main">{l.title}</p>
                    <p className="text-xs text-soft">{l.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-mute">Not sure? Pick Intermediate (B1) — we'll adjust as you practice.</p>
          </div>
        )}
      </div>
    </div>
  );
}
