/**
 * Reading passages with tap-to-translate glossary and comprehension quiz.
 * `glossary` maps lowercase words in the text to a short Spanish meaning.
 */
export const READINGS = [
  {
    id: "r-remote",
    title: "The Rise of Remote Work",
    level: "B1",
    text: `Over the past few years, remote work has transformed how companies operate. Many employees now enjoy flexible schedules and skip the daily commute. However, working from home also brings challenges. Without clear communication, teams can feel disconnected. Successful companies invest in tools and routines that keep everyone aligned and productive.`,
    glossary: {
      remote: "remoto", transformed: "transformó", flexible: "flexible",
      commute: "viaje al trabajo", challenges: "retos", disconnected: "desconectado",
      aligned: "alineado", productive: "productivo", schedules: "horarios",
    },
    questions: [
      { q: "What do many employees now enjoy?", options: ["Flexible schedules", "Longer commutes", "More meetings"], answer: 0 },
      { q: "What can teams feel without clear communication?", options: ["Aligned", "Disconnected", "Productive"], answer: 1 },
    ],
  },
  {
    id: "r-ai",
    title: "How Machines Learn",
    level: "B2",
    text: `Machine learning allows computers to improve from experience instead of following fixed rules. By analyzing large amounts of data, algorithms detect patterns and make predictions. The more relevant data a model receives, the more accurate it becomes. Yet, biased data can lead to flawed results, so quality matters as much as quantity.`,
    glossary: {
      algorithms: "algoritmos", patterns: "patrones", predictions: "predicciones",
      accurate: "preciso", biased: "sesgado", flawed: "defectuoso",
      quantity: "cantidad", experience: "experiencia", data: "datos",
    },
    questions: [
      { q: "How do algorithms improve?", options: ["From fixed rules", "From experience and data", "From luck"], answer: 1 },
      { q: "What can biased data cause?", options: ["Flawed results", "Faster training", "Lower cost"], answer: 0 },
    ],
  },
];
