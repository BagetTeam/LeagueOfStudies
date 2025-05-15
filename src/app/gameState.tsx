import { Player, GameMode, PublicLobby, Question } from "../types/types";

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
  bossHealth?: number; // Optional to allow different game modes
  playerAnswers?: {
    // Tracks answers for the *current* question
    [playerId: number]: {
      answered: boolean;
      isCorrect: boolean | null; // null if not answered/timed out
    };
  };
  isTeamVictory?: boolean | null;
  questions: Question[];
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
      activePlayerIndex: number;
    }
  | {
      type: "advanceTurn";
      nextPlayerIndex: number;
      nextQuestionIndex: number;
      newTurnStartTime: number;
    }
  | { type: "setGameOver"; winnerId: number | null; isGameOver: boolean }
  | { type: "setBossHealth"; newBossHealth: number }
  | {
      type: "recordPlayerAnswer";
      playerId: number;
      questionIndex: number; // Ensure it's for the current question
      isCorrect: boolean | null;
    }
  | { type: "resetPlayerAnswers" } // Reset for new question
  | {
      type: "updateMultiplePlayerHealth";
      healthUpdates: { [playerId: number]: number };
    }
  | { type: "setBossFightGameOver"; isVictory: boolean }
  | {
      type: "setQuestions";
      questions: Question[];
    }
  | {
      type: "restartGame";
    };

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
      const initialBossHealth = 100;
      const initialPlayersWithHealth = action.initialPlayers.map((p) => ({
        ...p,
        health: 5,
      }));
      return {
        ...state,
        currentPlayer: {
          ...state.currentPlayer,
          health: 5,
          score: 0,
        },
        gameMode: action.gameMode,
        players: initialPlayersWithHealth,
        gameStarted: true,
        activePlayerIndex: action.activePlayerIndex,
        currentQuestionIndex: 0,
        turnStartTime: Date.now(), // Start timer for first question
        isGameOver: false,
        winnerId: null,
        // --- Boss Fight Init ---
        bossHealth: initialBossHealth,
        playerAnswers: {}, // Start with empty answers
        isTeamVictory: null,
      };
    case "setBossHealth":
      if (typeof state.bossHealth !== "number") return state; // Only run in boss mode
      return {
        ...state,
        bossHealth: Math.max(0, action.newBossHealth), // Ensure non-negative
      };

    case "recordPlayerAnswer":
      // Only record if the answer is for the current question index state
      if (
        action.questionIndex !== state.currentQuestionIndex ||
        !state.playerAnswers
      ) {
        console.warn(
          `Ignoring stale answer for Q#${action.questionIndex} (current is ${state.currentQuestionIndex})`,
        );
        return state;
      }
      return {
        ...state,
        playerAnswers: {
          ...state.playerAnswers,
          [action.playerId]: {
            answered: true,
            isCorrect: action.isCorrect,
          },
        },
      };

    case "resetPlayerAnswers":
      return {
        ...state,
        playerAnswers: {}, // Clear answers for the new round
      };

    case "updateMultiplePlayerHealth":
      if (!action.healthUpdates) return state;
      const updatedPlayersMulti = state.players.map((player) => {
        if (action.healthUpdates.hasOwnProperty(player.id)) {
          return {
            ...player,
            health: Math.max(0, action.healthUpdates[player.id]),
          };
        }
        return player;
      });
      // Update currentPlayer's health as well if it's in the list
      const updatedCurrentPlayerHealthMulti =
        action.healthUpdates.hasOwnProperty(state.currentPlayer.id)
          ? Math.max(0, action.healthUpdates[state.currentPlayer.id])
          : state.currentPlayer.health;

      return {
        ...state,
        players: updatedPlayersMulti,
        currentPlayer: {
          ...state.currentPlayer,
          health: updatedCurrentPlayerHealthMulti,
        },
      };

    case "setBossFightGameOver":
      return {
        ...state,
        isGameOver: true,
        isTeamVictory: action.isVictory,
        turnStartTime: null, // Stop timer
      };

    // Modify advanceTurn for Boss Fight context (or create a new action like 'advanceBossQuestion')
    case "advanceTurn": // Re-purpose for advancing question
      console.log(
        `Reducer: Advancing question. Next Q Index: ${action.nextQuestionIndex}`,
      );
      return {
        ...state,
        activePlayerIndex: action.nextPlayerIndex,
        currentQuestionIndex: action.nextQuestionIndex,
        turnStartTime: action.newTurnStartTime, // Set start time for the new question
        playerAnswers: {}, // Automatically reset answers for the new question
      };
    case "setGameOver":
      console.log(`Reducer: Setting game over. Winner ID: ${action.winnerId}`);
      return {
        ...state,
        isGameOver: action.isGameOver,
        winnerId: action.winnerId,
        turnStartTime: null, // Stop timer
        questions: [],
      };
    case "setQuestions":
      console.log(
        "SETTINGGG QUESTIONSNSNOINOINSOINSOINSOINSOISNIOSNOISNOISNOISN",
      );
      return {
        ...state,
        questions: action.questions,
      };
    case "restartGame":
      return {
        ...state,
        questions: [],
        currentQuestionIndex: 0,
        gameStarted: false,
      };
  }
}
