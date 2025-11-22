import { Database } from "../models/database.types";
import { createBrowserClient } from "@supabase/ssr";

// Use browser client for client-side usage (most common case)
// This provides better connection pooling and performance
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
