interface GameTimerProps {
  timeLeft: number;
}

export function GameTimer({ timeLeft }: GameTimerProps) {
  return (
    <div className="mb-6 flex justify-center">
      <div className="bg-muted relative flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold">
        <svg className="absolute top-0 left-0 h-20 w-20 -rotate-90 transform">
          <circle
            cx="40"
            cy="40"
            r="36"
            strokeWidth="8"
            stroke={timeLeft <= 5 ? "#ef4444" : "#33C3F0"}
            fill="transparent"
            strokeDasharray={36 * 2 * Math.PI}
            strokeDashoffset={36 * 2 * Math.PI * (1 - timeLeft / 20)}
            className="transition-all duration-1000"
          />
        </svg>
        <span className={timeLeft <= 5 ? "text-red-500" : ""}>{timeLeft}</span>
      </div>
    </div>
  );
}
