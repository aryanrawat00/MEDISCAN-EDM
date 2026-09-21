# MediScan V3 — Evidence-Locked Personal Health Information Assistant

> *"Understand your reports. Know your medicines."*  
> **Core Principle: Evidence first. AI second.** ("Don't just ask AI. Verify first.")

MediScan is a clinical-grade, evidence-locked personal health intelligence application. It delivers deterministic, audit-traceable analysis of laboratory medical reports and medication packaging using cryptographic evidence locking, reference range grounding, and official openFDA monograph cross-referencing.

---

## 🌟 Core Pillars

1. **Evidence First, AI Second**: AI models assist with text extraction and plain-language synthesis, but all clinical biomarkers, numerical values, abnormality ranges, and medication warnings are strictly bound to verbatim source quotes.
2. **Zero-PII Integrity**: Verification IDs and evidence fingerprints are computed without storing or transmitting Personally Identifiable Information (PII) or protected medical records.
3. **Deterministic Range Abnormality**: Lab abnormalities (Normal, High, Low, Critical) are computed deterministically against the printed reference range on the patient's actual lab report—never arbitrary global defaults.
4. **Verified Drug Safety**: Active ingredients and safety warnings are cross-referenced with official openFDA OTC monograph snapshots and validated interaction matrices.

---

## 🩺 Key Modules & Features (V3)

### 1. 📄 Report Lens
* **Deterministic Biomarker Extraction**: Parses lab tests, numerical values, units, and printed reference intervals from pasted text, raw `.txt`, or text-layer PDFs.
* **Exact Evidence Locking**: Every extracted finding is locked to an exact character-level quotation from the original source report.
* **Range Comparison Engine**: Deterministically calculates patient status strictly according to the report's laboratory-specific reference boundaries.
* **Interactive Findings Table**: Search, filter, and inspect verified vs. flagged findings with direct jump-to-quote navigation.

### 2. 💊 Medicine Lens
* **Packaging & Active Ingredient Analysis**: Reads photographed medication labels, active ingredient names, and strength concentrations.
* **Official openFDA Monograph Integration**: Automatically maps detected active ingredients to official FDA monograph reference data (indications, dosage, warnings, contraindications).
* **Packaging Evidence Viewer**: Side-by-side modal displaying verbatim package quotes alongside authoritative FDA reference facts.

### 3. ⚠️ Drug-Drug Interaction Matrix
* **Symmetrical Interaction Evaluation**: Multi-drug pair checker (`makePairKey`) ensuring commutative consistency (evaluating *Drug A + Drug B* is identical to *Drug B + Drug A*).
* **Monograph Key Normalization**: Intelligently resolves brand names and clinical aliases (e.g., *Tylenol* $\to$ *paracetamol*, *Advil* $\to$ *ibuprofen*, *Zyrtec* $\to$ *cetirizine*).
* **Clinical Severity Tiers**: Categorizes combinations into `Major`, `Moderate`, and `Minor` risk levels with biological mechanism explanations and FDA Drug Safety citations.
* **Neutral Non-Reassurance for Unknowns**: Explicitly warns that an unrecorded combination does *not* imply guaranteed safety ("absence of evidence is not evidence of absence").

### 4. 📋 Doctor Visit Brief & Summary Export
* **Physician-Ready Clinical Summary**: Generates a consolidated briefing featuring flagged abnormal values, current medications, potential drug interactions, and recommended questions for your healthcare provider.
* **Multi-Format Export**: One-click download of verified briefings in:
  * **Markdown (`.md`)**: Human-readable, ready for personal health notes.
  * **CSV (`.csv`)**: Tabular data structure for EMR ingestion.
  * **JSON (`.json`)**: Cryptographically sealed structured data payload.
* **Clipboard Copy**: Instant copy-to-clipboard with verification headers.

### 5. 🛡️ Verification ID & Integrity Seals
* **Deterministic Verification ID (`MS-XXXXXXXX`)**: Generated via non-sensitive FNV-1a hashing of finding counts, report type, and date. Contains zero patient names, emails, or credentials.
* **Evidence Fingerprint**: Canonical hash (`testName|valueText|status|quote`) ensuring end-to-end report integrity.
* **Verification Lab (Tamper Detection)**: Real-time simulation environment enabling patients to test intentional text alterations to confirm that tampering immediately fails verification.

### 6. 🚀 Offline Guest Mode & Preloaded Demo Data
* **No Sign-Up Required**: Instant access to all core verification tools without creating an account or supplying credentials.
* **Curated Clinical Demo Suites**:
  * Complete Blood Count (CBC) with out-of-range low platelets and hemoglobin.
  * Comprehensive Metabolic Panel (CMP) with elevated glucose and BUN.
  * Standard OTC medications with known multi-drug interactions.

---

## 🛠️ Technology Stack

* **Framework & Routing**: [TanStack Start](https://tanstack.com/start) with [TanStack Router](https://tanstack.com/router) (Full-stack SSR & type-safe routing)
* **Server Runtime**: [Nitro](https://nitro.unjs.io) server worker engine
* **Frontend**: React 19, TypeScript (Strict Mode)
* **Styling**: Tailwind CSS, Radix UI primitives, Lucide React icons
* **AI & Extraction**: Google Gemini 2.5/2.0 Flash via Vercel AI SDK (`@ai-sdk/google`)
* **Reference Datasets**: openFDA Over-The-Counter (OTC) monographs & FDA Drug Safety Communications
* **Testing**: Vitest with 13 isolated test suites

---

## 📁 Repository Structure

A complete directory snapshot is maintained in [PROJECT-TREE.txt](file:///f:/MEDISCAN-EDM/PROJECT-TREE.txt). Key directory highlights:

```
MEDISCAN-EDM/
├── src/
│   ├── components/
│   │   ├── medicine/          # MedicineIdentityCard, DrugInteractionChecker, Evidence modals
│   │   ├── report/            # DoctorBrief, FindingsTable, SourceViewer, VerificationLab
│   │   ├── ui/                # Radix UI primitives, skeleton loaders, buttons, dialogs
│   │   └── Navbar.tsx         # Responsive navigation & mobile slide-out drawer
│   ├── lib/
│   │   ├── medicine/          # Drug interactions engine, openFDA data, image safety guards
│   │   ├── report/            # Evidence quote verification, range calculators, summary exports
│   │   ├── ai.functions.ts    # Server RPCs for report analysis and brief generation
│   │   └── auth.middleware.ts # Supabase session & guest mode guards
│   ├── routes/                # TanStack file-based routes (/, /analyzer, /medicines, /history, /demo)
│   ├── router.tsx             # Type-safe router context & prefetching configuration
│   └── styles.css             # Design tokens, medical palette, dark/light themes
├── tests/
│   ├── medicine/              # Engine, interaction matrix, and OCR guard tests
│   └── report/                # Extraction, normalization, schemas, summary export tests
├── PROJECT-TREE.txt           # Comprehensive file layout reference
└── README.md                  # Project documentation & release guide
```

---

## 🧪 Quality & Test Coverage

MediScan V3 is verified by an automated test suite with **100% pass rate**:

* **13 Test Suites / 137 Tests** (`npm test`):
  * `tests/medicine/interactions.test.ts`: Symmetrical pair keys, monograph aliases, severity tiers.
  * `tests/medicine/engine.test.ts`: Active ingredient extraction & OCR validation.
  * `tests/report/engine.test.ts`: Complete lab extraction & deterministic abnormality classification.
  * `tests/report/evidence.test.ts`: Quote locking, character offsets, and tamper detection.
  * `tests/report/summaryExport.test.ts`: Markdown, CSV, and JSON clinical brief generation.
  * `tests/report/normalize.test.ts`: Reference range boundary normalization.
  * `tests/report/pdfLines.test.ts`: PDF text-layer reconstruction.
* **Strict TypeScript Typechecking**: `tsc --noEmit` completes with 0 errors.
* **Production Build**: Nitro server worker and client bundles build cleanly.

---

## ⚡ Getting Started

### 1. Prerequisites
* **Node.js**: >= 20.x
* **npm**: >= 10.x

### 2. Environment Configuration
Copy `.env.example` to `.env` and provide your credentials:
```bash
cp .env.example .env
```
Key configuration keys:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash,gemini-3.6-flash,gemini-3.5-flash
```

### 3. Development Commands
```bash
# Start local development server with hot reload
npm run dev

# Run full automated test suite (Vitest)
npm test

# Run TypeScript strict typecheck
npm run typecheck

# Build for production deployment
npm run build

# Preview production build locally
npm run preview
```

---

## ⚖️ Medical Safety & Privacy Disclaimer

* **Not Medical Advice**: MediScan is designed strictly for educational and informational purposes. It does not provide medical diagnoses, prescribe medications, or recommend treatments.
* **Clinician Verification**: Always consult a qualified physician or healthcare provider regarding any lab findings, symptom changes, or medication regimens.
* **Zero Storage of Medical Images**: Scanned images and lab report texts are processed ephemerally in client/server memory and are not permanently retained without explicit user authorization.