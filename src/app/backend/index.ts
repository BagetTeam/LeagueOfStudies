"use server";

import { Database, Tables } from "@/database.types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient<Database>(process.env.URL!, process.env.ANONKEY!);

export async function getUser(
  email: string,
  name: string,
): Promise<Tables<"users"> | null> {
  let res = await supabase.from("users").select("*").eq("email", email);

  if (res.data === null) {
    return null;
  }
  console.log("data", res.data);

  if (!res.count || res.count === 0) {
    await supabase.from("users").insert({ name, email });

    res = await supabase.from("users").select("*").eq("email", email);

    if (res.data === null) {
      return null;
    }
  }

  return res.data[0] satisfies Tables<"users">;
}

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
