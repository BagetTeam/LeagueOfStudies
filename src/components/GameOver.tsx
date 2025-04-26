import { Button } from "@/components/ui/button";
import { Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Player } from "@/types/game";

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
  const navigate = useNavigate();

  return (
    <div className="game-card max-w-2xl mx-auto text-center">
      <div className="mb-6">
        {isVictory ? (
          <>
            <Users className="h-16 w-16 text-theme-blue mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Victory!</h2>
            <p className="text-xl">Your team has defeated Professor Chronos!</p>
          </>
        ) : (
          <>
            <Shield className="h-16 w-16 text-theme-purple mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Defeat!</h2>
            <p className="text-xl">Professor Chronos has bested your team!</p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-4 items-center mb-6">
        <h3 className="font-semibold">Final Results</h3>
        <div className="flex items-center gap-3 text-lg">
          <span>
            Boss Health: {bossHealth}/{maxBossHealth} remaining
          </span>
        </div>
        <h3 className="font-semibold mt-2">Team Status</h3>
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-3 text-lg">
            <span>
              {player.name}: {player.health}{" "}
              {player.health === 1 ? "health" : "health"} remaining
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          className="gap-2 bg-theme-blue hover:bg-theme-blue/80"
          onClick={() => navigate("/game-modes")}
        >
          Play Again
        </Button>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
