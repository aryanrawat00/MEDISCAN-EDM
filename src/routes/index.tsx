import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Pill,
  History as HistoryIcon,
  Brain,
  Lock,
  Zap,
  HeartPulse,
  CheckCircle2,
  Quote,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediScan AI — Understand your health, intelligently" },
      {
        name: "description",
        content:
          "Upload medical reports, check symptoms, look up medicines, and get clear AI-powered explanations. Educational only — always consult a qualified healthcare professional.",
      },
      { property: "og:title", content: "MediScan AI — Understand your health, intelligently" },
      {
        property: "og:description",
        content:
          "AI-powered medical assistant for reports, symptoms and medicines. Educational only.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 [background:radial-gradient(60%_50%_at_50%_0%,rgb(var(--brand-r)_var(--brand-g)_var(--brand-b)/0.25),transparent_70%)]" />
        <div className="mx-auto max-w-5xl px-6 py-28 text-center sm:py-40">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Powered by Google Gemini
          </span>
          <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight sm:text-7xl">
            Understand your health,{" "}
            <span className="brand-text-gradient">intelligently</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            MediScan AI helps you read medical reports, explore symptoms and look up
            medicines in plain language — so you walk into your next appointment prepared.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="brand-gradient text-white">
              <Link to="/login">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/analyzer">Try the analyzer</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Educational use only · Never a substitute for professional care
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          <Stat value="4" label="AI tools" />
          <Stat value="<5s" label="Average response" />
          <Stat value="100%" label="Private to you" />
          <Stat value="24/7" label="Always available" />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeader
          eyebrow="What's inside"
          title={
            <>
              Four tools, one <span className="brand-text-gradient">clear</span> answer.
            </>
          }
          desc="Each tool turns dense medical language into something you can actually act on."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<FileText className="h-5 w-5" />}
            title="Report Analyzer"
            desc="Paste lab results and get a structured summary, abnormal values and questions to ask."
          />
          <Feature
            icon={<Stethoscope className="h-5 w-5" />}
            title="Symptom Checker"
            desc="Describe how you feel. Get possible directions, self-care tips and red flags."
          />
          <Feature
            icon={<Pill className="h-5 w-5" />}
            title="Medicine Lookup"
            desc="Search any medicine for uses, dosage, side effects, interactions and warnings."
          />
          <Feature
            icon={<HistoryIcon className="h-5 w-5" />}
            title="History"
            desc="Every analysis is saved to your private history — revisit and compare anytime."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <SectionHeader
            eyebrow="How it works"
            title={
              <>
                From confusion to <span className="brand-text-gradient">clarity</span> in three steps.
              </>
            }
            desc="No medical degree required. Just paste, read, and prepare for a better conversation with your doctor."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Step
              n="01"
              icon={<Brain className="h-5 w-5" />}
              title="Share what you have"
              desc="Paste a report, describe symptoms, or type a medicine name."
            />
            <Step
              n="02"
              icon={<Zap className="h-5 w-5" />}
              title="Gemini reads it"
              desc="Structured AI output: summaries, findings, warnings and next steps."
            />
            <Step
              n="03"
              icon={<HeartPulse className="h-5 w-5" />}
              title="Talk to your doctor"
              desc="Walk in informed, with the right questions ready to ask."
            />
          </div>
        </div>
      </section>

      {/* Why MediScan */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Built for safety
            </span>
            <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              We never diagnose. We help you{" "}
              <span className="brand-text-gradient">understand</span>.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Every response is framed as educational information with clear disclaimers,
              red flags for urgent care, and a reminder to consult a qualified professional.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              <Bullet>Plain-language summaries — no jargon walls</Bullet>
              <Bullet>Highlighted red flags for urgent symptoms</Bullet>
              <Bullet>Private history protected by row-level security</Bullet>
              <Bullet>Always pairs answers with a "see your doctor" reminder</Bullet>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="brand-gradient text-white">
                <Link to="/login">Start free</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/about">Learn more</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl opacity-40 blur-2xl [background:radial-gradient(closest-side,rgb(var(--brand-r)_var(--brand-g)_var(--brand-b)/0.4),transparent)]" />
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniCard
                icon={<Lock className="h-5 w-5" />}
                title="Private by default"
                desc="Your data lives in your own Supabase project."
              />
              <MiniCard
                icon={<Zap className="h-5 w-5" />}
                title="Fast answers"
                desc="Gemini 2.5 Flash returns structured JSON in seconds."
              />
              <MiniCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Safety first"
                desc="Every response includes an educational disclaimer."
              />
              <MiniCard
                icon={<Brain className="h-5 w-5" />}
                title="Structured insight"
                desc="Findings, dosage, red flags — never a wall of text."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <SectionHeader
            eyebrow="What people say"
            title={
              <>
                Built to be <span className="brand-text-gradient">useful</span>, not scary.
              </>
            }
            desc="Early users tell us MediScan AI replaces the late-night Google spiral."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Testimonial
              quote="Finally understood my blood test without panicking. I went to my doctor with real questions."
              name="Aarav S."
              role="Patient"
            />
            <Testimonial
              quote="The symptom checker is honest about uncertainty — and it always tells me when to seek care."
              name="Priya K."
              role="Caregiver"
            />
            <Testimonial
              quote="Medicine lookup saved me a pharmacist call. Side effects and interactions, neatly listed."
              name="Daniel R."
              role="Patient"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10 opacity-40 [background:radial-gradient(50%_60%_at_50%_0%,rgb(var(--brand-r)_var(--brand-g)_var(--brand-b)/0.35),transparent_70%)]" />
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to <span className="brand-text-gradient">decode</span> your next report?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Sign in and try the Analyzer, Symptom Checker and Medicine Lookup — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="brand-gradient text-white">
              <Link to="/login">
                Get started free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground">{desc}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="brand-text-gradient text-3xl font-bold sm:text-4xl">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg brand-gradient text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  desc,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-6">
      <span className="brand-text-gradient absolute right-5 top-4 text-3xl font-bold opacity-70">
        {n}
      </span>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg brand-gradient text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function MiniCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg brand-gradient text-white">
        {icon}
      </div>
      <h4 className="mt-3 text-base font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
      <span className="text-muted-foreground">{children}</span>
    </li>
  );
}

function Testimonial({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <figure className="rounded-2xl border border-border bg-card p-6">
      <Quote className="h-6 w-6 text-primary" />
      <blockquote className="mt-3 text-sm leading-relaxed text-foreground">
        "{quote}"
      </blockquote>
      <figcaption className="mt-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{name}</span> · {role}
      </figcaption>
    </figure>
  );
}
