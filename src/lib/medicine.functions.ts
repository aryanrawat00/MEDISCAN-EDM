/**
 * src/lib/medicine.functions.ts
 * M05: Server function for Medicine Packaging Vision OCR (Blueprint §10).
 * Handles client upload, image guard inspection, Gemini vision OCR,
 * and deterministic identification against openFDA monographs.
 */

import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { resolveUserOrGuest } from "./auth.middleware";
import { withModelFallback } from "./shared/model.server";
import { Result, okResult, errResult } from "./shared/result";
import { MedicineScanV3 } from "./medicine/types";
import { ScanMedicineInputSchema } from "./medicine/schemas";
import { validateImagePayload } from "./medicine/imageGuard.server";
import { RawMedicineExtractionSchema } from "./medicine/schemas";
import { runMedicinePipeline } from "./medicine/pipeline";
import {
  MEDICINE_VISION_SYSTEM_PROMPT,
  MEDICINE_VISION_USER_PROMPT,
} from "./medicine/prompts";

function stripJson(text: string): string {
  const fence = /```(?:json)?\s*([\s\S]*?)\s*```/.exec(text);
  return (fence ? fence[1] : text).trim();
}

export const scanMedicine = createServerFn({ method: "POST" })
  .middleware([resolveUserOrGuest])
  .inputValidator((d: unknown) => ScanMedicineInputSchema.parse(d))
  .handler(async ({ data }): Promise<Result<MedicineScanV3>> => {
    try {
      const startTime = Date.now();

      // 1. Guard check image payload
      const guard = validateImagePayload(data.imageBase64);
      if (!guard.valid || !guard.mimeType) {
        return errResult("INPUT_INVALID", guard.error || "Invalid image payload.");
      }

      // 2. Call Gemini Vision model via withModelFallback
      const { result: text, usedModel } = await withModelFallback(async (model) => {
        const rawBase64 = data.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "").trim();
        const imageBuffer = Buffer.from(rawBase64, "base64");

        const res = await generateText({
          model,
          messages: [
            {
              role: "system",
              content: MEDICINE_VISION_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: [
                { type: "text", text: MEDICINE_VISION_USER_PROMPT },
                {
                  type: "image",
                  image: imageBuffer,
                },
              ],
            },
          ],
          temperature: 0.1,
        });

        return res.text;
      });

      const scanMs = Date.now() - startTime;

      // 3. Parse JSON response
      let rawObj: unknown;
      try {
        rawObj = JSON.parse(stripJson(text));
      } catch (jsonErr) {
        return errResult("AI_BAD_OUTPUT", "The AI returned an invalid JSON response for packaging OCR.");
      }

      // 4. Validate against extraction schema
      const parsedExtraction = RawMedicineExtractionSchema.safeParse(rawObj);
      if (!parsedExtraction.success) {
        return errResult(
          "AI_BAD_OUTPUT",
          `Packaging extraction failed schema validation: ${parsedExtraction.error.message}`,
        );
      }

      // 5. Run deterministic identification pipeline
      const scanResult = runMedicinePipeline({
        rawExtraction: parsedExtraction.data,
        scanMs,
        model: usedModel,
        imageFileName: data.fileName,
        imageSizeKb: Math.round((guard.sizeBytes ?? 0) / 1024),
      });

      return okResult(scanResult);
    } catch (err: any) {
      console.error("scanMedicine error:", err);
      return errResult(
        "INTERNAL",
        err?.message || "An unexpected error occurred during medicine scanning.",
      );
    }
  });
