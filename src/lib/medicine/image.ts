/**
 * src/lib/medicine/image.ts
 * M04: Client-Side Image Pre-Processing (Blueprint §10).
 * Resizes medicine package photos, compresses to JPEG, and strips EXIF tags
 * on HTML5 Canvas to protect user privacy and reduce bandwidth.
 */

export interface ProcessedImage {
  base64: string;
  dataUrl: string;
  width: number;
  height: number;
  sizeKb: number;
  mimeType: "image/jpeg";
}

export async function processMedicineImage(
  file: File,
  maxDimension = 1600,
  quality = 0.85,
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image format or corrupted file."));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Canvas context could not be created."));
        }

        // Draw image onto canvas (automatically strips EXIF metadata)
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const base64 = dataUrl.split(",")[1] || "";
        const sizeKb = Math.round((base64.length * 0.75) / 1024);

        resolve({
          base64,
          dataUrl,
          width,
          height,
          sizeKb,
          mimeType: "image/jpeg",
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
