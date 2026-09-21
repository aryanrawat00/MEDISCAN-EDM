import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { PresentationMode } from "@/lib/presentation-mode";
import type { VerifiedFinding } from "@/lib/report/types";
import { EvidenceVerificationModal } from "@/components/report/EvidenceVerificationModal";
import { classifyFinding, parseValue, parseRange } from "@/lib/report/engine";
import { deriveRuleAppliedText } from "@/lib/report/verificationId";

const settings = vi.hoisted(() => ({ mode: "plain" as PresentationMode }));
vi.mock("@/lib/presentation-mode", () => ({ usePresentationMode: () => ({ mode: settings.mode, setMode: vi.fn() }) }));
// Portals need a browser document; render their actual dialog contents inline for SSR assertions.
vi.mock("@radix-ui/react-dialog", async importOriginal => ({
  ...await importOriginal<typeof import("@radix-ui/react-dialog")>(),
  Portal: ({ children }: { children: React.ReactNode }) => children,
}));

const escape = (text: string) => renderToStaticMarkup(React.createElement("span", null, text)).slice(6, -7);

describe("Evidence modal presentation", () => {
  for (const mode of ["plain", "technical"] as const) {
    it.each([["92", "70 - 99"], ["60", "70 - 99"], ["110", "70 - 99"], ["92", null]] as const)(`${mode}: preserves evidence and engine output for %s / %s`, (valueText, referenceRangeText) => {
      settings.mode = mode;
      const result = classifyFinding({ valueText, rangeText: referenceRangeText, unit: "mg/dL", valueVerified: true, rangeVerified: true });
      const row: VerifiedFinding = {
        id: "example", testName: "Example", valueText, referenceRangeText, unit: "mg/dL", labFlag: null,
        value: parseValue(valueText), range: parseRange(referenceRangeText), status: result.status, statusReason: result.reason,
        attention: false, labFlagAgreement: "NOT_PROVIDED", ruleTrace: [],
        evidence: { quote: `Example ${valueText} mg/dL ${referenceRangeText ?? ""}`, page: 2, span: null, level: "SOURCE_TEXT", verified: true, rangeVerified: !!referenceRangeText,
          checks: { quoteFound: true, nameInQuote: true, valueInQuote: true, rangeInQuote: !!referenceRangeText, unitInQuote: true } },
      };
      const before = JSON.stringify(row);
      const html = renderToStaticMarkup(React.createElement(EvidenceVerificationModal, { finding: row, isOpen: true, onClose: () => {} }));
      expect(html).toContain("Evidence Verification");
      expect(html).toContain(escape(row.evidence.quote));
      expect(html).toContain("Page 2");
      expect(html).not.toContain("outside range boundaries");
      if (referenceRangeText) expect(html).toContain("bg-emerald-500/30"); // Existing RangeBar appears in both modes.
      if (mode === "plain") {
        expect(html).toContain("The exact words from your report");
        expect(html).not.toContain("Deterministic Verification Audit");
      } else {
        expect(html).toContain("Deterministic Verification Audit");
        const notation = deriveRuleAppliedText(row.statusReason, { valueText, range: referenceRangeText ? { low: 70, high: 99 } : null, referenceRangeText });
        expect(html).toContain(escape(notation));
        expect(html).toContain(referenceRangeText ? escape("The exact value and reference range printed above were both found in your report's text.") : "The value and reference range could not both be confirmed");
      }
      expect(JSON.stringify(row)).toBe(before);
    });
  }
});
