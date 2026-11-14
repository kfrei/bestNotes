import { useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { Notebook } from '../../../types/note';
import {
  recordActiveSecondsLocally,
  syncCurrentUserProfileStats,
} from '../services/userStatsService';
import { recordDailyVisit } from '../services/trafficService';

/**
 * Isolated lifecycle hook managing all background telemetry
 * Completely decoupled from canvas editor and UI logic
 */
export function useAppTelemetry(
  currentUser: User | null,
  notebooks: Notebook[],
  isAuthResolved = true
): void {
  // 1. Telemetry Heartbeat: Record active seconds locally every 30s when window has user focus
  useEffect(() => {
    if (!currentUser?.uid) return;
    const interval = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hasFocus()) {
        recordActiveSecondsLocally(currentUser.uid, 30);
      }
    }, 30000);
    return () => window.clearInterval(interval);
  }, [currentUser?.uid]);

  // 2. Telemetry Sync: Synchronize user profile & notebook storage usage to Firestore `user_profiles/{uid}`
  useEffect(() => {
    if (!isAuthResolved || !currentUser?.uid) return;
    void syncCurrentUserProfileStats(currentUser, notebooks);
  }, [isAuthResolved, currentUser, notebooks.length]);

  // 3. Visitor Telemetry: Record daily session visit ONLY once auth has resolved
  // This guarantees registered users / admin are never falsely counted as guests on initial mount
  useEffect(() => {
    if (!isAuthResolved) return;
    void recordDailyVisit(!currentUser);
  }, [isAuthResolved, currentUser]);
}
