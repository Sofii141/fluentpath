import { useState, useMemo } from "react";
import { Volume2, RotateCcw, Check, ArrowLeft, Layers } from "lucide-react";
import { DECKS } from "../data/vocab";
import { freshCard, review, isDue } from "../lib/srs";
import { speak } from "../lib/speech";
import { useLocalStorage } from "../lib/useLocalStorage";
import { useProgress } from "../context/ProgressContext";
import GenerateBar from "../components/GenerateBar";
import { genVocab } from "../lib/generator";

export default function Vocabulary() {
  const [activeDeck, setActiveDeck] = useState(null);
  if (activeDeck) return <StudySession deck={activeDeck} onExit={() => setActiveDeck(null)} />;
  return <DeckPicker onPick={setActiveDeck} />;
}

function DeckPicker({ onPick }) {
  const [srs] = useLocalStorage("englishup.vocab", {});

  const generate = async (level, topic) => {
    const cards = await genVocab(level, topic, 8);
    if (!cards.length) throw new Error("No cards generated, try again.");
    onPick({ id: `gen-${level}-${Date.now()}`, title: `${topic} (${level})`, desc: "AI-generated deck", level, cards });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-main md:text-[28px]">Vocabulary</h1>
        <p className="mt-1 text-soft">Flashcards with spaced repetition — review right before you forget.</p>
      </header>

      <GenerateBar withTopic defaultLevel="B2" label="Generate deck" onGenerate={generate} />
      <div className="grid gap-3 sm:grid-cols-2">
        {DECKS.map((deck) => {
          const states = deck.cards.map((c) => srs[`${deck.id}:${c.term}`]);
          const mastered = states.filter((s) => s?.mastered).length;
          const due = deck.cards.filter((c) => isDue(srs[`${deck.id}:${c.term}`])).length;
          return (
            <button key={deck.id} onClick={() => onPick(deck)}
              className="group flex flex-col rounded-xl border border-app bg-surface p-5 text-left shadow-card hover:border-brand-200">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Layers size={20} />
                </span>
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-soft">{deck.level}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-extrabold text-main">{deck.title}</h3>
              <p className="text-sm text-soft">{deck.desc}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-mute">
                <span>{deck.cards.length} cards</span>
                <span className="font-semibold text-emerald-500">{mastered} mastered</span>
                {due > 0 && <span className="font-semibold text-brand-600">{due} due</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const GRADES = [
  { g: 0, label: "Again", tone: "text-rose-500 border-rose-500/30 hover:bg-rose-500/10" },
  { g: 3, label: "Hard", tone: "text-amber-500 border-amber-500/30 hover:bg-amber-500/10" },
  { g: 4, label: "Good", tone: "text-sky-500 border-sky-500/30 hover:bg-sky-500/10" },
  { g: 5, label: "Easy", tone: "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" },
];

function StudySession({ deck, onExit }) {
  const [srs, setSrs] = useLocalStorage("englishup.vocab", {});
  const { addXp, practiceSkill } = useProgress();

  // Build the queue: due cards first, then the rest.
  const queue = useMemo(() => {
    const due = deck.cards.filter((c) => isDue(srs[`${deck.id}:${c.term}`]));
    return (due.length ? due : deck.cards).slice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck]);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  if (idx >= queue.length) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center animate-pop">
        <div>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Check size={32} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-extrabold text-main">Session complete</h2>
          <p className="mt-1 text-soft">You reviewed {done} card{done !== 1 && "s"}. Nice work.</p>
          <button onClick={onExit} className="mt-5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Back to decks
          </button>
        </div>
      </div>
    );
  }

  const card = queue[idx];
  const key = `${deck.id}:${card.term}`;

  const grade = (g) => {
    const next = review(srs[key] || freshCard(), g);
    setSrs((s) => ({ ...s, [key]: next }));
    addXp(g >= 3 ? 5 : 2);
    setDone((d) => d + 1);
    setFlipped(false);
    if (idx + 1 >= queue.length) practiceSkill("vocab"); // session finished → advance path
    setIdx((i) => i + 1);
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1.5 text-sm font-medium text-soft hover:text-main">
          <ArrowLeft size={16} /> Decks
        </button>
        <span className="text-sm text-mute">{idx + 1} / {queue.length}</span>
      </div>

      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(idx / queue.length) * 100}%` }} />
      </div>

      {/* Card */}
      <button onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[18rem] w-full flex-col items-center justify-center rounded-2xl border border-app bg-surface p-8 text-center shadow-card">
        {!flipped ? (
          <>
            <span className="text-xs font-semibold uppercase tracking-wider text-mute">English</span>
            <h2 className="mt-2 font-display text-4xl font-extrabold text-main">{card.term}</h2>
            <span onClick={(e) => { e.stopPropagation(); speak(card.term); }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-app px-3 py-1.5 text-sm font-medium text-soft hover:text-brand-600">
              <Volume2 size={15} /> Listen
            </span>
            <p className="mt-6 flex items-center gap-1.5 text-xs text-mute"><RotateCcw size={12} /> Tap to flip</p>
          </>
        ) : (
          <>
            <span className="text-xs font-semibold uppercase tracking-wider text-mute">Meaning</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-600">{card.es}</h2>
            <p className="mt-4 max-w-sm text-soft">"{card.ex}"</p>
            <span onClick={(e) => { e.stopPropagation(); speak(card.ex); }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-app px-3 py-1.5 text-sm font-medium text-soft hover:text-brand-600">
              <Volume2 size={15} /> Example
            </span>
          </>
        )}
      </button>

      {/* Grades */}
      {flipped ? (
        <div className="mt-5 grid grid-cols-4 gap-2">
          {GRADES.map(({ g, label, tone }) => (
            <button key={g} onClick={() => grade(g)}
              className={`rounded-lg border bg-surface py-3 text-sm font-semibold ${tone}`}>
              {label}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={() => setFlipped(true)}
          className="mt-5 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700">
          Show answer
        </button>
      )}
    </div>
  );
}
