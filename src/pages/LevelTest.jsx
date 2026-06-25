import { useState } from "react";
import { GraduationCap, Check, X, Loader2, Trophy, ArrowRight, RefreshCw } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { genLevelTest } from "../lib/generator";
import { LEVEL_TESTS } from "../data/leveltest";
import { getTutorConfig } from "../lib/ai";

const PASS_PCT = 75;

export default function LevelTest() {
  const { effectiveLevel, nextLevel, isMaxLevel, setLevel, addXp } = useProgress();
  const [phase, setPhase] = useState("intro"); // intro | loading | quiz | result
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const start = async () => {
    setError(""); setAnswers({});
    setPhase("loading");
    try {
      let qs;
      if (getTutorConfig()) {
        qs = await genLevelTest(effectiveLevel, 6);
      } else {
        qs = LEVEL_TESTS[effectiveLevel] || LEVEL_TESTS.B1;
      }
      setQuestions(qs);
      setPhase("quiz");
    } catch {
      // Fall back to the built-in bank if generation fails.
      setQuestions(LEVEL_TESTS[effectiveLevel] || LEVEL_TESTS.B1);
      setPhase("quiz");
    }
  };

  const submit = () => {
    const correct = questions.filter((q, i) => answers[i] === q.answer).length;
    const pct = Math.round((correct / questions.length) * 100);
    const passed = pct >= PASS_PCT;
    addXp(passed ? 50 : 15);
    if (passed && !isMaxLevel) setLevel(nextLevel);
    setResult({ correct, total: questions.length, pct, passed });
    setPhase("result");
  };

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Level Test</h1>
        <p className="mt-1 text-soft">Prove your mastery to officially move up a level. Your level — not your XP — decides exercise difficulty.</p>
      </header>

      {phase === "intro" && (
        <div className="rounded-xl border border-app bg-surface p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600 font-display font-extrabold text-white">{effectiveLevel}</span>
            <div>
              <p className="font-semibold text-main">You're at level {effectiveLevel}</p>
              {isMaxLevel
                ? <p className="text-sm text-soft">Top level reached — take it to confirm your mastery.</p>
                : <p className="text-sm text-soft">Pass this test ({PASS_PCT}%+) to advance to <b>{nextLevel}</b>.</p>}
            </div>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-soft">
            <li>6 questions: grammar, vocabulary, and reading.</li>
            <li>No time limit. Answer honestly — it sets your real level.</li>
            <li>Don't pass? Keep practicing and try again anytime.</li>
          </ul>
          <button onClick={start} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Start the {effectiveLevel} test <ArrowRight size={16} />
          </button>
          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>
      )}

      {phase === "loading" && (
        <div className="grid place-items-center rounded-xl border border-app bg-surface p-10 shadow-card">
          <Loader2 size={28} className="animate-spin text-brand-600" />
          <p className="mt-3 text-sm text-soft">Building your {effectiveLevel} test…</p>
        </div>
      )}

      {phase === "quiz" && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl border border-app bg-surface p-4 shadow-card">
              <p className="font-medium text-main">{i + 1}. {q.q}</p>
              <div className="mt-2 grid gap-2">
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                    className={`rounded-lg border px-3 py-2 text-left text-sm ${answers[i] === oi ? "border-brand-300 bg-brand-50 text-brand-700" : "border-app text-soft hover:border-brand-200"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={submit} disabled={!allAnswered}
            className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
            Submit test
          </button>
        </div>
      )}

      {phase === "result" && result && (
        <div className="space-y-4">
          <div className={`rounded-xl border p-6 text-center shadow-card animate-pop ${result.passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-app bg-surface"}`}>
            {result.passed ? <Trophy size={32} className="mx-auto text-emerald-500" /> : <RefreshCw size={32} className="mx-auto text-amber-500" />}
            <p className="mt-3 font-display text-3xl font-extrabold text-main">{result.pct}%</p>
            <p className="text-sm text-soft">{result.correct}/{result.total} correct</p>
            {result.passed
              ? <p className="mt-2 font-semibold text-emerald-600">
                  {isMaxLevel ? "Mastery confirmed! You're at the top level 🏆" : `Level up! You're now ${nextLevel}. Exercises will adapt.`}
                </p>
              : <p className="mt-2 font-semibold text-amber-600">Not quite {PASS_PCT}% yet — keep practicing and try again.</p>}
          </div>

          {/* Review */}
          <div className="space-y-2">
            {questions.map((q, i) => {
              const ok = answers[i] === q.answer;
              return (
                <div key={i} className="rounded-lg border border-app bg-surface p-3 shadow-card">
                  <p className="flex items-start gap-2 text-sm font-medium text-main">
                    {ok ? <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> : <X size={16} className="mt-0.5 shrink-0 text-rose-500" />}
                    {q.q}
                  </p>
                  {!ok && <p className="mt-1 pl-6 text-xs text-soft">Correct: <b className="text-emerald-600">{q.options[q.answer]}</b></p>}
                </div>
              );
            })}
          </div>

          <button onClick={() => setPhase("intro")} className="w-full rounded-lg border border-app bg-surface py-3 text-sm font-semibold text-soft hover:text-main">
            Back
          </button>
        </div>
      )}
    </div>
  );
}
