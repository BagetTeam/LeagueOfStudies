"use client";

import { GameProvider } from "@/GameContext";
import { ReactNode } from "react";

interface GameLayoutProps {
  children: ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  return <GameProvider>{children}</GameProvider>;
}
