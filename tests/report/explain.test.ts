import { describe, it, expect } from "vitest";
import { STATUS_EXPLANATIONS, explainFindingStatus } from "@/lib/report/explain";
import { statusReasonSchema } from "@/lib/report/schemas";

describe("T17: Status Explanations Coverage", () => {
  const allReasons = statusReasonSchema.options;

  it("every defined StatusReason has a non-empty explanation template", () => {
    for (const reason of allReasons) {
      const template = STATUS_EXPLANATIONS[reason];
      expect(template).toBeDefined();
      expect(typeof template).toBe("string");
      expect(template.length).toBeGreaterThan(15);
    }
  });

  it("explainFindingStatus formats properly", () => {
    const text = explainFindingStatus({
      status: "LOW",
      statusReason: "BELOW_LOWER_BOUND",
      testName: "Hemoglobin",
      valueText: "11.2",
      unit: "g/dL",
    });
    expect(text).toContain("lower than the reference interval");
  });
});
