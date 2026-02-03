import { Button } from "@/ui";
import { Users, ArrowLeft, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface GameHeaderProps {
  topic: string;
  roundNumber: number;
}

export function GameHeader({ topic, roundNumber }: GameHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="special"
          onClick={() => {
            if (window.confirm("Are you sure you want to leave the game?")) {
              router.push("/");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <Users className="text-theme-blue h-5 w-5" />
            Boss Fight
          </h1>
          <p className="text-muted-foreground text-sm">Topic: {topic}</p>
        </div>
      </div>

      <div className="bg-muted flex items-center gap-2 rounded-full px-3 py-1.5">
        <Clock className="text-muted-foreground h-4 w-4" />
        <span className="font-semibold">Round {roundNumber}</span>
      </div>
    </div>
  );
}
