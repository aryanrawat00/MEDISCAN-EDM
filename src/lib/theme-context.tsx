import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Mode = "light" | "dark";

export interface ThemePrefs {
  mode: Mode;
  primary: string; // hex
  fontFamily: string;
  fontSize: number; // px base
  radius: number; // px
}

const DEFAULTS: ThemePrefs = {
  mode: "light",
  primary: "#153e56",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  fontSize: 16,
  radius: 10,
};

const KEY = "mediscan.theme";

interface Ctx extends ThemePrefs {
  setPrefs: (patch: Partial<ThemePrefs>) => void;
  reset: () => void;
}

const ThemeCtx = createContext<Ctx | null>(null);

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const n = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const num = parseInt(n, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function applyTheme(p: ThemePrefs) {
  const root = document.documentElement;
  root.classList.toggle("dark", p.mode === "dark");
  const [r, g, b] = hexToRgb(p.primary);
  root.style.setProperty("--brand-r", String(r));
  root.style.setProperty("--brand-g", String(g));
  root.style.setProperty("--brand-b", String(b));
  root.style.setProperty("--brand", p.primary);
  root.style.setProperty("--brand-foreground", "#ffffff");
  root.style.setProperty("--font-base", p.fontFamily);
  root.style.setProperty("--font-size-base", `${p.fontSize}px`);
  root.style.setProperty("--radius", `${p.radius}px`);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<ThemePrefs>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as ThemePrefs;
        setPrefsState(parsed);
        applyTheme(parsed);
        return;
      }
    } catch {
      /* ignore */
    }
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = { ...DEFAULTS, mode: prefersDark ? "dark" : "light" } as ThemePrefs;
    setPrefsState(initial);
    applyTheme(initial);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...prefs,
      setPrefs: (patch) => {
        const next = { ...prefs, ...patch };
        setPrefsState(next);
        applyTheme(next);
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      },
      reset: () => {
        setPrefsState(DEFAULTS);
        applyTheme(DEFAULTS);
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
      },
    }),
    [prefs],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error("useTheme must be used inside <ThemeProvider>");
  return v;
}

