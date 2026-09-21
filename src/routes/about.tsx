import { T, useI18n } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Pill, ShieldCheck, Sparkles, CheckCircle2, FileCheck, HelpCircle } from "lucide-react";
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
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />  <T>{"About MediScan AI"}</T> </span>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
         <T>{"Health documents,"}</T> <span className="brand-text-gradient"> <T>{"evidence-locked"}</T> </span>.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
         <T>{"MediScan is an evidence-first clinical intelligence platform. We translate complex laboratory reports and medicine packaging into clear, structured, verified insights so patients and caregivers can have informed, productive conversations with their healthcare providers."}</T> </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card icon={<FileText className="h-5 w-5" />} title={t("Report Intelligence")}>
           <T>{"Extracts clinical lab tests, locks verbatim quotes to the source document, and deterministically compares values against printed reference ranges."}</T> </Card>
        <Card icon={<Pill className="h-5 w-5" />} title={t("Medicine Packaging Lens")}>
           <T>{"Vision OCR inspects drug packaging, identifies active ingredients and strengths, and matches verified openFDA drug monographs."}</T> </Card>
        <Card icon={<FileCheck className="h-5 w-5" />} title={t("Doctor Visit Brief")}>
           <T>{"Synthesizes verified findings and out-of-range parameters into a clean, printable 1-page summary with suggested clinical questions."}</T> </Card>
      </div>

      <section className="mt-12 rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ShieldCheck className="h-5 w-5 text-primary" />  <T>{"Our Core Safety Principles"}</T> </h2>
        <div className="grid gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-0.5"> <T>{"Deterministic Abnormality Rules"}</T> </strong>
               <T>{"The AI never decides whether a lab test is high or low. Programmatic code evaluates numbers against the laboratory's printed reference range."}</T> </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-0.5"> <T>{"Verbatim Quote Locking"}</T> </strong>
               <T>{"Every extracted finding must match an exact substring in the source report. If quote verification fails, the finding is marked unverified."}</T> </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-0.5"> <T>{"Zero Independent Diagnosis"}</T> </strong>
               <T>{"MediScan never diagnoses conditions or prescribes regimens. All output is framed as educational preparation for a qualified doctor consultation."}</T> </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-0.5"> <T>{"Private by Design"}</T> </strong>
               <T>{"Guest results stay in session memory. Processing may use the configured AI service. Signed-in analyses are saved to your private account history."}</T> </div>
          </div>
        </div>
      </section>

      <section id="privacy" className="mt-10 scroll-mt-24 rounded-2xl border border-border bg-card p-6"><h2 className="text-xl font-semibold"> <T>{"Privacy and your data"}</T> </h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground"> <T>{"Guest results are kept in session memory. Report text and medicine images may be processed by the configured AI service. Signed-in analyses are saved to your private account history. Avoid uploading information you do not want processed."}</T> </p></section>
      <section id="disclaimer" className="mt-6 scroll-mt-24 rounded-2xl border border-border bg-card p-6"><h2 className="text-xl font-semibold"> <T>{"Educational use only"}</T> </h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground"> <T>{"MediScan is an educational and decision-support tool. It does not diagnose conditions, prescribe treatment, or replace professional medical advice."}</T> </p></section>
      {/* How It Works */}
      <section className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold"> <T>{"How It Works"}</T> </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Upload or Photograph",
              desc: "Upload a PDF lab report or take a photo of medicine packaging. MediScan extracts the raw text using secure OCR.",
            },
            {
              step: "2",
              title: "Evidence-Locked Analysis",
              desc: "Deterministic code compares every extracted value against the lab's own printed reference range. No guessing, no AI opinion.",
            },
            {
              step: "3",
              title: "Review & Prepare",
              desc: "Receive a verified, structured summary with suggested questions you can bring to your next doctor visit.",
            },
          ].map((s) => (
            <div key={s.step} className="relative rounded-xl border border-border bg-card p-5">
              <div className="absolute -top-3 left-4 flex h-6 w-6 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white">
                {s.step}
              </div>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why MediScan? FAQ */}
      <section id="faq" className="mt-12 rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <HelpCircle className="h-5 w-5 text-primary" />  <T>{"Why MediScan?"}</T> </h2>
        <div className="space-y-3 text-sm">
          {[
            {
              q: "Why can't I just read my lab report myself?",
              a: "You absolutely can. MediScan doesn't replace reading — it structures and cross-references your results against the laboratory's own reference ranges, catches values you might overlook, and generates precise questions for your doctor.",
            },
            {
              q: "Is MediScan a replacement for a doctor?",
              a: "No. MediScan is an educational preparation tool only. It never diagnoses, prescribes, or provides treatment recommendations. Always consult a qualified healthcare professional.",
            },
            {
              q: "How is this different from ChatGPT-style medical advice?",
              a: "MediScan uses deterministic code rules — not AI opinions — to evaluate lab values. Every finding is anchored to a verbatim quote from your source document, so nothing is fabricated or hallucinated.",
            },
            {
              q: "Is my data private?",
              a: t("Guest results stay in session memory. Processing may use the configured AI service. Signed-in analyses are saved to your private account history."),
            },
          ].map((faq, i) => (
            <details key={i} className="group rounded-lg border border-border/60 bg-muted/20">
              <summary className="cursor-pointer px-4 py-3 font-medium text-foreground select-none hover:bg-muted/40 rounded-lg transition-colors">
                {faq.q}
              </summary>
              <p className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className="brand-gradient text-white">
          <Link to="/analyzer"> <T>{"Try Report Analyzer"}</T> </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/medicines"> <T>{"Open Medicine Lens"}</T> </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/demo"> <T>{"Explore Demo Lab"}</T> </Link>
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
