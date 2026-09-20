/**
 * src/lib/report/units.ts
 * T07: Deterministic unit comparison and normalization for lab findings (Blueprint §10.6).
 * Handles spelling variants, Greek letters, and common metric representations without
 * ever performing dangerous magnitude conversions (e.g. lakhs vs exact counts).
 */

export function unitKey(unit: string | null | undefined): string {
  if (!unit) return "";

  let key = unit
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "");

  // Micro symbol normalization: Greek small letter mu (U+03BC) and micro sign (U+00B5) -> 'u'
  key = key.replace(/[\u00B5\u03BC]/g, "u");

  // Gram variants: gm/dl -> g/dl
  key = key.replace(/\bgm\//g, "g/").replace(/^gm\//g, "g/");

  // Cubic millimeter variants
  key = key
    .replace(/(?:cu\.mm|cumm|mm\^3|mm³|cmm)/g, "mm3");

  // Slash leading normalization e.g. /ul vs /uL
  return key;
}

/**
 * Checks if value unit and range unit are compatible.
 * Rule: If either unit is omitted, they are assumed compatible.
 * If both are explicitly provided, their canonical keys must match.
 */
export function unitsAreCompatible(
  valueUnit: string | null | undefined,
  rangeUnit: string | null | undefined,
): boolean {
  if (!valueUnit || !rangeUnit) return true;
  const k1 = unitKey(valueUnit);
  const k2 = unitKey(rangeUnit);
  if (!k1 || !k2) return true;
  return k1 === k2;
}
