// GameScreen.tsx
"use client";

import LobbyScreen from "@/components/LobbyScreen";
import { GameMode } from "@/types/types"; // Keep Player if needed
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
  const { state, dispatch } = useGame();
  const { gameId, gameStarted, gameMode, currentPlayer, gameSubject } = state;

  useEffect(() => {
    const joinGameId = searchParams.get("join");
    // let effectiveGameId = gameId;

    // --- Initialization Logic ---
    // 1. Set Game ID (Join or Create)
    if (joinGameId && !gameId) {
      console.log(`Joining game from URL: ${joinGameId}`);
      // effectiveGameId = joinGameId;
      dispatch({ type: "setGameId", gameId: joinGameId });
    } else if (!gameId) {
      const newGameId = "game-" + crypto.randomUUID().toString();
      console.log(`Creating new game with ID: ${newGameId}`);
      // effectiveGameId = newGameId;
      dispatch({ type: "setGameId", gameId: newGameId });
    }

    // 2. Set Current Player (should ideally happen earlier, but fallback)
    if (!currentPlayer || currentPlayer.id === 0) {
      // Check if player is not set or is default guest
      const playerId = Math.floor(Math.random() * 10000) + 1; // Ensure non-zero ID
      const playerName = "Player" + playerId; // Simple name generation
      console.log(
        `Initializing temporary player: ${playerName} (ID: ${playerId})`,
      );
      dispatch({
        type: "setCurrentPlayer",
        player: {
          id: playerId,
          name: playerName,
          score: 0,
          health: 5, // Standard starting health
          isHost: !joinGameId, // Assume host if creating, not if joining
        },
      });
      // If creating, also add self to players list and set as host
      if (!joinGameId) {
        dispatch({
          type: "addPlayer",
          player: {
            id: playerId,
            name: playerName,
            score: 0,
            health: 5,
            isHost: true,
          },
        });
        dispatch({
          type: "setHost",
          player: {
            id: playerId,
            name: playerName,
            score: 0,
            health: 5,
            isHost: true,
          },
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
    return <div>Initializing...</div>; // Show loading until basic state is set
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
        isPublic={false} // Get from state if implemented: state.isPublicLobby
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
  // For global state, GameProvider should be higher.
  return <GameScreenContent />;
}
