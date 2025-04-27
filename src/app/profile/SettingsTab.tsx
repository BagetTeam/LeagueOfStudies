import { TabsContent, Button } from "@/ui";
import { useAuth0 } from "@auth0/auth0-react";
import { Bell, LogOut } from "lucide-react";

export default function SettingsTab() {
  const { logout } = useAuth0();

  return (
    <TabsContent value="settings">
      <div className="game-card">
        <h2 className="mb-6 text-xl font-semibold">Account Settings</h2>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="font-semibold">Notifications</h3>
            <div className="border-border flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Bell className="text-theme-purple h-5 w-5" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-muted-foreground text-sm">
                    Receive updates about your account
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
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

            <div className="border-border flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Bell className="text-theme-purple h-5 w-5" />
                <div>
                  <p className="font-medium">Game Invites</p>
                  <p className="text-muted-foreground text-sm">
                    Receive notifications when friends invite you
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
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
            <div className="border-border flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Profile Visibility</p>
                <p className="text-muted-foreground text-sm">
                  Who can see your profile
                </p>
              </div>
              <select className="focus:ring-theme-purple border-border rounded-md border px-3 py-1 focus:ring-2 focus:outline-none">
                <option>Everyone</option>
                <option>Friends Only</option>
                <option>Private</option>
              </select>
            </div>
          </div>

          {/* Danger zone */}
          <div className="border-border space-y-4 border-t pt-4">
            <h3 className="text-destructive font-semibold">Danger Zone</h3>
            <Button
              variant="normal"
              className="border-destructive text-destructive hover:bg-destructive/10 flex w-full items-center justify-center gap-2"
              onClick={() => logout()}
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
  );
}
