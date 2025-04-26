"use client";

export default function Recent() {
  const games = [
    {
      name: "Deathmatch",
      category: "Mixed",
      icon: "🎮",
    },
    {
      name: "Bossfight",
      category: "Science",
      icon: "🧠",
    },
  ];
  return (
    <div className="w-3xl p-6">
      <h2 className="mb-4 text-2xl font-bold">Recent Games</h2>
      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-md">
        {games.map((game, index) => (
          <div key={index} className="flex items-center justify-between">
            {/* Left side: Icon + Title */}
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-2xl">
                {game.icon}
              </div>

              {/* Name and Category */}
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">{game.name}</h2>
                <p className="text-sm text-gray-500">
                  Category: {game.category}
                </p>
              </div>
            </div>

            {/* Right side: Join button */}
            <button className="rounded-lg bg-purple-400 px-4 py-2 text-white transition hover:bg-purple-500">
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
