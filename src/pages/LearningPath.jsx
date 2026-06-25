import { Link } from "react-router-dom";
import { Lock, Check, ArrowRight, Trophy, ChevronDown } from "lucide-react";
import { LEVELS, SKILLS, COLOR_VAR, SKILL_LINK } from "../data/curriculum";
import { Icon } from "../lib/icons";
import { useProgress } from "../context/ProgressContext";

export default function LearningPath() {
  const { isStationDone, isStationUnlocked, data } = useProgress();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Learning Path</h1>
        <p className="mt-1 text-soft">From first words to TOEFL mastery. Complete each step to unlock the next.</p>
      </header>

      {LEVELS.map((level, li) => {
        const stationsDone = level.stations.filter(isStationDone).length;
        const levelPct = Math.round((stationsDone / level.stations.length) * 100);
        return (
          <section key={level.id}>
            {/* Level header */}
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl font-display text-sm font-extrabold text-white"
                style={{ background: COLOR_VAR[level.color] }}>
                {level.id}
              </span>
              <div className="flex-1">
                <h2 className="font-display text-lg font-extrabold text-main">{level.name}</h2>
                <p className="text-sm text-soft">{level.subtitle}</p>
              </div>
              <div className="text-right">
                <div className="font-display text-sm font-bold text-main">{levelPct}%</div>
                <div className="text-xs text-mute">{stationsDone}/{level.stations.length}</div>
              </div>
            </div>

            {/* Stations */}
            <div className="relative ml-[21px] space-y-2.5 border-l-2 border-app pl-7">
              {level.stations.map((station) => {
                const done = isStationDone(station);
                const unlocked = isStationUnlocked(station.id);
                const progress = data.completed[station.id] || 0;
                const sk = SKILLS[station.skill];
                const skColor = COLOR_VAR[sk.color];

                const card = (
                  <div className={`flex items-center justify-between rounded-xl border p-4 shadow-card ${
                    unlocked ? "border-app bg-surface hover:border-brand-200" : "border-app bg-surface opacity-60"
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg"
                        style={{ background: `color-mix(in srgb, ${skColor} 12%, transparent)`, color: skColor }}>
                        <Icon name={sk.icon} size={19} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: skColor }}>{sk.label}</span>
                          {done && <span className="text-[11px] font-semibold text-emerald-500">Completed</span>}
                        </div>
                        <h3 className="font-display font-bold text-main">{station.title}</h3>
                        <p className="text-xs text-mute">{progress}/{station.lessons} lessons</p>
                      </div>
                    </div>
                    {unlocked && !done && (
                      <span className="flex items-center gap-1 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white">
                        Start <ArrowRight size={14} />
                      </span>
                    )}
                  </div>
                );

                return (
                  <div key={station.id} className="relative">
                    {/* Node marker */}
                    <span className="absolute -left-[43px] top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border-[3px] border-app"
                      style={{ background: done ? skColor : "var(--surface)", color: done ? "#fff" : "var(--text-mute)" }}>
                      {done ? <Check size={15} strokeWidth={3} /> : !unlocked ? <Lock size={13} /> : <Icon name={sk.icon} size={14} style={{ color: skColor }} />}
                    </span>
                    {unlocked ? <Link to={SKILL_LINK[station.skill]}>{card}</Link> : card}
                  </div>
                );
              })}
            </div>

            {li < LEVELS.length - 1 && (
              <div className="mt-5 flex justify-center text-mute">
                <ChevronDown size={20} />
              </div>
            )}
          </section>
        );
      })}

      <div className="flex items-center gap-4 rounded-xl border border-app bg-surface p-6 shadow-card">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Trophy size={24} />
        </span>
        <div>
          <h3 className="font-display text-lg font-extrabold text-main">TOEFL Ready</h3>
          <p className="text-sm text-soft">Finish the path to be exam-ready and conversation-confident.</p>
        </div>
      </div>
    </div>
  );
}
