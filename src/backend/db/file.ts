import { supabase } from "../utils/database";

export async function getNotes(id: string) {
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

export async function getFileByPath(prim: string, userId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("prim", prim)
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("Error fetching file by path:", error);
    return null;
  }
  return data;
}
