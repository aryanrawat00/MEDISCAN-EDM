/**
 * src/lib/report/lab.ts
 * T21: Verification Lab & Tamper Test Engine (Blueprint §5, §21, D-5).
 * Runs the pure evidence verifier and deterministic engine in-browser with zero requests,
 * demonstrating live evidence locking and tamper detection.
 */

import { Status, StatusReason } from "./types";
import { verifyEvidence } from "./evidence";
import { classifyFinding } from "./engine";

export interface TamperTestResult {
  verified: boolean;
  status: Status;
  reason: StatusReason;
  quoteFound: boolean;
  nameInQuote: boolean;
  valueInQuote: boolean;
  rangeInQuote: boolean;
  ruleTrace: string[];
}

export function runTamperTest(input: {
  sourceText: string;
  testName: string;
  valueText: string;
  unit: string | null;
  referenceRangeText: string | null;
  evidenceQuote: string;
}): TamperTestResult {
  const evidence = verifyEvidence({
    sourceText: input.sourceText,
    testName: input.testName,
    valueText: input.valueText,
    unit: input.unit,
    referenceRangeText: input.referenceRangeText,
    evidenceQuote: input.evidenceQuote,
  });

  const classification = classifyFinding({
    valueText: input.valueText,
    unit: input.unit,
    rangeText: input.referenceRangeText,
    valueVerified: evidence.verified,
    rangeVerified: evidence.rangeVerified,
  });

  return {
    verified: evidence.verified,
    status: classification.status,
    reason: classification.reason,
    quoteFound: evidence.checks.quoteFound,
    nameInQuote: evidence.checks.nameInQuote,
    valueInQuote: evidence.checks.valueInQuote,
    rangeInQuote: evidence.checks.rangeInQuote,
    ruleTrace: classification.trace,
  };
}
