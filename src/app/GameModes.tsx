import { Button } from "@/ui";
import { Trophy, ArrowRight, Users } from "lucide-react";

export default function GameMode() {
  return (
    <section className="flex w-full flex-col justify-center p-10">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">Exciting Game Modes</h2>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Choose how you want to learn today
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="game-card border-theme-purple/30 hover:border-theme-purple transition-all">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-theme-orange/20 flex h-10 w-10 items-center justify-center rounded-full">
              <Trophy className="text-theme-orange h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold">Deathmatch</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Compete against friends to see who knows the material best. Each
            player has 5 lives - answer incorrectly and lose a life!
          </p>
          <Button className="bg-theme-orange hover:bg-theme-orange/80 gap-2">
            Play Deathmatch
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="game-card border-theme-purple/30 hover:border-theme-purple transition-all">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-theme-blue/20 flex h-10 w-10 items-center justify-center rounded-full">
              <Users className="text-theme-blue h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold">Boss Fight</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Team up with friends to defeat the boss! Answer questions correctly
            to deal damage, but be careful - wrong answers cost health!
          </p>
          <Button className="bg-theme-blue hover:bg-theme-blue/80 gap-2">
            Start Boss Fight
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
