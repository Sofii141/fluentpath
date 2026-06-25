import { useState } from "react";
import { Sparkles, Loader2, SlidersHorizontal } from "lucide-react";
import { getTutorConfig } from "../lib/ai";
import { useProgress } from "../context/ProgressContext";

const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

/**
 * "Practice at your level" control. By default it generates content at the
 * learner's current level (from progress) — no choosing needed. An optional
 * override lets advanced users pick a different level or add a topic.
 * `onGenerate(level, topic)` returns a promise.
 */
export default function GenerateBar({ withTopic = false, label = "Practice at my level", onGenerate }) {
  const { effectiveLevel } = useProgress();
  const [override, setOverride] = useState(false);
  const [level, setLevel] = useState(effectiveLevel);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const connected = !!getTutorConfig();

  const run = async (lvl) => {
    setError(""); setLoading(true);
    try {
      await onGenerate(lvl, topic.trim() || "general");
    } catch (e) {
      setError(e.message || "Generation failed. Is the AI Tutor connected?");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-brand-700">
          <Sparkles size={16} /> Practice tailored to you
        </div>
        <span className="rounded-md bg-brand-600/10 px-2 py-0.5 text-xs font-bold text-brand-700">Your level: {effectiveLevel}</span>
      </div>
      <p className="mt-0.5 text-xs text-soft">Unlimited fresh exercises at your level — powered by your local model.</p>

      {!connected && (
        <p className="mt-2 text-xs font-medium text-amber-600">Connect your local model in the AI Tutor tab to enable this.</p>
      )}

      {withTopic && (
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (optional, e.g. job interviews)"
          className="mt-3 w-full rounded-lg border border-app bg-surface px-3 py-2 text-sm text-main outline-none focus:border-brand-300" />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => run(effectiveLevel)} disabled={loading || !connected}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <>{label} ({effectiveLevel})</>}
        </button>
        <button onClick={() => setOverride((o) => !o)}
          className="flex items-center gap-1.5 rounded-lg border border-app bg-surface px-3 py-2.5 text-sm font-medium text-soft hover:text-main">
          <SlidersHorizontal size={14} /> Other level
        </button>
      </div>

      {override && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select value={level} onChange={(e) => setLevel(e.target.value)}
            className="rounded-lg border border-app bg-surface px-3 py-2 text-sm font-semibold text-main">
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={() => run(level)} disabled={loading || !connected}
            className="rounded-lg border border-brand-300 bg-surface px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-40">
            Generate at {level}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
