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

export type AdminTab = 'overview' | 'users' | 'storage' | 'activity';

export interface AdminAggregateMetrics {
  totalUsers: number;
  totalNotebooks: number;
  totalSizeBytes: number;
  avgDailyMinutesAll: number;
  activeTodayCount: number;
}
