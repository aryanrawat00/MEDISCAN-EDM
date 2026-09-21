import { T } from "@/lib/i18n";
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && configured && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, configured, navigate]);

  if (!configured) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold"> <T>{"Backend not configured"}</T> </h2>
        <p className="mt-2 text-muted-foreground">
           <T>{"Add your Supabase keys to"}</T> <code className="rounded bg-muted px-1.5 py-0.5">.env</code>{" "}
           <T>{"and restart the dev server."}</T> </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}
