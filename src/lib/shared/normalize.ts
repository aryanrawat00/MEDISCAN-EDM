/**
 * src/lib/shared/normalize.ts
 * T06: Shared normalization with character index mapping.
 * Handles Unicode NFKC, dash variants, whitespace collapsing, and case folding.
 * Provides round-trip mapping from normalized character positions back to original source offsets.
 */

// Dash variants: U+2010 through U+2015 and minus U+2212
const DASH_REGEX = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g;

// Spaces: standard whitespace, NBSP, thin spaces, mathematical spaces, etc.
const SPACE_REGEX = /[\s\u00A0\u2000-\u200B\u202F\u205F\u3000]+/g;

export interface NormalizedText {
  normalized: string;
  indexMap: number[]; // maps each char in normalized to char offset in original
}

/**
 * Normalizes a string while maintaining an index map back to original characters.
 */
export function normalizeWithMap(text: string): NormalizedText {
  if (!text) {
    return { normalized: "", indexMap: [] };
  }

  // 1. Normalize unicode NFKC first
  const nfkc = text.normalize("NFKC");

  const normalizedChars: string[] = [];
  const indexMap: number[] = [];

  let inWhitespace = false;
  let hasContentStarted = false;

  for (let i = 0; i < nfkc.length; i++) {
    let char = nfkc[i];

    // Replace dash variants
    if (DASH_REGEX.test(char)) {
      char = "-";
      DASH_REGEX.lastIndex = 0;
    }

    // Check for whitespace (including tabs, newlines, NBSP)
    const isSpace = /\s/.test(char) || SPACE_REGEX.test(char);
    SPACE_REGEX.lastIndex = 0;

    if (isSpace) {
      if (hasContentStarted && !inWhitespace) {
        normalizedChars.push(" ");
        indexMap.push(i);
        inWhitespace = true;
      }
    } else {
      hasContentStarted = true;
      inWhitespace = false;
      normalizedChars.push(char.toLowerCase());
      indexMap.push(i);
    }
  }

  // Trim trailing space if any
  if (normalizedChars.length > 0 && normalizedChars[normalizedChars.length - 1] === " ") {
    normalizedChars.pop();
    indexMap.pop();
  }

  return {
    normalized: normalizedChars.join(""),
    indexMap,
  };
}

/**
 * Fast normalization for short strings (quotes, test names, keys) without index mapping.
 */
export function normalizeString(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFKC")
    .replace(DASH_REGEX, "-")
    .replace(SPACE_REGEX, " ")
    .toLowerCase()
    .trim();
}

/**
 * Maps a match range [start, end) in normalized text back to original source offsets.
 */
export function mapSpanToOriginal(
  indexMap: number[],
  normStart: number,
  normEnd: number,
  origTextLength: number,
): { start: number; end: number } {
  if (indexMap.length === 0 || normStart >= indexMap.length) {
    return { start: 0, end: 0 };
  }

  const start = indexMap[normStart];
  const lastIndex = Math.min(normEnd - 1, indexMap.length - 1);
  const end = Math.min(indexMap[lastIndex] + 1, origTextLength);

  return { start, end };
}
