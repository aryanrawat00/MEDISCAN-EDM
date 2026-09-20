/**
 * src/hooks/useReportPipeline.ts
 * T14: State machine hook for Report Lens analysis (Blueprint §14, §18).
 * Manages extraction, deterministic pipeline execution, error states, and selected finding synchronization.
 */

import { useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeReport } from "@/lib/ai.functions";
import { ReportAnalysisV2, VerifiedFinding } from "@/lib/report/types";
import { toast } from "sonner";

export type PipelineStatus = "IDLE" | "EXTRACTING" | "VERIFYING" | "SUCCESS" | "ERROR";

export interface UseReportPipelineReturn {
  status: PipelineStatus;
  analysis: ReportAnalysisV2 | null;
  error: string | null;
  errorCode: string | null;
  selectedFindingId: string | null;
  selectedFinding: VerifiedFinding | null;
  setSelectedFindingId: (id: string | null) => void;
  runAnalysis: (text: string, fileName?: string, sourceKind?: "paste" | "txt" | "pdf" | "demo") => Promise<ReportAnalysisV2 | null>;
  reset: () => void;
}

export function useReportPipeline(): UseReportPipelineReturn {
  const [status, setStatus] = useState<PipelineStatus>("IDLE");
  const [analysis, setAnalysis] = useState<ReportAnalysisV2 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  const analyzeFn = useServerFn(analyzeReport);

  const runAnalysis = useCallback(
    async (
      text: string,
      fileName?: string,
      sourceKind: "paste" | "txt" | "pdf" | "demo" = "paste",
    ): Promise<ReportAnalysisV2 | null> => {
      if (!text || text.trim().length < 10) {
        toast.error("Please provide at least 10 characters of report text.");
        return null;
      }

      setStatus("EXTRACTING");
      setError(null);
      setErrorCode(null);

      try {
        const res = await analyzeFn({
          data: {
            text,
            fileName,
            sourceKind,
          },
        });

        if (!res.ok) {
          setStatus("ERROR");
          setError(res.message);
          setErrorCode(res.code);
          toast.error(res.message);
          return null;
        }

        setStatus("SUCCESS");
        setAnalysis(res.data);
        // Default selection to first flagged finding or first finding
        const findings = res.data.pipeline.findings;
        const firstFlagged = findings.find((f) => f.attention || f.status === "LOW" || f.status === "HIGH");
        setSelectedFindingId(firstFlagged?.id || findings[0]?.id || null);

        toast.success(`Analyzed ${findings.length} findings with evidence locking.`);
        return res.data;
      } catch (err: any) {
        setStatus("ERROR");
        const msg = err?.message || "Failed to analyze report.";
        setError(msg);
        toast.error(msg);
        return null;
      }
    },
    [analyzeFn],
  );

  const reset = useCallback(() => {
    setStatus("IDLE");
    setAnalysis(null);
    setError(null);
    setErrorCode(null);
    setSelectedFindingId(null);
  }, []);

  const selectedFinding =
    analysis?.pipeline.findings.find((f) => f.id === selectedFindingId) ?? null;

  return {
    status,
    analysis,
    error,
    errorCode,
    selectedFindingId,
    selectedFinding,
    setSelectedFindingId,
    runAnalysis,
    reset,
  };
}
