import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { analyzeReport, type ReportResult } from "@/lib/ai.functions";
import { saveAnalysis } from "@/lib/analyses";
import { toast } from "sonner";
import { FileText, Upload, AlertOctagon, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/analyzer")({
  head: () => ({ meta: [{ title: "Report Analyzer — MediScan AI" }] }),
  component: () => (
    <AuthGate>
      <Analyzer />
    </AuthGate>
  ),
});

function Analyzer() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [result, setResult] = useState<ReportResult | null>(null);
  const analyzeFn = useServerFn(analyzeReport);
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: async () => {
      const out = await analyzeFn({ data: { text } });
      const finalTitle = title.trim() || `Report · ${new Date().toLocaleDateString()}`;
      await saveAnalysis({ kind: "report", title: finalTitle, input: text, result: out });
      qc.invalidateQueries({ queryKey: ["analyses"] });
      return out;
    },
    onSuccess: (r) => {
      setResult(r);
      toast.success("Report analyzed and saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onFile = async (file: File) => {
    if (!file.type.startsWith("text/") && !file.name.endsWith(".txt")) {
      toast.error("Please upload a plain .txt file. For PDFs, copy and paste the text.");
      return;
    }
    const t = await file.text();
    setText(t);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg brand-gradient text-white">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Medical Report Analyzer</h1>
          <p className="text-sm text-muted-foreground">
            Paste or upload report text. We'll summarize key findings.
          </p>
        </div>
      </div>

      <Disclaimer className="mt-6" />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Blood test — Oct 2025"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="report">Report text</Label>
              <Textarea
                id="report"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your medical report text here…"
                className="mt-1 min-h-[260px]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Upload className="h-4 w-4" />
                <span>Upload .txt</span>
                <input
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                />
              </label>
              <Button
                onClick={() => m.mutate()}
                disabled={text.trim().length < 20 || m.isPending}
                className="brand-gradient text-white"
              >
                {m.isPending ? "Analyzing…" : "Analyze report"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          {!result ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
              The structured analysis will appear here.
            </div>
          ) : (
            <ReportView r={result} />
          )}
        </div>
      </div>
    </div>
  );
}

function ReportView({ r }: { r: ReportResult }) {
  return (
    <div className="space-y-5 text-sm">
      <section>
        <h3 className="text-base font-semibold">Summary</h3>
        <p className="mt-1 text-muted-foreground">{r.summary}</p>
      </section>
      {r.key_findings.length > 0 && (
        <Section title="Key findings" icon={<CheckCircle2 className="h-4 w-4" />}>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {r.key_findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Section>
      )}
      {r.abnormal_values.length > 0 && (
        <Section title="Abnormal values">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-1 pr-3">Name</th>
                  <th className="py-1 pr-3">Value</th>
                  <th className="py-1 pr-3">Reference</th>
                  <th className="py-1">Note</th>
                </tr>
              </thead>
              <tbody>
                {r.abnormal_values.map((v, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-1 pr-3 font-medium">{v.name}</td>
                    <td className="py-1 pr-3">{v.value}</td>
                    <td className="py-1 pr-3 text-muted-foreground">{v.reference ?? "—"}</td>
                    <td className="py-1 text-muted-foreground">{v.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
      {r.recommendations.length > 0 && (
        <Section title="Suggested next steps">
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {r.recommendations.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Section>
      )}
      {r.red_flags.length > 0 && (
        <Section title="Seek care if…" icon={<AlertOctagon className="h-4 w-4 text-destructive" />}>
          <ul className="list-disc space-y-1 pl-5 text-destructive">
            {r.red_flags.map((f, i) => (
              <li key={i}>{f}</li>
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
