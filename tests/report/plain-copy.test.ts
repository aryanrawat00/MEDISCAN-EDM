import { describe, expect, it } from "vitest";
import { classifyFinding, parseRange, parseValue } from "@/lib/report/engine";
import { plainReportExplanation, reportAudit, REPORT_PLAIN_COPY } from "@/lib/report/plain-copy";
import { explainFindingStatus } from "@/lib/report/explain";
import type { VerifiedFinding } from "@/lib/report/types";

function finding(valueText: string, referenceRangeText: string | null, unit: string | null = "mg/dL"): VerifiedFinding {
  const result = classifyFinding({ valueText, rangeText: referenceRangeText, unit, valueVerified: true, rangeVerified: true });
  return {
    id: "fixture", testName: "Example", valueText, referenceRangeText, unit, labFlag: null,
    value: parseValue(valueText), range: parseRange(referenceRangeText),
    status: result.status, statusReason: result.reason, attention: false, labFlagAgreement: "NOT_PROVIDED", ruleTrace: [],
    evidence: { quote: `Example ${valueText} ${referenceRangeText}`, span: null, page: 1, level: "SOURCE_TEXT", verified: true, rangeVerified: true,
      checks: { quoteFound: true, nameInQuote: true, valueInQuote: true, rangeInQuote: true, unitInQuote: true } },
  };
}

describe("Plain report copy uses existing engine classifications", () => {
  it.each([
    ["92", "NORMAL", "92 mg/dL sits between the low (70) and high (99) numbers your lab printed, so it's marked Within range."],
    ["60", "LOW", "60 mg/dL is lower than the low number your lab printed (70), so it's marked Below range."],
    ["110", "HIGH", "110 mg/dL is higher than the high number your lab printed (99), so it's marked Above range."],
  ])("explains %s without changing %s", (value, status, expected) => {
    const row = finding(value, "70 - 99");
    const before = JSON.stringify(row);
    expect(row.status).toBe(status);
    expect(plainReportExplanation(row)).toBe(expected);
    expect(reportAudit(row, true).valueAndRangeFound).toBe(true);
    expect(reportAudit(row, true).trustText).toBe(REPORT_PLAIN_COPY.trust);
    expect(JSON.stringify(row)).toBe(before);
  });

  it.each([null, "See comments", "20 - 10", "Male: 70-99 Female: 60-90", "3.9-5.5 mmol/L"])("does not guess when range is %s", range => {
    const row = finding("92", range);
    expect(row.status).toBe("UNKNOWN");
    expect(plainReportExplanation(row)).toBe(REPORT_PLAIN_COPY.unknown);
    expect(reportAudit(row, true).trustText).toBe(REPORT_PLAIN_COPY.fixedRule);
  });

  it.each([["200", "<200"], ["40", ">40"], ["180", "<200"], ["<5", "0-10"], ["Negative", "Negative"]])("retains reviewed explanations for %s / %s", (value, range) => {
    const row = finding(value, range, null);
    expect(plainReportExplanation(row)).toBe(explainFindingStatus(row));
    expect(plainReportExplanation(row)).not.toContain("unclassified");
  });

  it.each(["quoteFound", "valueInQuote", "rangeInQuote"] as const)("never claims both were found when %s fails", check => {
    const row = finding("92", "70 - 99");
    row.evidence.checks[check] = false;
    expect(reportAudit(row, true).valueAndRangeFound).toBe(false);
    expect(reportAudit(row, true).trustText).toBe(REPORT_PLAIN_COPY.fixedRule);
  });

  it("gates the audit on source availability and verification", () => {
    const row = finding("92", "70 - 99");
    expect(reportAudit(row, false).quoteFound).toBe(false);
    expect(reportAudit(row, false).valueAndRangeFound).toBe(false);
    row.evidence.rangeVerified = false;
    expect(reportAudit(row, true).valueAndRangeFound).toBe(false);
    row.evidence.rangeVerified = true;
    row.evidence.verified = false;
    expect(reportAudit(row, true).valueAndRangeFound).toBe(false);
  });
});
