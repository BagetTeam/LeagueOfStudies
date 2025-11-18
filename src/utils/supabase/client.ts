import { createBrowserClient } from "@supabase/ssr";

export function createSupClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_URL!,
    process.env.NEXT_PUBLIC_ANONKEY!,
  );
}
