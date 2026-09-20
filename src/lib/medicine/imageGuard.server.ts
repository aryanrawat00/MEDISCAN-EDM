/**
 * src/lib/medicine/imageGuard.server.ts
 * M04: Server-Side Image Safety and Header Validation (Blueprint §10).
 * Inspects magic bytes, payload size, and MIME integrity before forwarding to AI vision model.
 */

export interface ImageGuardResult {
  valid: boolean;
  mimeType?: "image/jpeg" | "image/png" | "image/webp";
  sizeBytes?: number;
  error?: string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImagePayload(base64Data: string): ImageGuardResult {
  if (!base64Data || typeof base64Data !== "string") {
    return { valid: false, error: "Empty or invalid image payload." };
  }

  // Strip data URL prefix if provided
  const rawBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "").trim();

  if (rawBase64.length < 50) {
    return { valid: false, error: "Image payload is too small to be a valid image." };
  }

  // Calculate approximate byte size from base64 length
  const sizeBytes = Math.floor((rawBase64.length * 3) / 4);
  if (sizeBytes > MAX_IMAGE_BYTES) {
    return {
      valid: false,
      error: `Image size (${Math.round(sizeBytes / 1024)} KB) exceeds maximum limit of 5 MB.`,
    };
  }

  // Magic bytes inspection via base64 prefix
  let mimeType: "image/jpeg" | "image/png" | "image/webp" | undefined;

  if (rawBase64.startsWith("/9j/")) {
    mimeType = "image/jpeg";
  } else if (rawBase64.startsWith("iVBORw0KGgo")) {
    mimeType = "image/png";
  } else if (rawBase64.startsWith("UklGR")) {
    mimeType = "image/webp";
  } else {
    // Fallback: decode first 8 bytes
    try {
      const buffer = Buffer.from(rawBase64.slice(0, 32), "base64");
      if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        mimeType = "image/jpeg";
      } else if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      ) {
        mimeType = "image/png";
      } else if (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46
      ) {
        mimeType = "image/webp";
      }
    } catch {
      return { valid: false, error: "Corrupted base64 encoding." };
    }
  }

  if (!mimeType) {
    return {
      valid: false,
      error: "Unsupported image format. Allowed formats: JPEG, PNG, or WebP.",
    };
  }

  return {
    valid: true,
    mimeType,
    sizeBytes,
  };
}
