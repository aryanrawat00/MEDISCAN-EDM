import { T } from "@/lib/i18n";
/**
 * src/components/history/LegacySymptomView.tsx
 * T23a: Renders legacy symptom checker rows.
 * Highlights that symptom-checking has been retired in favor of evidence-based lenses.
 */

import React from "react";
import { LegacySymptomResult } from "@/lib/legacy";
import { AlertTriangle, AlertOctagon, HeartHandshake, Stethoscope } from "lucide-react";

export function LegacySymptomView({ r }: { r: LegacySymptomResult }) {
  return (
    <div className="space-y-5 text-sm">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
           <T>{"Archived Symptom History — Symptom checking was retired in V3 to adhere to clinical safety standards."}</T> </span>
      </div>

      <section>
        <h3 className="text-base font-semibold"> <T>{"Summary"}</T> </h3>
        <p className="mt-1 text-muted-foreground">{r.summary}</p>
      </section>

      {r.possible_conditions && r.possible_conditions.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Stethoscope className="h-4 w-4" />  <T>{"Possible considerations"}</T> </h3>
          <ul className="mt-2 space-y-2">
            {r.possible_conditions.map((c, i) => (
              <li key={i} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
                    {c.likelihood}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.explanation}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.self_care && r.self_care.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <HeartHandshake className="h-4 w-4" />  <T>{"Self care"}</T> </h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            {r.self_care.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {r.red_flags && r.red_flags.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-base font-semibold text-destructive">
            <AlertOctagon className="h-4 w-4" />  <T>{"Urgent red flags"}</T> </h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-destructive">
            {r.red_flags.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {r.disclaimer && (
        <p className="border-t border-border pt-3 text-xs text-muted-foreground">
          {r.disclaimer}
        </p>
      )}
    </div>
  );
}
