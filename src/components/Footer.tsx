import Link from "next/link";
import { GraduationCap, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted flex w-full flex-col items-center justify-center p-10">
      <div className="flex flex-col w-full justify-between gap-8">
        <div className="flex flex-col items-left gap-4">
          <Link href="/" className="flex items-center gap-8 text-xl font-bold">
            <GraduationCap className="text-theme-purple h-6 w-6" />
            <span>LeagueOfStudies</span>
          </Link>
          <p className="text-muted-foreground max-w-md">
            Transform studying into a fun, competitive, and collaborative game.
            Learn with friends and beat your high scores!
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="hover:text-theme-purple" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="hover:text-theme-purple"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <h3 className="font-semibold">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/game-modes"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Game Modes
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
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
