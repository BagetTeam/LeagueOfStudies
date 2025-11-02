import { Heart } from "lucide-react";
import { Player } from "@/types/types";

interface TeamStatusProps {
  players: Player[];
  getBossAttackClass: (index: number) => string;
  currentId: string;
}

export function TeamStatus({
  players,
  getBossAttackClass,
  currentId,
}: TeamStatusProps) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
      {players.map((player, index) => (
        <div
          key={player.playerId}
          className={`bg-card rounded-xl border p-4 ${getBossAttackClass(index)} ${player.health <= 0 ? "bg-muted/50 text-muted-foreground" : ""}`}
        >
          <h3
            className={`mb-2 font-semibold ${player.playerId === currentId ? "text-theme-blue" : ""}`}
          >
            {player.name}
            {player.health <= 0 && (
              <span className="ml-2 text-red-500">(Down)</span>
            )}
          </h3>

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
  );
}
