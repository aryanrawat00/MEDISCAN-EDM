import { describe, it, expect } from "vitest";
import {
  normalizeString,
  normalizeWithMap,
  mapSpanToOriginal,
} from "@/lib/shared/normalize";

describe("T06: shared/normalize.ts", () => {
  it("harmonizes dash variants to ASCII '-'", () => {
    // en dash U+2013, em dash U+2014, minus U+2212
    const input = "12.0\u201315.0 and 10\u201420 and 5\u22122";
    const result = normalizeString(input);
    expect(result).toBe("12.0-15.0 and 10-20 and 5-2");
  });

  it("collapses multiple spaces, tabs, newlines and NBSP", () => {
    const input = "Hemoglobin   \n\t  14.2 \u00A0 g/dL";
    const result = normalizeString(input);
    expect(result).toBe("hemoglobin 14.2 g/dl");
  });

  it("lowercases and applies NFKC unicode normalization", () => {
    const input = "GLUCOSE ＦＡＳＴＩＮＧ (mg/dL)";
    const result = normalizeString(input);
    expect(result).toBe("glucose fasting (mg/dl)");
  });

  it("accurately maps normalized span back to original source offsets", () => {
    const original = "Patient: John Doe\n\nHemoglobin:   14.2  g/dL\nPlatelets: 250k";
    const { normalized, indexMap } = normalizeWithMap(original);

    // Look for "hemoglobin: 14.2 g/dl" in normalized
    const target = "hemoglobin: 14.2 g/dl";
    const normStart = normalized.indexOf(target);
    expect(normStart).toBeGreaterThan(-1);

    const normEnd = normStart + target.length;
    const span = mapSpanToOriginal(indexMap, normStart, normEnd, original.length);

    // The slice from original should match the content, preserving original formatting
    const sliced = original.slice(span.start, span.end);
    expect(sliced).toBe("Hemoglobin:   14.2  g/dL");
  });

  it("handles empty or whitespace-only inputs without crashing", () => {
    expect(normalizeString("")).toBe("");
    expect(normalizeString("   \n\t  ")).toBe("");

    const mapped = normalizeWithMap("");
    expect(mapped.normalized).toBe("");
    expect(mapped.indexMap.length).toBe(0);
  });
});
