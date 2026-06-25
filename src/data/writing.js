/**
 * Writing practice organized by MODE, so the learner can choose *how* they
 * want to practice (a story, an opinion essay, an email, etc.). Every mode
 * follows good writing-practice principles: a clear prompt, a structure
 * template, and a self-check list. AI feedback explains the "why" of each fix.
 */

export const WRITING_MODES = [
  {
    id: "story",
    title: "Creative Story",
    icon: "BookOpen",
    color: "violet",
    desc: "Write a short story from a fun prompt. Great for vocabulary & flow.",
    prompts: [
      {
        id: "story-1", level: "B1", minWords: 80, minutes: 12,
        prompt: "Write a short story that begins with this line: \"The lights went out, and then I heard a knock at the door...\"",
        template: ["Set the scene (where, when, who)", "Build up what happens", "Add a surprise or twist", "End with how it resolves"],
        checklist: ["My story has a beginning, middle, and end", "I used past tenses correctly", "I used some descriptive adjectives", "I used linking words (then, suddenly, after that)"],
      },
      {
        id: "story-2", level: "B2", minWords: 100, minutes: 12,
        prompt: "Tell a story about a time a small decision changed everything. It can be real or imagined.",
        template: ["Introduce the situation", "Describe the small decision", "Show the consequences", "Reflect on the lesson"],
        checklist: ["Clear sequence of events", "Variety of sentence lengths", "Showed feelings, not just facts", "Checked spelling & grammar"],
      },
    ],
  },
  {
    id: "opinion",
    title: "Opinion Essay (TOEFL)",
    icon: "PenLine",
    color: "brand",
    desc: "Argue a position with reasons and examples — exam style.",
    prompts: [
      {
        id: "op-1", level: "C1", minWords: 100, minutes: 10,
        prompt: "Some people prefer to work in a team, while others prefer to work alone. Which do you prefer and why? Use specific reasons and examples.",
        template: ["State your opinion in one clear sentence", "Reason 1 + example", "Reason 2 + example", "Restate your opinion to conclude"],
        checklist: ["Clear thesis statement", "At least two reasons", "Specific examples", "Linking words (first, however, therefore)", "Checked grammar"],
      },
      {
        id: "op-2", level: "C1", minWords: 100, minutes: 10,
        prompt: "Do you agree or disagree: technology has made people less social. Support your opinion with reasons and examples.",
        template: ["State agree/disagree clearly", "First supporting reason + example", "Second reason or counter-argument", "Conclusion"],
        checklist: ["Clear position", "Logical paragraphs", "Examples support the claim", "Formal academic tone"],
      },
    ],
  },
  {
    id: "email",
    title: "Professional Email",
    icon: "Mail",
    color: "sky",
    desc: "Practice work emails — requests, follow-ups, applications.",
    prompts: [
      {
        id: "em-1", level: "B2", minWords: 60, minutes: 8,
        prompt: "Write an email to your manager requesting two days off next week. Be polite, give a brief reason, and propose how your tasks will be covered.",
        template: ["Greeting (Dear ...,)", "Reason for writing", "Your request + brief justification", "How you'll cover your work", "Polite closing"],
        checklist: ["Polite greeting and closing", "Clear request", "Brief reason", "Professional tone"],
      },
      {
        id: "em-2", level: "B2", minWords: 70, minutes: 8,
        prompt: "Write an email applying for a summer internship. Introduce yourself, say why you're interested, and highlight one relevant skill.",
        template: ["Greeting", "Who you are + the role", "Why you're interested", "One relevant skill/experience", "Closing + thanks"],
        checklist: ["Strong opening line", "Clear motivation", "Highlighted a skill", "No spelling mistakes"],
      },
    ],
  },
  {
    id: "picture",
    title: "Describe a Picture",
    icon: "Image",
    color: "amber",
    desc: "Describe a scene in detail — builds vocabulary & precision.",
    prompts: [
      {
        id: "pic-1", level: "A2", minWords: 50, minutes: 8,
        prompt: "Imagine a busy coffee shop on a rainy morning. Describe what you see, hear, and smell. Who is there and what are they doing?",
        template: ["Describe the place", "Describe the people", "Describe sounds/smells", "How does it feel to be there?"],
        checklist: ["Used there is / there are", "Present continuous (is doing)", "Several descriptive adjectives", "Prepositions of place (next to, behind)"],
      },
    ],
  },
  {
    id: "journal",
    title: "Daily Journal",
    icon: "NotebookPen",
    color: "emerald",
    desc: "Free writing about your day. Low pressure, builds the habit.",
    prompts: [
      {
        id: "jr-1", level: "A2", minWords: 40, minutes: 6,
        prompt: "Write about your day so far. What did you do? How do you feel? What are your plans for later?",
        template: ["What you did (past)", "How you feel (present)", "Plans (future: going to / will)"],
        checklist: ["Used past tense for events", "Used present for feelings", "Used a future form for plans"],
      },
    ],
  },
];

export const MODE_BY_ID = Object.fromEntries(WRITING_MODES.map((m) => [m.id, m]));
