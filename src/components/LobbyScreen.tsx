import { supabase } from "@/lib/supabaseClient";
import { GameMode, Player } from "@/types/types";
import { Button } from "@/ui";
import { Switch } from "@/ui/switch";
import { ArrowLeft, Copy, Play, Share2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import PlayerList from "./PlayerList";

type LobbyScreenProps = LobbyProps;

function LobbyScreen({
  gameId,
  players,
  currentPlayer,
  selectedMode,
  onStartGame,
  onBackToMenu,
  isPublic,
}: LobbyScreenProps) {
  const [showNameDialogue, setShowNameDialogue] = useState(true);

  return (
    <div className="animate-fade-in flex max-w-2xl flex-col items-center justify-center space-y-6">
      <Lobby
        gameId={gameId}
        players={players}
        currentPlayer={currentPlayer}
        selectedMode={selectedMode}
        onStartGame={onStartGame}
        onBackToMenu={onBackToMenu}
        isPublic={isPublic}
      />
    </div>
  );
}

type LobbyProps = {
  gameId: string;
  players: Player[];
  currentPlayer: Player;
  selectedMode: GameMode;
  onStartGame: () => void;
  onBackToMenu: (players: Player[]) => void;
  //   dispatch: ActionDispatch<[action: GameOpsAction]>;
  isPublic: boolean;
};
function Lobby({
  gameId,
  players,
  selectedMode,
  onBackToMenu,
  currentPlayer,
  onStartGame,
  //   dispatch,
  isPublic,
}: LobbyProps) {
  const gameUrl = `http://localhost:3000?join=${gameId}`;
  const [currentIsPublic, setIsPublic] = useState(isPublic);
  const channel = supabase.channel(gameId);

  useEffect(() => {
    channel
      .on("broadcast", { event: "join" }, ({ newPresence }) => {
        console.log("NEWLY JOINED MEMBER");
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    // connection.on("SetGameMode", (mode: string) => {
    //   dispatch({
    //     type: "setGameMode",
    //     gameMode: JSON.parse(mode),
    //   });
    // });

    // connection.on("AddUnloadEventListener", (player: string) => {
    //   const p: Player = JSON.parse(player);

    //   const f = async () => {
    //     await connection.send("RemovePlayer", gameId, p.id);
    //     window.removeEventListener("beforeunload", f);
    //   };

    //   window.addEventListener("beforeunload", f);

    //   dispatch({
    //     type: "setCurrentPlayer",
    //     player: p,
    //   });
    // });

    // if (!currentPlayer.hasComplete) {
    //   console.log(JSON.stringify(currentPlayer));
    //   connection
    //     .send(
    //       "JoinLobby",
    //       gameId,
    //       currentPlayer.name,
    //       selectedMode.type,
    //       selectedMode.count,
    //     )
    //     .catch();
    //   console.log(JSON.stringify(players));
    // }
    // console.log(JSON.stringify(players));
    return () => {
      channel.unsubscribe;
    };
  }, []);

  //   const changePublicPrivate = async () => {
  //     var newState = !currentIsPublic;
  //     setIsPublic(newState);
  //     try {
  //       await connection.send("ChangePublic", gameId);
  //     } catch {
  //       setIsPublic(!newState);
  //     }
  //   };

  const copyInviteLink = () => {
    console.log(JSON.stringify(players));
    navigator.clipboard.writeText(gameUrl);
    //toast.success("Invite link copied to clipboard");
  };

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Math Race Quest game!",
          text: "Join me for a math racing challenge!",
          url: gameUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };
  //   const canStart = (): boolean => {
  //     return !players.some((p) => !p.hasComplete);
  //   };
  //   // Display game mode info
  //   const getModeDescription = () => {
  //     if (selectedMode.type === "equations") {
  //       return `First to solve ${selectedMode.count} equations wins`;
  //     } else {
  //       return `Solve the most equations in ${selectedMode.count} seconds`;
  //     }
  //   };

  return (
    <>
      <div className="w-full">
        <Button
          variant="special"
          onClick={() => onBackToMenu(players)}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Button>

        <h1 className="mb-2 text-center text-3xl font-bold">Game Lobby</h1>
        <p className="text-muted-foreground mb-6 text-center">{"ahh mode"}</p>
      </div>
      {/* {currentPlayer.isHost && (
        <div className="bg-secondary/30 border-secondary w-full rounded-lg border p-4">
          <div className="flex flex-col items-start pb-2">
            <div className="text-[15px] text-gray-800">Game Settings</div>
            <div className="text-xs text-gray-500">
              Only the host can modify these settings
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex flex-col items-start">
              <div className="text-[15px] text-gray-800">Public Lobby</div>
              <div className="text-xs text-gray-500">
                Allow anyone to join without an invite
              </div>
            </div>
            <Switch
              checked={isPublic}
              //   onCheckedChange={changePublicPrivate}
              className="data-[state=checked]:bg-primary"
            ></Switch>
          </div>
        </div>
      )} */}

      <div className="bg-secondary/30 border-secondary w-full rounded-lg border p-4">
        <div className="mb-2 flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="text-sm font-medium">
            Share this link to invite players:
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="special"
              onClick={copyInviteLink}
              className="flex items-center gap-1"
            >
              <Copy size={14} />
              <span>Copy</span>
            </Button>
            <Button
              variant="special"
              onClick={shareInviteLink}
              className="flex items-center gap-1"
            >
              <Share2 size={14} />
              <span>Share</span>
            </Button>
          </div>
        </div>
        <div className="bg-background truncate rounded border p-2 text-xs">
          {gameUrl}
        </div>
      </div>

      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Players ({players.length})</h2>
          {/* {currentPlayer.isHost && players.length > 1 && canStart() && (
            <Button
              onClick={async () => {
                onStartGame();
              }}
              className="math-button-primary flex items-center gap-2"
            >
              <Play size={16} />
              <span>Start Game</span>
            </Button>
          )} */}
        </div>

        <PlayerList
          players={players}
          currentPlayerId={currentPlayer.id}
          gameMode={selectedMode}
        />

        {/* {(players.length < 2 || !canStart()) && (
          <p className="text-muted-foreground mt-4 text-center text-sm">
            Waiting for more players to join...
          </p>
        )} */}
      </div>
    </>
  );
}

export default LobbyScreen;
