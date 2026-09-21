/**
 * src/lib/report/summaryExport.ts
 * T20b: Doctor / Patient Visit Summary Exporter.
 * Pure deterministic formatting for appointment preparation, printing, and sharing.
 * "Evidence first. AI second. Code decides."
 */

import { DoctorBrief, BriefRow } from "./types";

export type SummaryViewMode = "doctor" | "patient";

export interface SummaryExportOptions {
  mode?: SummaryViewMode;
  reportName?: string;
  patientName?: string;
  sourceFileName?: string;
  verificationId?: string;
  evidenceFingerprint?: string;
}

/**
 * Formats a DoctorBrief into a clean, appointment-ready plain text document.
 */
export function generatePlaintextSummary(
  brief: DoctorBrief,
  options: SummaryExportOptions = {},
): string {
  const mode = options.mode ?? "doctor";
  const reportTitle = options.reportName || "Laboratory Diagnostic Report";
  const dateStr = new Date(brief.generatedAt).toLocaleDateString();
  const divider = "------------------------------------------------------------";

  const lines: string[] = [];

  if (mode === "doctor") {
    lines.push("MEDISCAN — CLINICAL DOCTOR VISIT BRIEF");
    lines.push("Evidence-Locked Patient Consultation Summary");
    lines.push(divider);
    if (options.verificationId) {
      lines.push(`Verification ID: ${options.verificationId}`);
    }
    if (options.evidenceFingerprint) {
      lines.push(`Integrity Fingerprint: ${options.evidenceFingerprint}`);
    }
    lines.push(`Report: ${reportTitle}`);
    if (options.sourceFileName) lines.push(`Source File: ${options.sourceFileName}`);
    lines.push(`Generated: ${dateStr}`);
    lines.push(
      `Counts: ${brief.overview.counts.verified} Verified | ${brief.overview.counts.flagged} Flagged | ${brief.overview.counts.unverified} Unverified`,
    );
    lines.push(divider);

    if (brief.criticalBanner) {
      lines.push("CRITICAL LABORATORY ALERT NOTICE:");
      lines.push("One or more tests contain critical or panic laboratory flags.");
      lines.push("Immediate clinical review is advised.");
      lines.push(divider);
    }

    lines.push("REPORT OVERVIEW:");
    lines.push(brief.overview.text);
    lines.push("");

    if (brief.keyFindings.length > 0) {
      lines.push("KEY CLINICAL FINDINGS (OUT-OF-RANGE):");
      for (const kf of brief.keyFindings) {
        lines.push(`• ${kf.sentence}`);
      }
      lines.push("");
    }

    if (brief.flagged.length > 0) {
      lines.push("FLAGGED PARAMETERS SUMMARY TABLE:");
      lines.push(
        formatTableRow("TEST", "RESULT", "REF RANGE", "STATUS", "PAGE"),
      );
      lines.push(
        formatTableRow("----", "------", "---------", "------", "----"),
      );
      for (const row of brief.flagged) {
        const valWithUnit = `${row.valueText} ${row.unit ?? ""}`.trim();
        const refRange = row.referenceRangeText ?? "Not listed";
        const pageText = row.page ? `p.${row.page}` : "—";
        lines.push(
          formatTableRow(row.testName, valWithUnit, refRange, row.status, pageText),
        );
      }
      lines.push("");
    }

    if (brief.questions.length > 0) {
      lines.push("QUESTIONS TO DISCUSS WITH YOUR CLINICIAN:");
      for (let i = 0; i < brief.questions.length; i++) {
        lines.push(`${i + 1}. ${brief.questions[i].text}`);
      }
      lines.push("");
    }

    if (brief.couldNotVerify.length > 0) {
      lines.push("UNVERIFIED LINES (OMITTED FOR SAFETY):");
      for (const uv of brief.couldNotVerify) {
        lines.push(`• ${uv.testName}: ${uv.reason}`);
      }
      lines.push("");
    }

    lines.push(divider);
    lines.push("MEDICAL DISCLAIMER & VERIFICATION:");
    lines.push(
      "Evidence-Locked Personal Health Information Assistant (MediScan AI).",
    );
    lines.push(brief.disclaimer);
  } else {
    // Patient-friendly mode
    lines.push("MEDISCAN — PATIENT HEALTH VISIT SUMMARY");
    lines.push("Personal Appointment Preparation Summary");
    lines.push(divider);
    lines.push(`Report: ${reportTitle}`);
    lines.push(`Date Prepared: ${dateStr}`);
    lines.push(divider);

    lines.push("WHAT YOUR REPORT SHOWS:");
    lines.push(brief.overview.text);
    lines.push("");

    if (brief.keyFindings.length > 0) {
      lines.push("RESULTS OUTSIDE NORMAL LAB RANGES:");
      for (const kf of brief.keyFindings) {
        lines.push(`• ${kf.sentence}`);
      }
      lines.push("");
    } else {
      lines.push("RESULTS OVERVIEW:");
      lines.push("All verified tests fall within the laboratory's printed normal ranges.");
      lines.push("");
    }

    if (brief.questions.length > 0) {
      lines.push("HELPFUL QUESTIONS TO ASK YOUR DOCTOR:");
      for (let i = 0; i < brief.questions.length; i++) {
        lines.push(`${i + 1}. ${brief.questions[i].text}`);
      }
      lines.push("");
    }

    lines.push(divider);
    lines.push("IMPORTANT REMINDER:");
    lines.push(
      "This summary is for educational discussion with your doctor. It does not replace medical diagnosis, treatment, or professional clinical evaluation.",
    );
  }

  return lines.join("\n");
}

function formatTableRow(
  c1: string,
  c2: string,
  c3: string,
  c4: string,
  c5: string,
): string {
  return `${c1.padEnd(20)} ${c2.padEnd(16)} ${c3.padEnd(18)} ${c4.padEnd(10)} ${c5}`;
}

/**
 * Downloads text or markdown summary as a file via native browser Blob.
 */
export function downloadSummaryFile(
  content: string,
  fileName: string = "mediscan-visit-summary.txt",
): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies summary text to the user clipboard safely with fallback.
 */
export async function copySummaryToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn("Clipboard write failed:", err);
    return false;
  }
}

export interface VerifiedFindingEvidenceItem {
  testName: string;
  valueText: string;
  referenceRangeText?: string | null;
  status: string;
  quote?: string;
  rule?: string;
  page?: number | null;
  verified?: boolean;
}

/**
 * Formats a comprehensive Shareable Verified Summary strictly highlighting
 * evidence verification locks, rules applied, and clinician discussion points.
 */
export function generateShareableVerifiedSummary(
  brief: DoctorBrief,
  options: SummaryExportOptions & {
    findingsWithEvidence?: VerifiedFindingEvidenceItem[];
  } = {},
): string {
  const reportTitle = options.reportName || "Laboratory Diagnostic Report";
  const dateStr = new Date(brief.generatedAt).toLocaleDateString();
  const verificationId = options.verificationId || "MS-VERIFIED";
  const divider = "============================================================";
  const subDivider = "------------------------------------------------------------";

  const lines: string[] = [];

  lines.push("MEDISCAN — VERIFIED ANALYSIS SUMMARY");
  lines.push("Evidence-First Health Document Verification");
  lines.push(divider);
  lines.push(`Verification ID: ${verificationId}`);
  if (options.evidenceFingerprint) {
    lines.push(`Integrity Fingerprint: ${options.evidenceFingerprint}`);
  }
  lines.push(`Report: ${reportTitle}`);
  lines.push(`Analysis Date: ${dateStr}`);
  lines.push(subDivider);

  // Key Findings
  lines.push("KEY FINDINGS:");
  if (brief.keyFindings.length > 0) {
    for (const kf of brief.keyFindings) {
      lines.push(`• ${kf.sentence}`);
    }
  } else {
    lines.push("• All verified parameters fall within printed reference intervals.");
  }
  lines.push("");

  // Evidence Verification Section
  lines.push("EVIDENCE VERIFICATION AUDIT:");
  const items = options.findingsWithEvidence || brief.flagged.map((f) => ({
    testName: f.testName,
    valueText: f.valueText,
    referenceRangeText: f.referenceRangeText,
    status: f.status,
    quote: undefined,
    rule: `Value relative to reference range (${f.referenceRangeText ?? "printed range"})`,
    page: f.page,
    verified: true,
  }));

  if (items.length > 0) {
    for (const item of items) {
      const statusIcon = item.verified !== false ? "✓" : "✗";
      const statusText = item.verified !== false ? "Evidence verified" : "Evidence unverified";
      lines.push(`${statusIcon} ${item.testName}: ${statusText}`);
      if (item.quote) {
        lines.push(`  Evidence: "${item.quote}"${item.page ? ` (Page ${item.page})` : ""}`);
      }
      if (item.rule) {
        lines.push(`  Rule: ${item.rule}`);
      }
    }
  } else {
    lines.push("✓ All findings verified against original document source text.");
  }
  lines.push("");

  // Doctor Discussion Points
  if (brief.questions.length > 0) {
    lines.push("DOCTOR DISCUSSION POINTS:");
    for (let i = 0; i < brief.questions.length; i++) {
      lines.push(`${i + 1}. ${brief.questions[i].text}`);
    }
    lines.push("");
  }

  // Medical Disclaimer
  lines.push(subDivider);
  lines.push("MEDICAL DISCLAIMER:");
  lines.push(brief.disclaimer);
  lines.push(
    "MediScan provides educational reference information derived through deterministic rule execution and verbatim evidence locking. It does not provide clinical diagnosis or medical treatment advice.",
  );

  return lines.join("\n");
}

