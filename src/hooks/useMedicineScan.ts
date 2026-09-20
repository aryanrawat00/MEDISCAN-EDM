/**
 * src/hooks/useMedicineScan.ts
 * M06: State machine hook for Medicine Lens (Blueprint §10).
 * Manages image pre-processing, server vision scanning, error handling, and offline loading.
 */

import { useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { scanMedicine } from "@/lib/medicine.functions";
import { MedicineScanV3 } from "@/lib/medicine/types";
import { processMedicineImage } from "@/lib/medicine/image";
import { toast } from "sonner";

export type MedicineScanStatus =
  | "IDLE"
  | "PROCESSING_IMAGE"
  | "SCANNING"
  | "SUCCESS"
  | "ERROR";

export interface UseMedicineScanReturn {
  status: MedicineScanStatus;
  scan: MedicineScanV3 | null;
  imagePreview: string | null;
  error: string | null;
  scanFile: (file: File) => Promise<MedicineScanV3 | null>;
  loadScan: (scan: MedicineScanV3, previewUrl?: string) => void;
  reset: () => void;
}

export function useMedicineScan(): UseMedicineScanReturn {
  const [status, setStatus] = useState<MedicineScanStatus>("IDLE");
  const [scan, setScan] = useState<MedicineScanV3 | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanFn = useServerFn(scanMedicine);

  const scanFile = useCallback(
    async (file: File): Promise<MedicineScanV3 | null> => {
      setStatus("PROCESSING_IMAGE");
      setError(null);

      try {
        // 1. Client-side canvas resize, compression, and EXIF strip
        const processed = await processMedicineImage(file);
        setImagePreview(processed.dataUrl);

        // 2. Transmit to server vision function
        setStatus("SCANNING");
        const res = await scanFn({
          data: {
            imageBase64: processed.base64,
            fileName: file.name,
            mimeType: processed.mimeType,
          },
        });

        if (!res.ok) {
          setStatus("ERROR");
          setError(res.message);
          toast.error(res.message);
          return null;
        }

        setStatus("SUCCESS");
        setScan(res.data);
        toast.success(
          res.data.status === "IDENTIFIED"
            ? `Identified: ${res.data.monographs.map((m) => m.displayName).join(", ")}`
            : "Packaging scanned.",
        );
        return res.data;
      } catch (err: any) {
        setStatus("ERROR");
        const msg = err?.message || "Failed to process medicine packaging.";
        setError(msg);
        toast.error(msg);
        return null;
      }
    },
    [scanFn],
  );

  const loadScan = useCallback((loadedScan: MedicineScanV3, previewUrl?: string) => {
    setStatus("SUCCESS");
    setScan(loadedScan);
    setError(null);
    if (previewUrl) {
      setImagePreview(previewUrl);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("IDLE");
    setScan(null);
    setImagePreview(null);
    setError(null);
  }, []);

  return {
    status,
    scan,
    imagePreview,
    error,
    scanFile,
    loadScan,
    reset,
  };
}
