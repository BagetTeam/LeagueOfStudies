"use client";

import { Tables } from "@/database.types";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { getUser, getUserStats } from "../backend";
import { Button, Input } from "@/ui";
import { Edit, Save, Trophy, Settings, Bell, LogOut, User } from "lucide-react";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/ui";
import Label from "@/ui/label";

type UserData = Tables<"users"> & Tables<"stats">;

export default function ProfilePage() {
  const { user, logout } = useAuth0();
  const email = user?.email;
  const name = user?.name;

  const [userData, setUserData] = useState<UserData | null>(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  function handleProfileSave() {}

  useEffect(() => {
    if (email) {
      (async () => {
        const user = await getUser(email, name ?? "Player");
        const stats = await getUserStats(email);

        if (user && stats) {
          setUserData({ ...user, ...stats });
        }
      })();
    }
  }, [email]);

  return (
    <div className="w-full p-4">
      {userData ? (
        <>
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="game-card flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <User className="h-24 w-24 rounded-full" />
                  {isEditing && (
                    <button className="bg-theme-purple absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full">
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>

                <h2 className="text-xl font-semibold">{userData.name}</h2>

                <div className="mb-6 flex w-full flex-wrap justify-center gap-3">
                  <div className="bg-theme-purple/10 text-theme-purple rounded-full px-3 py-1 text-sm">
                    Level {userData.level}
                  </div>
                  <div className="bg-theme-orange/10 text-theme-orange rounded-full px-3 py-1 text-sm">
                    {userData.totalXp} XP
                  </div>
                  <div className="bg-theme-blue/10 text-theme-blue rounded-full px-3 py-1 text-sm">
                    {userData.studyStreak} day streak
                  </div>
                </div>

                <div className="w-full border-t pt-4">
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {userData.totalGames}
                      </p>
                      <p className="text-muted-foreground text-sm">Games</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{userData.wins}</p>
                      <p className="text-muted-foreground text-sm">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{userData.winRate}</p>
                      <p className="text-muted-foreground text-sm">Win Rate</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant={isEditing ? "normal" : undefined}
                  className={`mt-6 w-full gap-2 ${isEditing ? "" : "bg-theme-purple hover:bg-theme-purple-dark"}`}
                  onClick={() =>
                    isEditing ? handleProfileSave() : setIsEditing(true)
                  }
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-8">
              <Tabs
                defaultValue={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-8 grid w-full grid-cols-3">
                  <TabsTrigger value="profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="achievements">
                    <Trophy className="mr-2 h-4 w-4" />
                    Achievements
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <div className="game-card">
                    <h2 className="mb-6 text-xl font-semibold">
                      Profile Information
                    </h2>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input id="displayName" disabled={!isEditing} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" disabled={!isEditing} />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="game-card mt-6">
                    <h2 className="mb-6 text-xl font-semibold">Statistics</h2>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">
                          Questions Answered
                        </p>
                        <p className="text-2xl font-semibold">
                          {userData.questionAnswered}
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">
                          Correct Answers
                        </p>
                        <p className="text-2xl font-semibold">
                          {userData.questionCorrect}
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">
                          Accuracy
                        </p>
                        <p className="text-2xl font-semibold">
                          {userData.accuracy}
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">
                          Best Subject
                        </p>
                        <p className="text-2xl font-semibold">Biology</p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">
                          Current Level
                        </p>
                        <p className="text-2xl font-semibold">
                          {userData.level}
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">
                          Study Streak
                        </p>
                        <p className="text-2xl font-semibold">
                          {userData.studyStreak} days
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements">
                  <div className="game-card">
                    <h2 className="mb-2 text-xl font-semibold">
                      Your Achievements
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Track your progress and unlock achievements as you study
                    </p>

                    <div className="space-y-4">
                      {/* {achievements.map((achievement) => ( */}
                      {/*   <div */}
                      {/*     key={achievement.id} */}
                      {/*     className={`rounded-lg border p-4 ${achievement.completed ? "border-theme-orange/50 bg-theme-orange/5" : ""}`} */}
                      {/*   > */}
                      {/*     <div className="flex items-center gap-3"> */}
                      {/*       <div */}
                      {/*         className={`flex h-10 w-10 items-center justify-center rounded-full ${achievement.completed ? "bg-theme-orange/20" : "bg-muted"}`} */}
                      {/*       > */}
                      {/*         <achievement.icon */}
                      {/*           className={`h-5 w-5 ${achievement.completed ? "text-theme-orange" : "text-muted-foreground"}`} */}
                      {/*         /> */}
                      {/*       </div> */}
                      {/**/}
                      {/*       <div className="flex-1"> */}
                      {/*         <div className="flex items-center justify-between"> */}
                      {/*           <h3 className="flex items-center gap-2 font-semibold"> */}
                      {/*             {achievement.name} */}
                      {/*             {achievement.completed && ( */}
                      {/*               <Star className="text-theme-orange fill-theme-orange h-4 w-4" /> */}
                      {/*             )} */}
                      {/*           </h3> */}
                      {/*           <span className="text-sm font-medium"> */}
                      {/*             {achievement.progress}% */}
                      {/*           </span> */}
                      {/*         </div> */}
                      {/*         <p className="text-muted-foreground text-sm"> */}
                      {/*           {achievement.description} */}
                      {/*         </p> */}
                      {/**/}
                      {/*         <div className="bg-muted mt-2 h-1.5 w-full rounded-full"> */}
                      {/*           <div */}
                      {/*             className={`h-1.5 rounded-full ${achievement.completed ? "bg-theme-orange" : "bg-theme-purple"}`} */}
                      {/*             style={{ width: `${achievement.progress}%` }} */}
                      {/*           ></div> */}
                      {/*         </div> */}
                      {/*       </div> */}
                      {/*     </div> */}
                      {/*   </div> */}
                      {/* ))} */}
                    </div>
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <div className="game-card">
                    <h2 className="mb-6 text-xl font-semibold">
                      Account Settings
                    </h2>

                    <div className="space-y-6">
                      {/* Notifications */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Notifications</h3>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <Bell className="text-theme-purple h-5 w-5" />
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-muted-foreground text-sm">
                                Receive updates about your account
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input
                                type="checkbox"
                                className="peer sr-only"
                                defaultChecked
                              />
                              <div className="peer-focus:ring-theme-purple/20 peer peer-checked:bg-theme-purple h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <Bell className="text-theme-purple h-5 w-5" />
                            <div>
                              <p className="font-medium">Game Invites</p>
                              <p className="text-muted-foreground text-sm">
                                Receive notifications when friends invite you
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input
                                type="checkbox"
                                className="peer sr-only"
                                defaultChecked
                              />
                              <div className="peer-focus:ring-theme-purple/20 peer peer-checked:bg-theme-purple h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Password</h3>
                        <Button variant="normal" className="w-full">
                          Change Password
                        </Button>
                      </div>

                      {/* Privacy */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Privacy</h3>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">Profile Visibility</p>
                            <p className="text-muted-foreground text-sm">
                              Who can see your profile
                            </p>
                          </div>
                          <select className="focus:ring-theme-purple rounded-md border px-3 py-1 focus:ring-2 focus:outline-none">
                            <option>Everyone</option>
                            <option>Friends Only</option>
                            <option>Private</option>
                          </select>
                        </div>
                      </div>

                      {/* Danger zone */}
                      <div className="space-y-4 border-t pt-4">
                        <h3 className="text-destructive font-semibold">
                          Danger Zone
                        </h3>
                        <Button
                          variant="normal"
                          className="border-destructive text-destructive hover:bg-destructive/10 w-full gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                        <Button
                          variant="normal"
                          className="border-destructive text-destructive hover:bg-destructive/10 w-full"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </>
      ) : (
        <div></div>
      )}
    </div>
  );
}
