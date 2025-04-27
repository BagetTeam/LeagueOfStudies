import { Shield } from "lucide-react";

interface BossStatusProps {
  bossName: string;
  bossHealth: number;
  maxHealth: number;
  isAttacking: boolean;
  feedback?: string;
  showFeedback: boolean;
}

export function BossStatus({
  bossName,
  bossHealth,
  maxHealth,
  isAttacking,
  feedback,
  showFeedback,
}: BossStatusProps) {
  return (
    <div
      className={`game-card ${
        isAttacking ? "bg-theme-purple/20 animate-pulse" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-theme-purple/20 rounded-full flex items-center justify-center">
            <Shield className="h-7 w-7 text-theme-purple" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{bossName}</h2>
            <p className="text-sm text-muted-foreground">The History Teacher</p>
          </div>
        </div>

        {isAttacking && (
          <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold animate-pulse">
            Attacking!
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Boss Health</span>
          <span>
            {bossHealth}/{maxHealth}
          </span>
        </div>
        <div className="health-bar">
          <div
            className="health-bar-fill bg-theme-purple transition-all duration-500"
            style={{ width: `${(bossHealth / maxHealth) * 100}%` }}
          ></div>
        </div>
      </div>

      {showFeedback && feedback && (
        <div className="mt-4 py-2 px-4 bg-muted rounded-md text-center font-medium animate-pulse-subtle">
          {feedback}
        </div>
      )}
    </div>
  );
}
