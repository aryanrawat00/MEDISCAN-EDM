/**
 * src/lib/report/pipeline.ts
 * T09: Report Processing Pipeline (Blueprint §9.5).
 * Orchestrates:
 *   1. Eligibility filtering (R-ELIG: blocks prompt injections and arbitrary text)
 *   2. Evidence verification against source text
 *   3. Deterministic rule classification
 *   4. Deduplication
 *   5. Sequential ID assignment (f1..fn ordered by source position)
 *   6. Lab flag agreement comparison and attention scoring
 *   7. Aggregation of stats and execution trace
 */

import {
  RawFinding,
  VerifiedFinding,
  UnverifiedFinding,
  PipelineResult,
  PipelineStageTrace,
} from "./types";
import { verifyEvidence } from "./evidence";
import { parseValue, parseRange, classifyFinding, compareLabFlag } from "./engine";
import { normalizeString } from "../shared/normalize";

export interface RunPipelineOptions {
  sourceText: string;
  rawFindings: RawFinding[];
  reportNotes?: string[];
  extractionDurationMs?: number;
}

export function runReportPipeline(options: RunPipelineOptions): PipelineResult {
  const startTime = Date.now();
  const { sourceText, rawFindings, reportNotes = [], extractionDurationMs = 0 } = options;

  const trace: PipelineStageTrace[] = [];

  if (extractionDurationMs > 0) {
    trace.push({
      stage: "AI_EXTRACTION",
      executor: "AI",
      ms: extractionDurationMs,
      detail: `Extracted ${rawFindings.length} raw findings`,
    });
  }

  // 1. Eligibility Filtering (R-ELIG)
  const eligStart = Date.now();
  let excludedCount = 0;
  const eligibleFindings: RawFinding[] = [];

  for (const raw of rawFindings) {
    const parsedVal = parseValue(raw.valueText);
    const parsedRange = parseRange(raw.referenceRangeText);

    // Keep if numeric, OR if qualitative/text with a defined reference range
    const isNumeric = parsedVal.kind === "numeric";
    const isQualitativeWithRef =
      parsedVal.kind === "text" && parsedRange.kind === "text";

    if (isNumeric || isQualitativeWithRef) {
      eligibleFindings.push(raw);
    } else {
      // Injected prompt text, instructions, or malformed non-findings dropped here
      excludedCount++;
    }
  }

  trace.push({
    stage: "SCHEMA_VALIDATION",
    executor: "CODE",
    ms: Date.now() - eligStart,
    detail: `Eligible: ${eligibleFindings.length}, Excluded: ${excludedCount}`,
  });

  // 2. Evidence Verification & Rule Classification
  const verifyStart = Date.now();
  const candidateVerified: Array<{
    finding: Omit<VerifiedFinding, "id">;
    spanStart: number;
    dedupeKey: string;
  }> = [];
  const unverifiedList: UnverifiedFinding[] = [];

  for (const raw of eligibleFindings) {
    const evidence = verifyEvidence({
      sourceText,
      testName: raw.testName,
      valueText: raw.valueText,
      unit: raw.unit,
      referenceRangeText: raw.referenceRangeText,
      evidenceQuote: raw.evidenceQuote,
    });

    if (!evidence.verified) {
      let reason: "QUOTE_NOT_FOUND" | "NAME_NOT_IN_QUOTE" | "VALUE_NOT_IN_QUOTE" = "QUOTE_NOT_FOUND";
      if (evidence.checks.quoteFound) {
        if (!evidence.checks.nameInQuote) {
          reason = "NAME_NOT_IN_QUOTE";
        } else if (!evidence.checks.valueInQuote) {
          reason = "VALUE_NOT_IN_QUOTE";
        }
      }
      unverifiedList.push({
        testName: raw.testName,
        valueText: raw.valueText,
        reason,
      });
      continue;
    }

    const classification = classifyFinding({
      valueText: raw.valueText,
      unit: raw.unit,
      rangeText: raw.referenceRangeText,
      valueVerified: evidence.verified,
      rangeVerified: evidence.rangeVerified,
    });

    const parsedVal = parseValue(raw.valueText);
    const parsedRange = parseRange(raw.referenceRangeText);
    const labAgreement = compareLabFlag(raw.labFlag, classification.status);

    // Attention is true if status is abnormal, lab flag disagrees, or qualitative difference
    const attention =
      classification.attention || labAgreement === "DISAGREES";

    const spanStart = evidence.span?.start ?? 0;
    const dedupeKey = `${normalizeString(raw.testName)}|${normalizeString(raw.valueText)}|${normalizeString(raw.referenceRangeText || "")}`;

    candidateVerified.push({
      spanStart,
      dedupeKey,
      finding: {
        testName: raw.testName,
        valueText: raw.valueText,
        unit: raw.unit,
        referenceRangeText: raw.referenceRangeText,
        labFlag: raw.labFlag,
        value: parsedVal,
        range: parsedRange,
        evidence,
        status: classification.status,
        statusReason: classification.reason,
        attention,
        labFlagAgreement: labAgreement,
        ruleTrace: classification.trace,
      },
    });
  }

  trace.push({
    stage: "EVIDENCE_VERIFICATION",
    executor: "CODE",
    ms: Date.now() - verifyStart,
    detail: `Verified: ${candidateVerified.length}, Unverified: ${unverifiedList.length}`,
  });

  // 3. Deduplication and Sequential Ordering
  const ruleStart = Date.now();
  // Sort candidates by source span start
  candidateVerified.sort((a, b) => a.spanStart - b.spanStart);

  const seenKeys = new Set<string>();
  const finalFindings: VerifiedFinding[] = [];

  let idCounter = 1;
  for (const item of candidateVerified) {
    if (seenKeys.has(item.dedupeKey)) {
      // Duplicate row in same position/values
      continue;
    }
    seenKeys.add(item.dedupeKey);

    finalFindings.push({
      ...item.finding,
      id: `f${idCounter++}`,
    });
  }

  trace.push({
    stage: "RULE_ENGINE",
    executor: "CODE",
    ms: Date.now() - ruleStart,
    detail: `Classified ${finalFindings.length} findings`,
  });

  // 4. Verify Report Notes
  const verifiedNotes: { text: string; verified: boolean }[] = reportNotes.map((note) => {
    const normNote = normalizeString(note);
    const normSrc = normalizeString(sourceText);
    const verified = normNote ? normSrc.includes(normNote) : false;
    return { text: note, verified };
  });

  // Derive total pages from source markers
  const pageMatches = [...sourceText.matchAll(/\[\[Page\s+(\d+)\]\]/gi)];
  const maxPage = pageMatches.length > 0
    ? Math.max(...pageMatches.map((m) => parseInt(m[1], 10) || 1))
    : null;

  // Compute Stats
  const flaggedCount = finalFindings.filter((f) => f.attention || f.status === "LOW" || f.status === "HIGH").length;
  const unknownCount = finalFindings.filter((f) => f.status === "UNKNOWN").length;

  return {
    findings: finalFindings,
    unverified: unverifiedList,
    excluded: excludedCount,
    reportNotes: verifiedNotes,
    stats: {
      raw: rawFindings.length,
      verified: finalFindings.length,
      unverified: unverifiedList.length,
      excluded: excludedCount,
      flagged: flaggedCount,
      unknown: unknownCount,
      pages: maxPage,
    },
    trace,
  };
}
