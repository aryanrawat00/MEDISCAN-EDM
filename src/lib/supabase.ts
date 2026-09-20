import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

function makeClient(): SupabaseClient {
  if (!url || !anonKey) {
    // Stub client so the app renders even before keys are configured.
    // Any auth/data call will throw a clear error.
    const handler: ProxyHandler<object> = {
      get() {
        throw new Error(
          "Supabase is not configured. Copy .env.example to .env and set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.",
        );
      },
    };
    return new Proxy({}, handler) as unknown as SupabaseClient;
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = makeClient();

export const isSupabaseConfigured = Boolean(url && anonKey);
