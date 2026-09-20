/**
 * src/lib/auth.middleware.ts
 * T04: Server-side authentication middleware for TanStack Start server functions.
 * Browser: attaches the Supabase access token in Authorization header.
 * Server: verifies token against Supabase auth.getUser() before handler runs.
 */

import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export const requireUser = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    return next({
      headers: {
        Authorization: `Bearer ${data.session?.access_token ?? ""}`,
      },
    });
  })
  .server(async ({ next }) => {
    const authHeader = getRequestHeader("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new Error("AUTH_REQUIRED");
    }

    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseAnonKey =
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("AUTH_REQUIRED");
    }

    const verifier = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await verifier.auth.getUser(token);
    if (error || !data.user) {
      throw new Error("AUTH_REQUIRED");
    }

    return next({
      context: {
        userId: data.user.id,
        userEmail: data.user.email,
      },
    });
  });
