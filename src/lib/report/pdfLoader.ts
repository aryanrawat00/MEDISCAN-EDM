/**
 * src/lib/report/pdfLoader.ts
 * T11: Browser-only lazy loader for PDF.js (Blueprint §5, D-2).
 * Strictly guards against server execution (import.meta.env.SSR / typeof window).
 * Keeps 0 pdf.js bytes in the server bundle.
 */

export async function loadPdfJs() {
  if (typeof window === "undefined" || (import.meta as any).env?.SSR) {
    throw new Error("PDF extraction is browser-only and cannot run on the server.");
  }

  const pdfjs = await import("pdfjs-dist");
  // Set up standard worker
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  return pdfjs;
}
