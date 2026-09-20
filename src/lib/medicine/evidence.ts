/**
 * src/lib/medicine/evidence.ts
 * M03: Pure evidence verifier for packaging text (Blueprint §10).
 * Verifies that any active ingredient or claim made by AI is backed by verbatim
 * transcribed text on the package, preventing hallucinations and false claims.
 */

import { normalizeString } from "../shared/normalize";
import { canonicalizeIngredientName, parseStrength } from "./ingredients";
import { IngredientEvidenceCheck } from "./types";

export interface VerifyMedicineEvidenceInput {
  transcribedText: string;
  name: string;
  strength: string | null;
  evidenceQuote: string;
}

export interface VerifyMedicineEvidenceOutput {
  verified: boolean;
  checks: IngredientEvidenceCheck;
  span: { start: number; end: number } | null;
}

export function verifyMedicineEvidence(
  input: VerifyMedicineEvidenceInput,
): VerifyMedicineEvidenceOutput {
  const normTranscribed = normalizeString(input.transcribedText || "");
  const normQuote = normalizeString(input.evidenceQuote || "");
  const normName = normalizeString(input.name || "");
  const canonicalName = canonicalizeIngredientName(normName);

  // 1. Quote check: does the quote exist verbatim in the transcribed package text?
  const quoteIdx = normTranscribed.toLowerCase().indexOf(normQuote.toLowerCase());
  const quoteFound = normQuote.length > 0 && quoteIdx !== -1;

  const span =
    quoteFound && quoteIdx !== -1
      ? { start: quoteIdx, end: quoteIdx + normQuote.length }
      : null;

  // 2. Name in quote check: does the ingredient name or canonical root appear in the quote?
  const quoteLower = normQuote.toLowerCase();
  const nameInQuote =
    Boolean(canonicalName && quoteLower.includes(canonicalName)) ||
    Boolean(normName && quoteLower.includes(normName.toLowerCase()));

  // 3. Strength in quote check: if strength is specified, does its numeric component appear?
  let strengthInQuote = true;
  if (input.strength) {
    const parsed = parseStrength(input.strength);
    if (parsed) {
      // Check for numeric token (e.g. "500")
      const numStr = String(parsed.amount);
      strengthInQuote = quoteLower.includes(numStr);
    } else {
      const normStrength = normalizeString(input.strength).toLowerCase();
      strengthInQuote = quoteLower.includes(normStrength);
    }
  }

  // 4. Verification rule: quote must be in transcribed text, name must be in quote, strength must be in quote
  const verified = quoteFound && nameInQuote && strengthInQuote;

  return {
    verified,
    checks: {
      quoteFound,
      nameInQuote,
      strengthInQuote,
    },
    span,
  };
}
