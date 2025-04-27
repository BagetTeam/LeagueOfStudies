import { Trophy, ArrowLeft, Heart, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
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
  const { state, dispatch } = useGame();
  const { currentPlayer, players, gameMode } = state;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [dead, setDead] = useState(0);

  const currentQuestion = mockGameData.questions[currentQuestionIndex];
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const nextPlayerIndex = () => {
    let nextIndex = (currentPlayerIndex + 1) % players.length;

    // Find next player who still has health
    while (players[nextIndex].health <= 0 && nextIndex !== currentPlayerIndex) {
      nextIndex = (nextIndex + 1) % players.length;
    }

    setCurrentPlayerIndex(nextIndex);
  };
  console.log(players, "IM ABT TO BUSSSSS");
  console.log(
    currentPlayer,
    "AGYUWDGYIHDYUGAWIDUHYGAUWDBAWDAWG DIA GWUDGAUD GAUWD GUAW",
  );

  // Timer effect
  useEffect(() => {
    if (isAnswered || isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // If time runs out, count as wrong answer
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, isAnswered, isGameOver]);

  // Handle answer selection
  const handleAnswer = (optionIndex: number | null) => {
    if (isAnswered) return;
    if (
      !players ||
      players.length === 0 ||
      currentPlayerIndex >= players.length ||
      !currentPlayer ||
      !players[currentPlayerIndex]
    ) {
      console.error("Player data is not properly initialized");
      return;
    }
    if (
      !currentPlayer?.id ||
      !players[currentPlayerIndex]?.id ||
      currentPlayer.id != players[currentPlayerIndex].id
    ) {
      return;
    }

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    if (!isCorrect) {
      if (currentPlayer.health > 0) {
        if (currentPlayer.health == 1) {
          setDead(dead + 1);
        }
        dispatch({
          type: "setHealth",
          playerId: currentPlayer.id,
          health: currentPlayer.health - 1,
        });
        dispatch({
          type: "setPlayers",
          players: players.map((player) =>
            player.id === currentPlayer.id
              ? { ...player, health: currentPlayer.health } // Create a *new* player object
              : player,
          ),
        });
      }
    }

    // After 2 seconds, move to next player or next question
    setTimeout(() => {
      setIsAnswered(false);
      setSelectedOption(null);
      setTimeLeft(15);

      // Move to next player's turn
      nextPlayerIndex();

      // If everyone has answered, move to next question
      if (currentPlayerIndex >= players.length || currentPlayerIndex == 0) {
        if (currentQuestionIndex < mockGameData.questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          // Game over - all questions answered
          endGame();
          return;
        }
      }

      // Check if game is over (only one player left)
      // Check if game is over (only one player left)
      if (dead == players.length - 1) {
        setWinner(players[currentPlayerIndex].name);
        setIsGameOver(true);
        return;
      }
    }, 2000);
  };

  // End the game
  const endGame = () => {
    // Find winner (player with most health)
    const sortedPlayers = [...players].sort((a, b) => b.health - a.health);
    setWinner(sortedPlayers[0].name);
    setIsGameOver(true);
  };

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
                Deathmatch: {mockGameData.subject}
              </h1>
              <p className="text-muted-foreground text-sm">
                Topic: {mockGameData.topic}
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
          {players.map((player) => (
            <div
              key={player.id}
              className={`rounded-xl border p-4 ${
                player.id == players[currentPlayerIndex].id
                  ? "bg-theme-orange/10 border-theme-orange animate-pulse-subtle"
                  : player.health <= 0
                    ? "bg-muted/50 text-muted-foreground border-muted"
                    : "bg-card"
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <h3
                  className={`font-semibold ${
                    player.id == currentPlayer.id ? "text-theme-purple" : ""
                  }`}
                >
                  {player.name}
                  {player.id == players[currentPlayerIndex].id && (
                    <span className="text-theme-orange ml-1">(Turn)</span>
                  )}
                </h3>
                {player.health <= 0 && (
                  <div className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                    Out
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-4 w-4 ${
                      i < player.health
                        ? "fill-red-500 text-red-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
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
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    strokeWidth="8"
                    stroke={timeLeft <= 5 ? "#ef4444" : "#9b87f5"}
                    fill="transparent"
                    strokeDasharray={36 * 2 * Math.PI}
                    strokeDashoffset={36 * 2 * Math.PI * (1 - timeLeft / 15)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className={timeLeft <= 5 ? "text-red-500" : ""}>
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="game-card mb-8">
              <h2 className="mb-2 text-xl font-semibold md:text-2xl">
                {currentQuestion.question}
              </h2>
              <p className="text-muted-foreground mb-4">
                {currentPlayer.id == players[currentPlayerIndex].id
                  ? "Your turn! Select an answer:"
                  : `${currentPlayer.name}'s turn`}
              </p>

              {/* Answer options */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`rounded-xl border p-4 text-left transition ${
                      isAnswered && selectedOption === index
                        ? index === currentQuestion.correctAnswer
                          ? "border-green-400 bg-green-100 text-green-800"
                          : "border-red-400 bg-red-100 text-red-800"
                        : isAnswered && index === currentQuestion.correctAnswer
                          ? "border-green-400 bg-green-100 text-green-800"
                          : "hover:bg-muted"
                    }`}
                    onClick={() =>
                      currentPlayer.id == players[currentPlayerIndex].id &&
                      !isAnswered &&
                      handleAnswer(index)
                    }
                    disabled={
                      currentPlayer.id != players[currentPlayerIndex].id ||
                      isAnswered
                    }
                  >
                    <span className="mr-2 font-semibold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="game-card mx-auto max-w-2xl text-center">
            <div className="mb-6">
              <Trophy className="text-theme-orange mx-auto mb-4 h-16 w-16" />
              <h2 className="mb-2 text-3xl font-bold">Game Over!</h2>
              <p className="text-xl">
                {winner === "Player 1 (You)"
                  ? "Congratulations! You won the game!"
                  : `${winner} has won the game!`}
              </p>
            </div>

            <div className="mb-6 flex flex-col items-center gap-4">
              <h3 className="font-semibold">Final Results</h3>
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 text-lg"
                >
                  {player.name === winner && (
                    <Trophy className="text-theme-orange h-4 w-4" />
                  )}
                  <span className={player.name === winner ? "font-bold" : ""}>
                    {player.name}: {player.health}{" "}
                    {player.health === 1 ? "health" : "health"} remaining
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="bg-theme-orange hover:bg-theme-orange/80 gap-2"
              >
                Play Again
              </Link>
              <Link href={"/dashboard"}>Back to Dashboard</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeathmatchGame;
