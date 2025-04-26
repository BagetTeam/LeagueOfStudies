"use client";

import NavBar from "./NavBar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

export default function Home() {
  // const {data, error} = await supabase.from().se;
  useEffect(() => {
    const channel = supabase.channel("room1");
    channel
      .on("broadcast", { event: "cursor-pos" }, (payload) => {
        console.log("Cursor position received!", payload);
      })
      .subscribe(async (status) => {
        console.log("SUBSCRIPTED");
        console.log(status);
        if (status === "SUBSCRIBED") {
          console.log("HI");
          console.log(
            await channel.send({
              type: "broadcast",
              event: "cursor-pos",
              payload: { x: Math.random(), y: Math.random() },
            }),
          );
        }
      });
    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <main className="bg-primary/10 min-h-[100dvh] w-[100dvw] overflow-x-hidden">
      <NavBar />
    </main>
  );
}
