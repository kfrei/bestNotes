import * as pdfjsLib from 'pdfjs-dist';
import { NotePage, PaperTemplateType, A4_SHORT_PX, A4_LONG_PX } from '../types/note';

// Configure PDF.js worker for Vite bundle
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const IDB_NAME = 'bestnotes_idb_v1';
const IDB_STORE = 'notebooks_by_uid';

const pdfDocProxyCache = new Map<string, pdfjsLib.PDFDocumentProxy>();
const pdfDocLoadingCache = new Map<string, Promise<pdfjsLib.PDFDocumentProxy | null>>();
const renderedPdfPageCache = new Map<string, string>();
const inFlightPageRenders = new Map<string, Promise<string | null>>();

function openBestNotesIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRawPdfToIndexedDB(notebookId: string, buffer: ArrayBuffer): Promise<void> {
  if (!notebookId || typeof indexedDB === 'undefined') return;
  try {
    const db = await openBestNotesIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(buffer, `pdf_raw_${notebookId}`);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore storage quota errors
  }
}

export async function loadRawPdfFromIndexedDB(notebookId: string): Promise<ArrayBuffer | null> {
  if (!notebookId || typeof indexedDB === 'undefined') return null;
  try {
    const db = await openBestNotesIdb();
    return await new Promise<ArrayBuffer | null>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(`pdf_raw_${notebookId}`);
      req.onsuccess = () => {
        const res = req.result;
        if (res instanceof ArrayBuffer) {
          resolve(res);
        } else if (res && ArrayBuffer.isView(res)) {
          resolve(res.buffer.slice(res.byteOffset, res.byteOffset + res.byteLength));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function getOrLoadPdfDocProxy(notebookId: string): Promise<pdfjsLib.PDFDocumentProxy | null> {
  const existing = pdfDocProxyCache.get(notebookId);
  if (existing) return existing;
  const pending = pdfDocLoadingCache.get(notebookId);
  if (pending) return pending;

  const loadPromise = (async () => {
    try {
      const rawBuffer = await loadRawPdfFromIndexedDB(notebookId);
      if (!rawBuffer) return null;
      const loadingTask = pdfjsLib.getDocument({ data: rawBuffer.slice(0) });
      const pdfDoc = await loadingTask.promise;
      pdfDocProxyCache.set(notebookId, pdfDoc);
      return pdfDoc;
    } catch {
      return null;
    } finally {
      pdfDocLoadingCache.delete(notebookId);
    }
  })();

  pdfDocLoadingCache.set(notebookId, loadPromise);
  return loadPromise;
}

export type PdfQualityMode = 'thumb' | 'med' | 'high' | 'full';

function setCachedPageDataUrl(cacheKey: string, dataUrl: string, qualityMode: PdfQualityMode) {
  if (renderedPdfPageCache.has(cacheKey)) {
    renderedPdfPageCache.delete(cacheKey);
  }
  renderedPdfPageCache.set(cacheKey, dataUrl);
  const maxEntries = qualityMode === 'thumb' ? 260 : qualityMode === 'med' ? 140 : 80;
  if (renderedPdfPageCache.size > maxEntries + 80) {
    let removed = 0;
    for (const k of renderedPdfPageCache.keys()) {
      renderedPdfPageCache.delete(k);
      removed++;
      if (removed >= 24) break;
    }
  }
}

interface QueuedPdfPageRender {
  cacheKey: string;
  notebookId: string;
  pageNumber: number;
  qualityMode: PdfQualityMode;
  promise: Promise<string | null>;
  resolve: (val: string | null) => void;
}

const pendingPdfRenderQueue: QueuedPdfPageRender[] = [];
let activePdfRenderWorkers = 0;
const MAX_CONCURRENT_PDF_RENDERS = 3;
const MAX_PENDING_PDF_QUEUE = 28;

async function executeSinglePdfPageRender(
  notebookId: string,
  pageNumber: number,
  qualityMode: PdfQualityMode,
  cacheKey: string
): Promise<string | null> {
  const exactCached = renderedPdfPageCache.get(cacheKey);
  if (exactCached) return exactCached;

  const pdfDoc = await getOrLoadPdfDocProxy(notebookId);
  if (!pdfDoc || pageNumber < 1 || pageNumber > pdfDoc.numPages) return null;

  const totalPages = pdfDoc.numPages;
  // Slightly scale down intermediate tiers on very large textbooks (50+ pages) to keep RAM/VRAM ultra-low
  const largeDocFactor = totalPages > 80 ? 0.9 : totalPages > 30 ? 0.95 : 1.0;

  const pdfPage = await pdfDoc.getPage(pageNumber);
  const unscaledViewport = pdfPage.getViewport({ scale: 1 });
  const aspect = Math.max(
    0.25,
    Math.min(4, unscaledViewport.width / Math.max(1, unscaledViewport.height))
  );
  const isLandscape = aspect > 1.05;
  const customWidth = isLandscape
    ? A4_LONG_PX
    : Math.max(320, Math.round(A4_LONG_PX * aspect));
  const customHeight = isLandscape
    ? Math.max(320, Math.round(A4_LONG_PX / aspect))
    : A4_LONG_PX;

  const baseScale =
    qualityMode === 'thumb'
      ? 0.38
      : qualityMode === 'med'
      ? 0.72
      : qualityMode === 'high'
      ? 1.08
      : 1.52;
  const targetScale = baseScale * (qualityMode === 'full' ? 1.0 : largeDocFactor);
  const jpegQuality =
    qualityMode === 'thumb'
      ? 0.64
      : qualityMode === 'med'
      ? 0.76
      : qualityMode === 'high'
      ? 0.82
      : 0.86;

  const scale = Math.min(
    (customWidth * targetScale) / Math.max(1, unscaledViewport.width),
    (customHeight * targetScale) / Math.max(1, unscaledViewport.height)
  );
  const viewport = pdfPage.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext('2d', { alpha: false })!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await pdfPage.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
  canvas.width = 1;
  canvas.height = 1;
  try {
    pdfPage.cleanup();
  } catch {
    // ignore
  }

  setCachedPageDataUrl(cacheKey, dataUrl, qualityMode);
  return dataUrl;
}

function pumpPdfRenderQueue() {
  while (activePdfRenderWorkers < MAX_CONCURRENT_PDF_RENDERS && pendingPdfRenderQueue.length > 0) {
    // Pop from the FRONT (most recently requested visible page = LIFO priority!)
    const job = pendingPdfRenderQueue.shift()!;
    activePdfRenderWorkers++;
    void executeSinglePdfPageRender(job.notebookId, job.pageNumber, job.qualityMode, job.cacheKey)
      .then((url) => {
        job.resolve(url);
      })
      .catch(() => {
        job.resolve(null);
      })
      .finally(() => {
        inFlightPageRenders.delete(job.cacheKey);
        activePdfRenderWorkers--;
        pumpPdfRenderQueue();
      });
  }
}

export function getCachedPdfPageDataUrl(
  notebookId: string,
  pageNumber: number,
  qualityMode: PdfQualityMode = 'full',
  exactOnly = false
): string | undefined {
  const exactKey = `${notebookId}__p${pageNumber}__${qualityMode}`;
  const exact = renderedPdfPageCache.get(exactKey);
  if (exact) return exact;
  if (exactOnly) return undefined;

  // If a higher-resolution render is already in cache, reuse it immediately without re-rendering!
  const hierarchy: PdfQualityMode[] = ['full', 'high', 'med', 'thumb'];
  const requestedRank = hierarchy.indexOf(qualityMode);
  for (let i = 0; i < requestedRank; i++) {
    const higher = renderedPdfPageCache.get(`${notebookId}__p${pageNumber}__${hierarchy[i]}`);
    if (higher) return higher;
  }
  return undefined;
}

export function getBestAvailablePdfPageDataUrl(
  notebookId: string,
  pageNumber: number
): string | undefined {
  const hierarchy: PdfQualityMode[] = ['full', 'high', 'med', 'thumb'];
  for (const mode of hierarchy) {
    const found = renderedPdfPageCache.get(`${notebookId}__p${pageNumber}__${mode}`);
    if (found) return found;
  }
  return undefined;
}

export function ensurePdfPageDataUrl(
  notebookId: string,
  pageNumber: number,
  qualityMode: PdfQualityMode = 'full'
): Promise<string | null> {
  const existing = getCachedPdfPageDataUrl(notebookId, pageNumber, qualityMode, false);
  if (existing) return Promise.resolve(existing);

  const cacheKey = `${notebookId}__p${pageNumber}__${qualityMode}`;
  // If already waiting in the queue, promote it to the very front (LIFO priority!)
  const queuedIdx = pendingPdfRenderQueue.findIndex((item) => item.cacheKey === cacheKey);
  if (queuedIdx >= 0) {
    if (queuedIdx > 0) {
      const [item] = pendingPdfRenderQueue.splice(queuedIdx, 1);
      pendingPdfRenderQueue.unshift(item);
    }
    return pendingPdfRenderQueue[0].promise;
  }

  const inFlight = inFlightPageRenders.get(cacheKey);
  if (inFlight) return inFlight;

  let resolveFn!: (val: string | null) => void;
  const renderPromise = new Promise<string | null>((resolve) => {
    resolveFn = resolve;
  });

  // Insert at the front of the queue so the page the user just stopped on renders FIRST!
  pendingPdfRenderQueue.unshift({
    cacheKey,
    notebookId,
    pageNumber,
    qualityMode,
    promise: renderPromise,
    resolve: resolveFn,
  });
  inFlightPageRenders.set(cacheKey, renderPromise);

  // Evict stale off-screen requests from the back of the queue during fast 1->55->170 scrolling
  while (pendingPdfRenderQueue.length > MAX_PENDING_PDF_QUEUE) {
    const dropped = pendingPdfRenderQueue.pop()!;
    inFlightPageRenders.delete(dropped.cacheKey);
    dropped.resolve(null);
  }

  pumpPdfRenderQueue();
  return renderPromise;
}

/**
 * Imports a PDF file natively without bloating the Notebook JSON to 10x its size.
 * Stores the raw PDF binary in IndexedDB and renders pages on-demand as the user scrolls.
 */
export async function renderPdfFileToPages(
  file: File,
  _defaultTemplate: PaperTemplateType = 'blank',
  onProgress?: (current: number, total: number) => void,
  notebookId?: string
): Promise<NotePage[]> {
  const arrayBuffer = await file.arrayBuffer();
  if (notebookId) {
    await saveRawPdfToIndexedDB(notebookId, arrayBuffer.slice(0));
  }
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
  const pdfDoc = await loadingTask.promise;
  if (notebookId) {
    pdfDocProxyCache.set(notebookId, pdfDoc);
  }
  const numPages = pdfDoc.numPages;
  const pages: NotePage[] = [];

  const sharedCanvas = document.createElement('canvas');
  const sharedCtx = sharedCanvas.getContext('2d', { alpha: false })!;
  const baseTitle = file.name.replace(/\.pdf$/i, '');
  const nowTs = Date.now();

  try {
    // Render Page 1 immediately (for the Library card cover thumbnail and initial view)
    const firstPage = await pdfDoc.getPage(1);
    const firstUnscaled = firstPage.getViewport({ scale: 1 });
    const firstAspect = Math.max(
      0.25,
      Math.min(4, firstUnscaled.width / Math.max(1, firstUnscaled.height))
    );
    const defaultIsLandscape = firstAspect > 1.05;
    const defaultCustomWidth = defaultIsLandscape
      ? A4_LONG_PX
      : Math.max(320, Math.round(A4_LONG_PX * firstAspect));
    const defaultCustomHeight = defaultIsLandscape
      ? Math.max(320, Math.round(A4_LONG_PX / firstAspect))
      : A4_LONG_PX;

    // Render Page 1 cover at crisp scale, and pre-warm pages 2..3 in memory cache
    const prewarmCount = notebookId ? Math.min(numPages, 3) : numPages;
    for (let i = 1; i <= numPages; i++) {
      if (onProgress && (i === 1 || i === numPages || i % 10 === 0)) {
        onProgress(i, numPages);
      }

      if (i <= prewarmCount) {
        const pdfPage = i === 1 ? firstPage : await pdfDoc.getPage(i);
        const unscaledViewport = pdfPage.getViewport({ scale: 1 });
        const aspect = Math.max(
          0.25,
          Math.min(4, unscaledViewport.width / Math.max(1, unscaledViewport.height))
        );
        const isLandscape = aspect > 1.05;
        const customWidth = isLandscape
          ? A4_LONG_PX
          : Math.max(320, Math.round(A4_LONG_PX * aspect));
        const customHeight = isLandscape
          ? Math.max(320, Math.round(A4_LONG_PX / aspect))
          : A4_LONG_PX;

        const targetScale = i === 1 ? 1.25 : 1.4;
        const scale = Math.min(
          (customWidth * targetScale) / Math.max(1, unscaledViewport.width),
          (customHeight * targetScale) / Math.max(1, unscaledViewport.height)
        );
        const viewport = pdfPage.getViewport({ scale });

        sharedCanvas.width = Math.max(1, Math.round(viewport.width));
        sharedCanvas.height = Math.max(1, Math.round(viewport.height));
        sharedCtx.fillStyle = '#ffffff';
        sharedCtx.fillRect(0, 0, sharedCanvas.width, sharedCanvas.height);

        await pdfPage.render({
          canvasContext: sharedCtx,
          viewport,
        }).promise;

        const renderedUrl = sharedCanvas.toDataURL('image/jpeg', i === 1 ? 0.78 : 0.82);
        if (notebookId) {
          setCachedPageDataUrl(`${notebookId}__p${i}__full`, renderedUrl, 'full');
        }
        try {
          pdfPage.cleanup();
        } catch {
          // ignore
        }

        pages.push({
          id: `page-pdf-${nowTs}-${i}`,
          title: `${baseTitle} - Σελ. ${i}`,
          template: 'blank',
          orientation: isLandscape ? 'landscape' : 'portrait',
          customWidth,
          customHeight,
          pdfPageNumber: i,
          // Keep backgroundDataUrl ONLY on Page 1 (for Library cover preview) when notebookId is used!
          backgroundDataUrl: !notebookId || i === 1 ? renderedUrl : undefined,
          layers: [
            { id: 'layer-1', name: 'Σημειώσεις & Σχήματα', visible: true, locked: false, opacity: 1 },
            { id: 'layer-2', name: 'Λύσεις / Προσθήκες', visible: true, locked: false, opacity: 1 },
          ],
          strokes: [],
          texts: [],
          images: [],
          tapes: [],
        });
      } else {
        // Lightweight on-demand PDF page reference (zero base64 bloat!)
        pages.push({
          id: `page-pdf-${nowTs}-${i}`,
          title: `${baseTitle} - Σελ. ${i}`,
          template: 'blank',
          orientation: defaultIsLandscape ? 'landscape' : 'portrait',
          customWidth: defaultCustomWidth,
          customHeight: defaultCustomHeight,
          pdfPageNumber: i,
          layers: [
            { id: 'layer-1', name: 'Σημειώσεις & Σχήματα', visible: true, locked: false, opacity: 1 },
            { id: 'layer-2', name: 'Λύσεις / Προσθήκες', visible: true, locked: false, opacity: 1 },
          ],
          strokes: [],
          texts: [],
          images: [],
          tapes: [],
        });
      }
    }
  } finally {
    sharedCanvas.width = 1;
    sharedCanvas.height = 1;
    if (!notebookId) {
      try {
        await pdfDoc.destroy();
      } catch {
        // ignore
      }
    }
  }

  return pages;
}

/**
 * Converts a JPG / PNG / WebP image file into a full NotePage background
 * so the user can write, highlight, and erase ink on top of the image without erasing the image itself.
 */
export async function renderImageFileToPage(
  file: File,
  _defaultTemplate: PaperTemplateType = 'blank'
): Promise<NotePage> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = rawDataUrl;
  });

  const aspect = Math.max(0.25, Math.min(4, img.naturalWidth / Math.max(1, img.naturalHeight)));
  const isLandscape = aspect > 1.08;
  const customWidth = isLandscape
    ? A4_LONG_PX
    : Math.max(320, Math.round(A4_LONG_PX * aspect));
  const customHeight = isLandscape
    ? Math.max(320, Math.round(A4_LONG_PX / aspect))
    : A4_LONG_PX;
  const maxDim = 1800;
  let finalDataUrl = rawDataUrl;

  if (img.naturalWidth > maxDim || img.naturalHeight > maxDim || rawDataUrl.length > 350000) {
    const ratio = Math.min(1, maxDim / Math.max(1, img.naturalWidth), maxDim / Math.max(1, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    finalDataUrl = canvas.toDataURL('image/jpeg', 0.86);
  }

  return {
    id: `page-img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: file.name.replace(/\.(jpe?g|png|webp)$/i, ''),
    template: 'blank',
    orientation: isLandscape ? 'landscape' : 'portrait',
    customWidth,
    customHeight,
    backgroundDataUrl: finalDataUrl,
    layers: [
      { id: 'layer-1', name: 'Σημειώσεις & Σχήματα', visible: true, locked: false, opacity: 1 },
      { id: 'layer-2', name: 'Λύσεις / Προσθήκες', visible: true, locked: false, opacity: 1 },
    ],
    strokes: [],
    texts: [],
    images: [],
    tapes: [],
  };
}
