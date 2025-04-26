import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface GameHeaderProps {
  subject: string;
  topic: string;
  roundNumber: number;
}

export function GameHeader({ subject, topic, roundNumber }: GameHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (window.confirm("Are you sure you want to leave the game?")) {
              router.push("/game-modes");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-theme-blue" />
            Boss Fight: {subject}
          </h1>
          <p className="text-sm text-muted-foreground">Topic: {topic}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">Round {roundNumber}</span>
      </div>
    </div>
  );
}
