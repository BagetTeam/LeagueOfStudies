"use client";
interface NameBarProps {
  name: string;
  level: number;
  xp: number;
}
export default function NameBar({ name, level, xp }: NameBarProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-5 px-8">
      <div className="flex flex-col">
        <h1 className="text-6xl">Welcome back {name}!</h1>
        <div className="m-4 mt-0 flex flex-row gap-5">
          <span> Level {level}</span>
          <span>{xp} XP</span>
        </div>
      </div>
      <div className="items-centerflex-row flex justify-center gap-5">
        <button className="border-primary flex h-1/4 items-center justify-center rounded-xl border-2 px-8 py-3 text-black hover:bg-purple-100">
          Create Game
        </button>
        <button className="bg-primary flex h-1/4 items-center justify-center rounded-xl px-8 py-3 text-white hover:bg-purple-600">
          Browse Games
        </button>
      </div>
    </div>
  );
}
