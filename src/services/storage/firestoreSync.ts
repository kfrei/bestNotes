/**
 * BestNotes Cloud Firestore Multi-Chunk Sync Engine
 * Domain 5: Atomic batch writes, tombstone protection, and chunked storage (>750 KB)
 */

import {
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDoc,
  getDocFromServer,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Notebook } from '../../types/note';
import {
  FIRESTORE_SINGLE_DOC_LIMIT,
  FIRESTORE_CHUNK_SIZE,
} from './storageKeys';

export const sessionDeletedNotebookIds = new Set<string>();
export const sessionRestoredNotebookIds = new Set<string>();

// In-memory sync caches keyed by `${uid}::${nbId}` to eliminate per-save getDocFromServer reads
// and avoid rewriting unchanged chunks on multi-chunk notebooks.
const knownRemoteChunkCountMap = new Map<string, number>();
const lastWrittenChunksMap = new Map<string, string[]>();

function makeSyncCacheKey(uid: string, nbId: string): string {
  return `${uid}::${nbId}`;
}

export function recordRemoteNotebookChunkCount(
  uid: string,
  nbId: string,
  chunkCount: number
): void {
  knownRemoteChunkCountMap.set(makeSyncCacheKey(uid, nbId), Math.max(0, chunkCount));
}

export function clearNotebookWrittenChunksCache(uid: string, nbId?: string): void {
  if (nbId) {
    lastWrittenChunksMap.delete(makeSyncCacheKey(uid, nbId));
    return;
  }
  const prefix = `${uid}::`;
  for (const k of Array.from(lastWrittenChunksMap.keys())) {
    if (k.startsWith(prefix)) lastWrittenChunksMap.delete(k);
  }
}

export function clearAllNotebookSyncCaches(uid?: string): void {
  if (!uid) {
    knownRemoteChunkCountMap.clear();
    lastWrittenChunksMap.clear();
    return;
  }
  const prefix = `${uid}::`;
  for (const k of Array.from(knownRemoteChunkCountMap.keys())) {
    if (k.startsWith(prefix)) knownRemoteChunkCountMap.delete(k);
  }
  for (const k of Array.from(lastWrittenChunksMap.keys())) {
    if (k.startsWith(prefix)) lastWrittenChunksMap.delete(k);
  }
}

export function getMonotonicIsoTimestamp(...candidates: (string | undefined)[]): string {
  let maxMs = Date.now();
  for (const c of candidates) {
    if (c) {
      const parsed = Date.parse(c);
      if (!Number.isNaN(parsed) && parsed >= maxMs) {
        maxMs = parsed + 1000;
      }
    }
  }
  return new Date(maxMs).toISOString();
}

const utf8Encoder = new TextEncoder();

export function getUtf8ByteLength(str: string): number {
  return utf8Encoder.encode(str).length;
}

/**
 * Splits a string into chunks whose UTF-8 byte length never exceeds maxBytes,
 * without ever splitting UTF-16 surrogate pairs (emojis / math symbols).
 */
export function splitStringByUtf8Bytes(str: string, maxBytes: number): string[] {
  if (getUtf8ByteLength(str) <= maxBytes) return [str];
  const chunks: string[] = [];
  let chunkStart = 0;
  let byteCount = 0;
  let i = 0;
  while (i < str.length) {
    const code = str.charCodeAt(i);
    let charLen = 1;
    let charBytes = 1;
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      // Surrogate pair -> 4 UTF-8 bytes
      charLen = 2;
      charBytes = 4;
    } else if (code < 0x80) {
      charBytes = 1;
    } else if (code < 0x800) {
      charBytes = 2;
    } else {
      charBytes = 3;
    }
    if (byteCount + charBytes > maxBytes && i > chunkStart) {
      chunks.push(str.slice(chunkStart, i));
      chunkStart = i;
      byteCount = 0;
    }
    byteCount += charBytes;
    i += charLen;
  }
  if (chunkStart < str.length) {
    chunks.push(str.slice(chunkStart));
  }
  return chunks;
}

export async function saveNotebookToFirestoreChunked(
  uid: string,
  nb: Notebook,
  dataJson: string,
  deviceId: string,
  options?: { skipServerPreRead?: boolean; knownPrevChunkCount?: number }
): Promise<boolean> {
  if (sessionDeletedNotebookIds.has(nb.id)) {
    return false;
  }
  const updatedAt = nb.updatedAt || new Date().toISOString();
  const safeTitle = (nb.title || 'Σημείωση').slice(0, 900);
  const primaryRef = doc(db, 'users', uid, 'notebooks', nb.id);
  const cacheKey = makeSyncCacheKey(uid, nb.id);
  const hasCachedChunkCount =
    typeof options?.knownPrevChunkCount === 'number' || knownRemoteChunkCountMap.has(cacheKey);
  let prevChunkCount =
    typeof options?.knownPrevChunkCount === 'number'
      ? Math.max(0, options.knownPrevChunkCount)
      : knownRemoteChunkCountMap.get(cacheKey) ?? 0;

  // STRICT SERVER-SIDE TIMESTAMP & TOMBSTONE GUARD:
  // Only query live Firestore server before writing when the caller does NOT already have
  // live onSnapshot state (skipServerPreRead !== true and chunk count unknown).
  if (!options?.skipServerPreRead && !hasCachedChunkCount) {
    try {
      const existingSnap = await getDocFromServer(primaryRef).catch(() => getDoc(primaryRef));
      if (sessionDeletedNotebookIds.has(nb.id)) {
        return false;
      }
      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        if (existingData?.deleted === true && !sessionRestoredNotebookIds.has(nb.id)) {
          console.warn(`[CloudSync] Blocked background resurrection of soft-deleted notebook ${nb.id}`);
          return false;
        }
        const cloudUpdatedAt = typeof existingData?.updatedAt === 'string' ? existingData.updatedAt : '';
        if (cloudUpdatedAt && updatedAt < cloudUpdatedAt && !sessionRestoredNotebookIds.has(nb.id)) {
          console.warn(
            `[CloudSync] Blocked stale overwrite of ${nb.id} (local ${updatedAt} < cloud ${cloudUpdatedAt})`
          );
          return false;
        }
        if (
          typeof existingData?.dataJson === 'string' &&
          existingData.dataJson.startsWith('{"__chunked":true')
        ) {
          try {
            const oldManifest = JSON.parse(existingData.dataJson) as { chunkCount?: number };
            if (typeof oldManifest.chunkCount === 'number' && oldManifest.chunkCount > 0) {
              prevChunkCount = oldManifest.chunkCount;
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // Offline or transient network error -> proceed
    }
  }

  const dataByteLen = getUtf8ByteLength(dataJson);

  if (dataByteLen <= FIRESTORE_SINGLE_DOC_LIMIT) {
    if (prevChunkCount > 0) {
      const batch = writeBatch(db);
      batch.set(
        primaryRef,
        {
          id: nb.id,
          title: safeTitle,
          updatedAt,
          dataJson,
          deleted: false,
          deviceId,
        },
        { merge: true }
      );
      for (let cIdx = 0; cIdx < Math.max(prevChunkCount, 6); cIdx++) {
        batch.delete(doc(db, 'users', uid, 'notebooks', `${nb.id}__chunk_${cIdx}`));
      }
      await batch.commit();
    } else {
      await setDoc(
        primaryRef,
        {
          id: nb.id,
          title: safeTitle,
          updatedAt,
          dataJson,
          deleted: false,
          deviceId,
        },
        { merge: true }
      );
    }
    knownRemoteChunkCountMap.set(cacheKey, 0);
    lastWrittenChunksMap.delete(cacheKey);
    return true;
  }

  // Multi-chunk storage for large notebooks (>750 KB UTF-8 bytes, e.g. Greek text or cropped high-res images)
  const chunks = splitStringByUtf8Bytes(dataJson, FIRESTORE_CHUNK_SIZE);

  let manifestIncludesChunk0 = true;
  let manifestJson = JSON.stringify({
    __chunked: true,
    chunkCount: chunks.length,
    totalLength: dataJson.length,
    version: updatedAt,
    chunk0: chunks[0],
  });
  // Guard against JSON escaping pushing manifestJson+chunk0 over Firestore's 1 MiB UTF-8 doc limit
  if (getUtf8ByteLength(manifestJson) > 900000) {
    manifestIncludesChunk0 = false;
    manifestJson = JSON.stringify({
      __chunked: true,
      chunkCount: chunks.length,
      totalLength: dataJson.length,
      version: updatedAt,
    });
  }

  // When manifest already embeds chunk0, skip writing redundant __chunk_0 doc!
  const chunkStartIdx = manifestIncludesChunk0 ? 1 : 0;
  const prevWrittenChunks = lastWrittenChunksMap.get(cacheKey);
  const changedChunkIndices: number[] = [];
  for (let cIdx = chunkStartIdx; cIdx < chunks.length; cIdx++) {
    if (!prevWrittenChunks || prevWrittenChunks[cIdx] !== chunks[cIdx]) {
      changedChunkIndices.push(cIdx);
    }
  }

  // Commit all changed chunks AND the primary manifest doc in a SINGLE atomic writeBatch whenever possible!
  if (changedChunkIndices.length <= 14) {
    const batch = writeBatch(db);
    for (const cIdx of changedChunkIndices) {
      const chunkDocId = `${nb.id}__chunk_${cIdx}`;
      batch.set(
        doc(db, 'users', uid, 'notebooks', chunkDocId),
        {
          id: chunkDocId,
          title: '__CHUNK__',
          updatedAt,
          dataJson: chunks[cIdx],
          deleted: false,
          deviceId,
        },
        { merge: true }
      );
    }
    batch.set(
      primaryRef,
      {
        id: nb.id,
        title: safeTitle,
        updatedAt,
        dataJson: manifestJson,
        deleted: false,
        deviceId,
      },
      { merge: true }
    );
    if (prevChunkCount > chunks.length) {
      for (let cIdx = chunks.length; cIdx < prevChunkCount; cIdx++) {
        batch.delete(doc(db, 'users', uid, 'notebooks', `${nb.id}__chunk_${cIdx}`));
      }
    }
    await batch.commit();
    knownRemoteChunkCountMap.set(cacheKey, chunks.length);
    lastWrittenChunksMap.set(
      cacheKey,
      manifestIncludesChunk0 ? ['', ...chunks.slice(1)] : chunks.slice()
    );
    return true;
  }

  // Fallback for huge multi-batch notebooks (> 6 MB)
  for (let batchStart = 0; batchStart < changedChunkIndices.length; batchStart += 6) {
    const batchPromises: Promise<void>[] = [];
    const batchEnd = Math.min(changedChunkIndices.length, batchStart + 6);
    for (let idx = batchStart; idx < batchEnd; idx++) {
      const cIdx = changedChunkIndices[idx];
      const chunkDocId = `${nb.id}__chunk_${cIdx}`;
      batchPromises.push(
        setDoc(
          doc(db, 'users', uid, 'notebooks', chunkDocId),
          {
            id: chunkDocId,
            title: '__CHUNK__',
            updatedAt,
            dataJson: chunks[cIdx],
            deleted: false,
            deviceId,
          },
          { merge: true }
        )
      );
    }
    await Promise.all(batchPromises);
  }

  await setDoc(
    primaryRef,
    {
      id: nb.id,
      title: safeTitle,
      updatedAt,
      dataJson: manifestJson,
      deleted: false,
      deviceId,
    },
    { merge: true }
  );

  if (prevChunkCount > chunks.length) {
    for (let cIdx = chunks.length; cIdx < prevChunkCount; cIdx++) {
      void deleteDoc(doc(db, 'users', uid, 'notebooks', `${nb.id}__chunk_${cIdx}`)).catch(() => {});
    }
  }
  knownRemoteChunkCountMap.set(cacheKey, chunks.length);
  lastWrittenChunksMap.set(
    cacheKey,
    manifestIncludesChunk0 ? ['', ...chunks.slice(1)] : chunks.slice()
  );
  return true;
}
