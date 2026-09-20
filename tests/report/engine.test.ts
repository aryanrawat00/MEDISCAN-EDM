import { describe, it, expect } from "vitest";
import { parseValue, parseRange, classifyFinding, compareLabFlag } from "@/lib/report/engine";

describe("T07: Deterministic Report Engine (V01 - V62 Vectors)", () => {
  // Test cases table from Blueprint §10.10
  const vectors = [
    { id: "V01", value: "11.2", unit: "g/dL", range: "12.0 - 15.0", status: "LOW", reason: "BELOW_LOWER_BOUND" },
    { id: "V02", value: "14.0", unit: "g/dL", range: "12.0 - 15.0", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V03", value: "16.4", unit: "g/dL", range: "12.0 - 15.0", status: "HIGH", reason: "ABOVE_UPPER_BOUND" },
    { id: "V04", value: "12.0", unit: "g/dL", range: "12.0 - 15.0", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V05", value: "15.0", unit: "g/dL", range: "12.0 - 15.0", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V06", value: "15.01", unit: "g/dL", range: "12.0 - 15.0", status: "HIGH", reason: "ABOVE_UPPER_BOUND" },
    { id: "V07", value: "11.99", unit: "g/dL", range: "12-15", status: "LOW", reason: "BELOW_LOWER_BOUND" },
    { id: "V08", value: "13", unit: "g/dL", range: "12.0 – 15.0", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V09", value: "13", unit: "g/dL", range: "12.0 to 15.0", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V10", value: "13", unit: "g/dL", range: "12.0 - 15.0 g/dL", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V11", value: "13", unit: "g/dL", range: "(12.0 - 15.0)", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V12", value: "13", unit: "g/dL", range: "Reference Range: 12.0 - 15.0", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V13", value: "180", unit: "mg/dL", range: "< 200", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V14", value: "200", unit: "mg/dL", range: "< 200", status: "HIGH", reason: "ABOVE_UPPER_BOUND" },
    { id: "V15", value: "200", unit: "mg/dL", range: "<= 200", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V16", value: "200", unit: "mg/dL", range: "≤ 200", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V17", value: "35", unit: "mg/dL", range: "> 40", status: "LOW", reason: "BELOW_LOWER_BOUND" },
    { id: "V18", value: "40", unit: "mg/dL", range: "> 40", status: "LOW", reason: "BELOW_LOWER_BOUND" },
    { id: "V19", value: "40", unit: "mg/dL", range: ">= 40", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V20", value: "6.1", unit: "%", range: "Up to 5.6", status: "HIGH", reason: "ABOVE_UPPER_BOUND" },
    { id: "V21", value: "5.6", unit: "%", range: "Up to 5.6", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V22", value: "150", unit: "mg/dL", range: "Below 200", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V23", value: "<0.5", unit: "mg/L", range: "0 - 1.0", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V24", value: "<0.5", unit: "uIU/mL", range: "0.4 - 4.0", status: "UNKNOWN", reason: "AMBIGUOUS_INTERVAL" },
    { id: "V25", value: "<0.5", unit: "x", range: "1 - 2", status: "LOW", reason: "BELOW_LOWER_BOUND" },
    { id: "V26", value: ">1000", unit: "x", range: "< 200", status: "HIGH", reason: "ABOVE_UPPER_BOUND" },
    { id: "V27", value: ">1000", unit: "x", range: "0 - 1500", status: "UNKNOWN", reason: "AMBIGUOUS_INTERVAL" },
    { id: "V28", value: "<5", unit: "x", range: "< 10", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V29", value: "<20", unit: "x", range: "< 10", status: "UNKNOWN", reason: "AMBIGUOUS_INTERVAL" },
    { id: "V30", value: "92", unit: "mg/dL", range: "70 - 99 mg/dL", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V31", value: "92", unit: "mg/dL", range: "3.9 - 5.5 mmol/L", status: "UNKNOWN", reason: "UNIT_MISMATCH" },
    { id: "V32", value: "7200", unit: "/cumm", range: "4000 - 10000 /cu.mm", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V33", value: "7200", unit: "/cumm", range: "4000 - 10000 /mm3", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V34", value: "5", unit: "g/dl", range: "3 - 6 g/dL", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V35", value: "2.0", unit: "uIU/mL", range: "0.4 - 4.0 µIU/mL", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V36", value: "11.2", unit: "g/dL", range: null, status: "UNKNOWN", reason: "NO_RANGE" },
    { id: "V37", value: "11.2", unit: "g/dL", range: "   ", status: "UNKNOWN", reason: "NO_RANGE" },
    { id: "V38", value: "11.2", unit: "g/dL", range: "See comments", status: "UNKNOWN", reason: "TYPE_MISMATCH" },
    { id: "V39", value: "", unit: "g/dL", range: "12 - 15", status: "UNKNOWN", reason: "INVALID_VALUE" },
    { id: "V40", value: "abc", unit: "g/dL", range: "12 - 15", status: "UNKNOWN", reason: "NON_NUMERIC_VALUE" },
    { id: "V41", value: "1.2.3", unit: "g/dL", range: "12 - 15", status: "UNKNOWN", reason: "INVALID_VALUE" },
    { id: "V42", value: "NaN", unit: "g/dL", range: "12 - 15", status: "UNKNOWN", reason: "NON_NUMERIC_VALUE" },
    { id: "V43", value: "Infinity", unit: "g/dL", range: "12 - 15", status: "UNKNOWN", reason: "NON_NUMERIC_VALUE" },
    { id: "V44", value: "13", unit: "g/dL", range: "20 - 10", status: "UNKNOWN", reason: "INVALID_RANGE" },
    { id: "V45", value: "1,234", unit: "x", range: "1,000 - 2,000", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V46", value: "1,20,000", unit: "/cumm", range: "1,50,000 - 4,50,000", status: "LOW", reason: "BELOW_LOWER_BOUND" },
    { id: "V47", value: "2.5", unit: "lakhs/cumm", range: "1.5 - 4.5 lakhs/cumm", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V48", value: "250000", unit: "/cumm", range: "1.5 - 4.5 lakhs/cumm", status: "UNKNOWN", reason: "UNIT_MISMATCH" },
    { id: "V49", value: "Negative", unit: null, range: "Negative", status: "NORMAL", reason: "QUALITATIVE_MATCH" },
    { id: "V50", value: "Positive", unit: null, range: "Negative", status: "UNKNOWN", reason: "QUALITATIVE_DIFFERS_FROM_REFERENCE" },
    { id: "V51", value: "Non Reactive", unit: null, range: "Non-Reactive", status: "NORMAL", reason: "QUALITATIVE_MATCH" },
    { id: "V52", value: "Trace", unit: null, range: "Negative", status: "UNKNOWN", reason: "QUALITATIVE_DIFFERS_FROM_REFERENCE" },
    { id: "V53", value: "Negative", unit: null, range: "0 - 5", status: "UNKNOWN", reason: "NON_NUMERIC_VALUE" },
    { id: "V54", value: "13.5", unit: "g/dL", range: "Male: 13.0 - 17.0 Female: 12.0 - 15.0", status: "UNKNOWN", reason: "SEX_SPECIFIC_RANGE" },
    { id: "V55", value: "215", unit: "mg/dL", range: "Desirable: <200 Borderline: 200-239 High: >=240", status: "UNKNOWN", reason: "MULTI_BAND_RANGE" },
    { id: "V56", value: "-2.5", unit: "x", range: "-2 - 2", status: "LOW", reason: "BELOW_LOWER_BOUND" },
    { id: "V57", value: "-1.5", unit: "x", range: "-2 - 2", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V58", value: "13", unit: "g/dL", range: "13.0 - 17.0 (Adult)", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V59", value: "5", unit: "10^3/uL", range: "2 - 10 10^3/uL", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V60", value: "5", unit: "10^3/uL", range: "2 - 10 mg/dL", status: "UNKNOWN", reason: "UNIT_MISMATCH" },
    { id: "V61", value: "92", unit: "mg/dL", range: "70-99", status: "NORMAL", reason: "WITHIN_RANGE" },
    { id: "V62", value: "4.5", unit: "%", range: "4.0 - 5.6 %", status: "NORMAL", reason: "WITHIN_RANGE" },
  ];

  for (const v of vectors) {
    it(`Vector ${v.id}: value '${v.value}', range '${v.range}' -> ${v.status} (${v.reason})`, () => {
      const res = classifyFinding({
        valueText: v.value,
        unit: v.unit === "x" ? null : v.unit,
        rangeText: v.range,
        valueVerified: true,
        rangeVerified: true,
      });
      expect(res.status).toBe(v.status);
      expect(res.reason).toBe(v.reason);
    });
  }

  // Gating tests G1 and G2
  it("G1: Value unverified returns UNKNOWN with EVIDENCE_UNVERIFIED", () => {
    const res = classifyFinding({
      valueText: "14.2",
      unit: "g/dL",
      rangeText: "12.0 - 15.0",
      valueVerified: false,
      rangeVerified: true,
    });
    expect(res.status).toBe("UNKNOWN");
    expect(res.reason).toBe("EVIDENCE_UNVERIFIED");
  });

  it("G2: Range unverified returns UNKNOWN with RANGE_UNVERIFIED", () => {
    const res = classifyFinding({
      valueText: "14.2",
      unit: "g/dL",
      rangeText: "12.0 - 15.0",
      valueVerified: true,
      rangeVerified: false,
    });
    expect(res.status).toBe("UNKNOWN");
    expect(res.reason).toBe("RANGE_UNVERIFIED");
  });

  // Lab flag agreement tests LF01-LF08
  it("LF01: Lab flag H agrees with HIGH status", () => {
    expect(compareLabFlag("H", "HIGH")).toBe("AGREES");
    expect(compareLabFlag("High", "HIGH")).toBe("AGREES");
  });

  it("LF02: Lab flag H disagrees with NORMAL status", () => {
    expect(compareLabFlag("H", "NORMAL")).toBe("DISAGREES");
  });

  it("LF03: Lab flag L agrees with LOW status", () => {
    expect(compareLabFlag("L", "LOW")).toBe("AGREES");
    expect(compareLabFlag("Low", "LOW")).toBe("AGREES");
  });

  it("LF04: Lab flag not provided", () => {
    expect(compareLabFlag(null, "HIGH")).toBe("NOT_PROVIDED");
    expect(compareLabFlag("", "NORMAL")).toBe("NOT_PROVIDED");
  });

  it("LF05: Lab flag on UNKNOWN status is NOT_COMPARABLE", () => {
    expect(compareLabFlag("H", "UNKNOWN")).toBe("NOT_COMPARABLE");
  });
});
