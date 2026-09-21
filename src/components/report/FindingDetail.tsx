import { T, useI18n } from "@/lib/i18n";
/**
 * src/components/report/FindingDetail.tsx
 * T16: Detailed Evidence Audit Inspector (Blueprint §18).
 * Displays verification checklists, exact quotes, and rule trace steps for the active finding.
 */

import React from "react";
import { VerifiedFinding } from "@/lib/report/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Check, X, ShieldCheck, AlertCircle, Terminal, Quote } from "lucide-react";

interface FindingDetailProps {
  finding: VerifiedFinding | null;
  className?: string;
}

export function FindingDetail({ finding, className = "" }: FindingDetailProps) {
  const { t } = useI18n();
  if (!finding) {
    return (
      <div className={`rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground ${className}`}>
         <T>{"Select any row from the findings table to inspect its evidence lock and rule trace."}</T> </div>
    );
  }

  const { evidence } = finding;

  return (
    <div className={`space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {finding.testName}
            </h3>
            <span className="text-xs font-mono text-muted-foreground">[{finding.id}]</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
             <T>{"Measured:"}</T> <strong className="text-foreground">{finding.valueText} {finding.unit ?? ""}</strong>
            {finding.referenceRangeText && (
              <>  <T>{"· Printed Range:"}</T> <strong className="text-foreground">{finding.referenceRangeText}</strong></>
            )}
          </p>
        </div>

        <StatusBadge status={finding.status} reason={finding.statusReason} />
      </div>

      {/* Verbatim Quote */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Quote className="h-3.5 w-3.5 text-primary" />
          <span> <T>{"Verbatim Evidence Quote from Source:"}</T> </span>
        </div>
        <blockquote className="rounded-lg bg-muted/40 p-3 font-mono text-xs text-foreground border-l-2 border-primary leading-relaxed">
          "{evidence.quote}"
        </blockquote>
      </div>

      {/* Verification Checklist */}
      <div className="space-y-2 rounded-lg bg-muted/20 p-3.5 border border-border/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span> <T>{"Evidence-Lock Verification Checks"}</T> </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <CheckItem label={t("Quote In Source")} passed={evidence.checks.quoteFound} />
          <CheckItem label={t("Test Name In Quote")} passed={evidence.checks.nameInQuote} />
          <CheckItem label={t("Value In Quote (Standalone)")} passed={evidence.checks.valueInQuote} />
          <CheckItem label={t("Range In Quote")} passed={evidence.checks.rangeInQuote} />
        </div>
      </div>

      {/* Lab Flag Agreement */}
      {finding.labFlag && (
        <div className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 text-xs">
          <span className="text-muted-foreground">
             <T>{"Report Printed Flag:"}</T> <strong>{finding.labFlag}</strong>
          </span>
          <span
            className={`font-semibold ${
              finding.labFlagAgreement === "AGREES"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {finding.labFlagAgreement === "AGREES" ? t("✓ Agrees with Range") : t("⚠ Disagrees with Range")}
          </span>
        </div>
      )}

      {/* Rule Execution Trace */}
      {finding.ruleTrace.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Terminal className="h-3.5 w-3.5" />
            <span> <T>{"Deterministic Rule Trace:"}</T> </span>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300 space-y-1">
            {finding.ruleTrace.map((step, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-400 select-none">&gt;</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {passed ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          <Check className="h-2.5 w-2.5" />
        </span>
      ) : (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
          <X className="h-2.5 w-2.5" />
        </span>
      )}
      <span className={passed ? "text-foreground" : "text-destructive font-medium"}>
        {label}
      </span>
    </div>
  );
}
