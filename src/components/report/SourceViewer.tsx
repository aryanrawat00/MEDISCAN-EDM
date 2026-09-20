/**
 * src/components/report/SourceViewer.tsx
 * T16: Source Document Evidence Viewer (Blueprint §18).
 * Displays the original report text with exact highlight on the verbatim quote span
 * corresponding to the selected finding.
 */

import React, { useRef, useEffect } from "react";
import { FindingEvidence } from "@/lib/report/types";
import { CheckCircle2, FileText, Quote } from "lucide-react";

interface SourceViewerProps {
  sourceText: string;
  evidence: FindingEvidence | null;
  fileName?: string;
  className?: string;
}

export function SourceViewer({ sourceText, evidence, fileName, className = "" }: SourceViewerProps) {
  const highlightRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [evidence]);

  if (!sourceText || sourceText.trim().length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground ${className}`}>
        <FileText className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="font-semibold text-foreground">Extracted source text is unavailable</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {fileName
            ? `Source file: ${fileName}. Raw document text was not retained in session memory.`
            : "Original document text is not stored for this analysis view."}
        </p>
      </div>
    );
  }

  // If no evidence span is active, render unhighlighted source
  const span = evidence?.span;
  if (!span || span.start >= span.end || span.start < 0 || span.end > sourceText.length) {
    return (
      <div className={`rounded-xl border border-border bg-card p-4 space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Original Report Text</span>
        </div>
        <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
          {sourceText}
        </pre>
      </div>
    );
  }

  const before = sourceText.slice(0, span.start);
  const matched = sourceText.slice(span.start, span.end);
  const after = sourceText.slice(span.end);

  return (
    <div className={`rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Quote className="h-4 w-4 text-primary" />
          <span>Source Evidence Lock</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            Verbatim Match [Chars {span.start}–{span.end}]
          </span>
          {evidence.page && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-muted-foreground">
              Page {evidence.page}
            </span>
          )}
        </div>
      </div>

      <pre className="max-h-[380px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted/30 p-4 font-mono text-xs leading-relaxed text-foreground">
        <span>{before}</span>
        <mark
          ref={highlightRef}
          className="rounded bg-primary/20 text-primary dark:bg-primary/30 px-1 py-0.5 font-bold ring-2 ring-primary/60"
        >
          {matched}
        </mark>
        <span>{after}</span>
      </pre>
    </div>
  );
}
