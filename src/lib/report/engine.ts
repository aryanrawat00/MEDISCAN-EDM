/**
 * src/lib/report/engine.ts
 * T07: Deterministic Report Engine (Blueprint §10).
 * Pure TypeScript. Calculates finding status (LOW / NORMAL / HIGH / UNKNOWN)
 * strictly using the printed reference range from the medical report.
 * Reproduces test vectors V01 through V62.
 */

import {
  Status,
  StatusReason,
  FindingValue,
  FindingRange,
  LabFlagAgreement,
} from "./types";
import { normalizeString } from "../shared/normalize";
import { unitsAreCompatible } from "./units";

/**
 * Parses numeric or qualitative value text as printed on the report.
 */
export function parseValue(text: string): FindingValue {
  if (!text || !text.trim()) {
    return { kind: "invalid" };
  }

  const raw = text.trim();
  const lower = raw.toLowerCase();

  // Check for NaN or Infinity tokens
  if (lower === "nan" || lower === "infinity" || lower === "+infinity" || lower === "-infinity") {
    return { kind: "text", token: lower };
  }

  // Check qualitative tokens
  const QUALITATIVE_WORDS = [
    "negative",
    "positive",
    "non-reactive",
    "non reactive",
    "reactive",
    "normal",
    "trace",
    "nil",
    "absent",
    "present",
  ];

  const norm = normalizeString(raw);
  if (QUALITATIVE_WORDS.includes(norm)) {
    return { kind: "text", token: norm };
  }

  // Check if multiple decimals (e.g. "1.2.3")
  const dotCount = (raw.match(/\./g) || []).length;
  if (dotCount > 1) {
    return { kind: "invalid" };
  }

  // Match optional operator and number with thousands separators
  const opNumMatch = raw.match(/^([<>≤≥]=?|<=|>=)?\s*([+-]?[0-9][0-9,]*\.?[0-9]*)$/);
  if (!opNumMatch) {
    // If letters and no digits, treat as text token
    if (/^[a-zA-Z\s-]+$/.test(raw)) {
      return { kind: "text", token: norm };
    }
    return { kind: "invalid" };
  }

  const rawOp = opNumMatch[1] || "";
  const numStr = opNumMatch[2].replace(/,/g, "");
  const n = parseFloat(numStr);

  if (isNaN(n) || !isFinite(n)) {
    return { kind: "invalid" };
  }

  let op: null | "<" | "<=" | ">" | ">=" = null;
  if (rawOp === "<" || rawOp === "Below") op = "<";
  else if (rawOp === "<=" || rawOp === "≤" || rawOp === "Up to") op = "<=";
  else if (rawOp === ">") op = ">";
  else if (rawOp === ">=" || rawOp === "≥") op = ">=";

  return { kind: "numeric", op, n };
}

/**
 * Parses reference range text as printed on the report.
 */
export function parseRange(text: string | null | undefined): FindingRange {
  if (!text || !text.trim()) {
    return { kind: "none" };
  }

  let raw = text.trim();

  // Strip leading label wrappers
  raw = raw
    .replace(/^(?:reference\s*range|reference|normal|desirable|optimal|ref|range)\s*[:：\-]?\s*/i, "")
    .trim();

  // Strip outer matching parentheses e.g. (12.0 - 15.0)
  if (raw.startsWith("(") && raw.endsWith(")")) {
    raw = raw.slice(1, -1).trim();
  }

  // Check for sex-specific ranges
  if (/\b(?:male|female|m|f)\s*[:：]/i.test(raw) || (/\bmale\b/i.test(raw) && /\bfemale\b/i.test(raw))) {
    return { kind: "invalid", reason: "SEX_SPECIFIC_RANGE" };
  }

  // Strip trailing parenthetical labels without digits, e.g. "(Adult)"
  raw = raw.replace(/\([a-zA-Z\s]+\)$/, "").trim();

  // Check multi-band interpretive ranges (e.g. Desirable: <200 Borderline: 200-239 High: >=240)
  // Remove unit power-of-ten and attached units before checking digits (V33, V59)
  const withoutUnitDigits = raw
    .replace(/(?:x?10\^[0-9]+|10\^[0-9]+|\bmm3\b|\bcmm\b|\bcm2\b)/gi, "");

  const numericTokens = withoutUnitDigits.match(/[+-]?[0-9][0-9,]*\.?[0-9]*/g) || [];
  if (numericTokens.length > 2) {
    return { kind: "multi", reason: "MULTI_BAND_RANGE" };
  }

  // Check qualitative reference
  const norm = normalizeString(raw);
  const QUALITATIVE_WORDS = [
    "negative",
    "positive",
    "non-reactive",
    "non reactive",
    "reactive",
    "normal",
    "trace",
    "nil",
    "absent",
    "present",
  ];
  if (QUALITATIVE_WORDS.includes(norm)) {
    return { kind: "text", token: norm };
  }

  // Match one-sided ranges: e.g. "< 200", "<= 200", "≤ 200", "Below 200", "Up to 5.6", "> 40", ">= 40", "≥ 40"
  const oneSidedMatch = raw.match(/^(<|<=|≤|>|>=|≥|below|up\s*to)\s*([+-]?[0-9][0-9,]*\.?[0-9]*)\s*(.*)$/i);
  if (oneSidedMatch) {
    const opStr = oneSidedMatch[1].toLowerCase();
    const num = parseFloat(oneSidedMatch[2].replace(/,/g, ""));
    const unit = oneSidedMatch[3].trim() || undefined;

    if (opStr === "<" || opStr === "below") {
      return {
        kind: "interval",
        lo: null,
        hi: { n: num, closed: false },
        unit,
      };
    }
    if (opStr === "<=" || opStr === "≤" || opStr.startsWith("up")) {
      return {
        kind: "interval",
        lo: null,
        hi: { n: num, closed: true },
        unit,
      };
    }
    if (opStr === ">") {
      return {
        kind: "interval",
        lo: { n: num, closed: false },
        hi: null,
        unit,
      };
    }
    if (opStr === ">=" || opStr === "≥") {
      return {
        kind: "interval",
        lo: { n: num, closed: true },
        hi: null,
        unit,
      };
    }
  }

  // Match two-sided interval: [lo] [sep] [hi] [optional unit]
  // Handles dashes (-, –, —) and "to"
  const intervalMatch = raw.match(
    /^([+-]?[0-9][0-9,]*\.?[0-9]*)\s*(?:-|–|—|to)\s*([+-]?[0-9][0-9,]*\.?[0-9]*)\s*(.*)$/i
  );

  if (intervalMatch) {
    const lo = parseFloat(intervalMatch[1].replace(/,/g, ""));
    const hi = parseFloat(intervalMatch[2].replace(/,/g, ""));
    const unit = intervalMatch[3].trim() || undefined;

    if (lo > hi) {
      return { kind: "invalid", reason: "INVALID_RANGE" };
    }

    return {
      kind: "interval",
      lo: { n: lo, closed: true },
      hi: { n: hi, closed: true },
      unit,
    };
  }

  // If text without interval, return text token
  return { kind: "text", token: raw };
}

/**
 * Deterministically classifies a finding based strictly on printed report evidence.
 */
export function classifyFinding(input: {
  valueText: string;
  unit: string | null;
  rangeText: string | null;
  valueVerified: boolean;
  rangeVerified: boolean;
}): {
  status: Status;
  reason: StatusReason;
  attention: boolean;
  trace: string[];
} {
  const trace: string[] = [];

  // Gating rule 1: Evidence verification required
  if (!input.valueVerified) {
    trace.push("Value is not verified in source quote");
    return {
      status: "UNKNOWN",
      reason: "EVIDENCE_UNVERIFIED",
      attention: false,
      trace,
    };
  }

  const parsedVal = parseValue(input.valueText);
  const parsedRange = parseRange(input.rangeText);

  // Range absence check
  if (parsedRange.kind === "none") {
    trace.push("No reference range printed on report row");
    return {
      status: "UNKNOWN",
      reason: "NO_RANGE",
      attention: false,
      trace,
    };
  }

  // Gating rule 2: Range verification required
  if (!input.rangeVerified) {
    trace.push("Reference range is not verified in source quote");
    return {
      status: "UNKNOWN",
      reason: "RANGE_UNVERIFIED",
      attention: false,
      trace,
    };
  }

  // Range validity check
  if (parsedRange.kind === "invalid") {
    const reason = (parsedRange.reason as StatusReason) || "INVALID_RANGE";
    trace.push(`Reference range is invalid: ${reason}`);
    return { status: "UNKNOWN", reason, attention: false, trace };
  }
  if (parsedRange.kind === "multi") {
    trace.push("Reference range contains multiple interpretive bands");
    return {
      status: "UNKNOWN",
      reason: "MULTI_BAND_RANGE",
      attention: false,
      trace,
    };
  }

  // Value validity check
  if (parsedVal.kind === "invalid") {
    trace.push("Value text is malformed or invalid");
    return {
      status: "UNKNOWN",
      reason: "INVALID_VALUE",
      attention: false,
      trace,
    };
  }

  // Unit compatibility check
  if (parsedRange.kind === "interval" && parsedRange.unit) {
    if (!unitsAreCompatible(input.unit, parsedRange.unit)) {
      trace.push(`Unit mismatch: '${input.unit}' vs '${parsedRange.unit}'`);
      return {
        status: "UNKNOWN",
        reason: "UNIT_MISMATCH",
        attention: false,
        trace,
      };
    }
  }

  // Qualitative comparisons
  if (parsedVal.kind === "text") {
    if (parsedRange.kind === "interval") {
      trace.push("Text value given for numeric interval range");
      return {
        status: "UNKNOWN",
        reason: "NON_NUMERIC_VALUE",
        attention: false,
        trace,
      };
    }

    if (parsedRange.kind === "text") {
      const vToken = parsedVal.token.replace(/[-\s]+/g, " ").trim();
      const rToken = parsedRange.token.replace(/[-\s]+/g, " ").trim();
      if (vToken === rToken) {
        trace.push(`Qualitative match: '${vToken}' equals reference '${rToken}'`);
        return {
          status: "NORMAL",
          reason: "QUALITATIVE_MATCH",
          attention: false,
          trace,
        };
      } else {
        trace.push(`Qualitative difference: '${vToken}' differs from reference '${rToken}'`);
        return {
          status: "UNKNOWN",
          reason: "QUALITATIVE_DIFFERS_FROM_REFERENCE",
          attention: true,
          trace,
        };
      }
    }
  }

  // Numeric value with text range
  if (parsedVal.kind === "numeric" && parsedRange.kind === "text") {
    trace.push(`Numeric value '${input.valueText}' cannot be compared to text range '${parsedRange.token}'`);
    return {
      status: "UNKNOWN",
      reason: "TYPE_MISMATCH",
      attention: false,
      trace,
    };
  }

  // Numeric comparisons against interval
  if (parsedVal.kind === "numeric" && parsedRange.kind === "interval") {
    const v = parsedVal.n;
    const op = parsedVal.op;
    const lo = parsedRange.lo;
    const hi = parsedRange.hi;

    // Exact value [v, v]
    if (op === null) {
      if (lo && (v < lo.n || (!lo.closed && v === lo.n))) {
        trace.push(`Value ${v} is below lower bound ${lo.n}`);
        return {
          status: "LOW",
          reason: "BELOW_LOWER_BOUND",
          attention: true,
          trace,
        };
      }
      if (hi && (v > hi.n || (!hi.closed && v === hi.n))) {
        trace.push(`Value ${v} is above upper bound ${hi.n}`);
        return {
          status: "HIGH",
          reason: "ABOVE_UPPER_BOUND",
          attention: true,
          trace,
        };
      }
      trace.push(`Value ${v} is within reference bounds`);
      return {
        status: "NORMAL",
        reason: "WITHIN_RANGE",
        attention: false,
        trace,
      };
    }

    // Qualified values: < x, <= x
    if (op === "<" || op === "<=") {
      // Detection-limit clamp: if range lower bound is exactly 0, treat value as [0, v)
      const isClamped = lo && lo.n === 0;
      const effectiveLo = isClamped ? 0 : -Infinity;

      // If upper bound of value is below range lower bound:
      if (lo && v <= lo.n) {
        trace.push(`Value <${v} is below lower bound ${lo.n}`);
        return {
          status: "LOW",
          reason: "BELOW_LOWER_BOUND",
          attention: true,
          trace,
        };
      }

      // If value could be below lower bound because lower bound > effectiveLo:
      if (lo && effectiveLo < lo.n && v > lo.n) {
        trace.push(`Value <${v} straddles lower bound ${lo.n}`);
        return {
          status: "UNKNOWN",
          reason: "AMBIGUOUS_INTERVAL",
          attention: false,
          trace,
        };
      }

      // If value is within range:
      if (hi && (v < hi.n || (op === "<=" && v <= hi.n))) {
        trace.push(`Value ${op}${v} is within upper bound ${hi.n}`);
        return {
          status: "NORMAL",
          reason: "WITHIN_RANGE",
          attention: false,
          trace,
        };
      }

      trace.push(`Value ${op}${v} interval is ambiguous`);
      return {
        status: "UNKNOWN",
        reason: "AMBIGUOUS_INTERVAL",
        attention: false,
        trace,
      };
    }

    // Qualified values: > x, >= x
    if (op === ">" || op === ">=") {
      if (hi && v >= hi.n) {
        trace.push(`Value ${op}${v} is above upper bound ${hi.n}`);
        return {
          status: "HIGH",
          reason: "ABOVE_UPPER_BOUND",
          attention: true,
          trace,
        };
      }

      if (hi && v < hi.n) {
        trace.push(`Value ${op}${v} straddles upper bound ${hi.n}`);
        return {
          status: "UNKNOWN",
          reason: "AMBIGUOUS_INTERVAL",
          attention: false,
          trace,
        };
      }
    }
  }

  return {
    status: "UNKNOWN",
    reason: "AMBIGUOUS_INTERVAL",
    attention: false,
    trace,
  };
}

/**
 * Compares printed lab flag against computed status.
 */
export function compareLabFlag(
  labFlag: string | null | undefined,
  status: Status,
): LabFlagAgreement {
  if (!labFlag || !labFlag.trim()) {
    return "NOT_PROVIDED";
  }

  if (status === "UNKNOWN") {
    return "NOT_COMPARABLE";
  }

  const norm = labFlag.trim().toUpperCase();

  const isHighFlag =
    norm === "H" ||
    norm === "HH" ||
    norm === "HIGH" ||
    norm.includes("CRITICAL HIGH") ||
    norm === "*H" ||
    norm === "▲";

  const isLowFlag =
    norm === "L" ||
    norm === "LL" ||
    norm === "LOW" ||
    norm.includes("CRITICAL LOW") ||
    norm === "*L" ||
    norm === "▼";

  const isNormalFlag = norm === "N" || norm === "NORMAL";

  if (isHighFlag) {
    return status === "HIGH" ? "AGREES" : "DISAGREES";
  }
  if (isLowFlag) {
    return status === "LOW" ? "AGREES" : "DISAGREES";
  }
  if (isNormalFlag) {
    return status === "NORMAL" ? "AGREES" : "DISAGREES";
  }

  return "NOT_COMPARABLE";
}
