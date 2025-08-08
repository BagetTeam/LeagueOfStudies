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
      type: "joinLobby";
      lobby: Lobby;
      player: Player;
    }
  | {
      type: "exitLobby";
    }
  | {
      type: "setHost";
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
      type: "setPlayerState";
      playerId: number;
      state: Player["state"];
    }
  | {
      type: "setQuestions";
      questions: Question[];
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
      type: "setStartGame";
      gameMode: GameMode;
      initialPlayers: Player[];
      questions: Question[];
    }
  | {
      type: "advanceTurnDeathmatch";
      nextPlayerIndex: number;
      nextQuestionIndex: number;
      newTurnStartTime: number;
    }
  | {
      type: "advanceTurnBossfight";
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
      type: "restartGame";
    };

export function gameStatereducer(
  state: GameState,
  action: GameStateActions,
): GameState {
  switch (action.type) {
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
    case "setHost":
      if (action.player.playerId !== state.player.playerId) return state;
      return {
        ...state,
        player: { ...state.player, isHost: action.player.isHost },
        lobby: {
          ...state.lobby,
          players: state.lobby.players.map((p) =>
            p.playerId === action.player.playerId
              ? { ...p, isHost: action.player.isHost }
              : p,
          ),
        },
      };
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
        player: action.player,
      };
    case "setPlayerState":
      return state;
    case "setScore":
      return {
        ...state,
        lobby: {
          ...state.lobby,
          players: state.lobby.players.map((player) =>
            player.playerId === action.playerId
              ? { ...player, score: action.score }
              : player,
          ),
        },
      };
    case "setHealth":
      // update health for both player and player within lobby
      const newPlayers = state.lobby.players.map((player) =>
        player.playerId === action.playerId
          ? { ...player, health: Math.max(0, action.health) }
          : player,
      );
      const newCurrentPlayerHealth =
        state.player.playerId === action.playerId
          ? Math.max(0, action.health)
          : state.player.health;

      return {
        ...state,
        lobby: { ...state.lobby, players: newPlayers },
        player: {
          ...state.player,
          health: newCurrentPlayerHealth,
        },
      };

    case "setQuestions":
      return {
        ...state,
        lobby: { ...state.lobby, questions: action.questions },
      };

    case "setStartGame":
      const initialPlayersWithHealth = action.initialPlayers.map((p) => ({
        ...p,
        health: 5,
        state: "playing" as const,
      }));

      return {
        ...state,
        player: {
          ...state.player,
          health: 5,
          score: 0,
        },
        lobby: {
          ...state.lobby,
          gameMode: action.gameMode,
          players: initialPlayersWithHealth,
          currentQuestionIndex: 0,
          turnStartTime: Date.now(),
          playerAnswers: {},
          questions: action.questions,
        },
      };
    case "setBossHealth":
      if (state.lobby.gameMode.type !== "bossfight") return state; // Only run in boss mode
      return {
        ...state,
        lobby: {
          ...state.lobby,
          gameMode: {
            ...state.lobby.gameMode,
            data: {
              ...state.lobby.gameMode.data,
              bossHealth: Math.max(0, action.newBossHealth),
            },
          },
        },
      };

    case "recordPlayerAnswer":
      // Only record if the answer is for the current question index state
      if (action.questionIndex !== state.lobby.currentQuestionIndex) {
        return state;
      }
      return {
        ...state,
        lobby: {
          ...state.lobby,
          playerAnswers: {
            ...state.lobby.playerAnswers,
            [action.playerId]: {
              isCorrect: action.isCorrect,
            },
          },
        },
      };

    case "resetPlayerAnswers":
      return {
        ...state,
        lobby: { ...state.lobby, playerAnswers: {} },
      };

    case "advanceTurnDeathmatch":
      if (state.lobby.gameMode.type !== "deathmatch") return state;
      return {
        ...state,
        lobby: {
          ...state.lobby,
          gameMode: {
            ...state.lobby.gameMode,
            data: {
              ...state.lobby.gameMode.data,
              activePlayerIndex: action.nextPlayerIndex,
            },
          },
          currentQuestionIndex: action.nextQuestionIndex,
          turnStartTime: action.newTurnStartTime,
          playerAnswers: {},
        },
      };
    case "advanceTurnBossfight":
      if (state.lobby.gameMode.type !== "bossfight") return state;
      return {
        ...state,
        lobby: {
          ...state.lobby,
          currentQuestionIndex: action.nextQuestionIndex,
          turnStartTime: action.newTurnStartTime,
          playerAnswers: {},
        },
      };

    case "restartGame":
      return {
        ...state,
        lobby: { ...state.lobby, questions: [], currentQuestionIndex: 0 },
      };
  }
}
