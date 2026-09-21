/**
 * src/components/medicine/MonographView.tsx
 * M06: Official Reference Monograph Inspector (Blueprint §10).
 * Displays verified OTC drug monograph details from openFDA SPL,
 * with zero hallucinated interaction claims.
 */

import React from "react";
import { MedicineReferenceEntry } from "@/lib/medicine/reference.data";
import { ShieldCheck, AlertOctagon, AlertTriangle, ExternalLink, CheckCircle2, Bookmark } from "lucide-react";

interface MonographViewProps {
  monographs: MedicineReferenceEntry[];
  onAddToChecker?: (monograph: MedicineReferenceEntry) => void;
  className?: string;
}

export function MonographView({
  monographs,
  onAddToChecker,
  className = "",
}: MonographViewProps) {
  if (!monographs || monographs.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground ${className}`}>
        No approved OTC reference monographs matched this scan.
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {monographs.map((mono) => (
        <div key={mono.key} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  {mono.displayName}
                </h3>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {mono.category}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Generic: <strong className="text-foreground">{mono.genericName}</strong> · Purpose: {mono.purposeText}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onAddToChecker && (
                <button
                  type="button"
                  onClick={() => onAddToChecker(mono)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Add to Interaction Check</span>
                </button>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Reviewed by {mono.review.by}
              </span>
            </div>
          </div>

          {/* Boxed Warnings if any */}
          {mono.boxedWarnings && mono.boxedWarnings.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-destructive">
                <AlertOctagon className="h-4 w-4 shrink-0" />
                <span>OFFICIAL FDA BOXED WARNING</span>
              </div>
              <ul className="list-disc pl-5 text-destructive space-y-1">
                {mono.boxedWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Indications / Common Uses */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> FDA Approved Indications & Uses
            </h4>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
              {mono.commonUses.map((use, i) => (
                <li key={i} className="text-foreground/90">{use}</li>
              ))}
            </ul>
          </div>

          {/* Important Safety */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Important Safety Warnings & Precautions
            </h4>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5">
              {mono.importantSafety.map((warn, i) => (
                <li key={i} className="text-foreground/90">{warn}</li>
              ))}
            </ul>
          </div>

          {/* SPL Provenance Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground font-mono">
            <span>Source: {mono.source.name} (Set ID: {mono.source.setId.slice(0, 8)}…)</span>
            <a
              href={mono.source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <span>openFDA Monograph</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
