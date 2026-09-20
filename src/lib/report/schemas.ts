/**
 * src/lib/report/schemas.ts
 * Zod validation schemas for Report Lens.
 * Validates untrusted AI responses and ensures strict bounds on lengths and array sizes.
 */

import { z } from "zod";

export const rawFindingSchema = z.object({
  testName: z.string().min(1).max(120),
  valueText: z.string().min(1).max(40),
  unit: z
    .string()
    .max(30)
    .nullable()
    .optional()
    .transform((v) => (v ? v.trim() : null)),
  referenceRangeText: z
    .string()
    .max(120)
    .nullable()
    .optional()
    .transform((v) => (v ? v.trim() : null)),
  labFlag: z
    .string()
    .max(20)
    .nullable()
    .optional()
    .transform((v) => (v ? v.trim() : null)),
  evidenceQuote: z.string().min(1).max(300),
});

export const extractionOutputSchema = z.object({
  patientSexText: z
    .string()
    .max(20)
    .nullable()
    .optional()
    .transform((v) => (v ? v.trim() : null)),
  findings: z.array(rawFindingSchema).max(120),
  reportNotes: z.array(z.string().max(300)).max(8).optional().default([]),
});

export const statusSchema = z.enum(["LOW", "NORMAL", "HIGH", "UNKNOWN"]);

export const statusReasonSchema = z.enum([
  "WITHIN_RANGE",
  "BELOW_LOWER_BOUND",
  "ABOVE_UPPER_BOUND",
  "NO_RANGE",
  "RANGE_UNVERIFIED",
  "EVIDENCE_UNVERIFIED",
  "INVALID_VALUE",
  "NON_NUMERIC_VALUE",
  "TYPE_MISMATCH",
  "UNPARSEABLE_RANGE",
  "INVALID_RANGE",
  "MULTI_BAND_RANGE",
  "SEX_SPECIFIC_RANGE",
  "UNIT_MISMATCH",
  "AMBIGUOUS_INTERVAL",
  "QUALITATIVE_MATCH",
  "QUALITATIVE_DIFFERS_FROM_REFERENCE",
]);

export const reportAnalysisEnvelopeSchema = z.object({
  schemaVersion: z.literal(2),
  engineVersion: z.string(),
  promptVersion: z.string(),
  model: z.string(),
  source: z.object({
    kind: z.enum(["paste", "txt", "pdf", "demo"]),
    fileName: z.string().optional(),
    pages: z.number().optional(),
  }),
  pipeline: z.any(),
  brief: z.any().nullable(),
});
