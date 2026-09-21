import { T, useI18n } from "@/lib/i18n";
/**
 * src/components/report/VerificationLab.tsx
 * T21: Interactive Verification Lab & Tamper Test component (Blueprint §5, §21, D-5).
 * Allows clinicians and users to test deterministic evidence locking and verify
 * that any quote tampering immediately breaks verification.
 */

import { useState } from "react";
import { runTamperTest, type TamperTestResult } from "@/lib/report/lab";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FlaskConical,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface Preset {
  label: string;
  sourceText: string;
  testName: string;
  valueText: string;
  unit: string;
  referenceRangeText: string;
  evidenceQuote: string;
}

const PRESETS: Preset[] = [
  {
    label: "Normal Hemoglobin (Pass)",
    sourceText: "Hemoglobin: 14.2 g/dL (Reference Range: 13.0 - 17.0 g/dL)",
    testName: "Hemoglobin",
    valueText: "14.2",
    unit: "g/dL",
    referenceRangeText: "13.0 - 17.0 g/dL",
    evidenceQuote: "Hemoglobin: 14.2 g/dL (Reference Range: 13.0 - 17.0 g/dL)",
  },
  {
    label: "Tampered Quote (Mismatched Quote)",
    sourceText: "Patient Fasting Glucose is 95 mg/dL. Normal.",
    testName: "Glucose",
    valueText: "145",
    unit: "mg/dL",
    referenceRangeText: "70 - 99 mg/dL",
    evidenceQuote: "Patient Fasting Glucose is 145 mg/dL. Normal.",
  },
  {
    label: "High Potassium (Verified Abnormal)",
    sourceText: "POTASSIUM: 5.8 mEq/L [3.5 - 5.1 mEq/L] FLAG: HIGH",
    testName: "POTASSIUM",
    valueText: "5.8",
    unit: "mEq/L",
    referenceRangeText: "3.5 - 5.1 mEq/L",
    evidenceQuote: "POTASSIUM: 5.8 mEq/L [3.5 - 5.1 mEq/L] FLAG: HIGH",
  },
  {
    label: "Partial Quote missing Value (Tamper)",
    sourceText: "Serum Creatinine: 1.1 mg/dL [0.7 - 1.3 mg/dL]",
    testName: "Creatinine",
    valueText: "2.4",
    unit: "mg/dL",
    referenceRangeText: "0.7 - 1.3 mg/dL",
    evidenceQuote: "Serum Creatinine: normal range [0.7 - 1.3 mg/dL]",
  },
];

export function VerificationLab() {
  const { t } = useI18n();
  const [presetIndex, setPresetIndex] = useState<number>(0);
  const [sourceText, setSourceText] = useState(PRESETS[0].sourceText);
  const [testName, setTestName] = useState(PRESETS[0].testName);
  const [valueText, setValueText] = useState(PRESETS[0].valueText);
  const [unit, setUnit] = useState(PRESETS[0].unit);
  const [rangeText, setRangeText] = useState(PRESETS[0].referenceRangeText);
  const [evidenceQuote, setEvidenceQuote] = useState(PRESETS[0].evidenceQuote);

  const applyPreset = (p: Preset, idx: number) => {
    setPresetIndex(idx);
    setSourceText(p.sourceText);
    setTestName(p.testName);
    setValueText(p.valueText);
    setUnit(p.unit);
    setRangeText(p.referenceRangeText);
    setEvidenceQuote(p.evidenceQuote);
  };

  const result: TamperTestResult = runTamperTest({
    sourceText,
    testName,
    valueText,
    unit: unit || null,
    referenceRangeText: rangeText || null,
    evidenceQuote,
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold"> <T>{"Evidence Verification Lab"}</T> </h3>
            <p className="text-xs text-muted-foreground">
               <T>{"Live in-browser evidence locking and tamper engine (Zero LLM calls)."}</T> </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, idx) => (
            <Button
              key={p.label}
              variant={presetIndex === idx ? "secondary" : "outline"}
              size="sm"
              onClick={() => applyPreset(p, idx)}
              className="text-xs"
            >
              {p.label.split(" (")[0]}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* Left Column: Editable Inputs */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="lab-source" className="text-xs font-semibold">
               <T>{"Source Text (Simulated Original Report)"}</T> </Label>
            <Textarea
              id="lab-source"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="mt-1 font-mono text-xs"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="lab-test" className="text-xs">
                 <T>{"Test Name"}</T> </Label>
              <Input
                id="lab-test"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="lab-val" className="text-xs">
                 <T>{"Value"}</T> </Label>
              <Input
                id="lab-val"
                value={valueText}
                onChange={(e) => setValueText(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div>
              <Label htmlFor="lab-unit" className="text-xs">
                 <T>{"Unit"}</T> </Label>
              <Input
                id="lab-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lab-range" className="text-xs">
               <T>{"Reference Range Text"}</T> </Label>
            <Input
              id="lab-range"
              value={rangeText}
              onChange={(e) => setRangeText(e.target.value)}
              className="mt-1 font-mono text-xs"
            />
          </div>

          <div>
            <Label htmlFor="lab-quote" className="text-xs font-semibold flex items-center justify-between">
              <span> <T>{"Evidence Quote (Candidate substring)"}</T> </span>
              <button
                type="button"
                onClick={() => setEvidenceQuote(evidenceQuote + " [TAMPERED]")}
                className="text-[11px] text-destructive hover:underline font-normal"
              >
                 <T>{"Inject Tamper"}</T> </button>
            </Label>
            <Textarea
              id="lab-quote"
              value={evidenceQuote}
              onChange={(e) => setEvidenceQuote(e.target.value)}
              className="mt-1 font-mono text-xs"
              rows={2}
            />
          </div>
        </div>

        {/* Right Column: Live Deterministic Engine Output */}
        <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
               <T>{"Engine Verification"}</T> </span>
            <div className="flex items-center gap-2">
              <StatusBadge status={result.status} />
              {result.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />  <T>{"Evidence Locked"}</T> </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  <ShieldAlert className="h-3.5 w-3.5" />  <T>{"Untrusted / Tampered"}</T> </span>
              )}
            </div>
          </div>

          {/* Verification Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-card p-2">
              {result.quoteFound ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span> <T>{"Quote in Source:"}</T> {result.quoteFound ? t("Found") : t("Mismatched")}</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-md border border-border bg-card p-2">
              {result.nameInQuote ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span> <T>{"Name in Quote:"}</T> {result.nameInQuote ? t("Yes") : t("No")}</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-md border border-border bg-card p-2">
              {result.valueInQuote ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span> <T>{"Value in Quote:"}</T> {result.valueInQuote ? t("Yes") : t("No")}</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-md border border-border bg-card p-2">
              {result.rangeInQuote ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-amber-500" />
              )}
              <span> <T>{"Range in Quote:"}</T> {result.rangeInQuote ? t("Yes") : t("No/Missing")}</span>
            </div>
          </div>

          {/* Decision Reason */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground"> <T>{"Decision Reason"}</T> </p>
            <p className="mt-0.5 font-mono text-xs text-foreground">
              {result.reason}
            </p>
          </div>

          {/* Rule Trace */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground"> <T>{"Engine Trace"}</T> </p>
            <div className="mt-1 max-h-32 overflow-y-auto rounded-md bg-muted/60 p-2 font-mono text-[11px] text-muted-foreground">
              {result.ruleTrace.map((traceLine, i) => (
                <div key={i}>• {traceLine}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
