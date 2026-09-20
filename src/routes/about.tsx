import { createFileRoute, Link } from "@tanstack/react-router";
import { Stethoscope, FileText, Pill, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MediScan AI" },
      {
        name: "description",
        content:
          "MediScan AI helps you understand medical reports and symptoms in plain language. Educational only — never a substitute for a qualified healthcare professional.",
      },
      { property: "og:title", content: "About MediScan AI" },
      { property: "og:description", content: "Our mission, how it works, and our commitment to safety." },
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
        Health information, <span className="brand-text-gradient">made readable</span>.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        MediScan AI is an educational assistant. We translate medical reports, symptoms and
        medicines into clear language so you can have better conversations with your doctor —
        not replace one.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card icon={<FileText className="h-5 w-5" />} title="Report Analyzer">
          Paste lab results or report text. Get a summary, abnormal values, and questions to ask.
        </Card>
        <Card icon={<Stethoscope className="h-5 w-5" />} title="Symptom Checker">
          Describe how you feel. Get possible directions, self-care ideas, and clear red flags.
        </Card>
        <Card icon={<Pill className="h-5 w-5" />} title="Medicine Lookup">
          Search a medicine. Learn its uses, dosage, common side effects and warnings.
        </Card>
      </div>

      <section className="mt-12 rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ShieldCheck className="h-5 w-5 text-primary" /> Our safety principles
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>We never diagnose. We always recommend consulting a qualified professional.</li>
          <li>Every AI response includes a clear educational-use disclaimer.</li>
          <li>Your history is stored with row-level security — only you can read it.</li>
          <li>We surface urgent red flags so you know when to seek immediate care.</li>
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className="brand-gradient text-white">
          <Link to="/dashboard">Open dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg brand-gradient text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
