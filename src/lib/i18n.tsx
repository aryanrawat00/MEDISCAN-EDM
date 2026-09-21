import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { messages } from "./locales/messages";

export const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "bn", name: "বাংলা" },
] as const;
export type Language = (typeof languages)[number]["code"];
export function isLanguage(value: unknown): value is Language {
  return languages.some(({ code }) => code === value);
}
export function translate(language: Language, key: string, values: Record<string, string | number> = {}): string {
  const entry = messages[key];
  const template = language === "en" ? key : entry?.[language] || key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => Object.hasOwn(values, name) ? String(values[name]) : match);
}
const I18nContext = createContext({ language: "en" as Language, setLanguage: (_: Language) => {}, t: (key: string, values?: Record<string, string | number>) => translate("en", key, values) });
export function I18nProvider({ children }: { children: ReactNode }) {
  // Start with English for matching server/client markup, then restore the preference.
  const [language, updateLanguage] = useState<Language>("en");
  useEffect(() => {
    try { const saved = localStorage.getItem("mediscan.language"); if (isLanguage(saved)) updateLanguage(saved); } catch { /* Storage may be disabled. */ }
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const value = useMemo(() => ({
    language,
    setLanguage: (next: Language) => { updateLanguage(next); try { localStorage.setItem("mediscan.language", next); } catch { /* Preference remains available in this session. */ } },
    t: (key: string, values?: Record<string, string | number>) => translate(language, key, values),
  }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export const useI18n = () => useContext(I18nContext);
/** Only explicitly authored interface copy is translated. Never pass source evidence or medical data. */
export function T({ children }: { children: string }) { const { t } = useI18n(); return <>{t(children)}</>; }
