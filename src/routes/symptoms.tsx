import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { checkSymptoms, type SymptomResult } from "@/lib/ai.functions";
import { saveAnalysis } from "@/lib/analyses";
import { toast } from "sonner";
import { Stethoscope, AlertOctagon } from "lucide-react";

export const Route = createFileRoute("/symptoms")({
  head: () => ({ meta: [{ title: "Symptom Checker — MediScan AI" }] }),
  component: () => (
    <AuthGate>
      <Symptoms />
    </AuthGate>
  ),
});

function Symptoms() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [result, setResult] = useState<SymptomResult | null>(null);
  const fn = useServerFn(checkSymptoms);
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: async () => {
      const out = await fn({ data: { symptoms, age: age || undefined, sex: sex || undefined } });
      await saveAnalysis({
        kind: "symptom",
        title: symptoms.split("\n")[0].slice(0, 80) || "Symptom check",
        input: symptoms,
        result: out,
      });
      qc.invalidateQueries({ queryKey: ["analyses"] });
      return out;
    },
    onSuccess: (r) => {
      setResult(r);
      toast.success("Saved to your history");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg brand-gradient text-white">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Symptom Checker</h1>
          <p className="text-sm text-muted-foreground">
            Describe your symptoms. Get an educational overview — not a diagnosis.
          </p>
        </div>
      </div>

      <Disclaimer className="mt-6" />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age">Age (optional)</Label>
                <input
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 32"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="sex">Sex (optional)</Label>
                <input
                  id="sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  placeholder="female / male / other"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="symptoms">What are you feeling?</Label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Sore throat for 3 days, mild fever, dry cough…"
                className="mt-1 min-h-[220px]"
              />
            </div>
            <Button
              onClick={() => m.mutate()}
              disabled={symptoms.trim().length < 5 || m.isPending}
              className="brand-gradient w-full text-white"
            >
              {m.isPending ? "Thinking…" : "Check symptoms"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          {!result ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
              Your educational overview will appear here.
            </div>
          ) : (
            <SymptomView r={result} />
          )}
        </div>
      </div>
    </div>
  );
}

function SymptomView({ r }: { r: SymptomResult }) {
  return (
    <div className="space-y-5 text-sm">
      <p className="text-muted-foreground">{r.summary}</p>
      {r.possible_conditions.length > 0 && (
        <section>
          <h3 className="text-base font-semibold">Possible directions</h3>
          <ul className="mt-2 space-y-2">
            {r.possible_conditions.map((c, i) => (
              <li
                key={i}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{c.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.likelihood === "high"
                        ? "bg-destructive/15 text-destructive"
                        : c.likelihood === "moderate"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.likelihood}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{c.explanation}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {r.self_care.length > 0 && (
        <Section title="Self-care ideas">
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {r.self_care.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Section>
      )}
      {r.when_to_seek_care.length > 0 && (
        <Section title="When to seek care">
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {r.when_to_seek_care.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Section>
      )}
      {r.red_flags.length > 0 && (
        <Section title="Urgent red flags" icon={<AlertOctagon className="h-4 w-4 text-destructive" />}>
          <ul className="list-disc space-y-1 pl-5 text-destructive">
            {r.red_flags.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Section>
      )}
      <p className="border-t border-border pt-3 text-xs text-muted-foreground">{r.disclaimer}</p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-base font-semibold">
        {icon} {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}
