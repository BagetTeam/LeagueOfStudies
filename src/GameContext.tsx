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
  START_GAME: "setStartGame",
  RESTART_GAME: "restartGame",
  SET_QUESTIONS: "setQuestions",
  HEALTH_UPDATE: "setHealth",
  TURN_ADVANCE_DEATHMATCH: "advanceTurnDeathmatch",
  TURN_ADVANCE_BOSSFIGHT: "advanceTurnBossfight",
  PLAYER_ANSWERED: "recordPlayerAnswer",
  BOSS_DAMAGED: "setBossHealth",
} as const;

type StartGamePayload = {
  initiatedBy: number;
  initialPlayers: Player[];
  gameMode: GameMode;
  questions: Question[];
};

type SetQuestionsPayload = {
  questions: Question[];
};

type HealthUpdatePayload = {
  playerId: number;
  health: number;
};

type TurnAdvanceDeathmatchPayload = {
  currentPlayerIndex: number;
  currentQuestionIndex: number;
  startTime: number;
};

type TurnAdvanceBossfightPayload = {
  currentQuestionIndex: number;
  startTime: number;
};

type PlayerAnsweredPayload = {
  playerId: number;
  questionIndex: number;
  isCorrect: boolean;
};

type BossDamagePayload = {
  bossHealth: number;
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, dispatch] = useReducer(gameStatereducer, initialState);
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  const { player, lobby } = gameState;

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
    if (lobby.lobbyId && player.playerId > 0) {
      const channel = supabase.channel(lobby.lobbyId, {
        config: {
          presence: {
            key: gameState.player.playerId.toString(),
          },
          broadcast: {
            ack: true, // Optional: Wait for ack from server
          },
        },
      });
      channelRef.current = channel;

      // --- Presence Handlers ---
      channel.on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState<{ playerInfo: Player }>();
        const updatedPlayers = Object.values(presenceState)
          .map((presence) => presence[0]?.playerInfo)
          .filter(
            (player): player is Player => !!player && player.playerId !== 0,
          ); // Filter out invalid/guest players

        console.log("Synced players:", updatedPlayers);
        dispatch({ type: "setPlayers", players: updatedPlayers });
      });

      channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("Presence join:", key, newPresences);
        const joinedPlayerInfo = newPresences[0]?.playerInfo as
          | Player
          | undefined;
        if (joinedPlayerInfo && joinedPlayerInfo.playerId !== 0) {
          // Ensure valid player joined
          console.log("Dispatching addPlayer for:", joinedPlayerInfo);
          // Use setPlayers to handle potential gameState inconsistencies on join/sync race conditions
          const currentPlayers = lobby.players;
          if (
            !currentPlayers.some(
              (p) => p.playerId === joinedPlayerInfo.playerId,
            )
          ) {
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
          const remainingPlayers = lobby.players.filter(
            (p) => p.playerId !== leftPlayerId,
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
            (player) => player.playerId == payload.initiatedBy,
          );
          dispatch({
            type: "setStartGame",
            gameMode: payload.gameMode,
            initialPlayers: payload.initialPlayers, // Use the player list from the host
            questions: payload.questions,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.HEALTH_UPDATE },
        ({ payload }: { payload: HealthUpdatePayload }) => {
          console.log("Received health_update broadcast:", payload);
          dispatch({
            type: "setHealth",
            playerId: payload.playerId,
            health: payload.health,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.TURN_ADVANCE_DEATHMATCH },
        ({ payload }: { payload: TurnAdvanceDeathmatchPayload }) => {
          dispatch({
            type: "advanceTurnDeathmatch",
            nextPlayerIndex: payload.currentPlayerIndex,
            nextQuestionIndex: payload.currentQuestionIndex,
            newTurnStartTime: payload.startTime,
          });
        },
      );
      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.TURN_ADVANCE_BOSSFIGHT },
        ({ payload }: { payload: TurnAdvanceBossfightPayload }) => {
          dispatch({
            type: "advanceTurnBossfight",
            nextQuestionIndex: payload.currentQuestionIndex,
            newTurnStartTime: payload.startTime,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.PLAYER_ANSWERED },
        ({ payload }: { payload: PlayerAnsweredPayload }) => {
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
      dispatch();
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
