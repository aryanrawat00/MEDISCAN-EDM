/**
 * src/lib/medicine/types.ts
 * M02: Contracts and types for Medicine Lens (Blueprint §10).
 * "Evidence first. AI second. Code decides."
 */

import { MedicineReferenceEntry } from "./reference.data";

export type IdentificationStatus =
  | "IDENTIFIED"
  | "AMBIGUOUS"
  | "UNVERIFIED_INGREDIENTS"
  | "UNIDENTIFIED"
  | "UNREADABLE";

export interface RawIngredientCandidate {
  name: string;
  strength: string | null;
  evidenceQuote: string;
}

export interface RawMedicineExtraction {
  transcribedText: string;
  candidateBrand: string | null;
  dosageForm: string | null;
  activeIngredients: RawIngredientCandidate[];
  warningsExtracted: string[];
  packagingNotes: string[];
}

export interface IngredientEvidenceCheck {
  quoteFound: boolean;
  nameInQuote: boolean;
  strengthInQuote: boolean;
}

export interface VerifiedIngredient {
  id: string;
  name: string;
  strength: string | null;
  rawText: string;
  evidenceQuote: string;
  verified: boolean;
  checks: IngredientEvidenceCheck;
  monographKey: string | null;
  matchedMonograph: MedicineReferenceEntry | null;
}

export interface PackagingEvidenceItem {
  field: string;
  quote: string;
  verified: boolean;
}

export interface MedicineScanMeta {
  scanMs: number;
  model: string;
  imageFileName?: string;
  imageSizeKb?: number;
}

export interface MedicineScanV3 {
  schemaVersion: 3;
  engineVersion: "1.0.0";
  status: IdentificationStatus;
  statusReason: string;
  brandName: string | null;
  dosageForm: string | null;
  transcribedText: string;
  verifiedIngredients: VerifiedIngredient[];
  monographs: MedicineReferenceEntry[];
  packagingEvidence: PackagingEvidenceItem[];
  safetyWarnings: string[];
  disclaimer: string;
  meta: MedicineScanMeta;
}
