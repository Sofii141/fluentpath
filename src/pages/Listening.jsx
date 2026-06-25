import { useState } from "react";
import { Play, Pause, Headphones, ArrowLeft, Check, X, Gauge } from "lucide-react";
import { LISTENING } from "../data/listening";
import { speak, stopSpeaking, ttsSupported } from "../lib/speech";
import { useProgress } from "../context/ProgressContext";
import GenerateBar from "../components/GenerateBar";
import { genListening } from "../lib/generator";

export default function Listening() {
  const [active, setActive] = useState(null);
  if (active) return <Exercise item={active} onExit={() => setActive(null)} />;

  const generate = async (level) => {
    const ex = await genListening(level);
    setActive({ id: `gen-${Date.now()}`, level, ...ex });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Listening</h1>
        <p className="mt-1 text-soft">Listen, answer, and train your ear with dictation. Adjust the speed anytime.</p>
      </header>

      <GenerateBar defaultLevel="B1" label="Generate exercise" onGenerate={generate} />
      {!ttsSupported() && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-500">
          Your browser doesn't support speech playback. Try Chrome or Edge.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {LISTENING.map((item) => (
          <button key={item.id} onClick={() => setActive(item)}
            className="flex flex-col rounded-xl border border-app bg-surface p-5 text-left shadow-card hover:border-brand-200">
            <div className="flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-sky-500/10 text-sky-500"><Headphones size={20} /></span>
              <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-soft">{item.level}</span>
            </div>
            <h3 className="mt-3 font-display text-lg font-extrabold text-main">{item.title}</h3>
            <p className="text-sm text-soft">{item.questions.length} questions · dictation</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Exercise({ item, onExit }) {
  const { addXp, practiceSkill } = useProgress();
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState({});
  const [dictation, setDictation] = useState("");
  const [checked, setChecked] = useState(false);

  const play = async () => {
    if (playing) { stopSpeaking(); setPlaying(false); return; }
    setPlaying(true);
    await speak(item.script, { rate });
    setPlaying(false);
  };

  const allAnswered = Object.keys(answers).length === item.questions.length;
  const correctCount = item.questions.filter((q, i) => answers[i] === q.answer).length;
  const dictationOk = normalize(dictation) === normalize(item.dictation);

  const check = () => {
    setChecked(true);
    addXp(correctCount * 4 + (dictationOk ? 8 : 0));
    practiceSkill("listening");
  };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <button onClick={onExit} className="flex items-center gap-1.5 text-sm font-medium text-soft hover:text-main">
        <ArrowLeft size={16} /> Listening
      </button>
      <h2 className="font-display text-xl font-extrabold text-main">{item.title}</h2>

      {/* Player */}
      <div className="rounded-xl border border-app bg-surface p-5 shadow-card">
        <div className="flex items-center gap-4">
          <button onClick={play}
            className="grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white hover:bg-brand-700">
            {playing ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </button>
          <div className="flex-1">
            <p className="text-sm font-semibold text-main">{playing ? "Playing…" : "Tap to play the audio"}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-soft">
              <Gauge size={14} />
              {[0.75, 1, 1.25].map((r) => (
                <button key={r} onClick={() => setRate(r)}
                  className={`rounded-md px-2 py-0.5 font-semibold ${rate === r ? "bg-brand-50 text-brand-700" : "text-mute hover:text-main"}`}>
                  {r}×
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
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
                  <button key={oi} disabled={checked}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                      reveal ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                      : wrong ? "border-rose-500/40 bg-rose-500/10 text-rose-600"
                      : selected ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-app text-soft hover:border-brand-200"}`}>
                    {opt}
                    {reveal && <Check size={15} />}
                    {wrong && <X size={15} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dictation */}
      <div className="rounded-xl border border-app bg-surface p-4 shadow-card">
        <p className="font-medium text-main">Dictation — type what you hear</p>
        <button onClick={() => speak(item.dictation, { rate })}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-app px-3 py-1.5 text-sm text-soft hover:text-brand-600">
          <Play size={14} /> Play line
        </button>
        <input value={dictation} onChange={(e) => setDictation(e.target.value)} disabled={checked}
          placeholder="Type the sentence…"
          className="mt-3 w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-main outline-none focus:border-brand-300" />
        {checked && (
          <p className={`mt-2 text-sm font-medium ${dictationOk ? "text-emerald-500" : "text-rose-500"}`}>
            {dictationOk ? "Correct!" : `Answer: "${item.dictation}"`}
          </p>
        )}
      </div>

      {!checked ? (
        <button onClick={check} disabled={!allAnswered}
          className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
          Check answers
        </button>
      ) : (
        <div className="rounded-xl border border-app bg-surface p-5 text-center shadow-card animate-pop">
          <p className="font-display text-xl font-extrabold text-main">{correctCount}/{item.questions.length} correct</p>
          <p className="text-sm text-soft">{dictationOk ? "Dictation nailed!" : "Keep training that ear."}</p>
          <button onClick={onExit} className="mt-3 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">Done</button>
        </div>
      )}
    </div>
  );
}

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s']/g, "").replace(/\s+/g, " ").trim();
