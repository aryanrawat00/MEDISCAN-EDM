/**
 * src/lib/medicine/identify.ts
 * M03: Deterministic Identification Engine for Medicine Lens (Blueprint §10).
 * Matches verified active ingredients against approved openFDA monographs.
 * "Code decides. AI never invents medical claims or unverified interactions."
 */

import {
  RawMedicineExtraction,
  MedicineScanV3,
  VerifiedIngredient,
  IdentificationStatus,
  PackagingEvidenceItem,
} from "./types";
import { verifyMedicineEvidence } from "./evidence";
import { findReferenceMonograph, isApprovedMonograph } from "./reference";
import { MedicineReferenceEntry } from "./reference.data";

export function identifyMedicine(
  raw: RawMedicineExtraction,
  metaOptions: { scanMs: number; model: string; imageFileName?: string; imageSizeKb?: number },
): MedicineScanV3 {
  const { transcribedText, candidateBrand, dosageForm, activeIngredients, packagingNotes } = raw;

  // 1. Check readability
  if (!transcribedText || transcribedText.trim().length < 10) {
    return {
      schemaVersion: 3,
      engineVersion: "1.0.0",
      status: "UNREADABLE",
      statusReason: "Image text is too blurred, cropped, or obstructed to extract readable packaging information.",
      brandName: candidateBrand ?? null,
      dosageForm: dosageForm ?? null,
      transcribedText: transcribedText || "",
      verifiedIngredients: [],
      monographs: [],
      packagingEvidence: [],
      safetyWarnings: [
        "Please ensure the medicine label is clearly visible under good lighting and retake the photo.",
      ],
      disclaimer: "Informational only. MediScan does not prescribe, diagnose, or substitute for licensed medical advice.",
      meta: {
        scanMs: metaOptions.scanMs,
        model: metaOptions.model,
        imageFileName: metaOptions.imageFileName,
        imageSizeKb: metaOptions.imageSizeKb,
      },
    };
  }

  // 2. Evidence verification on all claimed active ingredients
  const verifiedIngredients: VerifiedIngredient[] = [];
  const packagingEvidence: PackagingEvidenceItem[] = [];
  let unverifiedFound = false;

  activeIngredients.forEach((ing, index) => {
    const evidenceOut = verifyMedicineEvidence({
      transcribedText,
      name: ing.name,
      strength: ing.strength,
      evidenceQuote: ing.evidenceQuote,
    });

    if (!evidenceOut.verified) {
      unverifiedFound = true;
    }

    // Lookup matching monograph
    const matchedMonograph = evidenceOut.verified
      ? findReferenceMonograph(ing.name)
      : null;

    verifiedIngredients.push({
      id: `ing-${index + 1}`,
      name: ing.name,
      strength: ing.strength,
      rawText: `${ing.name} ${ing.strength ?? ""}`.trim(),
      evidenceQuote: ing.evidenceQuote,
      verified: evidenceOut.verified,
      checks: evidenceOut.checks,
      monographKey: matchedMonograph?.key ?? null,
      matchedMonograph,
    });

    packagingEvidence.push({
      field: `Ingredient: ${ing.name}`,
      quote: ing.evidenceQuote,
      verified: evidenceOut.verified,
    });
  });

  // Also check candidate brand against monographs if brand exists
  let brandMonograph: MedicineReferenceEntry | null = null;
  if (candidateBrand) {
    brandMonograph = findReferenceMonograph(candidateBrand);
    if (brandMonograph) {
      packagingEvidence.push({
        field: `Brand: ${candidateBrand}`,
        quote: candidateBrand,
        verified: transcribedText.toLowerCase().includes(candidateBrand.toLowerCase()),
      });
    }
  }

  // Collect unique matched monographs
  const monographMap = new Map<string, MedicineReferenceEntry>();
  for (const vi of verifiedIngredients) {
    if (vi.matchedMonograph && isApprovedMonograph(vi.matchedMonograph)) {
      monographMap.set(vi.matchedMonograph.key, vi.matchedMonograph);
    }
  }
  if (brandMonograph && isApprovedMonograph(brandMonograph)) {
    monographMap.set(brandMonograph.key, brandMonograph);
  }
  const matchedMonographs = Array.from(monographMap.values());

  // Determine IdentificationStatus
  let status: IdentificationStatus;
  let statusReason: string;

  if (unverifiedFound) {
    status = "UNVERIFIED_INGREDIENTS";
    statusReason = "One or more active ingredients claimed by AI could not be verified in verbatim packaging text.";
  } else if (matchedMonographs.length > 0) {
    status = "IDENTIFIED";
    const monoNames = matchedMonographs.map((m) => m.displayName).join(", ");
    statusReason = `Verified ingredients successfully matched against approved monograph: ${monoNames}.`;
  } else if (verifiedIngredients.length > 0 && verifiedIngredients.every((i) => i.verified)) {
    status = "UNIDENTIFIED";
    statusReason = "Active ingredients verified on package, but not found in the approved OTC reference monographs.";
  } else {
    status = "UNIDENTIFIED";
    statusReason = "Could not identify any verified active ingredients or approved OTC monographs from packaging.";
  }

  // Compile safety warnings strictly from approved monographs
  const safetyWarnings: string[] = [];
  for (const mono of matchedMonographs) {
    if (mono.boxedWarnings && mono.boxedWarnings.length > 0) {
      safetyWarnings.push(...mono.boxedWarnings);
    }
    if (mono.importantSafety && mono.importantSafety.length > 0) {
      safetyWarnings.push(...mono.importantSafety);
    }
  }

  if (safetyWarnings.length === 0) {
    safetyWarnings.push(
      "Always check package label for dosing directions, expiration date, and warnings before use.",
      "Consult a licensed physician or pharmacist if you are pregnant, nursing, or taking other medications.",
    );
  }

  return {
    schemaVersion: 3,
    engineVersion: "1.0.0",
    status,
    statusReason,
    brandName: candidateBrand ?? null,
    dosageForm: dosageForm ?? null,
    transcribedText,
    verifiedIngredients,
    monographs: matchedMonographs,
    packagingEvidence,
    safetyWarnings: Array.from(new Set(safetyWarnings)),
    disclaimer:
      "Informational reference only. Grounded in FDA-approved OTC drug labels. MediScan does not prescribe, diagnose, or substitute for professional medical advice.",
    meta: {
      scanMs: metaOptions.scanMs,
      model: metaOptions.model,
      imageFileName: metaOptions.imageFileName,
      imageSizeKb: metaOptions.imageSizeKb,
    },
  };
}
