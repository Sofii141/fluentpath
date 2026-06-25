/**
 * Vocabulary decks. Each card: term, meaning (ES), example sentence, ipa.
 * Grouped by theme matching the learning path.
 */

export const DECKS = [
  {
    id: "interview",
    title: "Job Interviews",
    desc: "Words you'll need to land the role",
    level: "B2",
    cards: [
      { term: "strength", es: "fortaleza", ex: "My greatest strength is problem-solving." },
      { term: "weakness", es: "debilidad", ex: "I'm working on my weakness of public speaking." },
      { term: "achievement", es: "logro", ex: "My biggest achievement was leading the migration." },
      { term: "background", es: "experiencia/formación", ex: "Tell me about your background in software." },
      { term: "deadline", es: "fecha límite", ex: "We met every deadline last quarter." },
      { term: "teamwork", es: "trabajo en equipo", ex: "This role requires strong teamwork." },
      { term: "challenge", es: "reto", ex: "I see this as an exciting challenge." },
      { term: "responsibility", es: "responsabilidad", ex: "I took responsibility for the outage." },
      { term: "to handle", es: "manejar/gestionar", ex: "How do you handle pressure?" },
      { term: "to improve", es: "mejorar", ex: "I'm always looking to improve my skills." },
    ],
  },
  {
    id: "business",
    title: "Business & Meetings",
    desc: "Sound professional at work",
    level: "B2",
    cards: [
      { term: "agenda", es: "orden del día", ex: "Let's stick to the agenda." },
      { term: "stakeholder", es: "parte interesada", ex: "We need stakeholder approval first." },
      { term: "to follow up", es: "dar seguimiento", ex: "I'll follow up with an email." },
      { term: "deliverable", es: "entregable", ex: "The deliverable is due Friday." },
      { term: "to align", es: "alinear/coordinar", ex: "Let's align on the goals." },
      { term: "feedback", es: "retroalimentación", ex: "Thanks for your feedback." },
      { term: "to schedule", es: "agendar", ex: "Can we schedule a call?" },
      { term: "revenue", es: "ingresos", ex: "Revenue grew by 12%." },
      { term: "to outsource", es: "tercerizar", ex: "We outsource our support." },
      { term: "milestone", es: "hito", ex: "We hit a major milestone today." },
    ],
  },
  {
    id: "software",
    title: "Software & Engineering",
    desc: "Your field, in English",
    level: "B1",
    cards: [
      { term: "deployment", es: "despliegue", ex: "The deployment went smoothly." },
      { term: "bug", es: "error/fallo", ex: "I fixed the bug in the login flow." },
      { term: "to debug", es: "depurar", ex: "It took hours to debug the issue." },
      { term: "feature", es: "funcionalidad", ex: "This feature ships next week." },
      { term: "repository", es: "repositorio", ex: "Clone the repository to start." },
      { term: "to merge", es: "fusionar", ex: "I'll merge the pull request now." },
      { term: "framework", es: "marco de trabajo", ex: "React is a popular framework." },
      { term: "scalable", es: "escalable", ex: "The system must be scalable." },
      { term: "query", es: "consulta", ex: "This query is too slow." },
      { term: "backend", es: "parte servidor", ex: "She works on the backend." },
    ],
  },
  {
    id: "toefl",
    title: "TOEFL Academic",
    desc: "High-frequency exam vocabulary",
    level: "C1",
    cards: [
      { term: "hypothesis", es: "hipótesis", ex: "The hypothesis was confirmed." },
      { term: "significant", es: "significativo", ex: "There was a significant increase." },
      { term: "to derive", es: "derivar/obtener", ex: "We derive energy from the sun." },
      { term: "phenomenon", es: "fenómeno", ex: "A rare natural phenomenon." },
      { term: "to demonstrate", es: "demostrar", ex: "The study demonstrates a link." },
      { term: "consequently", es: "en consecuencia", ex: "Consequently, prices rose." },
      { term: "abundant", es: "abundante", ex: "Water is abundant here." },
      { term: "to undergo", es: "someterse a/experimentar", ex: "Cells undergo division." },
      { term: "framework", es: "marco teórico", ex: "A theoretical framework." },
      { term: "to constitute", es: "constituir", ex: "These constitute the core ideas." },
    ],
  },
];

export const DECK_BY_ID = Object.fromEntries(DECKS.map((d) => [d.id, d]));
