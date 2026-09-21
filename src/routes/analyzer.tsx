import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { ReportInput } from "@/components/report/ReportInput";
import { FindingsTable } from "@/components/report/FindingsTable";
import { FindingDetail } from "@/components/report/FindingDetail";
import { SourceViewer } from "@/components/report/SourceViewer";
import { PipelineTrace } from "@/components/report/PipelineTrace";
import { DoctorBriefView } from "@/components/report/DoctorBrief";
import { VerificationLab } from "@/components/report/VerificationLab";
import { useReportPipeline } from "@/hooks/useReportPipeline";
import { buildDoctorBrief } from "@/lib/report/brief";
import { saveAnalysis } from "@/lib/analyses";
import { toast } from "sonner";
import {
  FileText,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  FlaskConical,
  Activity,
  Layers,
  Sparkles,
  LogIn,
} from "lucide-react";

export const Route = createFileRoute("/analyzer")({
  head: () => ({ meta: [{ title: "Report Analyzer — MediScan AI" }] }),
  component: () => <Analyzer />,
});

type ActiveTab = "findings" | "brief" | "trace" | "lab";

function Analyzer() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>("findings");
  const [reportTitle, setReportTitle] = useState<string>("");
  const [lastSourceText, setLastSourceText] = useState<string>("");

  const {
    status,
    analysis,
    error,
    selectedFindingId,
    selectedFinding,
    setSelectedFindingId,
    runAnalysis,
    reset,
  } = useReportPipeline();

  const handleAnalyze = async (
    text: string,
    fileName?: string,
    sourceKind?: "paste" | "txt" | "pdf" | "demo",
  ) => {
    setLastSourceText(text);
    const title =
      fileName?.replace(/\.[^.]+$/, "") ||
      `Report Analysis · ${new Date().toLocaleDateString()}`;
    setReportTitle(title);

    const out = await runAnalysis(text, fileName, sourceKind);
    if (out) {
      if (user) {
        // Signed-in user: persist to Supabase history
        saveAnalysis({
          kind: "report",
          title,
          input: text,
          result: out,
        })
          .then(() => {
            qc.invalidateQueries({ queryKey: ["analyses"] });
            toast.success("Analysis saved to your private history.");
          })
          .catch((err) => {
            console.warn("Failed to auto-save analysis to Supabase:", err);
          });
      } else {
        // Guest mode: session memory only
        toast.info(
          "Analysis complete in Guest Mode. Sign in anytime to save your results to permanent history.",
        );
      }
    }
  };

  const handleReset = () => {
    reset();
    setReportTitle("");
    setLastSourceText("");
    setActiveTab("findings");
  };

  const isAnalyzing = status === "EXTRACTING" || status === "VERIFYING";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Guest Mode Banner */}
      {!user && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-xs text-foreground print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> Guest Session
            </span>
            <span className="text-muted-foreground">
              Live deterministic clinical analysis is active. Results are kept in browser memory.
            </span>
          </div>
          <Button asChild size="sm" variant="outline" className="h-7 text-xs">
            <Link to="/login">
              <LogIn className="mr-1.5 h-3 w-3" /> Sign in to save history
            </Link>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Report Intelligence Lens</h1>
            <p className="text-sm text-muted-foreground">
              Extracts medical findings, locks verbatim quotes to source text, and evaluates ranges deterministically.
            </p>
          </div>
        </div>

        {analysis && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> New Analysis
            </Button>
          </div>
        )}
      </div>

      <Disclaimer className="mt-4 print:hidden" />

      {/* Main View: Input vs Results */}
      {!analysis ? (
        <div className="mt-8 space-y-8">
          <ReportInput isLoading={isAnalyzing} onAnalyze={handleAnalyze} />

          {/* Verification Lab Showcase */}
          <div className="mt-12">
            <div className="mb-3">
              <h2 className="text-lg font-semibold tracking-tight">
                Try the Live Evidence & Tamper Engine
              </h2>
              <p className="text-xs text-muted-foreground">
                See how deterministic quote matching prevents AI hallucinations and invalid claims without sending data to any LLM.
              </p>
            </div>
            <VerificationLab />
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm print:hidden">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{reportTitle}</h2>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  v{analysis.schemaVersion} Verified
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Analyzed {analysis.pipeline.findings.length} findings in{" "}
                {analysis.pipeline.trace.reduce((acc, t) => acc + t.ms, 0)} ms ·{" "}
                {analysis.pipeline.stats.verified} locked quotes
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span>{analysis.pipeline.stats.verified} Verified</span>
              </div>
              {analysis.pipeline.stats.flagged > 0 && (
                <div className="flex items-center gap-1.5 text-rose-500 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{analysis.pipeline.stats.flagged} Flagged</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-1 print:hidden">
            <TabButton
              active={activeTab === "findings"}
              onClick={() => setActiveTab("findings")}
              icon={<Layers className="h-4 w-4" />}
              label={`Findings & Evidence (${analysis.pipeline.findings.length})`}
            />
            <TabButton
              active={activeTab === "brief"}
              onClick={() => setActiveTab("brief")}
              icon={<FileCheck className="h-4 w-4" />}
              label="Doctor Visit Brief"
            />
            <TabButton
              active={activeTab === "trace"}
              onClick={() => setActiveTab("trace")}
              icon={<Activity className="h-4 w-4" />}
              label="Pipeline Telemetry"
            />
            <TabButton
              active={activeTab === "lab"}
              onClick={() => setActiveTab("lab")}
              icon={<FlaskConical className="h-4 w-4" />}
              label="Tamper Lab"
            />
          </div>

          {/* Tab 1: Findings & Evidence (Table + Split Inspector) */}
          {activeTab === "findings" && (
            <div className="space-y-6 print:hidden">
              <FindingsTable
                findings={analysis.pipeline.findings}
                selectedFindingId={selectedFindingId}
                onSelectFinding={setSelectedFindingId}
              />

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Finding Evidence Audit
                  </h3>
                  <FindingDetail finding={selectedFinding} />
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Source Document Span
                  </h3>
                  <div className="max-h-[500px] overflow-auto rounded-xl border border-border bg-card p-4 shadow-sm font-mono text-xs">
                    <SourceViewer
                      sourceText={lastSourceText}
                      fileName={analysis.source.fileName}
                      evidence={selectedFinding?.evidence ?? null}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Doctor Brief */}
          {activeTab === "brief" && (
            <DoctorBriefView
              brief={analysis.brief ?? buildDoctorBrief(analysis.pipeline)}
              reportName={reportTitle}
            />
          )}

          {/* Tab 3: Pipeline Telemetry */}
          {activeTab === "trace" && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm print:hidden">
              <PipelineTrace pipeline={analysis.pipeline} />
            </div>
          )}

          {/* Tab 4: Tamper Lab */}
          {activeTab === "lab" && (
            <div className="print:hidden">
              <VerificationLab />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
