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

export type AdminTab = 'overview' | 'traffic' | 'ocr' | 'users' | 'storage' | 'activity';

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
  updatedAt: string;            // ISO timestamp
}

export const GEMINI_FREE_TIER_DAILY_LIMIT = 1500; // 1,500 Requests Per Day on Google Gemini API Free Tier
export const GEMINI_FREE_TIER_RPM_LIMIT = 15;     // 15 Requests Per Minute

export interface DailyOcrMetrics {
  todayTotal: number;
  todayText: number;
  todayMath: number;
  todayChem: number;
  todayAnim: number;
  todayAdmin: number;
  todayOthers: number;
  dailyQuotaLimit: number;
  quotaUsedPercent: number;
  quotaRemaining: number;
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
