/**
 * src/lib/shared/model.server.ts
 * T10: Server-side Gemini model wrapper with dynamic fallback (Blueprint §15.1).
 * Reads GEMINI_MODEL candidate list (comma-separated) or uses standard stable defaults.
 * Automatically falls back to the next available candidate on 404 / "no longer available" errors.
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";

const DEFAULT_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

let activeWorkingModel: string | null = null;

export function getModelCandidates(): string[] {
  const envModels = process.env.GEMINI_MODEL;
  if (!envModels || !envModels.trim()) {
    return DEFAULT_CANDIDATES;
  }
  const parsed = envModels
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_CANDIDATES;
}

export function getGoogleAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please add it to your .env file."
    );
  }
  return createGoogleGenerativeAI({ apiKey });
}

export async function withModelFallback<T>(
  action: (model: ReturnType<ReturnType<typeof createGoogleGenerativeAI>>, modelId: string) => Promise<T>,
): Promise<{ result: T; usedModel: string }> {
  const google = getGoogleAIClient();
  const candidates = activeWorkingModel
    ? [activeWorkingModel, ...getModelCandidates().filter((m) => m !== activeWorkingModel)]
    : getModelCandidates();

  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const model = google(candidate);
      const result = await action(model, candidate);
      activeWorkingModel = candidate;
      return { result, usedModel: candidate };
    } catch (err: any) {
      lastError = err;
      const msg = (err?.message || "").toLowerCase();
      const status = err?.status || err?.statusCode;

      // Only fallback on model availability errors (404, not found, unsupported model)
      const isNotFound =
        status === 404 ||
        msg.includes("not found") ||
        msg.includes("no longer available") ||
        msg.includes("is not supported");

      if (isNotFound) {
        console.warn(`[ModelFallback] Model '${candidate}' unavailable, trying next candidate...`);
        continue;
      }

      // Re-throw rate limits (429) or quota errors without burning other models
      throw err;
    }
  }

  throw lastError || new Error("All configured Gemini models failed to answer.");
}
