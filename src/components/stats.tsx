"use client";

export default function Stats() {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-4">
      {/* Your Rank */}
      <div className="shadow- flex flex-col gap-2 rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center gap-2 font-semibold text-gray-600">
          🏆 Your Rank
        </div>
        <div className="text-4xl font-bold text-black">#42</div>
        <div className="text-sm text-gray-500">Top 15%</div>
      </div>

      {/* Level Progress */}
      <div className="flex flex-col gap-2 rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center gap-2 font-semibold text-gray-600">
          👤 Level Progress
        </div>
        <div className="text-4xl font-bold text-black">1250 / 1500</div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div className="h-full w-[83%] rounded-full bg-purple-400"></div>
        </div>
      </div>

      {/* Questions Answered */}
      <div className="flex flex-col gap-2 rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center gap-2 font-semibold text-gray-600">
          📈 Questions Answered
        </div>
        <div className="text-4xl font-bold text-black">320</div>
        <div className="text-sm text-gray-500">86% correct</div>
      </div>

      {/* Games Played */}
      <div className="flex flex-col gap-2 rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center gap-2 font-semibold text-gray-600">
          👥 Games Played
        </div>
        <div className="text-4xl font-bold text-black">45</div>
        <div className="text-sm text-gray-500">62% win rate</div>
      </div>
    </div>
  );
}
