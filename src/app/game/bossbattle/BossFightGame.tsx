"use client";

import { useState, useEffect, useMemo } from "react";
import { GameHeader } from "@/components/GameHeader";
import { BossStatus } from "@/app/game/bossbattle/components/BossStatus";
import { TeamStatus } from "@/app/game/bossbattle/components/TeamStatus";
import { GameTimer } from "@/components/GameTimer";
import { GameQuestion } from "@/components/GameQuestions";
import { GameOver } from "@/app/game/game-over/page";
import { useGame } from "@/GameContext";
import { useAuth0 } from "@auth0/auth0-react";
import { updateLeaderboard } from "@/backend/db/leaderboard";
import { BROADCAST_EVENTS } from "@/GameContext";
import { createBroadcastPayload } from "@/utils/utils";

const XP_GAIN_ON_WIN = 500;
const XP_LOSS_ON_LOSE = -200;

const BossFightGame = () => {
  const { gameState, dispatch, sendBroadcast, broadcastAndDispatch } =
    useGame();
  const { player, lobby } = gameState;
  const {
    players,
    currentQuestionIndex,
    turnStartTime,
    gameMode,
    playerAnswers,
    questions,
  } = lobby;

  if (gameMode.type !== "bossfight") {
    return <div>ERROR!! RESTART GAME</div>;
  }

  const { time: TURN_DURATION_SECONDS, bossName, bossHealth } = gameMode.data;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnsweredLocally, setIsAnsweredLocally] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION_SECONDS);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isResolvingRound, setIsResolvingRound] = useState(false);

  const [xpUpdateAttempted, setXpUpdateAttempted] = useState(false);

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex % questions.length],
    [currentQuestionIndex],
  );

  const isGameOver = !players.find((p) => p.state === "playing");

  // clear all states when question changes (turnStartTime change)
  useEffect(() => {
    setIsAnsweredLocally(false);
    setSelectedOption(null);
    setFeedbackMessage("");
    setShowFeedback(false);
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
        !isAnsweredLocally &&
        !isGameOver &&
        !isResolvingRound
      ) {
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
    currentQuestionIndex,
    isResolvingRound,
  ]);

  const handleAnswer = (optionIndex: number | null) => {
    if (
      isAnsweredLocally ||
      player.health <= 0 ||
      isResolvingRound ||
      isGameOver
    ) {
      return;
    }

    setIsAnsweredLocally(true);
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    setFeedbackMessage("Answer submitted! Waiting for team...");
    setShowFeedback(true);

    // Broadcast the answer
    const { event, payload } = createBroadcastPayload(
      BROADCAST_EVENTS.PLAYER_ANSWERED,
      {
        playerId: player.playerId,
        questionIndex: currentQuestionIndex,
        isCorrect: isCorrect,
      },
    );
    broadcastAndDispatch(event, payload);
  };

  // --- HOST ONLY: Round Resolution Logic ---
  useEffect(() => {
    if (
      !player.isHost ||
      isGameOver ||
      turnStartTime === null ||
      isResolvingRound
    ) {
      return;
    }

    const activePlayers = players.filter((p) => p.state === "playing"); // Get currently living players
    const allAnsweredPlayerId = new Set(Object.keys(playerAnswers));

    const timeExpired = timeLeft <= 0;
    const allPlayersAnswered = activePlayers.every((p) =>
      allAnsweredPlayerId.has(p.playerId),
    );

    // resolve round -> advance to next round
    if (timeExpired || allPlayersAnswered) {
      setIsResolvingRound(true);

      const allPlayerAnswersCorrect = activePlayers.every(
        (p) => playerAnswers[p.playerId].isCorrect,
      );

      // -- Determine outcome --
      if (allPlayerAnswersCorrect && activePlayers.length > 0) {
        // SUCCESS -> Damage Boss
        const damage = 10 * activePlayers.length;
        const newBossHealth = Math.max(0, (bossHealth ?? 0) - damage);

        const { event, payload } = createBroadcastPayload(
          BROADCAST_EVENTS.BOSS_DAMAGED,
          { bossHealth: newBossHealth },
        );
        broadcastAndDispatch(event, payload);

        if (newBossHealth <= 0) {
          const { event, payload } = createBroadcastPayload(
            BROADCAST_EVENTS.BOSS_DAMAGED,
            { bossHealth: newBossHealth },
          );
          broadcastAndDispatch(event, payload);
          return;
        }
      } else {
        //  FAILURE -> Damage Team
        const healthUpdates: { [playerId: string]: number } = {};

        activePlayers.forEach((p) => {
          healthUpdates[p.playerId] = Math.max(0, p.health - 1);
        });

        const { event, payload } = createBroadcastPayload(
          BROADCAST_EVENTS.TEAM_DAMAGE,
          { playerHealths: healthUpdates },
        );
        broadcastAndDispatch(event, payload);

        // Check if team lost
        const teamWiped = activePlayers.every(
          (p) => (healthUpdates[p.playerId] ?? p.health) <= 0,
        );
        if (teamWiped) {
          const { event, payload } = createBroadcastPayload(
            BROADCAST_EVENTS.BOSS_FIGHT_GAME_OVER,
            {},
          );
          broadcastAndDispatch(event, payload);
          return;
        }
      }

      // --- Start Next Question (if game not over) ---
      console.log("Host: Starting next question.");
      // Add a small delay before starting next question to allow UI updates
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        const newStartTime = Date.now();

        dispatch({
          type: "advanceTurn", // Or rename action if preferred e.g., 'advanceBossQuestion'
          nextPlayerIndex: -1, // Not relevant here
          nextQuestionIndex: nextIndex,
          newTurnStartTime: newStartTime,
        });
        sendBroadcast(BROADCAST_EVENTS.QUESTION_START, {
          nextQuestionIndex: nextIndex,
          newTurnStartTime: newStartTime,
        });
        // Note: setIsResolvingRound(false) happens in the useEffect watching turnStartTime
      }, 2000); // 2-second delay
    } // end if(timeExpired || allLivingPlayersAnswered)
  }, [
    player.isHost,
    isGameOver,
    turnStartTime,
    players, // Need to react to health changes
    playerAnswers, // Need to react to answers coming in
    currentQuestionIndex,
    bossHealth,
    sendBroadcast,
    isResolvingRound,
  ]);

  const { user } = useAuth0();
  useEffect(() => {
    if (isGameOver && !xpUpdateAttempted) {
      setXpUpdateAttempted(true); // make sure action isn't repeated twice

      if (user?.email) {
        const playerEmail = user?.email;
        const xpChange = isTeamVictory ? XP_GAIN_ON_WIN : XP_LOSS_ON_LOSE;

        console.log(
          `Game Over. Victory: ${isTeamVictory}. Player ${playerEmail} XP change: ${xpChange}`,
        );

        updateLeaderboard(playerEmail, xpChange);
      } else {
        console.log(
          "Game Over, but current player has no email. Skipping XP update.",
        );
      }
    }

    if (!isGameOver) {
      setXpUpdateAttempted(false);
    }
  }, [isGameOver, isTeamVictory, currentPlayer, xpUpdateAttempted]);

  const damageBossAction = () => {};

  // --- UI Rendering ---

  if (
    !currentQuestion ||
    !players ||
    typeof bossHealth !== "number" ||
    !questions
  ) {
    // Handle loading gameState or error gameState if question/players/bossHealth aren't available yet
    return <div>Loading game... (Ensure game started correctly)</div>;
  }

  const canAnswer =
    currentPlayer.health > 0 &&
    !isAnsweredLocally &&
    !isResolvingRound &&
    !isGameOver;

  return (
    <div className="from-background to-muted min-h-screen bg-gradient-to-b">
      <div className="container px-4 py-4">
        <GameHeader
          subject={"Hello world"}
          topic={"asdf"}
          roundNumber={currentQuestionIndex + 1}
        />

        <div className="mb-8">
          <BossStatus
            bossName={"1.2 teacher"}
            bossHealth={bossHealth}
            maxHealth={100}
            isAttacking={false} // Attack animation could be triggered by TEAM_DAMAGED broadcast maybe?
            feedback={feedbackMessage}
            showFeedback={showFeedback}
          />
        </div>

        {/* TeamStatus might need slight adjustment if getBossAttackClass is removed/changed */}
        <TeamStatus
          players={players}
          getBossAttackClass={() => ""}
          currentId={currentPlayer.id}
        />

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
                  You{"'"}ve been defeated! Wait for your teammates.
                </p>
              </div>
            )}
            {/* Indicate waiting gameState */}
            {isAnsweredLocally && !isResolvingRound && (
              <div className="bg-muted mt-6 rounded-md p-3 text-center">
                <p className="text-muted-foreground animate-pulse">
                  Waiting for other players...
                </p>
              </div>
            )}
          </div>
        ) : (
          // Use isTeamVictory from gameState
          <GameOver
            isVictory={isTeamVictory ?? false} // Default to false if null somehow
            bossHealth={bossHealth}
            maxBossHealth={100}
            players={players}
          />
        )}
      </div>
    </div>
  );
};

export default BossFightGame;
