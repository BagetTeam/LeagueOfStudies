import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import NavBar from "../components/NavBar";
import { AuthProvider } from "@/lib/UserContext";
import { GameProvider } from "@/GameContext";
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

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
        className={`${spaceMono.variable} bg-primary/10 w-[100vw] overflow-x-hidden antialiased`}
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
