import { Database } from "../models/database.types";
import { createBrowserClient } from "@supabase/ssr";

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_URL!,
      process.env.NEXT_PUBLIC_ANONKEY!,
    );
  }
  return supabaseInstance;
})();
