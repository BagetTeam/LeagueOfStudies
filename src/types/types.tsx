import { z } from "zod";

export interface Player {
  playerId: number;
  name: string;
  score: number;
  health: number;
  isHost: boolean;
}

export interface GameMode {
  type: string;
  time: number;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Lobby {
  lobbyId: string;
  players: Player[];
  gameMode: GameMode;
  gameSubject: string;
  questions: Question[];
}

export const QuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
});

export type QuestionType = z.infer<typeof QuestionSchema>;

export interface GameData {
  subject: string;
  topic: string;
  bossName: string;
  bossHealth: number;
  questions: Question[];
}
