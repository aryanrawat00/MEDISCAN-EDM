import { describe, it, expect } from "vitest";
import { rawFindingSchema, extractionOutputSchema } from "@/lib/report/schemas";

describe("T05: Report Schemas and Contracts", () => {
  it("validates a standard raw finding from AI extraction", () => {
    const raw = {
      testName: "Hemoglobin",
      valueText: "14.2",
      unit: "g/dL",
      referenceRangeText: "13.0 - 17.0",
      labFlag: null,
      evidenceQuote: "Hemoglobin 14.2 g/dL 13.0 - 17.0",
    };
    const parsed = rawFindingSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.testName).toBe("Hemoglobin");
      expect(parsed.data.valueText).toBe("14.2");
      expect(parsed.data.unit).toBe("g/dL");
      expect(parsed.data.referenceRangeText).toBe("13.0 - 17.0");
    }
  });

  it("handles nulls and optional fields gracefully", () => {
    const raw = {
      testName: "Blood Pressure",
      valueText: "120/80",
      evidenceQuote: "BP: 120/80 mmHg",
    };
    const parsed = rawFindingSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.unit).toBe(null);
      expect(parsed.data.referenceRangeText).toBe(null);
      expect(parsed.data.labFlag).toBe(null);
    }
  });

  it("validates full ExtractionOutput structure", () => {
    const output = {
      patientSexText: "Male",
      findings: [
        {
          testName: "Serum Glucose",
          valueText: "105",
          unit: "mg/dL",
          referenceRangeText: "70 - 99",
          labFlag: "H",
          evidenceQuote: "Serum Glucose: 105 mg/dL (Ref: 70 - 99) H",
        },
      ],
      reportNotes: ["Sample slightly hemolyzed."],
    };
    const parsed = extractionOutputSchema.safeParse(output);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.findings.length).toBe(1);
      expect(parsed.data.reportNotes.length).toBe(1);
    }
  });
});
