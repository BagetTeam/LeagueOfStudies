"use client";

import { Lobby, Player, Question } from "@/types/types";
import { Button } from "@/ui";
import { ArrowLeft, Copy, Play, Share2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import PlayerList from "@/components/PlayerList";
import { useGame } from "@/GameContext";
import { useUser } from "@/lib/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getQuestions } from "@/backend/services/game-questions";
import PDF_reader from "@/app/pdf_reader/reader";
import { BROADCAST_EVENTS } from "@/GameContext";
import { defaultLobby } from "@/gameState";
import { createBroadcastPayload } from "@/utils/utils";

export default function LobbyScreen() {
  const { gameState, dispatch, broadcastAndDispatch } = useGame();
  const { player, lobby } = gameState;
  const { lobbyId, gameMode, title, subject, questions, players } = lobby;
  const gameSubject = subject ?? "Rust";
  const gameTitle = title;

  const user = useUser();

  const [studyText, setStudyText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [gameUrl, setGameUrl] = useState<string>(`/game/lobby?join=${lobbyId}`);

  const router = useRouter();

  useEffect(() => {
    setGameUrl(`${window.location.origin}/game/lobby?join=${lobbyId}`);
  }, [lobbyId]);

  const urlSearchParams = useSearchParams();
  const joinLobbyId = urlSearchParams.get("join");

  const generateQuestions = useCallback(
    async (topic: string | null) => {
      try {
        setLoading(true);
        topic = topic ?? gameSubject;

        const fetchedQuestions = (await getQuestions(
          topic,
        )) satisfies Question[];

        if (player.state === "lobby") {
          const { event, payload } = createBroadcastPayload(
            BROADCAST_EVENTS.setQuestions,
            { questions: fetchedQuestions },
          );

          broadcastAndDispatch(event, payload);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [gameSubject, player.state, broadcastAndDispatch],
  );

  // Initialize Lobby
  useEffect(() => {
    if (lobbyId == "") {
      const newPlayerId = crypto.randomUUID();
      const newPlayerName = user.user
        ? user.user.user_metadata.full_name.split(" ")[0]
        : newPlayerId.substring(0, 8);
      const updatedPlayer: Player = {
        ...player,
        playerId: newPlayerId,
        name: newPlayerName,
      };

      // join lobby
      if (joinLobbyId) {
        const joinLobby: Lobby = { ...lobby, lobbyId: joinLobbyId };
        dispatch({
          type: "joinLobby",
          payload: { lobby: joinLobby, player: updatedPlayer },
        }); // TODO fix this
      }
      // create lobby
      else {
        const newLobbyId = "game-" + crypto.randomUUID().toString();
        const newLobby: Lobby = {
          ...defaultLobby,
          lobbyId: newLobbyId,
          gameMode: gameMode,
          subject: gameSubject,
          title: gameTitle,
        };
        updatedPlayer.isHost = true;
        dispatch({
          type: "joinLobby",
          payload: { lobby: newLobby, player: updatedPlayer },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchingRef = useRef(false);

  // initialize questions
  useEffect(() => {
    if (!player.isHost) return;

    if (!questions || (questions.length === 0 && gameSubject)) {
      if (fetchingRef.current) return;

      fetchingRef.current = true;

      generateQuestions(gameSubject).finally(() => {
        fetchingRef.current = false;
      });
    }
  }, [
    player.isHost,
    title,
    subject,
    questions,
    gameSubject,
    generateQuestions,
  ]);

  // starting game
  useEffect(() => {
    if (player.state === "playing") {
      if (lobby.gameMode.type === "deathmatch") {
        router.push("/game/deathmatch");
      } else if (lobby.gameMode.type === "bossfight") {
        router.push("/game/bossbattle");
      }
    }
  }, [player.state, lobby.gameMode.type, router]);

  const startGame = () => {
    if (player.isHost && players.length > 0) {
      let startGameMode;
      if (lobby.gameMode.type === "bossfight") {
        startGameMode = {
          ...lobby.gameMode,
          data: { ...lobby.gameMode.data, bossHealth: 100 },
        };
      } else if (lobby.gameMode.type === "deathmatch") {
        startGameMode = {
          ...lobby.gameMode,
          data: { ...lobby.gameMode.data, activePlayerIndex: 0 },
        };
      }

      const { event, payload } = createBroadcastPayload(
        BROADCAST_EVENTS.setStartGame,
        {
          initialPlayers: lobby.players,
          gameMode: startGameMode!,
          questions: lobby.questions,
        },
      );
      broadcastAndDispatch(event, payload);
    } else {
      console.warn("Cannot start game: Not host or no players.");
    }
  };

  const handleBackToMenuClick = () => {
    dispatch({ type: "exitLobby", payload: {} });
    router.push("/");
  };

  const copyInviteLink = () => {
    navigator.clipboard
      .writeText(gameUrl)
      .then(() => console.log("Invite link copied"))
      .catch((err) => console.error("Failed to copy link: ", err));
  };

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Quiz Game!",
          text: "Join me for a fun quiz challenge!",
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStudyText(e.target.value);
  };

  return (
    <div className="flex w-full basis-full flex-col gap-6 p-4 min-[1150px]:flex-row min-[1150px]:gap-8 min-[1150px]:p-6">
      {player.isHost && (
        <div className="order-2 flex min-h-0 flex-1 flex-col items-center justify-start bg-gray-100 p-4 min-[1150px]:order-1 min-[1150px]:max-w-xl min-[1150px]:shrink-0 min-[1150px]:p-6">
          <h1 className="mb-4 text-2xl font-bold min-[1150px]:mb-6 min-[1150px]:text-2xl">Study Question Generator</h1>
          <textarea
            value={studyText}
            onChange={handleChange}
            placeholder="Write your study material here..."
            className="h-40 w-full max-w-3xl resize-none rounded-lg border border-gray-300 p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 min-[1150px]:h-44 min-[1150px]:max-w-xl"
          />
          <div className="my-4 min-[1150px]:my-6">
            <PDF_reader
              file={false}
              onExtract={(text: string) => setStudyText(text)}
            />
          </div>
          <button
            onClick={async () => {
              if (!studyText) return; // Prevent empty submissions

              dispatch({
                type: "setGameSubject",
                payload: { subject: studyText },
              });
              generateQuestions(studyText);
            }}
            disabled={loading || !studyText} // Disable if loading or no text
            className="w-full max-w-3xl border border-black bg-white px-4 py-3 text-black shadow-[2px_2px_0_0_black] transition-shadow hover:shadow-[1px_1px_0_0_black] disabled:opacity-50 min-[1150px]:max-w-xl min-[1150px]:w-full"
          >
            {loading ? "Generating..." : "Submit"}
          </button>

          {/* Display questions */}
          {questions.length > 0 && (
            <div className="mt-6 grid w-full max-w-5xl grid-cols-1 gap-4 min-[1150px]:mt-6 min-[1150px]:max-w-xl min-[1150px]:gap-4">
              {questions.map((qa, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-white p-4 shadow-md transition hover:shadow-lg min-[1150px]:p-4"
                >
                  <h2 className="mb-2 text-base font-bold min-[1150px]:text-sm">{qa.question}</h2>
                  <p className="text-gray-700 text-sm min-[1150px]:text-xs">{qa.options[idx]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="order-1 flex min-w-0 flex-1 flex-col items-center gap-4 p-4 min-[1150px]:order-2 min-[1150px]:basis-0 min-[1150px]:p-6">
        {/* Back Button */}
        <Button
          onClick={handleBackToMenuClick}
          className="mb-2 flex items-center gap-2 self-start min-[1150px]:mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Button>

        {/* Lobby Title */}
        <h1 className="mb-2 text-center text-2xl font-bold min-[1150px]:text-3xl">Game Lobby</h1>
        {/* Display Game Mode */}
        <p className="text-muted-foreground mb-4 text-center text-sm capitalize min-[1150px]:mb-6 min-[1150px]:text-base">
          Mode: {lobby.gameMode.type}{" "}
          {lobby.gameMode.type === "deathmatch"
            ? `(${lobby.gameMode.data.time}s)`
            : ""}
        </p>

        {/* Invite Section */}
        <div className="bg-secondary/30 border-secondary flex w-full flex-col gap-3 rounded-lg border p-3 min-[1150px]:p-4">
          <div className="text-center text-xs font-medium min-[1150px]:text-left min-[1150px]:text-sm">
            Invite players with this link:
          </div>
          <div className="bg-background max-w-full truncate rounded border p-2 text-center font-mono text-xs select-all">
            {gameUrl}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 min-[1150px]:flex-nowrap">
            <Button
              onClick={copyInviteLink}
              className="flex items-center gap-1"
            >
              <Copy size={14} />
              <span>Copy</span>
            </Button>
            {
              <Button
                onClick={shareInviteLink}
                className="flex items-center gap-1"
              >
                <Share2 size={14} />
                <span>Share</span>
              </Button>
            }
          </div>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Game ID: {lobbyId}
          </p>
        </div>

        {/* Player List Section */}
        <div className="mt-2 w-full min-w-0 min-[1150px]:mt-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold min-[1150px]:text-lg">
              Players ({players.length})
            </h2>
            {/* Start Game Button for Host */}
            {player.isHost && (
              <Button
                onClick={startGame}
                disabled={
                  players.length < 1 ||
                  loading ||
                  questions.length === 0 ||
                  (players.length < 2 && gameMode.type === "deathmatch")
                }
                className="flex w-full items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 sm:w-auto"
              >
                <Play size={16} />
                {loading ? (
                  <span>Loading...</span>
                ) : players.length < 2 && gameMode.type === "deathmatch" ? (
                  <span>Waiting for players...</span>
                ) : questions.length === 0 ? (
                  <span>Generating Questions...</span>
                ) : (
                  <span>Start Game</span>
                )}
              </Button>
            )}
          </div>

          {/* Player List Component */}
          {players.length > 0 ? (
            <PlayerList players={players} currentPlayerId={player.playerId} />
          ) : (
            <p className="text-muted-foreground py-4 text-center">
              Waiting for players...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
