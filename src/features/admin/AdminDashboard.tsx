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
  AlertTriangle,
  LayoutDashboard,
  TrendingUp,
  Sparkles,
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

      // Ensure logical consistency across all dates (files created implies at least 1 visit session)
      for (const t of Object.values(dateMap)) {
        if (t.guestFilesCreated > 0 && t.guestVisits === 0) {
          t.guestVisits = Math.max(1, Math.ceil(t.guestFilesCreated / 3));
        }
        if (t.registeredFilesCreated > 0 && t.registeredVisits === 0) {
          t.registeredVisits = 1;
        }
        if (t.totalVisits < (t.guestVisits + t.registeredVisits)) {
          t.totalVisits = t.guestVisits + t.registeredVisits;
        }
        if (t.totalVisits === 0 && t.totalFilesCreated > 0) {
          t.totalVisits = 1;
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
    if (currentUser) {
      setUsers((prev) => {
        const adminProfile = buildUserProfileFromUser(currentUser, notebooks);
        if (prev.length === 0) {
          return [adminProfile];
        }
        const existingIdx = prev.findIndex((u) => u.uid === currentUser.uid);
        if (existingIdx === -1) {
          return [adminProfile, ...prev];
        }
        return prev;
      });
    }
  }, [currentUser, notebooks]);

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
          <img
            src="/explainboards-icon.png"
            alt="ExplainBoards"
            className="w-16 h-16 mx-auto rounded-3xl shadow-lg object-contain"
          />

          <div>
            <h1 className="text-xl font-extrabold text-[#1b2a4a] tracking-tight">
              <span>Explain</span>
              <span className="bg-gradient-to-r from-[#e11d48] to-[#f43f5e] bg-clip-text text-transparent font-black">Boards</span>{' '}
              <span className="text-slate-700">Admin Portal</span>
            </h1>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Απαιτείται σύνδεση με το λογαριασμό Google του διαχειριστή{' '}
              <span className="font-bold text-[#1b2a4a]">({ADMIN_EMAIL})</span>.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={onSignInGoogle}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1b2a4a] hover:bg-[#152238] text-white text-xs font-bold shadow-md transition cursor-pointer"
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
              <span className="font-bold text-[#1b2a4a]">{ADMIN_EMAIL}</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToNotes}
            className="w-full py-2.5 rounded-xl bg-[#1b2a4a] hover:bg-[#152238] text-white text-xs font-bold shadow-md transition cursor-pointer"
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
            <h2 className="text-xl font-extrabold text-[#1b2a4a] tracking-tight flex items-center gap-3">
              {currentTab === 'overview' && (
                <>
                  <div className="w-9 h-9 rounded-xl bg-[#eef3f8] border border-[#1b2a4a]/20 flex items-center justify-center text-[#1b2a4a] shadow-2xs">
                    <LayoutDashboard className="w-5 h-5 text-[#1b2a4a]" />
                  </div>
                  <span>Επισκόπηση Πλατφόρμας</span>
                </>
              )}
              {currentTab === 'traffic' && (
                <>
                  <div className="w-9 h-9 rounded-xl bg-[#eef3f8] border border-[#1b2a4a]/20 flex items-center justify-center text-[#1b2a4a] shadow-2xs">
                    <TrendingUp className="w-5 h-5 text-[#1b2a4a]" />
                  </div>
                  <span>Κίνηση Επισκεπτών & Δημιουργία Αρχείων</span>
                </>
              )}
              {currentTab === 'ocr' && (
                <>
                  <div className="w-9 h-9 rounded-xl bg-[#eef3f8] border border-[#1b2a4a]/20 flex items-center justify-center text-[#1b2a4a] shadow-2xs">
                    <Sparkles className="w-5 h-5 text-[#1b2a4a]" />
                  </div>
                  <span>Χρήση AI (OCR & Ζωντάνεμα) & Δωρεάν Όριο Gemini</span>
                </>
              )}
              {currentTab === 'users' && (
                <>
                  <div className="w-9 h-9 rounded-xl bg-[#eef3f8] border border-[#1b2a4a]/20 flex items-center justify-center text-[#1b2a4a] shadow-2xs">
                    <Users className="w-5 h-5 text-[#1b2a4a]" />
                  </div>
                  <span>Διαχείριση Χρηστών & Αρχείων</span>
                </>
              )}
              {currentTab === 'storage' && (
                <>
                  <div className="w-9 h-9 rounded-xl bg-[#eef3f8] border border-[#1b2a4a]/20 flex items-center justify-center text-[#1b2a4a] shadow-2xs">
                    <HardDrive className="w-5 h-5 text-[#1b2a4a]" />
                  </div>
                  <span>Κατανομή Χωρητικότητας & Αποθήκευσης</span>
                </>
              )}
              {currentTab === 'activity' && (
                <>
                  <div className="w-9 h-9 rounded-xl bg-[#eef3f8] border border-[#1b2a4a]/20 flex items-center justify-center text-[#1b2a4a] shadow-2xs">
                    <Clock className="w-5 h-5 text-[#1b2a4a]" />
                  </div>
                  <span>Χρόνος Χρήσης & Telemetry</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Live Cloud Analytics για το BestNotes / ExplainBoards
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eef3f8] border border-[#1b2a4a]/20 text-[#1b2a4a] text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#1b2a4a]" />
              <span>Συνδεδεμένος Admin</span>
            </span>
          </div>
        </div>

        {/* Global KPI Cards */}
        <AdminKpiCards metrics={metrics} />

        {/* Admin vs Other Users Split Pill */}
        <div className="p-3.5 rounded-2xl ipados-liquid-glass bg-[#fdfbf7]/90 backdrop-blur-2xl border border-white/85 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1b2a4a] ring-2 ring-[#1b2a4a]/30 shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#1b2a4a]">
                Διαχωρισμός Δεδομένων: Admin vs Υπόλοιποι Χρήστες
              </span>
              <span className="text-[10.5px] font-semibold text-slate-500 ml-1.5">
                ({ADMIN_EMAIL})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#dfd8cb] shadow-2xs">
              <span className="text-slate-500 text-[11px] font-semibold">Αρχεία:</span>
              <span className="font-extrabold text-[#1b2a4a] bg-[#1b2a4a]/10 px-2 py-0.5 rounded text-[11px]">
                Εσύ: {metrics.adminNotebooksCount}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-slate-700 text-[11px]">
                Άλλοι: {metrics.otherUsersNotebooksCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#dfd8cb] shadow-2xs">
              <span className="text-slate-500 text-[11px] font-semibold">Χώρος:</span>
              <span className="font-extrabold text-[#1b2a4a] bg-[#1b2a4a]/10 px-2 py-0.5 rounded text-[11px]">
                Εσύ: {formatBytes(metrics.adminSizeBytes)}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-slate-700 text-[11px]">
                Άλλοι: {formatBytes(metrics.otherUsersSizeBytes)}
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{errorMsg}</span>
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
                <HardDrive className="w-4 h-4 text-[#1b2a4a]" />
                <span>Ανάλυση Χρήσης Χώρου ανά Χρήστη</span>
              </h3>
              <p className="text-xs text-slate-500">
                Συνολικός χώρος σημειώσεων, εικόνων και σχεδίων στο Cloud Firestore: <span className="font-bold text-[#1b2a4a]">{formatBytes(metrics.totalSizeBytes)}</span>.
              </p>

              {/* Comparative Storage Bar: Admin vs Others */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5">
                  <span className="font-extrabold text-[#1b2a4a] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#1b2a4a]" />
                    <span>Δικά σου (Admin): {formatBytes(metrics.adminSizeBytes)} ({metrics.totalSizeBytes > 0 ? ((metrics.adminSizeBytes / metrics.totalSizeBytes) * 100).toFixed(1) : 0}%)</span>
                  </span>
                  <span className="font-bold text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#64748b]" />
                    <span>Υπόλοιποι Χρήστες: {formatBytes(metrics.otherUsersSizeBytes)} ({metrics.totalSizeBytes > 0 ? ((metrics.otherUsersSizeBytes / metrics.totalSizeBytes) * 100).toFixed(1) : 0}%)</span>
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden flex">
                  <div
                    style={{ width: `${metrics.totalSizeBytes > 0 ? (metrics.adminSizeBytes / metrics.totalSizeBytes) * 100 : 0}%` }}
                    className="h-full bg-[#1b2a4a] transition-all duration-500"
                    title={`Admin: ${formatBytes(metrics.adminSizeBytes)}`}
                  />
                  <div
                    style={{ width: `${metrics.totalSizeBytes > 0 ? (metrics.otherUsersSizeBytes / metrics.totalSizeBytes) * 100 : 0}%` }}
                    className="h-full bg-[#64748b] transition-all duration-500"
                    title={`Άλλοι χρήστες: ${formatBytes(metrics.otherUsersSizeBytes)}`}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {users.slice(0, 10).map((u) => {
                  const isAdminUser = u.email === ADMIN_EMAIL;
                  const pct = metrics.totalSizeBytes > 0
                    ? Math.min(100, (u.totalSizeBytes / metrics.totalSizeBytes) * 100)
                    : 0;
                  return (
                    <div
                      key={u.uid}
                      className={`p-3 rounded-xl transition ${
                        isAdminUser
                          ? 'bg-[#eef3f8] border border-[#1b2a4a]/25 shadow-2xs'
                          : 'bg-white/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`font-bold truncate ${isAdminUser ? 'text-[#1b2a4a] font-extrabold' : 'text-slate-800'}`}>
                            {u.displayName} ({u.email})
                          </span>
                          {isAdminUser && (
                            <span className="px-1.5 py-0.5 rounded bg-[#1b2a4a] text-white text-[9px] font-black uppercase shrink-0">
                              Admin (Εσύ)
                            </span>
                          )}
                        </div>
                        <span className={`tabular-nums ${isAdminUser ? 'font-black text-[#1b2a4a]' : 'font-bold text-slate-600'}`}>
                          {formatBytes(u.totalSizeBytes)} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isAdminUser ? 'bg-[#1b2a4a]' : 'bg-[#64748b]'
                          }`}
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
                <Clock className="w-4 h-4 text-[#1b2a4a]" />
                <span>Κατάταξη Χρόνου Χρήσης (Engagement Ranking)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Μέσος όρος παραμονής και ενεργής γραφής/μελέτης στην εφαρμογή ανά ημέρα: <span className="font-bold text-[#1b2a4a]">{formatMinutesLabel(metrics.avgDailyMinutesAll)}</span>.
              </p>

              <div className="space-y-3 pt-2">
                {users
                  .slice()
                  .sort((a, b) => b.avgDailyMinutes - a.avgDailyMinutes)
                  .slice(0, 10)
                  .map((u, i) => {
                    const isAdminUser = u.email === ADMIN_EMAIL;
                    return (
                      <div
                        key={u.uid}
                        className={`flex items-center justify-between p-3 rounded-xl border transition ${
                          isAdminUser
                            ? 'bg-[#eef3f8] border-[#1b2a4a]/25 shadow-2xs'
                            : 'bg-white/70 border-[#dfd8cb]/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isAdminUser ? 'bg-[#1b2a4a] text-white' : 'bg-slate-600 text-white'
                          }`}>
                            {i + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className={`text-xs font-bold ${isAdminUser ? 'text-[#1b2a4a] font-extrabold' : 'text-slate-800'}`}>
                                {u.displayName}
                              </p>
                              {isAdminUser && (
                                <span className="px-1.5 py-0.5 rounded bg-[#1b2a4a] text-white text-[9px] font-black uppercase shrink-0">
                                  Admin (Εσύ)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-xs font-extrabold tabular-nums ${isAdminUser ? 'text-[#1b2a4a]' : 'text-slate-700'}`}>
                            {formatMinutesLabel(u.avgDailyMinutes)}
                          </p>
                          <p className="text-[10.5px] text-slate-400 font-semibold">
                            σε {u.activeDaysCount || 1} ημέρες
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
