"use client";

import { Button } from "@/ui";
import { LogIn, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";

export default function NavBar() {
  const router = useRouter();
  const user = useUser().user;

  return (
    <div className="navbar-container w-full shrink-0 overflow-x-auto overflow-y-hidden">
      <div className="flex min-w-max items-center justify-between p-3 sm:p-5">
        {/* {JSON.stringify(user?.user_metadata)} */}
        <Link
          href="/"
          className="flex flex-shrink-0 gap-2 text-xl font-bold underline underline-offset-2 sm:gap-3 sm:text-2xl"
        >
          <Image
            src="/mac_icon.png"
            alt="League of Studies"
            width={32}
            height={32}
            className="h-6 w-6 shrink-0 bg-transparent object-contain sm:h-8 sm:w-8"
          />
          <div className="hidden md:block">
            League
            <span className="text-secondary">
              Of
            </span>
            Studies
          </div>
          <div className="md:hidden">
            L
            <span className="text-secondary hover:underline hover:decoration-black">
              o
            </span>
            S
          </div>
        </Link>
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          {user && (
            <Link href="/dashboard" className="underline underline-offset-2">
              <Button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm">
                Dashboard
              </Button>
            </Link>
          )}
          <Link href="/game" className="underline underline-offset-2">
            <Button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm">
              Games
            </Button>
          </Link>
          <Link href="/leaderboard" className="underline underline-offset-2">
            <Button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm">
              Leaderboard
            </Button>
          </Link>

          {user ? (
            <Link href="/logout" className="underline underline-offset-2">
              <Button
                className="flex items-center justify-center gap-1 px-2 py-1 text-xs sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
              >
                <span className="sm:hidden">Log Out</span>
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              className="flex items-center justify-center gap-1 px-2 py-1 text-xs sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
              onClick={() => {
                router.push("/login");
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
