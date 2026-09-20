/**
 * src/components/medicine/MedicineEvidenceModal.tsx
 * Interactive Packaging OCR Evidence Verification Modal for Medicine Lens.
 * Traces active ingredients and strengths back to verifiable packaging text and openFDA monographs.
 * "Evidence first. AI second. Code decides."
 */

import React from "react";
import { VerifiedIngredient } from "@/lib/medicine/types";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  X,
  Pill,
  Bookmark,
  Quote,
  Layers,
  FileCheck,
} from "lucide-react";

interface MedicineEvidenceModalProps {
  ingredient: VerifiedIngredient | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MedicineEvidenceModal({
  ingredient,
  isOpen,
  onClose,
}: MedicineEvidenceModalProps) {
  if (!isOpen || !ingredient) return null;

  const isVerified = ingredient.verified;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicine-evidence-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Medicine Evidence Verification"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h2 id="medicine-evidence-title" className="text-lg font-bold tracking-tight text-foreground">
              Medicine Packaging Evidence Verification
            </h2>
            <p className="text-xs text-muted-foreground">
              OCR evidence check for <strong>{ingredient.name}</strong>
            </p>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div>
          {isVerified ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>✓ Packaging evidence verified from OCR text</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
              <span>Evidence could not be confirmed on packaging</span>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-3.5 text-xs">
          {/* Identity and Strength */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
              <span className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">
                Medicine Identity
              </span>
              <p className="font-bold text-sm text-foreground">{ingredient.name}</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
              <span className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">
                Detected Strength
              </span>
              <p className="font-bold text-sm text-foreground">
                {ingredient.strength || "Unspecified strength"}
              </p>
            </div>
          </div>

          {/* Original Packaging Quote */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
              <Quote className="h-3 w-3 text-primary" />
              <span>Original Packaging Evidence</span>
            </div>
            <blockquote className="rounded-xl bg-muted/40 p-3.5 font-mono text-xs text-foreground border-l-3 border-primary leading-relaxed">
              "{ingredient.evidenceQuote}"
            </blockquote>
          </div>

          {/* OCR Verification Checklist */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">
              OCR Evidence Checklist
            </span>
            <ul className="space-y-2 text-xs pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    ingredient.checks.quoteFound
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-500"
                  }`}
                />
                <span className={ingredient.checks.quoteFound ? "text-foreground font-medium" : "text-muted-foreground"}>
                  Quote located in transcribed packaging text
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    ingredient.checks.nameInQuote
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-500"
                  }`}
                />
                <span className={ingredient.checks.nameInQuote ? "text-foreground font-medium" : "text-muted-foreground"}>
                  Active ingredient name present in evidence quote
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    ingredient.checks.strengthInQuote
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                />
                <span className={ingredient.checks.strengthInQuote ? "text-foreground font-medium" : "text-muted-foreground"}>
                  Dosage strength token matched in evidence quote
                </span>
              </li>
            </ul>
          </div>

          {/* Monograph Reference Link */}
          <div className="rounded-xl bg-muted/30 p-3.5 border border-border/60 space-y-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground flex items-center gap-1">
              <Bookmark className="h-3 w-3 text-primary" />
              Official Reference Monograph
            </span>
            {ingredient.matchedMonograph ? (
              <div>
                <p className="font-semibold text-foreground text-xs">
                  {ingredient.matchedMonograph.displayName}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Category: {ingredient.matchedMonograph.category} · Reviewed by {ingredient.matchedMonograph.review.by}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground italic text-xs">
                No approved openFDA OTC monograph associated with this ingredient name.
              </p>
            )}
          </div>

          {/* Verification Verdict */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-1.5 font-bold">
              <FileCheck className="h-4 w-4 text-emerald-600" />
              <span>Verification Verdict</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed">
              {isVerified
                ? "✓ Identity and dosage are supported by verbatim packaging OCR evidence."
                : "Packaging OCR text is insufficient to confirm this ingredient's identity or strength."}
            </p>
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
