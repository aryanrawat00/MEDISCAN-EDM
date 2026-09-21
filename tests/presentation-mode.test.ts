import { afterEach, describe, expect, it, vi } from "vitest";
import { readPresentationMode, setPresentationMode, subscribePresentationMode, PRESENTATION_MODE_KEY } from "@/lib/presentation-mode";

afterEach(() => { vi.unstubAllGlobals(); });

function browser(saved?: string, blocked = false) {
  const storage = new Map(saved ? [[PRESENTATION_MODE_KEY, saved]] : []);
  const target = new EventTarget();
  Object.assign(target, { localStorage: {
    getItem: (key: string) => { if (blocked) throw Error("Storage denied"); return storage.get(key) ?? null; },
    setItem: (key: string, value: string) => { if (blocked) throw Error("Storage denied"); storage.set(key, value); },
  } });
  vi.stubGlobal("window", target);
  return { target, storage };
}

describe("Shared Plain/Technical preference", () => {
  it("defaults to Plain on the server and for guests without a saved setting", () => {
    expect(readPresentationMode()).toBe("plain");
    browser();
    expect(readPresentationMode()).toBe("plain");
  });
  it("restores a saved choice and ignores invalid values", () => {
    browser("technical");
    expect(readPresentationMode()).toBe("technical");
    browser("unexpected");
    expect(readPresentationMode()).toBe("plain");
  });
  it("persists choices and immediately updates both mounted screens", () => {
    const { storage } = browser();
    const report = vi.fn(), medicine = vi.fn();
    const stopReport = subscribePresentationMode(report), stopMedicine = subscribePresentationMode(medicine);
    setPresentationMode("technical");
    expect(storage.get(PRESENTATION_MODE_KEY)).toBe("technical");
    expect(report).toHaveBeenCalledOnce();
    expect(medicine).toHaveBeenCalledOnce();
    stopReport(); stopMedicine();
    setPresentationMode("plain");
    expect(report).toHaveBeenCalledOnce();
    expect(readPresentationMode()).toBe("plain");
  });
  it("responds to preference changes in other tabs", () => {
    const { target } = browser();
    const listener = vi.fn();
    const stop = subscribePresentationMode(listener);
    target.dispatchEvent(Object.assign(new Event("storage"), { key: PRESENTATION_MODE_KEY }));
    target.dispatchEvent(Object.assign(new Event("storage"), { key: "unrelated" }));
    target.dispatchEvent(Object.assign(new Event("storage"), { key: null }));
    expect(listener).toHaveBeenCalledTimes(2);
    stop();
  });
  it("keeps the preference during the session when storage is blocked", () => {
    browser(undefined, true);
    setPresentationMode("technical");
    expect(readPresentationMode()).toBe("technical");
    setPresentationMode("plain");
    expect(readPresentationMode()).toBe("plain");
  });
});
