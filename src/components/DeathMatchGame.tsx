import { Trophy, ArrowLeft, Heart, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useGame } from "@/app/GameContext";

const BROADCAST_EVENTS = {
  START_GAME: "start_game",
  HEALTH_UPDATE: "health_update",
  ANSWER_SUBMITTED: "answer_submitted",
  TURN_ADVANCE: "turn_advance",
  GAME_OVER: "game_over",
};

const mockGameData = {
  subject: "Biology",
  topic: "Cell Structure",
  questions: [
    {
      id: 1,
      question:
        "Which organelle is responsible for protein synthesis in cells?",
      options: ["Mitochondria", "Nucleus", "Ribosome", "Golgi Apparatus"],
      correctAnswer: 2, // Index of the correct answer (Ribosome)
    },
    {
      id: 2,
      question: "What is the powerhouse of the cell?",
      options: ["Ribosome", "Mitochondria", "Endoplasmic Reticulum", "Nucleus"],
      correctAnswer: 1, // Mitochondria
    },
    {
      id: 3,
      question:
        "Which of the following is NOT a function of the cell membrane?",
      options: [
        "Transport of materials",
        "Cell signaling",
        "Energy production",
        "Structural support",
      ],
      correctAnswer: 2, // Energy production
    },
    {
      id: 4,
      question: "Which structure is responsible for cell division?",
      options: ["Lysosome", "Golgi Apparatus", "Centriole", "Vacuole"],
      correctAnswer: 2, // Centriole
    },
    {
      id: 5,
      question: "What is the main function of chloroplasts?",
      options: [
        "Cellular respiration",
        "Photosynthesis",
        "Protein synthesis",
        "Waste removal",
      ],
      correctAnswer: 1, // Photosynthesis
    },
  ],
};

const TURN_DURATION_SECONDS = 15;

const DeathmatchGame = () => {
  const { subjectId } = useParams();
  const { state, dispatch, sendBroadcast } = useGame();
  const {
    currentPlayer, // The user of this client
    players = [], // Default to empty array
    gameMode,
    activePlayerIndex = 0, // Default to 0
    currentQuestionIndex = 0, // Default to 0
    turnStartTime,
    isGameOver,
    winnerId,
  } = state;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnsweredLocally, setIsAnsweredLocally] = useState(false); // If this client just answered
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION_SECONDS);

  const currentQuestion = mockGameData.questions[currentQuestionIndex];
  const activePlayer = players[activePlayerIndex]; // Player whose turn it is

  // Determine the winner's name
  const winner = useMemo(() => {
    if (!isGameOver || winnerId === null) return null;
    return players.find((p) => p.id === winnerId)?.name || "Unknown Winner";
  }, [isGameOver, winnerId, players]);

  useEffect(() => {
    if (isGameOver || turnStartTime === null) {
      setTimeLeft(0); // Ensure timer shows 0 when game over or turn hasn't started
      return;
    }

    const calculateRemainingTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - turnStartTime) / 1000);
      const remaining = TURN_DURATION_SECONDS - elapsed;
      setTimeLeft(Math.max(0, remaining)); // Ensure it doesn't go below 0

      // If time runs out and it's this client's turn, trigger timeout action
      if (
        remaining <= 0 &&
        activePlayer?.id === currentPlayer.id &&
        !isAnsweredLocally
      ) {
        console.log("Time ran out for current player");
        handleAnswer(null); // Trigger timeout (counts as wrong)
      }
    };

    // Set initial time immediately
    calculateRemainingTime();

    // Update timer every second
    const timerInterval = setInterval(calculateRemainingTime, 1000);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(timerInterval);
  }, [
    turnStartTime,
    activePlayer?.id,
    currentPlayer.id,
    isGameOver,
    isAnsweredLocally,
  ]); // Rerun when turn changes or game ends

  // Reset local answer state when the turn changes (new turnStartTime)
  useEffect(() => {
    setIsAnsweredLocally(false);
    setSelectedOption(null);
  }, [turnStartTime]);

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

    sendBroadcast(BROADCAST_EVENTS.ANSWER_SUBMITTED, {
      playerId: currentPlayer.id,
      questionId: currentQuestion.id,
      selectedOptionIndex: optionIndex,
      isCorrect: isCorrect,
    });

    if (isCorrect && activePlayer?.id !== currentPlayer.id) {
      const currentHealth =
        players.find((p) => p.id === activePlayer?.id)?.health ?? 0;
      const newHealth = Math.max(0, currentHealth - 1);
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
      // Recalculate state based on potential health updates
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
        });
        sendBroadcast(BROADCAST_EVENTS.GAME_OVER, {
          winnerId: winnerFound?.id ?? null, // Can be null if everyone died simultaneously (draw)
        });
        return; // Stop further turn advancement
      }

      // Determine Next Player Index
      let nextIndex = (activePlayerIndex + 1) % players.length;
      // Find the next player who is still alive (using the updated player list)
      while (updatedPlayers[nextIndex]?.health <= 0) {
        nextIndex = (nextIndex + 1) % players.length;
        // Safety break to prevent infinite loop if all players somehow have 0 health but game isn't over
        if (nextIndex === activePlayerIndex) {
          console.error("Could not find next player with health!");
          // Potentially trigger game over as a fallback
          dispatch({
            type: "setGameOver",
            winnerId: null, // Use winnerId from payload or null
          });
          sendBroadcast(BROADCAST_EVENTS.GAME_OVER, { winnerId: null });
          return;
        }
      }

      // Determine Next Question Index
      let nextQuestionIdx = currentQuestionIndex;
      // If the cycle comes back to the first player (or the next player index is smaller, indicating a wrap-around)
      // and we haven't reached the end of questions, move to the next question.
      if (
        nextIndex <= activePlayerIndex &&
        currentQuestionIndex < mockGameData.questions.length - 1
      ) {
        nextQuestionIdx = currentQuestionIndex + 1;
        console.log(`Moving to next question: ${nextQuestionIdx}`);
      } else if (
        nextIndex <= activePlayerIndex &&
        currentQuestionIndex >= mockGameData.questions.length - 1
      ) {
        // All questions answered, but more than one player remains? (e.g., health-based win)
        // This scenario might need refinement based on exact win conditions.
        // For now, let's assume the game ends when players run out of health.
        // If win condition is "last one standing after all questions", add logic here.
        console.log("All questions answered, checking remaining players...");
        // Game over check above handles the primary win condition (<=1 player left)
        // If you need a different win condition (e.g., highest health after last question), calculate winner here.
      }

      console.log(
        `Advancing turn: Next Player Index=${nextIndex}, Next Question Index=${nextQuestionIdx}`,
      );
      // Host broadcasts the start of the next turn
      if (
        typeof nextIndex === "number" &&
        typeof nextQuestionIdx === "number" &&
        typeof Date.now() === "number"
      ) {
        dispatch({
          type: "advanceTurn",
          nextPlayerIndex: nextIndex,
          nextQuestionIndex: nextQuestionIdx,
          newTurnStartTime: Date.now(),
        });
      }
      sendBroadcast(BROADCAST_EVENTS.TURN_ADVANCE, {
        nextPlayerIndex: nextIndex,
        nextQuestionIndex: nextQuestionIdx,
        newTurnStartTime: Date.now(), // Start timer for the next turn
      });
    }, 1500); // Delay allows seeing correct/incorrect feedback
  };

  // --- UI Rendering ---
  if (!currentQuestion || !players || players.length === 0) {
    // Handle loading state or error state if question/players aren't available yet
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
                Deathmatch: {mockGameData.subject}{" "}
                {/* Replace with dynamic data */}
              </h1>
              <p className="text-muted-foreground text-sm">
                Topic: {mockGameData.topic} {/* Replace with dynamic data */}
              </p>
            </div>
          </div>
          <div className="bg-muted flex items-center gap-2 rounded-full px-3 py-1.5">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="font-semibold">
              Question {currentQuestionIndex + 1}/
              {mockGameData.questions.length}
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
              <Link
                href="/game"
                /* Or wherever lobby is */ className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Back to Lobby
              </Link>
              <Link
                href="/"
                className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Back to Menu
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeathmatchGame;
