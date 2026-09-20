/**
 * src/lib/shared/guards.ts
 * T18: Medical Safety and Content Guardrails (Blueprint §20).
 * Validates AI-generated prose against banned diagnostic and prescriptive phrases.
 * Enforces principle: "Evidence first. AI second."
 */

export const BANNED_DIAGNOSTIC_PATTERNS = [
  /\byou (?:have|suffer from|are diagnosed with)\b/i,
  /\bdiagnos(?:is|ed|ing) is\b/i,
  /\bdefinitive diagnosis\b/i,
  /\bwe diagnose\b/i,
];

export const BANNED_PRESCRIPTIVE_PATTERNS = [
  /\b(?:take|ingest|consume)\s+\d+\s*(?:mg|g|ml|tablets?|capsules?|pills?)\b/i,
  /\bstop (?:taking|using)\s+(?:your\s+)?(?:medication|medicine|pills?)\b/i,
  /\byou should take\b/i,
  /\byou must take\b/i,
  /\bincrease your dose\b/i,
  /\bdecrease your dose\b/i,
  /\bprescribe\b/i,
];

export interface GuardResult {
  passed: boolean;
  sanitized: string;
  violations: string[];
}

/**
 * Sanitizes and guards AI prose against forbidden diagnostic/prescriptive claims.
 */
export function guardAiProse(prose: string): GuardResult {
  if (!prose) {
    return { passed: true, sanitized: "", violations: [] };
  }

  const violations: string[] = [];

  for (const pattern of BANNED_DIAGNOSTIC_PATTERNS) {
    if (pattern.test(prose)) {
      violations.push(`Diagnostic statement detected matching ${pattern}`);
    }
  }

  for (const pattern of BANNED_PRESCRIPTIVE_PATTERNS) {
    if (pattern.test(prose)) {
      violations.push(`Prescriptive dosing advice detected matching ${pattern}`);
    }
  }

  if (violations.length > 0) {
    return {
      passed: false,
      sanitized:
        "Clinical note withheld: Please consult with your physician regarding diagnosis and treatment.",
      violations,
    };
  }

  return {
    passed: true,
    sanitized: prose.trim(),
    violations: [],
  };
}
