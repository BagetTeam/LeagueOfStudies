"use client";

const players = [
  { name: "Sam Chen", score: 5250, color: "bg-yellow-100 text-yellow-600" },
  { name: "Alex Johnson", score: 4830, color: "bg-gray-200 text-gray-500" },
  { name: "Jordan Smith", score: 3680, color: "bg-orange-100 text-orange-500" },
  { name: "Taylor Kim", score: 2975, color: "bg-purple-100 text-purple-500" },
];

export default function Leaderboard() {
  return (
    <div className="w-2xl p-6">
      <h2 className="mb-4 text-2xl font-bold">Top Players</h2>

      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-md">
        {players.map((player, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${player.color}`}
              >
                {index + 1}
              </div>

              <span className="text-lg font-medium">{player.name}</span>
            </div>

            <div className="text-lg font-bold">{player.score}</div>
          </div>
        ))}

        <div className="pt-4 text-center">
          <a
            href="/leaderboard"
            className="font-medium text-purple-500 hover:underline"
          >
            View Full Leaderboard
          </a>
        </div>
      </div>
    </div>
  );
}
