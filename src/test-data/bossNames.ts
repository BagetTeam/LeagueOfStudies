export const BOSS_NAMES = [
  "Teacher Bob",
  "Professor Chaos",
  "The Quiz Dragon",
  "Captain Calculus",
  "Dr. Deadline",
  "The Grammar Golem",
  "Sir Syntax",
  "Madame Multiple Choice",
  "The Essay Eater",
  "Lord of the Lost Points",
  "The Pop Quiz Phantom",
  "Baron von Brainteaser",
  "The Final Exam Fiend",
  "Professor Popcorn",
  "The Homework Hydra",
];

export const BOSS_TITLES = [
  "The History Teacher",
  "Master of Multiple Choice",
  "Guardian of the Gradebook",
  "Keeper of the Curve",
  "The Pop Quiz Phantom",
  "Lord of the Lost Points",
  "Professor of Pain",
  "The Final Exam Fiend",
];

export function getRandomBossName(): string {
  return BOSS_NAMES[Math.floor(Math.random() * BOSS_NAMES.length)];
}

export function getRandomBossTitle(): string {
  return BOSS_TITLES[Math.floor(Math.random() * BOSS_TITLES.length)];
}
