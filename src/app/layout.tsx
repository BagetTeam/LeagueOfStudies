import type { Metadata } from "next";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import NavBar from "../components/NavBar";
import { AuthProvider } from "@/lib/UserContext";
import { GameProvider } from "@/GameContext";

export const metadata: Metadata = {
  title: "League of Studies",
  description:
    "League of Studies is a gamified study platform where students compete, study smarter, and track their progress.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans bg-primary/10 w-[100vw] overflow-x-hidden antialiased"
      >
        <AuthProvider>
          <GameProvider>
            <Theme>
              <NavBar />
              {children}
            </Theme>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
