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
  const [domain, setDomain] = useState<DemoDomain>("reports");
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>("findings");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState<number>(0);
  const [medicineSubTab, setMedicineSubTab] = useState<"ingredients" | "monograph" | "evidence">("ingredients");

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
      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Interactive Demo Mode</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Offline & Client-Side
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore verified clinical sample analyses with zero setup, zero authentication, and zero network calls.
          </p>
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
            <FileText className="h-3.5 w-3.5" /> Report Intelligence
          </button>
          <button
            type="button"
            onClick={() => setDomain("medicines")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              domain === "medicines"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pill className="h-3.5 w-3.5" /> Medicine Lens
          </button>
        </div>
      </div>

      <Disclaimer className="mt-4" />

      {/* Domain: Reports */}
      {domain === "reports" && (
        <div className="mt-6 space-y-6">
          {/* Sample Picker Strip */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Pre-Verified Clinical Sample
            </span>
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
                        Sample 0{idx + 1}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {s.cachedRawFindings.length} findings
                      </span>
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
                  Evidence Locked
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {pipelineResult.findings.length} verified findings · {pipelineResult.stats.verified} quote matches · Deterministic rule evaluation
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>{pipelineResult.stats.verified} Verified</span>
              </div>
              {pipelineResult.stats.flagged > 0 && (
                <div className="flex items-center gap-1.5 text-rose-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{pipelineResult.stats.flagged} Flagged Abnormal</span>
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
              <Layers className="h-3.5 w-3.5" /> Findings & Evidence ({pipelineResult.findings.length})
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
              <FileCheck className="h-3.5 w-3.5" /> Doctor Visit Brief
            </button>
            <button
              type="button"
              onClick={() => setReportSubTab("trace")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                reportSubTab === "trace"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Activity className="h-3.5 w-3.5" /> Pipeline Telemetry
            </button>
            <button
              type="button"
              onClick={() => setReportSubTab("lab")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                reportSubTab === "lab"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" /> Tamper Lab
            </button>
          </div>

          {/* SubTab 1: Findings & Evidence */}
          {reportSubTab === "findings" && (
            <div className="space-y-6">
              <FindingsTable
                findings={pipelineResult.findings}
                selectedFindingId={activeFindingId}
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
              Select Pre-Verified OTC Medicine Sample
            </span>
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
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
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
              <Layers className="h-3.5 w-3.5" /> Verified Ingredients (
              {medicineSample.precomputedScan.verifiedIngredients.length})
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
              <Bookmark className="h-3.5 w-3.5" /> Official Monograph (
              {medicineSample.precomputedScan.monographs.length})
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
              <FileText className="h-3.5 w-3.5" /> Packaging OCR Evidence
            </button>
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
                    Important Safety Warnings from Official FDA Drug Label
                  </h4>
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
