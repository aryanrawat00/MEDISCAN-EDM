import { T, useI18n } from "@/lib/i18n";
/**
 * src/routes/demo.tsx
 * T22: Offline Demo Mode (Blueprint §22).
 * Runs completely in-browser without authentication or external API calls,
 * allowing instant exploration of Report Intelligence and Medicine Lens.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { REPORT_SAMPLES, type ReportSample } from "@/lib/report/samples";
import { runReportPipeline } from "@/lib/report/pipeline";
import { buildDoctorBrief } from "@/lib/report/brief";
import { FindingsTable } from "@/components/report/FindingsTable";
import { PatientFindings } from "@/components/report/PatientFindings";
import { FindingDetail } from "@/components/report/FindingDetail";
import { SourceViewer } from "@/components/report/SourceViewer";
import { PipelineTrace } from "@/components/report/PipelineTrace";
import { DoctorBriefView } from "@/components/report/DoctorBrief";
import { VerificationLab } from "@/components/report/VerificationLab";
import { MEDICINE_SAMPLES, type MedicineSample } from "@/lib/medicine/samples";
import { MedicineIdentityCard } from "@/components/medicine/MedicineIdentityCard";
import { IngredientsTable } from "@/components/medicine/IngredientsTable";
import { MonographView } from "@/components/medicine/MonographView";
import { PackagingEvidenceViewer } from "@/components/medicine/PackagingEvidenceViewer";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileText,
  Pill,
  ShieldCheck,
  AlertTriangle,
  Layers,
  FileCheck,
  Activity,
  FlaskConical,
  Bookmark,
} from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({ meta: [{ title: "Interactive Demo — MediScan AI" }] }),
  component: DemoPage,
});

type DemoDomain = "reports" | "medicines";
type ReportSubTab = "findings" | "brief" | "trace" | "lab";

function DemoPage() {
  const { t } = useI18n();
  const [domain, setDomain] = useState<DemoDomain>("reports");
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>("findings");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState<number>(0);
  const [medicineSubTab, setMedicineSubTab] = useState<"ingredients" | "monograph" | "evidence">("ingredients");
  const [showGuide, setShowGuide] = useState(true);

  const sample: ReportSample = REPORT_SAMPLES[selectedSampleIndex];
  const medicineSample: MedicineSample = MEDICINE_SAMPLES[selectedMedicineIndex];

  // In-browser offline pipeline execution
  const { pipelineResult, doctorBrief } = useMemo(() => {
    const pipeline = runReportPipeline({
      sourceText: sample.sourceText,
      rawFindings: sample.cachedRawFindings,
    });
    const brief = buildDoctorBrief(pipeline);
    return { pipelineResult: pipeline, doctorBrief: brief };
  }, [sample]);

  // Selected finding
  const activeFindingId = selectedFindingId ?? pipelineResult.findings[0]?.id ?? null;
  const selectedFinding =
    pipelineResult.findings.find((f) => f.id === activeFindingId) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Onboarding Guide */}
      {showGuide && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 relative" role="region" aria-label={t("Demo guide")}>
          <button
            onClick={() => setShowGuide(false)}
            className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label={t("Dismiss guide")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-foreground"> <T>{"Welcome to the Demo Lab!"}</T> </p>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                 <T>{"This demo runs"}</T> <strong> <T>{"entirely offline"}</T> </strong>  <T>{"in your browser. Try these steps:"}</T> </p>
              <ol className="mt-2 list-decimal list-inside space-y-1 text-muted-foreground text-xs">
                <li> <T>{"Switch between"}</T> <strong> <T>{"Report Intelligence"}</T> </strong>  <T>{"and"}</T> <strong> <T>{"Medicine Lens"}</T> </strong>  <T>{"using the toggle above"}</T> </li>
                <li> <T>{"Select different sample cases to see how the deterministic engine analyzes each one"}</T> </li>
                <li> <T>{"Explore the"}</T> <strong> <T>{"Findings"}</T> </strong>, <strong> <T>{"Doctor Brief"}</T> </strong>, <strong> <T>{"Audit Trail"}</T> </strong> <T>{", and"}</T> <strong> <T>{"Verification Lab"}</T> </strong>  <T>{"tabs"}</T> </li>
                <li> <T>{"Click any finding row to see its detailed evidence, verbatim quotes, and rule trace"}</T> </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight"> <T>{"Interactive Demo Mode"}</T> </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />  <T>{"100% Offline & Client-Side"}</T> </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
             <T>{"Explore verified clinical sample analyses with zero setup, zero authentication, and zero network calls."}</T> </p>
        </div>

        {/* Domain Switcher */}
        <div className="flex rounded-lg border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setDomain("reports")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              domain === "reports"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />  <T>{"Report Intelligence"}</T> </button>
          <button
            type="button"
            onClick={() => setDomain("medicines")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              domain === "medicines"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pill className="h-3.5 w-3.5" />  <T>{"Medicine Lens"}</T> </button>
        </div>
      </div>

      <Disclaimer className="mt-4" />

      {/* Domain: Reports */}
      {domain === "reports" && (
        <div className="mt-6 space-y-6">
          {/* Sample Picker Strip */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
               <T>{"Select Pre-Verified Clinical Sample"}</T> </span>
            <div className="grid gap-3 sm:grid-cols-3">
              {REPORT_SAMPLES.map((s, idx) => {
                const isSelected = selectedSampleIndex === idx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSampleIndex(idx);
                      setSelectedFindingId(null);
                    }}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-primary">
                         <T>{"Sample 0"}</T> {idx + 1}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {s.cachedRawFindings.length}  <T>{"findings"}</T> </span>
                    </div>
                    <p className="mt-1 font-semibold text-sm text-foreground">{s.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {s.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report Overview Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{sample.title}</h2>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                   <T>{"Evidence Locked"}</T> </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {pipelineResult.findings.length}  <T>{"verified findings ·"}</T> {pipelineResult.stats.verified}  <T>{"quote matches · Deterministic rule evaluation"}</T> </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>{pipelineResult.stats.verified}  <T>{"Verified"}</T> </span>
              </div>
              {pipelineResult.stats.flagged > 0 && (
                <div className="flex items-center gap-1.5 text-rose-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{pipelineResult.stats.flagged}  <T>{"Flagged Abnormal"}</T> </span>
                </div>
              )}
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-1">
            <button
              type="button"
              onClick={() => setReportSubTab("findings")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                reportSubTab === "findings"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />  <T>{"Findings & Evidence ("}</T> {pipelineResult.findings.length})
            </button>
            <button
              type="button"
              onClick={() => setReportSubTab("brief")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                reportSubTab === "brief"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FileCheck className="h-3.5 w-3.5" />  <T>{"Doctor Visit Brief"}</T> </button>
            <button
              type="button"
              onClick={() => setReportSubTab("trace")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                reportSubTab === "trace"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />  <T>{"Pipeline Telemetry"}</T> </button>
            <button
              type="button"
              onClick={() => setReportSubTab("lab")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                reportSubTab === "lab"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" />  <T>{"Tamper Lab"}</T> </button>
          </div>

          {/* SubTab 1: Findings & Evidence */}
          {reportSubTab === "findings" && (
            <div className="space-y-6">
              <PatientFindings
                findings={pipelineResult.findings}
                onSeeEvidence={(finding) => setSelectedFindingId(finding.id)}
              />

              <details className="rounded-xl border border-border bg-card p-5"><summary className="cursor-pointer text-sm font-medium"><T>Open the detailed table</T></summary><div className="mt-5"><FindingsTable
                findings={pipelineResult.findings}
                selectedFindingId={activeFindingId}
                onSelectFinding={setSelectedFindingId}
              /></div></details>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                     <T>{"Finding Evidence Audit"}</T> </h3>
                  <FindingDetail finding={selectedFinding} />
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                     <T>{"Source Document Span"}</T> </h3>
                  <div className="max-h-[500px] overflow-auto rounded-xl border border-border bg-card p-4 shadow-sm font-mono text-xs">
                    <SourceViewer
                      sourceText={sample.sourceText}
                      evidence={selectedFinding?.evidence ?? null}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: Doctor Brief */}
          {reportSubTab === "brief" && (
            <DoctorBriefView
              brief={doctorBrief}
              reportName="Sample CBC & Metabolic Panel"
            />
          )}

          {/* SubTab 3: Telemetry */}
          {reportSubTab === "trace" && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <PipelineTrace pipeline={pipelineResult} />
            </div>
          )}

          {/* SubTab 4: Tamper Lab */}
          {reportSubTab === "lab" && (
            <VerificationLab />
          )}
        </div>
      )}

      {/* Domain: Medicines (Full Offline Interactive Demo) */}
      {domain === "medicines" && (
        <div className="mt-6 space-y-6">
          {/* Sample Picker Strip */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
               <T>{"Select Pre-Verified OTC Medicine Sample"}</T> </span>
            <div className="grid gap-3 sm:grid-cols-3">
              {MEDICINE_SAMPLES.map((s, idx) => {
                const isSelected = selectedMedicineIndex === idx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedMedicineIndex(idx)}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-primary">
                        {s.category}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />  <T>{"Verified"}</T> </span>
                    </div>
                    <p className="mt-1 font-semibold text-sm text-foreground">{s.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {s.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Identity Header */}
          <MedicineIdentityCard scan={medicineSample.precomputedScan} />

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-1">
            <button
              type="button"
              onClick={() => setMedicineSubTab("ingredients")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                medicineSubTab === "ingredients"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />  <T>{"Verified Ingredients ("}</T> {medicineSample.precomputedScan.verifiedIngredients.length})
            </button>
            <button
              type="button"
              onClick={() => setMedicineSubTab("monograph")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                medicineSubTab === "monograph"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />  <T>{"Official Monograph ("}</T> {medicineSample.precomputedScan.monographs.length})
            </button>
            <button
              type="button"
              onClick={() => setMedicineSubTab("evidence")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                medicineSubTab === "evidence"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />  <T>{"Packaging OCR Evidence"}</T> </button>
          </div>

          {/* SubTab 1: Ingredients */}
          {medicineSubTab === "ingredients" && (
            <div className="space-y-6">
              <IngredientsTable
                ingredients={medicineSample.precomputedScan.verifiedIngredients}
              />

              {medicineSample.precomputedScan.safetyWarnings.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                     <T>{"Important Safety Warnings from Official FDA Drug Label"}</T> </h4>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                    {medicineSample.precomputedScan.safetyWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SubTab 2: Official Monograph */}
          {medicineSubTab === "monograph" && (
            <MonographView
              monographs={medicineSample.precomputedScan.monographs}
            />
          )}

          {/* SubTab 3: Packaging OCR Evidence */}
          {medicineSubTab === "evidence" && (
            <PackagingEvidenceViewer
              transcribedText={medicineSample.precomputedScan.transcribedText}
              evidenceItems={medicineSample.precomputedScan.packagingEvidence}
            />
          )}
        </div>
      )}
    </div>
  );
}
