import { Tables } from "../models/database.types";
import { supabase } from "../utils/database";

export async function getUserStats(
  email: string,
): Promise<Tables<"stats"> | null> {
  // Use .single() for better performance and error handling
  const { data, error } = await supabase
    .from("stats")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" which is expected if no row exists
    console.error("Error fetching user stats:", error);
    return null;
  }

  // If no data exists, insert and return the new row
  if (!data) {
    const { data: newData, error: insertError } = await supabase
      .from("stats")
      .insert({ email })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting user stats:", insertError);
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
    // PGRST116 is "not found" which is expected if no row exists
    console.error("Error fetching user notes:", error);
    return null;
  }
  return (data ?? []) satisfies Tables<"notes">[];
}

export async function getRecentGames(
  email: string,
  limit: number = 10,
): Promise<Tables<"game">[]> {
  // Add limit and ordering for better performance
  const { data, error } = await supabase
    .from("game")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent games:", error);
    return [];
  }

  return (data ?? []) satisfies Tables<"game">[];
}
