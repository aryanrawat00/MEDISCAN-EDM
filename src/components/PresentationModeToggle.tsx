import { T, useI18n } from "@/lib/i18n";
import { usePresentationMode } from "@/lib/presentation-mode";

/** Reuses the FindingsTable Simple/Detailed pill styling and pressed-button behavior. */
export function PresentationModeToggle() {
  const { mode, setMode } = usePresentationMode();
  const { t } = useI18n();
  return (
    <div role="group" aria-label={t("Explanation detail")} className="inline-flex shrink-0 gap-1 rounded-lg border border-border bg-card p-1">
      {(["plain", "technical"] as const).map(value => (
        <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}
          className={`rounded-md px-3 py-2 text-xs ${mode === value ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>
          <T>{value === "plain" ? "Plain" : "Technical"}</T>
        </button>
      ))}
    </div>
  );
}
