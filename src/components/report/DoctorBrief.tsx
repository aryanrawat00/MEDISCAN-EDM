/**
 * src/components/report/DoctorBrief.tsx
 * T20: Doctor / Patient Visit Brief Component (Blueprint §14, §20).
 * Clean, clinical summary designed for patient-doctor appointments.
 * Includes:
 * - Dual Presentation: Doctor Visit Brief vs Patient-Friendly Summary
 * - 1-Click Print & Browser "Save as PDF"
 * - Plaintext Clipboard Copy
 * - Downloadable Appointment Summary
 * "Evidence first. AI second. Code decides."
 */

import React, { useState } from "react";
import { DoctorBrief } from "@/lib/report/types";
import {
  generatePlaintextSummary,
  downloadSummaryFile,
  copySummaryToClipboard,
  SummaryViewMode,
} from "@/lib/report/summaryExport";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Printer,
  Copy,
  Download,
  AlertOctagon,
  HelpCircle,
  ShieldCheck,
  Stethoscope,
  User,
  Sparkles,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface DoctorBriefProps {
  brief: DoctorBrief;
  reportName?: string;
  className?: string;
}

export function DoctorBriefView({
  brief,
  reportName = "Diagnostic Laboratory Report",
  className = "",
}: DoctorBriefProps) {
  const [viewMode, setViewMode] = useState<SummaryViewMode>("doctor");

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = async () => {
    const summaryText = generatePlaintextSummary(brief, {
      mode: viewMode,
      reportName,
    });
    const success = await copySummaryToClipboard(summaryText);
    if (success) {
      toast.success("Summary copied");
    } else {
      toast.error("Failed to copy summary to clipboard.");
    }
  };

  const handleDownload = () => {
    const summaryText = generatePlaintextSummary(brief, {
      mode: viewMode,
      reportName,
    });
    const filename =
      viewMode === "doctor"
        ? "mediscan-doctor-visit-brief.txt"
        : "mediscan-patient-summary.txt";
    downloadSummaryFile(summaryText, filename);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div
      className={`space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm print:border-none print:p-0 print:shadow-none print:bg-white print:text-black ${className}`}
    >
      {/* ========================================================================= */}
      {/* PRINT-ONLY APPOINTMENT HEADER (Visible exclusively when printing to paper/PDF) */}
      {/* ========================================================================= */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                MEDISCAN AI
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 border-l border-slate-300 pl-2">
                Clinical Consultation Summary
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-800 mt-1">{reportName}</h1>
            <p className="text-xs text-slate-600">
              Evidence-locked diagnostic summary prepared for medical evaluation
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <p className="font-semibold text-slate-900">
              Date: {new Date(brief.generatedAt).toLocaleDateString()}
            </p>
            <p>
              {brief.overview.counts.verified} Verified findings ·{" "}
              <strong>{brief.overview.counts.flagged} Outside range</strong>
            </p>
            <p className="text-[10px] text-slate-500">
              Format: {viewMode === "doctor" ? "Doctor Clinical Brief" : "Patient Health Summary"}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE CONTROLS (Hidden during printing) */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {viewMode === "doctor" ? "Doctor Visit Brief" : "Patient Health Summary"}
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              1-Page Export Ready
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {viewMode === "doctor"
              ? "Clinical consultation summary with verbatim laboratory evidence and discussion points."
              : "Plain-language health summary designed for easy patient understanding."}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("doctor")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                viewMode === "doctor"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" /> Doctor Brief
            </button>
            <button
              type="button"
              onClick={() => setViewMode("patient")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                viewMode === "patient"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-3.5 w-3.5" /> Patient Summary
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="h-8 text-xs"
            title="Copy clean summary to clipboard"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Summary
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 text-xs"
            title="Download appointment summary as text file"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download (.txt)
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="h-8 brand-gradient text-white text-xs shadow-xs font-semibold"
            title="Print or Save as PDF"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Critical Alert Banner if laboratory printed critical marker */}
      {brief.criticalBanner && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-800 dark:text-rose-300 print:border-rose-600 print:bg-rose-50 print:text-rose-950">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertOctagon className="h-5 w-5 text-rose-600" />
            <span>Critical Laboratory Alert Notice</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed">
            The reporting laboratory has flagged one or more values as critical or panic. Please contact your treating clinician or seek prompt medical evaluation.
          </p>
        </div>
      )}

      {/* Report Overview Block */}
      <div className="rounded-xl bg-muted/30 p-4 border border-border/60 print:border-slate-300 print:bg-slate-50 print:p-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-slate-600">
          {viewMode === "doctor" ? "Clinical Summary Overview" : "What Your Report Shows"}
        </div>
        <p className="mt-1 text-sm font-medium text-foreground leading-relaxed print:text-slate-900">
          {brief.overview.text}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-4 text-xs text-muted-foreground print:text-slate-600">
          <span>
            Total Findings: <strong className="text-foreground print:text-slate-900">{brief.overview.counts.verified}</strong>
          </span>
          <span>
            Outside Range:{" "}
            <strong className="text-rose-600 print:text-rose-700">
              {brief.overview.counts.flagged}
            </strong>
          </span>
          {brief.overview.counts.pages && (
            <span>
              Pages: <strong className="text-foreground print:text-slate-900">{brief.overview.counts.pages}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Key Out-of-Range Findings */}
      {brief.keyFindings.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider print:text-slate-700">
            {viewMode === "doctor"
              ? "Out-of-Range Clinical Highlights"
              : "Results Outside Laboratory Reference Ranges"}
          </h3>
          <div className="space-y-2">
            {brief.keyFindings.map((kf, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-border/80 bg-muted/20 p-3 text-xs leading-relaxed print:border-slate-300 print:bg-white print:p-2"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0 print:bg-slate-700" />
                <span className="print:text-slate-900">{kf.sentence}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-700 dark:text-emerald-300 print:border-emerald-600 print:bg-emerald-50">
          <div className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>All verified tests fall within normal printed reference intervals.</span>
          </div>
        </div>
      )}

      {/* Doctor-Mode Flagged Rows Table */}
      {viewMode === "doctor" && brief.flagged.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider print:text-slate-700">
            Parameters to Discuss ({brief.flagged.length})
          </h3>
          <div className="overflow-x-auto rounded-lg border border-border print:border-slate-300">
            <table className="w-full text-left text-xs print:text-[11px]">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase text-muted-foreground print:bg-slate-100 print:text-slate-700 print:border-slate-300">
                <tr>
                  <th className="py-2.5 px-3">Test</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Reference Range</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 print:table-cell">Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-slate-200">
                {brief.flagged.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="py-2.5 px-3 font-semibold print:text-slate-900">{r.testName}</td>
                    <td className="py-2.5 px-3 font-medium">
                      {r.valueText} {r.unit ?? ""}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground print:text-slate-600">
                      {r.referenceRangeText ?? "Not listed"}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground print:text-slate-600">
                      {r.page ? `p. ${r.page}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suggested Questions for Clinician */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider print:text-slate-700">
          {viewMode === "doctor"
            ? "Questions for Clinical Consultation"
            : "Questions to Ask Your Doctor"}
        </h3>
        <ul className="space-y-2 text-xs text-foreground">
          {brief.questions.map((q, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 print:border-slate-300 print:bg-slate-50 print:p-2"
            >
              <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5 print:text-slate-700" />
              <span className="print:text-slate-900">{q.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Safety & Omitted Line Safeguards */}
      {brief.couldNotVerify.length > 0 && viewMode === "doctor" && (
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-xs space-y-1 print:border-slate-300">
          <div className="font-semibold text-foreground print:text-slate-800 text-[11px]">
            Unverified Test Lines (Excluded from Brief for Safety)
          </div>
          <ul className="list-disc pl-4 text-muted-foreground print:text-slate-600 space-y-0.5">
            {brief.couldNotVerify.map((uv, idx) => (
              <li key={idx}>
                <strong>{uv.testName}</strong>: {uv.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer & Provenance Footer */}
      <div className="border-t border-border/80 pt-4 text-[11px] text-muted-foreground space-y-1 print:border-slate-400 print:text-slate-600 print:pt-3">
        <div className="flex items-center gap-1.5 font-semibold text-foreground print:text-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-600 print:text-slate-700" />
          <span>Evidence-Locked Personal Health Information Assistant (MediScan AI)</span>
        </div>
        <p className="leading-relaxed">{brief.disclaimer}</p>
        <p className="text-[10px] text-muted-foreground/80 print:text-slate-500">
          Generated from verified lab document · Pure deterministic extraction · Zero generative hallucinations
        </p>
      </div>
    </div>
  );
}
