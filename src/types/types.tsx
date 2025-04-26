export interface Player {
  id: number;
  name: string;
  score: number;
  health: number;
  isYou: boolean;
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

export interface GameData {
  subject: string;
  topic: string;
  bossName: string;
  bossHealth: number;
  questions: Question[];
}
