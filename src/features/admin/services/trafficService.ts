/**
 * BestNotes Traffic & Visitor Telemetry Service
 * Domain: Admin, Analytics & Visitor Tracking
 */

import {
  db,
  doc,
  collection,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  increment,
} from '../../../firebase';
import type { DailyTrafficStats } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Records a visitor session for today (once per browser session)
 */
export async function recordDailyVisit(isGuest: boolean): Promise<void> {
  if (typeof window === 'undefined') return;
  const today = getTodayDateString();
  const sessionKey = `bestnotes_visit_logged_${today}`;

  try {
    if (sessionStorage.getItem(sessionKey)) {
      return; // Already recorded in this tab session today
    }
    sessionStorage.setItem(sessionKey, '1');

    const trafficDocRef = doc(db, 'daily_traffic', today);
    await setDoc(
      trafficDocRef,
      {
        date: today,
        totalVisits: increment(1),
        guestVisits: isGuest ? increment(1) : increment(0),
        registeredVisits: isGuest ? increment(0) : increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    // Non-intrusive: ignore silent errors for guest network drops
    console.debug('[Traffic] recordDailyVisit skipped:', err);
  }
}

/**
 * Records file creation or file import by either a guest visitor or registered user
 */
export async function recordFileCreation(isGuest: boolean, count = 1): Promise<void> {
  if (typeof window === 'undefined' || count <= 0) return;
  const today = getTodayDateString();

  try {
    const trafficDocRef = doc(db, 'daily_traffic', today);
    await setDoc(
      trafficDocRef,
      {
        date: today,
        guestFilesCreated: isGuest ? increment(count) : increment(0),
        registeredFilesCreated: isGuest ? increment(0) : increment(count),
        totalFilesCreated: increment(count),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.debug('[Traffic] recordFileCreation skipped:', err);
  }
}

/**
 * Retroactive backfill: If an existing visitor has local notebooks created on earlier days,
 * sync those creation counts once into daily_traffic so history is preserved.
 */
export async function syncHistoricalLocalGuestFiles(
  localNotebooks: Array<{ id: string; updatedAt?: string }>
): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!Array.isArray(localNotebooks) || localNotebooks.length === 0) return;

  try {
    const backfillKey = 'bestnotes_guest_backfill_done_v1';
    if (localStorage.getItem(backfillKey) === 'true') {
      return; // Already synced this visitor's historical notebooks
    }

    const dateCounts: Record<string, number> = {};
    for (const nb of localNotebooks) {
      const dateStr = nb.updatedAt ? nb.updatedAt.slice(0, 10) : getTodayDateString();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }
    }

    for (const [date, count] of Object.entries(dateCounts)) {
      const docRef = doc(db, 'daily_traffic', date);
      await setDoc(
        docRef,
        {
          date,
          guestFilesCreated: increment(count),
          totalFilesCreated: increment(count),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    localStorage.setItem(backfillKey, 'true');
  } catch (err) {
    console.debug('[Traffic] syncHistoricalLocalGuestFiles skipped:', err);
  }
}

/**
 * Fetches all daily traffic logs for the admin dashboard
 */
export async function fetchDailyTrafficHistory(): Promise<DailyTrafficStats[]> {
  try {
    const colRef = collection(db, 'daily_traffic');
    const q = query(colRef, orderBy('date', 'desc'), limit(180));
    const snap = await getDocs(q);

    const list: DailyTrafficStats[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        date: data.date || d.id,
        totalVisits: Number(data.totalVisits) || 0,
        guestVisits: Number(data.guestVisits) || 0,
        registeredVisits: Number(data.registeredVisits) || 0,
        guestFilesCreated: Number(data.guestFilesCreated) || 0,
        registeredFilesCreated: Number(data.registeredFilesCreated) || 0,
        totalFilesCreated: Number(data.totalFilesCreated) || 0,
        totalActiveSeconds: Number(data.totalActiveSeconds) || 0,
        uniqueVisitorsEstimate: Number(data.uniqueVisitorsEstimate) || 0,
        updatedAt: data.updatedAt || '',
      });
    });

    return list;
  } catch (err) {
    console.error('[Traffic] fetchDailyTrafficHistory error:', err);
    return [];
  }
}

/**
 * Exports daily traffic history into a CSV file
 */
export function exportTrafficToCsv(traffic: DailyTrafficStats[]): void {
  const headers = [
    'Ημερομηνία',
    'Συνολικές Επισκέψεις',
    'Επισκέψεις Guests',
    'Επισκέψεις Χρηστών',
    'Αρχεία από Guests',
    'Αρχεία από Χρήστες',
    'Σύνολο Αρχείων',
    'Τελευταία Ενημέρωση',
  ];

  const rows = traffic.map((t) => [
    t.date,
    t.totalVisits,
    t.guestVisits,
    t.registeredVisits,
    t.guestFilesCreated,
    t.registeredFilesCreated,
    t.totalFilesCreated,
    t.updatedAt,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `bestnotes_traffic_analytics_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
