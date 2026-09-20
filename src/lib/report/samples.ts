/**
 * src/lib/report/samples.ts
 * T12: Synthetic medical reports with cached extractions (Blueprint §5, §14).
 * Enables 100% offline testing, demoing, and verification without requiring live API keys.
 */

import { RawFinding, Status } from "./types";

export interface ReportSample {
  id: string;
  title: string;
  description: string;
  category: string;
  sourceText: string;
  cachedRawFindings: RawFinding[];
  expectedStatuses: Record<string, Status>;
}

export const REPORT_SAMPLES: ReportSample[] = [
  {
    id: "cbc-metabolic",
    title: "Complete Blood Count & Metabolic Panel",
    description: "Standard routine health checkup showing borderline anemia and normal leukocyte count.",
    category: "Hematology & Biochemistry",
    sourceText: `METROPOLITAN CLINICAL LABORATORY
Patient: Synthetic Demo Subject | Sex: Female | Age: 34
Collection Date: 2026-09-15 | Status: Final

[[Page 1]]
COMPLETE BLOOD COUNT (CBC)
Investigation                     Result     Unit       Reference Range    Flag
Hemoglobin                        11.2       g/dL       12.0 - 15.0        L
Total Leucocyte Count (TLC)       7,200      /cumm      4,000 - 10,000
Packed Cell Volume (PCV)          34.5       %          36.0 - 46.0        L
Mean Corpuscular Volume (MCV)     78.2       fL         80.0 - 100.0       L
Platelet Count                    240,000    /cumm      150,000 - 450,000

[[Page 2]]
BIOCHEMISTRY
Fasting Blood Glucose             92         mg/dL      70 - 99
Serum Creatinine                  0.85       mg/dL      0.60 - 1.10
Blood Urea Nitrogen               14.0       mg/dL      7.0 - 20.0

Notes: Mild microcytic hypochromic picture noted. Correlate clinically with iron studies.`,
    cachedRawFindings: [
      {
        testName: "Hemoglobin",
        valueText: "11.2",
        unit: "g/dL",
        referenceRangeText: "12.0 - 15.0",
        labFlag: "L",
        evidenceQuote: "Hemoglobin                        11.2       g/dL       12.0 - 15.0        L",
      },
      {
        testName: "Total Leucocyte Count (TLC)",
        valueText: "7,200",
        unit: "/cumm",
        referenceRangeText: "4,000 - 10,000",
        labFlag: null,
        evidenceQuote: "Total Leucocyte Count (TLC)       7,200      /cumm      4,000 - 10,000",
      },
      {
        testName: "Packed Cell Volume (PCV)",
        valueText: "34.5",
        unit: "%",
        referenceRangeText: "36.0 - 46.0",
        labFlag: "L",
        evidenceQuote: "Packed Cell Volume (PCV)          34.5       %          36.0 - 46.0        L",
      },
      {
        testName: "Mean Corpuscular Volume (MCV)",
        valueText: "78.2",
        unit: "fL",
        referenceRangeText: "80.0 - 100.0",
        labFlag: "L",
        evidenceQuote: "Mean Corpuscular Volume (MCV)     78.2       fL         80.0 - 100.0       L",
      },
      {
        testName: "Platelet Count",
        valueText: "240,000",
        unit: "/cumm",
        referenceRangeText: "150,000 - 450,000",
        labFlag: null,
        evidenceQuote: "Platelet Count                    240,000    /cumm      150,000 - 450,000",
      },
      {
        testName: "Fasting Blood Glucose",
        valueText: "92",
        unit: "mg/dL",
        referenceRangeText: "70 - 99",
        labFlag: null,
        evidenceQuote: "Fasting Blood Glucose             92         mg/dL      70 - 99",
      },
      {
        testName: "Serum Creatinine",
        valueText: "0.85",
        unit: "mg/dL",
        referenceRangeText: "0.60 - 1.10",
        labFlag: null,
        evidenceQuote: "Serum Creatinine                  0.85       mg/dL      0.60 - 1.10",
      },
      {
        testName: "Blood Urea Nitrogen",
        valueText: "14.0",
        unit: "mg/dL",
        referenceRangeText: "7.0 - 20.0",
        labFlag: null,
        evidenceQuote: "Blood Urea Nitrogen               14.0       mg/dL      7.0 - 20.0",
      },
    ],
    expectedStatuses: {
      "Hemoglobin": "LOW",
      "Total Leucocyte Count (TLC)": "NORMAL",
      "Packed Cell Volume (PCV)": "LOW",
      "Mean Corpuscular Volume (MCV)": "LOW",
      "Platelet Count": "NORMAL",
      "Fasting Blood Glucose": "NORMAL",
      "Serum Creatinine": "NORMAL",
      "Blood Urea Nitrogen": "NORMAL",
    },
  },
  {
    id: "lipid-profile",
    title: "Comprehensive Lipid Profile",
    description: "Cardiovascular risk evaluation showing elevated total cholesterol and triglycerides.",
    category: "Lipidology",
    sourceText: `DIAGNOSTIC PATHOLOGY ALLIANCE
Patient: Synthetic Demo Subject | Sex: Male | Age: 52
[[Page 1]]
LIPID PROFILE
Test Parameter                    Result     Unit       Reference Range    Flag
Total Cholesterol                 245        mg/dL      < 200              H
Triglycerides                     190        mg/dL      < 150              H
HDL Cholesterol                   42         mg/dL      > 40
LDL Cholesterol                   165        mg/dL      < 100              H
VLDL Cholesterol                  38         mg/dL      < 30               H
Non-HDL Cholesterol               203        mg/dL      < 130              H

Interpretation: Patient demonstrates atherogenic dyslipidemia pattern.`,
    cachedRawFindings: [
      {
        testName: "Total Cholesterol",
        valueText: "245",
        unit: "mg/dL",
        referenceRangeText: "< 200",
        labFlag: "H",
        evidenceQuote: "Total Cholesterol                 245        mg/dL      < 200              H",
      },
      {
        testName: "Triglycerides",
        valueText: "190",
        unit: "mg/dL",
        referenceRangeText: "< 150",
        labFlag: "H",
        evidenceQuote: "Triglycerides                     190        mg/dL      < 150              H",
      },
      {
        testName: "HDL Cholesterol",
        valueText: "42",
        unit: "mg/dL",
        referenceRangeText: "> 40",
        labFlag: null,
        evidenceQuote: "HDL Cholesterol                   42         mg/dL      > 40",
      },
      {
        testName: "LDL Cholesterol",
        valueText: "165",
        unit: "mg/dL",
        referenceRangeText: "< 100",
        labFlag: "H",
        evidenceQuote: "LDL Cholesterol                   165        mg/dL      < 100              H",
      },
      {
        testName: "VLDL Cholesterol",
        valueText: "38",
        unit: "mg/dL",
        referenceRangeText: "< 30",
        labFlag: "H",
        evidenceQuote: "VLDL Cholesterol                  38         mg/dL      < 30               H",
      },
      {
        testName: "Non-HDL Cholesterol",
        valueText: "203",
        unit: "mg/dL",
        referenceRangeText: "< 130",
        labFlag: "H",
        evidenceQuote: "Non-HDL Cholesterol               203        mg/dL      < 130              H",
      },
    ],
    expectedStatuses: {
      "Total Cholesterol": "HIGH",
      "Triglycerides": "HIGH",
      "HDL Cholesterol": "NORMAL",
      "LDL Cholesterol": "HIGH",
      "VLDL Cholesterol": "HIGH",
      "Non-HDL Cholesterol": "HIGH",
    },
  },
  {
    id: "thyroid-panel",
    title: "Thyroid Function Test",
    description: "Endocrine assessment exhibiting subclinical hypothyroidism with elevated TSH.",
    category: "Endocrinology",
    sourceText: `APEX ENDOCRINE DIAGNOSTICS
Patient: Synthetic Demo Subject | Sex: Female | Age: 41
[[Page 1]]
THYROID FUNCTION PROFILE
Test                              Result     Unit       Reference Range    Flag
Triiodothyronine (T3 Total)       1.20       ng/mL      0.80 - 2.00
Thyroxine (T4 Total)              8.5        ug/dL      5.1 - 14.1
TSH - Thyroid Stimulating Hormone 6.80       uIU/mL     0.40 - 4.20        H`,
    cachedRawFindings: [
      {
        testName: "Triiodothyronine (T3 Total)",
        valueText: "1.20",
        unit: "ng/mL",
        referenceRangeText: "0.80 - 2.00",
        labFlag: null,
        evidenceQuote: "Triiodothyronine (T3 Total)       1.20       ng/mL      0.80 - 2.00",
      },
      {
        testName: "Thyroxine (T4 Total)",
        valueText: "8.5",
        unit: "ug/dL",
        referenceRangeText: "5.1 - 14.1",
        labFlag: null,
        evidenceQuote: "Thyroxine (T4 Total)              8.5        ug/dL      5.1 - 14.1",
      },
      {
        testName: "TSH - Thyroid Stimulating Hormone",
        valueText: "6.80",
        unit: "uIU/mL",
        referenceRangeText: "0.40 - 4.20",
        labFlag: "H",
        evidenceQuote: "TSH - Thyroid Stimulating Hormone 6.80       uIU/mL     0.40 - 4.20        H",
      },
    ],
    expectedStatuses: {
      "Triiodothyronine (T3 Total)": "NORMAL",
      "Thyroxine (T4 Total)": "NORMAL",
      "TSH - Thyroid Stimulating Hormone": "HIGH",
    },
  },
];
