import { explainFindingStatus } from "./explain";
import type { VerifiedFinding } from "./types";

export const REPORT_PLAIN_COPY = {
  normal: "{result} sits between the low ({lo}) and high ({hi}) numbers your lab printed, so it's marked Within range.",
  low: "{result} is lower than the low number your lab printed ({lo}), so it's marked Below range.",
  high: "{result} is higher than the high number your lab printed ({hi}), so it's marked Above range.",
  unknown: "MediScan couldn't compare this result to a clear range from your report, so it's shown as unclassified rather than guessed.",
  trust: "This wasn't decided by AI. A fixed rule compared the numbers printed in your own report.",
  fixedRule: "A fixed rule — not AI — produced the status shown above.",
} as const;

/** Select copy from the engine's existing status/reason; never assign a status here. */
export function plainReportExplanation(finding: VerifiedFinding): string {
  if (finding.status === "UNKNOWN") return REPORT_PLAIN_COPY.unknown;
  const { value, range } = finding;
  // The starter wording assumes exact numeric values and inclusive, two-sided bounds.
  // Other supported results retain the engine's existing reviewed explanation.
  if (value.kind !== "numeric" || value.op !== null || range.kind !== "interval" ||
      !range.lo?.closed || !range.hi?.closed) return explainFindingStatus(finding);
  const template = finding.status === "NORMAL" && finding.statusReason === "WITHIN_RANGE"
    ? REPORT_PLAIN_COPY.normal
    : finding.status === "LOW" && finding.statusReason === "BELOW_LOWER_BOUND"
      ? REPORT_PLAIN_COPY.low
      : finding.status === "HIGH" && finding.statusReason === "ABOVE_UPPER_BOUND"
        ? REPORT_PLAIN_COPY.high : null;
  if (!template) return explainFindingStatus(finding);
  return template.replace("{result}", [finding.valueText, finding.unit].filter(Boolean).join(" "))
    .replace("{lo}", String(range.lo.n)).replace("{hi}", String(range.hi.n));
}

export function reportAudit(finding: VerifiedFinding, sourceTextAvailable: boolean) {
  const { evidence } = finding;
  const quoteFound = sourceTextAvailable && evidence.checks.quoteFound;
  const valueAndRangeFound = quoteFound && evidence.verified && evidence.rangeVerified &&
    evidence.checks.valueInQuote && evidence.checks.rangeInQuote;
  return {
    quoteFound,
    valueAndRangeFound,
    trustText: valueAndRangeFound && finding.status !== "UNKNOWN" &&
      finding.value.kind === "numeric" && finding.range.kind === "interval"
      ? REPORT_PLAIN_COPY.trust : REPORT_PLAIN_COPY.fixedRule,
  };
}
