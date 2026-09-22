import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

function isValidSupabaseUrl(val?: string): boolean {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim().replace(/^["']|["']$/g, "");
  try {
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      !trimmed.includes("your-supabase")
    );
  } catch {
    return false;
  }
}

const isConfigured = Boolean(
  isValidSupabaseUrl(rawUrl) &&
    rawAnonKey &&
    !rawAnonKey.includes("your-supabase")
);

function makeClient(): SupabaseClient {
  if (!isConfigured || !rawUrl || !rawAnonKey) {
    // Stub client so the app renders even before keys are configured.
    // Any auth/data call will throw a clear error.
    const handler: ProxyHandler<object> = {
      get() {
        throw new Error(
          "Supabase is not configured. Set valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.",
        );
      },
    };
    return new Proxy({}, handler) as unknown as SupabaseClient;
  }

  const cleanUrl = rawUrl.trim().replace(/^["']|["']$/g, "");
  const cleanKey = rawAnonKey.trim().replace(/^["']|["']$/g, "");

  try {
    return createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn("[supabase] Failed to create Supabase client, falling back to stub:", err);
    const handler: ProxyHandler<object> = {
      get() {
        throw new Error("Supabase is not configured properly: " + String(err));
      },
    };
    return new Proxy({}, handler) as unknown as SupabaseClient;
  }
}

export const supabase = makeClient();

export const isSupabaseConfigured = isConfigured;

