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
    const valid = nbs.filter((n) => !(n.id === 'nb-blank-1' && getNotebookContentScore(n) === 0));
    if (valid.length === 0) return;
    const cached = valid.map(cleanNotebookForLibraryCache);
    const serialized = JSON.stringify(cached);
    if (serialized.length <= 1_800_000) {
      localStorage.setItem(`${LIBRARY_CACHE_STORAGE_KEY}_${uid}`, serialized);
      localStorage.setItem(`${LIBRARY_CACHE_STORAGE_KEY}_latest`, serialized);
    }
  } catch {
    // ignore
  }
}

export function saveNotebooksToLocalAndIdb(uid: string, nbs: Notebook[]): void {
  void saveNotebooksToIndexedDB(uid, nbs);
  saveLibraryShelfCache(uid, nbs);
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
    const targetNb = (activeId ? nbs.find((n) => n.id === activeId) : null) || nbs[0];
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
    let estimatedChars = 0;
    for (let i = 0; i < nbs.length; i++) {
      const pages = nbs[i].pages || [];
      for (let j = 0; j < pages.length; j++) {
        estimatedChars += (pages[j].backgroundDataUrl?.length || 0) + 256;
        if (estimatedChars > 1_500_000) break;
      }
      if (estimatedChars > 1_500_000) break;
    }
    if (estimatedChars > 1_500_000) {
      localStorage.removeItem(`${STORAGE_KEY}_${uid}`);
      return;
    }
    const serialized = JSON.stringify(nbs.map(cleanNotebookForStorage));
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
