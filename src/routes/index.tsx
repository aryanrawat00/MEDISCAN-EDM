import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Pill,
  History as HistoryIcon,
  Lock,
  HeartPulse,
  CheckCircle2,
  FileCheck,
  FlaskConical,
  Activity,
  Layers,
  AlertTriangle,
  ChevronRight,
  Scan,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediScan AI — Evidence-First Medical Report & Medicine Intelligence" },
      {
        name: "description",
        content:
          "MediScan helps users understand medical reports and medicines using evidence-first, deterministic analysis. Zero AI range hallucination.",
      },
      { property: "og:title", content: "MediScan AI — Understand your health, evidence first" },
      {
        property: "og:description",
        content:
          "Deterministic medical report intelligence, medicine packaging lens, and doctor visit preparation.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="space-y-20 pb-16 sm:space-y-28">
      {/* ── 1. Hero Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-8 sm:pt-20 sm:pb-14">
        {/* Subtle radial glow background */}
        <div className="absolute inset-0 -z-10 opacity-30 [background:radial-gradient(60%_50%_at_50%_0%,rgb(var(--brand-r)_var(--brand-g)_var(--brand-b)/0.22),transparent_70%)]" />

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Deterministic Clinical Engine · Verbatim Evidence Locking</span>
          </div>

          {/* Primary headline */}
          <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Understand medical reports and medicines using{" "}
            <span className="brand-text-gradient">evidence-first</span> analysis.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground sm:text-xl leading-relaxed">
            MediScan bridges the gap between complex health documents and patient clarity.
            Programmatic code evaluates lab reference intervals deterministically with zero AI hallucination,
            quotes are verified verbatim against source text, and medicine packaging matches official openFDA monographs.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="brand-gradient text-white shadow-sm h-12 px-6">
              <Link to="/analyzer">
                <FileText className="mr-2 h-4 w-4" /> Analyze Medical Report
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/medicines">
                <Pill className="mr-2 h-4 w-4 text-primary" /> Scan Medicine Packaging
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-12 px-5">
              <Link to="/demo">
                <Sparkles className="mr-2 h-4 w-4 text-amber-500" /> Offline Demo Lab
              </Link>
            </Button>
          </div>

          {/* Guest accessibility notice */}
          <p className="mt-4 text-xs text-muted-foreground">
            Instant guest access · No mandatory registration · Sign in anytime to permanently save history
          </p>
        </div>
      </section>

      {/* ── 2. Trust Stats Strip ───────────────────────────── */}
      <section className="border-y border-border bg-card/40 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4">
          <Stat value="100%" label="Deterministic Evaluation" desc="Code, not AI, checks ranges" />
          <Stat value="0%" label="Guessed Lab Values" desc="Verbatim quote lock required" />
          <Stat value="10" label="openFDA OTC Monographs" desc="Approved drug reference snapshot" />
          <Stat value="1-Page" label="Doctor Visit Brief" desc="Synthesized clinical questions" />
        </div>
      </section>

      {/* ── 3. Two Primary Product Cards ───────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Core Intelligence Lenses
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Two specialized tools built on verified evidence.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Choose between clinical laboratory analysis and multi-modal OTC medicine packaging inspection.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Card 1: Report Intelligence Lens */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:border-primary/40 transition-all">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                  Clinical Lab Lens
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold text-foreground">
                Report Intelligence Lens
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Upload or paste blood tests, metabolic panels, or pathology summaries. Extracts findings,
                verifies quotes verbatim, and evaluates ranges deterministically.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground border-t border-border/60 pt-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Verbatim Quote Locking:</strong> Highlights exact source sentence in the original document.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Deterministic Range Evaluation:</strong> LOW/NORMAL/HIGH computed strictly against printed lab intervals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Doctor Visit Brief:</strong> 1-page printable clinical summary with appointment discussion questions.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
              <Button asChild className="brand-gradient text-white w-full sm:w-auto">
                <Link to="/analyzer">
                  Launch Report Analyzer <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">Guest or Account</span>
            </div>
          </div>

          {/* Card 2: Medicine Packaging Lens */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:border-primary/40 transition-all">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Pill className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                  OTC Packaging Lens
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold text-foreground">
                Medicine Packaging Lens
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Photograph or upload medicine cartons, blister strips, or bottle labels. Reads packaging text,
                identifies active ingredients and strengths, and matches official FDA drug monographs.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground border-t border-border/60 pt-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Active Ingredients & Strengths:</strong> Verified directly from actual container text.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Official openFDA Labels:</strong> Indications, purpose, warnings, and review provenance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Reference Monograph Browser:</strong> Direct search of approved OTC drugs without uploading photos.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/medicines">
                  Open Medicine Lens <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">Guest or Account</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. The Evidence Difference (Why Deterministic Matters) ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Why Deterministic Evidence Matters
            </span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl text-foreground">
              Why standard AI chatbots are dangerous for clinical documents.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Standard large language models hallucinate normal ranges based on generic internet training data,
              ignore laboratory-specific reference intervals, and make unsupported medical claims.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Generic Chatbot Risk */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Standard Generic AI Chatbot</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Guesses reference intervals from training memory, ignoring the specific lab's printed cutoff.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Misses unit mismatches (e.g. mg/dL vs mmol/L) leading to false normal or false alarm reports.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Provides conversational summaries with zero proof of where the numbers came from.</span>
                </li>
              </ul>
            </div>

            {/* MediScan Evidence Engine */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>MediScan Deterministic Architecture</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>AI extracts text; code evaluates numbers.</strong> The LLM is mathematically prevented from guessing status.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Verbatim quote locking:</strong> Extracted values must match an exact character span in the original file.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Live Tamper Testing:</strong> Any tampered quote is immediately detected and rejected by the Verification Lab.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. How It Works (4 Clear Transparent Steps) ───── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Transparent Workflow
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            From document to verified clarity in four steps.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <WorkflowStep
            step="01"
            title="Upload or Paste"
            desc="Provide a report (PDF/text) or snap a packaging photo. Works immediately in Guest Mode."
          />
          <WorkflowStep
            step="02"
            title="Extract & Lock Evidence"
            desc="Vision OCR & extraction models isolate findings and lock verbatim quotes to exact character spans."
          />
          <WorkflowStep
            step="03"
            title="Deterministic Rule Execution"
            desc="Code evaluates numbers against printed reference ranges and matches approved FDA monographs."
          />
          <WorkflowStep
            step="04"
            title="Doctor Brief & Consultation"
            desc="Export or print a 1-page visit brief equipped with tailored questions for your clinician."
          />
        </div>
      </section>

      {/* ── 6. Safety & Privacy Principles ─────────────────── */}
      <section className="border-t border-border bg-card/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Built for Clinical Trust
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                We never diagnose. We help you <span className="brand-text-gradient">understand</span>.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed">
                Health information should empower conversations with your doctor, not cause late-night panic.
                Every response in MediScan is framed as structured, evidence-locked educational information.
              </p>

              <div className="mt-6 space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Panic & Critical Laboratory Flag Surfacing:</strong> Urgent values are prominently badged to prompt immediate clinician contact.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Privacy by Default:</strong> Guest sessions store nothing on servers. Signed-in records are protected by database row-level security.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>No Speculative Interactions:</strong> We never generate crowdsourced drug interaction theories without official FDA SPL evidence.</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SecurityFeature
                icon={<Lock className="h-5 w-5" />}
                title="Private Database RLS"
                desc="Only your authenticated user session can read your stored reports."
              />
              <SecurityFeature
                icon={<Activity className="h-5 w-5" />}
                title="Pipeline Telemetry"
                desc="Inspect step-by-step millisecond timing and token execution traces."
              />
              <SecurityFeature
                icon={<FlaskConical className="h-5 w-5" />}
                title="Tamper Detection"
                desc="Substrings that fail verbatim matching are immediately flagged."
              />
              <SecurityFeature
                icon={<HeartPulse className="h-5 w-5" />}
                title="Educational Boundaries"
                desc="Structured specifically to support your clinical consultation."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Offline Demo Lab CTA ────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center sm:p-14 shadow-xs">
          <div className="absolute inset-0 -z-10 opacity-35 [background:radial-gradient(50%_60%_at_50%_0%,rgb(var(--brand-r)_var(--brand-g)_var(--brand-b)/0.3),transparent_70%)]" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" /> Zero-Network Evaluation Mode
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Test MediScan with pre-verified clinical samples.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Inspect live CBC, CMP, and Lipid panels, or test OTC drug packaging samples.
            Runs 100% in-browser without sending data over any network.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="brand-gradient text-white shadow-sm">
              <Link to="/demo">
                Open Offline Demo Lab <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/analyzer">Analyze a Custom Report</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 8. Disclaimer & Professional Footer ────────────── */}
      <footer className="border-t border-border pt-10 text-xs text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-[11px] leading-relaxed">
            <strong className="text-foreground">Important Medical Disclaimer:</strong> MediScan AI is an educational assistant designed to help patients understand health documentation and prepare for clinical visits. It does not provide medical diagnoses, treatment recommendations, or prescriptions. Always consult a qualified healthcare provider for clinical interpretation of laboratory results and medical treatment decisions.
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <HeartPulse className="h-4 w-4 text-primary" />
              <span>MediScan AI V3</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <Link to="/analyzer" className="hover:text-foreground">Report Analyzer</Link>
              <Link to="/medicines" className="hover:text-foreground">Medicine Lens</Link>
              <Link to="/demo" className="hover:text-foreground">Demo Lab</Link>
              <Link to="/about" className="hover:text-foreground">About & Safety</Link>
              <Link to="/contact" className="hover:text-foreground">Contact</Link>
            </div>
            <p className="text-[11px]">Evidence first. AI second. Code decides.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label, desc }: { value: string; label: string; desc: string }) {
  return (
    <div className="text-center p-3">
      <div className="brand-text-gradient text-2xl font-bold sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs font-semibold text-foreground">{label}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{desc}</div>
    </div>
  );
}

function WorkflowStep({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-primary">{step}</span>
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      </div>
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function SecurityFeature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 shadow-xs">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

