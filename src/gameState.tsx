import { act } from "react";
import { INITIAL_PLAYER_HEALTH } from "./types/const";
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
    case "setScore": {
      const currentPlayer =
        state.player.playerId === action.payload.playerId
          ? { ...state.player, score: action.payload.score }
          : state.player;

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
        player: currentPlayer,
      };
    }
    case "setHealth": {
      const currentPlayer =
        state.player.playerId === action.payload.playerId
          ? { ...state.player, health: Math.max(0, action.payload.health) }
          : state.player;

      const newPlayers = state.lobby.players.map((player) =>
        player.playerId === action.payload.playerId
          ? { ...player, health: Math.max(0, action.payload.health) }
          : player,
      );

      return {
        ...state,
        lobby: { ...state.lobby, players: newPlayers },
        player: currentPlayer,
      };
    }

    case "setPlayerState": {
      const currentPlayer =
        state.player.playerId === action.payload.playerId
          ? { ...state.player, state: action.payload.state }
          : state.player;

      const newPlayers = state.lobby.players.map((player) =>
        player.playerId === action.payload.playerId
          ? { ...player, state: action.payload.state }
          : player,
      );

      return {
        ...state,
        lobby: { ...state.lobby, players: newPlayers },
        player: currentPlayer,
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
          health: INITIAL_PLAYER_HEALTH,
          score: 0,
          state: "playing" as const,
        }),
      );

      return {
        ...state,
        player: {
          ...state.player,
          health: INITIAL_PLAYER_HEALTH,
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

    case "setGameOver": {
      const newPlayers = state.lobby.players.map((p) => ({
        ...p,
        state: "completed" as const,
      }));

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

    case "submitAnswerDeathmatch": {
      const {
        optionIndex,
        answeringPlayerId,
        currentPlayerIndex,
        currentQuestionIndex,
      } = action.payload;

      const { lobby, player: me } = state;
      const { gameMode, players } = lobby;
      if (
        lobby.currentQuestionIndex !== currentQuestionIndex ||
        gameMode.type !== "deathmatch" ||
        gameMode.data.activePlayerIndex !== currentPlayerIndex
      )
        return state;

      const currentQuestion = lobby.questions[lobby.currentQuestionIndex];
      const currentPlayerId = players[currentPlayerIndex].playerId;

      const isCorrect = optionIndex === currentQuestion.correctAnswer;

      let newPlayer = { ...me };
      let newPlayers = players.map((p) => ({ ...p }));

      function removeHealth(targetId: string) {
        const idx = newPlayers.findIndex((p) => p.playerId === targetId);
        if (idx === -1) return;

        const p = newPlayers[idx];

        const newHealth = Math.max(0, p.health - 1);
        const newState = newHealth <= 0 ? "completed" : "playing";

        newPlayers[idx] = { ...p, health: newHealth, state: newState };

        if (newPlayer.playerId === targetId) {
          newPlayer = p;
        }
      }

      // Answering player answered before -> Health reduction for current player
      if (isCorrect && answeringPlayerId !== currentPlayerId) {
        removeHealth(currentPlayerId);
      }

      // If answer is not correct
      if (!isCorrect) {
        removeHealth(answeringPlayerId);
      }

      // Find the next player who is still alive (using the updated player list)
      let nextIndex = (currentPlayerIndex + 1) % newPlayers.length;
      while (
        newPlayers[nextIndex]?.state !== "playing" ||
        newPlayers[nextIndex]?.health <= 0
      ) {
        nextIndex = (nextIndex + 1) % newPlayers.length;

        if (nextIndex === currentPlayerIndex) {
          newPlayers = newPlayers.map((p) => ({ ...p, state: "completed" }));
          newPlayer = { ...newPlayer, state: "completed" };
          break;
        }
      }
      return {
        ...state,
        lobby: {
          ...state.lobby,
          players: newPlayers,
          gameMode: {
            ...gameMode,
            data: {
              ...gameMode.data,
              activePlayerIndex: nextIndex,
            },
          },
        },
        player: newPlayer,
      };
    }

    case "teamDamage": {
      const newPlayers = state.lobby.players.map((p) =>
        action.payload.playerHealths.hasOwnProperty(p.playerId)
          ? {
              ...p,
              health: action.payload.playerHealths[p.playerId],
            }
          : p,
      );
      const curPlayer = action.payload.playerHealths.hasOwnProperty(
        state.player.playerId,
      )
        ? {
            ...state.player,
            health: action.payload.playerHealths[state.player.playerId],
          }
        : state.player;

      return {
        ...state,
        player: curPlayer,
        lobby: { ...state.lobby, players: newPlayers },
      };
    }
  }
}
