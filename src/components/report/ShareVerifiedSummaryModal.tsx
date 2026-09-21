/**
 * src/components/report/ShareVerifiedSummaryModal.tsx
 * Shareable Verified Summary Modal.
 * Generates an evidence-locked, shareable patient visit summary with deterministic Verification ID.
 * "Evidence first. AI second. Code decides."
 */

import React, { useState } from "react";
import { DoctorBrief } from "@/lib/report/types";
import {
  generateShareableVerifiedSummary,
  downloadSummaryFile,
  copySummaryToClipboard,
  VerifiedFindingEvidenceItem,
} from "@/lib/report/summaryExport";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Copy,
  Download,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface ShareVerifiedSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  brief: DoctorBrief;
  reportName?: string;
  verificationId: string;
  evidenceFingerprint?: string;
  findingsWithEvidence?: VerifiedFindingEvidenceItem[];
}

export function ShareVerifiedSummaryModal({
  isOpen,
  onClose,
  brief,
  reportName = "Diagnostic Laboratory Report",
  verificationId,
  evidenceFingerprint,
  findingsWithEvidence,
}: ShareVerifiedSummaryModalProps) {
  if (!isOpen) return null;

  const summaryText = generateShareableVerifiedSummary(brief, {
    reportName,
    verificationId,
    evidenceFingerprint,
    findingsWithEvidence,
  });

  const handleCopy = async () => {
    const success = await copySummaryToClipboard(summaryText);
    if (success) {
      toast.success("Verified summary copied to clipboard.");
    } else {
      toast.error("Failed to copy summary.");
    }
  };

  const handleDownload = () => {
    const filename = `mediscan-verified-${verificationId.toLowerCase()}.txt`;
    downloadSummaryFile(summaryText, filename);
    toast.success(`Downloaded ${filename}`);
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-verified-summary-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-7 space-y-5 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Share Summary"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="share-verified-summary-title" className="text-lg font-bold tracking-tight text-foreground">
                Share Verified Summary
              </h2>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {verificationId}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Evidence-locked summary ready for clinical appointment discussion or printing.
            </p>
          </div>
        </div>

        {/* Verification ID / Fingerprint Callout */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">
                Verification ID: <span className="font-mono text-primary">{verificationId}</span>
              </p>
              {evidenceFingerprint && (
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  Integrity Fingerprint: {evidenceFingerprint}
                </p>
              )}
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {brief.overview.counts.verified} Verified findings · Zero PII
          </span>
        </div>

        {/* Plain Text Preview Container */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap select-all">
          {summaryText}
        </div>

        {/* Actions Toolbar */}
        <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-9 text-xs">
            Close
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-9 text-xs"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Summary
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-9 text-xs"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download (.txt)
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="h-9 brand-gradient text-white text-xs shadow-xs"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
