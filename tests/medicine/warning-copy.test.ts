import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MEDICINE_REFERENCE_DATA } from "@/lib/medicine/reference.data";
import { getWarningCopy, WARNING_COPY_MAP, WARNING_TEMPLATES } from "@/lib/medicine/warning-copy";
import { MedicineWarning, MonographView } from "@/components/medicine/MonographView";

const escape = (text: string) => renderToStaticMarkup(React.createElement("span", null, text)).slice(6, -7);

describe("Medicine warning templates and exact source preservation", () => {
  for (const medicine of MEDICINE_REFERENCE_DATA) {
    it.each(["plain", "technical"] as const)(`${medicine.key}: preserves every warning in %s mode`, mode => {
      const before = JSON.stringify(medicine);
      for (const original of [...medicine.importantSafety, ...medicine.boxedWarnings ?? []]) {
        const html = renderToStaticMarkup(React.createElement(MedicineWarning, { medicine, original, mode }));
        expect(html).toContain(escape(original));
        expect(html).toContain("Official FDA wording");
        const copy = getWarningCopy(medicine, original);
        if (copy) {
          expect(html).toContain(escape(copy.lead));
          expect(html.indexOf(escape(copy.lead))).toBeLessThan(html.indexOf(escape(original)));
          expect(copy.lead).not.toMatch(/\{ingredient\}|\{condition\}/);
        }
        if (!copy || mode === "technical" || copy.keepOriginalVisible) expect(html).not.toContain("<details");
        else expect(html).toContain("<summary");
      }
      expect(JSON.stringify(medicine)).toBe(before);
    });
  }

  it("every mapping matches an actual snapshot and every supplied category is covered", () => {
    const originals = MEDICINE_REFERENCE_DATA.flatMap(m => [...m.importantSafety, ...m.boxedWarnings ?? []]);
    for (const original of Object.keys(WARNING_COPY_MAP)) expect(originals).toContain(original);
    expect(new Set(Object.values(WARNING_COPY_MAP).map(m => m.category))).toEqual(new Set(Object.keys(WARNING_TEMPLATES)));
  });

  it("does not summarize unknown, changed, unapproved, or unrelated source text", () => {
    const medicine = MEDICINE_REFERENCE_DATA[0];
    const original = medicine.importantSafety[0];
    expect(getWarningCopy(medicine, original + " Updated label.")).toBeNull();
    expect(getWarningCopy({ ...medicine, review: { ...medicine.review, status: "PENDING" } }, original)).toBeNull();
    expect(getWarningCopy(MEDICINE_REFERENCE_DATA[1], original)).toBeNull();
    expect(getWarningCopy(MEDICINE_REFERENCE_DATA[1], MEDICINE_REFERENCE_DATA[1].importantSafety[0])).toBeNull();
  });

  it("uses readable review credit only for approved entries", () => {
    const medicine = MEDICINE_REFERENCE_DATA[0];
    const render = (status: "APPROVED" | "PENDING") => renderToStaticMarkup(React.createElement(MonographView, { monographs: [{ ...medicine, review: { ...medicine.review, status } }] }));
    expect(render("APPROVED")).toContain("Checked against the official FDA label.");
    expect(render("APPROVED")).not.toContain("clinical-pharmacology-reviewer");
    expect(render("PENDING")).not.toContain("Checked against the official FDA label.");
  });
});
