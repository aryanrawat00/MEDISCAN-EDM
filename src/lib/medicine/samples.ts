/**
 * src/lib/medicine/samples.ts
 * M08: Synthetic Medicine Packaging Samples for 100% Offline Demo & Testing (Blueprint §10).
 */

import { RawMedicineExtraction, MedicineScanV3, IdentificationStatus } from "./types";
import { identifyMedicine } from "./identify";

export interface MedicineSample {
  id: string;
  title: string;
  description: string;
  category: string;
  rawExtraction: RawMedicineExtraction;
  expectedStatus: IdentificationStatus;
  precomputedScan: MedicineScanV3;
}

export const MEDICINE_SAMPLES: MedicineSample[] = [
  {
    id: "tylenol-500",
    title: "Tylenol Extra Strength (Acetaminophen 500 mg)",
    description: "Standard OTC analgesic caplet packaging with explicit liver warnings.",
    category: "Pain Reliever / Fever Reducer",
    expectedStatus: "IDENTIFIED",
    rawExtraction: {
      transcribedText: `TYLENOL EXTRA STRENGTH
Acetaminophen 500 mg each caplet
Pain Reliever / Fever Reducer
Contains Acetaminophen 500 mg
Liver warning: This product contains acetaminophen. Severe liver damage may occur if you take more than 4,000 mg in 24 hours.
Directions: Do not take more than directed. Adults and children 12 years and over: take 2 caplets every 6 hours while symptoms last.`,
      candidateBrand: "Tylenol",
      dosageForm: "Caplet",
      activeIngredients: [
        {
          name: "Acetaminophen",
          strength: "500 mg",
          evidenceQuote: "Acetaminophen 500 mg each caplet",
        },
      ],
      warningsExtracted: [
        "Liver warning: This product contains acetaminophen. Severe liver damage may occur if you take more than 4,000 mg in 24 hours.",
      ],
      packagingNotes: ["500 mg Extra Strength", "Contains Acetaminophen"],
    },
    precomputedScan: identifyMedicine(
      {
        transcribedText: `TYLENOL EXTRA STRENGTH
Acetaminophen 500 mg each caplet
Pain Reliever / Fever Reducer
Contains Acetaminophen 500 mg
Liver warning: This product contains acetaminophen. Severe liver damage may occur if you take more than 4,000 mg in 24 hours.
Directions: Do not take more than directed. Adults and children 12 years and over: take 2 caplets every 6 hours while symptoms last.`,
        candidateBrand: "Tylenol",
        dosageForm: "Caplet",
        activeIngredients: [
          {
            name: "Acetaminophen",
            strength: "500 mg",
            evidenceQuote: "Acetaminophen 500 mg each caplet",
          },
        ],
        warningsExtracted: [],
        packagingNotes: [],
      },
      { scanMs: 35, model: "offline-verified" },
    ),
  },
  {
    id: "advil-200",
    title: "Advil Liqui-Gels (Ibuprofen 200 mg)",
    description: "Common NSAID packaging with stomach bleeding and cardiovascular warnings.",
    category: "NSAID",
    expectedStatus: "IDENTIFIED",
    rawExtraction: {
      transcribedText: `ADVIL LIQUI-GELS
Solubilized Ibuprofen Capsules, 200 mg
Pain Reliever / Fever Reducer (NSAID)
Active ingredient (in each capsule): Solubilized ibuprofen equal to 200 mg ibuprofen (NSAID)
Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding.
Uses: temporarily relieves minor aches and pains due to headache, toothache, backache, menstrual cramps.`,
      candidateBrand: "Advil",
      dosageForm: "Capsule",
      activeIngredients: [
        {
          name: "Ibuprofen",
          strength: "200 mg",
          evidenceQuote: "Solubilized ibuprofen equal to 200 mg ibuprofen (NSAID)",
        },
      ],
      warningsExtracted: [
        "Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding.",
      ],
      packagingNotes: ["Liqui-Gels", "Solubilized Ibuprofen 200 mg"],
    },
    precomputedScan: identifyMedicine(
      {
        transcribedText: `ADVIL LIQUI-GELS
Solubilized Ibuprofen Capsules, 200 mg
Pain Reliever / Fever Reducer (NSAID)
Active ingredient (in each capsule): Solubilized ibuprofen equal to 200 mg ibuprofen (NSAID)
Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding.
Uses: temporarily relieves minor aches and pains due to headache, toothache, backache, menstrual cramps.`,
        candidateBrand: "Advil",
        dosageForm: "Capsule",
        activeIngredients: [
          {
            name: "Ibuprofen",
            strength: "200 mg",
            evidenceQuote: "Solubilized ibuprofen equal to 200 mg ibuprofen (NSAID)",
          },
        ],
        warningsExtracted: [],
        packagingNotes: [],
      },
      { scanMs: 42, model: "offline-verified" },
    ),
  },
  {
    id: "zyrtec-10",
    title: "Zyrtec Allergy (Cetirizine HCl 10 mg)",
    description: "Second-generation antihistamine for upper respiratory allergies.",
    category: "Antihistamine",
    expectedStatus: "IDENTIFIED",
    rawExtraction: {
      transcribedText: `ZYRTEC 24 HOUR ALLERGY
Cetirizine Hydrochloride Tablets 10 mg / Antihistamine
Original Prescription Strength
Active ingredient (in each tablet): Cetirizine HCl 10 mg (antihistamine)
Uses: temporarily relieves symptoms due to hay fever: runny nose, sneezing, itchy, watery eyes, itching of the nose or throat.
Warnings: Drowsiness warning. Alcohol, sedatives, and tranquilizers may increase drowsiness.`,
      candidateBrand: "Zyrtec",
      dosageForm: "Tablet",
      activeIngredients: [
        {
          name: "Cetirizine Hydrochloride",
          strength: "10 mg",
          evidenceQuote: "Active ingredient (in each tablet): Cetirizine HCl 10 mg (antihistamine)",
        },
      ],
      warningsExtracted: ["Drowsiness warning."],
      packagingNotes: ["24 Hour Relief", "10 mg"],
    },
    precomputedScan: identifyMedicine(
      {
        transcribedText: `ZYRTEC 24 HOUR ALLERGY
Cetirizine Hydrochloride Tablets 10 mg / Antihistamine
Original Prescription Strength
Active ingredient (in each tablet): Cetirizine HCl 10 mg (antihistamine)
Uses: temporarily relieves symptoms due to hay fever: runny nose, sneezing, itchy, watery eyes, itching of the nose or throat.
Warnings: Drowsiness warning. Alcohol, sedatives, and tranquilizers may increase drowsiness.`,
        candidateBrand: "Zyrtec",
        dosageForm: "Tablet",
        activeIngredients: [
          {
            name: "Cetirizine Hydrochloride",
            strength: "10 mg",
            evidenceQuote: "Active ingredient (in each tablet): Cetirizine HCl 10 mg (antihistamine)",
          },
        ],
        warningsExtracted: [],
        packagingNotes: [],
      },
      { scanMs: 38, model: "offline-verified" },
    ),
  },
];
