import { Button } from "@/ui";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function NavBar() {
  return (
    <div className="flex w-full items-center justify-between p-5">
      <div className="flex gap-3 text-2xl font-bold">
        <GraduationCap className="text-primary h-8 w-8" />
        <div>
          League
          <span className="text-secondary">Of</span>
          Studies
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
        <Link href="/gamemodes">
          <Button>Game Modes</Button>
        </Link>
        <Link href="/leaderboard">
          <Button>Leaderboard</Button>
        </Link>
        <Button variant="normal">Login</Button>
        <Button variant="special">Sign Up</Button>
      </div>
    </div>
  );
}
