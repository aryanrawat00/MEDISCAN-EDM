/**
 * src/lib/report/verificationId.ts
 * Deterministic Verification ID & Non-Sensitive Evidence Fingerprint Generator.
 * "Evidence first. Zero PII. Deterministic integrity verification."
 */

/**
 * Generates an 8-character non-sensitive deterministic verification identifier.
 * Format: MS-XXXXXXXX (e.g., MS-8F42B109)
 * Strictly contains NO patient names, emails, auth tokens, or private medical data.
 */
export function generateVerificationId(options: {
  timestamp?: string;
  findingsCount?: number;
  reportTitle?: string;
  seed?: string;
} = {}): string {
  const base = [
    options.reportTitle?.trim().toLowerCase() || "report",
    options.findingsCount ?? 0,
    options.timestamp ? new Date(options.timestamp).toDateString() : "active",
    options.seed || "mediscan",
  ].join(":");

  // Compute deterministic 32-bit FNV-1a hash
  let hash = 2166136261;
  for (let i = 0; i < base.length; i++) {
    hash ^= base.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  // Convert to 8-character uppercase hexadecimal
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
  return `MS-${hex}`;
}

/**
 * Generates an evidence integrity fingerprint from non-sensitive finding attributes.
 * Strictly hashes only: testName, valueText, status, and quote.
 * Never includes patient identifying data or auth tokens.
 */
export function generateEvidenceFingerprint(
  findings: Array<{
    testName: string;
    valueText: string;
    status: string;
    quote?: string;
  }>,
): string {
  if (!findings || findings.length === 0) {
    return "fp:0000000000000000";
  }

  const serialized = findings
    .map(
      (f) =>
        `${f.testName.toLowerCase().trim()}|${f.valueText.trim()}|${f.status}|${(f.quote || "").trim()}`,
    )
    .sort()
    .join(";;");

  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < serialized.length; i++) {
    const ch = serialized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");

  return `fp:${hex1}${hex2}`;
}

/**
 * Derives a human-readable description of the exact deterministic rule applied to a finding.
 */
export function deriveRuleAppliedText(
  statusReason: string,
  finding: {
    value?: number | null;
    valueText?: string;
    range?: { low?: number | null; high?: number | null } | null;
    referenceRangeText?: string | null;
  },
): string {
  const val = finding.valueText ?? (finding.value !== undefined && finding.value !== null ? String(finding.value) : "");
  const low = finding.range?.low !== undefined && finding.range?.low !== null ? String(finding.range.low) : null;
  const high = finding.range?.high !== undefined && finding.range?.high !== null ? String(finding.range.high) : null;

  switch (statusReason) {
    case "BELOW_LOWER_BOUND":
      return low !== null
        ? `Value (${val}) < lower reference boundary (${low})`
        : `Value (${val}) is below printed reference boundary`;
    case "ABOVE_UPPER_BOUND":
      return high !== null
        ? `Value (${val}) > upper reference boundary (${high})`
        : `Value (${val}) is above printed reference boundary`;
    case "WITHIN_RANGE":
      if (low !== null && high !== null) {
        return `Lower boundary (${low}) ≤ Value (${val}) ≤ Upper boundary (${high})`;
      }
      return `Value (${val}) falls strictly within the printed normal interval`;
    case "NO_RANGE":
      return "No numerical reference interval printed by laboratory on report row";
    case "RANGE_UNVERIFIED":
      return "Reference interval present on row but not verified verbatim in source text";
    case "EVIDENCE_UNVERIFIED":
      return "Measurement could not be anchored to verbatim source quote";
    default:
      return `Deterministic rule evaluated: ${statusReason.replace(/_/g, " ").toLowerCase()}`;
  }
}
