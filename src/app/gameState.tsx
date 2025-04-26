import { Player, GameMode, PublicLobby } from "./types/types";

export type GameState = {
  //   currentPlayer: Player;
  //   players: Player[];
};

export type GameStateActions =
  | {
      type: "addPlayer";
      player: Player;
    }
  | {
      type: "setGameMode";
      gameMode: GameMode;
    }
  | {
      type: "createLobby";
      host: Player;
    }
  | {
      type: "exitLobby";
    }
  | {
      type: "nameChange";
      name: string;
    }
  | {
      type: "setPlayers";
      players: Player[];
    }
  | {
      type: "setCurrentPlayer";
      player: Player;
    }
  | {
      type: "setScore";
      playerId: number;
      score: number;
    }
  | {
      type: "isComplete";
      playerId: number;
      hasComplete: boolean;
    }
  | {
      type: "setGameId";
      gameId: string;
    }
  | {
      type: "changePublic";
      isPublic: boolean;
    }
  | {
      type: "setPublicLobbies";
      publicLobbies: PublicLobby[];
    };

export function gameStatereducer(
  state: GameState,
  action: GameStateActions
): GameState {
  switch (action.type) {
    case "addPlayer":
      return state;
    case "setGameMode":
      return state;
    case "createLobby":
      return state;
    case "exitLobby":
      return state;
    case "nameChange":
      return state;
    case "setPlayers":
      return state;
    case "setCurrentPlayer":
      return state;
    case "setScore":
      return state;
    case "isComplete":
      return state;
    case "setGameId":
      return state;
    case "changePublic":
      return state;
    case "setPublicLobbies":
      return state;
  }
}
