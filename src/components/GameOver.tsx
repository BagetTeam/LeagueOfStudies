import { Button } from "@/ui";
import { Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Player } from "@/types/types";
import { useGame } from "@/GameContext";

interface GameOverProps {
  isVictory: boolean;
  bossHealth: number;
  maxBossHealth: number;
  players: Player[];
}

export function GameOver({
  isVictory,
  bossHealth,
  maxBossHealth,
  players,
}: GameOverProps) {
  const router = useRouter();
  const { dispatch, sendBroadcast } = useGame();

  const onPlayAgain = () => {
    dispatch({
      type: "restartGame",
    });
    sendBroadcast("restart_game", {});
  };

  return (
    <div className="game-card mx-auto max-w-2xl text-center">
      <div className="mb-6">
        {isVictory ? (
          <>
            <Users className="text-theme-blue mx-auto mb-4 h-16 w-16" />
            <h2 className="mb-2 text-3xl font-bold">Victory!</h2>
            <p className="text-xl">Your team has defeated Professor Chronos!</p>
          </>
        ) : (
          <>
            <Shield className="text-theme-purple mx-auto mb-4 h-16 w-16" />
            <h2 className="mb-2 text-3xl font-bold">Defeat!</h2>
            <p className="text-xl">Professor Chronos has bested your team!</p>
          </>
        )}
      </div>

      <div className="mb-6 flex flex-col items-center gap-4">
        <h3 className="font-semibold">Final Results</h3>
        <div className="flex items-center gap-3 text-lg">
          <span>
            Boss Health: {bossHealth}/{maxBossHealth} remaining
          </span>
        </div>
        <h3 className="mt-2 font-semibold">Team Status</h3>
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-3 text-lg">
            <span>
              {player.name}: {player.health}{" "}
              {player.health === 1 ? "health" : "health"} remaining
            </span>
          </div>
        ))}
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
