"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboard } from "@/backend/db/leaderboard";

interface LeaderboardEntry {
  email: string;
  totalXp: number | null;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const fetchLeaderboardData = async () => {
    const data = await fetchLeaderboard();
    setLeaderboard(data ?? []);
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const getBadge = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-center text-4xl font-bold">🏆 Leaderboard 🏆</h1>

      <div className="flex flex-col gap-4">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.email}
            className="flex flex-row items-center justify-between rounded-lg bg-white p-4 shadow"
          >
            <div className="flex flex-row items-center gap-4">
              <span className="text-2xl">{getBadge(index)}</span>
              <span className="text-lg font-semibold">{entry.email}</span>
            </div>

            <div className="flex flex-row gap-8">
              <div className="text-gray-600">{entry.totalXp ?? 0} XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
