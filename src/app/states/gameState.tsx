import { Player, GameMode, PublicLobby, Question } from "../../types/types";

export type GameState = {
  gameId: string;
  currentPlayer: Player;
  players: Player[];
  gameMode: GameMode;
  gameSubject: string;
  gameStarted: boolean;
  activePlayerIndex: number;
  currentQuestionIndex: number;
  turnStartTime: number | null; // Timestamp when the current turn started (use null initially)
  isGameOver: boolean;
  winnerId: number | null;
  bossHealth?: number;
  playerAnswers?: {
    [playerId: number]: {
      answered: boolean;
      isCorrect: boolean | null;
    };
  };
  isTeamVictory?: boolean | null;
  questions: Question[];
};

export type DeathmatchState = {
  activePlayerIndex: number;
};

export type BossFightState = {
  turnStartTime: number | null;
  bossHealth: number;
  isTeamVictory: boolean | null;
  playerAnswers: {
    [playerId: number]: {
      answered: boolean;
      isCorrect: boolean | null;
    };
  };
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
      type: "setGameSubject";
      subject: string;
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

export type DeathmatchActions = {
  type: "advanceTurn";
  nextPlayerIndex: number;
  nextQuestionIndex: number;
  newTurnStartTime: number;
};

export type BossFightActions =
  | {
      type: "setBossFightGameOver";
      isVictory: boolean;
    }
  | {
      type: "setBossHealth";
      newBossHealth: number;
    }
  | {
      type: "recordPlayerAnswer";
      playerId: number;
      questionIndex: number; // Ensure it's for the current question
      isCorrect: boolean | null;
    };

export function gameStatereducer(
  gameState: GameState,
  action: GameStateActions,
): GameState {
  switch (action.type) {
    case "addPlayer":
      if (gameState.players.find((p) => p.id === action.player.id)) {
        return gameState;
      }
      return {
        ...gameState,
        players: [...gameState.players, action.player],
      };
    case "setGameMode":
      return {
        ...gameState,
        gameMode: action.gameMode,
      };
    case "setGameSubject":
      return {
        ...gameState,
        gameSubject: action.subject,
      };
    case "createLobby":
      return gameState;
    case "exitLobby":
      return {
        ...gameState,
        // gameMode: { type: "time", count: 10 },
        // equations: [],
        players: [],
        gameId: crypto.randomUUID().toString(),
        currentPlayer: {
          ...gameState.currentPlayer,
          score: 0,
          health: 0,
        },
      };
    case "nameChange":
      return gameState;
    case "setPlayers":
      return {
        ...gameState,
        players: action.players,
      };
    case "setCurrentPlayer":
      return {
        ...gameState,
        currentPlayer: action.player,
      };
    case "setScore":
      return {
        ...gameState,
        players: gameState.players.map((player) =>
          player.id === action.playerId
            ? { ...player, score: action.score } // Create a *new* player object
            : player,
        ),
      };
    case "setHealth":
      const newPlayers = gameState.players.map((player) =>
        player.id === action.playerId
          ? { ...player, health: Math.max(0, action.health) }
          : player,
      );
      // Update currentPlayer's health as well if it's the one being updated
      const newCurrentPlayerHealth =
        gameState.currentPlayer.id === action.playerId
          ? Math.max(0, action.health)
          : gameState.currentPlayer.health;

      return {
        ...gameState,
        players: newPlayers,
        currentPlayer: {
          ...gameState.currentPlayer,
          health: newCurrentPlayerHealth,
        },
      };
    case "isComplete":
      return gameState;
    case "setGameId":
      return {
        ...gameState,
        gameId: action.gameId,
      };
    case "changePublic":
      return gameState;
    case "setPublicLobbies":
      return gameState;
    case "setHost":
      return {
        ...gameState,
        currentPlayer: {
          ...gameState.currentPlayer,
          isHost: action.player.isHost,
        },
        players: gameState.players.map((p) =>
          p.id === gameState.currentPlayer.id
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
        ...gameState,
        currentPlayer: {
          ...gameState.currentPlayer,
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
        // boss fight section
        bossHealth: initialBossHealth,
        playerAnswers: {}, // Start with empty answers
        isTeamVictory: null,
      };
    case "setBossHealth":
      if (typeof gameState.bossHealth !== "number") return gameState; // Only run in boss mode
      return {
        ...gameState,
        bossHealth: Math.max(0, action.newBossHealth), // Ensure non-negative
      };

    case "recordPlayerAnswer":
      // Only record if the answer is for the current question index gameState
      if (
        action.questionIndex !== gameState.currentQuestionIndex ||
        !gameState.playerAnswers
      ) {
        console.warn(
          `Ignoring stale answer for Q#${action.questionIndex} (current is ${gameState.currentQuestionIndex})`,
        );
        return gameState;
      }
      return {
        ...gameState,
        playerAnswers: {
          ...gameState.playerAnswers,
          [action.playerId]: {
            answered: true,
            isCorrect: action.isCorrect,
          },
        },
      };

    case "resetPlayerAnswers":
      return {
        ...gameState,
        playerAnswers: {}, // Clear answers for the new round
      };

    case "updateMultiplePlayerHealth":
      if (!action.healthUpdates) return gameState;
      const updatedPlayersMulti = gameState.players.map((player) => {
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
        action.healthUpdates.hasOwnProperty(gameState.currentPlayer.id)
          ? Math.max(0, action.healthUpdates[gameState.currentPlayer.id])
          : gameState.currentPlayer.health;

      return {
        ...gameState,
        players: updatedPlayersMulti,
        currentPlayer: {
          ...gameState.currentPlayer,
          health: updatedCurrentPlayerHealthMulti,
        },
      };

    case "setBossFightGameOver":
      return {
        ...gameState,
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
        ...gameState,
        activePlayerIndex: action.nextPlayerIndex,
        currentQuestionIndex: action.nextQuestionIndex,
        turnStartTime: action.newTurnStartTime, // Set start time for the new question
        playerAnswers: {}, // Automatically reset answers for the new question
      };
    case "setGameOver":
      console.log(`Reducer: Setting game over. Winner ID: ${action.winnerId}`);
      return {
        ...gameState,
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
        ...gameState,
        questions: action.questions,
      };
    case "restartGame":
      return {
        ...gameState,
        questions: [],
        currentQuestionIndex: 0,
        gameStarted: false,
      };
  }
}
