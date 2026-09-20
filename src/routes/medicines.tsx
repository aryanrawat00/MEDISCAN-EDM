import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { lookupMedicine, type MedicineResult } from "@/lib/ai.functions";
import { saveAnalysis } from "@/lib/analyses";
import { toast } from "sonner";
import { Pill, AlertOctagon } from "lucide-react";

export const Route = createFileRoute("/medicines")({
  head: () => ({ meta: [{ title: "Medicine Lookup — MediScan AI" }] }),
  component: () => (
    <AuthGate>
      <Medicines />
    </AuthGate>
  ),
});

function Medicines() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<MedicineResult | null>(null);
  const fn = useServerFn(lookupMedicine);
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: async () => {
      const out = await fn({ data: { name } });
      await saveAnalysis({
        kind: "medicine",
        title: name.slice(0, 80),
        input: name,
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
          <Pill className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Medicine Lookup</h1>
          <p className="text-sm text-muted-foreground">
            Look up general information about a medicine. Educational only.
          </p>
        </div>
      </div>

      <Disclaimer className="mt-6" />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="space-y-4">
            <div>
              <Label htmlFor="med">Medicine name</Label>
              <input
                id="med"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ibuprofen, Metformin, Amoxicillin…"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              onClick={() => m.mutate()}
              disabled={name.trim().length < 2 || m.isPending}
              className="brand-gradient w-full text-white"
            >
              {m.isPending ? "Looking up…" : "Look up medicine"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          {!result ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
              Information about the medicine will appear here.
            </div>
          ) : (
            <MedicineView r={result} />
          )}
        </div>
      </div>
    </div>
  );
}

function MedicineView({ r }: { r: MedicineResult }) {
  return (
    <div className="space-y-5 text-sm">
      <div>
        <h2 className="text-lg font-semibold">{r.name}</h2>
        <p className="text-muted-foreground">
          {[r.generic_name, r.drug_class].filter(Boolean).join(" · ")}
        </p>
      </div>
      <Section title="Uses">
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          {r.uses.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </Section>
      <Section title="Typical dosage">
        <p className="text-muted-foreground">{r.typical_dosage}</p>
      </Section>
      {r.common_side_effects.length > 0 && (
        <Section title="Common side effects">
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {r.common_side_effects.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Section>
      )}
      {r.serious_side_effects.length > 0 && (
        <Section title="Serious side effects" icon={<AlertOctagon className="h-4 w-4 text-destructive" />}>
          <ul className="list-disc space-y-1 pl-5 text-destructive">
            {r.serious_side_effects.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Section>
      )}
      {r.interactions.length > 0 && (
        <Section title="Interactions">
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {r.interactions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Section>
      )}
      {r.warnings.length > 0 && (
        <Section title="Warnings">
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {r.warnings.map((s, i) => <li key={i}>{s}</li>)}
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
      <h3 className="flex items-center gap-2 text-base font-semibold">{icon} {title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}
