"use client";

import { Button } from "@/ui";
import Features from "@/components/Features";
import GameMode from "../components/GameModes";
import Hero from "../components/Hero";
import Link from "next/link";
import Footer from "../components/Footer";

export default function Home() {
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
          <Link href="/signup" className="flex justify-center">
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
