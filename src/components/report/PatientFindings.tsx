import React, { useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronDown, ClipboardList, Info, ShieldCheck } from "lucide-react";
import { T } from "@/lib/i18n";
import type { VerifiedFinding } from "@/lib/report/types";
import { StatusBadge } from "@/components/StatusBadge";
import { RangeBar } from "./RangeBar";
import { EvidenceVerificationModal } from "./EvidenceVerificationModal";
import {
  countResults, EDUCATION_CHECKED_ON, EMERGENCY_EDUCATION_SOURCE, getTestEducation,
  hasPrintedCriticalFlag, LAB_EDUCATION_SOURCE, resultMeaning, resultNextStep, VISIT_CHECKLIST,
} from "@/lib/report/education";

export function VisitPreparation() {
  return <details className="group rounded-xl border border-border bg-card p-4 print:break-inside-avoid">
    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
      <ClipboardList className="h-4 w-4 shrink-0" /><T>Get ready for your doctor visit</T>
      <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
    </summary>
    <fieldset className="mt-4 space-y-3">
      <legend className="sr-only">Doctor visit preparation checklist</legend>
      {VISIT_CHECKLIST.map(item => <label key={item} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-current" />{item}
      </label>)}
    </fieldset>
    <p className="mt-3 text-xs text-muted-foreground"><T>This checklist is for this visit and is not saved.</T></p>
  </details>;
}

export function WhenToGetHelp() {
  return <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm leading-relaxed">
    <p className="flex items-center gap-2 font-semibold"><Info className="h-4 w-4 shrink-0" /><T>When to get help</T></p>
    <p className="mt-2 text-muted-foreground">For a result outside the lab's range, ask the clinician who ordered it how soon to follow up. If symptoms are new or getting worse, contact a healthcare professional even if results are within range.</p>
    <p className="mt-2">Severe trouble breathing, chest pain that does not go away, or loss of consciousness need emergency help. Call your local emergency number; do not wait for this app.</p>
    <p className="mt-2 text-xs text-muted-foreground">General guidance · <a href={LAB_EDUCATION_SOURCE} target="_blank" rel="noreferrer" className="underline underline-offset-2">Understanding results</a> · <a href={EMERGENCY_EDUCATION_SOURCE} target="_blank" rel="noreferrer" className="underline underline-offset-2">Emergency signs</a></p>
  </div>;
}

type Filter = "all" | "outside" | "within" | "unclear";

export function PatientFindings({ findings, onSeeEvidence, sourceTextAvailable = true }: {
  findings: VerifiedFinding[];
  onSeeEvidence: (finding: VerifiedFinding) => void;
  sourceTextAvailable?: boolean;
}) {
  const [verifyingFinding, setVerifyingFinding] = useState<VerifiedFinding | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const counts = countResults(findings);
  const critical = findings.filter(f => hasPrintedCriticalFlag(f, sourceTextAvailable));
  const visible = [...findings].filter(f => filter === "all" ||
    (filter === "outside" && (f.status === "LOW" || f.status === "HIGH")) ||
    (filter === "within" && f.status === "NORMAL") || (filter === "unclear" && f.status === "UNKNOWN"))
    .sort((a, b) => Number(b.attention || b.status !== "NORMAL") - Number(a.attention || a.status !== "NORMAL"));
  return <div className="space-y-4">
    <section aria-label="Your report at a glance" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-lg font-semibold"><T>Your report at a glance</T></h3><p className="mt-1 text-sm text-muted-foreground">{findings.length} results shown here. Start with what you want to understand.</p></div>
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"><T>Show all results</T></button>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {([
          ["outside", counts.outside, "Outside lab range", "text-amber-700 dark:text-amber-300"],
          ["within", counts.within, "Within lab range", "text-emerald-700 dark:text-emerald-300"],
          ["unclear", counts.unclear, "Need explanation", "text-muted-foreground"],
        ] as const).map(([key, count, label, color]) => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`rounded-xl border p-3 text-left transition-colors sm:p-4 ${filter === key ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"}`}>
          <span className={`block text-2xl font-semibold ${color}`}>{count}</span><span className="mt-1 block text-xs leading-relaxed sm:text-sm"><T>{label}</T></span>
        </button>)}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">These groups compare results with your report. They do not measure how healthy you are or how urgently you need care.</p>
    </section>
    {critical.length > 0 && <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
      <p className="font-semibold">Your report includes a critical flag</p>
      <p className="mt-1">The lab marked {critical.map(f => f.testName).join(", ")} as critical. Contact your treating clinician or seek prompt medical evaluation.</p>
    </div>}
    <div className="space-y-3" aria-live="polite">
      {visible.length === 0 && <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground"><T>No results in this group.</T> <button className="ml-1 underline" onClick={() => setFilter("all")} type="button"><T>Show all results</T></button></div>}
      {visible.map(finding => <PatientFindingCard key={finding.id} finding={finding} onSeeEvidence={() => { onSeeEvidence(finding); setVerifyingFinding(finding); }} />)}
    </div>
    <WhenToGetHelp />
    <VisitPreparation />
    <EvidenceVerificationModal finding={verifyingFinding} sourceTextAvailable={sourceTextAvailable} isOpen={Boolean(verifyingFinding)} onClose={() => setVerifyingFinding(null)} />
  </div>;
}

function PatientFindingCard({ finding: f, onSeeEvidence }: { finding: VerifiedFinding; onSeeEvidence: () => void }) {
  const education = getTestEducation(f.testName);
  return <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>{education && <p className="mb-1 text-xs font-medium text-muted-foreground">{education.group}</p>}<h4 className="text-base font-semibold">{f.testName}</h4></div>
      <StatusBadge status={f.status} reason={f.statusReason} />
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.2fr] sm:gap-6">
      <div className="rounded-xl bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground"><T>Your result</T></p>
        <p className="mt-1 text-2xl font-semibold">{f.valueText} <span className="text-sm font-normal text-muted-foreground">{f.unit}</span></p>
        <p className="mt-1 text-xs text-muted-foreground"><T>Lab's reference</T>: {f.referenceRangeText || "Not provided"}</p>
        <div className="mt-4"><RangeBar value={f.value} range={f.range} status={f.status} unit={f.unit} /></div>
      </div>
      <div className="space-y-3 text-sm leading-relaxed">
        <div><p className="font-semibold"><T>What this checks</T></p><p className="mt-1 text-muted-foreground">{education?.purpose ?? "We do not yet have a sourced plain-language guide for this test. Ask your clinician what it measures."}</p></div>
        <div><p className="font-semibold"><T>What yours shows</T></p><p className="mt-1 text-muted-foreground">{resultMeaning(f)}</p></div>
      </div>
    </div>
    <div className="mt-4 flex items-start gap-2 rounded-xl border border-border px-3 py-3 text-sm leading-relaxed"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0" /><p><span className="font-semibold"><T>Next step</T>: </span>{resultNextStep(f)}</p></div>
    <details className="group mt-4 border-t border-border pt-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 py-1 text-sm font-medium [&::-webkit-details-marker]:hidden"><BookOpen className="h-4 w-4 shrink-0" /><T>Understand more</T><ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" /></summary>
      <div className="mt-3 space-y-4 text-sm leading-relaxed">
        {education && <><div><h5 className="font-semibold"><T>What can affect this test?</T></h5><p className="mt-1 text-muted-foreground">{education.context}</p></div><div><h5 className="font-semibold"><T>Useful precautions</T></h5><p className="mt-1 text-muted-foreground">{education.precaution}</p></div></>}
        <div><h5 className="font-semibold"><T>Ask your doctor</T></h5><p className="mt-1 text-muted-foreground">{education?.question ?? "What does this test mean for me, and does it need follow-up?"}</p></div>
        <p className="flex items-start gap-2 text-xs text-muted-foreground"><Check className="mt-0.5 h-3 w-3 shrink-0" />General education, not a diagnosis from this report. <a href={education?.source ?? LAB_EDUCATION_SOURCE} target="_blank" rel="noreferrer" className="underline underline-offset-2">MedlinePlus source</a></p>
        <p className="text-xs text-muted-foreground">Source checked {EDUCATION_CHECKED_ON}.</p>
      </div>
    </details>
    <button type="button" onClick={onSeeEvidence} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"><ShieldCheck className="h-4 w-4" /><T>See the evidence</T></button>
  </article>;
}
