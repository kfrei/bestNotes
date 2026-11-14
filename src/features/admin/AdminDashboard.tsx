import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  ShieldAlert,
  ShieldCheck,
  LogIn,
  RefreshCw,
  HardDrive,
  Users,
  Clock,
  Activity,
} from 'lucide-react';
import type { AdminTab, UserProfileStats, DailyTrafficStats } from './types';
import type { Notebook } from '../../types/note';
import {
  ADMIN_EMAIL,
  fetchAdminUsersList,
  buildUserProfileFromUser,
  computeAdminMetrics,
  formatBytes,
  formatMinutesLabel,
} from './services/userStatsService';
import { fetchDailyTrafficHistory } from './services/trafficService';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminKpiCards } from './components/AdminKpiCards';
import { AdminUsersTable } from './components/AdminUsersTable';
import { AdminTrafficView } from './components/AdminTrafficView';
import { AdminOcrAnalyticsView } from './components/AdminOcrAnalyticsView';

export interface AdminDashboardProps {
  currentUser: User | null;
  notebooks?: Notebook[];
  onBackToNotes: () => void;
  onSignInGoogle: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  notebooks = [],
  onBackToNotes,
  onSignInGoogle,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserProfileStats[]>(() => {
    if (currentUser) {
      return [buildUserProfileFromUser(currentUser, notebooks)];
    }
    return [];
  });
  const [trafficHistory, setTrafficHistory] = useState<DailyTrafficStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTrafficLoading, setIsTrafficLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const loadData = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setIsTrafficLoading(true);
    setErrorMsg(null);
    try {
      const [userList, trafficList] = await Promise.all([
        fetchAdminUsersList(currentUser, notebooks),
        fetchDailyTrafficHistory(),
      ]);
      setUsers(userList);

      // Merge & backfill historical dates from registered users so timeline covers all online history
      const dateMap: Record<string, DailyTrafficStats> = {};
      for (const t of trafficList) {
        dateMap[t.date] = { ...t };
      }

      for (const u of userList) {
        const createDate = u.createdAt?.slice(0, 10);
        if (createDate && /^\d{4}-\d{2}-\d{2}$/.test(createDate)) {
          if (!dateMap[createDate]) {
            dateMap[createDate] = {
              date: createDate,
              totalVisits: 1,
              guestVisits: 0,
              registeredVisits: 1,
              guestFilesCreated: 0,
              registeredFilesCreated: u.notebooksCount || 0,
              totalFilesCreated: u.notebooksCount || 0,
              updatedAt: u.updatedAt || new Date().toISOString(),
            };
          } else {
            dateMap[createDate].registeredVisits = (dateMap[createDate].registeredVisits || 0) + 1;
            dateMap[createDate].totalVisits = (dateMap[createDate].totalVisits || 0) + 1;
          }
        }
      }

      const mergedTraffic = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));
      setTrafficHistory(mergedTraffic);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Σφάλμα φόρτωσης δεδομένων από το Cloud.');
    } finally {
      setIsLoading(false);
      setIsTrafficLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void loadData();
    }
  }, [isAdmin]);

  // Case 1: Not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full ipados-liquid-glass bg-[#fdfbf7]/80 backdrop-blur-2xl border border-white/85 rounded-3xl p-8 shadow-xl text-center space-y-6 text-[#2c3e50]">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#234978] text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-9 h-9 text-sky-300" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-[#1b2a4a]">
              ExplainBoards Admin Portal
            </h1>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Απαιτείται σύνδεση με το λογαριασμό Google του διαχειριστή{' '}
              <span className="font-bold text-[#234978]">({ADMIN_EMAIL})</span>.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={onSignInGoogle}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#234978] hover:bg-[#1c3c63] text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Σύνδεση με Google (Admin)</span>
            </button>
            <button
              type="button"
              onClick={onBackToNotes}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition cursor-pointer"
            >
              Επιστροφή στην εφαρμογή
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Logged in, but NOT the admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full ipados-liquid-glass bg-[#fdfbf7]/80 backdrop-blur-2xl border border-rose-200 rounded-3xl p-8 shadow-xl text-center space-y-6 text-[#2c3e50]">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div>
            <h1 className="text-lg font-extrabold text-rose-900">
              Περιορισμένη Πρόσβαση (Access Denied)
            </h1>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Είστε συνδεδεμένος ως{' '}
              <span className="font-bold text-[#1b2a4a]">{currentUser.email}</span>. Το Admin
              Dashboard είναι προσβάσιμο αποκλειστικά από τον διαχειριστή{' '}
              <span className="font-bold text-[#234978]">{ADMIN_EMAIL}</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToNotes}
            className="w-full py-2.5 rounded-xl bg-[#234978] hover:bg-[#1c3c63] text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            Επιστροφή στις Σημειώσεις μου
          </button>
        </div>
      </div>
    );
  }

  // Case 3: Admin authenticated!
  const metrics = computeAdminMetrics(users);

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex text-[#2c3e50] antialiased">
      {/* Left Vertical Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onBackToNotes={onBackToNotes}
        adminEmail={ADMIN_EMAIL}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 md:p-8 space-y-6 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#dfd8cb]">
          <div>
            <h2 className="text-xl font-extrabold text-[#1b2a4a] tracking-tight">
              {currentTab === 'overview' && '📊 Επισκόπηση Πλατφόρμας'}
              {currentTab === 'users' && '👥 Διαχείριση Χρηστών & Αρχείων'}
              {currentTab === 'storage' && '💾 Κατανομή Χωρητικότητας & Αποθήκευσης'}
              {currentTab === 'activity' && '⏱️ Χρόνος Χρήσης & Telemetry'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live Cloud Analytics για το BestNotes / ExplainBoards
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Συνδεδεμένος Admin</span>
            </span>
          </div>
        </div>

        {/* Global KPI Cards */}
        <AdminKpiCards metrics={metrics} />

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tab 1: Overview (Combined Traffic, AI OCR & Users) */}
        {currentTab === 'overview' && (
          <div className="space-y-8">
            <AdminTrafficView
              traffic={trafficHistory}
              isLoading={isTrafficLoading}
            />
            <AdminOcrAnalyticsView
              traffic={trafficHistory}
              isLoading={isTrafficLoading}
            />
            <div className="space-y-4 pt-4 border-t border-[#dfd8cb]/80">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#1b2a4a] uppercase tracking-wider">
                  Μητρώο Εγγεγραμμένων Χρηστών ({users.length})
                </h3>
              </div>
              <AdminUsersTable
                users={users}
                onRefresh={loadData}
                isRefreshing={isLoading}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Traffic & Visitor Analytics */}
        {currentTab === 'traffic' && (
          <AdminTrafficView
            traffic={trafficHistory}
            isLoading={isTrafficLoading}
          />
        )}

        {/* Tab 3: AI OCR Analytics & Quota Tracking */}
        {currentTab === 'ocr' && (
          <AdminOcrAnalyticsView
            traffic={trafficHistory}
            isLoading={isTrafficLoading}
          />
        )}

        {/* Tab 4: Users Table */}
        {currentTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#1b2a4a] uppercase tracking-wider">
                Μητρώο Χρηστών ({users.length})
              </h3>
            </div>
            <AdminUsersTable
              users={users}
              onRefresh={loadData}
              isRefreshing={isLoading}
            />
          </div>
        )}

        {/* Tab 2: Storage Analysis */}
        {currentTab === 'storage' && (
          <div className="space-y-6">
            <div className="ipados-liquid-glass bg-[#fdfbf7]/80 backdrop-blur-2xl border border-white/85 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-[#1b2a4a] flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#234978]" />
                <span>Ανάλυση Χρήσης Χώρου ανά Χρήστη</span>
              </h3>
              <p className="text-xs text-slate-500">
                Συνολικός χώρος σημειώσεων, εικόνων και σχεδίων στο Cloud Firestore: <span className="font-bold text-[#234978]">{formatBytes(metrics.totalSizeBytes)}</span>.
              </p>

              <div className="space-y-3 pt-2">
                {users.slice(0, 10).map((u) => {
                  const pct = metrics.totalSizeBytes > 0
                    ? Math.min(100, (u.totalSizeBytes / metrics.totalSizeBytes) * 100)
                    : 0;
                  return (
                    <div key={u.uid} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1b2a4a]">{u.displayName} ({u.email})</span>
                        <span className="font-extrabold text-[#234978] tabular-nums">
                          {formatBytes(u.totalSizeBytes)} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-[#234978] rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Activity & Engagement Analysis */}
        {currentTab === 'activity' && (
          <div className="space-y-6">
            <div className="ipados-liquid-glass bg-[#fdfbf7]/80 backdrop-blur-2xl border border-white/85 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-[#1b2a4a] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#234978]" />
                <span>Κατάταξη Χρόνου Χρήσης (Engagement Ranking)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Μέσος όρος παραμονής και ενεργής γραφής/μελέτης στην εφαρμογή ανά ημέρα: <span className="font-bold text-[#234978]">{formatMinutesLabel(metrics.avgDailyMinutesAll)}</span>.
              </p>

              <div className="space-y-3 pt-2">
                {users
                  .slice()
                  .sort((a, b) => b.avgDailyMinutes - a.avgDailyMinutes)
                  .slice(0, 10)
                  .map((u, i) => (
                    <div
                      key={u.uid}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-[#dfd8cb]/60"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#234978] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[#1b2a4a]">{u.displayName}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-extrabold text-[#234978] tabular-nums">
                          {formatMinutesLabel(u.avgDailyMinutes)}
                        </p>
                        <p className="text-[10.5px] text-slate-400 font-semibold">
                          σε {u.activeDaysCount || 1} ημέρες
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
