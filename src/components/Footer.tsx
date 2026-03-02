import Link from "next/link";
import { GraduationCap, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted flex w-full flex-col items-center justify-center p-10">
      <div className="flex w-full flex-col justify-between gap-8">
        <div className="items-left flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-8 text-xl font-bold">
            <GraduationCap className="text-theme-purple h-6 w-6" />
            <span>LeagueOfStudies</span>
          </Link>
          <p className="text-muted-foreground max-w-md">
            Transform studying into a fun, competitive, and collaborative game.
            Learn with friends and beat your high scores!
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href="https://github.com/Blynkosaur/LeagueOfStudies"
              className="hover:text-theme-purple"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground border-border mt-12 w-full border-t pt-6 text-center">
        <p>
          © {new Date().getFullYear()} LeagueOfStudies. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
