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

/**
 * Three ways to mutate / communicate state:
 *  - dispatch:             local-only reducer update (no network)
 *  - sendBroadcast:        send to other clients via Supabase Realtime (no local update)
 *  - broadcastAndDispatch: do both — update locally AND broadcast to peers
 *
 * Use `broadcastAndDispatch` for actions the sender also needs to apply
 * (e.g. submitting an answer). Use `sendBroadcast` when only remote peers
 * should react (e.g. host syncing lobby state to a new joiner).
 */
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

  // Manages the Supabase Realtime channel lifecycle:
  // 1. Tears down any existing channel when lobbyId changes
  // 2. Creates a new channel with presence (player tracking) and broadcast (game events)
  // 3. Registers handlers for presence sync/join/leave and all broadcast event types
  // 4. Subscribes and tracks this player's presence once connected
  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    if (lobby.lobbyId && player.playerId.length > 0) {
      const channel = supabase.channel(lobby.lobbyId, {
        config: {
          presence: {
            key: gameState.player.playerId.toString(),
          },
          broadcast: {
            ack: true,
          },
        },
      });
      channelRef.current = channel;

      channel.on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState<{ playerInfo: Player }>();
        const updatedPlayers = Object.values(presenceState)
          .map((presence) => presence[0]?.playerInfo)
          .filter(
            (player): player is Player => !!player && player.playerId !== "",
          );

        dispatch({ type: "setPlayers", payload: { players: updatedPlayers } });
      });

      // When a new player joins, the host broadcasts the updated lobby so
      // the joiner receives the full current state (questions, game mode, etc.)
      channel.on("presence", { event: "join" }, ({ newPresences }) => {
        const joinedPlayerInfo = newPresences[0]?.playerInfo as
          | Player
          | undefined;
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

      channel.on("presence", { event: "leave" }, ({ key }) => {
        const leftPlayerId = parseInt(key, 10);
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

      // Register a broadcast listener for every broadcastable action.
      // Each listener simply dispatches the received payload into the local
      // reducer so all clients converge on the same state.
      for (const key of BROADCASTING_ACTION_KEYS) {
        channel.on("broadcast", { event: key }, ({ payload }) => {
          dispatch({ type: key, payload } as GameStateActions);
        });
      }

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          if (gameState.player.playerId.length > 0) {
            await channel.track({ playerInfo: gameState.player });
          }
        }
      });

      return () => {
        if (channelRef.current) {
          channelRef.current.unsubscribe();
          channelRef.current = null;
        }
      };
    }
  }, [gameState.lobby.lobbyId, gameState.player.playerId]);

  const sendBroadcast = useCallback(
    <E extends BroadcastEventType>(
      event: E,
      payload: BroadcastingPayloads[E],
    ): void => {
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
      }
    },
    [],
  );

  const broadcastAndDispatch = useCallback(
    <E extends BroadcastEventType & GameStateActionsType>(
      event: E,
      payload: BroadcastingPayloads[E] & GameStateActionPayloads[E],
    ): void => {
      sendBroadcast(event, payload);
      dispatch({
        type: event,
        payload: payload,
      } as GameStateActions);
    },
    [sendBroadcast],
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
