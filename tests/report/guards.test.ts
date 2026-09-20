import { describe, it, expect } from "vitest";
import { guardAiProse } from "@/lib/shared/guards";

describe("T18: Medical Safety Guards", () => {
  it("passes factual, educational prose", () => {
    const safeText = "Hemoglobin levels reflect oxygen-carrying capacity in the blood.";
    const res = guardAiProse(safeText);
    expect(res.passed).toBe(true);
    expect(res.violations.length).toBe(0);
    expect(res.sanitized).toBe(safeText);
  });

  it("blocks diagnostic claims ('you have diabetes')", () => {
    const dangerous = "Based on your fasting glucose, you have diabetes.";
    const res = guardAiProse(dangerous);
    expect(res.passed).toBe(false);
    expect(res.violations.length).toBeGreaterThan(0);
    expect(res.sanitized).toContain("Clinical note withheld");
  });

  it("blocks prescriptive dosage advice ('take 500 mg tablets')", () => {
    const dangerous = "You should take 500 mg tablets twice daily.";
    const res = guardAiProse(dangerous);
    expect(res.passed).toBe(false);
    expect(res.violations.length).toBeGreaterThan(0);
    expect(res.sanitized).toContain("Clinical note withheld");
  });

  it("blocks instruction to stop medication", () => {
    const dangerous = "Stop taking your medication immediately.";
    const res = guardAiProse(dangerous);
    expect(res.passed).toBe(false);
    expect(res.violations.length).toBeGreaterThan(0);
  });
});
