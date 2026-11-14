/**
 * BestNotes High-Capacity IndexedDB Engine
 * Domain 5: Offline Persistent Storage (supports 50MB+ per notebook)
 */

import type { Notebook } from '../../types/note';
import type { CustomFolderMeta } from '../../features/library/types';
import { IDB_NAME, IDB_STORE } from './storageKeys';
import { cleanNotebookForStorage } from './storageCleaners';

export function openBestNotesIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const dbInstance = req.result;
      if (!dbInstance.objectStoreNames.contains(IDB_STORE)) {
        dbInstance.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveNotebooksToIndexedDB(uid: string, nbs: Notebook[]): Promise<void> {
  try {
    const idb = await openBestNotesIdb();
    const cleaned = nbs.map(cleanNotebookForStorage);
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(cleaned, uid);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

export async function loadNotebooksFromIndexedDB(uid: string): Promise<Notebook[] | null> {
  try {
    const idb = await openBestNotesIdb();
    return await new Promise<Notebook[] | null>((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(uid);
      req.onsuccess = () => {
        if (Array.isArray(req.result) && req.result.length > 0) {
          resolve(req.result as Notebook[]);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function saveCustomFoldersToIndexedDB(
  uid: string,
  folders: CustomFolderMeta[]
): Promise<void> {
  try {
    const idb = await openBestNotesIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(folders, `${uid}__custom_folders`);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

export async function loadCustomFoldersFromIndexedDB(
  uid: string
): Promise<CustomFolderMeta[] | null> {
  try {
    const idb = await openBestNotesIdb();
    return await new Promise<CustomFolderMeta[] | null>((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(`${uid}__custom_folders`);
      req.onsuccess = () => {
        if (Array.isArray(req.result)) {
          resolve(req.result as CustomFolderMeta[]);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}
