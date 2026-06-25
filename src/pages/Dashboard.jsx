import { Link } from "react-router-dom";
import { Flame, Star, CheckCircle2, TrendingUp, ArrowRight, Check, CalendarDays, ClipboardCheck } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { ALL_STATIONS, SKILLS, COLOR_VAR, SKILL_LINK } from "../data/curriculum";
import { Icon } from "../lib/icons";
import ProgressRing from "../components/ProgressRing";

export default function Dashboard() {
  const {
    data, overallPct, doneLessons, totalLessons,
    isStationDone, isStationUnlocked, skillsThisWeek, doneToday,
    effectiveLevel, nextStation, nextLevel, isMaxLevel,
  } = useProgress();

  const plan = buildDailyPlan(isStationDone, isStationUnlocked);
  const planDoneCount = plan.filter((p) => doneToday[p.skill]).length;

  const goalPct = Math.min(100, Math.round((data.xpToday / data.dailyGoal) * 100));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 19 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-7">
      <section>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">
            {greeting}{data.name ? `, ${data.name}` : ""}
          </h1>
          <span className="rounded-md bg-brand-600/10 px-2.5 py-1 text-xs font-bold text-brand-700">Level {effectiveLevel}</span>
        </div>
        <p className="mt-1 text-soft">Do today's plan to keep leveling up toward your TOEFL goal. Everything adapts to your level.</p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard Icon={Flame} label="Day streak" value={data.streak} tone="amber" />
        <StatCard Icon={Star} label="Total XP" value={data.xp} tone="brand" />
        <StatCard Icon={CheckCircle2} label="Lessons completed" value={`${doneLessons}/${totalLessons}`} tone="emerald" />
        <StatCard Icon={TrendingUp} label="Course progress" value={`${overallPct}%`} tone="sky" />
      </section>

      {/* Daily plan + goal */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Daily plan */}
        <div className="rounded-xl border border-app bg-surface p-5 shadow-card lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-brand-600" />
              <h2 className="font-display text-lg font-bold text-main">Today's plan</h2>
            </div>
            <span className="text-sm font-semibold text-soft">{planDoneCount}/{plan.length} done</span>
          </div>
          <p className="mb-3 text-xs text-mute">A mix of skills each day. Finish an activity and it checks off — and your path advances.</p>
          <div className="space-y-2">
            {plan.map((p) => {
              const sk = SKILLS[p.skill];
              const done = !!doneToday[p.skill];
              return (
                <Link key={p.skill} to={SKILL_LINK[p.skill]}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${done ? "border-emerald-500/30 bg-emerald-500/5" : "border-app hover:border-brand-200"}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{ background: `color-mix(in srgb, ${COLOR_VAR[sk.color]} 12%, transparent)`, color: COLOR_VAR[sk.color] }}>
                    <Icon name={sk.icon} size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-main">{sk.label}</p>
                    <p className="truncate text-xs text-soft">{p.title}</p>
                  </div>
                  {done
                    ? <Check size={18} className="text-emerald-500" />
                    : <ArrowRight size={16} className="text-mute" />}
                </Link>
              );
            })}
          </div>
          {planDoneCount === plan.length && (
            <p className="mt-3 rounded-lg bg-emerald-500/10 p-2.5 text-center text-sm font-semibold text-emerald-600">
              Daily plan complete — amazing work! See you tomorrow.
            </p>
          )}
        </div>

        {/* Goal ring */}
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-app bg-surface p-5 shadow-card">
          <ProgressRing pct={goalPct} size={108} stroke={10} color={COLOR_VAR.emerald}>
            <div className="text-center">
              <div className="font-display text-2xl font-extrabold text-main">{goalPct}%</div>
              <div className="text-[11px] text-mute">daily goal</div>
            </div>
          </ProgressRing>
          <p className="text-sm text-soft">{data.xpToday} / {data.dailyGoal} XP today</p>
        </div>
      </section>

      {/* Up next on the path */}
      <section className="overflow-hidden rounded-xl border border-app bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-mute">Continue your path · Level {nextStation.level}</p>
          <Link to="/path" className="text-xs font-semibold text-brand-600 hover:underline">View full path →</Link>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg"
              style={{ background: `color-mix(in srgb, ${COLOR_VAR[SKILLS[nextStation.skill].color]} 12%, transparent)`, color: COLOR_VAR[SKILLS[nextStation.skill].color] }}>
              <Icon name={SKILLS[nextStation.skill].icon} size={20} />
            </span>
            <div>
              <h3 className="font-display text-lg font-extrabold text-main">{nextStation.title}</h3>
              <p className="text-sm text-soft">{SKILLS[nextStation.skill].label}</p>
            </div>
          </div>
          <Link to={SKILL_LINK[nextStation.skill]}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Continue <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Level-up nudge */}
      <Link to="/level-test"
        className="flex items-center gap-3 rounded-xl border border-app bg-surface p-4 shadow-card hover:border-brand-200">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-600/10 text-brand-600"><ClipboardCheck size={20} /></span>
        <div className="flex-1">
          <p className="font-display font-bold text-main">Ready to level up?</p>
          <p className="text-sm text-soft">Take the {effectiveLevel} test to advance{!isMaxLevel ? ` to ${nextLevel}` : ""}. Your level sets the difficulty — not your XP.</p>
        </div>
        <ArrowRight size={18} className="text-mute" />
      </Link>

      {/* This week's coverage */}
      <section>
        <h2 className="mb-1 font-display text-lg font-bold text-main">This week</h2>
        <p className="mb-3 text-xs text-mute">Practice every skill across the week for balanced progress.</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Object.entries(SKILLS).map(([key, sk]) => {
            const count = skillsThisWeek[key] || 0;
            const active = count > 0;
            return (
              <Link key={key} to={SKILL_LINK[key]}
                className="flex flex-col items-center gap-2 rounded-xl border border-app bg-surface p-3 shadow-card hover:border-brand-200">
                <span className="relative grid h-11 w-11 place-items-center rounded-lg"
                  style={{ background: active ? COLOR_VAR[sk.color] : "var(--surface-2)", color: active ? "#fff" : "var(--text-mute)" }}>
                  <Icon name={sk.icon} size={19} />
                  {active && (
                    <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </span>
                <span className="text-center text-[11px] font-semibold text-main">{sk.label}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ Icon: I, label, value, tone }) {
  const tones = {
    amber: "text-amber-500 bg-amber-500/10",
    brand: "text-brand-600 bg-brand-600/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    sky: "text-sky-500 bg-sky-500/10",
  };
  return (
    <div className="rounded-xl border border-app bg-surface p-4 shadow-card">
      <span className={`inline-grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}><I size={18} /></span>
      <div className="mt-2.5 font-display text-2xl font-extrabold text-main">{value}</div>
      <div className="text-xs text-soft">{label}</div>
    </div>
  );
}

/** Build today's plan: the next unlocked, unfinished station per distinct skill. */
function buildDailyPlan(isStationDone, isStationUnlocked) {
  const picked = [];
  const seen = new Set();
  for (const s of ALL_STATIONS) {
    if (seen.has(s.skill)) continue;
    if (isStationUnlocked(s.id) && !isStationDone(s)) {
      picked.push({ skill: s.skill, title: s.title, level: s.level });
      seen.add(s.skill);
    }
    if (picked.length >= 5) break;
  }
  // If the path is fully done, fall back to a review rotation of all skills.
  if (picked.length === 0) {
    return Object.keys(SKILLS).slice(0, 5).map((skill) => ({ skill, title: "Review & practice", level: "" }));
  }
  return picked;
}
