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
import {
  defaultState,
  GameStateActions,
  GameStateActionsType,
  gameStatereducer,
} from "./gameState";
import { GameState } from "./types/types";
import { Player } from "./types/types";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/backend/utils/database";
import {
  BroadcastingPayloads,
  GameStateActionPayloads,
  BROADCASTING_ACTION_KEYS,
} from "./types/gameStatePayloads";
import { createBroadcastPayload } from "./utils/utils";

export const BROADCAST_EVENTS = Object.fromEntries(
  BROADCASTING_ACTION_KEYS.map((k) => [k, k]),
) as { [K in (typeof BROADCASTING_ACTION_KEYS)[number]]: K };

type BroadcastEventType = keyof BroadcastingPayloads;

// export type BroadcastEventType =
//   (typeof BROADCAST_EVENTS)[keyof typeof BROADCAST_EVENTS];

type GameContextType = {
  gameState: GameState;
  dispatch: React.Dispatch<GameStateActions>;
  sendBroadcast: <E extends BroadcastEventType>(
    event: E,
    payload: BroadcastingPayloads[E],
  ) => void;
  broadcastAndDispatch: <E extends BroadcastEventType & GameStateActionsType>(
    event: E,
    payload: BroadcastingPayloads[E] & GameStateActionPayloads[E],
  ) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameProviderProps = {
  children: ReactNode;
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, dispatch] = useReducer(gameStatereducer, defaultState);
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  const { player, lobby } = gameState;

  useEffect(() => {
    console.log(lobby.lobbyId);

    // remove channel is already existent
    if (channelRef.current) {
      console.log(
        `Unsubscribing from previous channel: ${channelRef.current.topic}`,
      );
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    // add Lobby channel to player
    if (lobby.lobbyId && player.playerId.length > 0) {
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
            (player): player is Player => !!player && player.playerId !== "",
          ); // Filter out invalid/guest players

        console.log("Synced players:", updatedPlayers);
        dispatch({ type: "setPlayers", payload: { players: updatedPlayers } });
      });

      channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("Presence join:", key, newPresences);
        const joinedPlayerInfo = newPresences[0]?.playerInfo as
          | Player
          | undefined;
        // Ensure valid player joined
        if (joinedPlayerInfo && joinedPlayerInfo.playerId !== "") {
          const currentPlayers = lobby.players;
          if (
            player.isHost &&
            !currentPlayers.some(
              (p) => p.playerId === joinedPlayerInfo.playerId,
            )
          ) {
            const { event, payload } = createBroadcastPayload(
              BROADCAST_EVENTS.setLobby,
              {
                lobby: {
                  ...lobby,
                  players: [...currentPlayers, joinedPlayerInfo],
                },
              },
            );
            dispatch({
              type: "setPlayers",
              payload: { players: [...currentPlayers, joinedPlayerInfo] },
            });
            sendBroadcast(event, payload);
          }
        }
      });

      channel.on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("Presence leave:", key, leftPresences);
        // Rely on the next 'sync' event triggered by leave, or explicitly remove
        const leftPlayerId = parseInt(key, 10); // Key is the player ID
        if (!isNaN(leftPlayerId)) {
          const remainingPlayers = lobby.players.filter(
            (p) => p.playerId !== leftPlayerId.toString(),
          );
          dispatch({
            type: "setPlayers",
            payload: { players: remainingPlayers },
          });
        }
      });

      // --- Broadcast Handlers ---
      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.setLobby },
        ({ payload }: { payload: BroadcastingPayloads["setLobby"] }) => {
          dispatch({
            type: "setLobby",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.setStartGame },
        ({ payload }: { payload: BroadcastingPayloads["setStartGame"] }) => {
          dispatch({
            type: "setStartGame",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.setHealth },
        ({ payload }: { payload: BroadcastingPayloads["setHealth"] }) => {
          dispatch({
            type: "setHealth",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.setPlayerState },
        ({ payload }: { payload: BroadcastingPayloads["setPlayerState"] }) => {
          dispatch({
            type: "setPlayerState",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.advanceTurnDeathmatch },
        ({
          payload,
        }: {
          payload: BroadcastingPayloads["advanceTurnDeathmatch"];
        }) => {
          dispatch({
            type: "advanceTurnDeathmatch",
            payload: payload,
          });
        },
      );
      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.advanceTurnBossfight },
        ({
          payload,
        }: {
          payload: BroadcastingPayloads["advanceTurnBossfight"];
        }) => {
          dispatch({
            type: "advanceTurnBossfight",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.submitAnswerDeathmatch },
        ({
          payload,
        }: {
          payload: BroadcastingPayloads["submitAnswerDeathmatch"];
        }) => {
          dispatch({
            type: "submitAnswerDeathmatch",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.recordPlayerAnswer },
        ({
          payload,
        }: {
          payload: BroadcastingPayloads["recordPlayerAnswer"];
        }) => {
          dispatch({
            type: "recordPlayerAnswer",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.setBossHealth },
        ({ payload }: { payload: BroadcastingPayloads["setBossHealth"] }) => {
          dispatch({
            type: "setBossHealth",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.setGameOver },
        ({ payload }: { payload: BroadcastingPayloads["setGameOver"] }) => {
          dispatch({
            type: "setGameOver",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.teamDamage },
        ({ payload }: { payload: BroadcastingPayloads["teamDamage"] }) => {
          dispatch({
            type: "teamDamage",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.setQuestions },
        ({ payload }: { payload: BroadcastingPayloads["setQuestions"] }) => {
          dispatch({
            type: "setQuestions",
            payload: payload,
          });
        },
      );

      channel.on(
        "broadcast",
        { event: BROADCAST_EVENTS.restartGame },
        ({ payload }: { payload: BroadcastingPayloads["restartGame"] }) => {
          dispatch({
            type: "restartGame",
            payload: payload,
          });
        },
      );

      // Add player to lobby connections
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track this user's presence once subscribed, and sync other players
          if (gameState.player.playerId.length > 0) {
            await channel.track({ playerInfo: gameState.player });
          }
        } else if (status === "CHANNEL_ERROR") {
          console.error(`Channel Error for ${gameState.lobby.lobbyId}`);
        } else if (status === "TIMED_OUT") {
          console.warn(
            `Channel subscription timed out for ${gameState.lobby.lobbyId}`,
          );
        } else if (status === "CLOSED") {
          console.log(`Channel ${gameState.lobby.lobbyId} closed.`);
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
  }, [gameState.lobby.lobbyId, gameState.player.playerId]);

  function specialDispatch<K extends keyof GameStateActionPayloads>(
    event: K,
    payload: GameStateActionPayloads[K],
  ) {
    const action = { type: event, payload } as GameStateActions;
    dispatch(action);
  }

  const sendBroadcast = useCallback(
    <E extends BroadcastEventType>(
      event: E,
      payload: BroadcastingPayloads[E],
    ) => {
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
    },
    [dispatch],
  );

  const broadcastAndDispatch = useCallback(
    <E extends BroadcastEventType & GameStateActionsType>(
      event: E,
      payload: BroadcastingPayloads[E] & GameStateActionPayloads[E],
    ) => {
      sendBroadcast(event, payload);
      dispatch({
        type: event,
        payload: payload,
      } as GameStateActions);
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      gameState,
      dispatch,
      sendBroadcast,
      broadcastAndDispatch,
    }),
    [gameState, dispatch, sendBroadcast, broadcastAndDispatch],
  );

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
