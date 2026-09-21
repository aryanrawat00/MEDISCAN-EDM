# MediScan V3 — Evidence-Locked Personal Health Information Assistant

> *"Understand your reports. Know your medicines."*  
> Principle: **Evidence first. AI second.** ("Don't just ask AI. Verify first.")

MediScan is a clinical-grade, evidence-locked personal health assistant built on TanStack Start, React 19, Tailwind CSS, Vite, and Google Gemini models. It provides deterministic, audit-traceable analysis of laboratory reports and over-the-counter / prescription medication packaging with tamper-proof verification.

---

## Key Modules & Features (V3)

### 1. 📄 Report Lens
- **Deterministic Extraction**: Extracts lab biomarkers, numeric values, units, and printed reference ranges from text reports, `.txt`, or text-layer PDFs.
- **Evidence Quote Locking**: Every extracted biomarker is mathematically verified against the raw text source with exact character quotes.
- **Deterministic Abnormality Calculation**: Categorizes results (Normal, High, Low, Critical) strictly against the report's printed reference range.
- **Verification Lab (Tamper Detection)**: Real-time integrity audit allowing interactive tampering experiments to demonstrate that unauthorized alterations immediately fail verification.

### 2. 💊 Medicine Lens
- **Packaging Analysis**: Inspects medicine labels, active ingredients, strengths, and warnings from photographs or direct text input.
- **Verified openFDA Monograph**: Automatically cross-references detected active ingredients against an official FDA OTC reference library.
- **Packaging Evidence Viewer**: Side-by-side inspection of raw input quotes against official monograph facts.

### 3. ⚠️ Drug-Drug Interaction Matrix
- **Evidence-Locked Interaction Checker**: Evaluates co-administered drugs against a clinically validated interaction dataset.
- **Severity Tiers**: Clearly classifies combinations as Severe, Moderate, or Mild with exact mechanism and patient guidance.

### 4. 📋 Doctor Visit Brief & Summary Export
- **Clinical Summary**: Prepares a consolidated doctor-ready briefing covering abnormal findings, current medications, and identified interactions.
- **Multi-Format Export**: One-click download of clinical summaries in Markdown, CSV, and JSON formats with verification integrity hashes.

---

## Quality & Test Coverage

MediScan V3 is backed by a comprehensive automated test suite:
- **13 Test Suites / 137 Automated Tests** (`npm test` via Vitest):
  - Lab report parser & biomarker extraction engine
  - Reference range normalization & abnormality calculations
  - Evidence verification & quote tampering guards
  - Medicine packaging parser & active ingredient lookup
  - Drug interaction engine & severity matrix
  - Multi-format summary export generation
  - PDF line-layer reconstruction & text extraction
- **Full TypeScript Strict Typechecking** (`npm run typecheck` via `tsc --noEmit`)
- **Nitro/Vite Production Build Verification** (`npm run build`)

---

## Getting Started

### 1. Prerequisites
- Node.js >= 20
- npm >= 10

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```
Key variables:
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (e.g. `gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash`)

### 3. Development Commands
```bash
# Start local development server
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Run test suite
npm test

# Build for production
npm run build
```

---

## Medical Safety Disclaimer
MediScan is for educational and informational purposes only. It does not provide medical diagnoses, prescribe medications, or recommend dosages. Always consult a qualified healthcare professional before making any medical decisions.