/**
 * Curated, free, reputable external resources to complement the app.
 * `minLevel` gates each one so it appears as "available" once the learner
 * reaches that level (and shows as locked before then). `tag` groups by skill.
 * Links point to stable main pages to avoid dead deep-links.
 */
export const RESOURCES = [
  // ---- Foundations (A1–A2) ----
  {
    title: "BBC Learning English",
    desc: "Free lessons, videos and grammar for every level. A great daily companion.",
    url: "https://www.bbc.co.uk/learningenglish",
    tag: "All skills", minLevel: "A1",
  },
  {
    title: "VOA Learning English",
    desc: "News read slowly and clearly — perfect to start training your ear.",
    url: "https://learningenglish.voanews.com",
    tag: "Listening", minLevel: "A1",
  },
  {
    title: "Anki (flashcards app)",
    desc: "The spaced-repetition app many learners use to memorize vocabulary.",
    url: "https://apps.ankiweb.net",
    tag: "Vocabulary", minLevel: "A1",
  },
  {
    title: "News in Levels",
    desc: "The same news story written at 3 difficulty levels. Pick yours.",
    url: "https://www.newsinlevels.com",
    tag: "Reading", minLevel: "A2",
  },
  {
    title: "British Council — LearnEnglish",
    desc: "Structured lessons, grammar, and listening by level from the British Council.",
    url: "https://learnenglish.britishcouncil.org",
    tag: "All skills", minLevel: "A2",
  },

  // ---- Intermediate (B1) ----
  {
    title: "6 Minute English (podcast)",
    desc: "Short, fun episodes on real topics with vocabulary. Ideal for listening.",
    url: "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english",
    tag: "Listening", minLevel: "B1",
  },
  {
    title: "Randall's ESL Listening Lab",
    desc: "Hundreds of listening exercises with quizzes, sorted by difficulty.",
    url: "https://www.esl-lab.com",
    tag: "Listening", minLevel: "B1",
  },
  {
    title: "ELLLO — English Listening Online",
    desc: "Real conversations with accents from around the world, with transcripts.",
    url: "https://www.elllo.org",
    tag: "Listening", minLevel: "B1",
  },

  // ---- Advanced (B2) ----
  {
    title: "TED Talks",
    desc: "Authentic talks with subtitles — train advanced listening on real ideas.",
    url: "https://www.ted.com/talks",
    tag: "Listening", minLevel: "B2",
  },
  {
    title: "TED-Ed",
    desc: "Short animated lessons with built-in questions. Great for academic English.",
    url: "https://ed.ted.com",
    tag: "Listening", minLevel: "B2",
  },

  // ---- TOEFL Official (unlocks at B2) ----
  {
    title: "ETS — Official TOEFL iBT Prep",
    desc: "The official TOEFL site. Find the FREE Practice Test and official prep here. Real exam questions.",
    url: "https://www.ets.org/toefl",
    tag: "TOEFL", minLevel: "B2", official: true,
  },
  {
    title: "TOEFL Go! (official app)",
    desc: "ETS's free official app with practice questions. Search 'TOEFL Go' in your app store.",
    url: "https://www.ets.org/toefl/test-takers/ibt/prepare.html",
    tag: "TOEFL", minLevel: "B2", official: true,
  },
  {
    title: "TED Talks + shadowing",
    desc: "At C1, shadow native speakers from TED to polish pronunciation and fluency.",
    url: "https://www.ted.com/talks",
    tag: "Speaking", minLevel: "C1",
  },
];

export const RESOURCE_TAGS = ["All skills", "Listening", "Reading", "Vocabulary", "Speaking", "TOEFL"];
