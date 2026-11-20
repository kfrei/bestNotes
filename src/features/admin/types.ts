/**
 * BestNotes Admin Domain Types
 * Domain: Administration, User Telemetry, Storage Metrics & Analytics
 */

export interface UserProfileStats {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;       // ISO timestamp
  lastSeenAt: string;      // ISO timestamp
  notebooksCount: number;  // total files
  totalSizeBytes: number;  // total storage occupied (bytes)
  totalActiveSeconds: number; // cumulative time spent
  activeDaysCount: number;    // number of distinct active days
  avgDailyMinutes: number;    // (totalActiveSeconds / 60) / activeDaysCount
  updatedAt: string;       // ISO timestamp
}

export type AdminTab = 'overview' | 'billing' | 'perf' | 'traffic' | 'ocr' | 'users' | 'storage' | 'activity';

export type AiActionKind = 'text' | 'math' | 'chem' | 'anim';

export interface DailyTrafficStats {
  date: string;                 // YYYY-MM-DD
  totalVisits: number;          // Total session visits
  guestVisits: number;          // Guest/visitor sessions without login
  registeredVisits: number;     // Authenticated user visits
  guestFilesCreated: number;    // Files created/imported by guests
  registeredFilesCreated: number; // Files created/saved by logged-in users
  totalFilesCreated: number;    // guestFilesCreated + registeredFilesCreated
  totalActiveSeconds?: number;  // Cumulative active user seconds
  uniqueVisitorsEstimate?: number;
  ocrTextCount?: number;        // Handwriting Greek text OCR calls
  ocrMathCount?: number;        // Math & Equation / LaTeX OCR calls
  ocrChemCount?: number;        // Chemistry & Molecule OCR calls
  ocrAnimCount?: number;        // Smart Sketch Animation (Ζωντάνεμα) & Video AI calls
  ocrAdminCount?: number;       // AI calls initiated by Admin (freiderikoskostas@gmail.com)
  ocrOtherUsersCount?: number;  // AI calls initiated by other registered users
  ocrGuestCount?: number;       // AI calls initiated by guest visitors
  ocrTotalCount?: number;       // Total AI OCR & Animation calls today
  ocrApi1Count?: number;        // AI calls served by Gemini API Key 1 (Old Project)
  ocrApi2Count?: number;        // AI calls served by Gemini API Key 2 (New Project — projects/949176547214)
  ocrCustomKeyCount?: number;   // AI calls served by a custom localStorage API key
  updatedAt: string;            // ISO timestamp
}

export const GEMINI_FREE_TIER_RPD_PER_MODEL = 20;
export const GEMINI_FREE_TIER_RPM = 5;
export const GEMINI_FREE_TIER_TPM = 250_000;
export const GEMINI_FREE_TIER_ROTATION_MODELS = 5;
export const GEMINI_FREE_TIER_DAILY_CAPACITY =
  GEMINI_FREE_TIER_RPD_PER_MODEL * GEMINI_FREE_TIER_ROTATION_MODELS; // 100 req/day across 5 Flash/Lite models

export interface DailyOcrMetrics {
  todayTotal: number;
  todayText: number;
  todayMath: number;
  todayChem: number;
  todayAnim: number;
  todayAdmin: number;
  todayOthers: number;
  todayDailyLimit: number;
  todayUsedPercent: number;
  todayRemaining: number;
  allTimeOcrTotal: number;
  allTimeAdminTotal: number;
  allTimeOthersTotal: number;
  allTimeAnimTotal: number;
}

export interface AdminAggregateMetrics {
  totalUsers: number;
  totalNotebooks: number;
  totalSizeBytes: number;
  avgDailyMinutesAll: number;
  activeTodayCount: number;
  // Admin-specific vs other users breakdown
  adminNotebooksCount: number;
  otherUsersNotebooksCount: number;
  adminSizeBytes: number;
  otherUsersSizeBytes: number;
  adminActiveMinutes: number;
}
