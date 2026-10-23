import * as pdfjsLib from 'pdfjs-dist';
import { NotePage, PaperTemplateType } from '../types/note';

// Configure PDF.js worker for Vite bundle
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Renders every page of a PDF file into high-resolution BestNotes pages
 * so the user can scroll through 30+ pages like Word and write/highlight on top of them.
 */
export async function renderPdfFileToPages(
  file: File,
  defaultTemplate: PaperTemplateType = 'blank',
  onProgress?: (current: number, total: number) => void
): Promise<NotePage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pages: NotePage[] = [];

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(i, numPages);
    const pdfPage = await pdfDoc.getPage(i);
    const unscaledViewport = pdfPage.getViewport({ scale: 1 });
    const isLandscape = unscaledViewport.width > unscaledViewport.height * 1.05;
    const targetLogicalW = isLandscape ? 1260 : 920;
    const targetLogicalH = isLandscape ? 920 : 1260;

    // Render at ~1.75x Retina resolution for crisp text without exhausting localStorage/RAM on 30+ page PDFs
    const scale = Math.min(
      (targetLogicalW * 1.75) / Math.max(1, unscaledViewport.width),
      (targetLogicalH * 1.75) / Math.max(1, unscaledViewport.height)
    );
    const viewport = pdfPage.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await pdfPage.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    const backgroundDataUrl = canvas.toDataURL('image/jpeg', 0.88);

    pages.push({
      id: `page-pdf-${Date.now()}-${i}`,
      title: `${file.name.replace(/\.pdf$/i, '')} - Σελ. ${i}`,
      template: defaultTemplate,
      orientation: isLandscape ? 'landscape' : 'portrait',
      backgroundDataUrl,
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

  return pages;
}

/**
 * Converts a JPG / PNG / WebP image file into a full NotePage background
 * so the user can write, highlight, and erase ink on top of the image without erasing the image itself.
 */
export async function renderImageFileToPage(
  file: File,
  defaultTemplate: PaperTemplateType = 'blank'
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

  const isLandscape = img.naturalWidth > img.naturalHeight * 1.08;
  const maxDim = 2000;
  let finalDataUrl = rawDataUrl;

  if (img.naturalWidth > maxDim || img.naturalHeight > maxDim) {
    const ratio = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * ratio);
    canvas.height = Math.round(img.naturalHeight * ratio);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
  }

  return {
    id: `page-img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: file.name.replace(/\.(jpe?g|png|webp)$/i, ''),
    template: defaultTemplate,
    orientation: isLandscape ? 'landscape' : 'portrait',
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
