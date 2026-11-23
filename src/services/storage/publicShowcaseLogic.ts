/**
 * Pure Public Showcase / Demo Folder Logic
 * Zero Firebase/DOM dependencies for direct unit testing.
 */

import type { Notebook } from '../../types/note';
import { getNotebookContentScore } from './storageCleaners';

export const PUBLIC_SHOWCASE_META_COLLECTION = 'public_showcase_meta';
export const PUBLIC_SHOWCASE_META_DOC_ID = 'config';
export const PUBLIC_SHOWCASE_NOTEBOOKS_COLLECTION = 'public_showcase_notebooks';

export const SHOWCASE_ID_PREFIX = 'showcase-';
export const DEFAULT_SHOWCASE_FOLDER_NAME = 'Σημειώσεις';
export const DEFAULT_SHOWCASE_FOLDER_COLOR = '#f59e0b';
export const DEFAULT_SHOWCASE_FOLDER_ICON = 'folder';

export const INITIAL_SHOWCASE_SEED_TITLES = [
  'Η Δημιουργία Ηφαιστείου',
  'Η Φωτοσύνθεση',
  'Ηλεκτρική Αντίσταση',
  'Κύκλος Νερού',
  'DaVinci',
  'Einstein',
  'Το Κύτταρο',
  'Φάσεις & Μεταβολές του Νερού',
] as const;

export interface PublicShowcaseMeta {
  id: 'config';
  folderName: string;
  folderColor: string;
  folderIcon: string;
  seeded: boolean;
  seededAt?: string;
  updatedAt: string;
  deviceId?: string;
}

export function isShowcaseNotebook(
  nb: Pick<Notebook, 'id' | 'isShowcase'> | null | undefined
): boolean {
  if (!nb) return false;
  return Boolean(
    nb.isShowcase === true ||
      (typeof nb.id === 'string' && nb.id.startsWith(SHOWCASE_ID_PREFIX))
  );
}

export function normalizeShowcasePath(rawPath: string | null | undefined): string {
  if (!rawPath) return '';
  return rawPath
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('/');
}

export function isExactShowcaseRootFolder(
  folderPath: string | null | undefined,
  showcaseFolderName: string | null | undefined
): boolean {
  const normFolder = normalizeShowcasePath(folderPath);
  const normShowcase = normalizeShowcasePath(showcaseFolderName);
  if (!normFolder || !normShowcase) return false;
  return normFolder === normShowcase;
}

export function isShowcaseFolderPath(
  folderPath: string | null | undefined,
  showcaseFolderName: string | null | undefined
): boolean {
  const normFolder = normalizeShowcasePath(folderPath);
  const normShowcase = normalizeShowcasePath(showcaseFolderName);
  if (!normFolder || !normShowcase) return false;
  return normFolder === normShowcase || normFolder.startsWith(`${normShowcase}/`);
}

export function normalizeShowcaseTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export interface InitialShowcaseSeedMatch {
  seedIndex: number;
  seedTitle: string;
  showcaseId: string;
  source: Notebook;
}

/**
 * Matches the 8 initial showcase titles against the Admin's own personal notebooks.
 * Ignores existing showcase notebooks so only Admin's original library notes are matched.
 * If multiple personal notebooks share a title, picks the richest / most recently updated one.
 */
export function findInitialShowcaseSeedMatches(
  adminNotebooks: Notebook[]
): InitialShowcaseSeedMatch[] {
  const personalNotebooks = adminNotebooks.filter((nb) => !isShowcaseNotebook(nb));
  const byNormTitle = new Map<string, Notebook[]>();

  for (const nb of personalNotebooks) {
    const key = normalizeShowcaseTitle(nb.title || '');
    if (!key) continue;
    const arr = byNormTitle.get(key) || [];
    arr.push(nb);
    byNormTitle.set(key, arr);
  }

  const matches: InitialShowcaseSeedMatch[] = [];
  INITIAL_SHOWCASE_SEED_TITLES.forEach((seedTitle, seedIndex) => {
    const key = normalizeShowcaseTitle(seedTitle);
    const candidates = byNormTitle.get(key);
    if (!candidates || candidates.length === 0) return;
    const best = [...candidates].sort((a, b) => {
      const scoreDiff = getNotebookContentScore(b) - getNotebookContentScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    })[0];
    matches.push({
      seedIndex,
      seedTitle,
      showcaseId: `${SHOWCASE_ID_PREFIX}seed-${seedIndex}`,
      source: best,
    });
  });

  return matches;
}

/**
 * Creates a clean showcase clone from any source notebook, preserving title, tags, coverColor,
 * pages/strokes/texts/images/simulations, setting folder to the showcase folder & updatedAt to nowIso.
 */
export function buildShowcaseCloneFromNotebook(
  source: Notebook,
  showcaseId: string,
  folderName: string,
  nowIso: string
): Notebook {
  const cloned = structuredClone(source);
  const { folderStyles: _ignoredStyles, ...rest } = cloned;
  return {
    ...rest,
    id: showcaseId.startsWith(SHOWCASE_ID_PREFIX)
      ? showcaseId
      : `${SHOWCASE_ID_PREFIX}${showcaseId}`,
    folder: normalizeShowcasePath(folderName) || DEFAULT_SHOWCASE_FOLDER_NAME,
    updatedAt: nowIso,
    isShowcase: true,
    favorite: false,
  };
}

/**
 * Creates a personal user-owned copy of a showcase notebook outside the showcase folder (root '').
 */
export function buildPersonalCopyFromShowcase(
  showcaseNb: Notebook,
  nowIso: string,
  newId?: string
): Notebook {
  const cloned = structuredClone(showcaseNb);
  const ts = Date.now();
  const id = newId || `nb-${ts}-${Math.random().toString(36).slice(2, 6)}`;
  const clonedPages = (cloned.pages || []).map((p, idx) => ({
    ...p,
    id: `page-${ts}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
  }));
  const { isShowcase: _removedShowcase, folderStyles: _removedStyles, ...rest } = cloned;
  return {
    ...rest,
    id,
    title: `${showcaseNb.title}-Copy`,
    folder: '',
    updatedAt: nowIso,
    pages: clonedPages,
  };
}

/**
 * Computes the effective folder path for a showcase notebook given the live showcase root folder name.
 * Preserves subfolders if the Admin organized showcase notes into subfolders, otherwise places in root showcase folder.
 */
export function resolveShowcaseNotebookFolder(
  storedFolder: string | undefined,
  liveShowcaseFolderName: string,
  prevShowcaseFolderName?: string
): string {
  const liveRoot = normalizeShowcasePath(liveShowcaseFolderName) || DEFAULT_SHOWCASE_FOLDER_NAME;
  const normStored = normalizeShowcasePath(storedFolder);
  if (!normStored) return liveRoot;
  if (normStored === liveRoot || normStored.startsWith(`${liveRoot}/`)) {
    return normStored;
  }
  const prevRoot = normalizeShowcasePath(prevShowcaseFolderName);
  if (prevRoot && normStored.startsWith(`${prevRoot}/`)) {
    return `${liveRoot}${normStored.slice(prevRoot.length)}`;
  }
  // If storedFolder has a slash (e.g. "OldRoot/Sub"), swap the top segment with liveRoot
  const slashIdx = normStored.indexOf('/');
  if (slashIdx > 0) {
    return `${liveRoot}${normStored.slice(slashIdx)}`;
  }
  return liveRoot;
}

export interface RawShowcaseFirestoreDoc {
  id: string;
  data: Record<string, any>;
}

/**
 * Reassembles chunked & single-doc showcase notebooks from raw Firestore snapshot documents.
 */
export function reassembleShowcaseNotebooksFromDocs(
  rawDocs: RawShowcaseFirestoreDoc[],
  liveShowcaseFolderName: string
): Notebook[] {
  const chunksByNotebookId = new Map<string, Map<number, string>>();
  const primaryDocs: RawShowcaseFirestoreDoc[] = [];

  for (const entry of rawDocs) {
    if (!entry?.id || !entry?.data) continue;
    const chunkMatch = entry.id.match(/^(.+)__chunk_(\d+)$/);
    if (chunkMatch) {
      const parentId = chunkMatch[1];
      const chunkIdx = Number(chunkMatch[2]);
      if (typeof entry.data.dataJson === 'string') {
        let map = chunksByNotebookId.get(parentId);
        if (!map) {
          map = new Map<number, string>();
          chunksByNotebookId.set(parentId, map);
        }
        map.set(chunkIdx, entry.data.dataJson);
      }
      continue;
    }
    primaryDocs.push(entry);
  }

  const result: Notebook[] = [];
  for (const { id, data } of primaryDocs) {
    if (data.deleted === true) continue;
    const rawJson = data.dataJson;
    if (typeof rawJson !== 'string' || rawJson.length === 0) continue;

    let fullJson = rawJson;
    if (rawJson.startsWith('{"__chunked":true')) {
      try {
        const manifest = JSON.parse(rawJson) as {
          __chunked?: boolean;
          chunkCount?: number;
          chunk0?: string;
        };
        const count = typeof manifest.chunkCount === 'number' ? manifest.chunkCount : 0;
        const chunkMap = chunksByNotebookId.get(id);
        if (count <= 0) continue;
        const parts: string[] = [];
        let complete = true;
        for (let i = 0; i < count; i++) {
          const part =
            i === 0 && typeof manifest.chunk0 === 'string'
              ? manifest.chunk0
              : chunkMap?.get(i);
          if (typeof part !== 'string') {
            complete = false;
            break;
          }
          parts.push(part);
        }
        if (!complete) continue;
        fullJson = parts.join('');
      } catch {
        continue;
      }
    }

    try {
      const parsed = JSON.parse(fullJson) as Notebook;
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.pages)) continue;
      const effectiveId = id.startsWith(SHOWCASE_ID_PREFIX) ? id : `${SHOWCASE_ID_PREFIX}${id}`;
      result.push({
        ...parsed,
        id: effectiveId,
        isShowcase: true,
        folder: resolveShowcaseNotebookFolder(parsed.folder, liveShowcaseFolderName),
        updatedAt:
          typeof data.updatedAt === 'string' && data.updatedAt.length > 0
            ? data.updatedAt
            : parsed.updatedAt || new Date().toISOString(),
      });
    } catch {
      // ignore malformed doc
    }
  }

  return result;
}
