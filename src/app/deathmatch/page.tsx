import { useState, useEffect } from "react";
import { Button } from "@/ui";
import { X, Heart, Trophy, Clock, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Mock data - in a real app, this would come from an API based on the subject ID
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

// Mock players - in a real app, these would be real players in the lobby
const mockPlayers = [
  {
    id: 1,
    name: "Player 1 (You)",
    health: 5,
    isCurrentTurn: true,
    isYou: true,
  },
  { id: 2, name: "ScienceGuru", health: 5, isCurrentTurn: false, isYou: false },
  { id: 3, name: "BioWizard", health: 4, isCurrentTurn: false, isYou: false },
  { id: 4, name: "CellExpert", health: 3, isCurrentTurn: false, isYou: false },
];

export default function DeathmatchGame() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const subjectId = searchParams.get("subjectId") ?? "";

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [players, setPlayers] = useState(mockPlayers);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const currentQuestion = mockGameData.questions[currentQuestionIndex];
  const currentPlayerIndex = players.findIndex((p) => p.isCurrentTurn);
  const currentPlayer = players[currentPlayerIndex];

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

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    // Check if answer is correct
    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    // Update player health if wrong
    if (!isCorrect) {
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex].health -= 1;

      // Check if player is out
      if (updatedPlayers[currentPlayerIndex].health <= 0) {
        updatedPlayers[currentPlayerIndex].health = 0;
      }

      setPlayers(updatedPlayers);
    }

    // After 2 seconds, move to next player or next question
    setTimeout(() => {
      setIsAnswered(false);
      setSelectedOption(null);
      setTimeLeft(15);

      // Move to next player's turn
      const nextPlayerIndex = getNextPlayerIndex(currentPlayerIndex);

      // If everyone has answered, move to next question
      if (nextPlayerIndex <= currentPlayerIndex) {
        if (currentQuestionIndex < mockGameData.questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          // Game over - all questions answered
          endGame();
          return;
        }
      }

      // Update players turn
      const updatedPlayers = [...players].map((p, i) => ({
        ...p,
        isCurrentTurn: i === nextPlayerIndex,
      }));

      // Check if game is over (only one player left)
      const activePlayers = updatedPlayers.filter((p) => p.health > 0);
      if (activePlayers.length === 1) {
        setWinner(activePlayers[0].name);
        setIsGameOver(true);
        return;
      }

      setPlayers(updatedPlayers);
    }, 2000);
  };

  // Get next player who still has health
  const getNextPlayerIndex = (currentIndex: number) => {
    let nextIndex = (currentIndex + 1) % players.length;

    // Find next player who still has health
    while (players[nextIndex].health <= 0 && nextIndex !== currentIndex) {
      nextIndex = (nextIndex + 1) % players.length;
    }

    return nextIndex;
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
            <Button
              variant="normal"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to leave the game?")
                ) {
                  router.push("/game-modes");
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
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
                player.isCurrentTurn
                  ? "bg-theme-orange/10 border-theme-orange animate-pulse-subtle"
                  : player.health <= 0
                    ? "bg-muted/50 text-muted-foreground border-muted"
                    : "bg-card"
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <h3
                  className={`font-semibold ${player.isYou ? "text-theme-purple" : ""}`}
                >
                  {player.name}
                  {player.isCurrentTurn && (
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
                {currentPlayer.isYou
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
                      currentPlayer.isYou && !isAnswered && handleAnswer(index)
                    }
                    disabled={!currentPlayer.isYou || isAnswered}
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
              <Link href="/game-modes">
                <Button
                  className="bg-theme-orange hover:bg-theme-orange/80 gap-2"
                  onClick={() => router.push("/game-modes")}
                >
                  Play Again
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="normal"
                  onClick={() => router.push("/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
