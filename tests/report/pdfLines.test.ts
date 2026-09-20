import { describe, it, expect } from "vitest";
import { clusterPdfLines, linesToPageText, PdfTextItem } from "@/lib/report/pdfLines";

describe("T11: PDF Line Clustering (y-coordinate recovery)", () => {
  it("recovers horizontal lines when stream order is column-drawn", () => {
    // In column-drawn PDFs, the PDF stream contains:
    // "Hemoglobin", "Total Leucocytes", "Platelets" (Column 1)
    // followed by "14.2", "7,200", "250,000" (Column 2)
    // followed by "12.0 - 15.0", "4,000 - 10,000", "150,000 - 450,000" (Column 3)
    const streamItems: PdfTextItem[] = [
      // Column 1 (test names)
      { str: "Hemoglobin", x: 50, y: 700 },
      { str: "Total Leucocyte Count", x: 50, y: 650 },
      { str: "Platelet Count", x: 50, y: 600 },
      // Column 2 (values)
      { str: "14.2", x: 250, y: 700.5 },
      { str: "7,200", x: 250, y: 649.8 },
      { str: "250,000", x: 250, y: 600.2 },
      // Column 3 (ranges)
      { str: "12.0 - 15.0", x: 400, y: 700 },
      { str: "4,000 - 10,000", x: 400, y: 650 },
      { str: "150,000 - 450,000", x: 400, y: 600 },
    ];

    const lines = clusterPdfLines(streamItems);

    expect(lines.length).toBe(3);
    // Line 1: y ~ 700
    expect(lines[0].text).toBe("Hemoglobin 14.2 12.0 - 15.0");
    // Line 2: y ~ 650
    expect(lines[1].text).toBe("Total Leucocyte Count 7,200 4,000 - 10,000");
    // Line 3: y ~ 600
    expect(lines[2].text).toBe("Platelet Count 250,000 150,000 - 450,000");
  });

  it("adds page markers to page text", () => {
    const lines = [
      { y: 700, text: "Fasting Glucose 92 mg/dL 70 - 99", items: [] },
    ];
    const pageText = linesToPageText(lines, 2);
    expect(pageText).toBe("[[Page 2]]\nFasting Glucose 92 mg/dL 70 - 99");
  });
});
