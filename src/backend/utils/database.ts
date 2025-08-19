import { Database } from "../models/database.types";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_URL!,
  process.env.NEXT_PUBLIC_ANONKEY!,
);
