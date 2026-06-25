import { ExternalLink, Lock, BadgeCheck, Headphones, BookOpen, Layers, Mic, FileCheck, Globe } from "lucide-react";
import { RESOURCES } from "../data/resources";
import { useProgress } from "../context/ProgressContext";
import { LEVEL_ORDER, levelIndex } from "../data/curriculum";

const TAG_ICON = {
  "All skills": Globe, Listening: Headphones, Reading: BookOpen,
  Vocabulary: Layers, Speaking: Mic, TOEFL: FileCheck,
};

export default function Resources() {
  const { effectiveLevel } = useProgress();
  const myIdx = levelIndex(effectiveLevel);

  // Group by the level at which each resource unlocks.
  const byLevel = LEVEL_ORDER.map((lvl) => ({
    lvl,
    items: RESOURCES.filter((r) => r.minLevel === lvl),
  })).filter((g) => g.items.length);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Resources</h1>
        <p className="mt-1 text-soft">
          Hand-picked free material to complement the app. Items unlock as you reach each level —
          you're at <b className="text-brand-600">{effectiveLevel}</b>.
        </p>
      </header>

      <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 text-sm text-brand-700">
        <b>Tip:</b> Use the app daily for practice, and these resources for authentic input.
        The <b>TOEFL official</b> material below has real exam questions — the gold standard before your test.
      </div>

      {byLevel.map(({ lvl, items }) => {
        const unlocked = myIdx >= levelIndex(lvl);
        return (
          <section key={lvl}>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-display text-xs font-extrabold text-white">{lvl}</span>
              <h2 className="font-display text-lg font-bold text-main">Level {lvl}</h2>
              {!unlocked && (
                <span className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-mute">
                  <Lock size={12} /> Unlocks at {lvl}
                </span>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((r) => {
                const Tag = TAG_ICON[r.tag] || Globe;
                return unlocked ? (
                  <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="group flex flex-col rounded-xl border border-app bg-surface p-4 shadow-card hover:border-brand-200">
                    <div className="flex items-start justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600/10 text-brand-600"><Tag size={18} /></span>
                      <div className="flex items-center gap-1.5">
                        {r.official && (
                          <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                            <BadgeCheck size={11} /> OFFICIAL
                          </span>
                        )}
                        <ExternalLink size={15} className="text-mute group-hover:text-brand-600" />
                      </div>
                    </div>
                    <h3 className="mt-2.5 font-display font-bold text-main">{r.title}</h3>
                    <p className="text-sm text-soft">{r.desc}</p>
                    <span className="mt-2 text-xs font-semibold text-mute">{r.tag}</span>
                  </a>
                ) : (
                  <div key={r.title} className="flex flex-col rounded-xl border border-app bg-surface p-4 opacity-55 shadow-card">
                    <div className="flex items-start justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-2 text-mute"><Tag size={18} /></span>
                      <Lock size={15} className="text-mute" />
                    </div>
                    <h3 className="mt-2.5 font-display font-bold text-main">{r.title}</h3>
                    <p className="text-sm text-soft">{r.desc}</p>
                    <span className="mt-2 text-xs font-semibold text-mute">Reach {lvl} to unlock</span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
