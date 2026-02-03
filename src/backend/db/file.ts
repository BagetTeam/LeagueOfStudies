import { supabase } from "../utils/database";

export async function getNotes(id: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
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
    return null;
  }
  return data;
}
