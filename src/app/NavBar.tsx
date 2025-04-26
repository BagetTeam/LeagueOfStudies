"use client";

import { Button } from "@/ui";
import { useAuth0 } from "@auth0/auth0-react";
import { GraduationCap, LogIn, User } from "lucide-react";
import Link from "next/link";

export default function NavBar() {
  const { loginWithRedirect, user } = useAuth0();

  return (
    <div className="flex w-full shrink-0 items-center justify-between p-5">
      <Link href="/" className="flex gap-3 text-2xl font-bold">
        <GraduationCap className="text-primary h-8 w-8" />
        <div>
          League
          <span className="text-secondary">Of</span>
          Studies
        </div>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
        <Link href="/game-modes">
          <Button>Game Modes</Button>
        </Link>
        <Link href="/leaderboard">
          <Button>Leaderboard</Button>
        </Link>

        {user ? (
          <Link href="/profile">
            <Button
              className="flex items-center justify-center gap-2"
              variant="special"
            >
              {user.name ?? "Player"}
              <User />
            </Button>
          </Link>
        ) : (
          <Button
            variant="special"
            className="flex items-center justify-center gap-2"
            onClick={() => {
              loginWithRedirect();
            }}
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        )}
      </div>
    </div>
  );
}
