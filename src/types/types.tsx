import { z } from "zod";

export interface Player {
  playerId: string;
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
  activePlayerIndex: number;
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
  title: string;
  questions: Question[];
  currentQuestionIndex: number;
  playerAnswers: {
    [playerId: string]: {
      isCorrect: boolean;
    };
  };
  turnStartTime: number | null;
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
