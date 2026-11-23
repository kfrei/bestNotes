/**
 * BestNotes Public Showcase / Demo Folder Firestore Sync Engine
 * Single source of truth for public demo notebooks (`public_showcase_notebooks`)
 * and folder metadata (`public_showcase_meta/config`).
 *
 * Read: Public (Guests + Signed-in Users + Admin)
 * Write: Admin only (enforced both in client and Firestore Security Rules)
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDoc,
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Notebook } from '../../types/note';
import { FIRESTORE_SINGLE_DOC_LIMIT, FIRESTORE_CHUNK_SIZE } from './storageKeys';
import { getUtf8ByteLength, splitStringByUtf8Bytes } from './firestoreSync';
import {
  PUBLIC_SHOWCASE_META_COLLECTION,
  PUBLIC_SHOWCASE_META_DOC_ID,
  PUBLIC_SHOWCASE_NOTEBOOKS_COLLECTION,
  DEFAULT_SHOWCASE_FOLDER_NAME,
  DEFAULT_SHOWCASE_FOLDER_COLOR,
  DEFAULT_SHOWCASE_FOLDER_ICON,
  type PublicShowcaseMeta,
  type RawShowcaseFirestoreDoc,
} from './publicShowcaseLogic';

export async function saveShowcaseMetaToFirestore(
  meta: Omit<PublicShowcaseMeta, 'id'>
): Promise<void> {
  const ref = doc(db, PUBLIC_SHOWCASE_META_COLLECTION, PUBLIC_SHOWCASE_META_DOC_ID);
  const payload: Record<string, any> = {
    id: PUBLIC_SHOWCASE_META_DOC_ID,
    folderName: ((meta.folderName || '').trim() || DEFAULT_SHOWCASE_FOLDER_NAME).slice(0, 200),
    folderColor: ((meta.folderColor || '').trim() || DEFAULT_SHOWCASE_FOLDER_COLOR).slice(0, 40),
    folderIcon: ((meta.folderIcon || '').trim() || DEFAULT_SHOWCASE_FOLDER_ICON).slice(0, 64),
    seeded: Boolean(meta.seeded),
    updatedAt: meta.updatedAt || new Date().toISOString(),
  };
  if (meta.seededAt) {
    payload.seededAt = meta.seededAt.slice(0, 100);
  }
  if (meta.deviceId) {
    payload.deviceId = meta.deviceId.slice(0, 256);
  }
  await setDoc(ref, payload, { merge: true });
}

export async function saveShowcaseNotebookToFirestoreChunked(
  nb: Notebook,
  dataJson: string,
  deviceId: string
): Promise<boolean> {
  const updatedAt = nb.updatedAt || new Date().toISOString();
  const safeTitle = (nb.title || 'Σημείωση').slice(0, 900);
  const primaryRef = doc(db, PUBLIC_SHOWCASE_NOTEBOOKS_COLLECTION, nb.id);
  let prevChunkCount = 0;

  try {
    const existingSnap = await getDocFromServer(primaryRef).catch(() => getDoc(primaryRef));
    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
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
        batch.delete(doc(db, PUBLIC_SHOWCASE_NOTEBOOKS_COLLECTION, `${nb.id}__chunk_${cIdx}`));
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

  const chunks = splitStringByUtf8Bytes(dataJson, FIRESTORE_CHUNK_SIZE);

  let manifestJson = JSON.stringify({
    __chunked: true,
    chunkCount: chunks.length,
    totalLength: dataJson.length,
    version: updatedAt,
    chunk0: chunks[0],
  });
  if (getUtf8ByteLength(manifestJson) > 900000) {
    manifestJson = JSON.stringify({
      __chunked: true,
      chunkCount: chunks.length,
      totalLength: dataJson.length,
      version: updatedAt,
    });
  }

  if (chunks.length <= 14) {
    const batch = writeBatch(db);
    for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
      const chunkDocId = `${nb.id}__chunk_${cIdx}`;
      batch.set(
        doc(db, PUBLIC_SHOWCASE_NOTEBOOKS_COLLECTION, chunkDocId),
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
        batch.delete(doc(db, PUBLIC_SHOWCASE_NOTEBOOKS_COLLECTION, `${nb.id}__chunk_${cIdx}`));
      }
    }
    await batch.commit();
    return true;
  }

  for (let batchStart = 0; batchStart < chunks.length; batchStart += 6) {
    const batchPromises: Promise<void>[] = [];
    const batchEnd = Math.min(chunks.length, batchStart + 6);
    for (let cIdx = batchStart; cIdx < batchEnd; cIdx++) {
      const chunkDocId = `${nb.id}__chunk_${cIdx}`;
      batchPromises.push(
        setDoc(
          doc(db, PUBLIC_SHOWCASE_NOTEBOOKS_COLLECTION, chunkDocId),
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
      void deleteDoc(
        doc(db, PUBLIC_SHOWCASE_NOTEBOOKS_COLLECTION, `${nb.id}__chunk_${cIdx}`)
      ).catch(() => {});
    }
  }
  return true;
}

export async function softDeleteShowcaseNotebookInFirestore(
  nb: Notebook,
  nowIso: string,
  deviceId: string
): Promise<void> {
  const primaryRef = doc(db, PUBLIC_SHOWCASE_NOTEBOOKS_COLLECTION, nb.id);
  await setDoc(
    primaryRef,
    {
      id: nb.id,
      title: (nb.title || 'Σημείωση').slice(0, 900),
      updatedAt: nowIso,
      deleted: true,
      deviceId,
    },
    { merge: true }
  );
}

export function subscribePublicShowcaseMeta(
  onMeta: (meta: PublicShowcaseMeta | null, exists: boolean, fromCache: boolean) => void
): () => void {
  const ref = doc(db, PUBLIC_SHOWCASE_META_COLLECTION, PUBLIC_SHOWCASE_META_DOC_ID);
  return onSnapshot(
    ref,
    (snap) => {
      const fromCache = snap.metadata.fromCache;
      if (!snap.exists()) {
        onMeta(null, false, fromCache);
        return;
      }
      const d = snap.data();
      onMeta(
        {
          id: 'config',
          folderName:
            typeof d.folderName === 'string' && d.folderName.trim().length > 0
              ? d.folderName.trim()
              : DEFAULT_SHOWCASE_FOLDER_NAME,
          folderColor:
            typeof d.folderColor === 'string' && d.folderColor.trim().length > 0
              ? d.folderColor.trim()
              : DEFAULT_SHOWCASE_FOLDER_COLOR,
          folderIcon:
            typeof d.folderIcon === 'string' && d.folderIcon.trim().length > 0
              ? d.folderIcon.trim()
              : DEFAULT_SHOWCASE_FOLDER_ICON,
          seeded: Boolean(d.seeded),
          seededAt: typeof d.seededAt === 'string' ? d.seededAt : undefined,
          updatedAt:
            typeof d.updatedAt === 'string' && d.updatedAt.length > 0
              ? d.updatedAt
              : new Date().toISOString(),
          deviceId: typeof d.deviceId === 'string' ? d.deviceId : undefined,
        },
        true,
        fromCache
      );
    },
    (err) => {
      console.warn('[Showcase] Meta snapshot error:', err);
    }
  );
}

export function subscribePublicShowcaseNotebooks(
  onDocs: (rawDocs: RawShowcaseFirestoreDoc[], fromCache: boolean) => void
): () => void {
  const colRef = collection(db, PUBLIC_SHOWCASE_NOTEBOOKS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const rawDocs: RawShowcaseFirestoreDoc[] = [];
      snap.forEach((docSnap) => {
        rawDocs.push({ id: docSnap.id, data: docSnap.data() });
      });
      onDocs(rawDocs, snap.metadata.fromCache);
    },
    (err) => {
      console.warn('[Showcase] Notebooks snapshot error:', err);
    }
  );
}
