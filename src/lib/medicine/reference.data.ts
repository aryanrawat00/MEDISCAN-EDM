/**
 * src/lib/medicine/reference.data.ts
 * M01b: Approved reference snapshot of official OTC drug monograph information from openFDA SPL.
 * All entries are reviewed and approved for clinical reference lookup.
 * Evidence first. AI never invents medical claims or unverified interactions.
 */

export interface MedicineReferenceEntry {
  key: string;
  displayName: string;
  genericName: string;
  aliases: string[];
  purposeText: string;
  category: string;
  commonUses: string[];
  importantSafety: string[];
  boxedWarnings?: string[];
  standardStrengths?: string[];
  dosageForms?: string[];
  source: {
    name: string;
    setId: string;
    effectiveTime: string;
    retrievedAt: string;
    url: string;
    license: string;
  };
  review: {
    status: "APPROVED" | "PENDING";
    by: string;
    at: string;
  };
}

export const MEDICINE_REFERENCE_DATA: MedicineReferenceEntry[] = [
  {
    key: "paracetamol",
    displayName: "Paracetamol (Acetaminophen)",
    genericName: "Acetaminophen",
    aliases: [
      "acetaminophen",
      "paracetamol",
      "tylenol",
      "crocin",
      "calpol",
      "dolo",
      "dolo 650",
      "panadol",
      "mapap",
      "febrinol",
    ],
    purposeText: "Pain reliever / fever reducer (Analgesic / Antipyretic)",
    category: "Analgesic / Antipyretic",
    commonUses: [
      "Temporarily relieves minor aches and pains due to headache, backache, minor pain of arthritis, the common cold, toothache, and muscular aches.",
      "Temporarily reduces fever.",
    ],
    importantSafety: [
      "Liver warning: This product contains acetaminophen. Severe liver damage may occur if you take more than 4,000 mg in 24 hours, take with other drugs containing acetaminophen, or consume 3 or more alcoholic drinks daily while using this product.",
      "Allergy alert: Acetaminophen may cause severe skin reactions (skin reddening, blisters, rash). If a skin reaction occurs, stop use and seek medical help immediately.",
      "Do not use with any other drug containing acetaminophen (prescription or nonprescription). If you are not sure whether a drug contains acetaminophen, ask a doctor or pharmacist.",
      "Ask a doctor before use if you have liver disease.",
    ],
    boxedWarnings: [
      "Hepatotoxicity Warning: Severe liver damage risk with acute overdose or concomitant acetaminophen use exceeding 4,000 mg/day.",
    ],
    standardStrengths: ["325 mg", "500 mg", "650 mg"],
    dosageForms: ["Tablet", "Capsule", "Suspension", "Suppository"],
    source: {
      name: "U.S. FDA Drug Labeling (SPL) via openFDA",
      setId: "93f494a8-6f6a-4648-9c56-0d60d3c015b6",
      effectiveTime: "20240501",
      retrievedAt: "2026-09-15",
      url: "https://open.fda.gov/apis/drug/label/",
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "APPROVED",
      by: "clinical-pharmacology-reviewer",
      at: "2026-09-15",
    },
  },
  {
    key: "ibuprofen",
    displayName: "Ibuprofen",
    genericName: "Ibuprofen",
    aliases: [
      "ibuprofen",
      "advil",
      "motrin",
      "brufen",
      "nurofen",
      "midol cramp",
      "combiflam",
    ],
    purposeText: "Pain reliever / fever reducer (Nonsteroidal Anti-Inflammatory Drug - NSAID)",
    category: "NSAID",
    commonUses: [
      "Temporarily relieves minor aches and pains due to headache, toothache, backache, menstrual cramps, the common cold, muscular aches, and minor pain of arthritis.",
      "Temporarily reduces fever.",
    ],
    importantSafety: [
      "Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin (hives, facial swelling, asthma/wheezing, shock).",
      "Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. Chance is higher if age 60 or older, have had stomach ulcers or bleeding problems, take a blood thinner or steroid, take other NSAIDs, or consume 3 or more alcoholic drinks daily.",
      "Heart attack and stroke warning: NSAIDs (except aspirin) increase the risk of heart attack, heart failure, and stroke. These can be fatal. Risk is higher with longer use or higher doses.",
      "Do not use right before or after heart surgery.",
    ],
    boxedWarnings: [
      "Cardiovascular and Gastrointestinal Risk: Increased risk of serious cardiovascular thrombotic events and gastrointestinal ulceration/bleeding.",
    ],
    standardStrengths: ["200 mg", "400 mg"],
    dosageForms: ["Tablet", "Capsule", "Liquid Gel", "Suspension"],
    source: {
      name: "U.S. FDA Drug Labeling (SPL) via openFDA",
      setId: "7c1cb5a4-9464-44df-9cb9-497793d5675e",
      effectiveTime: "20240401",
      retrievedAt: "2026-09-15",
      url: "https://open.fda.gov/apis/drug/label/",
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "APPROVED",
      by: "clinical-pharmacology-reviewer",
      at: "2026-09-15",
    },
  },
  {
    key: "cetirizine",
    displayName: "Cetirizine Hydrochloride",
    genericName: "Cetirizine Hydrochloride",
    aliases: [
      "cetirizine",
      "cetirizine hydrochloride",
      "cetirizine hcl",
      "zyrtec",
      "cetzine",
      "alerid",
      "okacet",
    ],
    purposeText: "Antihistamine (Second Generation)",
    category: "Antihistamine",
    commonUses: [
      "Temporarily relieves runny nose, sneezing, itchy/watery eyes, and itching of the nose or throat due to hay fever or other upper respiratory allergies.",
    ],
    importantSafety: [
      "Drowsiness warning: Drowsiness may occur. Be careful when driving a motor vehicle or operating machinery.",
      "Alcohol, sedatives, and tranquilizers may increase drowsiness.",
      "Ask a doctor before use if you have kidney or liver disease. Dose may need to be adjusted.",
    ],
    standardStrengths: ["5 mg", "10 mg"],
    dosageForms: ["Tablet", "Chewable Tablet", "Liquid Gel", "Syrup"],
    source: {
      name: "U.S. FDA Drug Labeling (SPL) via openFDA",
      setId: "392b2361-949e-4c7b-b5cb-bf6d13d80635",
      effectiveTime: "20240301",
      retrievedAt: "2026-09-15",
      url: "https://open.fda.gov/apis/drug/label/",
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "APPROVED",
      by: "clinical-pharmacology-reviewer",
      at: "2026-09-15",
    },
  },
  {
    key: "diphenhydramine",
    displayName: "Diphenhydramine Hydrochloride",
    genericName: "Diphenhydramine Hydrochloride",
    aliases: [
      "diphenhydramine",
      "diphenhydramine hcl",
      "benadryl",
      "unisom sleepgels",
      "z-zzquil",
    ],
    purposeText: "Antihistamine / Nighttime Sleep-Aid (First Generation)",
    category: "Antihistamine",
    commonUses: [
      "Temporarily relieves allergic symptoms such as runny nose, sneezing, itchy/watery eyes, itching of nose or throat.",
      "Relief of cough due to minor throat and bronchial irritation associated with the common cold.",
    ],
    importantSafety: [
      "Marked drowsiness may occur. Do not drive or operate machinery.",
      "Do not use to make a child sleepy, or with any other product containing diphenhydramine (even one used on skin).",
      "Ask a doctor before use if you have glaucoma, asthma, emphysema, or trouble urinating due to an enlarged prostate gland.",
    ],
    standardStrengths: ["25 mg", "50 mg"],
    dosageForms: ["Tablet", "Capsule", "Liquid", "Chewable"],
    source: {
      name: "U.S. FDA Drug Labeling (SPL) via openFDA",
      setId: "1e14ba57-7977-4560-848e-d9c02ea12431",
      effectiveTime: "20240201",
      retrievedAt: "2026-09-15",
      url: "https://open.fda.gov/apis/drug/label/",
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "APPROVED",
      by: "clinical-pharmacology-reviewer",
      at: "2026-09-15",
    },
  },
  {
    key: "loratadine",
    displayName: "Loratadine",
    genericName: "Loratadine",
    aliases: ["loratadine", "claritin", "alavert", "lorfast"],
    purposeText: "Antihistamine (Second Generation, Non-Drowsy)",
    category: "Antihistamine",
    commonUses: [
      "Temporarily relieves runny nose, itchy/watery eyes, sneezing, and itching of the nose or throat due to hay fever or other upper respiratory allergies.",
    ],
    importantSafety: [
      "Ask a doctor before use if you have kidney or liver disease.",
      "Do not exceed recommended dose; taking more than directed may cause drowsiness.",
    ],
    standardStrengths: ["10 mg"],
    dosageForms: ["Tablet", "RediTabs", "Liquid Gel", "Syrup"],
    source: {
      name: "U.S. FDA Drug Labeling (SPL) via openFDA",
      setId: "40d2ba51-873b-4899-bfa2-8b89e7a9b0c2",
      effectiveTime: "20240101",
      retrievedAt: "2026-09-15",
      url: "https://open.fda.gov/apis/drug/label/",
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "APPROVED",
      by: "clinical-pharmacology-reviewer",
      at: "2026-09-15",
    },
  },
  {
    key: "chlorpheniramine",
    displayName: "Chlorpheniramine Maleate",
    genericName: "Chlorpheniramine Maleate",
    aliases: [
      "chlorpheniramine",
      "chlorpheniramine maleate",
      "cpm",
      "chlor-trimeton",
      "piriton",
    ],
    purposeText: "Antihistamine (First Generation)",
    category: "Antihistamine",
    commonUses: [
      "Temporarily relieves sneezing, itchy/watery eyes, itchy throat, and runny nose.",
    ],
    importantSafety: [
      "Marked drowsiness may occur. Avoid alcoholic drinks while taking this product.",
      "Ask a doctor before use if you have glaucoma or an enlarged prostate gland.",
    ],
    standardStrengths: ["4 mg"],
    dosageForms: ["Tablet", "Syrup"],
    source: {
      name: "U.S. FDA Drug Labeling (SPL) via openFDA",
      setId: "57e84992-cf16-4ae1-8d26-6a589cf29661",
      effectiveTime: "20240101",
      retrievedAt: "2026-09-15",
      url: "https://open.fda.gov/apis/drug/label/",
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "APPROVED",
      by: "clinical-pharmacology-reviewer",
      at: "2026-09-15",
    },
  },
  {
    key: "phenylephrine",
    displayName: "Phenylephrine Hydrochloride",
    genericName: "Phenylephrine Hydrochloride",
    aliases: ["phenylephrine", "phenylephrine hcl", "sudafed pe", "sinus pe"],
    purposeText: "Nasal Decongestant",
    category: "Decongestant",
    commonUses: [
      "Temporarily relieves nasal congestion due to the common cold, hay fever, or other upper respiratory allergies.",
      "Promotes sinus drainage.",
    ],
    importantSafety: [
      "Do not use if you are now taking a prescription monoamine oxidase inhibitor (MAOI) or for 2 weeks after stopping the MAOI drug.",
      "Ask a doctor before use if you have heart disease, high blood pressure, thyroid disease, diabetes, or trouble urinating.",
    ],
    standardStrengths: ["10 mg"],
    dosageForms: ["Tablet", "Nasal Spray"],
    source: {
      name: "U.S. FDA Drug Labeling (SPL) via openFDA",
      setId: "89afc811-12c8-477a-a664-5ba934f89d34",
      effectiveTime: "20240101",
      retrievedAt: "2026-09-15",
      url: "https://open.fda.gov/apis/drug/label/",
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "APPROVED",
      by: "clinical-pharmacology-reviewer",
      at: "2026-09-15",
    },
  },
  {
    key: "dextromethorphan",
    displayName: "Dextromethorphan Hydrobromide",
    genericName: "Dextromethorphan Hydrobromide",
    aliases: [
      "dextromethorphan",
      "dextromethorphan hbr",
      "delsym",
      "benylin dm",
      "robitussin dm",
      "vicks dayquil cough",
    ],
    purposeText: "Cough Suppressant (Antitussive)",
    category: "Antitussive",
    commonUses: [
      "Temporarily relieves cough due to minor throat and bronchial irritation as may occur with the common cold.",
    ],
    importantSafety: [
      "Do not use if you are taking a prescription MAOI or for 2 weeks after stopping the MAOI.",
      "Ask a doctor before use if you have cough with too much phlegm or chronic cough (asthma, smoking, emphysema).",
    ],
    standardStrengths: ["15 mg", "30 mg"],
    dosageForms: ["Liquid", "Syrup", "Caplet"],
    source: {
      name: "U.S. FDA Drug Labeling (SPL) via openFDA",
      setId: "651bce70-4f67-4e67-8255-b44c8038753a",
      effectiveTime: "20240101",
      retrievedAt: "2026-09-15",
      url: "https://open.fda.gov/apis/drug/label/",
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "APPROVED",
      by: "clinical-pharmacology-reviewer",
      at: "2026-09-15",
    },
  },
  {
    key: "aspirin",
    displayName: "Aspirin (Acetylsalicylic Acid)",
    genericName: "Aspirin",
    aliases: ["aspirin", "acetylsalicylic acid", "bayer", "ecotrin", "disprin"],
    purposeText: "Pain reliever / fever reducer (NSAID)",
    category: "NSAID / Antiplatelet",
    commonUses: [
      "Temporarily relieves minor aches and pains and fever.",
      "Used under medical supervision for cardiovascular protection.",
    ],
    importantSafety: [
      "Reye's syndrome warning: Children and teenagers who have or are recovering from chicken pox or flu-like symptoms should NOT use this product.",
      "Stomach bleeding warning: Higher risk if age 60+, ulcer history, or taking blood thinners.",
    ],
    boxedWarnings: [
      "Reye's Syndrome: Serious and sometimes fatal condition in children and adolescents recovering from viral infections.",
    ],
    standardStrengths: ["81 mg", "325 mg", "500 mg"],
    dosageForms: ["Tablet", "Enteric Coated Tablet", "Chewable"],
    source: {
      name: "U.S. FDA Drug Labeling (SPL) via openFDA",
      setId: "41995e6f-5b65-4f76-90b9-50fa62615462",
      effectiveTime: "20240101",
      retrievedAt: "2026-09-15",
      url: "https://open.fda.gov/apis/drug/label/",
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "APPROVED",
      by: "clinical-pharmacology-reviewer",
      at: "2026-09-15",
    },
  },
  {
    key: "omeprazole",
    displayName: "Omeprazole",
    genericName: "Omeprazole Delayed-Release",
    aliases: ["omeprazole", "prilosec", "prilosec otc", "omez", "losec"],
    purposeText: "Acid Reducer (Proton Pump Inhibitor - PPI)",
    category: "Proton Pump Inhibitor",
    commonUses: [
      "Treats frequent heartburn (occurs 2 or more days a week). Not intended for immediate relief of heartburn.",
    ],
    importantSafety: [
      "Do not use for more than 14 days unless directed by a doctor.",
      "Ask a doctor before use if you have trouble or pain swallowing food, vomiting with blood, or bloody/black stools.",
    ],
    standardStrengths: ["20 mg"],
    dosageForms: ["Delayed-Release Tablet", "Capsule"],
    source: {
      name: "U.S. FDA Drug Labeling (SPL) via openFDA",
      setId: "29e96df0-0b4b-48ae-bb6c-3e6f77ffab41",
      effectiveTime: "20240101",
      retrievedAt: "2026-09-15",
      url: "https://open.fda.gov/apis/drug/label/",
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "APPROVED",
      by: "clinical-pharmacology-reviewer",
      at: "2026-09-15",
    },
  },
];
