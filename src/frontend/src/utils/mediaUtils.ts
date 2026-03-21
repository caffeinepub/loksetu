/**
 * Compresses an image File using canvas to under maxKb.
 * Returns a base64 data URL string.
 * For videos, returns an Unsplash placeholder URL (can't compress video client-side).
 */
export async function compressImageToBase64(
  file: File,
  maxKb = 80,
): Promise<string> {
  return new Promise((resolve) => {
    if (file.type.startsWith("video/")) {
      // Can't compress video — use placeholder
      const placeholders = [
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=60",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=60",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=60",
      ];
      resolve(placeholders[Math.floor(Math.random() * placeholders.length)]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        // Scale down if very large
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        const tryCompress = (q: number): string => {
          const dataUrl = canvas.toDataURL("image/jpeg", q);
          const kb = Math.round((dataUrl.length * 3) / 4 / 1024);
          if (kb > maxKb && q > 0.1) {
            return tryCompress(q - 0.1);
          }
          return dataUrl;
        };

        resolve(tryCompress(0.7));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
