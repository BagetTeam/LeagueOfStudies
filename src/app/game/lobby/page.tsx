"use client";

import { Lobby, Player, Question } from "@/types/types";
import { Button } from "@/ui";
import { ArrowLeft, Copy, Play, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import PlayerList from "@/components/PlayerList";
import { useGame } from "@/GameContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getQuestions } from "@/backend/services/game-questions";
import PDF_reader from "@/app/pdf_reader/reader";
import { BROADCAST_EVENTS } from "@/GameContext";
import { defaultLobby } from "@/gameState";
import {
  BroadcastingPayloads,
  GameStateActionPayloads,
} from "@/types/gameStatePayloads";
import { createBroadcastPayload } from "@/utils/utils";

export default function LobbyScreen() {
  const { gameState, dispatch, broadcastAndDispatch } = useGame();
  const { player, lobby } = gameState;
  const { lobbyId, gameMode, subject, questions, players } = lobby;

  const [studyText, setStudyText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [gameUrl, setGameUrl] = useState<string>(`/game?join=${lobbyId}`);

  const router = useRouter();

  useEffect(() => {
    setGameUrl(`${window.location.origin}/game?join=${lobbyId}`);
  }, [lobbyId]);

  const urlSearchParams = useSearchParams();
  const joinLobbyId = urlSearchParams.get("join");

  const generateQuestions = async (topic: string | null) => {
    try {
      setLoading(true);
      topic = topic ?? subject;

      const fetchedQuestions = (await getQuestions(topic)) satisfies Question[];

      if (player.state === "lobby") {
        const { event, payload } = createBroadcastPayload(
          BROADCAST_EVENTS.SET_QUESTIONS,
          { questions: fetchedQuestions },
        );

        broadcastAndDispatch(event, payload);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // Initialize Lobby
  useEffect(() => {
    if (lobbyId == "") {
      const newPlayerId = crypto.randomUUID();
      const newPlayerName = newPlayerId.substring(0, 8);
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
          subject: subject,
        };
        updatedPlayer.isHost = true;
        dispatch({
          type: "joinLobby",
          payload: { lobby: newLobby, player: updatedPlayer },
        });
      }
    }
  }, []);

  const fetchingRef = useRef(false);

  // initialize questions
  useEffect(() => {
    if (!player.isHost) return;

    if (!questions || (questions.length === 0 && subject)) {
      if (fetchingRef.current) return;

      fetchingRef.current = true;

      generateQuestions(subject);
      fetchingRef.current = false;
    }
  }, [player.isHost, subject, questions, dispatch, broadcastAndDispatch]);

  // starting game
  useEffect(() => {
    if (player.state === "playing") {
      if (lobby.gameMode.type === "deathmatch") {
        router.push("/game/deathmatch"); // Adjust path as needed
      } else if (lobby.gameMode.type === "bossfight") {
        router.push("/game/bossbattle"); // Adjust path as needed
      }
    }
  }, [player.state]);

  const startGame = () => {
    if (player.isHost && players.length > 0) {
      const { event, payload } = createBroadcastPayload(
        BROADCAST_EVENTS.START_GAME,
        {
          initialPlayers: lobby.players,
          gameMode: lobby.gameMode,
          questions: lobby.questions,
        },
      );
      broadcastAndDispatch(event, payload);
    } else {
      console.warn("Cannot start game: Not host or no players.");
    }
  };

  const handleBackToMenuClick = () => {
    console.log("Leaving lobby...");
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
        console.log("Link shared successfully");
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
    <div className="flex w-full basis-full gap-8 p-4">
      {player.isHost && (
        <div className="flex h-full basis-full flex-col items-center justify-start bg-gray-100 p-8">
          <h1 className="mb-8 text-3xl font-bold">Study Question Generator</h1>
          <textarea
            value={studyText}
            onChange={handleChange}
            placeholder="Write your study material here..."
            className="h-56 w-full max-w-3xl resize-none rounded-lg border border-gray-300 p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <div className="my-8">
            <PDF_reader onExtract={(text: string) => setStudyText(text)} />
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
            className="..."
          >
            {loading ? "Generating..." : "Submit"}
          </button>

          {/* Display questions */}
          {questions.length > 0 && (
            <div className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-6">
              {questions.map((qa, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg"
                >
                  <h2 className="mb-2 text-xl font-bold">{qa.question}</h2>
                  <p className="text-gray-700">{qa.options[idx]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex basis-1/2 flex-col items-center gap-4 p-4">
        {/* Back Button */}
        <Button
          onClick={handleBackToMenuClick}
          className="mb-4 flex items-center gap-2 self-start" // Align left
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Button>

        {/* Lobby Title */}
        <h1 className="mb-2 text-center text-3xl font-bold">Game Lobby</h1>
        {/* Display Game Mode */}
        <p className="text-muted-foreground mb-6 text-center capitalize">
          Mode: {lobby.gameMode.type}{" "}
          {lobby.gameMode.type === "deathmatch"
            ? `(${lobby.gameMode.data.time}s)`
            : ""}
        </p>

        {/* Invite Section */}
        <div className="bg-secondary/30 border-secondary flex w-full flex-col gap-3 rounded-lg border p-4">
          <div className="text-center text-sm font-medium md:text-left">
            Invite players with this link:
          </div>
          <div className="bg-background truncate rounded border p-2 text-center font-mono text-xs select-all">
            {gameUrl}
          </div>
          <div className="flex items-center justify-center gap-2">
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
        <div className="mt-4 w-full">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Players ({players.length})
            </h2>
            {/* Start Game Button for Host */}
            {player.isHost && (
              <Button
                onClick={startGame}
                disabled={
                  players.length < 1 ||
                  loading ||
                  questions.length == 0 ||
                  (players.length < 2 && gameMode.type === "deathmatch")
                }
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <Play size={16} />
                {loading ? (
                  <span>Loading...</span>
                ) : players.length < 2 && gameMode.type === "deathmatch" ? (
                  <span>Waiting for players...</span>
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
