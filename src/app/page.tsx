import Hero from "./Hero";
import NavBar from "./NavBar";

export default function Home() {
  return (
    <main className="bg-theme-purple/10 min-h-[100dvh] w-[100dvw] overflow-x-hidden">
      <NavBar />
      <Hero />
    </main>
  );
}
