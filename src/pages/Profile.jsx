import { useState } from "react";
import { User, Target, Trash2, Flame, Star, Award, GraduationCap } from "lucide-react";
import { useProgress } from "../context/ProgressContext";

const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

export default function Profile() {
  const { data, setData, setLevel, effectiveLevel, overallPct, doneLessons, totalLessons } = useProgress();
  const [name, setName] = useState(data.name || "");
  const [goal, setGoal] = useState(data.dailyGoal);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setData((d) => ({ ...d, name: name.trim(), dailyGoal: Number(goal) || 30 }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const reset = () => {
    if (!confirm("Reset all your progress? This cannot be undone.")) return;
    setData((d) => ({ ...d, xp: 0, streak: 0, lastActive: null, xpToday: 0, completed: {} }));
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Profile</h1>
        <p className="mt-1 text-soft">Your account and learning preferences.</p>
      </header>

      <div className="flex items-center gap-4 rounded-xl border border-app bg-surface p-5 shadow-card">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-600 font-display text-2xl font-extrabold text-white">
          {(data.name || "?").charAt(0).toUpperCase()}
        </span>
        <div>
          <h2 className="font-display text-lg font-extrabold text-main">{data.name || "Learner"}</h2>
          <p className="text-sm text-soft">{overallPct}% through the course</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat Icon={Flame} value={data.streak} label="Streak" />
        <Stat Icon={Star} value={data.xp} label="XP" />
        <Stat Icon={Award} value={`${doneLessons}/${totalLessons}`} label="Lessons" />
      </div>

      <div className="rounded-xl border border-app bg-surface p-5 shadow-card space-y-4">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-main"><User size={15} /> Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-main outline-none focus:border-brand-300" placeholder="Your name" />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-main"><GraduationCap size={15} /> Your level</span>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button key={l} type="button" onClick={() => setLevel(l)}
                className={`rounded-lg border px-3.5 py-2 text-sm font-semibold ${data.level === l ? "border-brand-300 bg-brand-50 text-brand-700" : "border-app text-soft hover:border-brand-200"}`}>
                {l}
              </button>
            ))}
          </div>
          <span className="mt-1.5 block text-xs text-mute">Exercises adapt to this. You're at <b>{effectiveLevel}</b> — pass the Level Test to move up.</span>
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-main"><Target size={15} /> Daily goal (XP)</span>
          <input type="number" value={goal} onChange={(e) => setGoal(e.target.value)}
            className="w-full rounded-lg border border-app bg-app px-3 py-2 text-sm text-main outline-none focus:border-brand-300" />
        </label>
        <button onClick={save} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          {saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      <button onClick={reset} className="flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:underline">
        <Trash2 size={15} /> Reset all progress
      </button>
    </div>
  );
}

function Stat({ Icon, value, label }) {
  return (
    <div className="rounded-xl border border-app bg-surface p-4 text-center shadow-card">
      <Icon size={18} className="mx-auto text-brand-600" />
      <div className="mt-1.5 font-display text-xl font-extrabold text-main">{value}</div>
      <div className="text-xs text-soft">{label}</div>
    </div>
  );
}
