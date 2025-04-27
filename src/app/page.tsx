"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
// import { useRouter } from "next/navigation";

import { Button } from "@/ui";
import Features from "./Features";
import GameMode from "./GameModes";
import Hero from "./Hero";
import Link from "next/link";
import Footer from "./Footer";

export default function Home() {
  // const {data, error} = await supabase.from().se;
  // const router = useRouter();
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
    <main className="w-full">
      <Hero />
      <Features />
      <GameMode />

      <section className="bg-theme-purple w-full justify-center p-10">
        <div className="mx-auto max-w-2xl text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Make Learning Fun?
          </h2>
          <p className="mb-8 opacity-90">
            Join thousands of students who are transforming the way they study.
            Sign up for free and start your learning journey today!
          </p>
          <Link href="/signup">
            <Button className="text-theme-purple bg-white text-lg hover:bg-white/90">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
