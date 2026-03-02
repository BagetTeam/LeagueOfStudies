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
    <div className="mx-auto max-w-4xl overflow-x-hidden px-4 py-8 sm:p-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        <span className="max-[450px]:hidden">🏆 </span>
        Leaderboard
        <span className="max-[450px]:hidden"> 🏆</span>
      </h1>

      <div className="flex flex-col gap-4">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.email}
            className="flex min-w-0 flex-row items-center justify-between gap-3 rounded-lg bg-white p-4 shadow"
          >
            <div className="flex min-w-0 flex-1 flex-row items-center gap-3 sm:gap-4">
              <span className="shrink-0 text-2xl">{getBadge(index)}</span>
              <span
                className="min-w-0 truncate text-base font-semibold sm:text-lg"
                title={entry.email}
              >
                {entry.email}
              </span>
            </div>

            <div className="shrink-0 text-gray-600">
              {entry.totalXp ?? 0} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
