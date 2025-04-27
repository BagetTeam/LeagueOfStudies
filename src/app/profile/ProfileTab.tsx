import { TabsContent, Input } from "@/ui";
import Label from "@/ui/label";
import { UserData } from "./page";

type Props = {
  isEditing: boolean;
  userData: UserData;
};
export default function ProfileTab({ userData, isEditing }: Props) {
  return (
    <TabsContent value="profile">
      <div className="game-card">
        <h2 className="mb-6 text-xl font-semibold">Profile Information</h2>

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
          <div className="border-border rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Questions Answered</p>
            <p className="text-2xl font-semibold">
              {userData.questionAnswered}
            </p>
          </div>

          <div className="border-border rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Correct Answers</p>
            <p className="text-2xl font-semibold">{userData.questionCorrect}</p>
          </div>

          <div className="border-border rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Accuracy</p>
            <p className="text-2xl font-semibold">{userData.accuracy}</p>
          </div>

          <div className="border-border rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Best Subject</p>
            <p className="text-2xl font-semibold">Biology</p>
          </div>

          <div className="border-border rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Current Level</p>
            <p className="text-2xl font-semibold">{userData.level}</p>
          </div>

          <div className="border-border rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Study Streak</p>
            <p className="text-2xl font-semibold">
              {userData.studyStreak} days
            </p>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
