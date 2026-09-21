import { useI18n } from "@/lib/i18n";
/**
 * src/components/StatusBadge.tsx
 * T13: Accessible status badge for report findings (Blueprint §13, §18).
 * Displays LOW, NORMAL, HIGH, or UNKNOWN with distinct iconography and accessible contrast.
 */

import React from "react";
import { Status, StatusReason } from "@/lib/report/types";
import { ArrowDown, ArrowUp, Check, HelpCircle } from "lucide-react";

interface StatusBadgeProps {
  status: Status;
  reason?: StatusReason;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  reason,
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  const { t } = useI18n();
  let badgeStyle = "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-300/60 dark:border-slate-700";
  let label = "Needs review";
  let icon = <HelpCircle className="h-3 w-3" />;

  switch (status) {
    case "LOW":
      badgeStyle =
        "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      label = "Below reference range";
      icon = <ArrowDown className="h-3 w-3" />;
      break;
    case "NORMAL":
      badgeStyle =
        "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      label = "Within reference range";
      icon = <Check className="h-3 w-3" />;
      break;
    case "HIGH":
      badgeStyle =
        "bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300 dark:border-rose-800";
      label = "Above reference range";
      icon = <ArrowUp className="h-3 w-3" />;
      break;
    case "UNKNOWN":
    default:
      badgeStyle =
        "bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-300 border-slate-300 dark:border-slate-700";
      label = "Needs review";
      icon = <HelpCircle className="h-3 w-3" />;
      break;
  }

  return (
    <span
      title={reason ? `Reason: ${reason}` : undefined}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide transition-colors ${badgeStyle} ${className}`}
    >
      {showIcon && icon}
      <span>{t(label)}</span>
    </span>
  );
}
