"use client";

import { Button } from "@/ui";
import { LogIn, Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { useState } from "react";
import { createPortal } from "react-dom";

export default function NavBar() {
  const router = useRouter();
  const user = useUser().user;
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const menuPortal =
    typeof document !== "undefined" &&
    menuOpen &&
    createPortal(
      <>
        <div
          className="fixed inset-0 z-40 bg-black/20 min-[860px]:hidden"
          aria-hidden
          onClick={closeMenu}
        />
        <div className="fixed right-3 top-16 z-50 min-w-[200px] rounded-lg border border-black bg-background p-2 shadow-lg min-[860px]:hidden">
          {user && (
            <Link href="/dashboard" onClick={closeMenu}>
              <Button className="w-full justify-start border-0 bg-transparent px-3 py-2 shadow-none hover:bg-black/5 hover:shadow-none">
                Dashboard
              </Button>
            </Link>
          )}
          <Link href="/game" onClick={closeMenu}>
            <Button className="w-full justify-start border-0 bg-transparent px-3 py-2 shadow-none hover:bg-black/5 hover:shadow-none">
              Games
            </Button>
          </Link>
          <Link href="/leaderboard" onClick={closeMenu}>
            <Button className="w-full justify-start border-0 bg-transparent px-3 py-2 shadow-none hover:bg-black/5 hover:shadow-none">
              Leaderboard
            </Button>
          </Link>
          {user ? (
            <Link href="/logout" onClick={closeMenu}>
              <Button className="w-full justify-start gap-2 border-0 bg-transparent px-3 py-2 shadow-none hover:bg-black/5 hover:shadow-none">
                <User className="h-4 w-4" />
                Logout
              </Button>
            </Link>
          ) : (
            <Button
              className="w-full justify-start gap-2 border-0 bg-transparent px-3 py-2 shadow-none hover:bg-black/5 hover:shadow-none"
              onClick={() => {
                closeMenu();
                router.push("/login");
              }}
            >
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </>,
      document.body
    );

  return (
    <div className="navbar-container relative w-full shrink-0 overflow-x-auto overflow-y-hidden">
      <div className="flex min-w-max items-center justify-between p-3 sm:p-5">
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
          <div className="hidden min-[860px]:block">
            League
            <span className="text-secondary">
              Of
            </span>
            Studies
          </div>
          <div className="min-[860px]:hidden">
            L
            <span className="text-secondary hover:underline hover:decoration-black">
              o
            </span>
            S
          </div>
        </Link>

        <div className="hidden flex-shrink-0 items-center gap-2 sm:gap-4 min-[860px]:flex">
          {user && (
            <Link href="/dashboard">
              <Button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm">
                Dashboard
              </Button>
            </Link>
          )}
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
            <Link href="/logout">
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

        <div className="flex-shrink-0 min-[860px]:hidden">
          <Button
            className="flex h-8 w-8 items-center justify-center p-0 shadow-none hover:shadow-[1px_1px_0_0_black]"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {menuPortal}
    </div>
  );
}
