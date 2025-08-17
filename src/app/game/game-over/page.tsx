import { Button } from "@/ui";
import { Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Player } from "@/types/types";
import { BROADCAST_EVENTS, useGame } from "@/GameContext";
import { createBroadcastPayload } from "@/utils/utils";

interface GameOverProps {
  isVictory: boolean | undefined;
  bossHealth: number | undefined;
  winner: string | undefined;
  players: Player[];
}

export default function GameOver({
  isVictory,
  bossHealth,
  players,
}: GameOverProps) {
  const router = useRouter();
  const { gameState, broadcastAndDispatch } = useGame();
  const { gameMode } = gameState.lobby;

  const onPlayAgain = () => {
    const { event, payload } = createBroadcastPayload(
      BROADCAST_EVENTS.RESTART_GAME,
      {},
    );
    broadcastAndDispatch(event, payload);

    router.push("/game");
  };

  return (
    <div className="game-card bg-card mx-auto max-w-2xl rounded-lg border p-8 text-center shadow-lg">
      <div className="mb-6">
        {/* BossFight Game Over Screen */}
        {gameMode.type === "bossfight" ? (
          <>
            {isVictory ? (
              <>
                <Users className="text-theme-blue mx-auto mb-4 h-16 w-16" />
                <h2 className="mb-2 text-3xl font-bold">Victory!</h2>
                <p className="text-xl">
                  Your team has defeated {gameMode.data.bossName}!
                </p>
              </>
            ) : (
              <>
                <Shield className="text-theme-purple mx-auto mb-4 h-16 w-16" />
                <h2 className="mb-2 text-3xl font-bold">Defeat!</h2>
                <p className="text-xl">
                  {gameMode.data.bossName} has bested your team!
                </p>
              </>
            )}
            <div className="mb-6 flex flex-col items-center gap-4">
              <h3 className="font-semibold">Final Results</h3>
              <div className="flex items-center gap-3 text-lg">
                <span>
                  Boss Health: {bossHealth}/{gameMode.data.bossHealth} remaining
                </span>
              </div>
              <h3 className="mt-2 font-semibold">Team Status</h3>
              {players.map((player) => (
                <div
                  key={player.playerId}
                  className="flex items-center gap-3 text-lg"
                >
                  <span>
                    {player.name}: {player.health}{" "}
                    {player.health === 1 ? "health" : "healths"} remaining
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : gameMode.type === "deathmatch" ? (
          <div></div>
        ) : (
          <div>Something went wrong...</div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          className="bg-theme-blue hover:bg-theme-blue/80 gap-2"
          onClick={onPlayAgain}
        >
          Play Again
        </Button>
        <Button variant="special" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
