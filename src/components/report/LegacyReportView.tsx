import { T, useI18n } from "@/lib/i18n";
/**
 * src/components/report/LegacyReportView.tsx
 * Renderer for legacy ReportResult rows saved before evidence verification.
 * Shows a banner indicating this analysis was created before evidence-locking was introduced.
 */

import React from "react";
import { LegacyReportResult } from "@/lib/legacy";
import { AlertTriangle, CheckCircle2, AlertOctagon } from "lucide-react";

export function LegacyReportView({ r }: { r: LegacyReportResult }) {
  const { t } = useI18n();
  return (
    <div className="space-y-5 text-sm">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span> <T>{"Legacy analysis — created before evidence verification was introduced."}</T> </span>
      </div>

      <section>
        <h3 className="text-base font-semibold"> <T>{"Summary"}</T> </h3>
        <p className="mt-1 text-muted-foreground">{r.summary}</p>
      </section>

      {r.key_findings && r.key_findings.length > 0 && (
        <Section title={t("Key findings")} icon={<CheckCircle2 className="h-4 w-4" />}>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {r.key_findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Section>
      )}

      {r.abnormal_values && r.abnormal_values.length > 0 && (
        <Section title={t("Abnormal values")}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-1 pr-3"> <T>{"Name"}</T> </th>
                  <th className="py-1 pr-3"> <T>{"Value"}</T> </th>
                  <th className="py-1 pr-3"> <T>{"Reference"}</T> </th>
                  <th className="py-1"> <T>{"Note"}</T> </th>
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

      {r.recommendations && r.recommendations.length > 0 && (
        <Section title={t("Suggested next steps")}>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {r.recommendations.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Section>
      )}

      {r.red_flags && r.red_flags.length > 0 && (
        <Section title={t("Seek care if…")} icon={<AlertOctagon className="h-4 w-4 text-destructive" />}>
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
