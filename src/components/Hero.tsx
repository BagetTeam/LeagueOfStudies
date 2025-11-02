"use client";

import { Button } from "@/ui";
import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="flex items-center p-10">
      <div className="flex basis-full flex-col-reverse items-center justify-between gap-12 md:flex-row">
        <div className="flex w-full flex-col gap-4">
          <h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
            Learn Faster, <span className="text-theme-purple">Together</span>
          </h1>
          <p className="text-muted-foreground text-xl">
            Transform studying into a fun, competitive game. Upload your notes,
            generate quizzes, and battle your friends in real-time!
          </p>
          <div className="flex w-full gap-4 font-bold">
            <Link href="/profile" className="w-fit">
              <Button
                className="bg-theme-purple text-background flex items-center justify-center gap-2 text-lg"
                variant="special"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/game" className="w-fit">
              <Button variant="normal" className="text-lg">
                Explore Game Modes
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}
