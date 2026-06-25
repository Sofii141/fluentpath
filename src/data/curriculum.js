/**
 * The learning journey — a path the user follows from beginner to advanced.
 * Organized by CEFR levels (A1 → C1). Each "station" is a themed unit that
 * unlocks when the previous one is completed. Skills are interleaved on purpose.
 *
 * `icon` values are lucide-react component names, resolved in lib/icons.js.
 */

export const SKILLS = {
  vocab:    { label: "Vocabulary", icon: "Layers",      color: "brand" },
  listening:{ label: "Listening",  icon: "Headphones",  color: "sky" },
  speaking: { label: "Speaking",   icon: "Mic",         color: "rose" },
  reading:  { label: "Reading",    icon: "BookOpen",    color: "amber" },
  writing:  { label: "Writing",    icon: "PenLine",     color: "emerald" },
  roleplay: { label: "Roleplay",   icon: "MessagesSquare", color: "violet" },
};

export const LEVELS = [
  {
    id: "A1",
    name: "Foundations",
    subtitle: "First words & survival English",
    color: "emerald",
    stations: [
      { id: "a1-greetings", title: "Greetings & Introductions", skill: "vocab", lessons: 4 },
      { id: "a1-numbers",   title: "Numbers & Time",     skill: "vocab", lessons: 3 },
      { id: "a1-listen-1",  title: "Slow Conversations",  skill: "listening", lessons: 3 },
      { id: "a1-say-hi",    title: "Speaking Warm-up",    skill: "speaking", lessons: 3 },
      { id: "a1-cafe",      title: "Roleplay: At a Café", skill: "roleplay", lessons: 2 },
    ],
  },
  {
    id: "A2",
    name: "Everyday Life",
    subtitle: "Talk about your routine & world",
    color: "sky",
    stations: [
      { id: "a2-routine",  title: "Daily Routine",        skill: "vocab", lessons: 4 },
      { id: "a2-read-1",   title: "Short Stories",        skill: "reading", lessons: 3 },
      { id: "a2-listen-2", title: "Catch the Details",    skill: "listening", lessons: 3 },
      { id: "a2-airport",  title: "Roleplay: At the Airport", skill: "roleplay", lessons: 2 },
      { id: "a2-write-1",  title: "Write a Postcard",     skill: "writing", lessons: 2 },
    ],
  },
  {
    id: "B1",
    name: "Confident Speaker",
    subtitle: "Hold real conversations",
    color: "amber",
    stations: [
      { id: "b1-opinions", title: "Giving Opinions",      skill: "speaking", lessons: 4 },
      { id: "b1-vocab",    title: "Phrasal Verbs",        skill: "vocab", lessons: 4 },
      { id: "b1-podcast",  title: "Understanding Podcasts", skill: "listening", lessons: 3 },
      { id: "b1-meeting",  title: "Roleplay: Team Meeting", skill: "roleplay", lessons: 3 },
      { id: "b1-essay",    title: "Opinion Paragraph",    skill: "writing", lessons: 3 },
    ],
  },
  {
    id: "B2",
    name: "Professional English",
    subtitle: "Business & job interviews",
    color: "violet",
    stations: [
      { id: "b2-business", title: "Business Vocabulary",  skill: "vocab", lessons: 5 },
      { id: "b2-interview",title: "Roleplay: Job Interview", skill: "roleplay", lessons: 4 },
      { id: "b2-lectures", title: "Academic Lectures",    skill: "listening", lessons: 4 },
      { id: "b2-present",  title: "Giving a Presentation", skill: "speaking", lessons: 4 },
      { id: "b2-email",    title: "Professional Emails",  skill: "writing", lessons: 3 },
    ],
  },
  {
    id: "C1",
    name: "TOEFL Mastery",
    subtitle: "Exam-ready & fluent",
    color: "brand",
    stations: [
      { id: "c1-toefl-read",  title: "TOEFL Reading",     skill: "reading", lessons: 4 },
      { id: "c1-toefl-listen",title: "TOEFL Listening",   skill: "listening", lessons: 4 },
      { id: "c1-toefl-speak", title: "TOEFL Speaking",    skill: "speaking", lessons: 4 },
      { id: "c1-toefl-write", title: "TOEFL Writing",     skill: "writing", lessons: 4 },
      { id: "c1-mock",        title: "Full Mock Exam",    skill: "reading", lessons: 1 },
    ],
  },
];

/** Flat list of every station in path order — handy for unlock logic. */
export const ALL_STATIONS = LEVELS.flatMap((lvl) =>
  lvl.stations.map((s) => ({ ...s, level: lvl.id, levelColor: lvl.color }))
);

/** CEFR levels in order, for comparisons and "next level" logic. */
export const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"];
export const levelIndex = (id) => LEVEL_ORDER.indexOf(id);

/** Maps a color token to its CSS variable. */
export const COLOR_VAR = {
  brand: "var(--color-brand-600)",
  sky: "var(--color-sky-500)",
  emerald: "var(--color-emerald-500)",
  amber: "var(--color-amber-500)",
  rose: "var(--color-rose-500)",
  violet: "var(--color-violet-500)",
};

export const SKILL_LINK = {
  vocab: "/vocab", listening: "/listening", speaking: "/speaking",
  reading: "/reading", writing: "/writing", roleplay: "/roleplay",
};
