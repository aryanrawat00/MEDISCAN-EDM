/**
 * src/components/medicine/IngredientsTable.tsx
 * M06: Active Ingredients Table with evidence verification badges (Blueprint §10).
 */

import React from "react";
import { VerifiedIngredient } from "@/lib/medicine/types";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Quote } from "lucide-react";

interface IngredientsTableProps {
  ingredients: VerifiedIngredient[];
  className?: string;
}

export function IngredientsTable({ ingredients, className = "" }: IngredientsTableProps) {
  if (!ingredients || ingredients.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground ${className}`}>
        No active ingredients were detected or verified on this package.
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-border bg-card shadow-sm ${className}`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="py-3 px-4">Verification</th>
            <th className="py-3 px-4">Active Ingredient</th>
            <th className="py-3 px-4">Strength</th>
            <th className="py-3 px-4">Verbatim Packaging Quote</th>
            <th className="py-3 px-4">Monograph Match</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {ingredients.map((ing) => (
            <tr key={ing.id} className="hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4">
                {ing.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" /> Evidence Locked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                    <ShieldAlert className="h-3.5 w-3.5" /> Unverified
                  </span>
                )}
              </td>
              <td className="py-3 px-4 font-semibold text-foreground">
                {ing.name}
              </td>
              <td className="py-3 px-4 font-mono text-xs">
                {ing.strength ?? "—"}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-muted-foreground max-w-xs truncate">
                <span className="inline-flex items-center gap-1">
                  <Quote className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                  "{ing.evidenceQuote}"
                </span>
              </td>
              <td className="py-3 px-4 text-xs">
                {ing.matchedMonograph ? (
                  <span className="font-medium text-primary">
                    {ing.matchedMonograph.displayName}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">No reference monograph</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
