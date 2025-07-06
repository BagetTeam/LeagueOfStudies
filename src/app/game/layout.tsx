"use client";

import { GameProvider } from "@/app/GameContext";
import { ReactNode } from "react";

interface GameLayoutProps {
  children: ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  return <>{children}</>;
}
