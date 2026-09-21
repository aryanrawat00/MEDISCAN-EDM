import { T, useI18n } from "@/lib/i18n";
/**
 * src/components/history/ResultView.tsx
 * T23a: Polymorphic result view resolver for saved history (Blueprint §23a).
 * Gracefully dispatches between V2 verified reports, legacy V1 reports,
 * legacy symptoms, V3 medicine scans, and unknown payloads.
 */

import React, { useState } from "react";
import { ReportAnalysisV2 } from "@/lib/report/types";
import { LegacyReportResult, LegacySymptomResult, LegacyMedicineResult } from "@/lib/legacy";
import { FindingsTable } from "@/components/report/FindingsTable";
import { FindingDetail } from "@/components/report/FindingDetail";
import { DoctorBriefView } from "@/components/report/DoctorBrief";
import { LegacyReportView } from "@/components/report/LegacyReportView";
import { LegacySymptomView } from "./LegacySymptomView";
import { MedicineScanV3 } from "@/lib/medicine/types";
import { MedicineIdentityCard } from "@/components/medicine/MedicineIdentityCard";
import { IngredientsTable } from "@/components/medicine/IngredientsTable";
import { MonographView } from "@/components/medicine/MonographView";
import { ShieldCheck, AlertTriangle, FileText, Pill, FileCheck, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultViewProps {
  kind: string;
  result: unknown;
}

export function ResultView({ kind, result }: ResultViewProps) {
  if (!result || typeof result !== "object") {
    return <UnknownResultView raw={result} error="Payload is empty or not an object." />;
  }

  const res = result as Record<string, any>;

  // Case 1: Report Analysis V2 (Evidence-locked)
  if (res.schemaVersion === 2 && res.pipeline && Array.isArray(res.pipeline.findings)) {
    return <V2ReportHistoryView analysis={res as ReportAnalysisV2} />;
  }

  // Case 2: Legacy Report (v1)
  if (kind === "report" || ("summary" in res && "key_findings" in res)) {
    return <LegacyReportView r={res as LegacyReportResult} />;
  }

  // Case 3: Legacy Symptom
  if (kind === "symptom" || ("possible_conditions" in res && "self_care" in res)) {
    return <LegacySymptomView r={res as LegacySymptomResult} />;
  }

  // Case 4: Medicine Scan V3 (Schema v3)
  if (res.schemaVersion === 3 && Array.isArray(res.verifiedIngredients)) {
    return <V3MedicineHistoryView scan={res as MedicineScanV3} />;
  }

  // Case 5: Legacy Medicine (V1)
  if (kind === "medicine" && !("schemaVersion" in res)) {
    return <LegacyMedicineHistoryView m={res as LegacyMedicineResult} />;
  }

  // Fallback: Unknown
  return <UnknownResultView raw={result} />;
}

/**
 * Rich renderer for V2 Report in History
 */
function V2ReportHistoryView({ analysis }: { analysis: ReportAnalysisV2 }) {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState<"findings" | "brief">("findings");
  const [selectedId, setSelectedId] = useState<string | null>(
    analysis.pipeline.findings[0]?.id ?? null,
  );

  const selectedFinding =
    analysis.pipeline.findings.find((f) => f.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />  <T>{"Schema v2 Verified"}</T> </span>
          <span className="text-xs text-muted-foreground">
            {analysis.pipeline.findings.length}  <T>{"findings ·"}</T> {analysis.pipeline.stats.verified}  <T>{"locked quotes"}</T> </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={activeView === "findings" ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setActiveView("findings")}
          >
             <T>{"Findings Table"}</T> </Button>
          {analysis.brief && (
            <Button
              variant={activeView === "brief" ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setActiveView("brief")}
            >
               <T>{"Doctor Brief"}</T> </Button>
          )}
        </div>
      </div>

      {activeView === "findings" ? (
        <div className="space-y-4">
          <FindingsTable
            findings={analysis.pipeline.findings}
            selectedFindingId={selectedId}
            onSelectFinding={setSelectedId}
          />
          <FindingDetail finding={selectedFinding} />
        </div>
      ) : (
        analysis.brief && <DoctorBriefView brief={analysis.brief} />
      )}
    </div>
  );
}

/**
 * Rich renderer for V3 Medicine Scan in History
 */
function V3MedicineHistoryView({ scan }: { scan: MedicineScanV3 }) {
  const [activeTab, setActiveTab] = useState<"ingredients" | "monograph">("ingredients");

  return (
    <div className="space-y-4">
      <MedicineIdentityCard scan={scan} />

      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          variant={activeTab === "ingredients" ? "secondary" : "ghost"}
          size="sm"
          className="text-xs h-7"
          onClick={() => setActiveTab("ingredients")}
        >
           <T>{"Verified Ingredients ("}</T> {scan.verifiedIngredients.length})
        </Button>
        {scan.monographs.length > 0 && (
          <Button
            variant={activeTab === "monograph" ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setActiveTab("monograph")}
          >
             <T>{"Official Monograph ("}</T> {scan.monographs.length})
          </Button>
        )}
      </div>

      {activeTab === "ingredients" ? (
        <div className="space-y-3">
          <IngredientsTable ingredients={scan.verifiedIngredients} />
          {scan.safetyWarnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
              <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                 <T>{"FDA Label Safety Warnings"}</T> </p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                {scan.safetyWarnings.slice(0, 3).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <MonographView monographs={scan.monographs} />
      )}
    </div>
  );
}

/**
 * Legacy medicine renderer for historical rows
 */
function LegacyMedicineHistoryView({ m }: { m: LegacyMedicineResult }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
           <T>{"Legacy Medicine Record — Unverified AI lookup predating openFDA reference verification."}</T> </span>
      </div>

      <div>
        <h3 className="text-lg font-bold">{m.name}</h3>
        {m.generic_name && (
          <p className="text-xs text-muted-foreground"> <T>{"Generic:"}</T> {m.generic_name}</p>
        )}
      </div>

      {m.uses && m.uses.length > 0 && (
        <div>
          <h4 className="font-semibold text-xs uppercase text-muted-foreground"> <T>{"Uses"}</T> </h4>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground text-xs">
            {m.uses.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Unknown result renderer with graceful raw JSON fallback
 */
function UnknownResultView({ raw, error }: { raw: unknown; error?: string }) {
  const { t } = useI18n();
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>{error || "Unrecognized payload format."}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          onClick={() => setShowJson(!showJson)}
        >
          <Code2 className="mr-1 h-3.5 w-3.5" />
          {showJson ? t("Hide Raw Data") : t("Inspect Raw Data")}
        </Button>
      </div>

      {showJson && (
        <pre className="mt-3 max-h-60 overflow-auto rounded bg-muted/60 p-3 font-mono text-[11px] text-foreground">
          {JSON.stringify(raw, null, 2)}
        </pre>
      )}
    </div>
  );
}
