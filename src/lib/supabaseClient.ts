import "./envConfig.ts";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/types";

const supabaseUrl = process.env.URL;
const supabaseAnonKey = process.env.ANONKEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key must be defined in environment variables",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
