/**
 * Built-in fallback level-check questions, used when the AI generator isn't
 * available. Each question: { q, options[], answer (index) }.
 * These are original items written to match each CEFR level's difficulty.
 */
export const LEVEL_TESTS = {
  A1: [
    { q: "Choose: \"She ___ a teacher.\"", options: ["is", "are", "am", "be"], answer: 0 },
    { q: "What's the opposite of \"big\"?", options: ["tall", "small", "long", "old"], answer: 1 },
    { q: "\"___ are you from?\"", options: ["What", "Where", "When", "Who"], answer: 1 },
    { q: "Choose: \"They ___ happy.\"", options: ["is", "am", "are", "be"], answer: 2 },
    { q: "Pick the correct: \"I have two ___.\"", options: ["dog", "dogs", "doged", "doges"], answer: 1 },
  ],
  A2: [
    { q: "\"Yesterday I ___ to the cinema.\"", options: ["go", "went", "gone", "going"], answer: 1 },
    { q: "Choose: \"She is ___ than me.\"", options: ["tall", "taller", "tallest", "more tall"], answer: 1 },
    { q: "\"There ___ any milk in the fridge.\"", options: ["isn't", "aren't", "don't", "wasn't"], answer: 0 },
    { q: "Pick: \"I'm going to visit my grandma ___ Sunday.\"", options: ["in", "at", "on", "by"], answer: 2 },
    { q: "\"He can't come ___ he is sick.\"", options: ["so", "because", "but", "or"], answer: 1 },
  ],
  B1: [
    { q: "\"If it rains, we ___ stay home.\"", options: ["will", "would", "are", "have"], answer: 0 },
    { q: "Choose the best word: \"I'm really looking ___ to the trip.\"", options: ["forward", "front", "ahead", "after"], answer: 0 },
    { q: "\"She has lived here ___ 2019.\"", options: ["for", "since", "from", "during"], answer: 1 },
    { q: "Pick the synonym of \"to improve\":", options: ["to reduce", "to enhance", "to delay", "to avoid"], answer: 1 },
    { q: "\"I wish I ___ more time.\"", options: ["have", "had", "has", "having"], answer: 1 },
  ],
  B2: [
    { q: "\"By the time we arrived, the show ___.\"", options: ["already started", "had already started", "has already started", "starts"], answer: 1 },
    { q: "Choose the best: \"The proposal was turned ___ by the board.\"", options: ["down", "off", "up", "in"], answer: 0 },
    { q: "Synonym of \"significant\":", options: ["minor", "considerable", "unclear", "temporary"], answer: 1 },
    { q: "\"She's used to ___ in public.\"", options: ["speak", "speaking", "spoke", "spoken"], answer: 1 },
    { q: "\"___ his efforts, he didn't pass.\"", options: ["Despite", "Although", "However", "Because"], answer: 0 },
  ],
  C1: [
    { q: "\"Had I known, I ___ differently.\"", options: ["will act", "would have acted", "had acted", "act"], answer: 1 },
    { q: "Choose the most precise: \"The findings ___ the hypothesis.\"", options: ["corroborate", "complicate", "contradictory", "consist"], answer: 0 },
    { q: "\"Not only ___ late, but he also forgot the files.\"", options: ["he was", "was he", "he is", "is he"], answer: 1 },
    { q: "Best meaning of \"ubiquitous\":", options: ["rare", "everywhere", "ancient", "fragile"], answer: 1 },
    { q: "\"The committee will ___ the matter at length.\"", options: ["deliberate on", "deliberate of", "deliberate at", "deliberate to"], answer: 0 },
  ],
};
