import { T } from "@/lib/i18n";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Stethoscope } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — MediScan AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading, configured, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6">
      <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl brand-gradient text-white">
          <Stethoscope className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-center text-2xl font-semibold"> <T>{"Welcome to MediScan AI"}</T> </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
           <T>{"Sign in with Google to save your analyses securely."}</T> </p>

        {!configured && (
          <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
             <T>{"Supabase keys are missing. Set"}</T> <code>VITE_SUPABASE_URL</code>  <T>{"and"}</T> {" "}
            <code>VITE_SUPABASE_ANON_KEY</code>  <T>{"in your"}</T> <code>.env</code>.
          </div>
        )}

        <Button
          className="mt-6 w-full"
          size="lg"
          variant="outline"
          disabled={!configured || loading}
          onClick={() => signInWithGoogle()}
        >
          <GoogleIcon />  <T>{"Continue with Google"}</T> </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground"> <T>{"or try instantly"}</T> </span>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          variant="secondary"
          onClick={() => navigate({ to: "/analyzer" })}
        >
           <T>{"Continue as Guest"}</T> </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
           <T>{"Guest mode gives you full access to Report Analysis and Medicine Packaging Lens. No account required."}</T> </p>

        <p className="mt-6 text-center text-[11px] text-muted-foreground/80">
           <T>{"Educational use only · Never a substitute for qualified professional medical care."}</T> </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.48l2.64-2.55C16.86 3.34 14.66 2.4 12 2.4 6.96 2.4 2.9 6.46 2.9 11.5S6.96 20.6 12 20.6c6.9 0 9.18-4.84 9.18-7.36 0-.5-.05-.88-.12-1.24H12z" />
    </svg>
  );
}
