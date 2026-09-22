import type { VerifiedFinding } from "./types";

export const LAB_EDUCATION_SOURCE = "https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/";
export const EMERGENCY_EDUCATION_SOURCE = "https://medlineplus.gov/ency/article/001927.htm";
export const EDUCATION_CHECKED_ON = "2026-09-22";

export interface TestEducation {
  name: string;
  aliases: string[];
  group: string;
  purpose: string;
  context: string;
  precaution: string;
  question: string;
  source: string;
}

// Authored educational summaries of the linked sources, not diagnoses or a new
// classifier. Changes require source review; no clinical reviewer is implied.
const blood = {
  group: "Blood cells",
  context: "Medicines, activity, periods and how much fluid is in your body can affect blood-count results.",
  precaution: "Tell your doctor about symptoms, recent illness and medicines. A blood count alone cannot explain the cause of a change.",
  question: "How does this fit with my other blood-count results?",
  source: "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",
};
const fats = {
  group: "Blood fats",
  context: "Your personal cholesterol goals also depend on your age, medical history and other heart-health risks.",
  precaution: "Ask about food and activity changes that fit your health. Check whether you need to fast before a repeat test.",
  question: "What cholesterol goals are appropriate for me?",
  source: "https://medlineplus.gov/lab-tests/cholesterol-levels/",
};
const thyroid = {
  group: "Thyroid",
  context: "Doctors usually look at thyroid results together. Medicines and supplements can affect the results.",
  precaution: "Bring your medicine and supplement list. Do not stop or change them for a test unless your clinician tells you to.",
  question: "What do my thyroid tests show when considered together?",
};

export const TEST_EDUCATION: TestEducation[] = [
  { ...blood, name: "Oxygen-carrying protein", aliases: ["Hemoglobin", "Haemoglobin", "Hb", "Hgb"], purpose: "Hemoglobin is the protein in red blood cells that carries oxygen around your body." },
  { ...blood, name: "Infection-fighting cells", aliases: ["Total Leucocyte Count (TLC)", "Total Leukocyte Count", "TLC", "WBC", "White Blood Cell Count", "White Blood Count"], purpose: "This counts white blood cells, which help your body fight infections." },
  { ...blood, name: "Share of blood made up of red cells", aliases: ["Packed Cell Volume (PCV)", "PCV", "Hematocrit", "Haematocrit", "HCT"], purpose: "This measures how much of your blood is made up of red blood cells." },
  { ...blood, name: "Average red blood cell size", aliases: ["Mean Corpuscular Volume (MCV)", "Mean Corpuscular Volume", "MCV"], purpose: "This shows the average size of your red blood cells." },
  { ...blood, name: "Cells that help stop bleeding", aliases: ["Platelet Count", "Platelets", "PLT"], purpose: "Platelets help your blood form clots to stop bleeding. This test counts them." },
  {
    name: "Blood sugar", aliases: ["Fasting Blood Glucose", "Fasting Blood Sugar", "Blood Glucose", "Glucose", "FBS", "Random Blood Glucose", "Random Blood Sugar", "RBS"], group: "Blood sugar",
    purpose: "This measures the sugar in your blood, which your body uses for energy.",
    context: "The type of glucose test, fasting, illness and some medicines can affect how a result is interpreted.",
    precaution: "Ask whether fasting is needed before a repeat test. Follow the clinic's instructions rather than skipping meals on your own.",
    question: "Does this result need a repeat test or another type of blood-sugar test?",
    source: "https://medlineplus.gov/lab-tests/blood-glucose-test/",
  },
  {
    name: "A waste product filtered by the kidneys", aliases: ["Serum Creatinine", "Creatinine", "Blood Creatinine"], group: "Kidney checks",
    purpose: "Creatinine is a waste product from your muscles. Your kidneys remove it from the blood.",
    context: "Muscle size, recent intense exercise, meat intake and some medicines can affect the result.",
    precaution: "Tell your clinician about medicines, supplements and recent exercise. Follow their preparation instructions before repeat testing.",
    question: "How does this fit with my other kidney tests, such as eGFR?",
    source: "https://medlineplus.gov/lab-tests/creatinine-test/",
  },
  {
    name: "Waste from breaking down protein", aliases: ["Blood Urea Nitrogen", "Blood Urea Nitrogen (BUN)", "BUN"], group: "Kidney checks",
    purpose: "BUN measures a waste product made when your body breaks down protein. The kidneys help remove it.",
    context: "Fluid levels, protein intake and some medicines can affect this result. It is usually considered with other kidney tests.",
    precaution: "Ask your clinician what the result means before making changes to your fluid intake or diet.",
    question: "Do my other kidney results help explain this value?",
    source: "https://medlineplus.gov/lab-tests/bun-blood-urea-nitrogen/",
  },
  { ...fats, name: "Overall blood cholesterol", aliases: ["Total Cholesterol", "Cholesterol Total"], purpose: "This measures the total amount of cholesterol, a fat-like substance, in your blood." },
  { ...fats, name: "A type of fat in your blood", aliases: ["Triglycerides", "Triglyceride", "TG"], purpose: "Triglycerides are fats your body uses to store energy. This test measures their level in blood." },
  { ...fats, name: "Cholesterol carried back to the liver", aliases: ["HDL Cholesterol", "HDL", "HDL-C"], purpose: "HDL helps carry cholesterol from the body back to the liver, where it can be removed." },
  { ...fats, name: "Cholesterol that can build up in arteries", aliases: ["LDL Cholesterol", "LDL", "LDL-C", "LDL Cholesterol Calculated", "LDL Cholesterol Direct"], purpose: "Too much LDL cholesterol can contribute to buildup inside blood vessels." },
  { ...fats, name: "A carrier of blood fats", aliases: ["VLDL Cholesterol", "VLDL", "VLDL-C"], purpose: "VLDL mainly carries triglycerides, a type of fat, through your blood." },
  { ...fats, name: "Cholesterol other than HDL", aliases: ["Non-HDL Cholesterol", "Non HDL", "Non-HDL-C"], purpose: "This is total cholesterol minus HDL. It includes several types that can contribute to artery buildup." },
  { ...thyroid, name: "A signal to your thyroid", aliases: ["TSH - Thyroid Stimulating Hormone", "Thyroid Stimulating Hormone", "TSH", "TSH (Thyroid Stimulating Hormone)"], purpose: "TSH tells your thyroid gland how much thyroid hormone to make.", source: "https://medlineplus.gov/lab-tests/tsh-thyroid-stimulating-hormone-test/" },
  { ...thyroid, name: "One of your thyroid hormones", aliases: ["Triiodothyronine (T3 Total)", "Total T3", "T3", "Free T3", "FT3", "Triiodothyronine"], purpose: "T3 is a thyroid hormone that helps control how your body uses energy.", source: "https://medlineplus.gov/lab-tests/triiodothyronine-t3-tests/" },
  { ...thyroid, name: "One of your thyroid hormones", aliases: ["Thyroxine (T4 Total)", "Total T4", "T4", "Free T4", "FT4", "Thyroxine"], purpose: "T4 is a thyroid hormone that helps control energy use, body temperature and other functions.", source: "https://medlineplus.gov/lab-tests/thyroxine-t4-test/" },
];

const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
const educationByAlias = new Map(TEST_EDUCATION.flatMap(entry => entry.aliases.map(alias => [normalizeName(alias), entry] as const)));
export function getTestEducation(name: string) { return educationByAlias.get(normalizeName(name)) ?? null; }

export function resultMeaning(finding: VerifiedFinding): string {
  if (finding.statusReason === "QUALITATIVE_MATCH") return "Your result matches the finding the lab expected.";
  if (finding.statusReason === "QUALITATIVE_DIFFERS_FROM_REFERENCE") return "Your result differs from the finding the lab expected. It needs interpretation by your clinician.";
  switch (finding.status) {
    case "LOW": return "Your result is below the range printed by your lab.";
    case "HIGH": return "Your result is above the range printed by your lab.";
    case "NORMAL": return "Your result is within the range printed by your lab.";
    default: return "There is not enough clear, verified information to interpret this comparison.";
  }
}

export function resultNextStep(finding: VerifiedFinding): string {
  if (finding.status === "UNKNOWN") return "Ask the clinician who ordered the test to interpret this result using the original report.";
  if (finding.attention || finding.labFlagAgreement === "DISAGREES") return "Ask your clinician to review this result and the lab's flag together.";
  if (finding.status !== "NORMAL") return "Contact the clinician who ordered the test to discuss the result and ask how soon you need follow-up.";
  return "Keep your planned follow-up. Mention any symptoms, even when a result is within range.";
}

export function countResults(findings: VerifiedFinding[]) {
  return findings.reduce((counts, finding) => {
    if (finding.status === "NORMAL") counts.within++;
    else if (finding.status === "UNKNOWN") counts.unclear++;
    else counts.outside++;
    return counts;
  }, { within: 0, outside: 0, unclear: 0 });
}

/** Only relay explicit, verified source flags. Never infer urgency from a number. */
export function hasPrintedCriticalFlag(finding: VerifiedFinding, sourceTextAvailable = true) {
  if (!sourceTextAvailable || !finding.evidence.verified || !finding.evidence.checks.quoteFound) return false;
  const flag = finding.labFlag?.trim() ?? "";
  if (!/^(critical|panic|HH|LL)$/i.test(flag)) return false;
  const quote = finding.evidence.quote;
  if (/\b(?:not|non|no)\s*[-:]?\s*(?:critical|panic)\b/i.test(quote)) return false;
  return new RegExp(`\\b${flag}\\b`, "i").test(quote);
}

export const VISIT_CHECKLIST = [
  "Bring this report and any earlier results.",
  "Write down symptoms, when they started and what has changed.",
  "Bring a list of medicines and supplements you take.",
  "Ask what needs follow-up and when to arrange it.",
] as const;
