/**
 * Pure Quota & Plan Resolution Logic (Zero Firebase/DOM dependencies for direct testing)
 */

import {
  GUEST_LIMITS,
  type SubscriptionPlan,
  type UserAiUsage,
  type QuotaCheckResult,
} from './types';

export const ADMIN_EMAIL_LOWER = 'freiderikoskostas@gmail.com';

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'FREE',
    description: 'Δωρεάν λογαριασμός εκκίνησης με βασικές δυνατότητες AI & Cloud.',
    badgeColor: '#64748b',
    order: 0,
    isBuiltIn: true,
    isUnlimited: false,
    maxFiles: 5,
    maxPagesPerNativeFile: 4,
    maxStorageMb: 5,
    aiCallsPerDay: 3,
    aiCallsPerWeek: 10,
    allowAutoTags: false,
  },
  {
    id: 'plus',
    name: 'PLUS',
    description: 'Ιδανικό για μαθητές, φοιτητές και εκπαιδευτικούς με αυξημένα όρια.',
    badgeColor: '#0284c7',
    order: 1,
    isBuiltIn: true,
    isUnlimited: false,
    maxFiles: 20,
    maxPagesPerNativeFile: 10,
    maxStorageMb: 10,
    aiCallsPerDay: 5,
    aiCallsPerWeek: 20,
    allowAutoTags: false,
  },
  {
    id: 'ultra',
    name: 'ULTRA',
    description: 'Απεριόριστη πρόσβαση σε αρχεία, σελίδες, χώρο, AI κλήσεις & Auto-Tags.',
    badgeColor: '#7c3aed',
    order: 2,
    isBuiltIn: true,
    isUnlimited: true,
    maxFiles: -1,
    maxPagesPerNativeFile: -1,
    maxStorageMb: -1,
    aiCallsPerDay: -1,
    aiCallsPerWeek: -1,
    allowAutoTags: true,
  },
];

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.trim().toLowerCase() === ADMIN_EMAIL_LOWER);
}

/**
 * Local calendar day key: YYYY-MM-DD
 */
export function getLocalDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * ISO-8601 week key: YYYY-Www (Monday-based week)
 */
export function getIsoWeekKey(date: Date = new Date()): string {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7; // Mon=1 .. Sun=7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function normalizeAiUsage(
  raw: Partial<UserAiUsage> | null | undefined,
  now: Date = new Date()
): UserAiUsage {
  const todayKey = getLocalDayKey(now);
  const thisWeekKey = getIsoWeekKey(now);
  const dayCount = raw && raw.dayKey === todayKey && typeof raw.dayCount === 'number' && raw.dayCount > 0
    ? Math.floor(raw.dayCount)
    : 0;
  const weekCount = raw && raw.weekKey === thisWeekKey && typeof raw.weekCount === 'number' && raw.weekCount > 0
    ? Math.floor(raw.weekCount)
    : 0;
  const totalCount = raw && typeof raw.totalCount === 'number' && raw.totalCount > 0
    ? Math.floor(raw.totalCount)
    : Math.max(dayCount, weekCount);

  return {
    dayKey: todayKey,
    dayCount,
    weekKey: thisWeekKey,
    weekCount,
    totalCount,
    updatedAt: raw?.updatedAt || now.toISOString(),
  };
}

export function mergeAiUsage(
  a: Partial<UserAiUsage> | null | undefined,
  b: Partial<UserAiUsage> | null | undefined,
  now: Date = new Date()
): UserAiUsage {
  const na = normalizeAiUsage(a, now);
  const nb = normalizeAiUsage(b, now);
  return {
    dayKey: na.dayKey,
    dayCount: Math.max(na.dayCount, nb.dayCount),
    weekKey: na.weekKey,
    weekCount: Math.max(na.weekCount, nb.weekCount),
    totalCount: Math.max(na.totalCount, nb.totalCount),
    updatedAt: now.toISOString(),
  };
}

export function incrementAiUsage(
  current: Partial<UserAiUsage> | null | undefined,
  now: Date = new Date()
): UserAiUsage {
  const norm = normalizeAiUsage(current, now);
  return {
    dayKey: norm.dayKey,
    dayCount: norm.dayCount + 1,
    weekKey: norm.weekKey,
    weekCount: norm.weekCount + 1,
    totalCount: norm.totalCount + 1,
    updatedAt: now.toISOString(),
  };
}

/**
 * Merges fetched Firestore plans with DEFAULT_PLANS so built-in plans always exist
 * and are sorted by `order`.
 */
export function mergePlansWithDefaults(fetched: SubscriptionPlan[]): SubscriptionPlan[] {
  const map = new Map<string, SubscriptionPlan>();
  for (const def of DEFAULT_PLANS) {
    map.set(def.id, { ...def });
  }
  for (const p of fetched) {
    if (!p || !p.id) continue;
    const builtIn = DEFAULT_PLANS.find((d) => d.id === p.id);
    map.set(p.id, {
      ...builtIn,
      ...p,
      isBuiltIn: Boolean(builtIn || p.isBuiltIn),
    });
  }
  return Array.from(map.values()).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/**
 * Resolves the active SubscriptionPlan for a user.
 * - Returns `null` for Guest (`!isAuthenticated`).
 * - Always resolves to ULTRA for Admin (`freiderikoskostas@gmail.com`).
 * - Defaults to FREE for any authenticated user without an assigned planId.
 */
export function resolveEffectivePlan(
  isAuthenticated: boolean,
  userEmail: string | null | undefined,
  assignedPlanId: string | null | undefined,
  plans: SubscriptionPlan[]
): SubscriptionPlan | null {
  if (!isAuthenticated) return null;
  const list = plans.length > 0 ? plans : DEFAULT_PLANS;
  if (isAdminEmail(userEmail)) {
    return (
      list.find((p) => p.id === 'ultra') ||
      DEFAULT_PLANS.find((p) => p.id === 'ultra')!
    );
  }
  const targetId = (assignedPlanId || 'free').trim().toLowerCase();
  return (
    list.find((p) => p.id === targetId) ||
    list.find((p) => p.id === 'free') ||
    DEFAULT_PLANS[0]
  );
}

export function formatLimitMb(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 0.01 && bytes > 0) return '0.01 MB';
  return `${mb.toFixed(mb >= 10 ? 1 : 2)} MB`;
}

/**
 * Checks whether creating `additionalFiles` (default 1) is allowed.
 */
export function checkFileCreationAllowed(params: {
  isAuthenticated: boolean;
  plan: SubscriptionPlan | null;
  currentFilesCount: number;
  additionalFiles?: number;
}): QuotaCheckResult {
  const add = params.additionalFiles ?? 1;
  if (!params.isAuthenticated || !params.plan) {
    const maxF = GUEST_LIMITS.maxFiles;
    if (params.currentFilesCount + add > maxF) {
      return {
        allowed: false,
        reason: 'files',
        currentValue: `${params.currentFilesCount} αρχείο (Επισκέπτης)`,
        limitValue: `${maxF} αρχείο`,
      };
    }
    return { allowed: true };
  }

  if (params.plan.isUnlimited || params.plan.maxFiles < 0) {
    return { allowed: true };
  }

  if (params.currentFilesCount + add > params.plan.maxFiles) {
    return {
      allowed: false,
      reason: 'files',
      currentValue: `${params.currentFilesCount} / ${params.plan.maxFiles} αρχεία`,
      limitValue: `${params.plan.maxFiles} αρχεία (${params.plan.name})`,
    };
  }
  return { allowed: true };
}

/**
 * Checks whether adding/duplicating `additionalPages` in a notebook is allowed.
 * IMPORTANT: For signed-up users, `maxPagesPerNativeFile` applies ONLY to native/own notebooks
 * (`sourceFormat !== '.pdf'`). Opening a 50-page PDF within storage MB is allowed!
 * For Guests, max 3 pages total on their ephemeral file.
 */
export function checkPageAdditionAllowed(params: {
  isAuthenticated: boolean;
  plan: SubscriptionPlan | null;
  currentPagesCount: number;
  isNativeNotebook: boolean;
  additionalPages?: number;
}): QuotaCheckResult {
  const add = params.additionalPages ?? 1;

  if (!params.isAuthenticated || !params.plan) {
    const maxP = GUEST_LIMITS.maxPagesPerNativeFile;
    if (params.currentPagesCount + add > maxP) {
      return {
        allowed: false,
        reason: 'pages',
        currentValue: `${params.currentPagesCount} / ${maxP} σελίδες (Επισκέπτης)`,
        limitValue: `${maxP} σελίδες`,
      };
    }
    return { allowed: true };
  }

  // PDFs are bounded by storage MB, not by native notebook page limits
  if (!params.isNativeNotebook) {
    return { allowed: true };
  }

  if (params.plan.isUnlimited || params.plan.maxPagesPerNativeFile < 0) {
    return { allowed: true };
  }

  if (params.currentPagesCount + add > params.plan.maxPagesPerNativeFile) {
    return {
      allowed: false,
      reason: 'pages',
      currentValue: `${params.currentPagesCount} / ${params.plan.maxPagesPerNativeFile} σελίδες`,
      limitValue: `${params.plan.maxPagesPerNativeFile} σελίδες/αρχείο (${params.plan.name})`,
    };
  }

  return { allowed: true };
}

/**
 * Checks whether adding `additionalBytes` fits within the storage MB limit.
 */
export function checkStorageAllowed(params: {
  isAuthenticated: boolean;
  plan: SubscriptionPlan | null;
  currentTotalBytes: number;
  additionalBytes: number;
}): QuotaCheckResult {
  if (!params.isAuthenticated || !params.plan) {
    const maxBytes = GUEST_LIMITS.maxStorageMb * 1024 * 1024;
    if (params.currentTotalBytes + params.additionalBytes > maxBytes) {
      return {
        allowed: false,
        reason: 'storage',
        currentValue: formatLimitMb(params.currentTotalBytes + params.additionalBytes),
        limitValue: `${GUEST_LIMITS.maxStorageMb} MB (Επισκέπτης)`,
      };
    }
    return { allowed: true };
  }

  if (params.plan.isUnlimited || params.plan.maxStorageMb < 0) {
    return { allowed: true };
  }

  const maxBytes = params.plan.maxStorageMb * 1024 * 1024;
  if (params.currentTotalBytes + params.additionalBytes > maxBytes) {
    return {
      allowed: false,
      reason: 'storage',
      currentValue: formatLimitMb(params.currentTotalBytes + params.additionalBytes),
      limitValue: `${params.plan.maxStorageMb} MB (${params.plan.name})`,
    };
  }

  return { allowed: true };
}

/**
 * Checks whether an AI call is permitted for the user's plan and current daily/weekly usage.
 */
export function checkAiCallAllowed(params: {
  isAuthenticated: boolean;
  plan: SubscriptionPlan | null;
  usage: UserAiUsage;
  now?: Date;
}): QuotaCheckResult {
  if (!params.isAuthenticated || !params.plan) {
    return {
      allowed: false,
      reason: 'ai_guest',
      currentValue: '0 κλήσεις AI (Επισκέπτης)',
      limitValue: 'Απαιτείται λογαριασμός',
    };
  }

  if (params.plan.isUnlimited) {
    return { allowed: true };
  }

  const norm = normalizeAiUsage(params.usage, params.now);

  if (params.plan.aiCallsPerDay >= 0 && norm.dayCount >= params.plan.aiCallsPerDay) {
    return {
      allowed: false,
      reason: 'ai_daily',
      currentValue: `${norm.dayCount} / ${params.plan.aiCallsPerDay} κλήσεις σήμερα`,
      limitValue: `${params.plan.aiCallsPerDay} / ημέρα (${params.plan.name})`,
    };
  }

  if (params.plan.aiCallsPerWeek >= 0 && norm.weekCount >= params.plan.aiCallsPerWeek) {
    return {
      allowed: false,
      reason: 'ai_weekly',
      currentValue: `${norm.weekCount} / ${params.plan.aiCallsPerWeek} κλήσεις αυτή την εβδομάδα`,
      limitValue: `${params.plan.aiCallsPerWeek} / εβδομάδα (${params.plan.name})`,
    };
  }

  return { allowed: true };
}

/**
 * Checks whether Automatic/Manual AI Auto-Tags are permitted (ULTRA-only by default).
 */
export function checkAutoTagsAllowed(params: {
  isAuthenticated: boolean;
  plan: SubscriptionPlan | null;
}): QuotaCheckResult {
  if (!params.isAuthenticated || !params.plan) {
    return {
      allowed: false,
      reason: 'auto_tags',
      currentValue: 'Επισκέπτης',
      limitValue: 'Μόνο ULTRA',
    };
  }
  if (params.plan.isUnlimited || params.plan.allowAutoTags) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: 'auto_tags',
    currentValue: params.plan.name,
    limitValue: 'Μόνο ULTRA',
  };
}
