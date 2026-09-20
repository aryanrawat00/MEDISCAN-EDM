# MediScan — Evidence-Locked Personal Health Information Assistant

> *"Understand your reports. Know your medicines."*  
> Principle: **Evidence first. AI second.** ("Don't just ask AI. Verify first.")

MediScan provides two distinct, evidence-locked health intelligence modules:
1. **📄 Report Lens**: Extracts lab values from pasted reports, `.txt`, or text-layer PDFs, verifies exact evidence quotes from the source, and calculates abnormality deterministically using the report's printed reference range. Generates a clinical **Doctor Visit Brief** and features a **Verification Lab** (Tamper Test).
2. **💊 Medicine Lens**: Analyzes package text (photographed packaging or active-ingredient input), verifies quotes, and provides verified active ingredient details and safety information looked up from an official openFDA OTC snapshot.

---

## Getting Started

### 1. Prerequisites
- Node.js >= 20
- npm >= 10

### 2. Environment Configuration
Copy `.env.example` to `.env` and provide your credentials:
```bash
cp .env.example .env
```
Configure:
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

# Run build
npm run build
```

---

## Medical Safety Disclaimer
MediScan is for educational and informational purposes only. It does not provide medical diagnoses, prescribe medications, or recommend dosages. Always consult a qualified healthcare provider.