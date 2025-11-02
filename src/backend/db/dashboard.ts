import { Tables } from "../models/database.types";
import { supabase } from "../utils/database";

export async function getUserStats(
  email: string,
): Promise<Tables<"stats"> | null> {
  let res = await supabase.from("stats").select("*").eq("email", email);

  if (res.data === null) {
    return null;
  }

  if (!res.count || res.count === 0) {
    await supabase.from("stats").insert({ email });

    res = await supabase.from("stats").select("*").eq("email", email);

    if (res.data === null) {
      return null;
    }
  }

  return res.data[0] satisfies Tables<"stats">;
}

export async function getRecentGames(email: string): Promise<Tables<"game">[]> {
  const res = await supabase.from("game").select("*").eq("email", email);

  return (res.data ?? []) satisfies Tables<"game">[];
}
