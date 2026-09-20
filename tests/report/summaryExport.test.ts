import { describe, it, expect } from "vitest";
import {
  generatePlaintextSummary,
} from "../../src/lib/report/summaryExport";
import { DoctorBrief } from "../../src/lib/report/types";

const MOCK_BRIEF: DoctorBrief = {
  briefVersion: 1,
  generatedAt: "2026-09-20T10:00:00.000Z",
  overview: {
    text: "This report contains 14 evidence-locked findings. 2 parameter(s) were measured outside the laboratory's printed reference intervals.",
    source: "TEMPLATE",
    counts: {
      rows: 14,
      verified: 14,
      flagged: 2,
      unverified: 1,
      excluded: 0,
      pages: 1,
    },
  },
  keyFindings: [
    {
      findingId: "f-1",
      sentence: "Hemoglobin was measured at 10.2 g/dL (ref: 13.5 - 17.5), which is low relative to the lab's printed range.",
    },
    {
      findingId: "f-2",
      sentence: "Platelet Count was measured at 90 10^3/uL (ref: 150 - 450), which is low relative to the lab's printed range.",
    },
  ],
  flagged: [
    {
      findingId: "f-1",
      testName: "Hemoglobin",
      valueText: "10.2",
      unit: "g/dL",
      referenceRangeText: "13.5 - 17.5",
      status: "LOW",
      page: 1,
    },
    {
      findingId: "f-2",
      testName: "Platelet Count",
      valueText: "90",
      unit: "10^3/uL",
      referenceRangeText: "150 - 450",
      status: "LOW",
      page: 1,
    },
  ],
  allRows: [],
  explanations: {},
  questions: [
    {
      text: "Are these out-of-range findings expected based on my medical history or current symptoms?",
      findingIds: ["f-1", "f-2"],
      source: "TEMPLATE",
    },
    {
      text: "Do you recommend repeating any of these tests or scheduling follow-up diagnostic work?",
      findingIds: ["f-1", "f-2"],
      source: "TEMPLATE",
    },
  ],
  reportNotes: [],
  couldNotVerify: [
    {
      testName: "Sedimentation Rate",
      reason: "Uncertain OCR confidence",
    },
  ],
  criticalBanner: false,
  disclaimer:
    "This Doctor Visit Brief is an evidence-locked patient summary prepared for educational discussion with your healthcare provider.",
};

describe("Doctor / Patient Summary Export", () => {
  it("generates a structured Doctor Visit Brief with all clinical sections", () => {
    const text = generatePlaintextSummary(MOCK_BRIEF, {
      mode: "doctor",
      reportName: "Comprehensive Blood Count (CBC)",
    });

    expect(text).toContain("MEDISCAN — CLINICAL DOCTOR VISIT BRIEF");
    expect(text).toContain("Report: Comprehensive Blood Count (CBC)");
    expect(text).toContain("Counts: 14 Verified | 2 Flagged | 1 Unverified");
    expect(text).toContain("KEY CLINICAL FINDINGS (OUT-OF-RANGE):");
    expect(text).toContain("Hemoglobin was measured at 10.2 g/dL");
    expect(text).toContain("FLAGGED PARAMETERS SUMMARY TABLE:");
    expect(text).toContain("Hemoglobin");
    expect(text).toContain("10.2 g/dL");
    expect(text).toContain("13.5 - 17.5");
    expect(text).toContain("LOW");
    expect(text).toContain("QUESTIONS TO DISCUSS WITH YOUR CLINICIAN:");
    expect(text).toContain("Are these out-of-range findings expected");
    expect(text).toContain("UNVERIFIED LINES (OMITTED FOR SAFETY):");
    expect(text).toContain("Sedimentation Rate: Uncertain OCR confidence");
    expect(text).toContain("MEDICAL DISCLAIMER & VERIFICATION:");
  });

  it("generates a patient-friendly summary without clinical jargon tables", () => {
    const text = generatePlaintextSummary(MOCK_BRIEF, {
      mode: "patient",
      reportName: "Complete Blood Count",
    });

    expect(text).toContain("MEDISCAN — PATIENT HEALTH VISIT SUMMARY");
    expect(text).toContain("WHAT YOUR REPORT SHOWS:");
    expect(text).toContain("RESULTS OUTSIDE NORMAL LAB RANGES:");
    expect(text).toContain("Hemoglobin was measured at 10.2 g/dL");
    expect(text).toContain("HELPFUL QUESTIONS TO ASK YOUR DOCTOR:");
    expect(text).toContain("IMPORTANT REMINDER:");
    // Should not have the raw monospace tabular formatting in patient mode
    expect(text).not.toContain("FLAGGED PARAMETERS SUMMARY TABLE:");
  });

  it("displays critical notice when criticalBanner is true", () => {
    const criticalBrief: DoctorBrief = {
      ...MOCK_BRIEF,
      criticalBanner: true,
    };
    const text = generatePlaintextSummary(criticalBrief, { mode: "doctor" });
    expect(text).toContain("CRITICAL LABORATORY ALERT NOTICE:");
    expect(text).toContain("critical or panic");
  });

  it("handles empty flagged findings cleanly without crashing", () => {
    const normalBrief: DoctorBrief = {
      ...MOCK_BRIEF,
      keyFindings: [],
      flagged: [],
      couldNotVerify: [],
      overview: {
        ...MOCK_BRIEF.overview,
        text: "All 14 parameters fall within printed normal reference intervals.",
        counts: { ...MOCK_BRIEF.overview.counts, flagged: 0, unverified: 0 },
      },
    };

    const docText = generatePlaintextSummary(normalBrief, { mode: "doctor" });
    expect(docText).toContain("Counts: 14 Verified | 0 Flagged | 0 Unverified");
    expect(docText).not.toContain("FLAGGED PARAMETERS SUMMARY TABLE:");

    const patientText = generatePlaintextSummary(normalBrief, { mode: "patient" });
    expect(patientText).toContain("All verified tests fall within the laboratory's printed normal ranges.");
  });
});
