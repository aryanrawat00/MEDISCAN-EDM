/**
 * src/components/report/FindingsTable.tsx
 * T16: Interactive Findings Table (Blueprint §18).
 * Renders verified findings with status badges, values, range bars, and row selection.
 */

import React from "react";
import { VerifiedFinding } from "@/lib/report/types";
import { StatusBadge } from "@/components/StatusBadge";
import { RangeBar } from "./RangeBar";
import { AlertCircle, Eye } from "lucide-react";

interface FindingsTableProps {
  findings: VerifiedFinding[];
  selectedFindingId: string | null;
  onSelectFinding: (id: string) => void;
  className?: string;
}

export function FindingsTable({
  findings,
  selectedFindingId,
  onSelectFinding,
  className = "",
}: FindingsTableProps) {
  if (!findings || findings.length === 0) {
    return (
      <div className={`p-8 text-center text-sm text-muted-foreground ${className}`}>
        No verified findings available.
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-border bg-card shadow-sm ${className}`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          <tr>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Test Name</th>
            <th className="py-3 px-4">Result Value</th>
            <th className="py-3 px-4 min-w-[200px]">Reference Range</th>
            <th className="py-3 px-3 text-center">Page</th>
            <th className="py-3 px-3 text-center">Evidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {findings.map((f) => {
            const isSelected = f.id === selectedFindingId;
            return (
              <tr
                key={f.id}
                onClick={() => onSelectFinding(f.id)}
                className={`cursor-pointer transition-colors hover:bg-accent/40 ${
                  isSelected ? "bg-primary/5 font-medium ring-1 ring-inset ring-primary/40" : ""
                }`}
              >
                {/* Status Column */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={f.status} reason={f.statusReason} />
                    {f.labFlagAgreement === "DISAGREES" && (
                      <span
                        title="Lab flag disagrees with printed range calculation"
                        className="text-amber-500"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </td>

                {/* Test Name */}
                <td className="py-3.5 px-4 font-medium text-foreground">
                  <div>{f.testName}</div>
                  {f.labFlag && (
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Lab Flag: <strong className="text-foreground">{f.labFlag}</strong>
                    </span>
                  )}
                </td>

                {/* Result Value */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-semibold text-foreground text-base">
                    {f.valueText}
                  </span>
                  {f.unit && (
                    <span className="ml-1 text-xs text-muted-foreground">{f.unit}</span>
                  )}
                </td>

                {/* Range Bar */}
                <td className="py-3.5 px-4">
                  <RangeBar
                    value={f.value}
                    range={f.range}
                    status={f.status}
                    unit={f.unit}
                  />
                </td>

                {/* Page */}
                <td className="py-3.5 px-3 text-center text-xs text-muted-foreground">
                  {f.evidence.page ? `P.${f.evidence.page}` : "—"}
                </td>

                {/* View Evidence */}
                <td className="py-3.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFinding(f.id);
                    }}
                    className={`inline-flex items-center justify-center h-7 w-7 rounded-md text-xs transition-colors ${
                      isSelected
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    title="Inspect Quote in Source"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
