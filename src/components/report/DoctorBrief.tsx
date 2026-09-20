/**
 * src/components/report/DoctorBrief.tsx
 * T20: Printable Doctor Visit Brief Component (Blueprint §14, §20).
 * Clean, clinical summary designed for patient-doctor appointments.
 * Includes 1-click print and copy-as-text actions.
 */

import React from "react";
import { DoctorBrief } from "@/lib/report/types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Printer, Copy, CheckCircle2, AlertOctagon, HelpCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface DoctorBriefProps {
  brief: DoctorBrief;
  className?: string;
}

export function DoctorBriefView({ brief, className = "" }: DoctorBriefProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      "=== DOCTOR VISIT BRIEF ===",
      `Generated: ${new Date(brief.generatedAt).toLocaleDateString()}`,
      "",
      "OVERVIEW:",
      brief.overview.text,
      "",
      "KEY FINDINGS:",
      ...brief.keyFindings.map((kf) => `• ${kf.sentence}`),
      "",
      "QUESTIONS TO DISCUSS WITH CLINICIAN:",
      ...brief.questions.map((q) => `? ${q.text}`),
      "",
      "DISCLAIMER:",
      brief.disclaimer,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Brief copied to clipboard.");
  };

  return (
    <div className={`space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm print:border-none print:p-0 print:shadow-none print:text-black ${className}`}>
      {/* Printable Clinical Document Header */}
      <div className="hidden print:block border-b-2 border-slate-300 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">MediScan Doctor Visit Brief</h1>
            <p className="text-xs text-slate-600">Patient-prepared, evidence-locked clinical summary</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>Date: {new Date(brief.generatedAt).toLocaleDateString()}</p>
            <p className="font-medium">{brief.overview.counts.verified} Verified findings · {brief.overview.counts.flagged} Flagged</p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Doctor Visit Brief
          </h2>
          <p className="text-xs text-muted-foreground">
            Evidence-locked summary prepared for consultation with your doctor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyText}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy Text
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint} className="brand-gradient text-white">
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print Brief
          </Button>
        </div>
      </div>

      {/* Critical Alert Banner if laboratory printed critical marker */}
      {brief.criticalBanner && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-800 dark:text-rose-300 print:border-rose-600 print:text-rose-900">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <AlertOctagon className="h-5 w-5 text-rose-600" />
            <span>Critical Laboratory Alert Notice</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed">
            The reporting laboratory has flagged one or more values as critical or panic. Please contact your treating clinician or seek immediate clinical advice.
          </p>
        </div>
      )}

      {/* Overview Block */}
      <div className="rounded-xl bg-muted/30 p-4 border border-border/40">
        <div className="text-xs font-semibold uppercase text-muted-foreground">Report Summary</div>
        <p className="mt-1 text-sm font-medium text-foreground leading-relaxed">
          {brief.overview.text}
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Total Findings: <strong>{brief.overview.counts.verified}</strong></span>
          <span>Outside Range: <strong className="text-rose-600">{brief.overview.counts.flagged}</strong></span>
          {brief.overview.counts.pages && <span>Pages: <strong>{brief.overview.counts.pages}</strong></span>}
        </div>
      </div>

      {/* Key Findings List */}
      {brief.keyFindings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
            Out-of-Range Highlights
          </h3>
          <div className="space-y-2">
            {brief.keyFindings.map((kf, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs leading-relaxed"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{kf.sentence}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flagged Rows Table */}
      {brief.flagged.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
            Parameters to Discuss ({brief.flagged.length})
          </h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 px-3">Test</th>
                  <th className="py-2 px-3">Result</th>
                  <th className="py-2 px-3">Reference Range</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brief.flagged.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 font-semibold">{r.testName}</td>
                    <td className="py-2.5 px-3">{r.valueText} {r.unit ?? ""}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.referenceRangeText ?? "—"}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Questions for Clinician */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
          Suggested Questions for your Clinician
        </h3>
        <ul className="space-y-2 text-xs text-foreground">
          {brief.questions.map((q, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3"
            >
              <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{q.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer & Provenance */}
      <div className="border-t border-border/80 pt-4 text-[11px] text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Evidence-Locked Personal Health Information Assistant</span>
        </div>
        <p>{brief.disclaimer}</p>
      </div>
    </div>
  );
}
