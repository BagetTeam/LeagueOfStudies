import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { GameHeader } from "@/components/GameHeader";
import { BossStatus } from "@/components/BossStatus";
import { TeamStatus } from "@/components/game/TeamStatus";
import { GameTimer } from "@/components/game/GameTimer";
import { GameQuestion } from "@/components/game/GameQuestion";
import { GameOver } from "@/components/game/GameOver";
import { mockGameData, mockPlayers } from "@/data/mockGameData";

const BossFightGame = () => {
  const { subjectId } = useParams();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [players, setPlayers] = useState(mockPlayers);
  const [bossHealth, setBossHealth] = useState(mockGameData.bossHealth);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isTeamVictory, setIsTeamVictory] = useState(false);
  const [bossAttacking, setBossAttacking] = useState(false);
  const [targetPlayerIndex, setTargetPlayerIndex] = useState<number | null>(
    null
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const currentQuestion =
    mockGameData.questions[
      currentQuestionIndex % mockGameData.questions.length
    ];

  useEffect(() => {
    if (isAnswered || isGameOver || bossAttacking) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleBossAttack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, isAnswered, isGameOver, bossAttacking]);

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      const newBossHealth = Math.max(0, bossHealth - 2);
      setBossHealth(newBossHealth);
      setFeedbackMessage("Correct! The boss takes 2 damage!");
      setShowFeedback(true);

      if (newBossHealth <= 0) {
        setIsGameOver(true);
        setIsTeamVictory(true);
        return;
      }

      setTimeout(() => {
        setShowFeedback(false);
        nextQuestion();
      }, 2000);
    } else {
      setFeedbackMessage("Wrong answer! The boss is preparing to attack!");
      setShowFeedback(true);

      setTimeout(() => {
        setBossAttacking(true);
        setShowFeedback(false);

        const targetIndex = Math.floor(Math.random() * players.length);
        setTargetPlayerIndex(targetIndex);

        const updatedPlayers = [...players];
        updatedPlayers[targetIndex].health -= 1;

        const anyPlayersLeft = updatedPlayers.some((p) => p.health > 0);
        if (!anyPlayersLeft) {
          setPlayers(updatedPlayers);
          setIsGameOver(true);
          setIsTeamVictory(false);
          return;
        }

        setPlayers(updatedPlayers);
        setFeedbackMessage(`Boss attacks ${updatedPlayers[targetIndex].name}!`);
        setShowFeedback(true);

        setTimeout(() => {
          setBossAttacking(false);
          setTargetPlayerIndex(null);
          setShowFeedback(false);
          nextQuestion();
        }, 2000);
      }, 2000);
    }
  };

  const handleBossAttack = () => {
    setIsAnswered(true);
    setFeedbackMessage("Time's up! The boss is attacking everyone!");
    setShowFeedback(true);

    setTimeout(() => {
      setBossAttacking(true);
      setShowFeedback(false);

      const updatedPlayers = players.map((p) => ({
        ...p,
        health: Math.max(0, p.health - 1),
      }));

      const anyPlayersLeft = updatedPlayers.some((p) => p.health > 0);
      if (!anyPlayersLeft) {
        setPlayers(updatedPlayers);
        setIsGameOver(true);
        setIsTeamVictory(false);
        return;
      }

      setPlayers(updatedPlayers);
      setFeedbackMessage("Boss attacks all players!");
      setShowFeedback(true);

      setTimeout(() => {
        setBossAttacking(false);
        setShowFeedback(false);
        nextQuestion();
      }, 2000);
    }, 2000);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(20);
  };

  const getBossAttackClass = (playerIndex: number) => {
    if (
      bossAttacking &&
      (targetPlayerIndex === playerIndex || targetPlayerIndex === null)
    ) {
      return "animate-pulse bg-red-100 border-red-400";
    }
    return "";
  };

  return (
    <PageLayout hideFooter>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="container py-4 px-4">
          <GameHeader
            subject={mockGameData.subject}
            topic={mockGameData.topic}
            roundNumber={currentQuestionIndex + 1}
          />

          <div className="mb-8">
            <BossStatus
              bossName={mockGameData.bossName}
              bossHealth={bossHealth}
              maxHealth={mockGameData.bossHealth}
              isAttacking={bossAttacking}
              feedback={feedbackMessage}
              showFeedback={showFeedback}
            />
          </div>

          <TeamStatus
            players={players}
            getBossAttackClass={getBossAttackClass}
          />

          {!isGameOver ? (
            <div className="max-w-3xl mx-auto">
              <GameTimer timeLeft={timeLeft} />

              <GameQuestion
                question={currentQuestion}
                isAnswered={isAnswered}
                selectedOption={selectedOption}
                canAnswer={
                  players[0].health > 0 && !isAnswered && !bossAttacking
                }
                onAnswer={handleAnswer}
              />

              {players[0].health <= 0 && (
                <div className="mt-6 p-3 bg-muted rounded-md text-center">
                  <p className="text-muted-foreground">
                    You've been defeated! Wait for your teammates.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <GameOver
              isVictory={isTeamVictory}
              bossHealth={bossHealth}
              maxBossHealth={mockGameData.bossHealth}
              players={players}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default BossFightGame;
