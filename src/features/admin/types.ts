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

export type AdminTab = 'overview' | 'traffic' | 'users' | 'storage' | 'activity';

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
  updatedAt: string;            // ISO timestamp
}

export interface AdminAggregateMetrics {
  totalUsers: number;
  totalNotebooks: number;
  totalSizeBytes: number;
  avgDailyMinutesAll: number;
  activeTodayCount: number;
}
