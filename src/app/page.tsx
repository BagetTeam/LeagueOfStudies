import NavBar from "./NavBar";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  // const {data, error} = await supabase.from().se;
  return (
    <main className="bg-primary/10 min-h-[100dvh] w-[100dvw] overflow-x-hidden">
      <NavBar />
    </main>
  );
}
