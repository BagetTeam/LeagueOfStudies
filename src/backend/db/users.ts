import { Tables } from "../models/database.types";
import { supabase } from "../utils/database";

export async function getUser(
  email: string,
  name: string,
): Promise<Tables<"users"> | null> {
  let res = await supabase.from("users").select("*").eq("email", email);

  if (res.data === null) {
    return null;
  }

  if (!res.count || res.count === 0) {
    await supabase.from("users").insert({ name, email });

    res = await supabase.from("users").select("*").eq("email", email);

    if (res.data === null) {
      return null;
    }
  }

  return res.data[0] satisfies Tables<"users">;
}
