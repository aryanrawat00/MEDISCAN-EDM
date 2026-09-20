/**
 * src/lib/report/brief.ts
 * T20: Doctor Visit Brief Builder (Blueprint §14, §20).
 * Pure deterministic builder that formats findings into a 1-page clinical visit summary.
 * Designed to work 100% offline without live AI calls.
 */

import { PipelineResult, DoctorBrief, BriefRow } from "./types";
import { explainFindingStatus } from "./explain";

const CLINICAL_DISCLAIMER =
  "This Doctor Visit Brief is an evidence-locked patient summary prepared for educational discussion with your healthcare provider. It does not replace clinical evaluation or diagnostic interpretation.";

export function buildDoctorBrief(pipeline: PipelineResult): DoctorBrief {
  const { findings, unverified, excluded, stats, reportNotes } = pipeline;

  const flaggedRows: BriefRow[] = findings
    .filter((f) => f.attention || f.status === "LOW" || f.status === "HIGH")
    .map((f) => ({
      findingId: f.id,
      testName: f.testName,
      valueText: f.valueText,
      unit: f.unit,
      referenceRangeText: f.referenceRangeText,
      status: f.status,
      page: f.evidence.page,
    }));

  const allRows: BriefRow[] = findings.map((f) => ({
    findingId: f.id,
    testName: f.testName,
    valueText: f.valueText,
    unit: f.unit,
    referenceRangeText: f.referenceRangeText,
    status: f.status,
    page: f.evidence.page,
  }));

  const explanations: Record<string, { factual: string; context?: string }> = {};
  for (const f of findings) {
    explanations[f.id] = {
      factual: explainFindingStatus(f),
    };
  }

  // Key findings: sentences for flagged items
  const keyFindings: { findingId: string; sentence: string }[] = flaggedRows.map((row) => {
    const unitPart = row.unit ? ` ${row.unit}` : "";
    const rangePart = row.referenceRangeText ? ` (ref: ${row.referenceRangeText})` : "";
    return {
      findingId: row.findingId,
      sentence: `${row.testName} was measured at ${row.valueText}${unitPart}${rangePart}, which is ${row.status.toLowerCase()} relative to the lab's printed range.`,
    };
  });

  // Clinician discussion questions
  const questions: { text: string; findingIds: string[]; source: "AI" | "TEMPLATE" }[] = [];
  if (flaggedRows.length > 0) {
    questions.push({
      text: "Are these out-of-range findings expected based on my medical history or current symptoms?",
      findingIds: flaggedRows.map((r) => r.findingId),
      source: "TEMPLATE",
    });
    questions.push({
      text: "Do you recommend repeating any of these tests or scheduling follow-up diagnostic work?",
      findingIds: flaggedRows.map((r) => r.findingId),
      source: "TEMPLATE",
    });
  } else {
    questions.push({
      text: "All verified parameters fall within the printed normal reference intervals. Are any routine follow-up screenings recommended?",
      findingIds: [],
      source: "TEMPLATE",
    });
  }

  // Overview paragraph
  const overviewText =
    flaggedRows.length > 0
      ? `This report contains ${findings.length} evidence-locked findings. ${flaggedRows.length} parameter(s) were measured outside the laboratory's printed reference intervals.`
      : `This report contains ${findings.length} evidence-locked findings, all within their respective printed reference intervals.`;

  // Critical banner check: if any finding has "Critical" or "Panic" in labFlag
  const criticalBanner = findings.some(
    (f) =>
      f.labFlag &&
      (f.labFlag.toLowerCase().includes("critical") ||
        f.labFlag.toLowerCase().includes("panic") ||
        f.labFlag === "HH" ||
        f.labFlag === "LL"),
  );

  return {
    briefVersion: 1,
    generatedAt: new Date().toISOString(),
    overview: {
      text: overviewText,
      source: "TEMPLATE",
      counts: {
        rows: stats.raw,
        verified: stats.verified,
        flagged: stats.flagged,
        unverified: stats.unverified,
        excluded: stats.excluded,
        pages: stats.pages,
      },
    },
    keyFindings,
    flagged: flaggedRows,
    allRows,
    explanations,
    questions,
    reportNotes,
    couldNotVerify: unverified.map((u) => ({
      testName: u.testName,
      reason: u.reason,
    })),
    criticalBanner,
    disclaimer: CLINICAL_DISCLAIMER,
  };
}
