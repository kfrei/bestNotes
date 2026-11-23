/**
 * BestNotes Subscription Plans & User Quota Firestore Service
 *
 * Firestore collections used:
 * 1. `app_plans/{planId}` — SubscriptionPlan definitions (readable by all clients; writable only by Admin)
 * 2. `user_profiles/{uid}` — Optional quota/plan fields merged into existing user profile document:
 *      - `planId`: string (admin-writable only; defaults to 'free', 'ultra' for admin)
 *      - `aiDayKey`: string (YYYY-MM-DD)
 *      - `aiDayCount`: number
 *      - `aiWeekKey`: string (YYYY-Www)
 *      - `aiWeekCount`: number
 *      - `aiTotalCount`: number
 */

import {
  db,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from '../../firebase';
import type { SubscriptionPlan, UserAiUsage } from './types';
import {
  DEFAULT_PLANS,
  mergePlansWithDefaults,
  normalizeAiUsage,
  mergeAiUsage,
} from './quotaLogic';

const PLANS_COLLECTION = 'app_plans';
const AI_USAGE_LOCAL_PREFIX = 'bestnotes_ai_usage_';
const PLANS_CACHE_KEY = 'bestnotes_plans_cache_v1';
const PLANS_CACHE_TS_KEY = 'bestnotes_plans_cache_ts_v1';
const PLANS_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Reads cached plans synchronously from localStorage for instant 0ms startup (Zero-Slowdown).
 */
export function readCachedPlansSync(): SubscriptionPlan[] {
  try {
    const raw = localStorage.getItem(PLANS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return mergePlansWithDefaults(parsed);
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_PLANS.map((p) => ({ ...p }));
}

function writeCachedPlans(plans: SubscriptionPlan[]): void {
  try {
    localStorage.setItem(PLANS_CACHE_KEY, JSON.stringify(plans));
    localStorage.setItem(PLANS_CACHE_TS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

function invalidateCachedPlansTimestamp(): void {
  try {
    localStorage.removeItem(PLANS_CACHE_TS_KEY);
  } catch {
    // ignore
  }
}

/**
 * Fetches all subscription plans from Firestore `app_plans` and merges with built-in defaults.
 * Uses a 12h localStorage TTL for regular clients to avoid redundant collection reads;
 * pass `forceRefresh = true` on Admin refresh/save to bypass TTL.
 */
export async function fetchSubscriptionPlans(forceRefresh = false): Promise<SubscriptionPlan[]> {
  if (!forceRefresh) {
    try {
      const raw = localStorage.getItem(PLANS_CACHE_KEY);
      const ts = Number(localStorage.getItem(PLANS_CACHE_TS_KEY) || '0');
      if (raw && Number.isFinite(ts) && ts > 0 && Date.now() - ts < PLANS_CACHE_TTL_MS) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergePlansWithDefaults(parsed);
        }
      }
    } catch {
      // ignore cache parse error and fetch fresh
    }
  }
  try {
    const colRef = collection(db, PLANS_COLLECTION);
    const snap = await getDocs(colRef);
    const fetched: SubscriptionPlan[] = [];
    snap.forEach((d) => {
      const data = d.data() as Partial<SubscriptionPlan>;
      if (data && typeof data.name === 'string') {
        fetched.push({
          id: d.id,
          name: data.name,
          description: data.description || '',
          badgeColor: data.badgeColor || '#64748b',
          order: typeof data.order === 'number' ? data.order : 10,
          isBuiltIn: Boolean(data.isBuiltIn),
          isUnlimited: Boolean(data.isUnlimited),
          maxFiles: typeof data.maxFiles === 'number' ? data.maxFiles : 5,
          maxPagesPerNativeFile:
            typeof data.maxPagesPerNativeFile === 'number' ? data.maxPagesPerNativeFile : 4,
          maxStorageMb: typeof data.maxStorageMb === 'number' ? data.maxStorageMb : 5,
          aiCallsPerDay: typeof data.aiCallsPerDay === 'number' ? data.aiCallsPerDay : 3,
          aiCallsPerWeek: typeof data.aiCallsPerWeek === 'number' ? data.aiCallsPerWeek : 10,
          allowAutoTags: Boolean(data.allowAutoTags),
          updatedAt: data.updatedAt,
        });
      }
    });
    const merged = mergePlansWithDefaults(fetched);
    writeCachedPlans(merged);
    return merged;
  } catch (err) {
    console.warn('[Plans] Could not fetch app_plans from Firestore, using defaults/cache:', err);
    return readCachedPlansSync();
  }
}

/**
 * Admin: Creates or updates a subscription plan in `app_plans/{plan.id}`.
 */
export async function saveSubscriptionPlan(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
  const cleanId = plan.id
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  if (!cleanId) {
    throw new Error('Το αναγνωριστικό (ID) του πλάνου δεν μπορεί να είναι κενό.');
  }
  const nowIso = new Date().toISOString();
  const payload: SubscriptionPlan = {
    id: cleanId,
    name: plan.name.trim() || cleanId.toUpperCase(),
    description: (plan.description || '').trim(),
    badgeColor: plan.badgeColor || '#0284c7',
    order: Number.isFinite(plan.order) ? Math.floor(plan.order) : 10,
    isBuiltIn: Boolean(plan.isBuiltIn || cleanId === 'free' || cleanId === 'plus' || cleanId === 'ultra'),
    isUnlimited: Boolean(plan.isUnlimited),
    maxFiles: Number.isFinite(plan.maxFiles) ? Math.floor(plan.maxFiles) : -1,
    maxPagesPerNativeFile: Number.isFinite(plan.maxPagesPerNativeFile)
      ? Math.floor(plan.maxPagesPerNativeFile)
      : -1,
    maxStorageMb: Number.isFinite(plan.maxStorageMb) ? Math.floor(plan.maxStorageMb) : -1,
    aiCallsPerDay: Number.isFinite(plan.aiCallsPerDay) ? Math.floor(plan.aiCallsPerDay) : -1,
    aiCallsPerWeek: Number.isFinite(plan.aiCallsPerWeek) ? Math.floor(plan.aiCallsPerWeek) : -1,
    allowAutoTags: Boolean(plan.allowAutoTags),
    updatedAt: nowIso,
  };

  await setDoc(doc(db, PLANS_COLLECTION, cleanId), payload, { merge: true });
  invalidateCachedPlansTimestamp();
  return payload;
}

/**
 * Admin: Deletes a custom subscription plan (built-in free/plus/ultra are protected).
 */
export async function deleteSubscriptionPlan(planId: string): Promise<void> {
  const cleanId = planId.trim().toLowerCase();
  if (cleanId === 'free' || cleanId === 'plus' || cleanId === 'ultra') {
    throw new Error('Δεν επιτρέπεται η διαγραφή των βασικών πλάνων (FREE, PLUS, ULTRA).');
  }
  await deleteDoc(doc(db, PLANS_COLLECTION, cleanId));
  invalidateCachedPlansTimestamp();
}

/**
 * LocalStorage cache for authenticated user's AI usage (never used for guests).
 */
export function readLocalAiUsage(uid: string): UserAiUsage {
  if (!uid) return normalizeAiUsage(null);
  try {
    const raw = localStorage.getItem(`${AI_USAGE_LOCAL_PREFIX}${uid}`);
    if (raw) {
      return normalizeAiUsage(JSON.parse(raw));
    }
  } catch {
    // ignore
  }
  return normalizeAiUsage(null);
}

export function writeLocalAiUsage(uid: string, usage: UserAiUsage): void {
  if (!uid) return;
  try {
    localStorage.setItem(`${AI_USAGE_LOCAL_PREFIX}${uid}`, JSON.stringify(usage));
  } catch {
    // ignore
  }
}

/**
 * Loads the authenticated user's assigned `planId` and `aiUsage` from `user_profiles/{uid}`.
 */
export async function fetchUserPlanAndUsage(uid: string): Promise<{
  planId: string;
  usage: UserAiUsage;
}> {
  const localUsage = readLocalAiUsage(uid);
  if (!uid) {
    return { planId: 'free', usage: localUsage };
  }
  try {
    const snap = await getDoc(doc(db, 'user_profiles', uid));
    if (snap.exists()) {
      const data = snap.data();
      const planId =
        typeof data.planId === 'string' && data.planId.trim()
          ? data.planId.trim().toLowerCase()
          : 'free';
      const cloudUsage = normalizeAiUsage({
        dayKey: data.aiDayKey,
        dayCount: data.aiDayCount,
        weekKey: data.aiWeekKey,
        weekCount: data.aiWeekCount,
        totalCount: data.aiTotalCount,
        updatedAt: data.updatedAt,
      });
      const mergedUsage = mergeAiUsage(localUsage, cloudUsage);
      writeLocalAiUsage(uid, mergedUsage);
      return { planId, usage: mergedUsage };
    }
  } catch (err) {
    console.warn('[Plans] Could not fetch user plan/usage from Firestore:', err);
  }
  return { planId: 'free', usage: localUsage };
}

/**
 * Persists updated AI usage counters to `user_profiles/{uid}` (fire-and-forget safe).
 * Checks whether the profile document already exists so a brand-new user never triggers
 * an invalid partial-document `create` against `firestore.rules` required fields.
 */
export async function syncUserAiUsageToCloud(
  uid: string,
  usage: UserAiUsage,
  userMeta?: { email?: string | null; displayName?: string | null }
): Promise<void> {
  if (!uid) return;
  writeLocalAiUsage(uid, usage);
  try {
    const nowIso = new Date().toISOString();
    const docRef = doc(db, 'user_profiles', uid);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      await setDoc(
        docRef,
        {
          aiDayKey: usage.dayKey,
          aiDayCount: usage.dayCount,
          aiWeekKey: usage.weekKey,
          aiWeekCount: usage.weekCount,
          aiTotalCount: usage.totalCount,
          updatedAt: nowIso,
        },
        { merge: true }
      );
    } else {
      const safeEmail =
        (userMeta?.email && userMeta.email.trim()) || `${uid}@user.local`;
      const safeName =
        (userMeta?.displayName && userMeta.displayName.trim()) ||
        safeEmail.split('@')[0] ||
        'Χρήστης';
      await setDoc(
        docRef,
        {
          uid,
          email: safeEmail,
          displayName: safeName,
          createdAt: nowIso,
          lastSeenAt: nowIso,
          notebooksCount: 0,
          totalSizeBytes: 0,
          totalActiveSeconds: 0,
          activeDaysCount: 1,
          avgDailyMinutes: 0,
          aiDayKey: usage.dayKey,
          aiDayCount: usage.dayCount,
          aiWeekKey: usage.weekKey,
          aiWeekCount: usage.weekCount,
          aiTotalCount: usage.totalCount,
          updatedAt: nowIso,
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('[Plans] syncUserAiUsageToCloud error:', err);
  }
}

/**
 * Admin: Assigns a subscription plan (`planId`) to any user in `user_profiles/{uid}`.
 * Includes fallback profile fields if the target user didn't have a `user_profiles` doc yet.
 */
export async function updateUserPlanIdInCloud(
  targetUser: {
    uid: string;
    email?: string;
    displayName?: string;
    createdAt?: string;
    lastSeenAt?: string;
    notebooksCount?: number;
    totalSizeBytes?: number;
    totalActiveSeconds?: number;
    activeDaysCount?: number;
    avgDailyMinutes?: number;
  },
  planId: string
): Promise<void> {
  const cleanPlanId = planId.trim().toLowerCase() || 'free';
  const nowIso = new Date().toISOString();
  const docRef = doc(db, 'user_profiles', targetUser.uid);

  // Check if doc exists so we either merge only planId+updatedAt or seed required fields
  const existing = await getDoc(docRef);
  if (existing.exists()) {
    await setDoc(
      docRef,
      {
        planId: cleanPlanId,
        updatedAt: nowIso,
      },
      { merge: true }
    );
  } else {
    const safeEmail =
      (targetUser.email && targetUser.email.trim()) || `${targetUser.uid}@unknown.local`;
    await setDoc(
      docRef,
      {
        uid: targetUser.uid,
        email: safeEmail,
        displayName: targetUser.displayName || 'Χρήστης',
        createdAt: targetUser.createdAt || nowIso,
        lastSeenAt: targetUser.lastSeenAt || nowIso,
        notebooksCount: Number(targetUser.notebooksCount) || 0,
        totalSizeBytes: Number(targetUser.totalSizeBytes) || 0,
        totalActiveSeconds: Number(targetUser.totalActiveSeconds) || 120,
        activeDaysCount: Number(targetUser.activeDaysCount) || 1,
        avgDailyMinutes: Number(targetUser.avgDailyMinutes) || 2,
        planId: cleanPlanId,
        updatedAt: nowIso,
      },
      { merge: true }
    );
  }
}
