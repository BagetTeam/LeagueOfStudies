import { GameData, Player } from "@/types/types";

export const mockGameData: GameData = {
  subject: "History",
  topic: "World War II",
  bossName: "Professor Chronos",
  bossHealth: 100,
  questions: [
    {
      id: 1,
      question: "In which year did World War II begin?",
      options: ["1937", "1939", "1941", "1945"],
      correctAnswer: 1, // 1939
    },
    {
      id: 2,
      question: "Which country was NOT part of the Allied Powers?",
      options: ["United States", "Soviet Union", "Italy", "United Kingdom"],
      correctAnswer: 2, // Italy
    },
    {
      id: 3,
      question:
        "Who was the Prime Minister of the United Kingdom for most of World War II?",
      options: [
        "Neville Chamberlain",
        "Winston Churchill",
        "Clement Attlee",
        "Stanley Baldwin",
      ],
      correctAnswer: 1, // Winston Churchill
    },
    {
      id: 4,
      question:
        "What was the code name for the Allied invasion of Normandy in 1944?",
      options: [
        "Operation Barbarossa",
        "Operation Market Garden",
        "Operation Overlord",
        "Operation Torch",
      ],
      correctAnswer: 2, // Operation Overlord
    },
    {
      id: 5,
      question:
        "What was the name of the Japanese attack that brought the United States into World War II?",
      options: [
        "Battle of Midway",
        "Attack on Pearl Harbor",
        "Battle of Iwo Jima",
        "Bombing of Hiroshima",
      ],
      correctAnswer: 1, // Pearl Harbor
    },
    {
      id: 6,
      question:
        "Which battle is often considered the turning point of the war in Europe?",
      options: [
        "Battle of Britain",
        "Battle of Stalingrad",
        "Battle of the Bulge",
        "D-Day Landings",
      ],
      correctAnswer: 1, // Stalingrad
    },
  ],
};
