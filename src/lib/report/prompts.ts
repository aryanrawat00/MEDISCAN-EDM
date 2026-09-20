/**
 * src/lib/report/prompts.ts
 * T10: Prompts for Report Lens AI extraction (Blueprint §15.3).
 * Enforces strict verbatim extraction and quotes without clinical editorializing or guessing.
 */

export const REPORT_EXTRACTION_PROMPT = `You are a medical data extraction engine.
Your task is to extract lab test rows and clinical measurements from the medical report text below.

STRICT INSTRUCTIONS:
1. Extract each test row:
   - "testName": Test or parameter name exactly as printed (e.g. "Hemoglobin", "Total Cholesterol", "TSH").
   - "valueText": Result value exactly as printed (e.g. "14.2", "< 0.5", "1,20,000", "Negative"). Include operators (<, >, <=, >=) and commas if present.
   - "unit": Unit of measurement (e.g. "g/dL", "mg/dL", "/cumm"), or null if none is printed for that test.
   - "referenceRangeText": Reference interval printed on that row (e.g. "12.0 - 15.0", "< 200", "Negative"), or null if none printed. NEVER INVENT OR LOOK UP REFERENCE RANGES.
   - "labFlag": Any printed abnormality flag (e.g. "H", "L", "*", "High", "Critical"), or null if none.
   - "evidenceQuote": Shortest verbatim text span from the report containing the test name, value, and printed range. MUST BE VERBATIM TEXT from the report.
2. "patientSexText": Patient sex if printed in the header or demographics (e.g. "Male", "Female"), or null if absent.
3. "reportNotes": Verbatim clinical comments, specimen notes, or critical alerts printed on the report (max 8 short notes).
4. Return ONLY valid JSON matching this schema:
{
  "patientSexText": string | null,
  "findings": [
    {
      "testName": string,
      "valueText": string,
      "unit": string | null,
      "referenceRangeText": string | null,
      "labFlag": string | null,
      "evidenceQuote": string
    }
  ],
  "reportNotes": string[]
}

DO NOT wrap in markdown fences. DO NOT include introductory or concluding text. Output JSON only.

REPORT:
"""
{{REPORT_TEXT}}
"""`;
