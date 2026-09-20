import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { listAnalyses, deleteAnalysis, type AnalysisRow } from "@/lib/analyses";
import { toast } from "sonner";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ResultView } from "@/components/history/ResultView";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — MediScan AI" }] }),
  component: () => (
    <AuthGate>
      <History />
    </AuthGate>
  ),
});

function History() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: () => listAnalyses(200),
  });
  const [open, setOpen] = useState<string | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteAnalysis(id),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["analyses"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Your history</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every analysis you save is stored in your own Supabase project.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No history yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((a) => (
              <li key={a.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setOpen(open === a.id ? null : a.id)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    {open === a.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.kind} · {format(new Date(a.created_at), "PPp")}
                      </p>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this analysis?")) del.mutate(a.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {open === a.id && <Detail a={a} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Detail({ a }: { a: AnalysisRow }) {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-5 text-sm shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Analysis Result
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          onClick={() => setShowInput(!showInput)}
        >
          {showInput ? "Hide Source Input" : "Show Source Input"}
        </Button>
      </div>

      {showInput && (
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Source Input</p>
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-foreground">
            {a.input}
          </pre>
        </div>
      )}

      <ResultView kind={a.kind} result={a.result} />
    </div>
  );
}
