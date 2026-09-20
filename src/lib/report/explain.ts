/**
 * src/lib/report/explain.ts
 * T17: Deterministic Templated Explanations (Blueprint §10, §17).
 * Pure code templates providing factual, neutral explanations for every StatusReason.
 * Operates with zero LLM dependence to ensure reliable offline explanations.
 */

import { StatusReason, VerifiedFinding } from "./types";

export const STATUS_EXPLANATIONS: Record<StatusReason, string> = {
  WITHIN_RANGE:
    "This measured result falls within the reference interval printed on this report by the laboratory.",
  BELOW_LOWER_BOUND:
    "This measured result is lower than the reference interval printed on this report.",
  ABOVE_UPPER_BOUND:
    "This measured result is higher than the reference interval printed on this report.",
  NO_RANGE:
    "No reference interval was printed on this report row. Consult your clinician to interpret its clinical significance.",
  RANGE_UNVERIFIED:
    "The printed reference interval could not be verified verbatim in the submitted report text.",
  EVIDENCE_UNVERIFIED:
    "This finding could not be confirmed against a verbatim quote in the submitted report text.",
  INVALID_VALUE:
    "The value on this row could not be parsed as a valid numeric or qualitative clinical result.",
  NON_NUMERIC_VALUE:
    "A qualitative or descriptive result was reported where a numeric interval was expected.",
  TYPE_MISMATCH:
    "A numeric value was reported alongside an interpretive comment rather than a standard numerical interval.",
  UNPARSEABLE_RANGE:
    "The printed reference range format could not be parsed deterministically.",
  INVALID_RANGE:
    "The printed reference interval bounds appear logically inverted or inconsistent.",
  MULTI_BAND_RANGE:
    "The report provides multiple diagnostic interpretive categories or stages for this test.",
  SEX_SPECIFIC_RANGE:
    "The laboratory printed sex- or age-stratified reference ranges.",
  UNIT_MISMATCH:
    "The measurement unit for the result differs from the unit printed for the reference range.",
  AMBIGUOUS_INTERVAL:
    "The reported result includes an inequality boundary that straddles the reference range limit.",
  QUALITATIVE_MATCH:
    "The qualitative test result matches the laboratory's expected reference finding.",
  QUALITATIVE_DIFFERS_FROM_REFERENCE:
    "The qualitative test result differs from the laboratory's reference finding.",
};

/**
 * Returns the deterministic explanation for a verified finding.
 */
export function explainFindingStatus(finding: Pick<VerifiedFinding, "statusReason" | "testName" | "valueText" | "unit" | "status">): string {
  const base = STATUS_EXPLANATIONS[finding.statusReason] || "Status determined from report reference range.";
  return base;
}
