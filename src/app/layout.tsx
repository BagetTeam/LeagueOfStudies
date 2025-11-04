import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Mono } from "next/font/google";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import NavBar from "../components/NavBar";
import Wrapper from "./Wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  const domain = process.env.AUTH0_DOMAIN!;
  const cliend_id = process.env.AUTH0_CLIENT_ID!;

  return (
    <html lang="en">
      <body
        className={`${spaceMono.variable} bg-primary/10 w-[100vw] overflow-x-hidden antialiased`}
      >
        <Wrapper domain={domain} client_id={cliend_id}>
          <Theme>
            <NavBar />
            {children}
          </Theme>
        </Wrapper>
      </body>
    </html>
  );
}
