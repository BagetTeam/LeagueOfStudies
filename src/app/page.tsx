"use client";

import LobbyScreen from "@/components/LobbyScreen";
import NavBar from "./NavBar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  // const {data, error} = await supabase.from().se;
  const router = useRouter();
  useEffect(() => {
    const channel = supabase.channel("room1");
    channel
      .on("broadcast", { event: "cursor-pos" }, (payload) => {
        console.log("Cursor position received!", payload);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "cursor-pos",
            payload: { x: Math.random(), y: Math.random() },
          });
        }
      });
    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <main className="bg-primary/10 min-h-[100dvh] w-[100dvw] overflow-x-hidden">
      <NavBar />
      <button
        onClick={() => {
          router.push("/game");
        }}
      >
        Click me
      </button>
    </main>
  );
}
