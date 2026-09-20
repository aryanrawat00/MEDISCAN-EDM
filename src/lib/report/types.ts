/**
 * src/lib/report/types.ts
 * Type definitions for Report Lens evidence-locking architecture (Blueprint §14).
 * Enforces strict separation:
 *   - RawFinding / ExtractionOutput: what the LLM extracts (unverified).
 *   - VerifiedFinding / PipelineResult: authoritative code output after verification and rule engine.
 *   - ReportAnalysisV2: persisted envelope in analyses.result (schemaVersion: 2).
 */

export type Status = "LOW" | "NORMAL" | "HIGH" | "UNKNOWN";

export type StatusReason =
  | "WITHIN_RANGE"
  | "BELOW_LOWER_BOUND"
  | "ABOVE_UPPER_BOUND"
  | "NO_RANGE"
  | "RANGE_UNVERIFIED"
  | "EVIDENCE_UNVERIFIED"
  | "INVALID_VALUE"
  | "NON_NUMERIC_VALUE"
  | "TYPE_MISMATCH"
  | "UNPARSEABLE_RANGE"
  | "INVALID_RANGE"
  | "MULTI_BAND_RANGE"
  | "SEX_SPECIFIC_RANGE"
  | "UNIT_MISMATCH"
  | "AMBIGUOUS_INTERVAL"
  | "QUALITATIVE_MATCH"
  | "QUALITATIVE_DIFFERS_FROM_REFERENCE";

export interface RawFinding {
  testName: string;
  valueText: string;
  unit: string | null;
  referenceRangeText: string | null;
  labFlag: string | null;
  evidenceQuote: string;
}

export interface ExtractionOutput {
  patientSexText: string | null;
  findings: RawFinding[];
  reportNotes: string[];
}

export type FindingValue =
  | { kind: "numeric"; op: null | "<" | "<=" | ">" | ">="; n: number }
  | { kind: "text"; token: string }
  | { kind: "invalid" };

export interface IntervalBound {
  n: number;
  closed: boolean;
}

export type FindingRange =
  | { kind: "interval"; lo: IntervalBound | null; hi: IntervalBound | null; unit?: string }
  | { kind: "text"; token: string }
  | { kind: "multi" | "none" | "unparseable" | "invalid"; reason?: string };

export interface FindingEvidence {
  quote: string;
  span: { start: number; end: number } | null;
  page: number | null;
  level: "SOURCE_TEXT" | "IMAGE_TRANSCRIPT";
  checks: {
    quoteFound: boolean;
    nameInQuote: boolean;
    valueInQuote: boolean;
    rangeInQuote: boolean;
    unitInQuote: boolean | null;
  };
  verified: boolean;
  rangeVerified: boolean;
}

export type LabFlagAgreement = "AGREES" | "DISAGREES" | "NOT_PROVIDED" | "NOT_COMPARABLE";

export interface VerifiedFinding {
  id: string;
  testName: string;
  valueText: string;
  unit: string | null;
  referenceRangeText: string | null;
  labFlag: string | null;
  value: FindingValue;
  range: FindingRange;
  evidence: FindingEvidence;
  status: Status;
  statusReason: StatusReason;
  attention: boolean;
  labFlagAgreement: LabFlagAgreement;
  ruleTrace: string[];
}

export interface UnverifiedFinding {
  testName: string;
  valueText: string;
  reason: "QUOTE_NOT_FOUND" | "NAME_NOT_IN_QUOTE" | "VALUE_NOT_IN_QUOTE";
}

export interface PipelineStageTrace {
  stage:
    | "AI_EXTRACTION"
    | "SCHEMA_VALIDATION"
    | "EVIDENCE_VERIFICATION"
    | "RULE_ENGINE"
    | "AI_CONTEXT"
    | "TEMPLATES";
  executor: "AI" | "CODE";
  ms: number;
  detail: string;
}

export interface PipelineStats {
  raw: number;
  verified: number;
  unverified: number;
  excluded: number;
  flagged: number;
  unknown: number;
  pages: number | null;
}

export interface PipelineResult {
  findings: VerifiedFinding[];
  unverified: UnverifiedFinding[];
  excluded: number;
  reportNotes: { text: string; verified: boolean }[];
  stats: PipelineStats;
  trace: PipelineStageTrace[];
}

export interface BriefRow {
  findingId: string;
  testName: string;
  valueText: string;
  unit: string | null;
  referenceRangeText: string | null;
  status: Status;
  page: number | null;
}

export interface DoctorBrief {
  briefVersion: number;
  generatedAt: string;
  overview: {
    text: string;
    source: "TEMPLATE" | "AI";
    counts: {
      rows: number;
      verified: number;
      flagged: number;
      unverified: number;
      excluded: number;
      pages: number | null;
    };
  };
  keyFindings: { findingId: string; sentence: string }[];
  flagged: BriefRow[];
  allRows: BriefRow[];
  explanations: Record<string, { factual: string; context?: string }>;
  questions: { text: string; findingIds: string[]; source: "AI" | "TEMPLATE" }[];
  reportNotes: { text: string; verified: boolean }[];
  couldNotVerify: { testName: string; reason: string }[];
  criticalBanner: boolean;
  disclaimer: string;
}

export interface ReportAnalysisV2 {
  schemaVersion: 2;
  engineVersion: "1.0.0";
  promptVersion: "extract-v1";
  model: string;
  source: {
    kind: "paste" | "txt" | "pdf" | "demo";
    fileName?: string;
    pages?: number;
  };
  pipeline: PipelineResult;
  brief: DoctorBrief | null;
}
