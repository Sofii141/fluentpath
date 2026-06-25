/**
 * SM-2 spaced-repetition algorithm (the one behind Anki).
 * A card stores: ease (EF), interval (days), reps, and a `due` timestamp.
 * grade: 0=Again, 3=Hard, 4=Good, 5=Easy.
 */

export function freshCard() {
  return { ease: 2.5, interval: 0, reps: 0, due: Date.now(), lapses: 0 };
}

export function review(card, grade) {
  let { ease, interval, reps, lapses } = { ...freshCard(), ...card };

  if (grade < 3) {
    // Failed — reset interval, count a lapse.
    reps = 0;
    interval = 0;
    lapses += 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(interval * ease);
    // Adjust ease factor.
    ease = Math.max(1.3, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  }

  const due = Date.now() + interval * 86400000;
  return { ease, interval, reps, lapses, due, mastered: reps >= 3 && interval >= 7 };
}

export const isDue = (card) => !card || (card.due ?? 0) <= Date.now();
