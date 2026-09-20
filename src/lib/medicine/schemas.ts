/**
 * src/lib/medicine/schemas.ts
 * M02: Zod schemas for Medicine Lens extraction and input validation (Blueprint §10).
 */

import { z } from "zod";

export const RawIngredientCandidateSchema = z.object({
  name: z.string().min(1).max(100),
  strength: z.string().nullable().optional().default(null),
  evidenceQuote: z.string().min(1).max(300),
});

export const RawMedicineExtractionSchema = z.object({
  transcribedText: z.string().default(""),
  candidateBrand: z.string().nullable().optional().default(null),
  dosageForm: z.string().nullable().optional().default(null),
  activeIngredients: z.array(RawIngredientCandidateSchema).default([]),
  warningsExtracted: z.array(z.string()).default([]),
  packagingNotes: z.array(z.string()).default([]),
});

export const ScanMedicineInputSchema = z.object({
  imageBase64: z.string().min(20),
  fileName: z.string().optional(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
});

export type ScanMedicineInput = z.infer<typeof ScanMedicineInputSchema>;
