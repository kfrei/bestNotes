/**
 * BestNotes User Telemetry & Admin Analytics Service
 * Domain: Telemetry, Session Tracking & Multi-User Analytics
 */

import type { User } from 'firebase/auth';
import {
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from '../../../firebase';
import type { Notebook } from '../../../types/note';
import type { UserProfileStats, AdminAggregateMetrics } from '../types';

export const ADMIN_EMAIL = 'freiderikoskostas@gmail.com';

const ACTIVE_DAYS_SET_KEY_PREFIX = 'bestnotes_active_days_';
const TODAY_SECONDS_KEY_PREFIX = 'bestnotes_active_secs_';

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Tracks active engagement seconds for the current user.
 */
export function recordActiveSecondsLocally(uid: string, deltaSec: number): void {
  if (!uid || deltaSec <= 0) return;
  try {
    const today = getTodayKey();
    const daySecsKey = `${TODAY_SECONDS_KEY_PREFIX}${uid}_${today}`;
    const curSecs = parseInt(localStorage.getItem(daySecsKey) || '0', 10) || 0;
    localStorage.setItem(daySecsKey, String(curSecs + deltaSec));

    const daysSetKey = `${ACTIVE_DAYS_SET_KEY_PREFIX}${uid}`;
    let recordedDays: string[] = [];
    try {
      const raw = localStorage.getItem(daysSetKey);
      if (raw) recordedDays = JSON.parse(raw);
    } catch {
      // ignore
    }
    if (!recordedDays.includes(today)) {
      recordedDays.push(today);
      localStorage.setItem(daysSetKey, JSON.stringify(recordedDays));
    }
  } catch {
    // ignore
  }
}

/**
 * Calculates total accumulated seconds and active days for the current user.
 */
export function getUserActivitySummaryLocally(uid: string): {
  totalSeconds: number;
  activeDaysCount: number;
  avgDailyMinutes: number;
} {
  try {
    const daysSetKey = `${ACTIVE_DAYS_SET_KEY_PREFIX}${uid}`;
    let recordedDays: string[] = [];
    try {
      const raw = localStorage.getItem(daysSetKey);
      if (raw) recordedDays = JSON.parse(raw);
    } catch {
      // ignore
    }
    if (!recordedDays.includes(getTodayKey())) {
      recordedDays.push(getTodayKey());
    }

    let totalSeconds = 0;
    for (const d of recordedDays) {
      const secs = parseInt(localStorage.getItem(`${TODAY_SECONDS_KEY_PREFIX}${uid}_${d}`) || '0', 10) || 0;
      totalSeconds += secs;
    }

    // Baseline minimum 120s if brand new active session
    if (totalSeconds < 120) totalSeconds = 120;
    const activeDaysCount = Math.max(1, recordedDays.length);
    const avgDailyMinutes = Math.round((totalSeconds / 60) / activeDaysCount);

    return { totalSeconds, activeDaysCount, avgDailyMinutes };
  } catch {
    return { totalSeconds: 120, activeDaysCount: 1, avgDailyMinutes: 2 };
  }
}

/**
 * Estimates total storage bytes consumed by user's notebooks
 */
export function computeTotalNotebooksSizeBytes(notebooks: Notebook[]): number {
  let bytes = 0;
  for (const nb of notebooks) {
    bytes += (nb.title?.length || 0) * 2;
    for (const p of nb.pages || []) {
      bytes += p.backgroundDataUrl?.length || 0;
      bytes += (p.strokes?.length || 0) * 80;
      bytes += (p.texts?.length || 0) * 50;
      for (const im of p.images || []) {
        bytes += im.dataUrl?.length || 0;
      }
    }
  }
  return bytes;
}

/**
 * Synchronizes user profile and metrics to Firestore `user_profiles/{uid}`
 */
export async function syncCurrentUserProfileStats(
  user: User,
  notebooks: Notebook[]
): Promise<void> {
  if (!user || !user.uid) return;
  try {
    const uid = user.uid;
    const { totalSeconds, activeDaysCount, avgDailyMinutes } = getUserActivitySummaryLocally(uid);
    const totalSizeBytes = computeTotalNotebooksSizeBytes(notebooks);
    const nowIso = new Date().toISOString();

    const createdAt = user.metadata.creationTime
      ? new Date(user.metadata.creationTime).toISOString()
      : nowIso;

    const profileData: UserProfileStats = {
      uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Χρήστης',
      photoURL: user.photoURL || undefined,
      createdAt,
      lastSeenAt: nowIso,
      notebooksCount: notebooks.length,
      totalSizeBytes,
      totalActiveSeconds: totalSeconds,
      activeDaysCount,
      avgDailyMinutes,
      updatedAt: nowIso,
    };

    const docRef = doc(db, 'user_profiles', uid);
    await setDoc(docRef, profileData, { merge: true });
  } catch (err) {
    console.warn('[Telemetry] syncCurrentUserProfileStats failed silently:', err);
  }
}

/**
 * Admin: Queries and retrieves all registered user profiles
 */
export async function fetchAdminUsersList(): Promise<UserProfileStats[]> {
  try {
    const colRef = collection(db, 'user_profiles');
    const q = query(colRef, orderBy('lastSeenAt', 'desc'), limit(500));
    const snap = await getDocs(q);
    const list: UserProfileStats[] = [];
    snap.forEach((d) => {
      list.push(d.data() as UserProfileStats);
    });
    return list;
  } catch (err) {
    console.error('[Admin] fetchAdminUsersList error:', err);
    return [];
  }
}

/**
 * Computes high-level KPI aggregate metrics across all users
 */
export function computeAdminMetrics(users: UserProfileStats[]): AdminAggregateMetrics {
  const totalUsers = users.length;
  let totalNotebooks = 0;
  let totalSizeBytes = 0;
  let totalDailyMinutes = 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  let activeTodayCount = 0;

  for (const u of users) {
    totalNotebooks += u.notebooksCount || 0;
    totalSizeBytes += u.totalSizeBytes || 0;
    totalDailyMinutes += u.avgDailyMinutes || 0;
    if (u.lastSeenAt && u.lastSeenAt.startsWith(todayStr)) {
      activeTodayCount++;
    }
  }

  const avgDailyMinutesAll = totalUsers > 0 ? Math.round(totalDailyMinutes / totalUsers) : 0;

  return {
    totalUsers,
    totalNotebooks,
    totalSizeBytes,
    avgDailyMinutesAll,
    activeTodayCount,
  };
}

/**
 * Format bytes into human readable KB, MB, GB
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

/**
 * Format minutes into readable Greek time string (π.χ. "45 λεπτά" ή "1ω 20λ")
 */
export function formatMinutesLabel(mins: number): string {
  if (!mins || mins <= 0) return '0 λ';
  if (mins < 60) return `${mins} λ/ημ`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}ω ${m > 0 ? `${m}λ` : ''}/ημ`;
}
