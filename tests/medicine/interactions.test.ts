import { describe, it, expect } from "vitest";
import {
  checkDrugInteractions,
  evaluateMedicinePair,
  makePairKey,
  normalizeMedicineInput,
  MAX_INTERACTION_MEDICINES,
  NOT_FOUND_EXPLANATION,
  NOT_FOUND_SAFETY_NOTE,
} from "../../src/lib/medicine/interactions";
import { MEDICINE_REFERENCE_DATA } from "../../src/lib/medicine/reference.data";

describe("Deterministic Drug Interaction Engine", () => {
  it("generates symmetrical pair keys regardless of order", () => {
    expect(makePairKey("aspirin", "ibuprofen")).toBe("aspirin|ibuprofen");
    expect(makePairKey("ibuprofen", "aspirin")).toBe("aspirin|ibuprofen");
    expect(makePairKey("  Paracetamol ", "IBUPROFEN ")).toBe("ibuprofen|paracetamol");
  });

  it("normalizes brand aliases to approved reference monograph keys", () => {
    const tylenol = normalizeMedicineInput("Tylenol");
    expect(tylenol.key).toBe("paracetamol");
    expect(tylenol.matched).toBe(true);

    const advil = normalizeMedicineInput("Advil");
    expect(advil.key).toBe("ibuprofen");
    expect(advil.matched).toBe(true);

    const zyrtec = normalizeMedicineInput("Cetirizine");
    expect(zyrtec.key).toBe("cetirizine");
    expect(zyrtec.matched).toBe(true);
  });

  it("evaluates a known major interaction (Aspirin + Ibuprofen)", () => {
    const result = evaluateMedicinePair("aspirin", "ibuprofen");
    expect(result.status).toBe("known");
    expect(result.severity).toBe("major");
    expect(result.category).toContain("NSAID");
    expect(result.evidence).toContain("FDA Drug Safety Communication");
    expect(result.source).toContain("FDA");
  });

  it("evaluates known interactions symmetrically (Ibuprofen + Aspirin)", () => {
    const forward = evaluateMedicinePair("aspirin", "ibuprofen");
    const reverse = evaluateMedicinePair("ibuprofen", "aspirin");

    expect(forward.status).toBe(reverse.status);
    expect(forward.severity).toBe(reverse.severity);
    expect(forward.category).toBe(reverse.category);
    expect(forward.evidence).toBe(reverse.evidence);
  });

  it("evaluates known moderate interaction (Paracetamol + Ibuprofen)", () => {
    const result = evaluateMedicinePair("paracetamol", "ibuprofen");
    expect(result.status).toBe("known");
    expect(result.severity).toBe("moderate");
    expect(result.category).toContain("Analgesic Combination");
  });

  it("handles unverified / not-found medicine pairs with neutral non-reassurance", () => {
    const result = evaluateMedicinePair("paracetamol", "cetirizine");
    expect(result.status).toBe("not_found");
    expect(result.severity).toBeUndefined();
    expect(result.description).toBe(NOT_FOUND_EXPLANATION);
    expect(result.safetyNote).toBe(NOT_FOUND_SAFETY_NOTE);
    expect(result.description).not.toContain("safe");
  });

  it("deduplicates medicines that map to identical canonical keys", () => {
    // Paracetamol, Tylenol, and Dolo 650 all resolve to key "paracetamol"
    const res = checkDrugInteractions(["Paracetamol", "Tylenol", "Dolo 650", "Ibuprofen"]);
    expect(res.selectedMedicines.length).toBe(2);
    expect(res.totalPairs).toBe(1);
    expect(res.pairs[0].status).toBe("known");
  });

  it("evaluates exactly N*(N-1)/2 unique pairs for multiple medicines", () => {
    // 3 medicines = 3 pairs
    const res3 = checkDrugInteractions(["Aspirin", "Ibuprofen", "Cetirizine"]);
    expect(res3.totalMedicines).toBe(3);
    expect(res3.totalPairs).toBe(3);

    // 4 medicines = 6 pairs
    const res4 = checkDrugInteractions(["Aspirin", "Ibuprofen", "Cetirizine", "Diphenhydramine"]);
    expect(res4.totalMedicines).toBe(4);
    expect(res4.totalPairs).toBe(6);
  });

  it("enforces maximum 5 medicines cap", () => {
    const sixMeds = [
      "Paracetamol",
      "Ibuprofen",
      "Cetirizine",
      "Diphenhydramine",
      "Aspirin",
      "Omeprazole",
    ];
    const res = checkDrugInteractions(sixMeds);
    expect(res.totalMedicines).toBe(MAX_INTERACTION_MEDICINES);
    // 5 medicines = 5 * 4 / 2 = 10 pairs
    expect(res.totalPairs).toBe(10);
  });

  it("handles validation error when fewer than 2 medicines are provided", () => {
    const emptyRes = checkDrugInteractions([]);
    expect(emptyRes.error).toBe("Select at least two medicines to check for interactions.");
    expect(emptyRes.totalPairs).toBe(0);

    const singleRes = checkDrugInteractions(["Paracetamol"]);
    expect(singleRes.error).toBe("Add at least one more medicine to evaluate drug-drug interactions.");
    expect(singleRes.totalPairs).toBe(0);
  });

  it("accepts MedicineReferenceEntry objects directly", () => {
    const [medA, medB] = MEDICINE_REFERENCE_DATA.slice(0, 2); // paracetamol and ibuprofen
    const res = checkDrugInteractions([medA, medB]);
    expect(res.totalMedicines).toBe(2);
    expect(res.pairs.length).toBe(1);
    expect(res.pairs[0].status).toBe("known");
  });

  it("preserves educational disclaimer on every check", () => {
    const res = checkDrugInteractions(["Paracetamol", "Ibuprofen"]);
    expect(res.disclaimer).toContain("MediScan Drug Interaction Checker");
    expect(res.disclaimer).toContain("does not provide medical advice");
  });

  it("handles edge cases: brand aliases, mixed capitalization, and extra whitespace", () => {
    // Tylenol resolves to paracetamol, Advil resolves to ibuprofen
    const res = checkDrugInteractions(["  tYlEnOl  ", "   aDvIL\t "]);
    expect(res.totalMedicines).toBe(2);
    expect(res.totalPairs).toBe(1);
    expect(res.pairs[0].status).toBe("known");
    expect(res.pairs[0].severity).toBe("moderate");
    expect(res.pairs[0].pairKey).toBe("ibuprofen|paracetamol");
  });

  it("handles duplicate brand and generic names across input list", () => {
    // Tylenol, Paracetamol, and Dolo 650 all collapse to 1 medicine
    // Advil and Ibuprofen collapse to 1 medicine
    const res = checkDrugInteractions([
      "Tylenol",
      "Paracetamol",
      "Dolo 650",
      "Advil",
      "Ibuprofen",
      "IBUPROFEN",
    ]);
    expect(res.totalMedicines).toBe(2);
    expect(res.totalPairs).toBe(1);
  });

  it("handles unsupported medicines gracefully without throwing or falsely claiming safety", () => {
    const res = checkDrugInteractions(["Amoxicillin", "Metformin"]);
    expect(res.totalMedicines).toBe(2);
    expect(res.totalPairs).toBe(1);
    expect(res.pairs[0].status).toBe("not_found");
    expect(res.pairs[0].description).toBe(NOT_FOUND_EXPLANATION);
    expect(res.pairs[0].safetyNote).toBe(NOT_FOUND_SAFETY_NOTE);
    expect(res.pairs[0].description).not.toContain("safe");
  });
});

