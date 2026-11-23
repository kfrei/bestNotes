import type { Notebook, NotePage } from '../types/note';
import { compactStrokeForStorage } from '../services/storage/storageCleaners';

const notebookByteSizeCache = new WeakMap<Notebook, number>();
const pageByteSizeCache = new WeakMap<NotePage, number>();

/**
 * Unified, Zero-Slowdown WeakMap-cached storage byte estimator for a single Notebook.
 * Used across both the main App UI (Library / Quotas) and Admin Telemetry (`userStatsService`).
 */
export function computeNotebookSizeBytes(nb: Notebook): number {
  const cachedNb = notebookByteSizeCache.get(nb);
  if (cachedNb !== undefined) return cachedNb;

  const hasNativeSize = typeof nb.nativeFileSizeBytes === 'number' && nb.nativeFileSizeBytes > 0;
  let totalBytes = hasNativeSize ? nb.nativeFileSizeBytes! : 256 + (nb.title?.length || 0) * 2;
  const pages = nb.pages || [];

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    let pBytes = pageByteSizeCache.get(p);
    if (pBytes === undefined) {
      pBytes = hasNativeSize ? 0 : 240 + (p.backgroundDataUrl?.length || 0);
      const imgs = p.images || [];
      for (let j = 0; j < imgs.length; j++) {
        pBytes += 180 + (imgs[j].dataUrl?.length || 0);
      }
      const strokes = p.strokes || [];
      for (let j = 0; j < strokes.length; j++) {
        const cs = compactStrokeForStorage(strokes[j]);
        pBytes += 96 + (cs.points?.length || 0) * 22;
      }
      const texts = p.texts || [];
      for (let j = 0; j < texts.length; j++) {
        pBytes += 160 + (texts[j].text?.length || 0) * 3;
      }
      const heatSims = p.heatSims || [];
      for (let j = 0; j < heatSims.length; j++) {
        const hs = heatSims[j];
        pBytes += 480 + (hs.objects?.length || 0) * 280 + (hs.history?.length || 0) * 64;
      }
      const springSims = p.springSims || [];
      for (let j = 0; j < springSims.length; j++) {
        pBytes += 420;
      }
      const circuitSims = p.circuitSims || [];
      for (let j = 0; j < circuitSims.length; j++) {
        pBytes += 420;
      }
      pageByteSizeCache.set(p, pBytes);
    }
    totalBytes += pBytes;
  }

  notebookByteSizeCache.set(nb, totalBytes);
  return totalBytes;
}

/**
 * Unified total storage bytes estimator across a list of notebooks.
 */
export function computeTotalNotebooksSizeBytes(notebooks: Notebook[]): number {
  let total = 0;
  for (let i = 0; i < notebooks.length; i++) {
    total += computeNotebookSizeBytes(notebooks[i]);
  }
  return total;
}
