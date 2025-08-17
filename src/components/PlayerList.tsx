import React from "react";
import { User } from "lucide-react";
import { Player } from "@/types/types";
import cn from "@/utils/cn";

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
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
          )}
        >
          <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
            <User size={16} className="text-primary" />
          </div>

          <div className="flex-grow overflow-hidden">
            <div className="truncate font-medium">{player.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
