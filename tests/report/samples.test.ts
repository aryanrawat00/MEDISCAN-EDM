import { describe, it, expect } from "vitest";
import { REPORT_SAMPLES } from "@/lib/report/samples";
import { runReportPipeline } from "@/lib/report/pipeline";

describe("T12: Synthetic Report Samples Verification", () => {
  for (const sample of REPORT_SAMPLES) {
    it(`verifies sample '${sample.title}' produces expected deterministic statuses`, () => {
      const result = runReportPipeline({
        sourceText: sample.sourceText,
        rawFindings: sample.cachedRawFindings,
      });

      expect(result.unverified.length).toBe(0);
      expect(result.findings.length).toBe(sample.cachedRawFindings.length);

      for (const finding of result.findings) {
        expect(finding.evidence.verified).toBe(true);
        expect(finding.evidence.rangeVerified).toBe(true);

        const expectedStatus = sample.expectedStatuses[finding.testName];
        expect(finding.status).toBe(expectedStatus);
      }
    });
  }
});
