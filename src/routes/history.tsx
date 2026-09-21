import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listAnalyses, deleteAnalysis, type AnalysisRow } from "@/lib/analyses";
import { toast } from "sonner";
import {
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  Pill,
  Activity,
  History as HistoryIcon,
  Sparkles,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { ResultView } from "@/components/history/ResultView";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Analysis History — MediScan AI" }] }),
  component: () => (
    <AuthGate>
      <History />
    </AuthGate>
  ),
});

const KIND_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  report: {
    label: "Report",
    icon: <FileText className="h-3 w-3" />,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  medicine: {
    label: "Medicine",
    icon: <Pill className="h-3 w-3" />,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  symptom: {
    label: "Symptom",
    icon: <Activity className="h-3 w-3" />,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
};

function History() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: () => listAnalyses(200),
  });
  const [open, setOpen] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = items;
    if (kindFilter) list = list.filter((a) => a.kind === kindFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.kind.toLowerCase().includes(q));
    }
    return list;
  }, [items, kindFilter, search]);

  const kindCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of items) m[a.kind] = (m[a.kind] || 0) + 1;
    return m;
  }, [items]);

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
      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white">
          <HistoryIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analysis History</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} saved {items.length === 1 ? "analysis" : "analyses"}
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      {items.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <button
              onClick={() => setKindFilter(null)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                !kindFilter
                  ? "border-foreground/30 bg-foreground/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              All ({items.length})
            </button>
            {Object.entries(kindCounts).map(([kind, count]) => {
              const meta = KIND_META[kind] || { label: kind, icon: null, color: "bg-muted text-foreground border-border" };
              return (
                <button
                  key={kind}
                  onClick={() => setKindFilter(kindFilter === kind ? null : kind)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    kindFilter === kind ? meta.color : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {meta.icon}
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Smart Empty State */
          <div className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
              <HistoryIcon className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold">No saved analyses yet</h3>
            <p className="mt-2 mx-auto max-w-sm text-sm text-muted-foreground">
              Your analysis history will appear here once you save a report analysis or medicine scan.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/analyzer">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" /> Analyze a Report
                </Button>
              </Link>
              <Link to="/medicines">
                <Button variant="outline" className="gap-2">
                  <Pill className="h-4 w-4" /> Scan Medicine
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="ghost" className="gap-2 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" /> Try the Demo
                </Button>
              </Link>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No results match your search.</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setSearch(""); setKindFilter(null); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((a) => {
              const meta = KIND_META[a.kind] || { label: a.kind, icon: null, color: "bg-muted text-foreground border-border" };
              return (
                <li key={a.id} className="p-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setOpen(open === a.id ? null : a.id)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      {open === a.id ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{a.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.color}`}>
                            {meta.icon} {meta.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(a.created_at), "PPp")}
                          </span>
                        </div>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this analysis?")) del.mutate(a.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {open === a.id && <Detail a={a} />}
                </li>
              );
            })}
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

