"use client";

import { supabase } from "../lib/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import { GameMode, Player } from "@/types/types";
import { Button } from "@/ui";
import { Switch } from "@/ui/switch";
import { ArrowLeft, Copy, Play, Share2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import PlayerList from "./PlayerList";
import { useGame } from "@/app/GameContext";
import { useRouter } from "next/navigation";

const BROADCAST_EVENTS = {
  START_GAME: "start_game",
  HEALTH_UPDATE: "health_update",
  ANSWER_SUBMITTED: "answer_submitted",
  TURN_ADVANCE: "turn_advance",
  GAME_OVER: "game_over",
};
type LobbyProps = {
  selectedMode: GameMode; // This might come from context now?
  onBackToMenu: () => void;
  isPublic: boolean;
};
function LobbyScreen({ selectedMode, onBackToMenu, isPublic }: LobbyProps) {
  const { state, dispatch, sendBroadcast } = useGame();
  const { gameId, players = [], currentPlayer, gameMode, gameStarted } = state; // Default players to []
  const router = useRouter();
  const gameUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/game?join=${gameId}`
      : `/game?join=${gameId}`;

  useEffect(() => {
    if (
      players.length === 1 &&
      players[0].id === currentPlayer.id &&
      !currentPlayer.isHost
    ) {
      console.log("Setting current player as host (only player)");
      dispatch({ type: "setHost", player: { ...currentPlayer, isHost: true } });
    }
  }, [players, currentPlayer, dispatch]);

  useEffect(() => {
    console.log("Gamehas Started");
    if (state.gameStarted) {
      console.log("Game started, navigating...");
      if (state.gameMode.type === "deathmatch") {
        router.push("/game/deathmatch"); // Adjust path as needed
      } else if (state.gameMode.type === "bossbattle") {
        router.push("/game/bossbattle"); // Adjust path as needed
      }
    }
  }, [gameStarted, state.gameMode, router]);

  const startGame = () => {
    console.log("ERM");
    console.log(state);
    if (currentPlayer.isHost && players.length > 0) {
      // Ensure there are players
      console.log(
        "Host starting game. Broadcasting START_GAME with players:",
        players,
      );
      dispatch({
        type: "setStartGame",
        gameMode: state.gameMode,
        initialPlayers: players,
      });
      sendBroadcast(BROADCAST_EVENTS.START_GAME, {
        gameMode: state.gameMode, // Send the confirmed game mode
        initialPlayers: players, // Send the list of players currently in the lobby
        initiatedBy: currentPlayer.id,
      });
    } else {
      console.warn("Cannot start game: Not host or no players.");
    }
  };

  const handleBackToMenuClick = () => {
    console.log("Leaving lobby...");
    dispatch({ type: "exitLobby" });
    onBackToMenu();
  };

  const copyInviteLink = () => {
    navigator.clipboard
      .writeText(gameUrl)
      .then(() => console.log("Invite link copied"))
      .catch((err) => console.error("Failed to copy link: ", err));
  };

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Quiz Game!",
          text: "Join me for a fun quiz challenge!",
          url: gameUrl,
        });
        console.log("Link shared successfully");
      } catch (err) {
        console.error("Error sharing:", err);
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-4">
      {/* Back Button */}
      <Button
        onClick={handleBackToMenuClick}
        className="mb-4 flex items-center gap-2 self-start" // Align left
      >
        <ArrowLeft size={16} />
        <span>Back to Menu</span>
      </Button>

      {/* Lobby Title */}
      <h1 className="mb-2 text-center text-3xl font-bold">Game Lobby</h1>
      {/* Display Game Mode */}
      <p className="text-muted-foreground mb-6 text-center capitalize">
        Mode: {state.gameMode.type}{" "}
        {state.gameMode.type === "time" ? `(${state.gameMode.time}s)` : ""}
      </p>

      {/* Invite Section */}
      <div className="bg-secondary/30 border-secondary flex w-full flex-col gap-3 rounded-lg border p-4">
        <div className="text-center text-sm font-medium md:text-left">
          Invite players with this link:
        </div>
        <div className="bg-background truncate rounded border p-2 text-center font-mono text-xs select-all">
          {gameUrl}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button onClick={copyInviteLink} className="flex items-center gap-1">
            <Copy size={14} />
            <span>Copy</span>
          </Button>
          {navigator.share && ( // Only show share if supported
            <Button
              onClick={shareInviteLink}
              className="flex items-center gap-1"
            >
              <Share2 size={14} />
              <span>Share</span>
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          Game ID: {gameId}
        </p>
      </div>

      {/* Player List Section */}
      <div className="mt-4 w-full">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Players ({players.length})</h2>
          {/* Start Game Button for Host */}
          {currentPlayer.isHost && (
            <Button
              onClick={startGame}
              disabled={players.length < 1} // Example: Disable if < 2 players? Or allow solo start?
              className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              <Play size={16} />
              <span>Start Game</span>
            </Button>
          )}
        </div>

        {/* Player List Component */}
        {players.length > 0 ? (
          <PlayerList
            players={players}
            currentPlayerId={currentPlayer.id}
            gameMode={gameMode}
          />
        ) : (
          <p className="text-muted-foreground py-4 text-center">
            Waiting for players...
          </p>
        )}

        {/* Host Indicator (Optional) */}
        {/* <div className="text-center text-sm mt-2">
                  {currentPlayer.isHost ? "You are the host" : "Waiting for host to start..."}
              </div> */}
      </div>
    </div>
  );
}

export default LobbyScreen;
