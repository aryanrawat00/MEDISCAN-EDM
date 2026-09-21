#!/usr/bin/env node
/**
 * scripts/check-model.mjs
 * T00: Try each GEMINI_MODEL candidate and report which ones respond.
 *
 * Usage:
 *   node scripts/check-model.mjs
 *
 * Reads GEMINI_API_KEY and GEMINI_MODEL (comma-separated candidates) from .env.
 * Falls back to a built-in list if GEMINI_MODEL is not set.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ── Load .env manually (no dotenv dependency) ───────────────
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
    // .env might not exist yet
  }
}

loadEnv();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌  GEMINI_API_KEY is not set. Add it to .env (see .env.example).");
  process.exit(1);
}

const DEFAULT_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

const candidates = process.env.GEMINI_MODEL
  ? process.env.GEMINI_MODEL.split(",").map((s) => s.trim()).filter(Boolean)
  : DEFAULT_CANDIDATES;

console.log(`\n🔍  Checking ${candidates.length} Gemini model candidate(s)…\n`);

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function probe(model) {
  const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: "Reply with exactly: OK" }] }],
    generationConfig: { maxOutputTokens: 8, temperature: 0 },
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { model, ok: false, reason: err?.error?.message ?? `HTTP ${res.status}` };
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { model, ok: true, reply: text.trim() };
  } catch (e) {
    return { model, ok: false, reason: e.message };
  }
}

let chosen = null;

for (const model of candidates) {
  const result = await probe(model);
  if (result.ok) {
    console.log(`  ✅  ${model}  →  "${result.reply}"`);
    if (!chosen) chosen = model;
  } else {
    console.log(`  ❌  ${model}  →  ${result.reason}`);
  }
}

console.log();
if (chosen) {
  console.log(`🎯  Recommended GEMINI_MODEL=${chosen}`);
  console.log(`    (first candidate that responded)\n`);
} else {
  console.error("⚠️   No model responded. Check your API key and network.\n");
  process.exit(1);
}
