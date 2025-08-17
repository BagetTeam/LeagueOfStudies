import React from "react";
import { User } from "lucide-react";
import { Player } from "@/types/types";
import cn from "@/utils/cn";

interface PlayerListProps {
  players: Player[];
  showScores?: boolean;
  currentPlayerId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  showScores = false,
  currentPlayerId,
}) => {
  const sortedPlayers = players;

  return (
    <div className="space-y-2">
      {sortedPlayers.map((player) => (
        <div
          key={player.playerId}
          className={cn(
            "bg-background flex items-center gap-2 rounded-lg p-2",
            player.playerId === currentPlayerId && "border-primary border-2",
            showScores &&
              player.score === Math.max(...players.map((p) => p.score)) &&
              "bg-accent/30",
          )}
        >
          <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
            <User size={16} className="text-primary" />
          </div>

          <div className="flex-grow overflow-hidden">
            <div className="truncate font-medium">{player.name}</div>
          </div>

          {showScores && (
            <div className="ml-auto flex items-center">
              <div className="text-xl font-bold">{player.score}</div>
              <div className="text-muted-foreground ml-1 text-xs"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
