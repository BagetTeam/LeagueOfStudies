import { z } from "zod";

export interface Player {
  playerId: number;
  name: string;
  score: number;
  health: number;
  isHost: boolean;
  state: "playing" | "lobby" | "completed";
}

export interface BossFightData {
  bossName: string;
  bossHealth: number;
  time: number;
}

export interface DeathmatchData {
  time: number;
}

export type GameMode =
  | { type: "deathmatch"; data: DeathmatchData }
  | { type: "bossfight"; data: BossFightData };

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
  subject: string;
  topic: string;
  questions: Question[];
}

export const QuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
});

export type QuestionType = z.infer<typeof QuestionSchema>;

export interface GameState {
  player: Player;
  lobby: Lobby;
}
