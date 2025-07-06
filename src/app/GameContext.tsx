"use client";

// Example: GameContext.tsx
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
import { GameState, GameStateActions, gameStatereducer } from "./gameState";
import { GameMode, Player, Question } from "../types/types";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const initialState: GameState = {
  gameId: "",
  currentPlayer: { id: 0, name: "Guest", score: 0, health: 5, isHost: false },
  players: [],
  gameMode: { type: "deathmatch", time: 15 },
  gameSubject: "",
  gameStarted: false,
  activePlayerIndex: 0,
  currentQuestionIndex: 0,
  turnStartTime: null,
  isGameOver: false,
  winnerId: null,
  questions: [],
};

type GameContextType = {
  state: GameState;
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
  ANSWER_SUBMITTED: "answer_submitted", // Player submits an answer
  TURN_ADVANCE: "turn_advance", // Server/Host advances the turn
  GAME_OVER: "game_over", // Server/Host declares game over

  PLAYER_ANSWERED: "player_answered", // Player submits their individual answer
  QUESTION_START: "question_start", // Host signals start of new question & timer
  BOSS_DAMAGED: "boss_damaged", // Host signals boss health update
  TEAM_DAMAGED: "team_damaged", // Host signals multiple players health update
  BOSS_FIGHT_GAME_OVER: "boss_fight_game_over",
  SET_QUESTIONS: "set_questions",

  RESTART_GAME: "restart_game",
};

// StartGame Broadcast
type StartGamePayload = {
  initiatedBy: number;
  initialPlayers: Player[];
  gameMode: GameMode;
  questions: Question[];
};

// Set Question Broadcast
type SetQuestionsPayload = {
  questions: Question[];
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [state, dispatch] = useReducer(gameStatereducer, initialState);
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    console.log("GameContext State Change:", state); // Log state changes
  }, [state]);

  useEffect(() => {
    // Cleanup previous channel if gameId or currentPlayer.id changes
    if (channelRef.current) {
      console.log(
        `Unsubscribing from previous channel: ${channelRef.current.topic}`,
      );
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    if (state.gameId && state.currentPlayer.id > 0) {
      // Ensure valid player ID
      console.log(
        `Setting up channel for gameId: ${state.gameId}, Player ID: ${state.currentPlayer.id}`,
      );
      const channel = supabase.channel(state.gameId, {
        config: {
          presence: {
            key: state.currentPlayer.id.toString(), // Use valid player ID
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
          // Use setPlayers to handle potential state inconsistencies on join/sync race conditions
          const currentPlayers = state.players;
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
          const remainingPlayers = state.players.filter(
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
          if (payload.questionIndex !== state.currentQuestionIndex) {
            console.log(
              `Question index mismatch: Player answered Q${payload.questionIndex}, but current is Q${state.currentQuestionIndex}`,
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
          //     state.currentQuestionIndex,
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
            // Optionally reset local UI state in component listening to this, if needed
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
        console.log(`Channel ${state.gameId} subscription status:`, status);
        if (status === "SUBSCRIBED") {
          // Track this user's presence once subscribed, ensure playerInfo is valid
          if (state.currentPlayer.id > 0) {
            await channel.track({ playerInfo: state.currentPlayer });
            console.log("Tracked current player:", state.currentPlayer);
          } else {
            console.warn("Attempted to track player with invalid ID (0)");
          }
        } else if (status === "CHANNEL_ERROR") {
          console.error(`Channel Error for ${state.gameId}`);
          // Handle error, maybe try to resubscribe or notify user
        } else if (status === "TIMED_OUT") {
          console.warn(`Channel subscription timed out for ${state.gameId}`);
          // Handle timeout
        } else if (status === "CLOSED") {
          console.log(`Channel ${state.gameId} closed.`);
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
  }, [state.gameId, state.currentPlayer.id]);

  const sendBroadcast = useCallback((event: string, payload: object) => {
    if (channelRef.current) {
      console.log(`Sending broadcast: ${event}`, payload);
      channelRef.current
        .send({
          type: "broadcast",
          event: event,
          payload: payload,
        })
        .then((response) => {
          console.log(`Broadcast ${event} sent`, response);
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
      state,
      dispatch,
      sendBroadcast,
    }),
    [state, dispatch, sendBroadcast],
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
