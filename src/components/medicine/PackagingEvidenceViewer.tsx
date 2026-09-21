import { T } from "@/lib/i18n";
/**
 * src/components/medicine/PackagingEvidenceViewer.tsx
 * M06: Verbatim Packaging OCR Inspector (Blueprint §10).
 * Displays transcribed text from packaging and highlights verified evidence quotes.
 */

import React from "react";
import { PackagingEvidenceItem } from "@/lib/medicine/types";
import { ShieldCheck, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

interface PackagingEvidenceViewerProps {
  transcribedText: string;
  evidenceItems: PackagingEvidenceItem[];
  imagePreview?: string | null;
  className?: string;
}

export function PackagingEvidenceViewer({
  transcribedText,
  evidenceItems,
  imagePreview,
  className = "",
}: PackagingEvidenceViewerProps) {
  return (
    <div className={`grid gap-6 lg:grid-cols-2 ${className}`}>
      {/* Left Column: Image or Verification List */}
      <div className="space-y-4">
        {imagePreview ? (
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
               <T>{"Captured Packaging Image"}</T> </p>
            <div className="overflow-hidden rounded-lg bg-black/5 flex items-center justify-center max-h-[360px]">
              <img
                src={imagePreview}
                alt="Medicine packaging preview"
                className="max-h-[360px] w-auto object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
             <T>{"No package photo preview available."}</T> </div>
        )}

        {/* Evidence Verification Checklist */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
             <T>{"Evidence Locking Checklist"}</T> </p>
          <div className="space-y-1.5">
            {evidenceItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md bg-muted/40 p-2 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-foreground truncate">{item.field}</p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">
                    "{item.quote}"
                  </p>
                </div>
                {item.verified ? (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />  <T>{"Locked"}</T> </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                    <ShieldAlert className="h-3.5 w-3.5" />  <T>{"Mismatch"}</T> </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Transcribed Text */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" />  <T>{"Transcribed Packaging Text (OCR)"}</T> </p>
          <span className="text-[11px] text-muted-foreground font-mono">
            {transcribedText.length}  <T>{"characters"}</T> </span>
        </div>

        <pre className="max-h-[440px] overflow-auto whitespace-pre-wrap font-mono text-xs text-foreground p-2 rounded bg-muted/30">
          {transcribedText || "No readable packaging text transcribed."}
        </pre>
      </div>
    </div>
  );
}
