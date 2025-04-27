"use client";

import BossFightGame from "@/components/BossFightGame";
import DeathmatchGame from "@/components/DeathMatchGame";
import LobbyScreen from "@/components/LobbyScreen";
import { GameMode, Player } from "@/types/types";
import { useRouter } from "next/navigation";
import { GameProvider, useGame } from "../GameContext";
import { useEffect } from "react";

export default function GameScreen() {
  const router = useRouter();

  return <GameScreenContent />;
}

function GameScreenContent() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const { gameStarted, gameMode } = state;

  // Set initial values when component mounts
  useEffect(() => {
    // Initialize with a game ID
    dispatch({
      type: "setGameId",
      gameId: "hello",
      // gameId: "game-" + crypto.randomUUID().toString(),
    });

    // Initialize with a current player
    dispatch({
      type: "setCurrentPlayer",
      player: {
        id: Math.floor(Math.random() * 10000), // Generate unique ID
        name: "Player-" + Math.floor(Math.random() * 1000),
        score: 0,
        health: 5,
        isHost: false,
      },
    });
  }, [dispatch]);

  useEffect(() => {
    if (gameStarted && gameMode) {
      if (gameMode.type === "deathmatch") {
        router.push("/game/deathmatch");
      } else if (gameMode.type === "bossbattle") {
        router.push("/game/bossbattle");
      }
    }
  }, [gameStarted, gameMode.type, router]);

  const mode: GameMode = {
    type: "deathmatch",
    time: 60,
  };
  if (gameStarted) {
    return <div>Game starting...</div>;
  }

  return (
    <LobbyScreen
      selectedMode={mode}
      isPublic={false}
      onBackToMenu={() => {
        router.push("/");
      }}
      onStartGame={() => {
        mode.type === "deathmatch"
          ? router.push("/game/deathmatch")
          : router.push("/game/bossbattle");
      }}
    />
  );
}
