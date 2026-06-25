import { useState } from "react";
import { BookOpen, ArrowLeft, Volume2, Check, X } from "lucide-react";
import { READINGS } from "../data/reading";
import { speak } from "../lib/speech";
import { useProgress } from "../context/ProgressContext";
import GenerateBar from "../components/GenerateBar";
import { genReading } from "../lib/generator";

export default function Reading() {
  const [active, setActive] = useState(null);
  if (active) return <Passage item={active} onExit={() => setActive(null)} />;

  const generate = async (level) => {
    const r = await genReading(level);
    setActive({ id: `gen-${Date.now()}`, level, ...r });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Reading</h1>
        <p className="mt-1 text-soft">Tap any highlighted word to see its meaning, then take the quiz.</p>
      </header>

      <GenerateBar defaultLevel="B1" label="Generate passage" onGenerate={generate} />
      <div className="grid gap-3 sm:grid-cols-2">
        {READINGS.map((item) => (
          <button key={item.id} onClick={() => setActive(item)}
            className="flex flex-col rounded-xl border border-app bg-surface p-5 text-left shadow-card hover:border-brand-200">
            <div className="flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-amber-500/10 text-amber-500"><BookOpen size={20} /></span>
              <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-soft">{item.level}</span>
            </div>
            <h3 className="mt-3 font-display text-lg font-extrabold text-main">{item.title}</h3>
            <p className="text-sm text-soft">{item.questions.length} questions</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Passage({ item, onExit }) {
  const { addXp, practiceSkill } = useProgress();
  const [popup, setPopup] = useState(null); // { word, meaning }
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const tokens = item.text.split(/(\s+)/);
  const allAnswered = Object.keys(answers).length === item.questions.length;
  const correct = item.questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button onClick={onExit} className="flex items-center gap-1.5 text-sm font-medium text-soft hover:text-main">
        <ArrowLeft size={16} /> Reading
      </button>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-main">{item.title}</h2>
        <button onClick={() => speak(item.text)} className="inline-flex items-center gap-1.5 rounded-lg border border-app px-3 py-1.5 text-sm text-soft hover:text-brand-600">
          <Volume2 size={15} /> Read aloud
        </button>
      </div>

      <div className="relative rounded-xl border border-app bg-surface p-6 text-lg leading-relaxed text-main shadow-card">
        {tokens.map((tok, i) => {
          const clean = tok.toLowerCase().replace(/[^a-z]/g, "");
          const meaning = item.glossary[clean];
          if (meaning) {
            return (
              <span key={i}
                onClick={() => setPopup({ word: tok.trim(), meaning })}
                className="cursor-pointer rounded border-b-2 border-dashed border-amber-400 text-amber-600 hover:bg-amber-500/10">
                {tok}
              </span>
            );
          }
          return <span key={i}>{tok}</span>;
        })}
        {popup && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-amber-500/10 px-4 py-2">
            <span className="text-base"><b className="text-amber-600">{popup.word}</b> — {popup.meaning}</span>
            <button onClick={() => { speak(popup.word); }} className="text-amber-600"><Volume2 size={16} /></button>
          </div>
        )}
      </div>

      {/* Quiz */}
      <div className="space-y-4">
        {item.questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-app bg-surface p-4 shadow-card">
            <p className="font-medium text-main">{i + 1}. {q.q}</p>
            <div className="mt-2 grid gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[i] === oi;
                const reveal = checked && q.answer === oi;
                const wrong = checked && selected && q.answer !== oi;
                return (
                  <button key={oi} disabled={checked} onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                      reveal ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                      : wrong ? "border-rose-500/40 bg-rose-500/10 text-rose-600"
                      : selected ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-app text-soft hover:border-brand-200"}`}>
                    {opt} {reveal && <Check size={15} />} {wrong && <X size={15} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!checked ? (
        <button onClick={() => { setChecked(true); addXp(correct * 5); practiceSkill("reading"); }} disabled={!allAnswered}
          className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
          Check answers
        </button>
      ) : (
        <div className="rounded-xl border border-app bg-surface p-5 text-center shadow-card animate-pop">
          <p className="font-display text-xl font-extrabold text-main">{correct}/{item.questions.length} correct</p>
          <button onClick={onExit} className="mt-3 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">Done</button>
        </div>
      )}
    </div>
  );
}
