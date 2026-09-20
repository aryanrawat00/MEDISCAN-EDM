import { createFileRoute } from "@tanstack/react-router";
import { useTheme, type Mode } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — MediScan AI" }] }),
  component: Settings,
});

const PRESET_COLORS = [
  "#2563eb",
  "#0ea5e9",
  "#14b8a6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#ef4444",
];

const FONTS = [
  { label: "Inter (default)", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { label: "System", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Serif", value: 'ui-serif, Georgia, "Times New Roman", serif' },
  { label: "Mono", value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  { label: "Rounded", value: '"SF Pro Rounded", "Nunito", system-ui, sans-serif' },
];

function Settings() {
  const t = useTheme();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Appearance</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tune the look and feel. Changes are saved to your browser.
      </p>

      <div className="mt-6 space-y-6 rounded-2xl border border-border bg-card p-6">
        <div>
          <Label>Theme mode</Label>
          <div className="mt-2 flex gap-2">
            {(["light", "dark"] as Mode[]).map((m) => (
              <Button
                key={m}
                variant={t.mode === m ? "default" : "outline"}
                onClick={() => t.setPrefs({ mode: m })}
                className={t.mode === m ? "brand-gradient text-white" : ""}
              >
                {m === "light" ? "Light" : "Dark"}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="color">Brand color</Label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              id="color"
              type="color"
              value={t.primary}
              onChange={(e) => t.setPrefs({ primary: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  aria-label={c}
                  onClick={() => t.setPrefs({ primary: c })}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    t.primary.toLowerCase() === c ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <code className="text-xs text-muted-foreground">{t.primary}</code>
          </div>
        </div>

        <div>
          <Label htmlFor="font">Font family</Label>
          <select
            id="font"
            value={t.fontFamily}
            onChange={(e) => t.setPrefs({ fontFamily: e.target.value })}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="fontSize">Font size — {t.fontSize}px</Label>
          <input
            id="fontSize"
            type="range"
            min={12}
            max={20}
            step={1}
            value={t.fontSize}
            onChange={(e) => t.setPrefs({ fontSize: Number(e.target.value) })}
            className="mt-2 w-full"
          />
        </div>

        <div>
          <Label htmlFor="radius">Corner radius — {t.radius}px</Label>
          <input
            id="radius"
            type="range"
            min={0}
            max={24}
            step={1}
            value={t.radius}
            onChange={(e) => t.setPrefs({ radius: Number(e.target.value) })}
            className="mt-2 w-full"
          />
        </div>

        <div className="border-t border-border pt-4">
          <Button variant="outline" onClick={t.reset}>
            Reset to defaults
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button className="brand-gradient text-white">Primary action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <span className="brand-text-gradient text-xl font-semibold">Heading sample</span>
        </div>
      </div>
    </div>
  );
}
