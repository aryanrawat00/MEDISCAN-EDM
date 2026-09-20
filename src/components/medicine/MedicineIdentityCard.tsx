/**
 * src/components/medicine/MedicineIdentityCard.tsx
 * M06: Header card displaying medicine identification status, brand name, and confidence (Blueprint §10).
 */

import React from "react";
import { IdentificationStatus, MedicineScanV3 } from "@/lib/medicine/types";
import { ShieldCheck, AlertTriangle, HelpCircle, XCircle, CheckCircle2, Pill } from "lucide-react";

interface MedicineIdentityCardProps {
  scan: MedicineScanV3;
  className?: string;
}

export function MedicineIdentityCard({ scan, className = "" }: MedicineIdentityCardProps) {
  const { status, statusReason, brandName, dosageForm, monographs } = scan;

  return (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                {brandName || (monographs[0]?.displayName ?? "Unidentified Packaging")}
              </h2>
              <StatusBadge status={status} />
            </div>
            {dosageForm && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Dosage form: <span className="font-medium text-foreground">{dosageForm}</span>
              </p>
            )}
          </div>
        </div>

        {/* Monograph count badge */}
        {monographs.length > 0 && (
          <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>{monographs.length} Approved openFDA Monograph{monographs.length > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs">
        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
          Identification Verdict
        </p>
        <p className="mt-0.5 text-foreground">{statusReason}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: IdentificationStatus }) {
  switch (status) {
    case "IDENTIFIED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Identified
        </span>
      );
    case "AMBIGUOUS":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" /> Ambiguous Match
        </span>
      );
    case "UNVERIFIED_INGREDIENTS":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
          <XCircle className="h-3.5 w-3.5" /> Unverified Ingredients
        </span>
      );
    case "UNREADABLE":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          <HelpCircle className="h-3.5 w-3.5" /> Unreadable Image
        </span>
      );
    case "UNIDENTIFIED":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          <HelpCircle className="h-3.5 w-3.5" /> Unidentified
        </span>
      );
  }
}
