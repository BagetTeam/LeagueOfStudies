"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Input } from "@/ui";
import {
  Trophy,
  Users,
  Search,
  Play,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { useGame } from "../../GameContext";
import { GameMode } from "@/types/types";
import { subjects } from "@/test-data/gameModeData";
import { INITIAL_BOSS_HEALTH } from "@/types/const";
import { defaultLobby } from "@/gameState";
import { createBroadcastPayload } from "@/utils/utils";
import PDF_reader from "../pdf_reader/reader";
import Link from "next/link";

const defaultGameMode: GameMode = {
  type: "deathmatch",
  data: { activePlayerIndex: 0, time: 15 },
};

export default function GameModes() {
  const router = useRouter();
  const user = useUser();
  const { dispatch } = useGame();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLAnchorElement | null>(null);
  // clear any existing loaded lobby setups
  useEffect(() => {
    const { event, payload } = createBroadcastPayload("setLobby", {
      lobby: defaultLobby,
    });
    dispatch({ type: event, payload: payload });
  }, [dispatch]);

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.topics.some((topic) =>
        topic.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  function handleDashOrigin(selectedMode: string) {
    let mode: GameMode = defaultGameMode;
    if (selectedMode) {
      if (selectedMode === "deathmatch")
        mode = { type: selectedMode, data: { activePlayerIndex: 0, time: 15 } };
      else if (selectedMode === "bossfight")
        mode = {
          type: selectedMode,
          data: {
            bossName: "teacher Bob",
            bossHealth: INITIAL_BOSS_HEALTH,
            time: 20,
          },
        };
    }
    dispatch({ type: "setGameMode", payload: { gameMode: mode } });
    const title = sessionStorage.getItem("gameTitle");
    const subject = sessionStorage.getItem("gameSubject");
    if (title) {
      dispatch({ type: "setGameTitle", payload: { title: title } });
    }

    if (subject) {
      dispatch({ type: "setGameSubject", payload: { subject: subject } });
    }
    sessionStorage.removeItem("gameTitle");
    sessionStorage.removeItem("gameSubject");
    router.push("/game/lobby");
  }

  function handlePickSubject(subject: string) {
    let mode: GameMode = defaultGameMode;
    if (selectedMode) {
      if (selectedMode === "deathmatch")
        mode = { type: selectedMode, data: { activePlayerIndex: 0, time: 15 } };
      else if (selectedMode === "bossfight")
        mode = {
          type: selectedMode,
          data: {
            bossName: "teacher Bob",
            bossHealth: INITIAL_BOSS_HEALTH,
            time: 20,
          },
        };
    }
    dispatch({ type: "setGameMode", payload: { gameMode: mode } });

    if (subject) {
      dispatch({ type: "setGameSubject", payload: { subject: subject } });
      dispatch({ type: "setGameTitle", payload: { title: subject } });
    }

    router.push("/game/lobby");
  }
  function uploadClick(studyText: string) {
    let mode: GameMode = defaultGameMode;
    if (selectedMode) {
      if (selectedMode === "deathmatch")
        mode = { type: selectedMode, data: { activePlayerIndex: 0, time: 15 } };
      else if (selectedMode === "bossfight")
        mode = {
          type: selectedMode,
          data: {
            bossName: "teacher Bob",
            bossHealth: INITIAL_BOSS_HEALTH,
            time: 20,
          },
        };
    }
    dispatch({ type: "setGameMode", payload: { gameMode: mode } });
    dispatch({ type: "setGameTitle", payload: { title: "Personal Notes" } });

    if (studyText == "") return;
    dispatch({ type: "setGameSubject", payload: { subject: studyText } });
    router.push("/game/lobby");
  }

  return (
    <div className="flex w-full flex-col p-4">
      <h1 className="mb-2 text-3xl font-bold">Game Modes</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Choose a game mode and subject to start playing. Challenge yourself or
        team up with friends!
      </p>

      {/* Game modes section */}
      <div className="mb-12 grid gap-6 md:grid-cols-2">
        <div
          className={`game-card cursor-pointer transition-all ${selectedMode === "deathmatch" ? "ring-2 ring-black" : ""}`}
          onClick={() => {
            setSelectedMode("deathmatch");
            if (sessionStorage.getItem("gameSubject")) {
              handleDashOrigin("deathmatch");
            }
          }}
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="bg-theme-orange/20 flex h-14 w-14 items-center justify-center rounded-full">
              <Trophy className="text-theme-orange h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Deathmatch</h2>
              <p className="text-muted-foreground">Competitive mode</p>
            </div>
          </div>

          <p className="mb-6">
            Battle against friends in a competitive quiz! Each player takes
            turns answering multiple choice questions. You{"'"}ll have 5 lives -
            lose one for every wrong answer or time-out. Last player standing
            wins!
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="bg-muted rounded-full px-3 py-1 text-xs">
              2-6 Players
            </div>
            <div className="bg-muted rounded-full px-3 py-1 text-xs">
              Multiple Choice
            </div>
            <div className="bg-muted rounded-full px-3 py-1 text-xs">
              15 seconds per question
            </div>
          </div>
        </div>

        <div
          className={`game-card cursor-pointer transition-all ${selectedMode === "bossfight" ? "ring-2 ring-black" : ""}`}
          onClick={() => {
            setSelectedMode("bossfight");
            if (sessionStorage.getItem("gameSubject")) {
              handleDashOrigin("bossfight");
            }
          }}
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="bg-theme-blue/20 flex h-14 w-14 items-center justify-center rounded-full">
              <Users className="text-theme-blue h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Boss Fight </h2>
              <p className="text-muted-foreground">Cooperative mode</p>
            </div>
          </div>

          <p className="mb-6">
            Team up with friends or go on a solo adventure to defeat the boss!
            Answer questions correctly to damage the boss (with 20 health). Each
            player has 5 lives - work together to defeat the boss before anyone
            runs out of health!
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="bg-muted rounded-full px-3 py-1 text-xs">
              1-8 Players
            </div>
            <div className="bg-muted rounded-full px-3 py-1 text-xs">
              Team-based
            </div>
            <div className="bg-muted rounded-full px-3 py-1 text-xs">
              20 seconds per question
            </div>
          </div>
        </div>
      </div>

      {/* Subject selection */}
      {selectedMode && !sessionStorage.getItem("gameTitle") && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="shrink-0 whitespace-nowrap text-2xl font-semibold">Choose a Subject</h2>

            <div className="relative">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                placeholder="Search subjects or topics"
                className="w-[250px] pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => (
              <div key={subject.id} className="game-card">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-xl font-semibold">{subject.name}</h3>
                  <div className="bg-theme-purple/10 text-theme-purple rounded-full px-3 py-1 text-xs font-medium">
                    {subject.topics.length} topics
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {subject.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  className={`text-background w-full ${selectedMode === "deathmatch" ? "bg-theme-orange hover:bg-theme-orange/80" : "bg-theme-blue hover:bg-theme-blue/80"}`}
                  onClick={() => handlePickSubject(subject.name)}
                >
                  <span className="flex w-full justify-start gap-2" style={{ display: "flex", width: "100%", justifyContent: "flex-start" }}>
                    <Play className="h-4 w-4 shrink-0" />
                    Start Game
                  </span>
                </Button>
              </div>
            ))}

            {user.user && (
              <div
                onClick={() => {
                  dashboardRef.current?.click();
                }}
                className="hover:border-theme-purple/50 hover:bg-muted/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors hover:cursor-pointer"
              >
                <FileText className="text-muted-foreground mb-2 h-8 w-8" />
                <p className="text-muted-foreground mb-2 font-medium">
                  Use your own notes
                </p>
                <Link ref={dashboardRef} href={"/dashboard"}>
                  <Button variant="normal" className="gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {!user.user && (
              <PDF_reader
                onExtract={(text: string) => {
                  uploadClick(text);
                }}
                file={false}
              />
            )}
          </div>
        </>
      )}

      {/* Placeholder -- Call-to-action for creating custom game */}
      <div className="bg-theme-purple/10 rounded-xl p-6 md:p-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row"></div>
      </div>
    </div>
  );
}
