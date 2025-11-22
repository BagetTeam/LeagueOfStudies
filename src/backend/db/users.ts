import { Tables } from "../models/database.types";
import { supabase } from "../utils/database";

export async function getUser(
  email: string,
  name: string,
): Promise<Tables<"users"> | null> {
  // Use .single() for better performance and error handling
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" which is expected if no row exists
    console.error("Error fetching user:", error);
    return null;
  }

  // If no data exists, insert and return the new row
  if (!data) {
    const { data: newData, error: insertError } = await supabase
      .from("users")
      .insert({ name, email })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting user:", insertError);
      return null;
    }

    return newData satisfies Tables<"users">;
  }

  return data satisfies Tables<"users">;
}
