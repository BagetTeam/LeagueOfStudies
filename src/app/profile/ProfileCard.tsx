import { Button } from "@/ui";
import { User, Edit, Save } from "lucide-react";
import { UserData } from "./page";
import { Dispatch, SetStateAction } from "react";

type Props = {
  isEditing: boolean;
  userData: UserData;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  handleProfileSave: () => void;
};
export default function ProfileCard({
  isEditing,
  userData,
  setIsEditing,
  handleProfileSave,
}: Props) {
  return (
    <div className="shrink-0">
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
              <p className="text-2xl font-bold">{userData.totalGames}</p>
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
          className={`mt-6 flex w-full items-center justify-center gap-2 ${isEditing ? "" : "bg-theme-purple hover:bg-theme-purple-dark text-background"}`}
          onClick={() => (isEditing ? handleProfileSave() : setIsEditing(true))}
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
  );
}
