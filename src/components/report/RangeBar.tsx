import { T, useI18n } from "@/lib/i18n";
/**
 * src/components/report/RangeBar.tsx
 * T13: Horizontal range visualization bar (Blueprint §13, §18).
 * Renders the normal reference band and indicates where the measured value falls.
 */

import React from "react";
import { FindingValue, FindingRange, Status } from "@/lib/report/types";

interface RangeBarProps {
  value: FindingValue;
  range: FindingRange;
  status: Status;
  unit?: string | null;
  className?: string;
}

export function RangeBar({ value, range, status, unit, className = "" }: RangeBarProps) {
  const { t } = useI18n();
  if (value.kind !== "numeric" || range.kind !== "interval") {
    return (
      <div className={`text-xs text-muted-foreground italic ${className}`}>
        {range.kind === "text" ? `Ref: ${range.token}` : t("No visual range")}
      </div>
    );
  }

  const v = value.n;
  const lo = range.lo?.n;
  const hi = range.hi?.n;

  // Case 1: Standard bounded interval [lo, hi]
  if (lo !== undefined && hi !== undefined && hi > lo) {
    const span = hi - lo;
    const padding = span * 0.35;
    const minView = lo - padding;
    const maxView = hi + padding;
    const totalView = maxView - minView;

    // Normal zone percentages
    const normalStartPct = Math.max(0, Math.min(100, ((lo - minView) / totalView) * 100));
    const normalWidthPct = Math.max(0, Math.min(100 - normalStartPct, (span / totalView) * 100));

    // Marker pin percentage
    const pinPct = Math.max(3, Math.min(97, ((v - minView) / totalView) * 100));

    let pinColor = "bg-emerald-600 dark:bg-emerald-400";
    if (status === "LOW") pinColor = "bg-amber-600 dark:bg-amber-400";
    if (status === "HIGH") pinColor = "bg-rose-600 dark:bg-rose-400";

    return (
      <div className={`w-full max-w-[220px] space-y-1 ${className}`}>
        <div className="relative h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-visible">
          {/* Normal reference band */}
          <div
            className="absolute top-0 bottom-0 rounded-sm bg-emerald-500/30 dark:bg-emerald-500/20 border-x border-emerald-500/50"
            style={{ left: `${normalStartPct}%`, width: `${normalWidthPct}%` }}
          />

          {/* Value marker needle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10"
            style={{ left: `${pinPct}%` }}
          >
            <div className={`h-4 w-1.5 rounded-full shadow-sm ${pinColor}`} />
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>{lo}</span>
          <span className="font-semibold text-foreground">{v} {unit ?? ""}</span>
          <span>{hi}</span>
        </div>
      </div>
    );
  }

  // Case 2: One-sided upper bound (< hi)
  if (hi !== undefined && lo === undefined) {
    const pinPct = Math.max(5, Math.min(95, (v / (hi * 1.5)) * 100));
    let pinColor = status === "HIGH" ? "bg-rose-600" : "bg-emerald-600";
    return (
      <div className={`w-full max-w-[200px] space-y-1 ${className}`}>
        <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="absolute top-0 bottom-0 left-0 w-2/3 bg-emerald-500/30 rounded-l-full" />
          <div className="absolute top-0 bottom-0 left-2/3 right-0 bg-rose-500/20 rounded-r-full" />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${pinPct}%` }}
          >
            <div className={`h-3.5 w-1.5 rounded-full ${pinColor}`} />
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>0</span>
          <span>&lt; {hi}</span>
        </div>
      </div>
    );
  }

  // Case 3: One-sided lower bound (> lo)
  if (lo !== undefined && hi === undefined) {
    const pinPct = Math.max(5, Math.min(95, (v / (lo * 2)) * 100));
    let pinColor = status === "LOW" ? "bg-amber-600" : "bg-emerald-600";
    return (
      <div className={`w-full max-w-[200px] space-y-1 ${className}`}>
        <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-amber-500/20 rounded-l-full" />
          <div className="absolute top-0 bottom-0 left-1/2 right-0 bg-emerald-500/30 rounded-r-full" />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${pinPct}%` }}
          >
            <div className={`h-3.5 w-1.5 rounded-full ${pinColor}`} />
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>&gt; {lo}</span>
          <span> <T>{"High"}</T> </span>
        </div>
      </div>
    );
  }

  return null;
}
