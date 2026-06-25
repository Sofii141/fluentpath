/**
 * Listening exercises. Each has a script (spoken via TTS), comprehension
 * questions, and a short dictation line.
 */
export const LISTENING = [
  {
    id: "l-intro",
    title: "Meeting a New Colleague",
    level: "A2",
    script:
      "Hi, I'm Daniel. I just joined the marketing team last week. I usually start work at nine and I love grabbing coffee before meetings. If you need anything, just let me know.",
    questions: [
      { q: "When did Daniel join?", options: ["Last week", "Last month", "Yesterday"], answer: 0 },
      { q: "Which team is he on?", options: ["Sales", "Marketing", "Engineering"], answer: 1 },
      { q: "What does he like before meetings?", options: ["A walk", "Coffee", "Music"], answer: 1 },
    ],
    dictation: "I usually start work at nine.",
  },
  {
    id: "l-podcast",
    title: "A Short Tech Update",
    level: "B1",
    script:
      "Welcome back to the show. Today we're talking about remote work. Studies suggest that flexible hours can boost productivity, but they also require strong communication and clear deadlines to succeed.",
    questions: [
      { q: "What is the topic?", options: ["Remote work", "Travel", "Cooking"], answer: 0 },
      { q: "What can flexible hours boost?", options: ["Costs", "Productivity", "Traffic"], answer: 1 },
      { q: "What do they require?", options: ["More offices", "Clear deadlines", "Less work"], answer: 1 },
    ],
    dictation: "Flexible hours can boost productivity.",
  },
  {
    id: "l-lecture",
    title: "Academic Lecture: Ecosystems",
    level: "C1",
    script:
      "In today's lecture, we'll examine how ecosystems maintain balance. When one species declines, others may flourish, demonstrating a delicate interdependence. Consequently, removing a single predator can transform an entire habitat.",
    questions: [
      { q: "What maintains balance?", options: ["Ecosystems", "Governments", "Machines"], answer: 0 },
      { q: "What happens when a species declines?", options: ["Nothing", "Others may flourish", "All die"], answer: 1 },
      { q: "Removing a predator can do what?", options: ["Transform a habitat", "Lower prices", "Stop rain"], answer: 0 },
    ],
    dictation: "Removing a single predator can transform an entire habitat.",
  },
];
