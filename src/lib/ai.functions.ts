import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const MODEL_ID = "gemini-2.5-flash";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your .env file (see .env.example).",
    );
  }
  const google = createGoogleGenerativeAI({ apiKey });
  return google(MODEL_ID);
}

const SAFETY_FOOTER =
  "Always remind the user this is educational information only and never a substitute for a qualified medical professional. Never give a definitive diagnosis.";

function stripJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fence ? fence[1] : text).trim();
}

async function generateJson<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
  const { text } = await generateText({
    model: getModel(),
    prompt,
    temperature: 0.3,
  });
  let raw: unknown;
  try {
    raw = JSON.parse(stripJson(text));
  } catch {
    throw new Error("The AI returned an unparseable response. Please try again.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("The AI response did not match the expected format.");
  }
  return parsed.data;
}

// ---------- Report analyzer ----------
export const reportSchema = z.object({
  summary: z.string(),
  key_findings: z.array(z.string()),
  abnormal_values: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      reference: z.string().optional(),
      note: z.string().optional(),
    }),
  ),
  recommendations: z.array(z.string()),
  red_flags: z.array(z.string()),
  disclaimer: z.string(),
});
export type ReportResult = z.infer<typeof reportSchema>;

const ReportInput = z.object({
  text: z.string().min(20).max(20000),
});

export const analyzeReport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ReportInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `You are an educational medical assistant. Analyze the following medical report text and return STRICT JSON only (no prose, no markdown fences) matching this TypeScript shape:

{
  "summary": string,
  "key_findings": string[],
  "abnormal_values": { "name": string, "value": string, "reference"?: string, "note"?: string }[],
  "recommendations": string[],
  "red_flags": string[],
  "disclaimer": string
}

${SAFETY_FOOTER}

REPORT:
"""
${data.text}
"""`;
    return await generateJson(prompt, reportSchema);
  });

// ---------- Symptom checker ----------
export const symptomSchema = z.object({
  summary: z.string(),
  possible_conditions: z.array(
    z.object({
      name: z.string(),
      likelihood: z.enum(["low", "moderate", "high"]),
      explanation: z.string(),
    }),
  ),
  self_care: z.array(z.string()),
  when_to_seek_care: z.array(z.string()),
  red_flags: z.array(z.string()),
  disclaimer: z.string(),
});
export type SymptomResult = z.infer<typeof symptomSchema>;

const SymptomInput = z.object({
  symptoms: z.string().min(5).max(4000),
  age: z.string().max(20).optional(),
  sex: z.string().max(20).optional(),
});

export const checkSymptoms = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SymptomInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `You are an educational medical assistant. The user describes symptoms. Return STRICT JSON only (no markdown fences) matching:

{
  "summary": string,
  "possible_conditions": { "name": string, "likelihood": "low"|"moderate"|"high", "explanation": string }[],
  "self_care": string[],
  "when_to_seek_care": string[],
  "red_flags": string[],
  "disclaimer": string
}

${SAFETY_FOOTER}

Patient context: age=${data.age ?? "unknown"}, sex=${data.sex ?? "unknown"}.
Symptoms:
"""
${data.symptoms}
"""`;
    return await generateJson(prompt, symptomSchema);
  });

// ---------- Medicine lookup ----------
export const medicineSchema = z.object({
  name: z.string(),
  generic_name: z.string().optional(),
  drug_class: z.string().optional(),
  uses: z.array(z.string()),
  typical_dosage: z.string(),
  common_side_effects: z.array(z.string()),
  serious_side_effects: z.array(z.string()),
  interactions: z.array(z.string()),
  warnings: z.array(z.string()),
  disclaimer: z.string(),
});
export type MedicineResult = z.infer<typeof medicineSchema>;

const MedicineInput = z.object({
  name: z.string().min(2).max(200),
});

export const lookupMedicine = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MedicineInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `You are an educational drug information assistant. Provide general, publicly known information about the medicine below. Return STRICT JSON only (no markdown fences) matching:

{
  "name": string,
  "generic_name"?: string,
  "drug_class"?: string,
  "uses": string[],
  "typical_dosage": string,
  "common_side_effects": string[],
  "serious_side_effects": string[],
  "interactions": string[],
  "warnings": string[],
  "disclaimer": string
}

${SAFETY_FOOTER}

Medicine: "${data.name}"`;
    return await generateJson(prompt, medicineSchema);
  });

