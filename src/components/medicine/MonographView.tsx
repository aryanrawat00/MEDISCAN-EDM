import { T } from "@/lib/i18n";
/**
 * src/components/medicine/MonographView.tsx
 * M06: Official Reference Monograph Inspector (Blueprint §10).
 * Displays verified OTC drug monograph details from openFDA SPL,
 * with zero hallucinated interaction claims.
 */

import React from "react";
import { MedicineReferenceEntry } from "@/lib/medicine/reference.data";
import { ShieldCheck, AlertOctagon, AlertTriangle, ExternalLink, CheckCircle2, Bookmark } from "lucide-react";
import { PresentationModeToggle } from "@/components/PresentationModeToggle";
import { usePresentationMode, type PresentationMode } from "@/lib/presentation-mode";
import { getWarningCopy } from "@/lib/medicine/warning-copy";

export function MedicineReferenceSubtitle() {
  const { mode } = usePresentationMode();
  return <T>{mode === "plain" ? "What we found for this medicine." : "Reference snapshot from the existing openFDA label registry."}</T>;
}

export function MedicineWarning({ medicine, original, mode }: { medicine: MedicineReferenceEntry; original: string; mode: PresentationMode }) {
  const copy = getWarningCopy(medicine, original);
  const showOriginal = mode === "technical" || !copy || copy.keepOriginalVisible;
  return <div className="space-y-1 leading-relaxed">
    {copy && <p className="font-semibold">{copy.lead}</p>}
    {showOriginal ? <div><span className="text-[10px] font-medium opacity-75"><T>Official FDA wording</T></span><p>{original}</p></div> :
      <details key={mode} className="text-xs">
        <summary className="w-fit cursor-pointer rounded py-1 font-medium opacity-80 hover:opacity-100"><T>Official FDA wording</T></summary>
        <p className="pt-1">{original}</p>
      </details>}
  </div>;
}

interface MonographViewProps {
  monographs: MedicineReferenceEntry[];
  onAddToChecker?: (monograph: MedicineReferenceEntry) => void;
  className?: string;
  showSubtitle?: boolean;
}

export function MonographView({
  monographs,
  onAddToChecker,
  className = "",
  showSubtitle = true,
}: MonographViewProps) {
  const { mode } = usePresentationMode();
  if (!monographs || monographs.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground ${className}`}>
         <T>{"No approved OTC reference monographs matched this scan."}</T> </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {showSubtitle && <p className="text-xs text-muted-foreground"><MedicineReferenceSubtitle /></p>}
        <PresentationModeToggle />
      </div>
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
                 <T>{"Generic:"}</T> <strong className="text-foreground">{mono.genericName}</strong>  <T>{"· Purpose:"}</T> {mono.purposeText}
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
                  <span> <T>{"Add to Interaction Check"}</T> </span>
                </button>
              )}
              {mono.review.status === "APPROVED" && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> <T>Checked against the official FDA label.</T>
              </span>}
            </div>
          </div>

          <div className="grid gap-2 rounded-xl border border-border bg-muted/20 p-4 text-sm sm:grid-cols-3">
            <div><p className="text-xs font-medium text-muted-foreground"><T>What it is</T></p><p className="mt-1 font-semibold">{mono.genericName}</p></div>
            <div><p className="text-xs font-medium text-muted-foreground"><T>Common forms</T></p><p className="mt-1">{mono.dosageForms?.join(", ") || <T>Not listed in this label</T>}</p></div>
            <div><p className="text-xs font-medium text-muted-foreground"><T>Reference strengths</T></p><p className="mt-1">{mono.standardStrengths?.join(", ") || <T>Not listed in this label</T>}</p></div>
          </div>

          {/* Boxed Warnings if any */}
          {mono.boxedWarnings && mono.boxedWarnings.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-destructive">
                <AlertOctagon className="h-4 w-4 shrink-0" />
                <span> <T>{"OFFICIAL FDA BOXED WARNING"}</T> </span>
              </div>
              <ul className="list-disc pl-5 text-destructive space-y-1">
                {mono.boxedWarnings.map((w, i) => (
                  <li key={i}><MedicineWarning medicine={mono} original={w} mode={mode} /></li>
                ))}
              </ul>
            </div>
          )}

          {/* Indications / Common Uses */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />  <T>{"FDA Approved Indications & Uses"}</T> </h4>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
              {mono.commonUses.map((use, i) => (
                <li key={i} className="text-foreground/90">{use}</li>
              ))}
            </ul>
          </div>

          {/* Important Safety */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />  <T>{"Important Safety Warnings & Precautions"}</T> </h4>
            <p className="mb-2 text-xs text-muted-foreground"><T>Read these warnings before using the medicine. Keep the original label wording below.</T></p>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5">
              {mono.importantSafety.map((warn, i) => (
                <li key={i} className="text-foreground/90"><MedicineWarning medicine={mono} original={warn} mode={mode} /></li>
              ))}
            </ul>
          </div>

          {/* SPL Provenance Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
            {mode === "plain" ? <div className="min-w-0 space-y-1">
              <p><T>Source: official U.S. FDA drug label, via openFDA</T></p>
              <details>
                <summary className="w-fit cursor-pointer rounded py-1 font-medium text-foreground hover:underline"><T>Details</T></summary>
                <p className="break-words font-mono"><T>Source:</T> {mono.source.name} (<T>Set ID:</T> {mono.source.setId})</p>
              </details>
            </div> : <p className="min-w-0 break-words font-mono"><T>Source:</T> {mono.source.name} (<T>Set ID:</T> {mono.source.setId})</p>}
            <a
              href={mono.source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <span> <T>{"openFDA Monograph"}</T> </span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
