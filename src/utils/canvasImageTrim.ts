/**
 * Lightweight Canvas Image Trim & Monochrome Sketch Tinting Utilities
 * Extracted from stickersCatalog.ts so App.tsx can trim/tint pasted images
 * without eagerly bundling the 456KB stickers catalog on startup.
 */

/**
 * Automatically trims transparent borders/padding around visible pixels in a canvas,
 * returning a snugly-cropped canvas with a small specified padding cushion.
 */
export function autoTrimCanvasToVisibleBounds(
  canvas: HTMLCanvasElement,
  padding = 6,
  alphaThreshold = 6
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const w = canvas.width;
  const h = canvas.height;
  if (w <= 2 || h <= 2) return canvas;

  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < h; y++) {
      const rowOffset = y * w * 4;
      for (let x = 0; x < w; x++) {
        const a = d[rowOffset + x * 4 + 3];
        if (a > alphaThreshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX === -1 || maxY === -1) {
      return canvas;
    }

    if (
      minX <= padding &&
      minY <= padding &&
      maxX >= w - 1 - padding &&
      maxY >= h - 1 - padding
    ) {
      return canvas;
    }

    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const rightX = Math.min(w, maxX + 1 + padding);
    const bottomY = Math.min(h, maxY + 1 + padding);
    const cropW = Math.max(1, rightX - cropX);
    const cropH = Math.max(1, bottomY - cropY);

    if (cropW >= w - 4 && cropH >= h - 4) {
      return canvas;
    }

    const trimmed = document.createElement('canvas');
    trimmed.width = cropW;
    trimmed.height = cropH;
    const tCtx = trimmed.getContext('2d');
    if (!tCtx) return canvas;

    tCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return trimmed;
  } catch {
    return canvas;
  }
}

export async function tintMonochromeSketchDataUrl(
  sourceUrl: string,
  targetHexColor: string
): Promise<string> {
  const cleanHex = (targetHexColor || '#1d4ed8').replace('#', '');
  const tr = parseInt(cleanHex.slice(0, 2) || '1d', 16) / 255;
  const tg = parseInt(cleanHex.slice(2, 4) || '4e', 16) / 255;
  const tb = parseInt(cleanHex.slice(4, 6) || 'd8', 16) / 255;

  return await new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || 512;
      const h = img.naturalHeight || 512;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      let minR = 255;
      let minG = 255;
      let minB = 255;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 64) continue;
        if (d[i] < minR) minR = d[i];
        if (d[i + 1] < minG) minG = d[i + 1];
        if (d[i + 2] < minB) minB = d[i + 2];
      }
      const ch = minR <= minG && minR <= minB ? 0 : minG <= minB ? 1 : 2;
      const minVal = ch === 0 ? minR : ch === 1 ? minG : minB;
      const denom = Math.max(30, 255 - minVal);

      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 10) {
          d[i] = 0;
          d[i + 1] = 0;
          d[i + 2] = 0;
          d[i + 3] = 0;
          continue;
        }
        const lum = Math.max(0, Math.min(1, (d[i + ch] - minVal) / denom));
        const rVal = Math.round((tr + lum * (1 - tr)) * 255);
        const gVal = Math.round((tg + lum * (1 - tg)) * 255);
        const bVal = Math.round((tb + lum * (1 - tb)) * 255);
        d[i] = rVal;
        d[i + 1] = gVal;
        d[i + 2] = bVal;
        d[i + 3] = d[i + 3] > 246 ? 255 : d[i + 3];
      }
      ctx.putImageData(imgData, 0, 0);
      const trimmed = autoTrimCanvasToVisibleBounds(canvas, 6);
      const pngUrl = trimmed.toDataURL('image/png');
      const isAppleWebKit =
        typeof navigator !== 'undefined' &&
        (/iPad|iPhone|iPod/i.test(navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
          /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent));
      if (isAppleWebKit) {
        resolve(pngUrl);
        return;
      }
      const webpUrl = trimmed.toDataURL('image/webp', 0.86);
      resolve(
        webpUrl.startsWith('data:image/webp') && webpUrl.length < pngUrl.length ? webpUrl : pngUrl
      );
    };
    img.onerror = reject;
    img.src = sourceUrl;
  });
}
