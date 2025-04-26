export interface Player {
  id: string;
  name: string;
}

export interface GamePlayer {
  id: string;
  name: string;
  score: number;
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
