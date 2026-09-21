/**
 * src/lib/medicine/interactions.ts
 * Deterministic Drug-Drug Interaction Evaluation Engine.
 * Evaluates pairs against verified openFDA monograph reference data.
 * Zero LLM calls. Evidence first. Code decides.
 */

import {
  VERIFIED_DRUG_INTERACTIONS,
  DrugInteractionRecord,
  InteractionSeverity,
} from "./interactions.data";
import { findReferenceMonograph, getReferenceMonographByKey } from "./reference";
import { MedicineReferenceEntry } from "./reference.data";
import { normalizeString } from "../shared/normalize";

export const MAX_INTERACTION_MEDICINES = 5;

export const INTERACTION_DISCLAIMER =
  "MediScan Drug Interaction Checker provides educational reference information derived from official U.S. FDA Drug Labeling. It does not provide medical advice, diagnosis, or prescription instructions. Absence of a known interaction in this reference set does not guarantee safety. Always consult a licensed doctor or pharmacist before combining medications.";

export const NOT_FOUND_EXPLANATION =
  "No verified interaction found in the current MediScan reference set.";

export const NOT_FOUND_SAFETY_NOTE =
  "This does not confirm that the combination is safe. Check with a qualified healthcare professional or a pharmacist for personalized advice.";

export interface EvaluatedPairResult {
  pairKey: string;
  medicineA: string;
  medicineB: string;
  medicineADisplay: string;
  medicineBDisplay: string;
  status: "known" | "not_found";
  severity?: InteractionSeverity;
  category?: string;
  description: string;
  whyItMatters: string;
  evidence?: string;
  source?: string;
  safetyNote: string;
}

export interface SelectedMedicineItem {
  key: string;
  displayName: string;
  matched: boolean;
  monographKey?: string;
}

export interface InteractionCheckResult {
  evaluatedAt: string;
  totalMedicines: number;
  totalPairs: number;
  selectedMedicines: SelectedMedicineItem[];
  pairs: EvaluatedPairResult[];
  summary: {
    knownCount: number;
    notFoundCount: number;
    majorCount: number;
    moderateCount: number;
    minorCount: number;
  };
  disclaimer: string;
  error?: string;
}

// Pre-index interactions by sorted pairKey
const INTERACTION_MAP = new Map<string, DrugInteractionRecord>();
for (const record of VERIFIED_DRUG_INTERACTIONS) {
  INTERACTION_MAP.set(record.pairKey.toLowerCase(), record);
}

/**
 * Returns all ground-truth interactions in the reference registry
 */
export function getAllVerifiedInteractions(): DrugInteractionRecord[] {
  return VERIFIED_DRUG_INTERACTIONS;
}

/**
 * Normalizes two medicine keys into a deterministic symmetrical pair key (e.g. "aspirin|ibuprofen")
 */
export function makePairKey(keyA: string, keyB: string): string {
  const normA = keyA.trim().toLowerCase();
  const normB = keyB.trim().toLowerCase();
  return [normA, normB].sort().join("|");
}

/**
 * Normalizes any input medicine string or object into a canonical reference key and display name.
 */
export function normalizeMedicineInput(
  input: string | MedicineReferenceEntry,
): SelectedMedicineItem {
  if (typeof input === "object" && input !== null && "key" in input) {
    return {
      key: input.key.toLowerCase(),
      displayName: input.displayName || input.key,
      matched: true,
      monographKey: input.key,
    };
  }

  const rawStr = String(input ?? "").trim();
  if (!rawStr) {
    return {
      key: "",
      displayName: "Unknown Medicine",
      matched: false,
    };
  }

  // 1. Check exact key match
  const directByKey = getReferenceMonographByKey(rawStr);
  if (directByKey) {
    return {
      key: directByKey.key.toLowerCase(),
      displayName: directByKey.displayName,
      matched: true,
      monographKey: directByKey.key,
    };
  }

  // 2. Monograph alias search
  const found = findReferenceMonograph(rawStr);
  if (found) {
    return {
      key: found.key.toLowerCase(),
      displayName: found.displayName,
      matched: true,
      monographKey: found.key,
    };
  }

  // 3. Normalized fallback for medicines outside current reference snapshot
  const norm = normalizeString(rawStr).toLowerCase();
  return {
    key: norm,
    displayName: rawStr,
    matched: false,
  };
}

/**
 * Evaluates a single medicine pair deterministically.
 * Order of medicines does not matter.
 */
export function evaluateMedicinePair(
  medA: string | MedicineReferenceEntry,
  medB: string | MedicineReferenceEntry,
): EvaluatedPairResult {
  const itemA = normalizeMedicineInput(medA);
  const itemB = normalizeMedicineInput(medB);

  const key = makePairKey(itemA.key, itemB.key);
  const matchedRecord = INTERACTION_MAP.get(key);

  if (matchedRecord) {
    return {
      pairKey: key,
      medicineA: matchedRecord.medicineA,
      medicineB: matchedRecord.medicineB,
      medicineADisplay: matchedRecord.medicineADisplay,
      medicineBDisplay: matchedRecord.medicineBDisplay,
      status: "known",
      severity: matchedRecord.severity,
      category: matchedRecord.category,
      description: matchedRecord.description,
      whyItMatters: matchedRecord.whyItMatters,
      evidence: matchedRecord.evidence,
      source: matchedRecord.source,
      safetyNote:
        matchedRecord.severity === "major"
          ? "Major interaction identified in official FDA labeling. Discuss with your doctor or pharmacist before taking together."
          : "Verified interaction in FDA reference labeling. Cumulative doses or timing should be reviewed with a clinician.",
    };
  }

  return {
    pairKey: key,
    medicineA: itemA.key,
    medicineB: itemB.key,
    medicineADisplay: itemA.displayName,
    medicineBDisplay: itemB.displayName,
    status: "not_found",
    description: NOT_FOUND_EXPLANATION,
    whyItMatters:
      "MediScan currently holds a curated reference set of approved openFDA OTC monographs. Combinations outside this verified registry require clinical confirmation.",
    safetyNote: NOT_FOUND_SAFETY_NOTE,
  };
}

/**
 * Deterministic multi-medicine interaction checker.
 * - Deduplicates medicines
 * - Caps at MAX_INTERACTION_MEDICINES (default: 5)
 * - Evaluates all N*(N-1)/2 unique pairs
 * - Never calls an LLM
 */
export function checkDrugInteractions(
  rawMedicines: (string | MedicineReferenceEntry)[],
): InteractionCheckResult {
  const evaluatedAt = new Date().toISOString();

  // 1. Normalize and deduplicate
  const seenKeys = new Set<string>();
  const selectedMedicines: SelectedMedicineItem[] = [];

  for (const raw of rawMedicines) {
    const item = normalizeMedicineInput(raw);
    if (!item.key) continue;

    if (!seenKeys.has(item.key)) {
      seenKeys.add(item.key);
      selectedMedicines.push(item);
    }
  }

  // Enforce limits
  const trimmedMedicines = selectedMedicines.slice(0, MAX_INTERACTION_MEDICINES);

  // Validation checks
  if (trimmedMedicines.length < 2) {
    return {
      evaluatedAt,
      totalMedicines: trimmedMedicines.length,
      totalPairs: 0,
      selectedMedicines: trimmedMedicines,
      pairs: [],
      summary: {
        knownCount: 0,
        notFoundCount: 0,
        majorCount: 0,
        moderateCount: 0,
        minorCount: 0,
      },
      disclaimer: INTERACTION_DISCLAIMER,
      error:
        trimmedMedicines.length === 0
          ? "Select at least two medicines to check for interactions."
          : "Add at least one more medicine to evaluate drug-drug interactions.",
    };
  }

  // 2. Generate unique pairs: N * (N - 1) / 2
  const pairs: EvaluatedPairResult[] = [];
  let knownCount = 0;
  let notFoundCount = 0;
  let majorCount = 0;
  let moderateCount = 0;
  let minorCount = 0;

  for (let i = 0; i < trimmedMedicines.length; i++) {
    for (let j = i + 1; j < trimmedMedicines.length; j++) {
      const med1 = trimmedMedicines[i];
      const med2 = trimmedMedicines[j];
      const pairResult = evaluateMedicinePair(med1.key, med2.key);

      // Preserve clean user display names in the pair result if available
      pairResult.medicineADisplay = med1.displayName;
      pairResult.medicineBDisplay = med2.displayName;

      pairs.push(pairResult);

      if (pairResult.status === "known") {
        knownCount++;
        if (pairResult.severity === "major") majorCount++;
        else if (pairResult.severity === "moderate") moderateCount++;
        else if (pairResult.severity === "minor") minorCount++;
      } else {
        notFoundCount++;
      }
    }
  }

  return {
    evaluatedAt,
    totalMedicines: trimmedMedicines.length,
    totalPairs: pairs.length,
    selectedMedicines: trimmedMedicines,
    pairs,
    summary: {
      knownCount,
      notFoundCount,
      majorCount,
      moderateCount,
      minorCount,
    },
    disclaimer: INTERACTION_DISCLAIMER,
  };
}
