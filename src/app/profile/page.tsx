"use client";

import { Tables } from "@/database.types";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { getUser, getUserStats } from "../backend";
import { Trophy, Settings, User } from "lucide-react";
import { TabsList, TabsTrigger, Tabs } from "@/ui";
import ProfileCard from "./ProfileCard";
import ProfileTab from "./ProfileTab";
import AchievementsTab from "./AchievementsTab";
import SettingsTab from "./SettingsTab";

export type UserData = Tables<"users"> & Tables<"stats">;

export default function ProfilePage() {
  const { user } = useAuth0();
  const email = user?.email;
  const name = user?.name;

  const [userData, setUserData] = useState<UserData | null>(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  function handleProfileSave() {
    setIsEditing(false);
  }

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

          <div className="flex w-full gap-4">
            <ProfileCard
              isEditing={isEditing}
              userData={userData}
              handleProfileSave={handleProfileSave}
              setIsEditing={setIsEditing}
            />

            {/* Main content */}
            <div className="basis-full">
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

                <ProfileTab userData={userData} isEditing={isEditing} />

                <AchievementsTab />

                <SettingsTab />
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
