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

export interface GameData {
  subject: string;
  topic: string;
  bossName: string;
  bossHealth: number;
  questions: Question[];
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export interface Database {
  public: {
    Tables: {
      // movies: {
      //   Row: {
      //     // the data expected from .select()
      //     id: number;
      //     name: string;
      //     data: Json | null;
      //   };
      //   Insert: {
      //     // the data to be passed to .insert()
      //     id?: never; // generated columns must not be supplied
      //     name: string; // `not null` columns with no default must be supplied
      //     data?: Json | null; // nullable columns can be omitted
      //   };
      //   Update: {
      //     // the data to be passed to .update()
      //     id?: never;
      //     name?: string; // `not null` columns are optional on .update()
      //     data?: Json | null;
      //   };
      // };
    };
  };
}
