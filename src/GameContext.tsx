"use client";

import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { initialState, GameStateActions, gameStatereducer } from "./gameState";
import { GameState } from "./types/types";
import { GameMode, Player, Question } from "./types/types";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/backend/utils/database";

type GameContextType = {
  gameState: GameState;
  dispatch: React.Dispatch<GameStateActions>;
  sendBroadcast: (event: string, payload: object) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameProviderProps = {
  children: ReactNode;
};

export const BROADCAST_EVENTS = {
  START_GAME: "start_game",
  HEALTH_UPDATE: "health_update",
  ANSWER_SUBMITTED: "answer_submitted",
  TURN_ADVANCE: "turn_advance",
  GAME_OVER: "game_over",

  PLAYER_ANSWERED: "player_answered",
  QUESTION_START: "question_start",
  BOSS_DAMAGED: "boss_damaged",
  TEAM_DAMAGED: "team_damaged",
  BOSS_FIGHT_GAME_OVER: "boss_fight_game_over",
  SET_QUESTIONS: "set_questions",

  RESTART_GAME: "restart_game",
} as const;

// StartGame Broadcast
type StartGamePayload = {
  initiatedBy: number;
  initialPlayers: Player[];
  gameMode: GameMode;
  questions: Question[];
};

type HealthUpdatePayload = {
  player: Player;
  health: number;
};

type AnswerSubmittedPayload = {
  player: Player;
  question: Question;
  isCorrect: boolean;
};

type TurnAdvancePayload = {
  currentPlayerIndex: number;
  currentQuestionIndex: number;
  startTime: number;
};

// Set Question Broadcast
type SetQuestionsPayload = {
  questions: Question[];
};

"game_over",

  PLAYER_ANSWERED: "player_answered",
  QUESTION_START: "question_start",
  BOSS_DAMAGED: "boss_damaged",
  TEAM_DAMAGED: "team_damaged",
  BOSS_FIGHT_GAME_OVER: "boss_fight_game_over",

  RESTART_GAME: "restart_game",

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, dispatch] = useReducer(gameStatereducer, initialState);
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // remove channel is already existent
    if (channelRef.current) {
      console.log(
        `Unsubscribing from previous channel: ${channelRef.current.topic}`,
      );
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    // add Lobby channel to player
    if (gameState.lobby.lobbyId && gameState.player.playerId > 0) {
      const channel = supabase.channel(gameState.lobby.lobbyId, {
        config: {
          presence: {
            key: gameState.player.playerId.toString(), // Use valid player ID
          },
          broadcast: {
            ack: true, // Optional: Wait for ack from server
          },
        },
      });
      channelRef.current = channel;

      // --- Presence Handlers ---
      channel.on("presence", { event: "sync" }, () => {
        console.log("Presence sync received");
        const presenceState = channel.presenceState<{ playerInfo: Player }>();
        const updatedPlayers = Object.values(presenceState)
          .map((presence) => presence[0]?.playerInfo)
          .filter((player): player is Player => !!player && player.id !== 0); // Filter out invalid/guest players

        console.log("Synced players:", updatedPlayers);
        dispatch({ type: "setPlayers", players: updatedPlayers });
      });

      channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("Presence join:", key, newPresences);
        const joinedPlayerInfo = newPresences[0]?.playerInfo as
          | Player
          | undefined;
        if (joinedPlayerInfo && joinedPlayerInfo.id !== 0) {
          // Ensure valid player joined
          console.log("Dispatching addPlayer for:", joinedPlayerInfo);
          // Use setPlayers to handle potential gameState inconsistencies on join/sync race conditions
          const currentPlayers = gameState.players;
          if (!currentPlayers.some((p) => p.id === joinedPlayerInfo.id)) {
            dispatch({
              type: "setPlayers",
              players: [...currentPlayers, joinedPlayerInfo],
            });
          }
        }
      });

      channel.on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("Presence leave:", key, leftPresences);
        // Rely on the next 'sync' event triggered by leave, or explicitly remove
        const leftPlayerId = parseInt(key, 10); // Key is the player ID
        if (!isNaN(leftPlayerId)) {
          console.log(`Removing player ${leftPlayerId}`);
          const remainingPlayers = gameState.players.filter(
            (p) => p.id !== leftPlayerId,
          );
          dispatch({ type: "setPlayers", players: remainingPlayers });
        }
      });

      // --- Broadcast Handlers ---
      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.START_GAME },
        ({ payload }: { payload: StartGamePayload }) => {
          console.log("Received start_game broadcast:", payload);
          // Host broadcasts the list of players at the start
          const hostIndex = payload.initialPlayers.findIndex(
            (player) => player.id == payload.initiatedBy,
          );
          if (payload.gameMode && payload.initialPlayers && payload.questions) {
            console.log("Yeyyeyeyyeyeyeyeyeyeyeyeyeyyeyeyeyey");
            dispatch({
              type: "setQuestions",
              questions: payload.questions,
            });
            dispatch({
              type: "setStartGame",
              gameMode: payload.gameMode,
              initialPlayers: payload.initialPlayers, // Use the player list from the host
              activePlayerIndex: hostIndex,
            });
          }
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.HEALTH_UPDATE },
        ({ payload }) => {
          console.log("Received health_update broadcast:", payload);
          if (payload.playerId && typeof payload.newHealth === "number") {
            dispatch({
              type: "setHealth",
              playerId: payload.playerId,
              health: payload.newHealth,
            });
          }
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.TURN_ADVANCE },
        ({ payload }) => {
          console.log("Received turn_advance broadcast:", payload);
          if (
            typeof payload.nextPlayerIndex === "number" &&
            typeof payload.nextQuestionIndex === "number" &&
            typeof payload.newTurnStartTime === "number"
          ) {
            dispatch({
              type: "advanceTurn",
              nextPlayerIndex: payload.nextPlayerIndex,
              nextQuestionIndex: payload.nextQuestionIndex,
              newTurnStartTime: payload.newTurnStartTime,
            });
          }
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.GAME_OVER },
        ({ payload }) => {
          console.log("Received game_over broadcast:", payload);
          // Payload might contain winnerId, or we calculate it client-side if needed
          dispatch({
            type: "setGameOver",
            winnerId: payload.winnerId ?? null, // Use winnerId from payload or null
            isGameOver: payload.isGameOver,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.PLAYER_ANSWERED },
        ({ payload }) => {
          console.log("Received player_answered broadcast:", payload);
          // if (
          //   payload.playerId &&
          //   typeof payload.isCorrect !== "undefined" &&
          //   payload.questionIndex >= 0
          // ) {
          if (payload.questionIndex !== gameState.currentQuestionIndex) {
            console.log(
              `Question index mismatch: Player answered Q${payload.questionIndex}, but current is Q${gameState.currentQuestionIndex}`,
            );
            // Still record the answer to handle race conditions
          }
          dispatch({
            type: "recordPlayerAnswer",
            playerId: payload.playerId,
            questionIndex: payload.questionIndex,
            isCorrect: payload.isCorrect,
          });

          // } else {
          //   console.warn(
          //     "Invalid or stale PLAYER_ANSWERED payload:",
          //     payload,
          //     "Current Q:",
          //     gameState.currentQuestionIndex,
          //   );
          // }
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.QUESTION_START },
        ({ payload }) => {
          console.log("Received question_start broadcast:", payload);
          if (
            typeof payload.nextQuestionIndex === "number" &&
            typeof payload.newTurnStartTime === "number"
          ) {
            // Use 'advanceTurn' reducer logic which now also resets answers
            dispatch({
              type: "advanceTurn", // Or rename action if preferred e.g., 'advanceBossQuestion'
              nextPlayerIndex: -1, // Not relevant here
              nextQuestionIndex: payload.nextQuestionIndex,
              newTurnStartTime: payload.newTurnStartTime,
            });
            // Optionally reset local UI gameState in component listening to this, if needed
          }
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.BOSS_DAMAGED },
        ({ payload }) => {
          console.log("Received boss_damaged broadcast:", payload);
          if (typeof payload.newBossHealth === "number") {
            dispatch({
              type: "setBossHealth",
              newBossHealth: payload.newBossHealth,
            });
            // Trigger UI feedback in component
          }
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.TEAM_DAMAGED },
        ({ payload }) => {
          console.log("Received team_damaged broadcast:", payload);
          if (
            payload.healthUpdates &&
            typeof payload.healthUpdates === "object"
          ) {
            dispatch({
              type: "updateMultiplePlayerHealth",
              healthUpdates: payload.healthUpdates,
            });
            // Trigger UI feedback in component
          }
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.BOSS_FIGHT_GAME_OVER },
        ({ payload }) => {
          console.log("Received boss_fight_game_over broadcast:", payload);
          if (typeof payload.isVictory === "boolean") {
            dispatch({
              type: "setBossFightGameOver",
              isVictory: payload.isVictory,
            });
          }
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.SET_QUESTIONS },
        ({ payload }: { payload: SetQuestionsPayload }) => {
          console.log("EYEYYEYEYEYEYYEYEYEYYEYEYEYYEE");
          dispatch({
            type: "setQuestions",
            questions: payload.questions,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.RESTART_GAME },
        ({}) => {
          dispatch({
            type: "restartGame",
          });
        },
      );

      channel.subscribe(async (status) => {
        console.log(`Channel ${gameState.gameId} subscription status:`, status);
        if (status === "SUBSCRIBED") {
          // Track this user's presence once subscribed, ensure playerInfo is valid
          if (gameState.currentPlayer.id > 0) {
            await channel.track({ playerInfo: gameState.currentPlayer });
            console.log("Tracked current player:", gameState.currentPlayer);
          } else {
            console.warn("Attempted to track player with invalid ID (0)");
          }
        } else if (status === "CHANNEL_ERROR") {
          console.error(`Channel Error for ${gameState.gameId}`);
          // Handle error, maybe try to resubscribe or notify user
        } else if (status === "TIMED_OUT") {
          console.warn(
            `Channel subscription timed out for ${gameState.gameId}`,
          );
          // Handle timeout
        } else if (status === "CLOSED") {
          console.log(`Channel ${gameState.gameId} closed.`);
          // Perform cleanup if necessary
        }
      });

      return () => {
        console.log(`Cleaning up channel`);
        if (channelRef.current) {
          channelRef.current.unsubscribe();
          channelRef.current = null;
        }
      };
    }
  }, [gameState.gameId, gameState.currentPlayer.id]);

  const sendBroadcast = useCallback((event: string, payload: object) => {
    if (channelRef.current) {
      channelRef.current
        .send({
          type: "broadcast",
          event: event,
          payload: payload,
        })
        .catch((error) => {
          console.error(`Broadcast ${event} failed:`, error);
        });
    } else {
      console.warn(
        "Cannot send broadcast, channel not available or not subscribed yet.",
      );
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      gameState,
      dispatch,
      sendBroadcast,
    }),
    [gameState, dispatch, sendBroadcast],
  ); // Include sendBroadcast here

  return (
    <GameContext.Provider value={contextValue}>
      <Suspense>{children}</Suspense>
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
