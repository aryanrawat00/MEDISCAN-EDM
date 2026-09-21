import { T, useI18n } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — MediScan AI" }] }),
  component: () => (
    <AuthGate>
      <Profile />
    </AuthGate>
  ),
});

function Profile() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? user.user_metadata?.full_name ?? "");
        setLoading(false);
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email, full_name: fullName, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t("Profile saved"));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold"> <T>{"Profile"}</T> </h1>
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full brand-gradient text-xl font-semibold text-white">
            {(user?.email?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground"> <T>{"User ID:"}</T> {user?.id}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="full_name"> <T>{"Full name"}</T> </Label>
            <input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button onClick={save} disabled={saving || loading} className="brand-gradient text-white">
            {saving ? t("Saving…") : t("Save changes")}
          </Button>
        </div>
      </div>
    </div>
  );
}
