/**
 * src/lib/ai.functions.ts
 * T10: Server functions for AI-assisted analysis with evidence verification.
 * analyzeReport: Invokes Gemini extraction with model fallback, runs deterministic pipeline,
 * and returns structured ReportAnalysisV2 in a safe Result<T> envelope.
 */

import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { resolveUserOrGuest } from "./auth.middleware";
import { withModelFallback } from "./shared/model.server";
import { REPORT_EXTRACTION_PROMPT } from "./report/prompts";
import { extractionOutputSchema } from "./report/schemas";
import { runReportPipeline } from "./report/pipeline";
import { buildDoctorBrief } from "./report/brief";
import { ReportAnalysisV2 } from "./report/types";
import { Result, okResult, errResult } from "./shared/result";
import { LegacyReportResult } from "./legacy";

// Backward compatibility alias for legacy components during transition
export type ReportResult = LegacyReportResult;

function stripJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fence ? fence[1] : text).trim();
}

const ReportInput = z.object({
  text: z.string().min(10).max(25000),
  sourceKind: z.enum(["paste", "txt", "pdf", "demo"]).optional().default("paste"),
  fileName: z.string().optional(),
});

export const analyzeReport = createServerFn({ method: "POST" })
  .middleware([resolveUserOrGuest])
  .inputValidator((d: unknown) => ReportInput.parse(d))
  .handler(async ({ data }): Promise<Result<ReportAnalysisV2>> => {
    try {
      const startTime = Date.now();
      const prompt = REPORT_EXTRACTION_PROMPT.replace("{{REPORT_TEXT}}", data.text);

      const { result: text, usedModel } = await withModelFallback(async (model) => {
        const res = await generateText({
          model,
          prompt,
          temperature: 0.1,
        });
        return res.text;
      });

      const extractionDurationMs = Date.now() - startTime;

      let rawObj: unknown;
      try {
        rawObj = JSON.parse(stripJson(text));
      } catch (jsonErr) {
        return errResult("AI_BAD_OUTPUT", "The AI returned an invalid JSON response.");
      }

      const parsedExtraction = extractionOutputSchema.safeParse(rawObj);
      if (!parsedExtraction.success) {
        return errResult("AI_BAD_OUTPUT", "Extraction did not match expected schema format.");
      }

      const pipeline = runReportPipeline({
        sourceText: data.text,
        rawFindings: parsedExtraction.data.findings,
        reportNotes: parsedExtraction.data.reportNotes,
        extractionDurationMs,
      });

      if (pipeline.findings.length === 0 && pipeline.unverified.length === 0) {
        return errResult("NO_FINDINGS", "No clinical test findings could be identified in this report.");
      }

      const envelope: ReportAnalysisV2 = {
        schemaVersion: 2,
        engineVersion: "1.0.0",
        promptVersion: "extract-v1",
        model: usedModel,
        source: {
          kind: data.sourceKind || "paste",
          fileName: data.fileName,
        },
        pipeline,
        brief: buildDoctorBrief(pipeline),
      };

      return okResult(envelope);
    } catch (err: any) {
      console.error("[analyzeReport error]:", err);
      const msg = err?.message || "An error occurred during report analysis.";
      if (msg.includes("API_KEY") || msg.includes("GEMINI")) {
        return errResult("AI_UNAVAILABLE", msg);
      }
      return errResult("INTERNAL", msg);
    }
  });
