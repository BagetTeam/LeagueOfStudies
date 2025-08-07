import { Player, GameMode, Question, GameState, Lobby } from "./types/types";

const defaultLobby = {
  lobbyId: "",
  players: [],
  gameMode: {
    type: "deathmatch",
    data: { time: 15, activePlayerIndex: 0 },
  },
  subject: "",
  topic: "",
  questions: [],
  currentQuestionIndex: 0,
  playerAnswers: {},
  turnStartTime: null,
} satisfies Lobby;

export const defaultState = {
  player: {
    playerId: 0,
    name: "",
    score: 0,
    health: 5,
    isHost: false,
    state: "lobby",
  },
  lobby: defaultLobby,
} satisfies GameState;

export type GameStateActions =
  | {
      type: "setGameMode";
      gameMode: GameMode;
    }
  | {
      type: "setGameSubject";
      subject: string;
    }
  | {
      type: "joinLobby";
      lobby: Lobby;
      player: Player;
    }
  | {
      type: "exitLobby";
    }
  | {
      type: "setName";
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
      type: "setPlayerState";
      state: Player["state"];
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
  | { type: "setBossHealth"; newBossHealth: number }
  | {
      type: "recordPlayerAnswer";
      playerId: number;
      questionIndex: number;
      isCorrect: boolean;
    }
  | { type: "resetPlayerAnswers" }
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
    case "setGameMode":
      return {
        ...state,
        lobby: {
          ...state.lobby,
          gameMode: action.gameMode,
        },
      };
    case "setGameSubject":
      return {
        ...state,
        lobby: {
          ...state.lobby,
          subject: action.subject,
        },
      };
    case "joinLobby":
      if (
        action.lobby.players.find((p) => p.playerId === action.player.playerId)
      ) {
        return state;
      }
      const updatedLobby: Lobby = {
        ...action.lobby,
        players: [...state.lobby.players, action.player],
      };
      return {
        ...state,
        lobby: updatedLobby,
      };
    case "exitLobby":
      return {
        ...state,
        lobby: defaultLobby,
      };
    case "setName":
      return { ...state, player: { ...state.player, name: action.name } };
    case "setPlayers":
      return {
        ...state,
        lobby: { ...state.lobby, players: action.players },
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
        // boss fight section
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
        lobby: { ...lobby, playerAnswers: {} },
      };

    case "advanceTurn":
      return {
        ...state,
        activePlayerIndex: action.nextPlayerIndex,
        currentQuestionIndex: action.nextQuestionIndex,
        turnStartTime: action.newTurnStartTime,
        playerAnswers: {},
      };

    case "setQuestions":
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
