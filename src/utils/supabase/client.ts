import { createBrowserClient } from "@supabase/ssr";
import { env } from "../env";
import { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
