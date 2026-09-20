/**
 * src/lib/medicine/reference.ts
 * M01b: Medicine Reference Monograph Registry (Blueprint §10, §12).
 * Provides fast, deterministic lookup against approved openFDA OTC drug labels.
 * Prevents hallucinations by grounding every active ingredient in verified monographs.
 */

import { MEDICINE_REFERENCE_DATA, type MedicineReferenceEntry } from "./reference.data";
import { normalizeString } from "../shared/normalize";

// Pre-computed lowercase index for O(1) alias lookups
const ALIAS_INDEX = new Map<string, MedicineReferenceEntry>();
const KEY_INDEX = new Map<string, MedicineReferenceEntry>();

for (const entry of MEDICINE_REFERENCE_DATA) {
  KEY_INDEX.set(entry.key.toLowerCase(), entry);
  ALIAS_INDEX.set(entry.displayName.toLowerCase(), entry);
  ALIAS_INDEX.set(entry.genericName.toLowerCase(), entry);

  for (const alias of entry.aliases) {
    ALIAS_INDEX.set(alias.toLowerCase(), entry);
  }
}

/**
 * Returns all monographs in the reference dataset
 */
export function getAllReferenceMonographs(): MedicineReferenceEntry[] {
  return MEDICINE_REFERENCE_DATA;
}

/**
 * Lookup by unique key (e.g. 'paracetamol', 'ibuprofen')
 */
export function getReferenceMonographByKey(key: string): MedicineReferenceEntry | null {
  if (!key) return null;
  return KEY_INDEX.get(key.trim().toLowerCase()) ?? null;
}

/**
 * Finds a matching approved monograph by ingredient name, brand alias, or query term
 */
export function findReferenceMonograph(query: string): MedicineReferenceEntry | null {
  if (!query || typeof query !== "string") return null;

  const normalized = normalizeString(query).toLowerCase().trim();
  if (!normalized) return null;

  // 1. Direct index check
  if (ALIAS_INDEX.has(normalized)) {
    return ALIAS_INDEX.get(normalized)!;
  }

  // 2. Tokenized match: check if any alias is contained within the query
  for (const entry of MEDICINE_REFERENCE_DATA) {
    if (normalized.includes(entry.key.toLowerCase())) {
      return entry;
    }
    if (normalized.includes(entry.genericName.toLowerCase())) {
      return entry;
    }
    for (const alias of entry.aliases) {
      if (normalized.includes(alias.toLowerCase()) || alias.toLowerCase().includes(normalized)) {
        return entry;
      }
    }
  }

  return null;
}

/**
 * Multi-result search for auto-complete or candidate list
 */
export function searchReferenceMonographs(query: string): MedicineReferenceEntry[] {
  if (!query) return [];
  const normalized = normalizeString(query).toLowerCase().trim();
  if (!normalized) return [];

  const results: MedicineReferenceEntry[] = [];
  const seenKeys = new Set<string>();

  for (const entry of MEDICINE_REFERENCE_DATA) {
    if (seenKeys.has(entry.key)) continue;

    const matchesKey = entry.key.toLowerCase().includes(normalized);
    const matchesName = entry.displayName.toLowerCase().includes(normalized);
    const matchesGeneric = entry.genericName.toLowerCase().includes(normalized);
    const matchesAlias = entry.aliases.some((a) => a.toLowerCase().includes(normalized));
    const matchesPurpose = entry.purposeText.toLowerCase().includes(normalized);
    const matchesCategory = entry.category.toLowerCase().includes(normalized);

    if (
      matchesKey ||
      matchesName ||
      matchesGeneric ||
      matchesAlias ||
      matchesPurpose ||
      matchesCategory
    ) {
      results.push(entry);
      seenKeys.add(entry.key);
    }
  }

  return results;
}

/**
 * Checks if monograph has passed human clinical review
 */
export function isApprovedMonograph(entry: MedicineReferenceEntry): boolean {
  return entry.review.status === "APPROVED";
}
