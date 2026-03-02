import { Tables } from "../models/database.types";
import { supabase } from "../utils/database";

export async function getUser(
  email: string,
  name: string,
): Promise<Tables<"users"> | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    return null;
  }

  if (!data) {
    const { data: newData, error: insertError } = await supabase
      .from("users")
      .insert({ name, email })
      .select()
      .single();

    if (insertError) {
      return null;
    }

    return newData satisfies Tables<"users">;
  }

  return data satisfies Tables<"users">;
}
