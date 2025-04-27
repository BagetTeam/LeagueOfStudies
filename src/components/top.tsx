"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
export default function Header() {
  return (
    <div className="flex h-16 w-full flex-row items-center justify-between bg-gray-800 px-8 text-white">
      <div className="text-xl font-bold">
        <span className="text-primary">League</span>
        <span className="text-orange-400">Of</span>
        <span className="text-blue-300">Studies</span>
      </div>
      <div className="flex flex-row items-center gap-5">
        <Link href={"/dashboard"}>Dashboard</Link>
        <Link href={"/profile"}>Games</Link>
        <Link href={"/profile"}>Profile</Link>
      </div>
      <div className="flex flex-row items-center gap-4">
        <Bell className="h-6 w-6" />
        <img
          src="/profile.jpg" // path to your profile image
          alt="Profile"
          className="h-10 w-10 rounded-full object-cover"
        />
      </div>
    </div>
  );
}
