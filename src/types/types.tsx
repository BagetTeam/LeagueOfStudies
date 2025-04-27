import { z } from "zod";

export interface Player {
  id: number;
  name: string;
  score: number;
  health: number;
  isHost: boolean;
}

export interface GamePlayer {
  id: string;
  name: string;
  score: number;
  health: number;
}

export interface GameMode {
  type: string;
  time: number;
}

export interface PublicLobby {
  id: string;
  hostName: string;
  numPlayers: number;
  gameMode: GameMode;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
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
