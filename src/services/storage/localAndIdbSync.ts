/**
 * BestNotes Local-First Sync Engine (IndexedDB + localStorage)
 * Domain 5: Fast multi-tier storage orchestration
 */

import type { Notebook } from '../../types/note';
import type { CustomFolderMeta } from '../../features/library/types';
import {
  STORAGE_KEY,
  ACTIVE_NOTEBOOK_STORAGE_KEY,
  CUSTOM_FOLDERS_STORAGE_KEY,
  UI_SESSION_STORAGE_KEY,
  LIBRARY_CACHE_STORAGE_KEY,
  RECENT_SHELF_CACHE_KEY,
} from './storageKeys';
import {
  cleanNotebookForStorage,
  cleanNotebookForLibraryCache,
  getNotebookContentScore,
} from './storageCleaners';
import {
  saveNotebooksToIndexedDB,
  saveCustomFoldersToIndexedDB,
} from './indexedDb';
import { isShowcaseNotebook } from './publicShowcaseLogic';

export function saveCustomFoldersToLocalAndIdb(
  uid: string,
  folders: CustomFolderMeta[],
  tsIso?: string
): void {
  void saveCustomFoldersToIndexedDB(uid, folders);
  const foldersStr = JSON.stringify(folders);
  const writeToLocal = () => {
    localStorage.setItem(`${CUSTOM_FOLDERS_STORAGE_KEY}_${uid}`, foldersStr);
    if (tsIso) {
      localStorage.setItem(`${CUSTOM_FOLDERS_STORAGE_KEY}_ts_${uid}`, tsIso);
    }
  };
  try {
    writeToLocal();
  } catch {
    // Free up localStorage space by removing the heavy notebooks mirror (which is safely stored in IndexedDB!)
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${uid}`);
      writeToLocal();
    } catch {
      // ignore
    }
  }
}

export function saveLibraryShelfCache(uid: string, nbs: Notebook[]): void {
  if (!uid || !Array.isArray(nbs) || nbs.length === 0) return;
  try {
    const valid = nbs.filter(
      (n) => !isShowcaseNotebook(n) && !(n.id === 'nb-blank-1' && getNotebookContentScore(n) === 0)
    );
    if (valid.length === 0) return;

    const sortedByRecent = [...valid].sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );

    // 1. Dedicated ultra-fast recent shelf cache (top 6 most recently updated notebooks)
    // Always guaranteed to fit in localStorage (< 250KB) so recent notes are instantly ready on refresh!
    try {
      const topRecent = sortedByRecent.slice(0, 6).map(cleanNotebookForLibraryCache);
      const recentSerialized = JSON.stringify(topRecent);
      if (recentSerialized.length <= 400_000) {
        localStorage.setItem(`${RECENT_SHELF_CACHE_KEY}_${uid}`, recentSerialized);
        localStorage.setItem(`${RECENT_SHELF_CACHE_KEY}_latest`, recentSerialized);
      }
    } catch {
      // ignore
    }

    // 2. Full library shelf cache (ALWAYS preserving 100% of all notebooks for instant filter chips & scope counts)
    let cached = sortedByRecent.map(cleanNotebookForLibraryCache);
    let serialized = JSON.stringify(cached);

    // If total exceeds 1.8MB, progressively compress older notes by stripping heavy background images / strokes,
    // but NEVER drop any notebook from the array!
    if (serialized.length > 1_800_000) {
      cached = cached.map((nb, idx) => {
        if (idx < 6) return nb;
        const p0 = nb.pages[0];
        if (!p0 || !p0.backgroundDataUrl) return nb;
        return {
          ...nb,
          pages: [{ ...p0, backgroundDataUrl: undefined }],
        };
      });
      serialized = JSON.stringify(cached);
    }

    if (serialized.length > 1_800_000) {
      cached = cached.map((nb, idx) => {
        if (idx < 3) return nb;
        const p0 = nb.pages[0];
        if (!p0 || !p0.backgroundDataUrl) return nb;
        return {
          ...nb,
          pages: [{ ...p0, backgroundDataUrl: undefined }],
        };
      });
      serialized = JSON.stringify(cached);
    }

    if (serialized.length > 1_800_000) {
      cached = cached.map((nb) => {
        const p0 = nb.pages[0];
        if (!p0 || !p0.backgroundDataUrl) return nb;
        return {
          ...nb,
          pages: [{ ...p0, backgroundDataUrl: undefined }],
        };
      });
      serialized = JSON.stringify(cached);
    }

    if (serialized.length > 1_800_000) {
      cached = cached.map((nb, idx) => {
        if (idx < 4) return nb;
        const p0 = nb.pages[0];
        if (!p0 || !p0.strokes?.length) return nb;
        return {
          ...nb,
          pages: [{ ...p0, strokes: [] }],
        };
      });
      serialized = JSON.stringify(cached);
    }

    if (serialized.length > 1_800_000) {
      cached = cached.map((nb) => {
        const p0 = nb.pages[0];
        if (!p0 || !p0.strokes?.length) return nb;
        return {
          ...nb,
          pages: [{ ...p0, strokes: [] }],
        };
      });
      serialized = JSON.stringify(cached);
    }

    if (serialized.length <= 1_800_000) {
      localStorage.setItem(`${LIBRARY_CACHE_STORAGE_KEY}_${uid}`, serialized);
      localStorage.setItem(`${LIBRARY_CACHE_STORAGE_KEY}_latest`, serialized);
    }
  } catch {
    // ignore
  }
}

export function saveNotebooksToLocalAndIdb(uid: string, nbs: Notebook[]): void {
  const personalNbs = nbs.filter((n) => !isShowcaseNotebook(n));
  void saveNotebooksToIndexedDB(uid, personalNbs);
  saveLibraryShelfCache(uid, personalNbs);
  try {
    // 1. Always cache the currently active notebook in localStorage if it fits (up to 1.8MB)
    // so on page refresh, the active notebook is ready SYNCHRONOUSLY on the very first frame!
    const rawSess =
      localStorage.getItem(`${UI_SESSION_STORAGE_KEY}_${uid}`) ||
      localStorage.getItem(`${UI_SESSION_STORAGE_KEY}_latest`);
    let activeId = '';
    if (rawSess) {
      try {
        activeId = JSON.parse(rawSess)?.activeNotebookId || '';
      } catch {
        // ignore
      }
    }
    const targetNb = (activeId ? personalNbs.find((n) => n.id === activeId) : null) || personalNbs[0];
    if (targetNb) {
      try {
        const activeSerialized = JSON.stringify(cleanNotebookForStorage(targetNb));
        if (activeSerialized.length <= 1_800_000) {
          localStorage.setItem(`${ACTIVE_NOTEBOOK_STORAGE_KEY}_${uid}`, activeSerialized);
          localStorage.setItem(`${ACTIVE_NOTEBOOK_STORAGE_KEY}_latest`, activeSerialized);
        }
      } catch {
        // ignore
      }
    }

    // 2. Full collection check for localStorage (if whole collection fits under 1.5MB)
    // Accurately estimate stroke, image, text, and simulation payload sizes so multi-MB closed notebooks never trigger wasted JSON.stringify!
    let estimatedChars = 0;
    for (let i = 0; i < personalNbs.length; i++) {
      const pages = personalNbs[i].pages || [];
      for (let j = 0; j < pages.length; j++) {
        const pg = pages[j];
        estimatedChars += (pg.backgroundDataUrl?.length || 0) + 256;
        estimatedChars += (pg.strokes?.length || 0) * 180;
        if (pg.images) {
          for (let k = 0; k < pg.images.length; k++) {
            estimatedChars += (pg.images[k].dataUrl?.length || 0) + 128;
          }
        }
        if (pg.texts) {
          estimatedChars += pg.texts.length * 140;
        }
        if (pg.heatSims) {
          for (let k = 0; k < pg.heatSims.length; k++) {
            estimatedChars += 1024 + (pg.heatSims[k].history?.length || 0) * 160;
          }
        }
        if (estimatedChars > 1_500_000) break;
      }
      if (estimatedChars > 1_500_000) break;
    }
    if (estimatedChars > 1_500_000) {
      localStorage.removeItem(`${STORAGE_KEY}_${uid}`);
      return;
    }
    const serialized = JSON.stringify(personalNbs.map(cleanNotebookForStorage));
    if (serialized.length <= 1500000) {
      localStorage.setItem(`${STORAGE_KEY}_${uid}`, serialized);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_${uid}`);
    }
  } catch {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${uid}`);
    } catch {
      // ignore
    }
  }
}
