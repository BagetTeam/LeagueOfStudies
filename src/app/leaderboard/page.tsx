"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/backend";

interface LeaderboardEntry {
  email: string;
  level: number | null;
  totalXp: number | null;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from("stats")
        .select("email, level, totalXp")
        .gt("totalXp", 0)
        .order("totalXp", { ascending: false });

      if (error) {
        console.error("Error fetching leaderboard:", error);
      } else {
        setLeaderboard(data || []);
      }
    }

    fetchLeaderboard();
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
              <div className="font-bold text-blue-500">
                Level {entry.level ?? 0}
              </div>
              <div className="text-gray-600">{entry.totalXp ?? 0} XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
