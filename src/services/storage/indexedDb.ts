/**
 * BestNotes High-Capacity IndexedDB Engine
 * Domain 5: Offline Persistent Storage (supports 50MB+ per notebook)
 */

import type { Notebook } from '../../types/note';
import type { CustomFolderMeta } from '../../features/library/types';
import { IDB_NAME, IDB_STORE } from './storageKeys';
import { cleanNotebookForStorage } from './storageCleaners';

let cachedIdbPromise: Promise<IDBDatabase> | null = null;

export function openBestNotesIdb(): Promise<IDBDatabase> {
  if (cachedIdbPromise) return cachedIdbPromise;
  cachedIdbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      cachedIdbPromise = null;
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
    req.onsuccess = () => {
      const db = req.result;
      db.onclose = () => {
        cachedIdbPromise = null;
      };
      db.onversionchange = () => {
        db.close();
        cachedIdbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => {
      cachedIdbPromise = null;
      reject(req.error);
    };
  });
  return cachedIdbPromise;
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
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
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

const SHOWCASE_CACHE_IDB_KEY = '__public_showcase_cache_v1';

export interface ShowcaseIdbCachePayload {
  updatedAt: string;
  rawDocs: { id: string; data: Record<string, any> }[];
}

export async function saveShowcaseCacheToIndexedDB(
  updatedAt: string,
  rawDocs: { id: string; data: Record<string, any> }[]
): Promise<void> {
  try {
    const idb = await openBestNotesIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put({ updatedAt, rawDocs }, SHOWCASE_CACHE_IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
    });
  } catch {
    // ignore
  }
}

export async function loadShowcaseCacheFromIndexedDB(): Promise<ShowcaseIdbCachePayload | null> {
  try {
    const idb = await openBestNotesIdb();
    return await new Promise<ShowcaseIdbCachePayload | null>((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(SHOWCASE_CACHE_IDB_KEY);
      req.onsuccess = () => {
        const res = req.result as ShowcaseIdbCachePayload | undefined;
        if (res && typeof res.updatedAt === 'string' && Array.isArray(res.rawDocs)) {
          resolve(res);
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
