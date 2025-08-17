import { Button } from "@/ui";
import { Shield, Trophy, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Player } from "@/types/types";
import { BROADCAST_EVENTS, useGame } from "@/GameContext";
import { createBroadcastPayload } from "@/utils/utils";

interface GameOverProps {
  isVictory: boolean | undefined;
  bossHealth: number | undefined;
  winner: string | undefined;
  winnerId: string | undefined;
  players: Player[];
}

export default function GameOver({
  isVictory,
  bossHealth,
  players,
  winner,
  winnerId,
}: GameOverProps) {
  const router = useRouter();
  const { gameState, broadcastAndDispatch } = useGame();
  const { player } = gameState;
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
      <>
        {/* BossFight Game Over Screen */}
        {gameMode.type === "bossfight" ? (
          <>
            <div className="mb-6">
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
            </div>

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
          <>
            <div className="mb-6">
              <Trophy className="text-theme-orange mx-auto mb-4 h-16 w-16 animate-bounce" />
              <h2 className="mb-2 text-3xl font-bold">Game Over!</h2>
              <p className="text-muted-foreground text-xl">
                {winner ? `${winner} has won the game!` : "It's a draw!"}
              </p>
              {winnerId === player.playerId && (
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
                    key={player.playerId}
                    className={`text-md flex w-full items-center justify-center gap-3 rounded p-2 ${player.playerId === winnerId ? "bg-yellow-100" : ""}`}
                  >
                    {player.playerId === winnerId && (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    )}
                    <span
                      className={`${player.playerId === winnerId ? "font-bold" : ""} ${player.health <= 0 ? "text-muted-foreground line-through" : ""}`}
                    >
                      {player.name}: {player.health ?? 0} health remaining
                    </span>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div>Something went wrong...</div>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            className="bg-theme-blue hover:bg-theme-blue/80 gap-2"
            onClick={onPlayAgain}
          >
            Play Again
          </Button>
          <Button variant="special" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            Back to Menu
          </Button>
        </div>
      </>
    </div>
  );
}
