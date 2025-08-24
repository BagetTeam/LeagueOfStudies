"use client";

import { Trophy, ArrowLeft, Heart, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useGame } from "@/GameContext";
import { Button } from "@/ui";

const BROADCAST_EVENTS = {
  START_GAME: "start_game",
  HEALTH_UPDATE: "health_update",
  PLAYER_ANSWERED: "answer_submitted",
  TURN_ADVANCE: "turn_advance",
  GAME_OVER: "game_over",
  RESTART_GAME: "restart_game",
};

const DeathmatchGame = () => {
  const router = useRouter();
  const sp = useSearchParams();
  const subject = sp.get("subject") ?? "Rust";

  const { gameState, dispatch, sendBroadcast } = useGame();
  const { player, lobby } = gameState;
  const { players, currentQuestionIndex, turnStartTime, questions, gameMode } =
    lobby;

  if (gameMode.type !== "deathmatch") {
    return <div>Loading game... (Ensure game started correctly)</div>;
  }

  const { time: TURN_DURATION_SECONDS, activePlayerIndex } = gameMode.data;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnsweredLocally, setIsAnsweredLocally] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION_SECONDS);
  const [isResolvingRound, setIsResolvingRound] = useState(false);

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex % questions.length],
    [currentQuestionIndex],
  );

  const activePlayer = useMemo(
    () => players[activePlayerIndex],
    [activePlayerIndex],
  );

  const isGameOver = !players.find((p) => p.state === "playing");

  // Determine the winner's name
  const winner = useMemo(() => {
    if (!isGameOver) return null;
    return (
      players.find((p) => p.state === "completed" && p.health > 0)?.name ||
      "Unknown Winner"
    );
  }, [isGameOver, players]);

  // clear all states when question changes (turnStartTime change)
  useEffect(() => {
    setIsAnsweredLocally(false);
    setSelectedOption(null);
    setIsResolvingRound(false);
  }, [turnStartTime]);

  // handle setting and calculating Time
  useEffect(() => {
    if (isGameOver || turnStartTime === null || isResolvingRound) {
      setTimeLeft(0);
      return;
    }

    const calculateRemainingTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - turnStartTime) / 1000);
      const remaining = TURN_DURATION_SECONDS - elapsed;
      setTimeLeft(Math.max(0, remaining));

      // Check if time ran out
      if (
        remaining <= 0 &&
        activePlayer.playerId === player.playerId &&
        !isAnsweredLocally &&
        !isGameOver &&
        !isResolvingRound
      ) {
        handleAnswer(null); // Submit a timeout answer (null = incorrect)
      }
    };

    calculateRemainingTime();
    const timerInterval = setInterval(calculateRemainingTime, 1000);

    return () => clearInterval(timerInterval);
  }, [
    turnStartTime,
    isGameOver,
    isAnsweredLocally,
    activePlayer,
    isResolvingRound,
  ]); // Rerun when turn changes or game ends

  // --- Answer Handling ---
  const handleAnswer = (optionIndex: number | null) => {
    if (isAnsweredLocally || cannotAnswerNow || isGameOver) {
      console.log("Answer blocked:", {
        isAnsweredLocally,
        isMyTurn: activePlayer?.id === currentPlayer.id,
        isGameOver,
      });
      return;
    }

    console.log(
      `Player ${currentPlayer.id} answered with option: ${optionIndex}`,
    );
    setIsAnsweredLocally(true); // Mark locally that an answer was submitted for this turn
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    if (isCorrect && activePlayer?.id !== currentPlayer.id) {
      const currentHealth =
        players.find((p) => p.id === activePlayer?.id)?.health ?? 0;
      const newHealth = Math.max(0, currentHealth - 1);
      console.log(
        `Broadcasting health update for ${activePlayer.id}: ${newHealth}`,
      );

      dispatch({
        type: "setHealth",
        playerId: activePlayer?.id,
        health: newHealth,
      });
      sendBroadcast(BROADCAST_EVENTS.HEALTH_UPDATE, {
        playerId: activePlayer?.id,
        newHealth: newHealth,
      });
    }
    if (!isCorrect) {
      const currentHealth =
        players.find((p) => p.id === currentPlayer.id)?.health ?? 0;
      const newHealth = Math.max(0, currentHealth - 1);
      console.log(
        `Broadcasting health update for ${currentPlayer.id}: ${newHealth}`,
      );
      // Host broadcasts the authoritative health update
      dispatch({
        type: "setHealth",
        playerId: currentPlayer.id,
        health: newHealth,
      });
      sendBroadcast(BROADCAST_EVENTS.HEALTH_UPDATE, {
        playerId: currentPlayer.id,
        newHealth: newHealth,
      });
    }

    // --- Turn Advancement & Game Over Check (Simulated Host Logic) ---
    // Introduce a small delay to allow UI feedback before advancing
    setTimeout(() => {
      // Recalculate gameState based on potential health updates
      const updatedPlayers = players.map((p) =>
        p.id === currentPlayer.id && !isCorrect
          ? { ...p, health: Math.max(0, (p.health ?? 0) - 1) }
          : p,
      );

      const playersWithHealth = updatedPlayers.filter((p) => p.health > 0);
      console.log("Players with health:", playersWithHealth);

      // Check for Game Over
      if (playersWithHealth.length <= 1) {
        const winnerFound =
          playersWithHealth.length === 1 ? playersWithHealth[0] : null;
        console.log(`Game Over! Winner ID: ${winnerFound?.id}`);
        dispatch({
          type: "setGameOver",
          winnerId: winnerFound?.id ?? null, // Use winnerId from payload or null
          isGameOver: true,
        });
        sendBroadcast(BROADCAST_EVENTS.GAME_OVER, {
          winnerId: winnerFound?.id ?? null, // Can be null if everyone died simultaneously (draw)
          isGameOver: true,
        });
        return; // Stop further turn advancement
      }

      let nextIndex = (activePlayerIndex + 1) % players.length;
      // Find the next player who is still alive (using the updated player list)
      while (updatedPlayers[nextIndex]?.health <= 0) {
        nextIndex = (nextIndex + 1) % players.length;

        if (nextIndex === activePlayerIndex) {
          console.error("Could not find next player with health!");
          dispatch({
            type: "setGameOver",
            winnerId: null,
            isGameOver: true,
          });
          sendBroadcast(BROADCAST_EVENTS.GAME_OVER, {
            winnerId: null,
            isGameOver: true,
          });
          return;
        }
      }

      let nextQuestionIdx = currentQuestionIndex + 1;
      // If the cycle comes back to the first player (or the next player index is smaller, indicating a wrap-around)
      // and we haven't reached the end of questions, move to the next question.
      if (currentQuestionIndex >= questions.length) {
        //TODO ALL ANSWERS QUESTIONS (restart questions or end??)
        console.log("All questions answered, checking remaining players...");

        //temp
        nextQuestionIdx = 0;
      }

      console.log(
        `Advancing turn: Next Player Index=${nextIndex}, Next Question Index=${nextQuestionIdx}`,
      );
      // Host broadcasts the start of the next turn

      dispatch({
        type: "advanceTurn",
        nextPlayerIndex: nextIndex,
        nextQuestionIndex: nextQuestionIdx,
        newTurnStartTime: Date.now(),
      });

      sendBroadcast(BROADCAST_EVENTS.TURN_ADVANCE, {
        nextPlayerIndex: nextIndex,
        nextQuestionIndex: nextQuestionIdx,
        newTurnStartTime: Date.now(), // Start timer for the next turn
      });
    }, 1500); // Delay allows seeing correct/incorrect feedback
  };

  const onRestartGame = () => {
    console.log("Restarting game right neow");
    dispatch({
      type: "restartGame",
    });

    sendBroadcast(BROADCAST_EVENTS.RESTART_GAME, {});
  };

  // --- UI Rendering ---
  if (!currentQuestion || !players || players.length === 0) {
    return <div>Loading game...</div>;
  }

  const isMyTurn = activePlayer?.id === currentPlayer.id;
  const cannotAnswerNow =
    activePlayer?.id !== currentPlayer.id &&
    Math.floor((Date.now() - turnStartTime!) / 1000) < 2;

  return (
    <div className="from-background to-muted min-h-screen bg-gradient-to-b">
      <div className="container px-4 py-4">
        {/* Game header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={"/"}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-semibold">
                <Trophy className="text-theme-orange h-5 w-5" />
                Deathmatch:
                {subject} {/* Replace with dynamic data */}
              </h1>
              {/* <p className="text-muted-foreground text-sm"> */}
              {/*   Topic: {mockGameData.topic} {/* Replace with dynamic data */}
              {/* </p> */}
            </div>
          </div>
          <div className="bg-muted flex items-center gap-2 rounded-full px-3 py-1.5">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="font-semibold">
              Question {currentQuestionIndex + 1}
            </span>
          </div>
        </div>

        {/* Players status */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`rounded-xl border p-4 ${
                index === activePlayerIndex && !isGameOver // Highlight active player
                  ? "bg-theme-orange/10 border-theme-orange animate-pulse-subtle"
                  : player.health <= 0 // Dim eliminated players
                    ? "bg-muted/50 text-muted-foreground border-muted opacity-60"
                    : index === currentPlayer.id
                      ? "bg-blue-600"
                      : "bg-card" // Default card style
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <h3
                  className={`font-semibold ${
                    player.id === currentPlayer.id ? "text-theme-purple" : "" // Highlight local player's name
                  }`}
                >
                  {player.name}
                  {index === activePlayerIndex && !isGameOver && (
                    <span className="text-theme-orange ml-1">(Turn)</span>
                  )}
                  {player.id === currentPlayer.id && (
                    <span className="ml-1 text-blue-500">(You)</span>
                  )}
                </h3>
                {player.health <= 0 && (
                  <div className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                    Out
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map(
                  (
                    _,
                    i, // Assuming max 5 health
                  ) => (
                    <Heart
                      key={i}
                      className={`h-4 w-4 ${
                        i < (player.health ?? 0) // Use nullish coalescing for safety
                          ? "fill-red-500 text-red-500"
                          : "text-gray-300"
                      }`}
                    />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Game content */}
        {!isGameOver ? (
          <div className="mx-auto max-w-3xl">
            {/* Timer */}
            <div className="mb-6 flex justify-center">
              <div className="bg-muted relative flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold">
                <svg className="absolute top-0 left-0 h-20 w-20 -rotate-90 transform">
                  <circle // Background track
                    cx="40"
                    cy="40"
                    r="36"
                    strokeWidth="8"
                    stroke="#e5e7eb" // Example: gray-200
                    fill="transparent"
                  />
                  <circle // Foreground progress
                    cx="40"
                    cy="40"
                    r="36"
                    strokeWidth="8"
                    stroke={timeLeft <= 5 ? "#ef4444" : "#9b87f5"} // Red when low, theme otherwise
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 36}
                    strokeDashoffset={
                      2 * Math.PI * 36 * (1 - timeLeft / TURN_DURATION_SECONDS)
                    }
                    strokeLinecap="round" // Makes the ends rounded
                    style={{
                      transition:
                        "stroke-dashoffset 1s linear, stroke 0.3s ease",
                    }} // Smooth transitions
                  />
                </svg>
                <span className={timeLeft <= 5 ? "text-red-500" : ""}>
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="game-card bg-card mb-8 rounded-lg border p-6 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold md:text-2xl">
                {currentQuestion.question}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isMyTurn
                  ? "Your turn! Select an answer:"
                  : activePlayer
                    ? `${activePlayer.name}'s turn`
                    : "Waiting..."}
              </p>

              {/* Answer options */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrectAnswer =
                    index === currentQuestion.correctAnswer;
                  let buttonClass = "border-muted hover:bg-muted"; // Default

                  if (isAnsweredLocally && isMyTurn) {
                    // Feedback for the player who just answered
                    if (isSelected) {
                      buttonClass = isCorrectAnswer
                        ? "border-green-400 bg-green-100 text-green-800 ring-2 ring-green-300" // Correct selected
                        : "border-red-400 bg-red-100 text-red-800 ring-2 ring-red-300"; // Incorrect selected
                    } else if (isCorrectAnswer) {
                      buttonClass =
                        "border-green-400 bg-green-100/50 text-green-700"; // Show correct if wrong was selected
                    }
                  } else if (!isMyTurn && isAnsweredLocally) {
                    // Maybe subtle feedback for others if needed, or none
                  }

                  return (
                    <button
                      key={index}
                      className={`rounded-xl border p-4 text-left transition duration-150 ease-in-out ${buttonClass} ${(!isMyTurn && cannotAnswerNow) || isAnsweredLocally ? "cursor-not-allowed bg-gray-400 opacity-80" : "hover:scale-105"}`}
                      onClick={() => handleAnswer(index)}
                      disabled={
                        (!isMyTurn && cannotAnswerNow) ||
                        isAnsweredLocally ||
                        isGameOver
                      }
                    >
                      <span className="mr-2 font-semibold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // --- Game Over Screen ---
          <div className="game-card bg-card mx-auto max-w-2xl rounded-lg border p-8 text-center shadow-lg">
            <div className="mb-6">
              <Trophy className="text-theme-orange mx-auto mb-4 h-16 w-16 animate-bounce" />
              <h2 className="mb-2 text-3xl font-bold">Game Over!</h2>
              <p className="text-muted-foreground text-xl">
                {winner ? `${winner} has won the game!` : "It's a draw!"}
              </p>
              {winnerId === currentPlayer.id && (
                <p className="mt-2 text-lg font-semibold text-green-600">
                  Congratulations!
                </p>
              )}
            </div>

            <div className="mb-8 flex flex-col items-center gap-3">
              <h3 className="mb-2 border-b pb-1 text-lg font-semibold">
                Final Results
              </h3>
              {players
                .sort((a, b) => (b.health ?? 0) - (a.health ?? 0)) // Sort by health descending
                .map((player) => (
                  <div
                    key={player.id}
                    className={`text-md flex w-full items-center justify-center gap-3 rounded p-2 ${player.id === winnerId ? "bg-yellow-100" : ""}`}
                  >
                    {player.id === winnerId && (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    )}
                    <span
                      className={`${player.id === winnerId ? "font-bold" : ""} ${player.health <= 0 ? "text-muted-foreground line-through" : ""}`}
                    >
                      {player.name}: {player.health ?? 0} health remaining
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {/* Optional: Add a button to go back to lobby or dashboard */}
              <Button
                onClick={onRestartGame}
                /* Or wherever lobby is */ className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Back to Lobby
              </Button>
              <Button
                onClick={() => router.push("/")}
                className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Back to Menu
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeathmatchGame;
