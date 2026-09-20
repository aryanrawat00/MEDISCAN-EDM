/**
 * src/lib/report/evidence.ts
 * T08: Evidence Verification Engine (Blueprint §9.4).
 * Enforces that every extracted lab finding is anchored to a verbatim quote inside the submitted report.
 * Checks quote presence, test name inclusion, standalone value token outside range span, and range inclusion.
 */

import { FindingEvidence } from "./types";
import { normalizeString, normalizeWithMap, mapSpanToOriginal } from "../shared/normalize";

export interface VerifyEvidenceInput {
  sourceText: string;
  testName: string;
  valueText: string;
  unit: string | null;
  referenceRangeText: string | null;
  evidenceQuote: string;
}

/**
 * Derives the page number from [[Page n]] markers before the given character index.
 */
export function derivePageNumber(sourceText: string, charOffset: number): number | null {
  const textBefore = sourceText.slice(0, Math.max(0, charOffset));
  const matches = [...textBefore.matchAll(/\[\[Page\s+(\d+)\]\]/gi)];
  if (matches.length === 0) {
    return null;
  }
  const lastMatch = matches[matches.length - 1];
  const p = parseInt(lastMatch[1], 10);
  return isNaN(p) ? null : p;
}

/**
 * Verifies that a value appears as a standalone token outside the reference range span in the quote.
 */
function isStandaloneValueOutsideRange(
  normQuote: string,
  normValue: string,
  normRange: string | null,
): boolean {
  if (!normQuote || !normValue) return false;

  // Find where the reference range is inside the quote (if present)
  let rangeStart = -1;
  let rangeEnd = -1;
  if (normRange && normRange.trim()) {
    rangeStart = normQuote.indexOf(normRange);
    if (rangeStart !== -1) {
      rangeEnd = rangeStart + normRange.length;
    }
  }

  // Look for all occurrences of normValue in normQuote
  let searchPos = 0;
  while (searchPos < normQuote.length) {
    const idx = normQuote.indexOf(normValue, searchPos);
    if (idx === -1) break;

    const endIdx = idx + normValue.length;

    // Check boundary before: must not be preceded by digit, dot, or comma
    const charBefore = idx > 0 ? normQuote[idx - 1] : " ";
    const validBefore = !/[0-9.,]/.test(charBefore);

    // Check boundary after: must not be followed by digit, or dot/comma followed by digit
    const charAfter = endIdx < normQuote.length ? normQuote[endIdx] : " ";
    let validAfter = !/[0-9]/.test(charAfter);
    if (validAfter && (charAfter === "." || charAfter === ",")) {
      const charAfterDot = endIdx + 1 < normQuote.length ? normQuote[endIdx + 1] : " ";
      if (/[0-9]/.test(charAfterDot)) {
        validAfter = false;
      }
    }

    // Check if outside reference range span
    const isInsideRange =
      rangeStart !== -1 && idx >= rangeStart && endIdx <= rangeEnd;

    if (validBefore && validAfter && !isInsideRange) {
      return true;
    }

    searchPos = idx + 1;
  }

  return false;
}

/**
 * Authoritative evidence verification function.
 */
export function verifyEvidence(input: {
  sourceText: string;
  testName: string;
  valueText: string;
  unit: string | null;
  referenceRangeText: string | null;
  evidenceQuote: string;
}): FindingEvidence {
  const { sourceText, testName, valueText, unit, referenceRangeText, evidenceQuote } = input;

  // Normalize source and quote
  const { normalized: normSource, indexMap } = normalizeWithMap(sourceText);
  const normQuote = normalizeString(evidenceQuote);
  const normName = normalizeString(testName);
  const normValue = normalizeString(valueText);
  const normRange = referenceRangeText ? normalizeString(referenceRangeText) : null;

  // 1. Quote search
  let quoteFound = false;
  let span: { start: number; end: number } | null = null;
  let page: number | null = null;

  if (normQuote && normSource) {
    const quoteIdx = normSource.indexOf(normQuote);
    if (quoteIdx !== -1) {
      quoteFound = true;
      span = mapSpanToOriginal(
        indexMap,
        quoteIdx,
        quoteIdx + normQuote.length,
        sourceText.length,
      );
      page = derivePageNumber(sourceText, span.start);
    }
  }

  // 2. Name check
  const nameInQuote = quoteFound && normName ? normQuote.includes(normName) : false;

  // 3. Value check: standalone token outside range span
  const valueInQuote = quoteFound && normValue
    ? isStandaloneValueOutsideRange(normQuote, normValue, normRange)
    : false;

  // 4. Range check
  let rangeInQuote = true;
  if (normRange && normRange.trim()) {
    rangeInQuote = quoteFound ? normQuote.includes(normRange) : false;
  }

  // 5. Unit check (informational)
  let unitInQuote: boolean | null = null;
  if (unit && unit.trim()) {
    const normUnit = normalizeString(unit);
    unitInQuote = quoteFound ? normQuote.includes(normUnit) : false;
  }

  const verified = quoteFound && nameInQuote && valueInQuote;
  const rangeVerified = verified && rangeInQuote;

  return {
    quote: evidenceQuote,
    span,
    page,
    level: "SOURCE_TEXT",
    checks: {
      quoteFound,
      nameInQuote,
      valueInQuote,
      rangeInQuote,
      unitInQuote,
    },
    verified,
    rangeVerified,
  };
}
