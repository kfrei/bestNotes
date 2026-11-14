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

export async function saveNotebookToFirestoreChunked(
  uid: string,
  nb: Notebook,
  dataJson: string,
  deviceId: string
): Promise<boolean> {
  if (sessionDeletedNotebookIds.has(nb.id)) {
    return false;
  }
  const updatedAt = nb.updatedAt || new Date().toISOString();
  const safeTitle = (nb.title || 'Σημείωση').slice(0, 900);
  const primaryRef = doc(db, 'users', uid, 'notebooks', nb.id);
  let prevChunkCount = 0;

  // STRICT SERVER-SIDE TIMESTAMP & TOMBSTONE GUARD:
  // Query live Firestore server before writing so a second device (e.g. second Mac mini or iPad opened later)
  // can NEVER overwrite a newer Cloud document or resurrect a soft-deleted document!
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

  if (dataJson.length <= FIRESTORE_SINGLE_DOC_LIMIT) {
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
    return true;
  }

  // Multi-chunk storage for large notebooks (>750 KB, e.g. 1-6 MB with multiple cropped high-res images)
  const chunks: string[] = [];
  for (let i = 0; i < dataJson.length; i += FIRESTORE_CHUNK_SIZE) {
    chunks.push(dataJson.slice(i, i + FIRESTORE_CHUNK_SIZE));
  }

  const manifestJson = JSON.stringify({
    __chunked: true,
    chunkCount: chunks.length,
    totalLength: dataJson.length,
    version: updatedAt,
    chunk0: chunks[0],
  });

  // Commit all chunks (0..N-1) AND the primary manifest doc in a SINGLE atomic writeBatch whenever possible!
  if (chunks.length <= 14) {
    const batch = writeBatch(db);
    for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
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
    return true;
  }

  // Fallback for huge multi-batch notebooks (> 6 MB)
  for (let batchStart = 0; batchStart < chunks.length; batchStart += 6) {
    const batchPromises: Promise<void>[] = [];
    const batchEnd = Math.min(chunks.length, batchStart + 6);
    for (let cIdx = batchStart; cIdx < batchEnd; cIdx++) {
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
  return true;
}
