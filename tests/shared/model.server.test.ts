import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getModelCandidates,
  withModelFallback,
  resetActiveWorkingModel,
} from "../../src/lib/shared/model.server";

describe("T10: Gemini Model Configuration & Fallback", () => {
  const originalEnv = process.env.GEMINI_MODEL;
  const originalApiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    resetActiveWorkingModel();
    delete process.env.GEMINI_MODEL;
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.GEMINI_MODEL = originalEnv;
    } else {
      delete process.env.GEMINI_MODEL;
    }
    if (originalApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  describe("Candidate List", () => {
    it("keeps gemini-2.5-flash as the primary candidate by default", () => {
      const candidates = getModelCandidates();
      expect(candidates[0]).toBe("gemini-2.5-flash");
    });

    it("does not contain obsolete gemini-1.5-flash or gemini-2.0-flash in defaults", () => {
      const candidates = getModelCandidates();
      expect(candidates).not.toContain("gemini-1.5-flash");
      expect(candidates).not.toContain("gemini-2.0-flash");
      expect(candidates).not.toContain("gemini-1.5-pro");
    });

    it("includes currently supported gemini-3.x and latest flash models as fallbacks", () => {
      const candidates = getModelCandidates();
      expect(candidates).toContain("gemini-3.6-flash");
      expect(candidates).toContain("gemini-3.5-flash");
      expect(candidates).toContain("gemini-flash-latest");
    });

    it("filters out obsolete models if specified in GEMINI_MODEL", () => {
      process.env.GEMINI_MODEL = "gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash";
      const candidates = getModelCandidates();
      expect(candidates[0]).toBe("gemini-2.5-flash");
      expect(candidates).not.toContain("gemini-1.5-flash");
      expect(candidates).not.toContain("gemini-2.0-flash");
      expect(candidates).toContain("gemini-3.6-flash");
    });

    it("ensures supported fallbacks are available after custom model", () => {
      process.env.GEMINI_MODEL = "custom-gemini-model";
      const candidates = getModelCandidates();
      expect(candidates[0]).toBe("custom-gemini-model");
      expect(candidates).toContain("gemini-3.6-flash");
    });
  });

  describe("Fallback Execution", () => {
    it("falls back to the next model when primary model is unavailable (e.g. no longer available)", async () => {
      const callLog: string[] = [];

      const { result, usedModel } = await withModelFallback(async (_model, modelId) => {
        callLog.push(modelId);
        if (modelId === "gemini-2.5-flash") {
          const err: any = new Error(
            "This model models/gemini-2.5-flash is no longer available to new users."
          );
          err.status = 404;
          throw err;
        }
        return "success-data";
      });

      expect(callLog).toEqual(["gemini-2.5-flash", "gemini-3.6-flash"]);
      expect(result).toBe("success-data");
      expect(usedModel).toBe("gemini-3.6-flash");
    });

    it("remembers the working model for subsequent calls to avoid repeating 404s", async () => {
      const callLog: string[] = [];

      // First call: gemini-2.5-flash fails, gemini-3.6-flash succeeds
      await withModelFallback(async (_model, modelId) => {
        callLog.push(modelId);
        if (modelId === "gemini-2.5-flash") {
          const err: any = new Error("models/gemini-2.5-flash not found");
          err.status = 404;
          throw err;
        }
        return "first";
      });

      expect(callLog).toEqual(["gemini-2.5-flash", "gemini-3.6-flash"]);

      // Second call: should immediately call gemini-3.6-flash
      callLog.length = 0;
      await withModelFallback(async (_model, modelId) => {
        callLog.push(modelId);
        return "second";
      });

      expect(callLog).toEqual(["gemini-3.6-flash"]);
    });

    it("does not fall through on rate limit errors (429)", async () => {
      const callLog: string[] = [];

      await expect(
        withModelFallback(async (_model, modelId) => {
          callLog.push(modelId);
          const err: any = new Error("Resource has been exhausted (e.g. check quota).");
          err.status = 429;
          throw err;
        })
      ).rejects.toThrow("Resource has been exhausted");

      // Should fail immediately on candidate #0 and not burn remaining models
      expect(callLog).toEqual(["gemini-2.5-flash"]);
    });
  });
});
