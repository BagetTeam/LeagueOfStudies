// GameScreen.tsx
"use client";

import LobbyScreen from "@/components/LobbyScreen";
import { GameMode, Player } from "@/types/types"; // Keep Player if needed
import { useRouter, useSearchParams } from "next/navigation"; // Use useSearchParams
import { useGame } from "../GameContext";
import { useEffect } from "react";
import DeathmatchGame from "@/components/DeathMatchGame"; // Assuming path
import BossFightGame from "@/components/BossFightGame"; // Assuming path

// Define initial/default game mode if needed
const defaultGameMode: GameMode = {
  type: "deathmatch", // Or your most common mode
  time: 15, // Corresponds to TURN_DURATION_SECONDS
};

function GameScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get URL search parameters
  const { gameState, dispatch } = useGame();
  const { gameId, gameStarted, gameMode, currentPlayer, gameSubject } =
    gameState;
  const joinGameId = searchParams.get("join");

  useEffect(() => {
    // --- Initialization Logic ---
    if (joinGameId && !gameId) {
      console.log(`Joining game from URL: ${joinGameId}`);
      dispatch({ type: "setGameId", gameId: joinGameId });
    } else if (!gameId) {
      const newGameId = "game-" + crypto.randomUUID().toString();
      console.log(`Creating new game with ID: ${newGameId}`);
      dispatch({ type: "setGameId", gameId: newGameId });
    }

    // Setting up players
    if (!currentPlayer || currentPlayer.id === 0) {
      const playerId = Math.floor(Math.random() * 10000) + 1; // TODO have it not be random
      const playerName = "Player" + playerId;
      console.log(
        `Initializing temporary player: ${playerName} (ID: ${playerId})`,
      );

      let player: Player = {
        id: playerId,
        name: playerName,
        score: 0,
        health: 5,
        isHost: !joinGameId,
      };

      dispatch({
        type: "setCurrentPlayer",
        player: player,
      });

      // If creating, also add self to players list and set as host
      if (!joinGameId) {
        player = { ...player, isHost: true };
        dispatch({
          type: "addPlayer",
          player: player,
        });
        dispatch({
          type: "setHost",
          player: player,
        });
      }
    }

    // 3. Set Default Game Mode if not set
    if (!gameMode?.type) {
      console.log(
        "No gamemodes??? ###############################################",
      );
      dispatch({ type: "setGameMode", gameMode: defaultGameMode });
    }

    if (!gameSubject) {
      dispatch({ type: "setGameSubject", subject: "Rust" });
    }
  }, [dispatch, gameId, currentPlayer, searchParams, gameMode, gameSubject]); // Dependencies for init

  // --- Navigation / Component Rendering ---
  if (!gameId || !currentPlayer || currentPlayer.id === 0) {
    return <div>Initializing...</div>; // Show loading until basic gameState is set
  }

  if (gameStarted) {
    // Render the correct game component based on gameMode
    switch (gameMode.type) {
      case "deathmatch":
        return <DeathmatchGame />;
      case "bossbattle":
        // return <BossFightGame />; // Uncomment when component exists
        return <BossFightGame />;
      default:
        console.error(`Unknown game mode: ${gameMode.type}`);
        // Navigate back or show error
        return <div>Error: Unknown Game Mode</div>;
    }
  } else {
    // Render Lobby if game hasn't started
    return (
      <LobbyScreen
        selectedMode={gameMode || defaultGameMode} // Pass current or default mode
        isPublic={false} // Get from gameState if implemented: gameState.isPublicLobby
        onBackToMenu={() => {
          router.push("/"); // Navigate to home or dashboard
        }}
        subject={gameSubject}
      />
    );
  }
}

export default function GameScreen() {
  // GameProvider should wrap this component higher up in the tree (e.g., in layout.tsx or _app.tsx)
  // If GameProvider is *only* for this screen, wrap GameScreenContent here.
  // For global gameState, GameProvider should be higher.
  return <GameScreenContent />;
}
