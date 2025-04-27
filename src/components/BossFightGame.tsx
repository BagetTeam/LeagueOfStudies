"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { GameHeader } from "@/components/GameHeader";
import { BossStatus } from "@/components/BossStatus";
import { TeamStatus } from "@/components/TeamStatus";
import { GameTimer } from "@/components/GameTimer";
import { GameQuestion } from "@/components/GameQuestions";
import { GameOver } from "@/components/GameOver";
import { mockGameData, mockPlayers } from "@/data/mockGameData";
import { useGame } from "@/app/GameContext";

const BROADCAST_EVENTS = {
  PLAYER_ANSWERED: "player_answered",
  QUESTION_START: "question_start",
  BOSS_DAMAGED: "boss_damaged",
  TEAM_DAMAGED: "team_damaged",
  BOSS_FIGHT_GAME_OVER: "boss_fight_game_over",
};

const TURN_DURATION_SECONDS = 10;

const BossFightGame = () => {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId") ?? "";

  const { state, dispatch, sendBroadcast } = useGame();
  const {
    currentPlayer,
    players = [],
    gameMode,
    currentQuestionIndex = 0,
    turnStartTime, // Represents Question Start Time
    isGameOver,
    bossHealth, // Get from shared state
    playerAnswers = {}, // Get from shared state
    isTeamVictory, // Get from shared state
  } = state;

  // Local state for this client's interaction & UI feedback
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnsweredLocally, setIsAnsweredLocally] = useState(false); // Has *this* client answered the current question?
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION_SECONDS);
  const [feedbackMessage, setFeedbackMessage] = useState(""); // For local feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [isResolvingRound, setIsResolvingRound] = useState(false); // Prevent actions during resolution

  // Derive current question based on shared index
  const currentQuestion = useMemo(
    () =>
      mockGameData.questions[
        currentQuestionIndex % mockGameData.questions.length
      ],
    [currentQuestionIndex],
  );

  // --- Timer Logic ---
  useEffect(() => {
    // Reset local answered state when the question changes (new turnStartTime)
    setIsAnsweredLocally(false);
    setSelectedOption(null);
    setFeedbackMessage(""); // Clear feedback
    setShowFeedback(false);
    setIsResolvingRound(false); // Ready for new round actions
    console.log(
      `New question started (Q index: ${currentQuestionIndex}). Resetting local state.`,
    );
  }, [turnStartTime]); // Triggered by QUESTION_START broadcast setting new turnStartTime

  useEffect(() => {
    if (isGameOver || turnStartTime === null || isResolvingRound) {
      setTimeLeft(0);
      return; // Stop timer if game over, question not started, or round is resolving
    }

    const calculateRemainingTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - turnStartTime) / 1000);
      const remaining = TURN_DURATION_SECONDS - elapsed;
      setTimeLeft(Math.max(0, remaining));

      // Check if time ran out *for this client*
      if (remaining <= 0 && !isAnsweredLocally && !isGameOver) {
        console.log(
          `Time ran out for local player ${currentPlayer.id} on Q#${currentQuestionIndex}`,
        );
        handleAnswer(null); // Submit a timeout answer (null = incorrect)
      }
    };

    calculateRemainingTime(); // Initial calculation
    const timerInterval = setInterval(calculateRemainingTime, 1000);

    return () => clearInterval(timerInterval);
  }, [
    turnStartTime,
    isGameOver,
    isAnsweredLocally,
    currentPlayer.id,
    currentQuestionIndex,
    isResolvingRound,
  ]);

  // --- Handle Local Answer Submission ---
  const handleAnswer = (optionIndex: number | null) => {
    console.log(optionIndex, "ERM");
    // Prevent answering multiple times, if already answered, if dead, or during resolution phase
    if (
      isAnsweredLocally ||
      currentPlayer.health <= 0 ||
      isResolvingRound ||
      isGameOver
    ) {
      console.log("Answer prevented:", {
        isAnsweredLocally,
        health: currentPlayer.health,
        isResolvingRound,
        isGameOver,
      });
      return;
    }

    setIsAnsweredLocally(true); // Mark locally as answered
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    console.log(
      `Local Player ${currentPlayer.id} answered Q#${currentQuestionIndex}. Correct: ${isCorrect} (Option: ${optionIndex})`,
    );
    setFeedbackMessage("Answer submitted! Waiting for team...");
    setShowFeedback(true);

    // Broadcast the answer
    dispatch({
      type: "recordPlayerAnswer",
      playerId: currentPlayer.id,
      questionIndex: currentQuestionIndex,
      isCorrect: isCorrect,
    });
    sendBroadcast(BROADCAST_EVENTS.PLAYER_ANSWERED, {
      playerId: currentPlayer.id,
      questionIndex: currentQuestionIndex, // Send index to prevent processing stale answers
      isCorrect: isCorrect,
    });

    // Host logic will handle aggregation and outcome (see useEffect below)
  };

  // --- HOST ONLY: Round Resolution Logic ---
  useEffect(() => {
    // Only the host should perform this logic
    if (
      !currentPlayer.isHost ||
      isGameOver ||
      turnStartTime === null ||
      isResolvingRound
    ) {
      return;
    }

    const activePlayers = players.filter((p) => p.health > 0); // Get currently living players
    const activePlayers_ids = new Set(activePlayers.map((p) => p.id));

    // Check if round needs resolution
    const timeExpired =
      Date.now() >= turnStartTime + TURN_DURATION_SECONDS * 1000;
    const allLivingPlayersAnswered = activePlayers.every(
      (p) => playerAnswers[p.id]?.answered,
    );

    if (timeExpired || allLivingPlayersAnswered) {
      console.log(
        `--- Host ${currentPlayer.id}: Resolving Round Q#${currentQuestionIndex} ---`,
      );
      console.log(
        "Reason:",
        timeExpired ? "Time Expired" : "All Living Players Answered",
      );
      console.log("Living Players:", activePlayers_ids);
      console.log("Current Answers State:", playerAnswers);

      setIsResolvingRound(true); // Prevent further actions during resolution broadcast cascade

      let allCorrect = true;
      const healthUpdates: { [playerId: number]: number } = {};

      // Evaluate answers of living players
      activePlayers.forEach((player) => {
        const answer = playerAnswers[player.id];
        // If time expired and player didn't answer, OR if they answered incorrectly
        if (
          (timeExpired && !answer?.answered) ||
          (answer?.answered && answer.isCorrect === false)
        ) {
          allCorrect = false;
          console.log(
            `Player ${player.id} failed (Expired: ${timeExpired && !answer?.answered}, Incorrect: ${answer?.answered && answer.isCorrect === false})`,
          );
        } else if (!answer?.answered && !timeExpired) {
          // Should not happen if triggered by allLivingPlayersAnswered, but safety check
          allCorrect = false;
          console.warn(
            `Player ${player.id} has not answered, but resolution triggered early?`,
          );
        } else {
          console.log(`Player ${player.id} succeeded.`);
        }
      });

      // Determine outcome
      if (allCorrect && activePlayers.length > 0) {
        // --- SUCCESS: Damage Boss ---
        const damage = 10 * activePlayers.length; // Example: Damage scales with living players
        const newBossHealth = Math.max(0, (bossHealth ?? 0) - damage);
        console.log(
          `Host: All correct! Damaging boss. New health: ${newBossHealth}`,
        );
        dispatch({
          type: "setBossHealth",
          newBossHealth: newBossHealth,
        });
        sendBroadcast(BROADCAST_EVENTS.BOSS_DAMAGED, { newBossHealth });

        if (newBossHealth <= 0) {
          console.log("Host: Boss defeated! Broadcasting Game Over.");
          dispatch({
            type: "setBossFightGameOver",
            isVictory: false,
          });
          sendBroadcast(BROADCAST_EVENTS.BOSS_FIGHT_GAME_OVER, {
            isVictory: true,
          });
          // No need to start next question
          return; // Exit useEffect early
        }
      } else {
        // --- FAILURE: Damage Team ---
        console.log("Host: Someone failed! Damaging team.");
        activePlayers.forEach((player) => {
          healthUpdates[player.id] = Math.max(0, player.health - 1); // Calculate damage
        });
        dispatch({
          type: "updateMultiplePlayerHealth",
          healthUpdates: healthUpdates,
        });
        sendBroadcast(BROADCAST_EVENTS.TEAM_DAMAGED, { healthUpdates });

        // Check if team wiped
        const teamWiped = activePlayers.every(
          (p) => (healthUpdates[p.id] ?? p.health) <= 0,
        );
        if (teamWiped) {
          console.log("Host: Team wiped! Broadcasting Game Over.");
          dispatch({
            type: "setBossFightGameOver",
            isVictory: false,
          });
          sendBroadcast(BROADCAST_EVENTS.BOSS_FIGHT_GAME_OVER, {
            isVictory: false,
          });
          // No need to start next question
          return; // Exit useEffect early
        }
      }

      // --- Start Next Question (if game not over) ---
      console.log("Host: Starting next question.");
      // Add a small delay before starting next question to allow UI updates
      setTimeout(() => {
        dispatch({
          type: "advanceTurn", // Or rename action if preferred e.g., 'advanceBossQuestion'
          nextPlayerIndex: -1, // Not relevant here
          nextQuestionIndex: currentQuestionIndex + 1,
          newTurnStartTime: Date.now(),
        });
        sendBroadcast(BROADCAST_EVENTS.QUESTION_START, {
          nextQuestionIndex: currentQuestionIndex + 1,
          newTurnStartTime: Date.now(),
        });
        // Note: setIsResolvingRound(false) happens in the useEffect watching turnStartTime
      }, 2000); // 2-second delay
    } // end if(timeExpired || allLivingPlayersAnswered)
  }, [
    currentPlayer.isHost,
    isGameOver,
    turnStartTime,
    players, // Need to react to health changes
    playerAnswers, // Need to react to answers coming in
    currentQuestionIndex,
    bossHealth,
    sendBroadcast,
    isResolvingRound,
  ]);

  // --- UI Rendering ---

  if (!currentQuestion || !players || typeof bossHealth !== "number") {
    // Handle loading state or error state if question/players/bossHealth aren't available yet
    return <div>Loading game... (Ensure game started correctly)</div>;
  }

  // Can this player answer? (Alive and hasn't answered this round)
  const canAnswer =
    currentPlayer.health > 0 &&
    !isAnsweredLocally &&
    !isResolvingRound &&
    !isGameOver;

  return (
    <div className="from-background to-muted min-h-screen bg-gradient-to-b">
      <div className="container px-4 py-4">
        <GameHeader
          subject={mockGameData.subject}
          topic={mockGameData.topic}
          roundNumber={currentQuestionIndex + 1}
        />

        <div className="mb-8">
          <BossStatus
            bossName={mockGameData.bossName}
            bossHealth={bossHealth}
            maxHealth={mockGameData.bossHealth} // Assuming initial health is max
            isAttacking={false} // Attack animation could be triggered by TEAM_DAMAGED broadcast maybe?
            feedback={feedbackMessage}
            showFeedback={showFeedback}
          />
        </div>

        {/* TeamStatus might need slight adjustment if getBossAttackClass is removed/changed */}
        <TeamStatus players={players} getBossAttackClass={() => ""} />

        {!isGameOver ? (
          <div className="mx-auto max-w-3xl">
            <GameTimer timeLeft={timeLeft} />

            <GameQuestion
              question={currentQuestion}
              isAnswered={isAnsweredLocally} // Show feedback based on local answer status
              selectedOption={selectedOption}
              canAnswer={canAnswer}
              onAnswer={handleAnswer}
            />

            {currentPlayer.health <= 0 && !isGameOver && (
              <div className="bg-muted mt-6 rounded-md p-3 text-center">
                <p className="text-muted-foreground">
                  You've been defeated! Wait for your teammates.
                </p>
              </div>
            )}
            {/* Indicate waiting state */}
            {isAnsweredLocally && !isResolvingRound && (
              <div className="bg-muted mt-6 rounded-md p-3 text-center">
                <p className="text-muted-foreground animate-pulse">
                  Waiting for other players...
                </p>
              </div>
            )}
          </div>
        ) : (
          // Use isTeamVictory from state
          <GameOver
            isVictory={isTeamVictory ?? false} // Default to false if null somehow
            bossHealth={bossHealth}
            maxBossHealth={mockGameData.bossHealth}
            players={players}
          />
        )}
      </div>
    </div>
  );
};

export default BossFightGame;
