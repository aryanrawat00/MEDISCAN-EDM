/**
 * src/lib/medicine/ingredients.ts
 * M03: Deterministic Ingredient and Strength Parsing (Blueprint §10).
 * Extracts structured names and strengths from packaging text and candidate strings.
 */

import { normalizeString } from "../shared/normalize";

export interface ParsedStrength {
  raw: string;
  amount: number;
  unit: string;
}

export interface ParsedIngredient {
  normalizedName: string;
  strength: ParsedStrength | null;
}

// Regex for common pharmaceutical strengths: e.g. 500 mg, 12.5 mcg, 200mg, 10 mg/5 mL
const STRENGTH_REGEX =
  /([0-9]+(?:\.[0-9]+)?)\s*(mg|mcg|µg|g|ml|iu|%)(?:\s*\/\s*([0-9]+(?:\.[0-9]+)?)?\s*(ml|tablet|caplet|drop)?)?/i;

/**
 * Parses strength string into numeric amount and unit
 */
export function parseStrength(raw: string | null | undefined): ParsedStrength | null {
  if (!raw || typeof raw !== "string") return null;
  const match = STRENGTH_REGEX.exec(raw.trim());
  if (!match) return null;

  const amount = parseFloat(match[1]);
  if (isNaN(amount)) return null;

  const unit = match[2].toLowerCase();
  return {
    raw: match[0],
    amount,
    unit,
  };
}

/**
 * Canonicalizes ingredient name by stripping common pharmaceutical salts
 * e.g. "Cetirizine Hydrochloride" -> "cetirizine"
 * "Diphenhydramine HCl" -> "diphenhydramine"
 * "Chlorpheniramine Maleate" -> "chlorpheniramine"
 */
export function canonicalizeIngredientName(name: string): string {
  if (!name) return "";
  let s = normalizeString(name).toLowerCase();

  // Strip salt modifiers
  s = s
    .replace(/\b(hydrochloride|hcl|maleate|tartrate|sodium|potassium|succinate|fumarate|sulfate|phosphate)\b/gi, "")
    .replace(/\b(usp|bp|ip)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return s;
}

/**
 * Parses ingredient candidate with optional inline strength
 */
export function parseIngredient(text: string): ParsedIngredient {
  const norm = normalizeString(text);
  const strength = parseStrength(norm);
  let name = norm;
  if (strength) {
    name = norm.replace(strength.raw, "");
  }
  return {
    normalizedName: canonicalizeIngredientName(name),
    strength,
  };
}
