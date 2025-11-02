"use client";

import { Button } from "@/ui";
import { useAuth0 } from "@auth0/auth0-react";
import { GraduationCap, LogIn, User } from "lucide-react";
import Link from "next/link";

export default function NavBar() {
  const { loginWithRedirect, user } = useAuth0();

  return (
    <div className="navbar-container w-full shrink-0 overflow-x-auto overflow-y-hidden">
      <div className="flex min-w-max items-center justify-between p-3 sm:p-5">
        <Link
          href="/"
          className="flex flex-shrink-0 gap-2 text-xl font-bold sm:gap-3 sm:text-2xl"
        >
          <GraduationCap className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
          <div className="xs:block hidden">
            League
            <span className="text-secondary">Of</span>
            Studies
          </div>
          <div className="xs:hidden">
            L<span className="text-secondary">o</span>S
          </div>
        </Link>
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          {/* <Link href="/dashboard"> */}
          {/*   <Button className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">Dashboard</Button> */}
          {/* </Link> */}
          <Link href="/game">
            <Button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm">
              Games
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm">
              Leaderboard
            </Button>
          </Link>

          {user ? (
            <Link href="/profile">
              <Button
                className="flex items-center justify-center gap-1 px-2 py-1 text-xs sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                variant="special"
              >
                <span className="hidden sm:inline">
                  {user.name ?? "Player"}
                </span>
                <span className="sm:hidden">Profile</span>
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="special"
              className="flex items-center justify-center gap-1 px-2 py-1 text-xs sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
              onClick={() => {
                loginWithRedirect();
              }}
            >
              <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
