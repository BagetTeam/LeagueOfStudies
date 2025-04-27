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

type LobbyProps = {
  selectedMode: GameMode;
  onStartGame: () => void;
  onBackToMenu: () => void;
  //   dispatch: ActionDispatch<[action: GameOpsAction]>;
  isPublic: boolean;
};
function LobbyScreen({
  selectedMode,
  onBackToMenu,
  onStartGame,
  isPublic,
}: LobbyProps) {
  const { state, dispatch, sendBroadcast } = useGame(); // Get state and dispatch from context
  const { gameId, players, currentPlayer } = state;
  const gameUrl = `http://localhost:3000?join=${gameId}`;
  const [currentIsPublic, setIsPublic] = useState(isPublic);
  const channel = supabase.channel(gameId);
  const router = useRouter(); // Add this to access router

  //   const changePublicPrivate = async () => {
  //     var newState = !currentIsPublic;
  //     setIsPublic(newState);
  //     try {
  //       await connection.send("ChangePublic", gameId);
  //     } catch {
  //       setIsPublic(!newState);
  //     }
  //   };
  console.log(players, "ERMRMMRMRM");
  console.log(currentPlayer, "AWYGDUAWHIDJAUIWDVG");
  useEffect(() => {
    if (
      currentPlayer.id &&
      players.length === 1 &&
      players[0].id === currentPlayer.id
    ) {
      console.log("CHANGING HOST - no other players detected");
      dispatch({
        type: "setHost",
        player: { ...currentPlayer, isHost: true },
      });
    }
  }, [players.length, currentPlayer.id, dispatch]);

  useEffect(() => {
    const handleGameStart = (gameType: string) => {
      console.log(`Game starting! Type: ${gameType}`);
      if (gameType === "deathmatch") {
        router.push("/game/deathmatch");
      } else if (gameType === "bossbattle") {
        router.push("/game/bossbattle");
      }
    };

    return () => {};
  }, [router]);

  const startGame = () => {
    if (currentPlayer.isHost) {
      sendBroadcast("start_game", {
        gameMode: selectedMode,
        initiatedBy: currentPlayer.id,
      });

      onStartGame();
    }
  };

  const handleBackToMenuClick = () => {
    console.log("LEAVING LOBBY");
    dispatch({ type: "exitLobby" }); // Make sure reducer handles this!
    onBackToMenu(); // Call original prop function (maybe remove players arg now)
    console.log(players);
  };

  const copyInviteLink = () => {
    console.log(JSON.stringify(players));
    navigator.clipboard.writeText(gameUrl);
    //toast.success("Invite link copied to clipboard");
  };

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Math Race Quest game!",
          text: "Join me for a math racing challenge!",
          url: gameUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };

  return (
    <>
      <div className="w-full">
        <Button
          variant="special"
          onClick={handleBackToMenuClick}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Button>

        <h1 className="mb-2 text-center text-3xl font-bold">Game Lobby</h1>
        <p className="text-muted-foreground mb-6 text-center">{"ahh mode"}</p>
      </div>
      {/* {currentPlayer.isHost && (
        <div className="bg-secondary/30 border-secondary w-full rounded-lg border p-4">
          <div className="flex flex-col items-start pb-2">
            <div className="text-[15px] text-gray-800">Game Settings</div>
            <div className="text-xs text-gray-500">
              Only the host can modify these settings
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex flex-col items-start">
              <div className="text-[15px] text-gray-800">Public Lobby</div>
              <div className="text-xs text-gray-500">
                Allow anyone to join without an invite
              </div>
            </div>
            <Switch
              checked={isPublic}
              //   onCheckedChange={changePublicPrivate}
              className="data-[state=checked]:bg-primary"
            ></Switch>
          </div>
        </div>
      )} */}

      <div className="bg-secondary/30 border-secondary w-full rounded-lg border p-4">
        <div className="mb-2 flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="text-sm font-medium">
            Share this link to invite players:
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="special"
              onClick={copyInviteLink}
              className="flex items-center gap-1"
            >
              <Copy size={14} />
              <span>Copy</span>
            </Button>
            <Button
              variant="special"
              onClick={shareInviteLink}
              className="flex items-center gap-1"
            >
              <Share2 size={14} />
              <span>Share</span>
            </Button>
          </div>
        </div>
        <div className="bg-background truncate rounded border p-2 text-xs">
          {gameUrl}
        </div>
      </div>
      <p className="text-muted-foreground text-sm">Game ID: {gameId}</p>
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Players ({players.length})</h2>
          {currentPlayer.isHost && (
            <Button
              onClick={async () => {
                startGame();
              }}
              className="math-button-primary flex items-center gap-2"
            >
              <Play size={16} />
              <span>Start Game</span>
            </Button>
          )}
        </div>

        <PlayerList
          players={players}
          currentPlayerId={currentPlayer.id}
          gameMode={selectedMode}
        />
        <div>{currentPlayer.isHost ? "HOST" : "NOT HOST"}</div>
      </div>
    </>
  );
}

export default LobbyScreen;
