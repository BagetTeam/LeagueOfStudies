import { Button } from "@/ui";
import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";

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
            <Link href="/signup" className="w-fit">
              <Button
                className="bg-theme-purple text-background flex items-center justify-center gap-2 text-lg"
                variant="special"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/game-modes" className="w-fit">
              <Button variant="normal" className="text-lg">
                Explore Game Modes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <div className="relative">
          <div className="bg-theme-purple/30 absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 transform rounded-full blur-3xl md:h-[500px] md:w-[500px]"></div>

          <div className="border-border mx-auto w-full max-w-lg rounded-2xl border bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-theme-purple flex h-8 w-8 items-center justify-center rounded-full">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold">Biology Quiz</h3>
              </div>
              <div className="bg-theme-purple/10 text-theme-purple rounded-full px-3 py-1 text-sm font-medium">
                Boss Fight
              </div>
            </div>
            <div className="border-border mb-4 rounded-lg border p-4">
              <p className="mb-2 font-medium">Question 4/10:</p>
              <p className="text-lg">
                Which organelle is responsible for protein synthesis in cells?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="hover:bg-muted p-3 text-left transition"
                variant="normal"
              >
                A. Mitochondria
              </Button>
              <Button
                className="hover:bg-muted p-3 text-left transition"
                variant="normal"
              >
                B. Nucleus
              </Button>
              <Button className="p-3 text-left text-white" variant="special">
                C. Ribosome
              </Button>
              <Button
                className="hover:bg-muted p-3 text-left transition"
                variant="normal"
              >
                D. Golgi Apparatus
              </Button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Team Health</p>
                <div className="health-bar mt-1 w-32">
                  <div
                    className="health-bar-fill"
                    style={{ width: "80%" }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Boss Health</p>
                <div className="health-bar mt-1 w-32">
                  <div
                    className="health-bar-fill bg-theme-orange"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
