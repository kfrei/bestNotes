/**
 * Lazy-loaded Facade for PDF Rendering/Export, GoodNotes/.bestnotes Parser, & Google Drive Sync
 * Keeps pdfjs-dist, jspdf, jszip (~431 KB) and googleDrivePdfSync (~5,700 lines) completely out of
 * the initial startup bundle until the user actually exports/imports PDFs, syncs Drive, or opens a PDF page.
 */
import type { Notebook } from '../types/note';
import type { PdfQualityMode } from './pdfAndImageImporter';

export type { PdfQualityMode };

export const DEFAULT_DRIVE_BASE_PATH = 'GoodNotes/x Σ Χ Ο Λ Ε Ι Α/2025-2026/Γυμνάσιο Αρναίας';

type DrivePdfModule = typeof import('./googleDrivePdfSync');
type GoodnotesModule = typeof import('./goodnotesParser');
type PdfImporterModule = typeof import('./pdfAndImageImporter');

let drivePdfPromise: Promise<DrivePdfModule> | null = null;
let cachedDrivePdfMod: DrivePdfModule | null = null;

let goodnotesPromise: Promise<GoodnotesModule> | null = null;

let pdfImporterPromise: Promise<PdfImporterModule> | null = null;
let cachedPdfImporterMod: PdfImporterModule | null = null;

function loadDrivePdf(): Promise<DrivePdfModule> {
  if (cachedDrivePdfMod) return Promise.resolve(cachedDrivePdfMod);
  if (!drivePdfPromise) {
    drivePdfPromise = import('./googleDrivePdfSync').then((m) => {
      cachedDrivePdfMod = m;
      return m;
    });
  }
  return drivePdfPromise;
}

function loadGoodnotes(): Promise<GoodnotesModule> {
  if (!goodnotesPromise) {
    goodnotesPromise = import('./goodnotesParser');
  }
  return goodnotesPromise;
}

function loadPdfImporter(): Promise<PdfImporterModule> {
  if (cachedPdfImporterMod) return Promise.resolve(cachedPdfImporterMod);
  if (!pdfImporterPromise) {
    pdfImporterPromise = import('./pdfAndImageImporter').then((m) => {
      cachedPdfImporterMod = m;
      return m;
    });
  }
  return pdfImporterPromise;
}

// --- Google Drive & PDF Export ---

export async function syncNotebookPdfToGoogleDrive(
  ...args: Parameters<DrivePdfModule['syncNotebookPdfToGoogleDrive']>
): ReturnType<DrivePdfModule['syncNotebookPdfToGoogleDrive']> {
  const m = await loadDrivePdf();
  return m.syncNotebookPdfToGoogleDrive(...args);
}

export async function syncDriveFolderStructureToGoogleDrive(
  ...args: Parameters<DrivePdfModule['syncDriveFolderStructureToGoogleDrive']>
): ReturnType<DrivePdfModule['syncDriveFolderStructureToGoogleDrive']> {
  const m = await loadDrivePdf();
  return m.syncDriveFolderStructureToGoogleDrive(...args);
}

export async function verifyDriveAccessToken(
  ...args: Parameters<DrivePdfModule['verifyDriveAccessToken']>
): ReturnType<DrivePdfModule['verifyDriveAccessToken']> {
  const m = await loadDrivePdf();
  return m.verifyDriveAccessToken(...args);
}

export function clearDriveFolderResolutionCache(): void {
  cachedDrivePdfMod?.clearDriveFolderResolutionCache();
}

export async function exportNotebookToPdfBlob(
  ...args: Parameters<DrivePdfModule['exportNotebookToPdfBlob']>
): ReturnType<DrivePdfModule['exportNotebookToPdfBlob']> {
  const m = await loadDrivePdf();
  return m.exportNotebookToPdfBlob(...args);
}

export async function exportNotebookToLivePdfHtml(
  ...args: Parameters<DrivePdfModule['exportNotebookToLivePdfHtml']>
): ReturnType<DrivePdfModule['exportNotebookToLivePdfHtml']> {
  const m = await loadDrivePdf();
  return m.exportNotebookToLivePdfHtml(...args);
}

// --- GoodNotes & .bestnotes Parser ---

export async function importGoodnotesFile(file: File): Promise<Notebook> {
  const m = await loadGoodnotes();
  return m.importGoodnotesFile(file);
}

export async function exportBestnotesFile(nb: Notebook): Promise<void> {
  const m = await loadGoodnotes();
  m.exportBestnotesFile(nb);
}

export async function createBestnotesFileBlob(
  nb: Notebook
): Promise<{ blob: Blob; fileName: string }> {
  const m = await loadGoodnotes();
  return m.createBestnotesFileBlob(nb);
}

// --- PDF & Image Importer / On-demand PDF Page Cache ---

export async function renderPdfFileToPages(
  ...args: Parameters<PdfImporterModule['renderPdfFileToPages']>
): ReturnType<PdfImporterModule['renderPdfFileToPages']> {
  const m = await loadPdfImporter();
  return m.renderPdfFileToPages(...args);
}

export async function renderImageFileToPage(
  ...args: Parameters<PdfImporterModule['renderImageFileToPage']>
): ReturnType<PdfImporterModule['renderImageFileToPage']> {
  const m = await loadPdfImporter();
  return m.renderImageFileToPage(...args);
}

export function getCachedPdfPageDataUrl(
  notebookId: string,
  pageNumber: number,
  qualityMode: PdfQualityMode = 'full'
): string | undefined {
  return cachedPdfImporterMod?.getCachedPdfPageDataUrl(notebookId, pageNumber, qualityMode);
}

export function getBestAvailablePdfPageDataUrl(
  notebookId: string,
  pageNumber: number
): string | undefined {
  return cachedPdfImporterMod?.getBestAvailablePdfPageDataUrl(notebookId, pageNumber);
}

export async function ensurePdfPageDataUrl(
  notebookId: string,
  pageNumber: number,
  qualityMode: PdfQualityMode = 'full'
): Promise<string | null> {
  const m = await loadPdfImporter();
  return m.ensurePdfPageDataUrl(notebookId, pageNumber, qualityMode);
}

export async function loadRawPdfFromIndexedDB(notebookId: string): Promise<ArrayBuffer | null> {
  const m = await loadPdfImporter();
  return m.loadRawPdfFromIndexedDB(notebookId);
}

export async function saveRawPdfToIndexedDB(notebookId: string, buffer: ArrayBuffer): Promise<void> {
  const m = await loadPdfImporter();
  return m.saveRawPdfToIndexedDB(notebookId, buffer);
}

export function evictPdfCachesForNotebook(notebookId: string, deleteRawIdb = false): void {
  if (cachedPdfImporterMod) {
    cachedPdfImporterMod.evictPdfCachesForNotebook(notebookId, deleteRawIdb);
    return;
  }
  if (deleteRawIdb) {
    void loadPdfImporter().then((m) => m.evictPdfCachesForNotebook(notebookId, true));
  }
}
