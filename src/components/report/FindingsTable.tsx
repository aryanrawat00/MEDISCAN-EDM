import { T, useI18n } from "@/lib/i18n";
/**
 * src/components/report/FindingsTable.tsx
 * T16: Interactive Findings Table (Blueprint §18).
 * Renders verified findings with status badges, values, range bars, and row selection.
 */

import React, { useState } from "react";
import { VerifiedFinding } from "@/lib/report/types";
import { StatusBadge } from "@/components/StatusBadge";
import { RangeBar } from "./RangeBar";
import { AlertCircle, Eye, ShieldCheck } from "lucide-react";
import { EvidenceVerificationModal } from "./EvidenceVerificationModal";

interface FindingsTableProps {
  findings: VerifiedFinding[];
  selectedFindingId: string | null;
  onSelectFinding: (id: string) => void;
  reportTitle?: string;
  sourceTextAvailable?: boolean;
  className?: string;
}

export function FindingsTable({
  findings,
  selectedFindingId,
  onSelectFinding,
  reportTitle,
  sourceTextAvailable = true,
  className = "",
}: FindingsTableProps) {
  const { t } = useI18n();
  const [detailed, setDetailed] = useState(false);
  const [verifyingFinding, setVerifyingFinding] = useState<VerifiedFinding | null>(null);

  if (!findings || findings.length === 0) {
    return (
      <div className={`p-8 text-center text-sm text-muted-foreground ${className}`}>
         <T>{"No verified findings available."}</T> </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-semibold"><T>Your findings</T></h3><div className="flex gap-1 rounded-lg border border-border bg-card p-1"><button type="button" aria-pressed={!detailed} onClick={() => setDetailed(false)} className={`rounded-md px-3 py-2 text-xs ${!detailed ? "bg-primary text-white" : "text-muted-foreground"}`}><T>Simple view</T></button><button type="button" aria-pressed={detailed} onClick={() => setDetailed(true)} className={`rounded-md px-3 py-2 text-xs ${detailed ? "bg-primary text-white" : "text-muted-foreground"}`}><T>Detailed table</T></button></div></div>
      {!detailed ? <div className="space-y-3">{[...findings].sort((a,b) => Number(b.attention || b.status !== "NORMAL") - Number(a.attention || a.status !== "NORMAL")).map(f => <article key={f.id} className="rounded-xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-semibold">{f.testName}</h4><p className="mt-3 text-2xl font-semibold">{f.valueText} <span className="text-sm font-normal text-muted-foreground">{f.unit}</span></p><p className="mt-1 text-xs text-muted-foreground"><T>Reference range</T>: {f.referenceRangeText || "Not provided"}</p></div><StatusBadge status={f.status} reason={f.statusReason} /></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground"><T>{f.status === "NORMAL" ? "This result is within the reference range provided in your report." : f.status === "UNKNOWN" ? "There isn't enough verified information to compare this result. Review it with your healthcare professional." : "This result is outside the reference range provided in your report. Discuss it with your healthcare professional."}</T></p><button type="button" onClick={() => { onSelectFinding(f.id); setVerifyingFinding(f); }} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary"><ShieldCheck className="h-4 w-4" /><T>See the evidence</T></button></article>)}</div> : <div className={`overflow-x-auto rounded-xl border border-border bg-card shadow-sm ${className}`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            <tr>
              <th className="py-3 px-4"> <T>{"Status"}</T> </th>
              <th className="py-3 px-4"> <T>{"Test Name"}</T> </th>
              <th className="py-3 px-4"> <T>{"Result Value"}</T> </th>
              <th className="py-3 px-4 min-w-[200px]"> <T>{"Reference Range"}</T> </th>
              <th className="py-3 px-3 text-center"> <T>{"Page"}</T> </th>
              <th className="py-3 px-4 text-center"> <T>{"Evidence"}</T> </th>
            </tr>
          </thead>
        <tbody className="divide-y divide-border">
          {findings.map((f) => {
            const isSelected = f.id === selectedFindingId;
            return (
              <tr
                key={f.id}
                onClick={() => onSelectFinding(f.id)}
                className={`cursor-pointer transition-colors hover:bg-accent/40 ${
                  isSelected ? "bg-primary/5 font-medium ring-1 ring-inset ring-primary/40" : ""
                }`}
              >
                {/* Status Column */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={f.status} reason={f.statusReason} />
                    {f.labFlagAgreement === "DISAGREES" && (
                      <span
                        title={t("Lab flag disagrees with printed range calculation")}
                        className="text-amber-500"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </td>

                {/* Test Name */}
                <td className="py-3.5 px-4 font-medium text-foreground">
                  <div>{f.testName}</div>
                  {f.labFlag && (
                    <span className="text-[10px] text-muted-foreground uppercase">
                       <T>{"Lab Flag:"}</T> <strong className="text-foreground">{f.labFlag}</strong>
                    </span>
                  )}
                </td>

                {/* Result Value */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-semibold text-foreground text-base">
                    {f.valueText}
                  </span>
                  {f.unit && (
                    <span className="ml-1 text-xs text-muted-foreground">{f.unit}</span>
                  )}
                </td>

                {/* Range Bar */}
                <td className="py-3.5 px-4">
                  <RangeBar
                    value={f.value}
                    range={f.range}
                    status={f.status}
                    unit={f.unit}
                  />
                </td>

                {/* Page */}
                <td className="py-3.5 px-3 text-center text-xs text-muted-foreground">
                  {f.evidence.page ? `P.${f.evidence.page}` : "—"}
                </td>

                {/* View / Verify Evidence */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVerifyingFinding(f);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors shadow-2xs"
                      title={t("Verify Evidence Behind Finding")}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span> <T>{"Verify Evidence"}</T> </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFinding(f.id);
                      }}
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-md text-xs transition-colors ${
                        isSelected
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      title={t("Highlight in Source Document")}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>}

    {/* Dedicated Evidence Verification Modal */}
    <EvidenceVerificationModal
      finding={verifyingFinding}
      reportTitle={reportTitle}
      sourceTextAvailable={sourceTextAvailable}
      isOpen={Boolean(verifyingFinding)}
      onClose={() => setVerifyingFinding(null)}
    />
  </>
  );
}
