"use client";
import Link from "next/link";
import { Button } from "@radix-ui/themes";
export default function LittleNav() {
  return (
    <div className="mx-auto mt-5 flex max-w-7xl flex-row items-center gap-5 rounded bg-blue-100 px-8">
      <Link className="flex-1 py-2" href="/dashboard">
        <Button className="w-full rounded bg-blue-50 py-2">Leaderboard</Button>
      </Link>
      <Link className="flex-1 py-2" href="/dashboard/games">
        <Button className="w-full rounded bg-blue-50 py-2">
          Available Games
        </Button>
      </Link>
      <Link className="flex-1 py-2" href="/dashboard/progress">
        <Button className="w-full rounded bg-blue-50 py-2">My Progress</Button>
      </Link>
      <Link className="flex-1 py-2" href="/dashboard/friends">
        <Button className="w-full rounded bg-blue-50 py-2">Friends</Button>
      </Link>
    </div>
  );
}
