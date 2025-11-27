import { supabase } from "../utils/database";

export async function getNotes(id: number) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("Error fetching user stats:", error);
    return;
  }
  return data;
}
