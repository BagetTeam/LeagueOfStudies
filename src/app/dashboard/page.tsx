"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui";
import {
  ArrowRight,
  FileText,
  Upload,
  Play,
  Plus,
  Trophy,
  Clock,
  Users,
  Star,
} from "lucide-react";
import { Tables } from "@/backend/models/database.types";
import { useAuth0 } from "@auth0/auth0-react";
import { getRecentGames } from "@/backend/db/dashboard";

const studyNotes = [
  {
    id: 1,
    title: "Biology Midterm Notes",
    topics: ["Cell Structure", "Genetics", "Ecology"],
    questions: 45,
  },
  {
    id: 2,
    title: "History - World War II",
    topics: ["European Theater", "Pacific Theater"],
    questions: 30,
  },
  {
    id: 3,
    title: "Physics - Mechanics",
    topics: ["Newton's Laws", "Kinematics"],
    questions: 25,
  },
];

export default function DashBoard() {
  const [recentGames, setRecentGames] = useState<Tables<"game">[]>([]);
  const { user } = useAuth0();

  const email = user?.email;

  useEffect(() => {
    if (email) {
      (async () => {
        const games = await getRecentGames(email);
        setRecentGames(games);
      })();
    }
  }, [email]);

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex w-full flex-col items-center gap-8 p-4">
      <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Welcome back, Player!</h1>
          <p className="text-muted-foreground">
            Track your progress, manage your notes, and start new games
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/game">
            <Button className="bg-theme-purple hover:bg-theme-purple-dark text-background gap-2">
              <Play className="h-4 w-4" />
              Play Now
            </Button>
          </Link>
          <Link href="/upload">
            <Button variant="normal" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Notes
            </Button>
          </Link>
        </div>
      </div>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">My Notes</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Link href="/upload" className="game-card p-4 text-center">
              <div className="bg-theme-purple/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Upload className="text-theme-purple h-5 w-5" />
              </div>
              <h3 className="font-medium">Upload Notes</h3>
            </Link>

            <Link href="/game" className="game-card p-4 text-center">
              <div className="bg-theme-orange/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Play className="text-theme-orange h-5 w-5" />
              </div>
              <h3 className="font-medium">Start Game</h3>
            </Link>

            <Link href="/friends" className="game-card p-4 text-center">
              <div className="bg-theme-blue/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Users className="text-theme-blue h-5 w-5" />
              </div>
              <h3 className="font-medium">Find Friends</h3>
            </Link>

            <Link href="/leaderboard" className="game-card p-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium">Leaderboard</h3>
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="game-card">
              <h3 className="text-muted-foreground mb-1">Total Games</h3>
              <p className="text-3xl font-bold">24</p>
            </div>
            <div className="game-card">
              <h3 className="text-muted-foreground mb-1">Win Rate</h3>
              <p className="text-3xl font-bold">67%</p>
            </div>
            <div className="game-card">
              <h3 className="text-muted-foreground mb-1">Questions Answered</h3>
              <p className="text-3xl font-bold">342</p>
            </div>
            <div className="game-card">
              <h3 className="text-muted-foreground mb-1">Total XP</h3>
              <p className="text-3xl font-bold">3,240</p>
            </div>
          </div>

          {/* Recent games */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Games</h2>
              <Link
                href="/history"
                className="text-theme-purple flex items-center gap-1 text-sm font-medium hover:underline"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-border border-b">
                    <th className="px-4 py-3 text-left">Mode</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-left">Topic</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Result</th>
                    <th className="px-4 py-3 text-left">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGames.map((game) => (
                    <tr
                      key={game.id}
                      className="hover:bg-muted/50 border-border border-b transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {game.mode === "Deathmatch" ? (
                            <Trophy className="text-theme-orange h-4 w-4" />
                          ) : (
                            <Users className="text-theme-blue h-4 w-4" />
                          )}
                          {game.mode}
                        </div>
                      </td>
                      <td className="px-4 py-3">{game.subject}</td>
                      <td className="px-4 py-3">{game.topic}</td>
                      <td className="text-muted-foreground px-4 py-3">
                        {game.date}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${game.result === "Won" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {game.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{game.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Study Notes</h2>
            <Link href="/upload">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Notes
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studyNotes.map((note) => (
              <div key={note.id} className="game-card">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-theme-purple h-5 w-5" />
                    <h3 className="font-semibold">{note.title}</h3>
                  </div>
                  <div className="bg-theme-purple/10 text-theme-purple rounded-full px-2 py-1 text-xs font-medium">
                    {note.questions} questions
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-muted-foreground mb-2 text-sm">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {note.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="bg-muted rounded-full px-2 py-1 text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="normal">Edit</Button>
                  <Button variant="normal" className="text-theme-purple">
                    Practice
                  </Button>
                </div>
              </div>
            ))}

            <Link
              href="/upload"
              className="hover:border-theme-purple/50 hover:bg-muted/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors"
            >
              <Plus className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-muted-foreground font-medium">Add New Notes</p>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="game-card">
              <h3 className="mb-4 text-xl font-semibold">
                Performance Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-muted-foreground">
                      Overall Win Rate
                    </span>
                    <span className="font-semibold">67%</span>
                  </div>
                  <div className="health-bar">
                    <div
                      className="health-bar-fill"
                      style={{ width: "67%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-muted-foreground">
                      Questions Correct
                    </span>
                    <span className="font-semibold">78%</span>
                  </div>
                  <div className="health-bar">
                    <div
                      className="health-bar-fill"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-muted-foreground">
                      Average Response Time
                    </span>
                    <span className="font-semibold">4.2s</span>
                  </div>
                  <div className="health-bar">
                    <div
                      className="health-bar-fill"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="border-border mt-6 border-t pt-4">
                <h4 className="mb-3 font-semibold">Top Subjects</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="text-theme-orange fill-theme-orange h-4 w-4" />
                      <span>Biology</span>
                    </div>
                    <span className="font-medium">92% accuracy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="text-theme-orange fill-theme-orange h-4 w-4" />
                      <span>History</span>
                    </div>
                    <span className="font-medium">85% accuracy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="text-theme-orange h-4 w-4" />
                      <span>Physics</span>
                    </div>
                    <span className="font-medium">72% accuracy</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="game-card">
              <h3 className="mb-4 text-xl font-semibold">Activity Log</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-theme-purple/10 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    <Trophy className="text-theme-purple h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Won a Deathmatch in Biology</p>
                    <p className="text-muted-foreground text-sm">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Earned Achievement: &quot;Biology Expert&quot;
                    </p>
                    <p className="text-muted-foreground text-sm">Yesterday</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-theme-blue/10 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    <Users className="text-theme-blue h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Completed Boss Fight in History
                    </p>
                    <p className="text-muted-foreground text-sm">Yesterday</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <FileText className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">Uploaded Physics study notes</p>
                    <p className="text-muted-foreground text-sm">3 days ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <Clock className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Study streak: 5 days!</p>
                    <p className="text-muted-foreground text-sm">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
