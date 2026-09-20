/**
 * src/lib/legacy.ts
 * Type definitions for legacy analyses stored before evidence verification.
 * These types allow history and dashboard renderers to display old rows
 * without keeping retired server functions or dangerous AI prompts in the build.
 */

export interface LegacyReportAbnormalValue {
  name: string;
  value: string;
  reference?: string;
  note?: string;
}

export interface LegacyReportResult {
  summary: string;
  key_findings: string[];
  abnormal_values: LegacyReportAbnormalValue[];
  recommendations: string[];
  red_flags: string[];
  disclaimer: string;
}

export interface LegacySymptomPossibleCondition {
  name: string;
  likelihood: "low" | "moderate" | "high";
  explanation: string;
}

export interface LegacySymptomResult {
  summary: string;
  possible_conditions: LegacySymptomPossibleCondition[];
  self_care: string[];
  when_to_seek_care: string[];
  red_flags: string[];
  disclaimer: string;
}

export interface LegacyMedicineResult {
  name: string;
  generic_name?: string;
  drug_class?: string;
  uses: string[];
  typical_dosage?: string;
  common_side_effects?: string[];
  serious_side_effects?: string[];
  interactions?: string[];
  warnings?: string[];
  disclaimer?: string;
}
