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

export const GEMINI_API1_OBSERVED_CAPACITY = 207;      // Real-world exhaustion point observed on API 1 before HTTP 402
export const GEMINI_API2_ESTIMATED_CAPACITY_MIN = 200; // Conservative reference floor based on API 1
export const GEMINI_API2_ESTIMATED_CAPACITY_MAX = 250; // Reference ceiling based on API 1
export const GEMINI_API1_PROBE_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours automatic health probe interval

export type GeminiApi1ProbeStatus = 'ok' | 'depleted_402' | 'rate_limited_429' | 'error';

export interface GeminiApi1ProbeResult {
  status: GeminiApi1ProbeStatus;
  httpCode: number;
  message: string;
  model: string;
  checkedAt: string;   // ISO timestamp
  nextCheckAt: string; // ISO timestamp (checkedAt + 6 hours)
}

export interface DailyOcrMetrics {
  todayTotal: number;
  todayText: number;
  todayMath: number;
  todayChem: number;
  todayAnim: number;
  todayAdmin: number;
  todayOthers: number;
  todayApi1: number;
  todayApi2: number;
  allTimeOcrTotal: number;
  allTimeAdminTotal: number;
  allTimeOthersTotal: number;
  allTimeAnimTotal: number;
  allTimeApi1Total: number;
  allTimeApi2Total: number;
  allTimeCustomKeyTotal: number;
  api2EstimatedCapacityRef: number;
  api2EstimatedUsedPercent: number;
  api2EstimatedRemaining: number;
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
