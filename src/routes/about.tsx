import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Pill, ShieldCheck, Sparkles, CheckCircle2, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MediScan AI" },
      {
        name: "description",
        content:
          "MediScan AI helps users understand medical reports and medicines using evidence-first, deterministic analysis. Educational only — never a substitute for a qualified healthcare professional.",
      },
      { property: "og:title", content: "About MediScan AI" },
      { property: "og:description", content: "Our mission, deterministic evidence engine, and clinical safety principles." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" /> About MediScan AI
      </span>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Health documents, <span className="brand-text-gradient">evidence-locked</span>.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
        MediScan is an evidence-first clinical intelligence platform. We translate complex laboratory reports
        and medicine packaging into clear, structured, verified insights so patients and caregivers can have
        informed, productive conversations with their healthcare providers.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card icon={<FileText className="h-5 w-5" />} title="Report Intelligence">
          Extracts clinical lab tests, locks verbatim quotes to the source document, and deterministically compares values against printed reference ranges.
        </Card>
        <Card icon={<Pill className="h-5 w-5" />} title="Medicine Packaging Lens">
          Vision OCR inspects drug packaging, identifies active ingredients and strengths, and matches verified openFDA drug monographs.
        </Card>
        <Card icon={<FileCheck className="h-5 w-5" />} title="Doctor Visit Brief">
          Synthesizes verified findings and out-of-range parameters into a clean, printable 1-page summary with suggested clinical questions.
        </Card>
      </div>

      <section className="mt-12 rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ShieldCheck className="h-5 w-5 text-primary" /> Our Core Safety Principles
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-0.5">Deterministic Abnormality Rules</strong>
              The AI never decides whether a lab test is high or low. Programmatic code evaluates numbers against the laboratory's printed reference range.
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-0.5">Verbatim Quote Locking</strong>
              Every extracted finding must match an exact substring in the source report. If quote verification fails, the finding is marked unverified.
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-0.5">Zero Independent Diagnosis</strong>
              MediScan never diagnoses conditions or prescribes regimens. All output is framed as educational preparation for a qualified doctor consultation.
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-0.5">Private by Design</strong>
              Guest analyses remain ephemeral in client session memory. Signed-in records are protected by database Row-Level Security.
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className="brand-gradient text-white">
          <Link to="/analyzer">Try Report Analyzer</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/medicines">Open Medicine Lens</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/demo">Explore Demo Lab</Link>
        </Button>
      </div>
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg brand-gradient text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
