import { describe, expect, it } from "vitest";
import { getTestEducation, countResults, hasPrintedCriticalFlag, resultMeaning, resultNextStep } from "@/lib/report/education";
import type { VerifiedFinding } from "@/lib/report/types";

function row(overrides: Partial<VerifiedFinding> = {}): VerifiedFinding {
  return {
    id: "x", testName: "Hemoglobin", valueText: "11", unit: "g/dL", referenceRangeText: "12 - 16",
    labFlag: null, value: { kind: "numeric", op: null, n: 11 }, range: { kind: "interval", lo: { n: 12, closed: true }, hi: { n: 16, closed: true } },
    status: "LOW", statusReason: "BELOW_LOWER_BOUND", attention: true, labFlagAgreement: "AGREES", ruleTrace: [],
    evidence: { quote: "Hemoglobin 11 g/dL 12 - 16 L", span: null, page: 1, level: "SOURCE_TEXT", verified: true, rangeVerified: true,
      checks: { quoteFound: true, nameInQuote: true, valueInQuote: true, rangeInQuote: true, unitInQuote: true } },
    ...overrides,
  };
}

describe("patient-friendly report education", () => {
  it("matches common report labels to plain-language explanations", () => {
    expect(getTestEducation("Mean Corpuscular Volume (MCV)")?.purpose).toContain("average size");
    expect(getTestEducation("TSH - Thyroid Stimulating Hormone")?.purpose).toContain("tells your thyroid");
    expect(getTestEducation("unknown test")).toBeNull();
  });
  it("summarizes result groups without changing status", () => {
    const rows = [row(), row({ id: "y", status: "NORMAL", statusReason: "WITHIN_RANGE", attention: false }), row({ id: "z", status: "UNKNOWN", statusReason: "NO_RANGE" })];
    expect(countResults(rows)).toEqual({ within: 1, outside: 1, unclear: 1 });
    expect(resultMeaning(rows[0])).toBe("Your result is below the range printed by your lab.");
    expect(resultNextStep(rows[0])).toContain("Ask your clinician");
  });
  it("shows a critical banner only for a verified printed critical flag", () => {
    expect(hasPrintedCriticalFlag(row({ labFlag: "critical", evidence: { ...row().evidence, quote: "Hemoglobin 11 g/dL 12 - 16 critical" } }))).toBe(true);
    expect(hasPrintedCriticalFlag(row({ labFlag: "critical", evidence: { ...row().evidence, quote: "No critical flag printed" } }))).toBe(false);
    expect(hasPrintedCriticalFlag(row({ labFlag: "critical", evidence: { ...row().evidence, verified: false } }))).toBe(false);
  });
});
