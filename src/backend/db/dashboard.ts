import { Tables } from "../models/database.types";
import { supabase } from "../utils/database";

export async function getUserStats(
  email: string,
): Promise<Tables<"stats"> | null> {
  const { data, error } = await supabase
    .from("stats")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    return null;
  }

  if (!data) {
    const { data: newData, error: insertError } = await supabase
      .from("stats")
      .insert({ email })
      .select()
      .single();

    if (insertError) {
      return null;
    }

    return newData satisfies Tables<"stats">;
  }

  return data satisfies Tables<"stats">;
}
export async function getNotes(id: string, limit: number = 10) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .order("path", { ascending: false })
    .limit(limit);
  if (error && error.code !== "PGRST116") {
    return null;
  }
  return (data ?? []) satisfies Tables<"notes">[];
}

export async function getRecentGames(
  email: string,
  limit: number = 10,
): Promise<Tables<"game">[]> {
  const { data, error } = await supabase
    .from("game")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data ?? []) satisfies Tables<"game">[];
}
