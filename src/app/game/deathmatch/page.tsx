"use client";

import { Trophy, ArrowLeft, Heart, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useGame } from "@/GameContext";
import { Button } from "@/ui";
import { createBroadcastPayload } from "@/utils/utils";
import { BROADCAST_EVENTS } from "@/GameContext";

export default function DeathmatchGame() {
  const router = useRouter();

  const { gameState, dispatch, sendBroadcast, broadcastAndDispatch } =
    useGame();
  const { player, lobby } = gameState;
  const {
    players,
    currentQuestionIndex,
    turnStartTime,
    questions,
    gameMode,
    subject,
  } = lobby;

  if (gameMode.type !== "deathmatch") {
    return <div>Loading game... (Ensure game started correctly)</div>;
  }

  const { time: TURN_DURATION_SECONDS, activePlayerIndex } = gameMode.data;
  const GRACE_PERIOD = 2;

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
  ]);

  const isMyTurn = activePlayer.playerId === player.playerId;
  const cannotAnswerNow =
    activePlayer.playerId !== player.playerId &&
    turnStartTime &&
    (Date.now() - turnStartTime) / 1000 < GRACE_PERIOD;

  const handleAnswer = (optionIndex: number | null) => {
    if (isAnsweredLocally || cannotAnswerNow || isGameOver) {
      return;
    }

    const playersAlive = players.filter((p) => {
      p.state === "playing" && p.health > 0;
    });

    setIsAnsweredLocally(true);
    setSelectedOption(optionIndex);

    const { event, payload } = createBroadcastPayload(
      BROADCAST_EVENTS.submitAnswerDeathmatch,
      {
        answeringPlayerId: player.playerId,
        currentQuestionIndex: currentQuestionIndex,
        currentPlayerIndex: activePlayerIndex,
        optionIndex: optionIndex ?? -1,
      },
    );
    broadcastAndDispatch(event, payload);

    handleTurnAdvancement();
  };

  const handleTurnAdvancement = (nextIndex: number) => {
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

    const { event, payload } = createBroadcastPayload(
      BROADCAST_EVENTS.advanceTurnDeathmatch,
      {
        currentPlayerIndex: nextIndex,
        currentQuestionIndex: nextQuestionIdx,
        startTime: Date.now(),
      },
    );
    broadcastAndDispatch(event, payload);
  };
  // --- UI Rendering ---
  if (!currentQuestion || !players || players.length === 0) {
    return <div>Loading game...</div>;
  }

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
                    transition: "stroke-dashoffset 1s linear, stroke 0.3s ease",
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
                const isCorrectAnswer = index === currentQuestion.correctAnswer;
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
      </div>
    </div>
  );
}
