/**
 * src/lib/medicine/pipeline.ts
 * M05: Medicine Scan Pipeline (Blueprint §10, §12).
 * Orchestrates:
 * 1. Image OCR result ingestion
 * 2. Deterministic evidence verification
 * 3. Monograph registry matching
 * 4. Safety warning compilation
 */

import { RawMedicineExtraction, MedicineScanV3 } from "./types";
import { identifyMedicine } from "./identify";

export interface RunMedicinePipelineOptions {
  rawExtraction: RawMedicineExtraction;
  scanMs: number;
  model: string;
  imageFileName?: string;
  imageSizeKb?: number;
}

export function runMedicinePipeline(options: RunMedicinePipelineOptions): MedicineScanV3 {
  return identifyMedicine(options.rawExtraction, {
    scanMs: options.scanMs,
    model: options.model,
    imageFileName: options.imageFileName,
    imageSizeKb: options.imageSizeKb,
  });
}
