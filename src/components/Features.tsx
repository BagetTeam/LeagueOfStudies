import { GraduationCap, Play, Trophy } from "lucide-react";

export default function Features() {
  return (
    <section className="flex w-full flex-col items-center justify-center p-10">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Turn your notes into competitive games in just three simple steps
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="game-card text-center">
          <div className="bg-theme-purple/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <GraduationCap className="text-theme-purple h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">1. Upload Your Notes</h3>
          <p className="text-muted-foreground">
            Upload your study materials or choose from existing subjects and
            topics
          </p>
        </div>

        <div className="game-card text-center">
          <div className="bg-theme-purple/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Play className="text-theme-purple h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">2. Generate Questions</h3>
          <p className="text-muted-foreground">
            Our AI creates perfect questions based on your content to test your
            knowledge
          </p>
        </div>

        <div className="game-card text-center">
          <div className="bg-theme-purple/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Trophy className="text-theme-purple h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">3. Play & Compete</h3>
          <p className="text-muted-foreground">
            Challenge yourself or compete with friends in exciting game modes
          </p>
        </div>
      </div>
    </section>
  );
}
