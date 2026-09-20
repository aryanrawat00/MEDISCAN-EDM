/**
 * src/lib/report/pdfLines.ts
 * T11: Pure y-clustering line recovery algorithm (Blueprint §5, §11, D-3).
 * Reconstructs visual text lines from PDF items based on y-coordinate proximity,
 * rather than arbitrary stream order (which destroys multi-column table layout).
 */

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ReconstructedLine {
  y: number;
  text: string;
  items: PdfTextItem[];
}

/**
 * Groups raw PDF text items into lines using y-coordinate clustering.
 * @param items Array of text items from PDF page
 * @param yTolerance Vertical tolerance in pixels to consider items on the same line (default 3.5)
 */
export function clusterPdfLines(
  items: PdfTextItem[],
  yTolerance: number = 3.5,
): ReconstructedLine[] {
  if (!items || items.length === 0) return [];

  // Filter out empty items
  const validItems = items.filter((it) => it.str && it.str.trim().length > 0);
  if (validItems.length === 0) return [];

  // Group items into y-clusters
  const clusters: { avgY: number; items: PdfTextItem[] }[] = [];

  for (const item of validItems) {
    let matchedCluster = false;
    for (const cluster of clusters) {
      if (Math.abs(cluster.avgY - item.y) <= yTolerance) {
        cluster.items.push(item);
        // Update rolling average y
        cluster.avgY =
          cluster.items.reduce((sum, it) => sum + it.y, 0) / cluster.items.length;
        matchedCluster = true;
        break;
      }
    }

    if (!matchedCluster) {
      clusters.push({
        avgY: item.y,
        items: [item],
      });
    }
  }

  // Sort clusters vertically (descending y for standard PDF coordinates where y=0 is bottom,
  // or ascending if transformed. We detect trend or sort top-to-bottom: descending y).
  clusters.sort((a, b) => b.avgY - a.avgY);

  // For each cluster, sort items horizontally left-to-right (ascending x)
  const lines: ReconstructedLine[] = clusters.map((cluster) => {
    cluster.items.sort((a, b) => a.x - b.x);
    const lineText = cluster.items.map((it) => it.str.trim()).join(" ");
    return {
      y: cluster.avgY,
      text: lineText,
      items: cluster.items,
    };
  });

  return lines;
}

/**
 * Converts clustered lines into a single page string.
 */
export function linesToPageText(lines: ReconstructedLine[], pageNumber?: number): string {
  const content = lines.map((l) => l.text).join("\n");
  if (pageNumber !== undefined) {
    return `[[Page ${pageNumber}]]\n${content}`;
  }
  return content;
}
