/**
 * Tailored interview-prep "cheat sheet" for the GDSD program, built from the
 * learner's real CV. She can read each model answer, hear it (TTS), and
 * shadow it. Goal: walk in prepared and stand out, with strong real examples.
 */

export const PREP_QUESTIONS = [
  {
    q: "Tell me about yourself.",
    tip: "Keep it ~45s: who you are, what you do, one highlight, why this program.",
    answer:
      "I'm Ana Sofia, a Systems Engineering student in my ninth semester with a 4.5 GPA. I'm a full-stack developer focused on AI and multi-agent systems. Recently I led a team to build Vigía Cauca, a security-incident platform for a government office, and I created AIMO, an AI assistant using a multi-agent architecture. I'm excited about this program because I want to grow by building real software with an international team.",
  },
  {
    q: "Why do you want to join this program and work with international teams?",
    tip: "Connect your goals to what the program offers: real product, global teamwork, English.",
    answer:
      "I want to push myself beyond my comfort zone. I already enjoy teamwork and agile development, but doing it 100% in English with people from different cultures would make me a much stronger engineer. I'm also passionate about building real products, so solving a real company's challenge with a distributed team is exactly the experience I'm looking for.",
  },
  {
    q: "Tell me about a time you led or worked in a team.",
    tip: "Use the STAR method: Situation, Task, Action, Result.",
    answer:
      "In the Vigía Cauca project, I led the development team from requirements gathering to final delivery. My task was to keep everyone aligned and deliver on time. I organized the work, built the React and Spring Boot architecture with the team, and kept clear communication. As a result, we delivered a working georeferenced platform that the client accepted formally.",
  },
  {
    q: "Tell me about a project you're proud of.",
    tip: "Pick AIMO or Vigía — explain the problem, your role, the tech, and the impact.",
    answer:
      "I'm really proud of AIMO, an emotional-support assistant for students. I designed a cascade multi-agent system using several large language models, plus an 'LLM-as-a-Judge' to evaluate empathy in real time. I built the Flask backend and the React frontend, and we deployed it to production. It taught me a lot about designing reliable AI systems.",
  },
  {
    q: "How would you handle communication across time zones and cultures?",
    tip: "Show awareness: clear written communication, agile rituals, flexibility, respect.",
    answer:
      "I'd rely on clear, written communication and agile rituals like daily standups and a shared backlog, so everyone stays aligned even in different time zones. I'd be flexible with meeting times, over-communicate to avoid misunderstandings, and stay open and respectful of different working styles.",
  },
  {
    q: "Do you have experience with Agile or Scrum?",
    tip: "Mention sprints, roles, and your DevDynamics project if relevant.",
    answer:
      "Yes. I've worked with agile methodologies in my projects, organizing work into sprints with a backlog and regular reviews. I even built DevDynamics, a simulator that models software-team dynamics like Brooks's Law and technical debt, so I understand team workflows from both a practical and a theoretical side.",
  },
  {
    q: "What is your greatest strength?",
    tip: "Pick one real strength + a quick example.",
    answer:
      "My greatest strength is combining technical depth with attention to detail and product thinking. For example, when building AIMO, I didn't just make it work — I focused on evaluating the quality and empathy of the responses, because the user experience really mattered.",
  },
  {
    q: "How will you manage 20 hours a week with your studies?",
    tip: "Show you're organized and committed.",
    answer:
      "I'm used to balancing demanding projects with my studies while keeping a high GPA, so I manage my time carefully with clear priorities. I'm genuinely committed to this program, so I'll plan my week to give it the dedication it deserves.",
  },
];

/** Phrases that make you sound fluent, confident and professional. */
export const POWER_PHRASES = [
  { en: "That's a great question.", use: "Buys you a second to think." },
  { en: "In my experience…", use: "Introduce a real example." },
  { en: "To give you a concrete example…", use: "Back up a claim." },
  { en: "What I learned from that was…", use: "Show growth/reflection." },
  { en: "From a technical standpoint…", use: "Switch into technical detail." },
  { en: "I'd approach it by…", use: "Answer a hypothetical." },
  { en: "Let me walk you through it.", use: "Start explaining a project." },
  { en: "That's something I'm really passionate about.", use: "Show motivation." },
];
