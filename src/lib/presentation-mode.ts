import { useSyncExternalStore } from "react";

export type PresentationMode = "plain" | "technical";
export const PRESENTATION_MODE_KEY = "mediscan.presentation-mode";
const changeEvent = "mediscan:presentation-mode";
let sessionMode: PresentationMode = "plain";

export function readPresentationMode(): PresentationMode {
  if (typeof window === "undefined") return "plain";
  try {
    return window.localStorage.getItem(PRESENTATION_MODE_KEY) === "technical" ? "technical" : "plain";
  } catch {
    return sessionMode;
  }
}

export function setPresentationMode(mode: PresentationMode) {
  if (typeof window === "undefined") return;
  sessionMode = mode;
  try { window.localStorage.setItem(PRESENTATION_MODE_KEY, mode); } catch { /* Keep the choice for this session. */ }
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribePresentationMode(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === PRESENTATION_MODE_KEY || event.key === null) listener();
  };
  window.addEventListener(changeEvent, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function usePresentationMode() {
  const mode = useSyncExternalStore(subscribePresentationMode, readPresentationMode, () => "plain" as const);
  return { mode, setMode: setPresentationMode };
}
