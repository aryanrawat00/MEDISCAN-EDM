import { T, useI18n } from "@/lib/i18n";
/**
 * src/components/report/PipelineTrace.tsx
 * T16: Pipeline Execution Trace and Telemetry (Blueprint §18).
 * Visualizes code vs AI boundaries, execution durations in ms, and verification statistics.
 */

import React from "react";
import { PipelineResult } from "@/lib/report/types";
import { CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Brain, Layers } from "lucide-react";

interface PipelineTraceProps {
  pipeline: PipelineResult;
  className?: string;
}

export function PipelineTrace({ pipeline, className = "" }: PipelineTraceProps) {
  const { t } = useI18n();
  const { stats, trace, unverified } = pipeline;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard
          label={t("Raw Extracted")}
          value={stats.raw}
          desc={t("Identified by AI")}
          icon={<Brain className="h-4 w-4 text-primary" />}
        />
        <StatCard
          label={t("Evidence Locked")}
          value={stats.verified}
          desc={t("100% Quote Match")}
          icon={<ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          highlight={stats.verified > 0}
        />
        <StatCard
          label={t("Flagged Abnormal")}
          value={stats.flagged}
          desc={t("Outside Range")}
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
          color="text-rose-600 dark:text-rose-400"
        />
        <StatCard
          label={t("Unverified")}
          value={stats.unverified}
          desc={t("Failed Quote Match")}
          color={stats.unverified > 0 ? "text-amber-600 dark:text-amber-400" : undefined}
        />
        <StatCard
          label={t("Excluded")}
          value={stats.excluded}
          desc={t("R-ELIG Filtered")}
        />
      </div>

      {/* Execution Stages */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span> <T>{"Execution Stage Trace"}</T> </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
             <T>{"Total Pipeline Time:"}</T> {trace.reduce((acc, t) => acc + t.ms, 0)} ms
          </span>
        </div>

        <div className="space-y-2">
          {trace.map((stage, idx) => {
            const isAi = stage.executor === "AI";
            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  {isAi ? (
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 font-semibold text-[10px]">
                      <Brain className="h-3 w-3" /> AI
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 font-semibold text-[10px]">
                      <Cpu className="h-3 w-3" /> CODE
                    </span>
                  )}
                  <span className="font-medium text-foreground">{stage.stage}</span>
                  <span className="text-muted-foreground">— {stage.detail}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{stage.ms} ms</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unverified Findings list if any */}
      {unverified.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span> <T>{"Unverified Candidates ("}</T> {unverified.length} <T>{") — withheld from clinical view"}</T> </span>
          </div>
          <p className="text-xs text-muted-foreground">
             <T>{"These candidates were suggested by the model but could not be verified against verbatim quotes in your text:"}</T> </p>
          <div className="divide-y divide-border/60 rounded-lg border border-border/40 bg-background/50">
            {unverified.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 text-xs">
                <div>
                  <strong className="text-foreground">{u.testName}</strong>: {u.valueText}
                </div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {u.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  desc,
  icon,
  color,
  highlight = false,
}: {
  label: string;
  value: number;
  desc: string;
  icon?: React.ReactNode;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 space-y-1 shadow-sm ${
        highlight
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${color ?? "text-foreground"}`}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">{desc}</div>
    </div>
  );
}
