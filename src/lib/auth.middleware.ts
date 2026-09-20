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
        isGuest: false,
        userId: data.user.id,
        userEmail: data.user.email,
      },
    });
  });

/**
 * In-memory rate limiting map for guest requests (10-minute sliding window).
 * Allows generous usage for hackathons/demos while preventing runaway abuse.
 */
const guestRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const GUEST_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const GUEST_MAX_REQUESTS = 30; // Max 30 guest requests per 10 mins per IP

function checkGuestRateLimit(ip: string): boolean {
  const now = Date.now();
  const current = guestRateLimitMap.get(ip);
  if (!current || now > current.resetAt) {
    guestRateLimitMap.set(ip, { count: 1, resetAt: now + GUEST_LIMIT_WINDOW_MS });
    return true;
  }
  if (current.count >= GUEST_MAX_REQUESTS) {
    return false;
  }
  current.count += 1;
  return true;
}

/**
 * Safe authentication middleware that permits both signed-in users and guest sessions.
 * Guest users receive an isolated context without database credentials or row-level permissions.
 */
export const resolveUserOrGuest = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: {
        Authorization: token ? `Bearer ${token}` : "Guest",
      },
    });
  })
  .server(async ({ next }) => {
    const authHeader = getRequestHeader("authorization") ?? "";
    const isExplicitGuest = authHeader.trim().toLowerCase() === "guest" || !authHeader.trim();
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (isExplicitGuest || !token) {
      const clientIp =
        getRequestHeader("cf-connecting-ip") ||
        getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
        "guest-session";

      if (!checkGuestRateLimit(clientIp)) {
        throw new Error(
          "GUEST_RATE_LIMIT: Guest analysis limit reached. Please sign in with an account for unlimited analyses.",
        );
      }

      return next({
        context: {
          isGuest: true as boolean,
          userId: null as string | null,
          userEmail: null as string | null,
        },
      });
    }

    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseAnonKey =
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return next({
        context: {
          isGuest: true as boolean,
          userId: null as string | null,
          userEmail: null as string | null,
        },
      });
    }

    const verifier = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await verifier.auth.getUser(token);
    if (error || !data.user) {
      // Degrade gracefully to guest session rather than crashing
      return next({
        context: {
          isGuest: true as boolean,
          userId: null as string | null,
          userEmail: null as string | null,
        },
      });
    }

    return next({
      context: {
        isGuest: false as boolean,
        userId: data.user.id as string | null,
        userEmail: (data.user.email ?? null) as string | null,
      },
    });
  });

