/**
 * src/components/report/EvidenceVerificationModal.tsx
 * Interactive Evidence Verification Inspector Modal.
 * Provides transparent, deterministic proof behind every laboratory finding.
 * "Evidence first. AI second. Code decides."
 */

import React from "react";
import { VerifiedFinding } from "@/lib/report/types";
import { deriveRuleAppliedText } from "@/lib/report/verificationId";
import { explainFindingStatus } from "@/lib/report/explain";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Quote,
  Terminal,
  ExternalLink,
} from "lucide-react";

interface EvidenceVerificationModalProps {
  finding: VerifiedFinding | null;
  reportTitle?: string;
  sourceTextAvailable?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function EvidenceVerificationModal({
  finding,
  reportTitle = "Diagnostic Laboratory Report",
  sourceTextAvailable = true,
  isOpen,
  onClose,
}: EvidenceVerificationModalProps) {
  if (!isOpen || !finding) return null;

  const { evidence } = finding;
  const isVerified = evidence.verified;
  const hasQuote = Boolean(evidence.quote && evidence.quote.trim().length > 0);
  // Convert discriminated union types to the simple shape expected by deriveRuleAppliedText
  const numericValue = finding.value.kind === "numeric" ? finding.value.n : null;
  const rangeBounds = finding.range.kind === "interval"
    ? { low: finding.range.lo?.n ?? null, high: finding.range.hi?.n ?? null }
    : null;
  const ruleText = deriveRuleAppliedText(finding.statusReason, {
    value: numericValue,
    valueText: finding.valueText,
    range: rangeBounds,
    referenceRangeText: finding.referenceRangeText,
  });
  const findingExplanation = explainFindingStatus(finding);

  // Determine Verification State: VERIFIED | UNVERIFIED | SOURCE UNAVAILABLE
  let verificationState: "VERIFIED" | "UNVERIFIED" | "SOURCE_UNAVAILABLE" = "VERIFIED";
  if (!sourceTextAvailable) {
    verificationState = "SOURCE_UNAVAILABLE";
  } else if (!isVerified) {
    verificationState = "UNVERIFIED";
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-verification-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Evidence Verification"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 id="evidence-verification-title" className="text-lg font-bold tracking-tight text-foreground">
              Evidence Verification
            </h2>
            <p className="text-xs text-muted-foreground">
              Deterministic verification audit for <strong>{finding.testName}</strong>
            </p>
          </div>
        </div>

        {/* Verification State Badge */}
        <div>
          {verificationState === "VERIFIED" && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>✓ Evidence verified against verbatim report source</span>
            </div>
          )}
          {verificationState === "UNVERIFIED" && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
              <span>Evidence could not be verified</span>
            </div>
          )}
          {verificationState === "SOURCE_UNAVAILABLE" && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-500/30 bg-slate-500/10 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <HelpCircle className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Raw source evidence unavailable</span>
            </div>
          )}
        </div>

        {/* Finding Card Details */}
        <div className="space-y-3.5 text-xs">
          {/* Finding explanation */}
          <div className="rounded-xl bg-muted/30 p-3.5 border border-border/60 space-y-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">
              Finding
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-foreground">{finding.testName}</span>
              <StatusBadge status={finding.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {findingExplanation}
            </p>
          </div>

          {/* Value and Range Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
              <span className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">
                Extracted Value
              </span>
              <p className="font-bold text-sm text-foreground">
                {finding.valueText} {finding.unit ?? ""}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
              <span className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">
                Reference Interval
              </span>
              <p className="font-medium text-xs text-foreground">
                {finding.referenceRangeText || "No printed bounds"}
              </p>
            </div>
          </div>

          {/* Rule Applied */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px] uppercase tracking-wider">
              <Terminal className="h-3.5 w-3.5" />
              <span>Rule Applied</span>
            </div>
            <p className="font-mono text-xs text-foreground font-medium">
              {ruleText}
            </p>
          </div>

          {/* Original Evidence Quote */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Quote className="h-3 w-3 text-primary" />
                Original Evidence Quote
              </span>
              <span className="text-muted-foreground">
                {evidence.page ? `Page ${evidence.page}` : "Extracted Span"}
              </span>
            </div>
            {hasQuote ? (
              <blockquote className="rounded-xl bg-muted/40 p-3.5 font-mono text-xs text-foreground border-l-3 border-primary leading-relaxed">
                "{evidence.quote}"
              </blockquote>
            ) : (
              <p className="rounded-xl bg-muted/20 p-3 italic text-muted-foreground text-xs">
                No verbatim text quote anchored to this finding.
              </p>
            )}
          </div>

          {/* Source Document */}
          <div className="flex items-center justify-between rounded-xl bg-muted/20 p-3 text-xs border border-border/60">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Source:</span>
              <span className="font-medium text-foreground truncate max-w-[220px]">
                {reportTitle}
              </span>
            </div>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
              {evidence.page ? `Page ${evidence.page}` : "Uploaded Report"}
            </span>
          </div>

          {/* Verification Checklist */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">
              Deterministic Verification Audit
            </span>
            <ul className="space-y-2 text-xs pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    evidence.checks.quoteFound
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-500"
                  }`}
                />
                <span className={evidence.checks.quoteFound ? "text-foreground font-medium" : "text-muted-foreground"}>
                  Evidence found in original document text
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    evidence.checks.valueInQuote
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-500"
                  }`}
                />
                <span className={evidence.checks.valueInQuote ? "text-foreground font-medium" : "text-muted-foreground"}>
                  Value matches extracted data outside range boundaries
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-foreground font-medium">
                  Deterministic classification rule applied
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border pt-4 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
