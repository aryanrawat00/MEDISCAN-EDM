import { T, useI18n } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { ReportInput } from "@/components/report/ReportInput";
import { FindingsTable } from "@/components/report/FindingsTable";
import { PatientFindings } from "@/components/report/PatientFindings";
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
  const { t } = useI18n();
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
            toast.success(t("Analysis saved to your private history."));
          })
          .catch((err) => {
            console.warn("Failed to auto-save analysis to Supabase:", err);
          });
      } else {
        // Guest mode: session memory only
        toast.info(
          t("Analysis complete in Guest Mode. Sign in anytime to save your results to permanent history."),
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
              <Sparkles className="h-3 w-3" />  <T>{"Guest Session"}</T> </span>
            <span className="text-muted-foreground">
               <T>{"Your results stay in this session. Sign in to keep them in your history."}</T> </span>
          </div>
          <Button asChild size="sm" variant="outline" className="h-7 text-xs">
            <Link to="/login">
              <LogIn className="mr-1.5 h-3 w-3" />  <T>{"Sign in to save history"}</T> </Link>
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
            <h1 className="text-2xl font-bold tracking-tight"> <T>{"Understand your report"}</T> </h1>
            <p className="text-sm text-muted-foreground">
               <T>{"Upload your report, understand the findings, and see the evidence."}</T> </p>
          </div>
        </div>

        {analysis && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />  <T>{"New Analysis"}</T> </Button>
          </div>
        )}
      </div>

      <Disclaimer className="mt-4 print:hidden" />

      {error && <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-card p-4 text-sm text-destructive">{error}</div>}
      {/* Main View: Input vs Results */}
      {!analysis ? (
        <div className="mt-8 space-y-8">
          <ReportInput isLoading={isAnalyzing} onAnalyze={handleAnalyze} />

          <details className="rounded-xl border border-border bg-card p-5"><summary className="cursor-pointer text-sm font-medium"> <T>{"Explore how evidence is checked"}</T> </summary><div className="mt-5"><VerificationLab /></div></details>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <p className="text-xs text-muted-foreground"> <T>{"Your report at a glance"}</T> </p><h2 className="mt-1 text-xl font-semibold">{reportTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground"> <T>{"Start with findings outside the reference range. A finding is a comparison, not a diagnosis."}</T> </p>
            <div className="mt-6 grid grid-cols-2 gap-5 border-t border-border pt-5 sm:grid-cols-4">
              {[[analysis.pipeline.stats.raw, t("Parameters detected")], [analysis.pipeline.findings.filter(f => f.status === "NORMAL").length, t("Within reference range")], [analysis.pipeline.findings.filter(f => f.status === "LOW" || f.status === "HIGH").length, t("Outside reference range")], [analysis.pipeline.findings.filter(f => f.status === "UNKNOWN").length + analysis.pipeline.unverified.length, t("Requires verification")]].map(([value,label]) => <div key={label}><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground"><T>{String(label)}</T></p></div>)}
            </div>
            {analysis.pipeline.unverified.length > 0 && <details className="mt-5 rounded-lg border border-amber-300/50 p-3 text-sm"><summary className="cursor-pointer"> <T>{"Some extracted values could not be verified"}</T> </summary><ul className="mt-3 list-disc space-y-1 pl-5">{analysis.pipeline.unverified.map((f,i) => <li key={i}>{f.testName}: {f.valueText}</li>)}</ul></details>}
          </section>
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
              label={t("Doctor Visit Brief")}
            />
            <details className="relative"><summary className="cursor-pointer rounded-lg px-3 py-2 text-xs text-muted-foreground"> <T>{"Advanced tools"}</T> </summary><div className="absolute right-0 z-10 mt-1 flex min-w-48 flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-md"><TabButton active={activeTab === "trace"} onClick={() => setActiveTab("trace")} icon={<Activity className="h-4 w-4" />} label={t("Pipeline Telemetry")} /><TabButton active={activeTab === "lab"} onClick={() => setActiveTab("lab")} icon={<FlaskConical className="h-4 w-4" />} label={t("Tamper Lab")} /></div></details>
          </div>

          {/* Tab 1: Findings & Evidence (Table + Split Inspector) */}
          {activeTab === "findings" && (
            <div className="space-y-6 print:hidden">
              <PatientFindings
                findings={analysis.pipeline.findings}
                onSeeEvidence={(finding) => setSelectedFindingId(finding.id)}
                sourceTextAvailable={Boolean(lastSourceText)}
              />

              <details className="rounded-xl border border-border bg-card p-5"><summary className="cursor-pointer text-sm font-medium"><T>Open the detailed table</T></summary><div className="mt-5"><FindingsTable
                findings={analysis.pipeline.findings}
                selectedFindingId={selectedFindingId}
                onSelectFinding={setSelectedFindingId}
                sourceTextAvailable={Boolean(lastSourceText)}
              /></div></details>

              <details className="rounded-xl border border-border bg-card p-5"><summary className="cursor-pointer text-sm font-medium"> <T>{"Source document and verification details"}</T> </summary><div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                     <T>{"Finding details"}</T> </h3>
                  <FindingDetail finding={selectedFinding} />
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                     <T>{"Original report text"}</T> </h3>
                  <div className="max-h-[500px] overflow-auto rounded-xl border border-border bg-card p-4 shadow-sm font-mono text-xs">
                    <SourceViewer
                      sourceText={lastSourceText}
                      fileName={analysis.source.fileName}
                      evidence={selectedFinding?.evidence ?? null}
                    />
                  </div>
                </div>
              </div></details>
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
