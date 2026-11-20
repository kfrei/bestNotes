import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Cloud,
  Coins,
  Database,
  Download,
  ExternalLink,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import type {
  AdminFirebaseUsageResponse,
  FirebaseDailyUsageRow,
} from '../../../firebase';
import { signInToGoogleDrive, refreshGoogleDriveTokenSilently } from '../../../firebase';
import {
  GEMINI_API1_OBSERVED_CAPACITY,
  GEMINI_API2_ESTIMATED_CAPACITY_MAX,
  GEMINI_API2_ESTIMATED_CAPACITY_MIN,
} from '../types';

export interface AdminFirebaseBillingViewProps {
  usage: AdminFirebaseUsageResponse | null;
  isLoading: boolean;
  errorMsg?: string | null;
  onRefresh: (force?: boolean) => void;
  compactOverview?: boolean;
  onOpenFullBillingTab?: () => void;
}

function formatEur(val: number): string {
  if (!val || val < 0.00005) return '0,00 €';
  if (val < 0.01) return `${val.toFixed(4).replace('.', ',')} €`;
  return `${val.toFixed(2).replace('.', ',')} €`;
}

function formatCompactBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 2 : 1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function formatGreekMonth(ym: string): string {
  const [y, m] = ym.split('-');
  const names = [
    'Ιανουάριος',
    'Φεβρουάριος',
    'Μάρτιος',
    'Απρίλιος',
    'Μάιος',
    'Ιούνιος',
    'Ιούλιος',
    'Αύγουστος',
    'Σεπτέμβριος',
    'Οκτώβριος',
    'Νοέμβριος',
    'Δεκέμβριος',
  ];
  const idx = Number(m) - 1;
  if (idx >= 0 && idx < 12) return `${names[idx]} ${y}`;
  return ym;
}

function exportFirebaseUsageCsv(rows: FirebaseDailyUsageRow[]): void {
  const headers = [
    'Ημερομηνία (UTC)',
    'Firestore Reads',
    'Firestore Writes',
    'Firestore Deletes',
    'Cloud Functions Κλήσεις',
    'Αθόρυβες Ανανεώσεις Drive',
    'Drive Cache Hits',
    'Hosting Κίνηση (MB)',
    'Gemini AI Κλήσεις',
    'Ακριβές Κόστος (EUR)',
    'Εξοικονόμηση Δωρεάν Ορίου (EUR)',
  ];
  const csvRows = rows.map((r) => [
    r.date,
    r.fsReads,
    r.fsWrites,
    r.fsDeletes,
    r.fnCalls,
    r.driveRefreshes,
    r.driveCacheHits,
    (r.hostingBytes / (1024 * 1024)).toFixed(2),
    r.geminiCalls,
    r.exactCostEur.toFixed(4),
    r.savedByFreeTierEur.toFixed(4),
  ]);
  const content = '\uFEFF' + [headers.join(','), ...csvRows.map((x) => x.join(','))].join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bestnotes_firebase_usage_costs_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const AdminFirebaseBillingView: React.FC<AdminFirebaseBillingViewProps> = ({
  usage,
  isLoading,
  errorMsg,
  onRefresh,
  compactOverview = false,
  onOpenFullBillingTab,
}) => {
  const [driveLinkBusy, setDriveLinkBusy] = useState(false);
  const [driveStatusNote, setDriveStatusNote] = useState<string | null>(null);

  const todayRow = useMemo(() => {
    if (!usage || usage.daily.length === 0) return null;
    return usage.daily.find((d) => d.date === usage.todayDate) || usage.daily[0];
  }, [usage]);

  const currentMonthRow = useMemo(() => {
    if (!usage || usage.monthly.length === 0) return null;
    return usage.monthly.find((m) => m.month === usage.currentMonth) || usage.monthly[0];
  }, [usage]);

  const quotas = usage?.quotas || {
    freeReadsPerDay: 50_000,
    freeWritesPerDay: 20_000,
    freeDeletesPerDay: 20_000,
    freeHostingBytesPerDay: 360 * 1024 * 1024,
    freeFunctionsPerMonth: 2_000_000,
    freeGeminiPerDay: 1_500,
    budgetAlertEur: 5,
  };

  const handleConnectOrTestSilentDrive = async () => {
    setDriveLinkBusy(true);
    setDriveStatusNote(null);
    try {
      if (usage?.driveOfflineStatus?.linked) {
        const silent = await refreshGoogleDriveTokenSilently(true);
        if (silent?.accessToken) {
          try {
            localStorage.setItem('bestnotes_drive_token_v3', silent.accessToken);
            localStorage.setItem('bestnotes_drive_token_time_v3', String(Date.now()));
            localStorage.setItem('bestnotes_drive_offline_linked_v1', '1');
            if (silent.email) localStorage.setItem('bestnotes_drive_email_v1', silent.email);
          } catch {
            // ignore
          }
          setDriveStatusNote(
            `✅ Επιβεβαιώθηκε! Αθόρυβη ανανέωση token (${silent.email || 'Google Drive'}) σε 0ms χωρίς κανένα παράθυρο.`
          );
          onRefresh(true);
          return;
        }
      }
      const res = await signInToGoogleDrive(usage?.driveOfflineStatus?.email || null, false);
      try {
        localStorage.setItem('bestnotes_drive_token_v3', res.accessToken);
        localStorage.setItem('bestnotes_drive_token_time_v3', String(Date.now()));
        if (res.email) localStorage.setItem('bestnotes_drive_email_v1', res.email);
        if (res.offlineLinked) localStorage.setItem('bestnotes_drive_offline_linked_v1', '1');
      } catch {
        // ignore
      }
      setDriveStatusNote(
        res.offlineLinked
          ? `✅ Ενεργοποιήθηκε μόνιμα το Αθόρυβο Sync (${res.email})! Ούτε στο Mac mini ούτε στο iPad θα ξαναεμφανιστεί λευκό παράθυρο.`
          : `⚠️ Συνδέθηκε προσωρινά (${res.email}). Δοκίμασε ξανά για αποθήκευση μόνιμου refresh token.`
      );
      onRefresh(true);
    } catch (err: any) {
      setDriveStatusNote(`⚠️ ${err?.message || 'Ακυρώθηκε ή απέτυχε η σύνδεση.'}`);
    } finally {
      setDriveLinkBusy(false);
    }
  };

  if (compactOverview) {
    return (
      <div className="ipados-liquid-glass bg-[#fdfbf7]/90 backdrop-blur-2xl border border-white/85 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-[#1b2a4a]">
                  Ζωντανές Κλήσεις & Ακριβές Κόστος Firebase (Blaze)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  {currentMonthRow && currentMonthRow.exactCostEur > 0
                    ? formatEur(currentMonthRow.exactCostEur)
                    : '0,00 € (Εντός Δωρεάν Ορίων)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Απευθείας μετρήσεις Google Cloud Monitoring για το project{' '}
                <span className="font-bold text-[#1b2a4a]">bestnotes-2026</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRefresh(true)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#dfd8cb] text-xs font-bold text-[#1b2a4a] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Ανανέωση</span>
            </button>
            {onOpenFullBillingTab && (
              <button
                type="button"
                onClick={onOpenFullBillingTab}
                className="px-3.5 py-1.5 rounded-xl bg-[#1b2a4a] hover:bg-[#152238] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                Αναλυτικός Πίνακας Κόστους →
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-2xl bg-white border border-[#dfd8cb]">
            <div className="text-[10.5px] font-bold text-slate-500">Σημερινό Κόστος</div>
            <div className="text-base font-black text-emerald-700 mt-0.5">
              {formatEur(todayRow?.exactCostEur || 0)}
            </div>
            <div className="text-[10px] text-slate-400">
              Μήνας: {formatEur(currentMonthRow?.exactCostEur || 0)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-[#dfd8cb]">
            <div className="text-[10.5px] font-bold text-slate-500">Reads Σήμερα</div>
            <div className="text-base font-black text-[#1b2a4a] mt-0.5">
              {(todayRow?.fsReads || 0).toLocaleString('el-GR')}
            </div>
            <div className="text-[10px] text-slate-400">
              Δωρεάν: {quotas.freeReadsPerDay.toLocaleString('el-GR')}/ημ
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-[#dfd8cb]">
            <div className="text-[10.5px] font-bold text-slate-500">Writes Σήμερα</div>
            <div className="text-base font-black text-[#1b2a4a] mt-0.5">
              {(todayRow?.fsWrites || 0).toLocaleString('el-GR')}
            </div>
            <div className="text-[10px] text-slate-400">
              Δωρεάν: {quotas.freeWritesPerDay.toLocaleString('el-GR')}/ημ
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-[#dfd8cb]">
            <div className="text-[10.5px] font-bold text-slate-500">Functions (Μήνας)</div>
            <div className="text-base font-black text-[#1b2a4a] mt-0.5">
              {(currentMonthRow?.fnCalls || 0).toLocaleString('el-GR')}
            </div>
            <div className="text-[10px] text-slate-400">Δωρεάν: 2.000.000/μήνα</div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-[#dfd8cb]">
            <div className="text-[10.5px] font-bold text-slate-500">Αθόρυβο Drive Sync</div>
            <div
              className={`text-xs font-extrabold mt-1 ${
                usage?.driveOfflineStatus?.linked ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {usage?.driveOfflineStatus?.linked ? '🟢 Μόνιμα Ενεργό' : '🟡 Εκκρεμεί 1 κλικ'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {usage?.driveOfflineStatus?.email || 'Χωρίς λευκά παράθυρα'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quotaCards = [
    {
      title: 'Firestore Αναγνώσεις (Reads)',
      icon: <Database className="w-4 h-4 text-[#1b2a4a]" />,
      used: todayRow?.fsReads || 0,
      limit: quotas.freeReadsPerDay,
      periodLabel: 'Σήμερα / 50.000 δωρεάν ανά ημέρα',
      subLabel: `Σύνολο μήνα: ${(currentMonthRow?.fsReads || 0).toLocaleString('el-GR')} reads`,
      rateLabel: 'Χρέωση υπέρβασης: ~0,056 € / 100.000',
    },
    {
      title: 'Firestore Εγγραφές (Writes)',
      icon: <Activity className="w-4 h-4 text-[#1b2a4a]" />,
      used: todayRow?.fsWrites || 0,
      limit: quotas.freeWritesPerDay,
      periodLabel: 'Σήμερα / 20.000 δωρεάν ανά ημέρα',
      subLabel: `Σύνολο μήνα: ${(currentMonthRow?.fsWrites || 0).toLocaleString('el-GR')} writes`,
      rateLabel: 'Χρέωση υπέρβασης: ~0,167 € / 100.000',
    },
    {
      title: 'Firestore Διαγραφές (Deletes)',
      icon: <Database className="w-4 h-4 text-slate-600" />,
      used: todayRow?.fsDeletes || 0,
      limit: quotas.freeDeletesPerDay,
      periodLabel: 'Σήμερα / 20.000 δωρεάν ανά ημέρα',
      subLabel: `Σύνολο μήνα: ${(currentMonthRow?.fsDeletes || 0).toLocaleString('el-GR')} deletes`,
      rateLabel: 'Χρέωση υπέρβασης: ~0,019 € / 100.000',
    },
    {
      title: 'Cloud Functions (Silent Drive & Telemetry)',
      icon: <Zap className="w-4 h-4 text-amber-600" />,
      used: currentMonthRow?.fnCalls || 0,
      limit: quotas.freeFunctionsPerMonth,
      periodLabel: 'Τρέχων μήνας / 2.000.000 δωρεάν ανά μήνα',
      subLabel: `Αθόρυβα Drive refreshes μήνα: ${currentMonthRow?.driveRefreshes || 0} (+${
        currentMonthRow?.driveCacheHits || 0
      } cache hits)`,
      rateLabel: 'Χρέωση υπέρβασης: ~0,37 € / 1.000.000',
    },
    {
      title: 'Firebase Hosting Κίνηση (CDN)',
      icon: <Server className="w-4 h-4 text-sky-700" />,
      used: todayRow?.hostingBytes || 0,
      limit: quotas.freeHostingBytesPerDay,
      isBytes: true,
      periodLabel: 'Σήμερα / 360 MB δωρεάν ανά ημέρα (~10,8 GB/μήνα)',
      subLabel: `Σύνολο μήνα: ${formatCompactBytes(currentMonthRow?.hostingBytes || 0)}`,
      rateLabel: 'Χρέωση υπέρβασης: ~0,14 € / GB',
    },
    {
      title: 'Google Gemini OCR API (generativelanguage)',
      icon: <Sparkles className="w-4 h-4 text-purple-700" />,
      used: todayRow?.geminiApiCalls ?? todayRow?.geminiCalls ?? 0,
      limit: GEMINI_API1_OBSERVED_CAPACITY,
      periodLabel: `Σήμερα (${todayRow?.geminiApiErrors ? `${todayRow.geminiApiErrors} σφάλμ.` : 'Cloud Monitoring'}) • Εκτίμηση ~${GEMINI_API2_ESTIMATED_CAPACITY_MIN}–${GEMINI_API2_ESTIMATED_CAPACITY_MAX}/key`,
      subLabel: `Μήνας: ${(currentMonthRow?.geminiApiCalls ?? currentMonthRow?.geminiCalls ?? 0).toLocaleString('el-GR')} επιτυχείς κλήσεις • API 1: 402 (γεμάτο), API 2: ενεργό`,
      rateLabel: `Εκτίμηση Blaze OCR (~0,0005 €/κλήση): Σήμερα ${formatEur(
        todayRow?.geminiEstCostEur || 0
      )} • Μήνας ${formatEur(currentMonthRow?.geminiEstCostEur || 0)}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action & Cost Hero Banner */}
      <div className="ipados-liquid-glass bg-[#fdfbf7]/90 backdrop-blur-2xl border border-white/85 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Blaze Plan — Live Google Cloud Monitoring</span>
              </span>
              {usage?.monitoringAvailable && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eef3f8] border border-[#1b2a4a]/15 text-[#1b2a4a] text-[11px] font-bold">
                  Ακριβείς Επίσημες Μετρήσεις Firebase
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-[#1b2a4a] pt-1">
              Ημερήσιες & Μηνιαίες Κλήσεις και Ακριβής Υπολογισμός Κόστους (€)
            </h3>
            <p className="text-xs text-slate-500">
              Όλες οι μετρήσεις τραβιούνται απευθείας από το Google Cloud Monitoring API του{' '}
              <span className="font-bold text-[#1b2a4a]">{usage?.projectId || 'bestnotes-2026'}</span>.
              Οι χρεώσεις υπολογίζονται <strong>μόνο</strong> πάνω από τα δωρεάν ημερήσια/μηνιαία όρια.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => onRefresh(true)}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-[#1b2a4a] hover:bg-[#152238] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Ανανέωση από Firebase</span>
            </button>
            {usage && usage.daily.length > 0 && (
              <button
                type="button"
                onClick={() => exportFirebaseUsageCsv(usage.daily)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#dfd8cb] text-[#1b2a4a] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Εξαγωγή CSV</span>
              </button>
            )}
            <a
              href="https://console.firebase.google.com/project/bestnotes-2026/usage"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#efebe3] hover:bg-[#e5dfd3] border border-[#dfd8cb] text-[#1b2a4a] text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Firebase Billing Console</span>
            </a>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* 4 Main Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs">
            <div className="text-xs font-bold text-slate-500">Σημερινό Κόστος (Firebase + OCR)</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {formatEur(todayRow?.totalWithGeminiEstEur ?? todayRow?.exactCostEur ?? 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Firebase: <span className="font-bold text-[#1b2a4a]">{formatEur(todayRow?.exactCostEur || 0)}</span> • OCR:{' '}
              <span className="font-bold text-purple-700">{formatEur(todayRow?.geminiEstCostEur || 0)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs">
            <div className="text-xs font-bold text-slate-500">
              Μηνιαίο Budget ({currentMonthRow ? formatGreekMonth(currentMonthRow.month) : 'Μήνας'})
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {formatEur(currentMonthRow?.totalWithGeminiEstEur ?? currentMonthRow?.exactCostEur ?? 0)}{' '}
              <span className="text-sm font-bold text-slate-400">/ {quotas.budgetAlertEur},00 €</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    (((currentMonthRow?.totalWithGeminiEstEur ?? currentMonthRow?.exactCostEur ?? 0) /
                      Math.max(1, quotas.budgetAlertEur)) *
                      100)
                  )}%`,
                }}
                className="h-full bg-emerald-600 transition-all duration-500"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
              <span>
                Firebase: <b>{formatEur(currentMonthRow?.exactCostEur || 0)}</b> • Gemini OCR:{' '}
                <b>{formatEur(currentMonthRow?.geminiEstCostEur || 0)}</b>
              </span>
              <a
                href="https://console.cloud.google.com/billing/01624B-7B5413-AF0F44/budgets"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#1b2a4a] hover:underline"
              >
                Budgets ↗
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs">
            <div className="text-xs font-bold text-slate-500">Κέρδος από το Δωρεάν Όριο (Μήνας)</div>
            <div className="text-2xl font-black text-[#1b2a4a] mt-1">
              {formatEur(currentMonthRow?.savedByFreeTierEur || 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Αξία κλήσεων που καλύφθηκε 100% δωρεάν
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-[#1b2a4a]" />
                <span>Αθόρυβο Sync Google Drive</span>
              </div>
              <div
                className={`text-sm font-black mt-1 ${
                  usage?.driveOfflineStatus?.linked ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {usage?.driveOfflineStatus?.linked
                  ? '🟢 Ενεργό (0 Αναδυόμενα Παράθυρα)'
                  : '🟡 Πάτησε 1 φορά για μόνιμη σύνδεση'}
              </div>
              {usage?.driveOfflineStatus?.email && (
                <div className="text-[10.5px] text-slate-500 truncate mt-0.5">
                  {usage.driveOfflineStatus.email}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleConnectOrTestSilentDrive}
              disabled={driveLinkBusy}
              className="mt-2.5 w-full py-1.5 px-2.5 rounded-xl bg-[#eef3f8] hover:bg-[#dfe9f3] border border-[#1b2a4a]/20 text-[#1b2a4a] text-[11px] font-extrabold transition cursor-pointer disabled:opacity-50"
            >
              {driveLinkBusy
                ? 'Έλεγχος...'
                : usage?.driveOfflineStatus?.linked
                ? '⚡ Δοκιμή Αθόρυβης Ανανέωσης Token'
                : '⚡ Ενεργοποίηση Μόνιμου Αθόρυβου Sync'}
            </button>
          </div>
        </div>

        {driveStatusNote && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{driveStatusNote}</span>
          </div>
        )}

        {/* Smart Daily Schedule Projection Banner */}
        <div className="p-3.5 rounded-2xl bg-[#f7f5f0] border border-[#dfd8cb] flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="font-bold text-[#1b2a4a]">
            ⏱️ Ενεργό Πρόγραμμα Αυτόματου Sync: <span className="text-emerald-700">08:00–14:00 (κάθε 1 ώρα) & 14:00–20:00 (κάθε 2 ώρες)</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-600">
            Προγραμματισμένα slots: <span className="font-extrabold text-[#1b2a4a]">10/ημέρα</span> (~<span className="font-extrabold text-[#1b2a4a]">300/μήνα</span> έναντι 2.000.000 δωρεάν Cloud Functions = <span className="font-extrabold text-emerald-700">0,015% • 0,00 €</span>)
          </div>
        </div>

        {/* Free-Tier Gemini OCR Tip */}
        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="text-purple-950">
            <span className="font-extrabold">💡 Δωρεάν OCR (0,00 €):</span> Επειδή το <span className="font-bold">bestnotes-2026</span> είναι σε Blaze, ένα Gemini API key του ίδιου project χρεώνεται Paid Tier 1 (~0,0005 €/OCR). Αν βάλεις στα Settings ένα νέο key από{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold underline text-purple-800 hover:text-purple-950"
            >
              Google AI Studio (Create API key in new project, χωρίς κάρτα) ↗
            </a>
            , το OCR παραμένει <strong>100% δωρεάν (0,00 €)</strong>!
          </div>
        </div>
      </div>

      {/* 6 Quota Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {quotaCards.map((card) => {
          const pct = Math.min(100, (card.used / Math.max(1, card.limit)) * 100);
          const isOver = card.used > card.limit;
          const isWarn = !isOver && pct >= 75;
          return (
            <div
              key={card.title}
              className="ipados-liquid-glass bg-[#fdfbf7]/90 backdrop-blur-2xl border border-white/85 rounded-3xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#dfd8cb] flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="text-xs font-extrabold text-[#1b2a4a]">{card.title}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                    isOver
                      ? 'bg-rose-100 text-rose-800'
                      : isWarn
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {pct < 0.1 && card.used > 0 ? '< 0,1%' : `${pct.toFixed(1).replace('.', ',')}%`}
                </span>
              </div>

              <div>
                <div className="text-xl font-black text-[#1b2a4a]">
                  {card.isBytes
                    ? formatCompactBytes(card.used)
                    : card.used.toLocaleString('el-GR')}
                </div>
                <div className="text-[11px] font-semibold text-slate-500">{card.periodLabel}</div>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  style={{ width: `${Math.max(card.used > 0 ? 1.5 : 0, pct)}%` }}
                  className={`h-full transition-all duration-500 ${
                    isOver ? 'bg-rose-600' : isWarn ? 'bg-amber-500' : 'bg-[#1b2a4a]'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-0.5">
                <span className="font-semibold text-slate-600">{card.subLabel}</span>
              </div>
              <div className="text-[10px] text-slate-400">{card.rateLabel}</div>
            </div>
          );
        })}
      </div>

      {/* Monthly Aggregation Table */}
      <div className="ipados-liquid-glass bg-[#fdfbf7]/90 backdrop-blur-2xl border border-white/85 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#1b2a4a] uppercase tracking-wider">
          Μηνιαία Σύνοψη Κλήσεων & Ακριβούς Κόστους
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-[#dfd8cb] bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f5f0] border-b border-[#dfd8cb] text-[#1b2a4a] font-extrabold">
                <th className="py-3 px-4">Μήνας</th>
                <th className="py-3 px-3 text-right">Ημέρες</th>
                <th className="py-3 px-3 text-right">Firestore Reads</th>
                <th className="py-3 px-3 text-right">Firestore Writes</th>
                <th className="py-3 px-3 text-right">Deletes</th>
                <th className="py-3 px-3 text-right">Cloud Functions</th>
                <th className="py-3 px-3 text-right">Hosting CDN</th>
                <th className="py-3 px-3 text-right">Gemini AI</th>
                <th className="py-3 px-4 text-right">Ακριβές Κόστος</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(usage?.monthly || []).map((m) => (
                <tr key={m.month} className="hover:bg-[#fdfbf7] transition">
                  <td className="py-3 px-4 font-extrabold text-[#1b2a4a]">
                    {formatGreekMonth(m.month)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-600">
                    {m.daysCount}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#1b2a4a]">
                    {m.fsReads.toLocaleString('el-GR')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#1b2a4a]">
                    {m.fsWrites.toLocaleString('el-GR')}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">
                    {m.fsDeletes.toLocaleString('el-GR')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#1b2a4a]">
                    {m.fnCalls.toLocaleString('el-GR')}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">
                    {formatCompactBytes(m.hostingBytes)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">
                    {m.geminiCalls.toLocaleString('el-GR')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full font-extrabold ${
                        m.exactCostEur > 0
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {formatEur(m.exactCostEur)}
                    </span>
                  </td>
                </tr>
              ))}
              {(!usage || usage.monthly.length === 0) && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-semibold">
                    {isLoading ? 'Φόρτωση μηνιαίων στοιχείων από το Firebase...' : 'Δεν βρέθηκαν δεδομένα.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Detailed Table */}
      <div className="ipados-liquid-glass bg-[#fdfbf7]/90 backdrop-blur-2xl border border-white/85 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-sm font-extrabold text-[#1b2a4a] uppercase tracking-wider">
              Ημερήσιο Ιστορικό Κλήσεων & Κόστους (Ανά Ημέρα)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Κόκκινη ένδειξη εμφανίζεται μόνο αν κάποια ημέρα ξεπεράσει τα δωρεάν όρια (50k reads ή 20k writes).
            </p>
          </div>
          {usage?.fetchedAt && (
            <span className="text-[11px] font-semibold text-slate-500">
              Τελευταία λήψη:{' '}
              {new Date(usage.fetchedAt).toLocaleTimeString('el-GR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#dfd8cb] bg-white max-h-[520px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-[#f7f5f0] border-b border-[#dfd8cb] text-[#1b2a4a] font-extrabold">
              <tr>
                <th className="py-3 px-4">Ημερομηνία</th>
                <th className="py-3 px-3 text-right">Reads (50k free)</th>
                <th className="py-3 px-3 text-right">Writes (20k free)</th>
                <th className="py-3 px-3 text-right">Deletes</th>
                <th className="py-3 px-3 text-right">Functions</th>
                <th className="py-3 px-3 text-right">Drive Sync Token</th>
                <th className="py-3 px-3 text-right">Hosting</th>
                <th className="py-3 px-3 text-right">Gemini AI</th>
                <th className="py-3 px-4 text-right">Κόστος Ημέρας</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(usage?.daily || []).map((d) => {
                const overReads = d.fsReads > quotas.freeReadsPerDay;
                const overWrites = d.fsWrites > quotas.freeWritesPerDay;
                return (
                  <tr key={d.date} className="hover:bg-[#fdfbf7] transition">
                    <td className="py-2.5 px-4 font-bold text-[#1b2a4a] whitespace-nowrap">
                      {d.date}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        overReads ? 'text-rose-700' : 'text-[#1b2a4a]'
                      }`}
                    >
                      {d.fsReads.toLocaleString('el-GR')}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        overWrites ? 'text-rose-700' : 'text-[#1b2a4a]'
                      }`}
                    >
                      {d.fsWrites.toLocaleString('el-GR')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {d.fsDeletes.toLocaleString('el-GR')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#1b2a4a]">
                      {d.fnCalls.toLocaleString('el-GR')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {d.driveRefreshes + d.driveCacheHits > 0
                        ? `${d.driveRefreshes} αναν. / ${d.driveCacheHits} cache`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 whitespace-nowrap">
                      {formatCompactBytes(d.hostingBytes)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {d.geminiCalls.toLocaleString('el-GR')}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-extrabold ${
                          d.exactCostEur > 0
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {formatEur(d.exactCostEur)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(!usage || usage.daily.length === 0) && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-semibold">
                    {isLoading
                      ? 'Ανάκτηση επίσημων ημερήσιων μετρήσεων από το Google Cloud Monitoring...'
                      : 'Δεν βρέθηκαν ημερήσιες εγγραφές.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
