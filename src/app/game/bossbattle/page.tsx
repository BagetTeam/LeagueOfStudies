"use client";

import { useState, useEffect, useMemo } from "react";
import { GameHeader } from "@/components/GameHeader";
import { BossStatus } from "@/app/game/bossbattle/components/BossStatus";
import { TeamStatus } from "@/app/game/bossbattle/components/TeamStatus";
import { GameTimer } from "@/components/GameTimer";
import { GameQuestion } from "@/components/GameQuestions";
import { useGame } from "@/GameContext";
import { useAuth0 } from "@auth0/auth0-react";
import { updateLeaderboard } from "@/backend/db/leaderboard";
import { BROADCAST_EVENTS } from "@/GameContext";
import { createBroadcastPayload } from "@/utils/utils";
import { useRouter } from "next/navigation";

const XP_GAIN_ON_WIN = 500;
const XP_LOSS_ON_LOSE = -200;

export default function BossFightGame() {
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

  if (gameMode.type !== "bossfight" || questions.length == 0) {
    return <div>Loading game... (Ensure game started correctly)</div>;
  }

  const { time: TURN_DURATION_SECONDS, bossName, bossHealth } = gameMode.data;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnsweredLocally, setIsAnsweredLocally] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION_SECONDS);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isResolvingRound, setIsResolvingRound] = useState(false);
  const [isTeamVictory, setIsTeamVictory] = useState(false);

  const [xpUpdateAttempted, setXpUpdateAttempted] = useState(false);

  const router = useRouter();

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex % questions.length],
    [currentQuestionIndex],
  );

  const isGameOver = !players.find((p) => p.state === "playing");

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
    const timerInterval = setInterval(calculateRemainingTime, 1000); // trigger calculate time every second

    return () => clearInterval(timerInterval);
  }, [turnStartTime, isGameOver, isAnsweredLocally, isResolvingRound]);

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
        (p) => playerAnswers[p.playerId]?.isCorrect,
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
            BROADCAST_EVENTS.BOSS_FIGHT_GAME_OVER,
            {},
          );
          broadcastAndDispatch(event, payload);

          setIsTeamVictory(true);
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

      // --- Start Next Question ---
      // Add a small delay before starting next question to allow UI updates
      setTimeout(() => {
        const nextIndex = (currentQuestionIndex + 1) % questions.length;
        const newStartTime = Date.now();

        const { event, payload } = createBroadcastPayload(
          BROADCAST_EVENTS.TURN_ADVANCE_BOSSFIGHT,
          { currentQuestionIndex: nextIndex, startTime: newStartTime },
        );
        broadcastAndDispatch(event, payload);
      }, 2000);
    }
  }, [
    player.isHost,
    turnStartTime,
    players, // react to health changes
    playerAnswers,
    currentQuestionIndex,
    bossHealth,
    isResolvingRound,
  ]);

  // HANDLE GAME OVER -> xp + go gameover page
  const { user } = useAuth0();
  useEffect(() => {
    if (isGameOver && !xpUpdateAttempted) {
      setXpUpdateAttempted(true); // make sure action isn't repeated twice

      async function onWinXpChange() {
        if (user?.email) {
          const playerEmail = user?.email;
          const xpChange = isTeamVictory ? XP_GAIN_ON_WIN : XP_LOSS_ON_LOSE;

          console.log(
            `Game Over. Victory: ${isTeamVictory}. Player ${playerEmail} XP change: ${xpChange}`,
          );

          await updateLeaderboard(playerEmail, xpChange);
        }
      }
      onWinXpChange().finally(() => {
        router.push("/game/game-over");
      });
    }

    if (!isGameOver) {
      setXpUpdateAttempted(false);
    }
  }, [isGameOver, isTeamVictory]);

  // --- UI Rendering ---
  const canAnswer =
    player.health > 0 && !isAnsweredLocally && !isResolvingRound && !isGameOver;

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
          currentId={player.playerId}
        />

        {!isGameOver && (
          <div className="mx-auto max-w-3xl">
            <GameTimer timeLeft={timeLeft} />

            <GameQuestion
              question={currentQuestion}
              isAnswered={isAnsweredLocally}
              selectedOption={selectedOption}
              canAnswer={canAnswer}
              onAnswer={handleAnswer}
            />

            {player.health <= 0 && !isGameOver && (
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
        )}
      </div>
    </div>
  );
}
