"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
export default function Header() {
  return (
    <div className="flex flex-row items-center justify-between w-full h-16 bg-gray-800 text-white px-8">
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
        <Bell className=" w-6 h-6" />
        <img
          src="/profile.jpg" // path to your profile image
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </div>
  );
}
