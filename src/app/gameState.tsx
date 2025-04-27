import { act } from "react";
import { Player, GameMode, PublicLobby } from "../types/types";
import { tr } from "motion/react-client";

export type GameState = {
  //   currentPlayer: Player;
  //   players: Player[];
  gameId: string;
  currentPlayer: Player;
  players: Player[];
  gameMode: GameMode;
  gameStarted: boolean;
  activePlayerIndex: number; // Index of the player whose turn it is
  currentQuestionIndex: number;
  turnStartTime: number | null; // Timestamp when the current turn started (use null initially)
  isGameOver: boolean;
  winnerId: number | null;
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
      type: "setHealth";
      playerId: number;
      health: number;
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
    }
  | {
      type: "setHost";
      player: Player;
    }
  | {
      type: "setStartGame";
      gameMode: GameMode;
      initialPlayers: Player[];
    }
  | {
      type: "advanceTurn";
      nextPlayerIndex: number;
      nextQuestionIndex: number;
      newTurnStartTime: number;
    }
  | { type: "setGameOver"; winnerId: number | null };

export function gameStatereducer(
  state: GameState,
  action: GameStateActions,
): GameState {
  switch (action.type) {
    case "addPlayer":
      if (state.players.find((p) => p.id === action.player.id)) {
        return state;
      }
      return {
        ...state,
        players: [...state.players, action.player],
      };
    case "setGameMode":
      return state;
    case "createLobby":
      return state;
    case "exitLobby":
      return {
        ...state,
        // gameMode: { type: "time", count: 10 },
        // equations: [],
        players: [],
        gameId: crypto.randomUUID().toString(),
        currentPlayer: {
          ...state.currentPlayer,
          score: 0,
          health: 0,
        },
      };
    case "nameChange":
      return state;
    case "setPlayers":
      return {
        ...state,
        players: action.players,
      };
    case "setCurrentPlayer":
      return {
        ...state,
        currentPlayer: action.player,
      };
    case "setScore":
      return {
        ...state,
        players: state.players.map((player) =>
          player.id === action.playerId
            ? { ...player, score: action.score } // Create a *new* player object
            : player,
        ),
      };
    case "setHealth":
      const newPlayers = state.players.map((player) =>
        player.id === action.playerId
          ? { ...player, health: Math.max(0, action.health) }
          : player,
      );
      // Update currentPlayer's health as well if it's the one being updated
      const newCurrentPlayerHealth =
        state.currentPlayer.id === action.playerId
          ? Math.max(0, action.health)
          : state.currentPlayer.health;

      return {
        ...state,
        players: newPlayers,
        currentPlayer: {
          ...state.currentPlayer,
          health: newCurrentPlayerHealth,
        },
      };
    case "isComplete":
      return state;
    case "setGameId":
      return {
        ...state,
        gameId: action.gameId,
      };
    case "changePublic":
      return state;
    case "setPublicLobbies":
      return state;
    case "setHost":
      return {
        ...state,
        currentPlayer: {
          ...state.currentPlayer,
          isHost: action.player.isHost,
        },
        players: state.players.map((p) =>
          p.id === state.currentPlayer.id
            ? { ...p, isHost: action.player.isHost }
            : p,
        ),
      };
    case "setStartGame":
      // Initialize health for all players when game starts
      const initialPlayersWithHealth = action.initialPlayers.map((p) => ({
        ...p,
        health: 5, // Or get initial health from gameMode/settings
      }));
      return {
        ...state,
        gameMode: action.gameMode,
        players: initialPlayersWithHealth, // Set initial health
        gameStarted: true,
        activePlayerIndex: 0, // Start with the first player
        currentQuestionIndex: 0,
        turnStartTime: Date.now(), // Start the timer immediately
        isGameOver: false,
        winnerId: null,
      };
    case "advanceTurn":
      console.log(
        `Reducer: Advancing turn. Next Player Index: ${action.nextPlayerIndex}, Next Question Index: ${action.nextQuestionIndex}`,
      );
      return {
        ...state,
        activePlayerIndex: action.nextPlayerIndex,
        currentQuestionIndex: action.nextQuestionIndex,
        turnStartTime: action.newTurnStartTime, // Set the start time for the new turn
      };
    case "setGameOver":
      console.log(`Reducer: Setting game over. Winner ID: ${action.winnerId}`);
      return {
        ...state,
        isGameOver: true,
        winnerId: action.winnerId,
        turnStartTime: null, // Stop timer
      };
    default:
      return state;
  }
}
