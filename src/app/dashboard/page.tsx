"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  Play,
  Plus,
  Trophy,
  // Clock,
  Users,
  // Star,
} from "lucide-react";
import { Tables } from "@/backend/models/database.types";
import { getRecentGames } from "@/backend/db/dashboard";
import { getUserStats } from "@/backend/db/dashboard";
import { getNotes } from "@/backend/db/dashboard";
import { useUser } from "@/lib/UserContext";
import { supabase } from "@/backend/utils/database";
import pdfToText from "react-pdftotext";

// const studyNotes = [
//   {
//     id: 1,
//     title: "Biology Midterm Notes",
//     topics: ["Cell Structure", "Genetics", "Ecology"],
//     questions: 45,
//   },
//   {
//     id: 2,
//     title: "History - World War II",
//     topics: ["European Theater", "Pacific Theater"],
//     questions: 30,
//   },
//   {
//     id: 3,
//     title: "Physics - Mechanics",
//     topics: ["Newton's Laws", "Kinematics"],
//     questions: 25,
//   },
// ];
//

export default function DashBoard() {
  // const [recentGames, setRecentGames] = useState<Tables<"game">[]>([]);
  // const [studyNotes, setStudyNotes] = useState([]);
  const router = useRouter();
  const [studyNotes, setStudyNotes] = useState<
    {
      prim: string;
      id: string;
      title: string;
      email: string | null;
      tags: string[] | null;
      path: string | null;
      subject: string | null;
    }[]
  >([]);
  // const { dispatch } = useGame();
  const [userData, setUserData] = useState<Tables<"stats"> | null>(null);
  const user = useUser();
  const email = user?.user?.user_metadata.email;
  const [loading, setLoading] = useState(true);
  async function practice(path: string | null, title: string) {
    if (path) {
      try {
        const { data, error } = await supabase.storage
          .from("notes")
          .download(path);

        if (error) {
          console.error("Error downloading file:", error);

          return;
        }

        const file = new File([data], path, { type: "application/pdf" });
        const text = await pdfToText(file);
        // Store in sessionStorage to persist across navigation
        sessionStorage.setItem("gameTitle", title);
        sessionStorage.setItem("gameSubject", text);
        console.log(
          sessionStorage.getItem("gameTitle"),
          sessionStorage.getItem("gameSubject"),
        );
        router.push(`/game?source`);
      } catch (err) {
        console.error("Error accessing file:", err);
      }
    }
  }
  useEffect(() => {
    if (email) {
      (async () => {
        const userData = await getUserStats(email);

        setUserData(userData);
        if (user.user) {
          console.log("userid", user.user.id);
          const notes = await getNotes(user.user?.id);
          console.log("notes", notes);
          if (notes) {
            setStudyNotes(notes ?? []);
          } else {
            setStudyNotes([]);
          }
        }
        setLoading(false);
      })();
    }
  }, [email]);

  const [activeTab, setActiveTab] = useState("notes");

  return (
    <div className="flex w-full flex-col items-center gap-8 p-4">
      {!user.user && (
        <>
          <span>Sign in to see your progress :(</span>
          <Button
            variant="special"
            className="flex items-center justify-center gap-1 px-2 py-1 text-xs sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
          >
            <Link href={"/login"}>Sign in</Link>
          </Button>{" "}
        </>
      )}
      {user.user && (
        <>
          <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="mb-1 text-3xl font-bold">
                Welcome back, {user.user.user_metadata.full_name.split(" ")[0]}!
              </h1>
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
            <TabsList className="mx-auto mb-8 grid w-auto grid-cols-2">
              <TabsTrigger
                value="notes"
                className={`hover:cursor-pointer ${activeTab === "notes" ? "font-bold underline" : ""}`}
              >
                My Notes
              </TabsTrigger>
              <TabsTrigger
                className={`hover:cursor-pointer ${activeTab === "overview" ? "font-bold underline" : ""}`}
                value="overview"
              >
                Stats
              </TabsTrigger>
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

                <div
                  onClick={() => alert("You're playing this game alone :(")}
                  className="game-card p-4 text-center"
                >
                  <div className="bg-theme-blue/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full hover:cursor-pointer">
                    <Users className="text-theme-blue h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Find Friends</h3>
                </div>

                <Link href="/leaderboard" className="game-card p-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Trophy className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-medium">Leaderboard</h3>
                </Link>
              </div>

              {/* Quick stats */}
              {loading && <div>Loading...</div>}
              {!loading && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="game-card">
                    <h3 className="text-muted-foreground mb-1">Total Games</h3>
                    <p className="text-3xl font-bold">
                      {userData?.totalGames == 0 || userData?.totalGames == null
                        ? "None"
                        : userData?.totalGames}
                    </p>
                  </div>
                  <div className="game-card">
                    <h3 className="text-muted-foreground mb-1">Win Rate</h3>
                    <p className="text-3xl font-bold">
                      {userData?.totalGames == 0 || userData?.totalGames == null
                        ? "N/A"
                        : `${userData?.accuracy}%`}
                    </p>
                  </div>
                  <div className="game-card">
                    <h3 className="text-muted-foreground mb-1">
                      Questions Answered
                    </h3>
                    <p className="text-3xl font-bold">
                      {userData?.questionAnswered == 0 ||
                      userData?.questionAnswered == null
                        ? "None"
                        : userData?.questionAnswered}
                    </p>
                  </div>
                  <div className="game-card">
                    <h3 className="text-muted-foreground mb-1">Total XP</h3>
                    <p className="text-3xl font-bold">{userData?.totalXp}</p>
                  </div>
                </div>
              )}

              {/* Recent games */}
              {/* <div> */}
              {/*   <div className="mb-4 flex items-center justify-between"> */}
              {/*     <h2 className="text-xl font-semibold">Recent Games</h2> */}
              {/*   </div> */}
              {/*   <span className="border-border mb-4 block border-b"></span> */}
              {/*   {recentGames.length == 0 && <div>No recent games</div>} */}
              {/*   {recentGames.length != 0 && ( */}
              {/*     <div className="overflow-x-auto"> */}
              {/*       <table className="w-full border-collapse"> */}
              {/*         <thead> */}
              {/*           <tr className="border-border border-b"> */}
              {/*             <th className="px-4 py-3 text-left">Mode</th> */}
              {/*             <th className="px-4 py-3 text-left">Subject</th> */}
              {/*             <th className="px-4 py-3 text-left">Topic</th> */}
              {/*             <th className="px-4 py-3 text-left">Date</th> */}
              {/*             <th className="px-4 py-3 text-left">Result</th> */}
              {/*             <th className="px-4 py-3 text-left">Score</th> */}
              {/*           </tr> */}
              {/*         </thead> */}
              {/*         <tbody> */}
              {/*           {recentGames.map((game) => ( */}
              {/*             <tr */}
              {/*               key={game.id} */}
              {/*               className="hover:bg-muted/50 border-border border-b transition-colors" */}
              {/*             > */}
              {/*               <td className="px-4 py-3"> */}
              {/*                 <div className="flex items-center gap-2"> */}
              {/*                   {game.mode === "Deathmatch" ? ( */}
              {/*                     <Trophy className="text-theme-orange h-4 w-4" /> */}
              {/*                   ) : ( */}
              {/*                     <Users className="text-theme-blue h-4 w-4" /> */}
              {/*                   )} */}
              {/*                   {game.mode} */}
              {/*                 </div> */}
              {/*               </td> */}
              {/*               <td className="px-4 py-3">{game.subject}</td> */}
              {/*               <td className="px-4 py-3">{game.topic}</td> */}
              {/*               <td className="text-muted-foreground px-4 py-3"> */}
              {/*                 {game.date} */}
              {/*               </td> */}
              {/*               <td className="px-4 py-3"> */}
              {/*                 <span */}
              {/*                   className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${game.result === "Won" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`} */}
              {/*                 > */}
              {/*                   {game.result} */}
              {/*                 </span> */}
              {/*               </td> */}
              {/*               <td className="px-4 py-3 font-semibold"> */}
              {/*                 {game.score} */}
              {/*               </td> */}
              {/*             </tr> */}
              {/*           ))} */}
              {/*         </tbody> */}
              {/*       </table> */}
              {/*     </div> */}
              {/*   )} */}
              {/* </div> */}
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

              {studyNotes.length == 0 && <div>No notes uploaded :(</div>}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {studyNotes.map((note) => (
                  <div key={note.prim} className="game-card">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="text-theme-purple h-5 w-5" />
                        <h3 className="font-semibold">{note?.title}</h3>
                      </div>
                      <div className="bg-theme-purple/10 text-theme-purple rounded-full px-2 py-1 text-xs font-medium">
                        {note.subject}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-muted-foreground mb-2 text-sm">
                        Topics
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {note.tags?.slice(0, 3).map((topic, i) => (
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
                      <Button
                        variant="normal"
                        onClick={() => {
                          router.push(`/dashboard/view/${note.prim}`);
                        }}
                      >
                        View Note
                      </Button>
                      <Button
                        variant="normal"
                        onClick={() => {
                          practice(note?.path, note.title);
                        }}
                        className="text-theme-purple"
                      >
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
                  <p className="text-muted-foreground font-medium">
                    Add New Notes
                  </p>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
