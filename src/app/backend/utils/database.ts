import { Database } from "../models/database.types";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient<Database>(
  process.env.URL!,
  process.env.ANONKEY!,
);
