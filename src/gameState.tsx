import { GameStateActionPayloads } from "./types/gameStatePayloads";
import { GameState, Lobby } from "./types/types";

export const defaultLobby = {
  lobbyId: "",
  players: [],
  gameMode: {
    type: "deathmatch",
    data: { time: 15, activePlayerIndex: 0 },
  },
  subject: "",
  questions: [],
  currentQuestionIndex: 0,
  playerAnswers: {},
  turnStartTime: null,
} satisfies Lobby;

export const defaultState = {
  player: {
    playerId: "",
    name: "",
    score: 0,
    health: 5,
    isHost: false,
    state: "lobby",
  },
  lobby: defaultLobby,
} satisfies GameState;

export type GameStateActions = {
  [K in keyof GameStateActionPayloads]: {
    type: K;
    payload: GameStateActionPayloads[K];
  };
}[keyof GameStateActionPayloads];

export type GameStateActionsType = keyof GameStateActionPayloads;

export function gameStatereducer(
  state: GameState,
  action: GameStateActions,
): GameState {
  switch (action.type) {
    case "setLobby":
      return { ...state, lobby: action.payload.lobby };
    case "joinLobby": {
      if (
        action.payload.lobby.players.find(
          (p) => p.playerId === action.payload.player.playerId,
        )
      ) {
        return state;
      }
      action.payload.player.state = "lobby";
      const updatedLobby: Lobby = {
        ...action.payload.lobby,
        players: [...state.lobby.players, action.payload.player],
      };
      return {
        ...state,
        player: action.payload.player,
        lobby: updatedLobby,
      };
    }
    case "exitLobby":
      return {
        ...state,
        lobby: defaultLobby,
      };
    case "setHost": {
      if (action.payload.player.playerId !== state.player.playerId)
        return state;

      const newPlayers = state.lobby.players.map((p) =>
        p.playerId === action.payload.player.playerId
          ? { ...p, isHost: action.payload.player.isHost }
          : p,
      );
      return {
        ...state,
        player: { ...state.player, isHost: action.payload.player.isHost },
        lobby: {
          ...state.lobby,
          players: newPlayers,
        },
      };
    }
    case "setGameMode":
      return {
        ...state,
        lobby: {
          ...state.lobby,
          gameMode: action.payload.gameMode,
        },
      };
    case "setGameSubject":
      return {
        ...state,
        lobby: {
          ...state.lobby,
          subject: action.payload.subject,
        },
      };

    case "setName":
      return {
        ...state,
        player: { ...state.player, name: action.payload.name },
      };
    case "setPlayers":
      return {
        ...state,
        lobby: { ...state.lobby, players: action.payload.players },
      };
    case "setCurrentPlayer":
      return {
        ...state,
        player: action.payload.player,
      };
    case "setPlayerState":
      return state;
    case "setScore": {
      const newPlayers = state.lobby.players.map((player) =>
        player.playerId === action.payload.playerId
          ? { ...player, score: action.payload.score }
          : player,
      );
      return {
        ...state,
        lobby: {
          ...state.lobby,
          players: newPlayers,
        },
      };
    }
    case "setHealth": {
      if (state.player.playerId === action.payload.playerId) {
        return state;
      }
      const newCurrentPlayerHealth = Math.max(0, action.payload.health);

      const newPlayers = state.lobby.players.map((player) =>
        player.playerId === action.payload.playerId
          ? { ...player, health: Math.max(0, action.payload.health) }
          : player,
      );

      return {
        ...state,
        lobby: { ...state.lobby, players: newPlayers },
        player: {
          ...state.player,
          health: newCurrentPlayerHealth,
        },
      };
    }

    case "setQuestions":
      return {
        ...state,
        lobby: { ...state.lobby, questions: action.payload.questions },
      };

    case "setStartGame": {
      const initialPlayersWithHealth = action.payload.initialPlayers.map(
        (p) => ({
          ...p,
          health: 5,
          score: 0,
          state: "playing" as const,
        }),
      );

      return {
        ...state,
        player: {
          ...state.player,
          health: 5,
          score: 0,
          state: "playing",
        },
        lobby: {
          ...state.lobby,
          gameMode: action.payload.gameMode,
          players: initialPlayersWithHealth,
          currentQuestionIndex: 0,
          turnStartTime: Date.now(),
          playerAnswers: {},
          questions: action.payload.questions,
        },
      };
    }

    case "restartGame": {
      const newPlayers = state.lobby.players.map((p) => ({
        ...p,
        state: "lobby" as const,
      }));
      return {
        ...state,
        player: { ...state.player, state: "lobby" },
        lobby: {
          ...state.lobby,
          players: newPlayers,
          questions: [],
          currentQuestionIndex: 0,
        },
      };
    }

    case "setBossfightGameOver": {
      const newPlayers = state.lobby.players.map((p) =>
        p.playerId === state.player.playerId
          ? { ...p, state: "completed" as const }
          : p,
      );

      return {
        ...state,
        lobby: { ...state.lobby, players: newPlayers },
        player: {
          ...state.player,
          state: "completed",
        },
      };
    }

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
              bossHealth: Math.max(0, action.payload.bossHealth),
            },
          },
        },
      };

    case "recordPlayerAnswer":
      // Only record if the answer is for the current question index state
      if (action.payload.questionIndex !== state.lobby.currentQuestionIndex) {
        return state;
      }
      return {
        ...state,
        lobby: {
          ...state.lobby,
          playerAnswers: {
            ...state.lobby.playerAnswers,
            [action.payload.playerId]: {
              isCorrect: action.payload.isCorrect,
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
              activePlayerIndex: action.payload.currentPlayerIndex,
            },
          },
          currentQuestionIndex: action.payload.currentQuestionIndex,
          turnStartTime: action.payload.startTime,
          playerAnswers: {},
        },
      };
    case "advanceTurnBossfight":
      if (state.lobby.gameMode.type !== "bossfight") return state;
      return {
        ...state,
        lobby: {
          ...state.lobby,
          currentQuestionIndex: action.payload.currentQuestionIndex,
          turnStartTime: action.payload.startTime,
          playerAnswers: {},
        },
      };
  }
}
