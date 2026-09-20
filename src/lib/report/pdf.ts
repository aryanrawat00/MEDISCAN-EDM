/**
 * src/lib/report/pdf.ts
 * T11: Browser-based PDF text extraction (Blueprint §5, §11).
 * Extracts raw page items from uploaded PDF files, clusters them into lines
 * using y-coordinate clustering, and returns structured page-annotated text.
 */

import { loadPdfJs } from "./pdfLoader";
import { clusterPdfLines, linesToPageText, PdfTextItem } from "./pdfLines";

export interface PdfExtractionResult {
  text: string;
  pages: number;
}

export async function extractTextFromPdf(
  fileOrBuffer: File | ArrayBuffer,
): Promise<PdfExtractionResult> {
  const pdfjs = await loadPdfJs();

  const buffer =
    fileOrBuffer instanceof File
      ? await fileOrBuffer.arrayBuffer()
      : fileOrBuffer;

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const items: PdfTextItem[] = [];
    for (const item of textContent.items) {
      if ("str" in item && item.str) {
        // item.transform gives [scaleX, skewY, skewX, scaleY, transX, transY]
        const tx = item.transform?.[4] ?? 0;
        const ty = item.transform?.[5] ?? 0;
        items.push({
          str: item.str,
          x: tx,
          y: ty,
          width: item.width,
          height: item.height,
        });
      }
    }

    const lines = clusterPdfLines(items);
    pageTexts.push(linesToPageText(lines, pageNum));
  }

  return {
    text: pageTexts.join("\n\n"),
    pages: numPages,
  };
}
