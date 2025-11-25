import { Json } from "../models/database.types";
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
export async function uploadNotes(
  id: number,
  email: string,
  tags: Json,
  subject: string,
  path: string,
) {}
