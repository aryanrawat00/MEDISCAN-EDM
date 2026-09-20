/**
 * tests/medicine/engine.test.ts
 * Unit tests for Medicine Lens deterministic engine (M03).
 * Tests parsing, quote evidence verification, monograph lookup, and identification logic.
 */

import { describe, it, expect } from "vitest";
import { parseStrength, canonicalizeIngredientName, parseIngredient } from "@/lib/medicine/ingredients";
import { verifyMedicineEvidence } from "@/lib/medicine/evidence";
import { findReferenceMonograph, getReferenceMonographByKey, searchReferenceMonographs } from "@/lib/medicine/reference";
import { identifyMedicine } from "@/lib/medicine/identify";

describe("Medicine Ingredients Parser", () => {
  it("parses numeric strengths with units correctly", () => {
    const s1 = parseStrength("500 mg");
    expect(s1).not.toBeNull();
    expect(s1?.amount).toBe(500);
    expect(s1?.unit).toBe("mg");

    const s2 = parseStrength("12.5 mcg");
    expect(s2?.amount).toBe(12.5);
    expect(s2?.unit).toBe("mcg");

    const s3 = parseStrength("200mg/tablet");
    expect(s3?.amount).toBe(200);
    expect(s3?.unit).toBe("mg");

    expect(parseStrength(null)).toBeNull();
    expect(parseStrength("No strength")).toBeNull();
  });

  it("canonicalizes chemical and salt names", () => {
    expect(canonicalizeIngredientName("Cetirizine Hydrochloride")).toBe("cetirizine");
    expect(canonicalizeIngredientName("Diphenhydramine HCl")).toBe("diphenhydramine");
    expect(canonicalizeIngredientName("Chlorpheniramine Maleate USP")).toBe("chlorpheniramine");
    expect(canonicalizeIngredientName("Ibuprofen Sodium")).toBe("ibuprofen");
  });

  it("parses compound ingredient strings", () => {
    const res = parseIngredient("Paracetamol 650 mg");
    expect(res.normalizedName).toBe("paracetamol");
    expect(res.strength?.amount).toBe(650);
  });
});

describe("Medicine Evidence Verifier", () => {
  const samplePackagingText = `
    TYLENOL EXTRA STRENGTH
    Acetaminophen 500 mg each caplet
    Pain Reliever / Fever Reducer
    Uses: temporarily relieves minor aches and pains
    Warnings: Liver warning - contains acetaminophen.
  `;

  it("verifies verbatim quote and matching ingredient/strength", () => {
    const res = verifyMedicineEvidence({
      transcribedText: samplePackagingText,
      name: "Acetaminophen",
      strength: "500 mg",
      evidenceQuote: "Acetaminophen 500 mg each caplet",
    });

    expect(res.verified).toBe(true);
    expect(res.checks.quoteFound).toBe(true);
    expect(res.checks.nameInQuote).toBe(true);
    expect(res.checks.strengthInQuote).toBe(true);
    expect(res.span).not.toBeNull();
  });

  it("rejects hallucinated quote not found in source text", () => {
    const res = verifyMedicineEvidence({
      transcribedText: samplePackagingText,
      name: "Ibuprofen",
      strength: "200 mg",
      evidenceQuote: "Ibuprofen 200 mg caplet",
    });

    expect(res.verified).toBe(false);
    expect(res.checks.quoteFound).toBe(false);
  });

  it("rejects quote when claimed strength is not in quote", () => {
    const res = verifyMedicineEvidence({
      transcribedText: samplePackagingText,
      name: "Acetaminophen",
      strength: "1000 mg",
      evidenceQuote: "Acetaminophen 500 mg each caplet",
    });

    expect(res.verified).toBe(false);
    expect(res.checks.strengthInQuote).toBe(false);
  });
});

describe("Medicine Reference Monograph Lookup", () => {
  it("finds monographs by active ingredient and brand alias", () => {
    const m1 = findReferenceMonograph("paracetamol");
    expect(m1).not.toBeNull();
    expect(m1?.key).toBe("paracetamol");

    const m2 = findReferenceMonograph("Tylenol");
    expect(m2).not.toBeNull();
    expect(m2?.key).toBe("paracetamol");

    const m3 = findReferenceMonograph("Advil");
    expect(m3?.key).toBe("ibuprofen");

    const m4 = findReferenceMonograph("Zyrtec");
    expect(m4?.key).toBe("cetirizine");
  });

  it("returns null for unknown ingredients", () => {
    expect(findReferenceMonograph("Unobtainium 5000")).toBeNull();
  });

  it("performs multi-term search correctly", () => {
    const res = searchReferenceMonographs("reliever");
    expect(res.length).toBeGreaterThan(0);
  });
});

describe("Medicine Identification Engine", () => {
  it("marks clear packaging with approved ingredient as IDENTIFIED", () => {
    const scan = identifyMedicine(
      {
        transcribedText: "Advil Ibuprofen 200 mg Tablets. Pain Reliever.",
        candidateBrand: "Advil",
        dosageForm: "Tablet",
        activeIngredients: [
          {
            name: "Ibuprofen",
            strength: "200 mg",
            evidenceQuote: "Advil Ibuprofen 200 mg Tablets",
          },
        ],
        warningsExtracted: [],
        packagingNotes: [],
      },
      { scanMs: 50, model: "deterministic-test" },
    );

    expect(scan.status).toBe("IDENTIFIED");
    expect(scan.monographs.length).toBe(1);
    expect(scan.monographs[0].key).toBe("ibuprofen");
    expect(scan.safetyWarnings.length).toBeGreaterThan(0);
  });

  it("flags UNVERIFIED_INGREDIENTS if quote is missing from package text", () => {
    const scan = identifyMedicine(
      {
        transcribedText: "Cough Syrup. 100 mL bottle.",
        candidateBrand: null,
        dosageForm: "Syrup",
        activeIngredients: [
          {
            name: "Dextromethorphan",
            strength: "30 mg",
            evidenceQuote: "Contains Dextromethorphan 30 mg", // Not in transcribedText!
          },
        ],
        warningsExtracted: [],
        packagingNotes: [],
      },
      { scanMs: 40, model: "deterministic-test" },
    );

    expect(scan.status).toBe("UNVERIFIED_INGREDIENTS");
    expect(scan.verifiedIngredients[0].verified).toBe(false);
  });

  it("marks empty or unreadable text as UNREADABLE", () => {
    const scan = identifyMedicine(
      {
        transcribedText: "...",
        candidateBrand: null,
        dosageForm: null,
        activeIngredients: [],
        warningsExtracted: [],
        packagingNotes: [],
      },
      { scanMs: 10, model: "test" },
    );

    expect(scan.status).toBe("UNREADABLE");
  });
});
