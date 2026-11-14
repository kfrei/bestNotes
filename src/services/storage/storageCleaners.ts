/**
 * BestNotes Storage Cleaners & Serialization
 * Domain 5: Cleaners, WeakMap memoization, and payload optimizers
 */

import type { Notebook } from '../../types/note';

export function getNotebookContentScore(nb: Notebook): number {
  return (nb.pages || []).reduce(
    (acc, p) =>
      acc +
      (p.strokes?.length || 0) * 2 +
      (p.images?.length || 0) * 8 +
      (p.texts?.length || 0) * 3 +
      (p.tapes?.length || 0) * 2 +
      (p.backgroundDataUrl ? 10 : 0),
    0
  );
}

const cleanedNotebookStorageCache = new WeakMap<Notebook, Notebook>();

export function cleanNotebookForStorage(nb: Notebook): Notebook {
  const cached = cleanedNotebookStorageCache.get(nb);
  if (cached) return cached;
  // Strip duplicate base64 originalDataUrl when image is already cropped to a data: URL
  // and purge empty or whitespace-only non-math text boxes
  const cleaned: Notebook = {
    ...nb,
    pages: (nb.pages || []).map((p) => {
      const imgs = p.images || [];
      let anyImgChanged = false;
      for (let i = 0; i < imgs.length; i++) {
        const im = imgs[i];
        if (im.originalDataUrl && im.originalDataUrl.startsWith('data:')) {
          anyImgChanged = true;
          break;
        }
      }
      const texts = p.texts || [];
      const cleanTexts = texts.filter((t) => {
        if (!t) return false;
        if (t.isMath) {
          return Boolean(
            (t.text && t.text.trim().length > 0) || (t.latex && t.latex.trim().length > 0)
          );
        }
        return Boolean(t.text && t.text.trim().length > 0);
      });
      const textsChanged = cleanTexts.length !== texts.length;
      if (!anyImgChanged && !textsChanged) return p;
      return {
        ...p,
        texts: textsChanged ? cleanTexts : p.texts,
        images: anyImgChanged
          ? imgs.map((im) => ({
              ...im,
              originalDataUrl:
                im.originalDataUrl && im.originalDataUrl.startsWith('data:')
                  ? undefined
                  : im.originalDataUrl,
            }))
          : p.images,
      };
    }),
  };
  cleanedNotebookStorageCache.set(nb, cleaned);
  return cleaned;
}

const serializedFirestoreCache = new WeakMap<Notebook, string>();

export function serializeNotebookForFirestore(nb: Notebook): string {
  const cached = serializedFirestoreCache.get(nb);
  if (cached !== undefined) return cached;
  const cleaned = cleanNotebookForStorage(nb);
  const pages = cleaned.pages || [];
  let totalBgChars = 0;
  for (let i = 0; i < pages.length; i++) {
    totalBgChars += pages[i].backgroundDataUrl?.length || 0;
  }
  // For multi-page PDF books (> 5 pages & > 2.5 MB of base64 page backgrounds),
  // keep page 0's cover background + 100% of strokes/texts/images/layers in Firestore while
  // keeping the heavy PDF page bitmaps in fast local IndexedDB so JSON.stringify & Firestore sync never freeze or flood chunks!
  const forFirestore: Notebook =
    pages.length > 5 && totalBgChars > 2_500_000
      ? {
          ...cleaned,
          pages: pages.map((p, idx) =>
            idx === 0 || !p.backgroundDataUrl ? p : { ...p, backgroundDataUrl: undefined }
          ),
        }
      : cleaned;
  const json = JSON.stringify(forFirestore);
  serializedFirestoreCache.set(nb, json);
  return json;
}

export function cleanNotebookForLibraryCache(nb: Notebook): Notebook {
  return {
    ...nb,
    pages: (nb.pages || []).map((p, idx) => {
      if (idx === 0) {
        return {
          ...p,
          backgroundDataUrl:
            p.backgroundDataUrl && p.backgroundDataUrl.length < 250_000
              ? p.backgroundDataUrl
              : undefined,
          strokes: (p.strokes || []).slice(0, 400),
          texts: (p.texts || []).slice(0, 80),
          images: (p.images || []).slice(0, 5),
        };
      }
      return {
        ...p,
        strokes: [],
        shapes: [],
        texts: [],
        images: [],
        tapes: [],
        backgroundDataUrl: undefined,
      };
    }),
  };
}
