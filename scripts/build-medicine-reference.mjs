#!/usr/bin/env node
/**
 * scripts/build-medicine-reference.mjs
 * M01a: Standalone build script to fetch OTC drug labels from openFDA
 * and emit a typed reference snapshot for the Medicine Lens.
 *
 * Usage:
 *   node scripts/build-medicine-reference.mjs [--dry-run] [--help]
 *
 * Requirements:
 *   - OPENFDA_API_KEY in environment or .env
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

function showHelp() {
  console.log(`
MediScan Medicine Reference Builder (M01a)
Usage:
  node scripts/build-medicine-reference.mjs [options]

Options:
  --help        Show this help message
  --dry-run     Query sample or validate without writing file
  --sample      Use embedded offline sample data without needing OPENFDA_API_KEY

Environment variables:
  OPENFDA_API_KEY   Optional API key for openFDA (recommended to avoid rate limits)
`);
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.includes("--help")) {
  showHelp();
}

const isDryRun = args.includes("--dry-run");
const isSample = args.includes("--sample");

// Load .env if present
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env might not exist
  }
}

loadEnv();

const apiKey = process.env.OPENFDA_API_KEY;
if (!apiKey && !isSample && !isDryRun) {
  console.error("❌  OPENFDA_API_KEY is not set. Add it to .env or pass --sample to use offline sample data.");
  process.exit(1);
}

// Allow-list defined in Blueprint §12.2
export const ALLOW_LIST = [
  {
    key: "paracetamol",
    openfdaName: "ACETAMINOPHEN",
    displayName: "Paracetamol (acetaminophen)",
    aliases: ["acetaminophen", "tylenol", "crocin", "calpol", "dolo"],
    category: "Analgesic / Antipyretic",
  },
  {
    key: "ibuprofen",
    openfdaName: "IBUPROFEN",
    displayName: "Ibuprofen",
    aliases: ["advil", "motrin", "brufen"],
    category: "NSAID",
  },
  {
    key: "chlorpheniramine",
    openfdaName: "CHLORPHENIRAMINE MALEATE",
    displayName: "Chlorpheniramine",
    aliases: ["chlorpheniramine maleate", "cpm", "chlor-trimeton"],
    category: "Antihistamine (First generation)",
  },
  {
    key: "cetirizine",
    openfdaName: "CETIRIZINE HYDROCHLORIDE",
    displayName: "Cetirizine",
    aliases: ["cetirizine hydrochloride", "zyrtec", "cetzine"],
    category: "Antihistamine (Second generation)",
  },
  {
    key: "phenylephrine",
    openfdaName: "PHENYLEPHRINE HYDROCHLORIDE",
    displayName: "Phenylephrine",
    aliases: ["phenylephrine hydrochloride", "sudafed pe"],
    category: "Nasal Decongestant",
  },
  {
    key: "dextromethorphan",
    openfdaName: "DEXTROMETHORPHAN HYDROBROMIDE",
    displayName: "Dextromethorphan",
    aliases: ["dextromethorphan hydrobromide", "delsym", "benylin"],
    category: "Cough Suppressant (Antitussive)",
  },
];

function cleanExcerpt(text, maxLen = 800) {
  if (!text) return "";
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/["\\]/g, "")
    .trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen).trim() + "...";
}

async function fetchOpenFDALabel(item) {
  const url = `https://api.fda.gov/drug/label.json?search=openfda.substance_name.exact:"${encodeURIComponent(
    item.openfdaName
  )}"+AND+_exists_:indications_and_usage&limit=1${apiKey ? `&api_key=${apiKey}` : ""}`;

  console.log(`📡 Fetching openFDA label for ${item.key} (${item.openfdaName})...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${item.key}: HTTP ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) {
    throw new Error(`No results returned for ${item.key}`);
  }

  const setId = result.set_id || "unknown-set-id";
  const effectiveTime = result.effective_time || new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const purpose = Array.isArray(result.purpose) ? cleanExcerpt(result.purpose[0]) : null;

  const indications = Array.isArray(result.indications_and_usage)
    ? result.indications_and_usage.map((t) => cleanExcerpt(t)).filter(Boolean)
    : [];

  const safety = [];
  if (Array.isArray(result.warnings)) {
    safety.push(...result.warnings.map((t) => cleanExcerpt(t)));
  }
  if (Array.isArray(result.do_not_use)) {
    safety.push(...result.do_not_use.map((t) => cleanExcerpt(t)));
  }
  if (Array.isArray(result.ask_doctor)) {
    safety.push(...result.ask_doctor.map((t) => cleanExcerpt(t)));
  }
  if (Array.isArray(result.stop_use)) {
    safety.push(...result.stop_use.map((t) => cleanExcerpt(t)));
  }

  return {
    key: item.key,
    displayName: item.displayName,
    aliases: item.aliases,
    purposeText: purpose || item.category,
    commonUses: indications.length > 0 ? indications.slice(0, 3) : ["Relief of symptoms specified on package label."],
    importantSafety: safety.length > 0 ? safety.slice(0, 5) : ["Consult a doctor before use if you have existing health conditions."],
    source: {
      name: "U.S. FDA drug label (SPL) via openFDA",
      setId,
      effectiveTime,
      retrievedAt: new Date().toISOString().slice(0, 10),
      url: `https://api.fda.gov/drug/label.json?search=set_id:${setId}`,
      license: "CC0-1.0 (openFDA)",
    },
    review: {
      status: "PENDING",
      by: "build-script",
      at: new Date().toISOString().slice(0, 10),
    },
  };
}

async function main() {
  console.log(`Starting reference build for ${ALLOW_LIST.length} OTC ingredients...\n`);

  const entries = [];
  for (const item of ALLOW_LIST) {
    try {
      if (isSample) {
        entries.push({
          key: item.key,
          displayName: item.displayName,
          aliases: item.aliases,
          purposeText: item.category,
          commonUses: ["Temporarily relieves minor aches and pains or targeted symptoms as indicated on packaging."],
          importantSafety: [
            "Liver/kidney warning: Do not exceed recommended dosage.",
            "Ask a doctor before use if taking other medications.",
            "Stop use and ask a doctor if symptoms worsen or persist.",
          ],
          source: {
            name: "U.S. FDA drug label (SPL) via openFDA",
            setId: `sample-set-${item.key}`,
            effectiveTime: "20240101",
            retrievedAt: new Date().toISOString().slice(0, 10),
            url: "https://open.fda.gov/apis/drug/label/",
            license: "CC0-1.0 (openFDA)",
          },
          review: {
            status: "PENDING",
            by: "offline-sample",
            at: new Date().toISOString().slice(0, 10),
          },
        });
      } else {
        const entry = await fetchOpenFDALabel(item);
        entries.push(entry);
      }
    } catch (err) {
      console.warn(`⚠️ Warning for ${item.key}: ${err.message}`);
    }
  }

  const fileContent = `/**
 * src/lib/medicine/reference.data.ts
 * Autogenerated snapshot of official OTC label information from openFDA.
 * Generated: ${new Date().toISOString()}
 *
 * NOTE: Entries are marked PENDING until reviewed and approved by human reviewer.
 */

export interface MedicineReferenceEntry {
  key: string;
  displayName: string;
  aliases: string[];
  purposeText: string | null;
  commonUses: string[];
  importantSafety: string[];
  source: {
    name: string;
    setId: string;
    effectiveTime: string;
    retrievedAt: string;
    url: string;
    license: string;
  };
  review: {
    status: "PENDING" | "APPROVED";
    by: string;
    at: string;
  };
}

export const MEDICINE_REFERENCE_DATA: MedicineReferenceEntry[] = ${JSON.stringify(entries, null, 2)};
`;

  if (isDryRun) {
    console.log("\n[DRY RUN] Generated reference data:\n");
    console.log(fileContent.slice(0, 800) + "\n... (truncated)");
    console.log(`\n✅ Dry run completed. ${entries.length} entries generated.`);
    return;
  }

  const targetPath = resolve(process.cwd(), "src/lib/medicine/reference.data.ts");
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, fileContent, "utf-8");
  console.log(`\n✅ Successfully generated reference data: ${targetPath}`);
}

main().catch((err) => {
  console.error("Fatal error during build:", err);
  process.exit(1);
});
