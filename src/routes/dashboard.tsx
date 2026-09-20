import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { listAnalyses, deleteAllAnalyses } from "@/lib/analyses";
import { useAuth } from "@/lib/auth-context";
import { FileText, Stethoscope, History as HistoryIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MediScan AI" }] }),
  component: () => (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  ),
});

function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: () => listAnalyses(10),
  });

  const clearAll = useMutation({
    mutationFn: deleteAllAnalyses,
    onSuccess: () => {
      toast.success("History cleared");
      qc.invalidateQueries({ queryKey: ["analyses"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Disclaimer className="max-w-md" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          to="/analyzer"
          icon={<FileText className="h-5 w-5" />}
          title="Analyze a report"
          desc="Paste a lab or radiology report"
        />
        <QuickAction
          to="/symptoms"
          icon={<Stethoscope className="h-5 w-5" />}
          title="Check symptoms"
          desc="Describe what you're feeling"
        />
        <QuickAction
          to="/history"
          icon={<HistoryIcon className="h-5 w-5" />}
          title="View history"
          desc="All your past analyses"
        />
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent analyses</h2>
          {analyses.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Delete ALL your saved history? This cannot be undone.")) {
                  clearAll.mutate();
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear all
            </Button>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : analyses.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No analyses yet. Try the{" "}
              <Link className="underline" to="/analyzer">
                Report Analyzer
              </Link>{" "}
              or{" "}
              <Link className="underline" to="/symptoms">
                Symptom Checker
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {analyses.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.kind} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Link
                    to="/history"
                    className="shrink-0 text-sm font-medium text-primary hover:underline"
                  >
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg brand-gradient text-white">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold group-hover:text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
