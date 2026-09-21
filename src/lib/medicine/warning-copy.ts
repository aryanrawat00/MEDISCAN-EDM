import type { MedicineReferenceEntry } from "./reference.data";

/** Starter sentences supplied in the Plain Mode brief. No runtime text generation. */
export const WARNING_TEMPLATES = {
  liver: "Taking too much of this, or combining it with another medicine that also contains {ingredient}, can seriously harm your liver.",
  skin: "Stop using this and get medical help right away if you notice skin redness, blistering, or a rash.",
  duplicate: "Check the label of anything else you take — if it also lists {ingredient}, don't take both without asking a pharmacist.",
  condition: "If you have {condition}, talk to a doctor before taking this.",
  alcohol: "Regularly drinking alcohol while taking this can increase the risk of harm — that's why your label calls it out.",
} as const;

type WarningMapping = {
  category: keyof typeof WARNING_TEMPLATES;
  ingredient?: string;
  condition?: string;
  // Keep compound warnings / stronger prohibitions visible beside the supplied lead.
  keepOriginalVisible?: boolean;
};

/** Exact source-text allowlist. Changed/new label text falls back to verbatim-only.
 * Mapping does not change reference data or imply additional clinical review.
 * Review additions alongside the PENDING -> APPROVED snapshot workflow.
 */
export const WARNING_COPY_MAP: Readonly<Record<string, WarningMapping>> = {
  "Hepatotoxicity Warning: Severe liver damage risk with acute overdose or concomitant acetaminophen use exceeding 4,000 mg/day.": { category: "liver", ingredient: "acetaminophen" },
  "Liver warning: This product contains acetaminophen. Severe liver damage may occur if you take more than 4,000 mg in 24 hours, take with other drugs containing acetaminophen, or consume 3 or more alcoholic drinks daily while using this product.": { category: "liver", ingredient: "acetaminophen" },
  "Allergy alert: Acetaminophen may cause severe skin reactions (skin reddening, blisters, rash). If a skin reaction occurs, stop use and seek medical help immediately.": { category: "skin" },
  "Do not use with any other drug containing acetaminophen (prescription or nonprescription). If you are not sure whether a drug contains acetaminophen, ask a doctor or pharmacist.": { category: "duplicate", ingredient: "acetaminophen", keepOriginalVisible: true },
  "Do not use to make a child sleepy, or with any other product containing diphenhydramine (even one used on skin).": { category: "duplicate", ingredient: "diphenhydramine", keepOriginalVisible: true },
  "Alcohol, sedatives, and tranquilizers may increase drowsiness.": { category: "alcohol", keepOriginalVisible: true },
  "Marked drowsiness may occur. Avoid alcoholic drinks while taking this product.": { category: "alcohol", keepOriginalVisible: true },
  "Ask a doctor before use if you have liver disease.": { category: "condition", condition: "liver disease" },
  "Ask a doctor before use if you have kidney or liver disease.": { category: "condition", condition: "kidney or liver disease" },
  "Ask a doctor before use if you have kidney or liver disease. Dose may need to be adjusted.": { category: "condition", condition: "kidney or liver disease", keepOriginalVisible: true },
  "Ask a doctor before use if you have glaucoma, asthma, emphysema, or trouble urinating due to an enlarged prostate gland.": { category: "condition", condition: "glaucoma, asthma, emphysema, or trouble urinating due to an enlarged prostate gland" },
  "Ask a doctor before use if you have glaucoma or an enlarged prostate gland.": { category: "condition", condition: "glaucoma or an enlarged prostate gland" },
  "Ask a doctor before use if you have heart disease, high blood pressure, thyroid disease, diabetes, or trouble urinating.": { category: "condition", condition: "heart disease, high blood pressure, thyroid disease, diabetes, or trouble urinating" },
  "Ask a doctor before use if you have cough with too much phlegm or chronic cough (asthma, smoking, emphysema).": { category: "condition", condition: "cough with too much phlegm or chronic cough (asthma, smoking, emphysema)" },
  "Ask a doctor before use if you have trouble or pain swallowing food, vomiting with blood, or bloody/black stools.": { category: "condition", condition: "trouble or pain swallowing food, vomiting with blood, or bloody/black stools" },
};

export function getWarningCopy(medicine: MedicineReferenceEntry, original: string) {
  const belongsToSnapshot = medicine.importantSafety.includes(original) || medicine.boxedWarnings?.includes(original);
  const mapping = medicine.review.status === "APPROVED" && belongsToSnapshot && Object.hasOwn(WARNING_COPY_MAP, original)
    ? WARNING_COPY_MAP[original] : undefined;
  if (!mapping) return null;
  return {
    ...mapping,
    lead: WARNING_TEMPLATES[mapping.category]
      .replace("{ingredient}", mapping.ingredient ?? "")
      .replace("{condition}", mapping.condition ?? ""),
  };
}
