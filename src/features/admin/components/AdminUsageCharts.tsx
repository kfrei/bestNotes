import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  HardDrive,
  Link2,
  Save,
  Server,
  Sparkles,
  Zap,
} from 'lucide-react';
import type {
  AdminFirebaseUsageResponse,
  FirebaseDailyUsageRow,
} from '../../../firebase';
import { fetchAdminFirebaseUsageStats } from '../../../firebase';

export const DEFAULT_MONITORING_SERVICE_ACCOUNT =
  '867655609873-compute@developer.gserviceaccount.com';

export interface SevenDaySeriesPoint {
  date: string;
  label: string;
  value: number;
}

export interface SevenDayComparison {
  thisWeek: SevenDaySeriesPoint[];
  lastWeek: SevenDaySeriesPoint[];
  thisTotal: number;
  lastTotal: number;
  deltaPct: number | null; // null when lastTotal === 0 and thisTotal > 0 (new)
  isZeroBoth: boolean;
}

export interface GeminiChartDayPoint {
  date: string;
  label: string;
  totalRequests: number;
  okRequests: number;
  errors: number;
  successRate: number | null; // null when totalRequests === 0
}

function addUtcDays(isoDate: string, deltaDays: number): string {
  const base = /^\d{4}-\d{2}-\d{2}$/.test(isoDate)
    ? new Date(`${isoDate}T00:00:00Z`)
    : new Date();
  const d = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + deltaDays)
  );
  return d.toISOString().slice(0, 10);
}

function formatShortDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

export function formatCompactNumber(val: number): string {
  if (!Number.isFinite(val) || val <= 0) return '0';
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (val >= 10_000) return `${(val / 1_000).toFixed(1).replace('.', ',')}k`;
  return Math.round(val).toLocaleString('el-GR');
}

export function formatBytesShort(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
  if (bytes < 10 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 2 : 1).replace('.', ',')} MB`;
  return `${(mb / 1024).toFixed(2).replace('.', ',')} GB`;
}

export function buildSevenDayComparison(
  daily: FirebaseDailyUsageRow[],
  todayDate: string,
  selector: (row: FirebaseDailyUsageRow) => number
): SevenDayComparison {
  const byDate = new Map<string, FirebaseDailyUsageRow>();
  for (const row of daily) {
    byDate.set(row.date, row);
  }

  const thisWeek: SevenDaySeriesPoint[] = [];
  const lastWeek: SevenDaySeriesPoint[] = [];

  for (let offset = -6; offset <= 0; offset++) {
    const dt = addUtcDays(todayDate, offset);
    const row = byDate.get(dt);
    const raw = row ? selector(row) : 0;
    const val = Number.isFinite(raw) && raw > 0 ? raw : 0;
    thisWeek.push({ date: dt, label: formatShortDate(dt), value: val });
  }

  for (let offset = -13; offset <= -7; offset++) {
    const dt = addUtcDays(todayDate, offset);
    const row = byDate.get(dt);
    const raw = row ? selector(row) : 0;
    const val = Number.isFinite(raw) && raw > 0 ? raw : 0;
    lastWeek.push({ date: dt, label: formatShortDate(dt), value: val });
  }

  const thisTotal = thisWeek.reduce((s, p) => s + p.value, 0);
  const lastTotal = lastWeek.reduce((s, p) => s + p.value, 0);
  const isZeroBoth = thisTotal === 0 && lastTotal === 0;
  let deltaPct: number | null = 0;
  if (isZeroBoth) {
    deltaPct = 0;
  } else if (lastTotal === 0) {
    deltaPct = null;
  } else {
    deltaPct = ((thisTotal - lastTotal) / lastTotal) * 100;
  }

  return { thisWeek, lastWeek, thisTotal, lastTotal, deltaPct, isZeroBoth };
}

export function buildGeminiUsageSeries(
  daily: FirebaseDailyUsageRow[],
  todayDate: string,
  days: number,
  isCloudConnected: boolean
): GeminiChartDayPoint[] {
  const byDate = new Map<string, FirebaseDailyUsageRow>();
  for (const row of daily) {
    byDate.set(row.date, row);
  }

  const out: GeminiChartDayPoint[] = [];
  for (let offset = -(days - 1); offset <= 0; offset++) {
    const dt = addUtcDays(todayDate, offset);
    const row = byDate.get(dt);
    const cloudOk = Math.max(0, Number(row?.geminiApiCalls || 0));
    const cloudErr = Math.max(0, Number(row?.geminiApiErrors || 0));
    const appCalls = Math.max(0, Number(row?.geminiCalls || 0));

    const okRequests = isCloudConnected ? cloudOk : Math.max(cloudOk, appCalls);
    const errors = cloudErr;
    const totalRequests = okRequests + errors;
    const successRate = totalRequests > 0 ? (okRequests / totalRequests) * 100 : null;

    out.push({
      date: dt,
      label: formatShortDate(dt),
      totalRequests,
      okRequests,
      errors,
      successRate,
    });
  }
  return out;
}

interface ComparisonCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  gradientId: string;
  comparison: SevenDayComparison;
  formatValue: (v: number) => string;
}

const FirebaseComparisonChartCard: React.FC<ComparisonCardProps> = ({
  title,
  subtitle,
  icon,
  accentColor,
  gradientId,
  comparison,
  formatValue,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 300;
  const height = 96;
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 12;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxVal = Math.max(
    1,
    ...comparison.thisWeek.map((p) => p.value),
    ...comparison.lastWeek.map((p) => p.value)
  );

  const getX = (i: number) => padL + (i / 6) * plotW;
  const getY = (val: number) => padT + plotH - (val / maxVal) * plotH;

  const thisPoints = comparison.thisWeek.map((p, i) => ({
    x: getX(i),
    y: getY(p.value),
    ...p,
  }));
  const lastPoints = comparison.lastWeek.map((p, i) => ({
    x: getX(i),
    y: getY(p.value),
    ...p,
  }));

  const buildPath = (pts: Array<{ x: number; y: number }>) =>
    pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const thisPath = buildPath(thisPoints);
  const lastPath = buildPath(lastPoints);
  const areaPath =
    `${thisPath} L ${thisPoints[thisPoints.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} ` +
    `L ${thisPoints[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

  const isNearZeroDelta =
    comparison.isZeroBoth ||
    (comparison.deltaPct !== null && Math.abs(comparison.deltaPct) < 0.05);

  const deltaLabel = isNearZeroDelta
    ? '0%'
    : comparison.deltaPct === null
    ? 'Νέο'
    : `${comparison.deltaPct > 0 ? '+' : ''}${
        Math.abs(comparison.deltaPct) >= 100
          ? Math.round(comparison.deltaPct)
          : comparison.deltaPct.toFixed(1).replace('.', ',')
      }%`;

  const deltaTone = isNearZeroDelta
    ? 'bg-slate-100 text-slate-600'
    : comparison.deltaPct === null || comparison.deltaPct > 0
    ? 'bg-sky-50 text-sky-800 border border-sky-200/80'
    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';

  const activeThis = hoverIdx !== null ? comparison.thisWeek[hoverIdx] : null;
  const activeLast = hoverIdx !== null ? comparison.lastWeek[hoverIdx] : null;

  return (
    <div className="ipados-liquid-glass bg-[#fdfbf7]/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white border border-[#dfd8cb] flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-[#1b2a4a] truncate">{title}</h4>
            <p className="text-[10.5px] text-slate-500 font-medium truncate">{subtitle}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold shrink-0 ${deltaTone}`}>
          {!isNearZeroDelta && comparison.deltaPct !== null && comparison.deltaPct > 0 ? '↑ ' : ''}
          {!isNearZeroDelta && comparison.deltaPct !== null && comparison.deltaPct < 0 ? '↓ ' : ''}
          {deltaLabel}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-xl font-black text-[#1b2a4a]">
            {formatValue(comparison.thisTotal)}
          </div>
          <div className="text-[10.5px] text-slate-500 font-semibold">
            Προηγ. 7 ημ.: <span className="text-slate-700 font-bold">{formatValue(comparison.lastTotal)}</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-semibold">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: accentColor }} />
            Αυτή η εβδ.
          </span>
          <span className="inline-flex items-center gap-1 font-semibold">
            <span className="w-3 border-t-2 border-dashed border-slate-400 inline-block" />
            Προηγ. εβδ.
          </span>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-24 select-none"
          role="img"
          aria-label={`${title} σύγκριση 7 ημερών`}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal gridlines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = padT + ratio * plotH;
            return (
              <line
                key={ratio}
                x1={padL}
                y1={y}
                x2={width - padR}
                y2={y}
                stroke="#e7e1d6"
                strokeWidth="1"
              />
            );
          })}

          {/* Area under This Week */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Last Week dashed line */}
          <path
            d={lastPath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* This Week solid line */}
          <path
            d={thisPath}
            fill="none"
            stroke={accentColor}
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover vertical guide */}
          {hoverIdx !== null && (
            <line
              x1={thisPoints[hoverIdx].x}
              y1={padT}
              x2={thisPoints[hoverIdx].x}
              y2={padT + plotH}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {/* Points & exact non-overlapping invisible hit zones */}
          {thisPoints.map((pt, idx) => {
            const isHovered = hoverIdx === idx;
            const prevPt = lastPoints[idx];
            const hitLeft = idx === 0 ? 0 : (thisPoints[idx - 1].x + pt.x) / 2;
            const hitRight =
              idx === thisPoints.length - 1 ? width : (pt.x + thisPoints[idx + 1].x) / 2;
            return (
              <g key={pt.date}>
                <circle
                  cx={prevPt.x}
                  cy={prevPt.y}
                  r={isHovered ? 3.5 : 2}
                  fill="#ffffff"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4.2 : 2.5}
                  fill={isHovered ? accentColor : '#ffffff'}
                  stroke={accentColor}
                  strokeWidth="2"
                />
                <rect
                  x={hitLeft}
                  y={0}
                  width={Math.max(1, hitRight - hitLeft)}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIdx(idx)}
                  onClick={() => setHoverIdx((cur) => (cur === idx ? null : idx))}
                />
              </g>
            );
          })}
        </svg>

        {/* Bottom axis or live hover details */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-0.5 min-h-[18px]">
          {activeThis && activeLast ? (
            <div className="w-full flex items-center justify-between bg-[#f7f5f0] border border-[#dfd8cb] rounded-lg px-2 py-0.5 text-[10px] text-[#1b2a4a]">
              <span>
                <b style={{ color: accentColor }}>{activeThis.label}:</b> {formatValue(activeThis.value)}
              </span>
              <span className="text-slate-500">
                <b>{activeLast.label}:</b> {formatValue(activeLast.value)}
              </span>
            </div>
          ) : (
            <>
              <span>{comparison.thisWeek[0]?.label}</span>
              <span>{comparison.thisWeek[3]?.label}</span>
              <span>{comparison.thisWeek[6]?.label} (Σήμερα)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export interface FirebaseBuildComparisonSectionProps {
  usage: AdminFirebaseUsageResponse | null;
}

export const FirebaseBuildComparisonSection: React.FC<FirebaseBuildComparisonSectionProps> = ({
  usage,
}) => {
  const todayDate = usage?.todayDate || new Date().toISOString().slice(0, 10);
  const daily = usage?.daily || [];

  const hostingComp = useMemo(
    () => buildSevenDayComparison(daily, todayDate, (r) => r.hostingBytes),
    [daily, todayDate]
  );
  const fnComp = useMemo(
    () => buildSevenDayComparison(daily, todayDate, (r) => r.fnCalls),
    [daily, todayDate]
  );
  const readsComp = useMemo(
    () => buildSevenDayComparison(daily, todayDate, (r) => r.fsReads),
    [daily, todayDate]
  );
  const writesComp = useMemo(
    () => buildSevenDayComparison(daily, todayDate, (r) => r.fsWrites),
    [daily, todayDate]
  );

  const storageBytes = usage?.hostingStorage?.totalBytes || 0;
  const storageLimitBytes = usage?.hostingStorage?.freeLimitBytes || 10 * 1024 * 1024 * 1024;
  const storagePct = Math.min(100, (storageBytes / Math.max(1, storageLimitBytes)) * 100);
  const remainingBytes = Math.max(0, storageLimitBytes - storageBytes);
  const overStorageBytes = Math.max(0, storageBytes - storageLimitBytes);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold text-[#1b2a4a] uppercase tracking-wider">
            Firebase Build — Σύγκριση 7 Ημερών (Αυτή vs Προηγούμενη Εβδομάδα)
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Περάστε το ποντίκι πάνω από κάθε γράφημα για ακριβή σύγκριση ημέρα-με-ημέρα.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#dfd8cb] text-[10.5px] font-bold text-[#1b2a4a] self-start sm:self-auto">
          Project: {usage?.projectId || 'bestnotes-2026'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FirebaseComparisonChartCard
          title="Hosting Downloads (7 ημ.)"
          subtitle="Συνολική κίνηση CDN τελευταίων 7 ημερών"
          icon={<Server className="w-4 h-4 text-sky-700" />}
          accentColor="#0284c7"
          gradientId="fb-grad-hosting"
          comparison={hostingComp}
          formatValue={formatBytesShort}
        />
        <FirebaseComparisonChartCard
          title="Functions Invocations (7 ημ.)"
          subtitle="Κλήσεις Cloud Functions & Silent Drive Sync"
          icon={<Zap className="w-4 h-4 text-amber-600" />}
          accentColor="#d97706"
          gradientId="fb-grad-functions"
          comparison={fnComp}
          formatValue={formatCompactNumber}
        />
        <FirebaseComparisonChartCard
          title="Firestore Reads (7 ημ.)"
          subtitle="Αναγνώσεις εγγράφων Firestore"
          icon={<Database className="w-4 h-4 text-[#1b2a4a]" />}
          accentColor="#1b2a4a"
          gradientId="fb-grad-reads"
          comparison={readsComp}
          formatValue={formatCompactNumber}
        />
        <FirebaseComparisonChartCard
          title="Firestore Writes (7 ημ.)"
          subtitle="Εγγραφές & ενημερώσεις εγγράφων Firestore"
          icon={<Activity className="w-4 h-4 text-teal-700" />}
          accentColor="#0d9488"
          gradientId="fb-grad-writes"
          comparison={writesComp}
          formatValue={formatCompactNumber}
        />
      </div>

      {/* Hosting Storage Capacity Bar Card (Current GB vs 10 GB Free Tier) */}
      <div className="ipados-liquid-glass bg-[#fdfbf7]/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#dfd8cb] flex items-center justify-center shrink-0">
              <HardDrive
                className={`w-4 h-4 ${
                  overStorageBytes > 0
                    ? 'text-rose-600'
                    : storagePct >= 75
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#1b2a4a]">
                Hosting Storage (Τρέχων Χώρος vs 10 GB Δωρεάν Όριο)
              </h4>
              <p className="text-[10.5px] text-slate-500 font-medium">
                {overStorageBytes > 0
                  ? `⚠️ Υπέρβαση ${formatBytesShort(overStorageBytes)} — Διαγράψτε παλιά releases στο Firebase Console → Hosting`
                  : `Διαθέσιμος δωρεάν χώρος: ${formatBytesShort(remainingBytes)} από 10,00 GB`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-base font-black text-[#1b2a4a]">
              {formatBytesShort(storageBytes)}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 10 GB</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                overStorageBytes > 0
                  ? 'bg-rose-100 text-rose-800'
                  : storagePct >= 75
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {storagePct < 0.1 && storageBytes > 0
                ? '< 0,1%'
                : `${storagePct.toFixed(1).replace('.', ',')}%`}
            </span>
          </div>
        </div>

        <div className="relative w-full h-3.5 rounded-full bg-slate-200/80 overflow-hidden">
          <div
            style={{ width: `${Math.max(storageBytes > 0 ? 1.5 : 0, storagePct)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              overStorageBytes > 0
                ? 'bg-rose-600'
                : storagePct >= 75
                ? 'bg-amber-500'
                : 'bg-emerald-600'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
          <span>0 GB</span>
          <span>2,5 GB</span>
          <span>5 GB</span>
          <span>7,5 GB</span>
          <span>10 GB (Free Tier)</span>
        </div>
      </div>
    </div>
  );
};

export interface GoogleAiStudioUsageSectionProps {
  usage: AdminFirebaseUsageResponse | null;
  onRefresh: (force?: boolean) => void;
  onUsageUpdated?: (next: AdminFirebaseUsageResponse) => void;
}

export const GoogleAiStudioUsageSection: React.FC<GoogleAiStudioUsageSectionProps> = ({
  usage,
  onRefresh,
  onUsageUpdated,
}) => {
  const [rangeDays, setRangeDays] = useState<14 | 28>(28);
  const [reqHoverIdx, setReqHoverIdx] = useState<number | null>(null);
  const [errHoverIdx, setErrHoverIdx] = useState<number | null>(null);

  const [projectInput, setProjectInput] = useState<string>(usage?.geminiProjectId || '');
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectFeedback, setProjectFeedback] = useState<{
    type: 'success' | 'warn' | 'error';
    text: string;
  } | null>(null);
  const [copiedSa, setCopiedSa] = useState(false);

  useEffect(() => {
    setProjectInput(usage?.geminiProjectId || '');
  }, [usage?.geminiProjectId]);

  const serviceAccountEmail =
    usage?.monitoringServiceAccount || DEFAULT_MONITORING_SERVICE_ACCOUNT;
  const isCloudConnected = Boolean(usage?.geminiMonitoringConnected);
  const configuredProjectId = usage?.geminiProjectId || '';

  const todayDate = usage?.todayDate || new Date().toISOString().slice(0, 10);
  const series = useMemo(
    () => buildGeminiUsageSeries(usage?.daily || [], todayDate, rangeDays, isCloudConnected),
    [usage?.daily, todayDate, rangeDays, isCloudConnected]
  );

  const totalRequests = useMemo(
    () => series.reduce((s, d) => s + d.totalRequests, 0),
    [series]
  );
  const totalErrors = useMemo(() => series.reduce((s, d) => s + d.errors, 0), [series]);
  const overallSuccessRate =
    totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : null;

  const handleCopyServiceAccount = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(serviceAccountEmail);
      } else {
        const ta = document.createElement('textarea');
        ta.value = serviceAccountEmail;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedSa(true);
      window.setTimeout(() => setCopiedSa(false), 2200);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSaveGeminiProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = projectInput.trim().toLowerCase();
    if (cleaned && !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(cleaned)) {
      setProjectFeedback({
        type: 'error',
        text: 'Μη έγκυρο Google Cloud Project ID (6–30 πεζοί λατινικοί χαρακτήρες, αριθμοί ή παύλες χωρίς τελική παύλα, π.χ. gen-lang-client-0123456789).',
      });
      return;
    }

    setIsSavingProject(true);
    setProjectFeedback(null);
    try {
      const updated = await fetchAdminFirebaseUsageStats(true, {
        geminiProjectId: cleaned,
        saveGeminiProjectId: true,
      });
      if (onUsageUpdated) {
        onUsageUpdated(updated);
      } else {
        onRefresh(true);
      }

      if (!cleaned) {
        setProjectFeedback({
          type: 'success',
          text: 'Αφαιρέθηκε το cross-project monitoring. Εμφάνιση app telemetry (daily_traffic).',
        });
      } else if (updated.geminiMonitoringConnected) {
        setProjectFeedback({
          type: 'success',
          text: `Συνδέθηκε επιτυχώς με το Google Cloud Monitoring του ${cleaned}!`,
        });
      } else if (updated.geminiMonitoringStatusCode === 403) {
        setProjectFeedback({
          type: 'warn',
          text: `Αποθηκεύτηκε το ${cleaned}, αλλά το IAM επέστρεψε 403. Πρόσθεσε το service account παρακάτω με ρόλο Monitoring Viewer και πάτησε Ανανέωση.`,
        });
      } else if (updated.geminiMonitoringStatusCode === 404) {
        setProjectFeedback({
          type: 'error',
          text: `Το project "${cleaned}" δεν βρέθηκε (404). Έλεγξε το ακριβές Project ID στο Google Cloud Console.`,
        });
      } else {
        setProjectFeedback({
          type: 'warn',
          text: `Αποθηκεύτηκε το ${cleaned}. Μόλις δοθεί ο ρόλος Monitoring Viewer, πάτησε Ανανέωση για ζωντανές μετρήσεις.`,
        });
      }
    } catch (err: any) {
      setProjectFeedback({
        type: 'error',
        text: err?.message || 'Αποτυχία αποθήκευσης Project ID.',
      });
    } finally {
      setIsSavingProject(false);
    }
  };

  // Chart dimensions
  const svgW = 420;
  const svgH = 152;
  const padL = 38;
  const padR = 34;
  const padT = 14;
  const padB = 22;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxReq = Math.max(1, ...series.map((d) => d.totalRequests));
  const maxErr = Math.max(1, ...series.map((d) => d.errors));
  const slotW = plotW / Math.max(1, series.length);
  const barW = Math.max(4, Math.min(14, slotW * 0.62));
  const errPlotW = svgW - padL - 12;
  const errSlotW = errPlotW / Math.max(1, series.length);
  const errBarW = Math.max(4, Math.min(14, errSlotW * 0.62));

  // Success rate polyline segments (only for days with requests > 0 so 0-request days don't fake 0%)
  const successPoints = series
    .map((d, i) => {
      if (d.successRate === null) return null;
      const cx = padL + i * slotW + slotW / 2;
      const cy = padT + plotH - (d.successRate / 100) * plotH;
      return { cx, cy, rate: d.successRate, date: d.date, idx: i };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const successLinePath = successPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`)
    .join(' ');

  const hoveredReq = reqHoverIdx !== null ? series[reqHoverIdx] : null;
  const hoveredErr = errHoverIdx !== null ? series[errHoverIdx] : null;

  const iamUrl = configuredProjectId
    ? `https://console.cloud.google.com/iam-admin/iam?project=${encodeURIComponent(configuredProjectId)}`
    : 'https://console.cloud.google.com/iam-admin/iam';

  return (
    <div className="ipados-liquid-glass bg-[#fdfbf7]/90 backdrop-blur-2xl border border-white/85 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 border border-purple-200 text-purple-900 text-[11px] font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google AI Studio — Gemini API Usage</span>
            </span>
            {isCloudConnected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10.5px] font-extrabold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Live Cloud Monitoring ({configuredProjectId})</span>
              </span>
            ) : configuredProjectId ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-[10.5px] font-extrabold">
                <AlertTriangle className="w-3 h-3" />
                <span>Εκκρεμεί Monitoring Viewer ({configuredProjectId}) • Fallback: App Telemetry</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10.5px] font-bold">
                <span>App Telemetry (daily_traffic) • Προαιρετική σύνδεση FreiderikosK</span>
              </span>
            )}
          </div>
          <h3 className="text-sm font-extrabold text-[#1b2a4a] uppercase tracking-wider pt-0.5">
            Κλήσεις Gemini API, Ποσοστό Επιτυχίας & Σφάλματα (Τελευταίες {rangeDays} Ημέρες)
          </h3>
        </div>

        {/* 14d / 28d toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#efebe3] border border-[#dfd8cb] self-start lg:self-auto">
          {([14, 28] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => {
                setRangeDays(days);
                setReqHoverIdx(null);
                setErrHoverIdx(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                rangeDays === days
                  ? 'bg-[#1b2a4a] text-white shadow-2xs'
                  : 'text-[#1b2a4a] hover:bg-white/60'
              }`}
            >
              {days} ημέρες
            </button>
          ))}
        </div>
      </div>

      {/* Two Google AI Studio-style Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Total Requests (bars) + Success Rate % (green line) */}
        <div className="p-4 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-extrabold text-[#1b2a4a]">
                Total Gemini / AI API Requests & Success Rate
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-[#1b2a4a]">
                  {totalRequests.toLocaleString('el-GR')}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  κλήσεις ({rangeDays} ημ.)
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${
                overallSuccessRate === null
                  ? 'bg-slate-100 border border-slate-200 text-slate-600'
                  : overallSuccessRate >= 95
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-900'
              }`}
            >
              {overallSuccessRate === null
                ? 'Χωρίς κλήσεις'
                : `${overallSuccessRate.toFixed(1).replace('.', ',')}% επιτυχία`}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block" />
                Κλήσεις / ημέρα
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-0.5 rounded-full bg-emerald-500 inline-block" />
                Ποσοστό επιτυχίας (%)
              </span>
            </div>
            {hoveredReq && (
              <span className="text-[#1b2a4a] font-bold">
                {hoveredReq.label}: {hoveredReq.totalRequests.toLocaleString('el-GR')} κλ.
                {hoveredReq.successRate !== null
                  ? ` (${hoveredReq.successRate.toFixed(1).replace('.', ',')}%)`
                  : ''}
              </span>
            )}
          </div>

          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-40 select-none"
            role="img"
            aria-label="Συνολικές κλήσεις Gemini API και ποσοστό επιτυχίας"
            onMouseLeave={() => setReqHoverIdx(null)}
          >
            {/* Horizontal gridlines + Y labels */}
            {[0, 0.5, 1].map((ratio) => {
              const y = padT + ratio * plotH;
              const showReqTick =
                totalRequests === 0
                  ? ratio === 1
                  : ratio === 0 || ratio === 1 || maxReq >= 2;
              const reqTick =
                totalRequests === 0
                  ? '0'
                  : formatCompactNumber(Math.round(maxReq * (1 - ratio)));
              const pctTick = Math.round(100 * (1 - ratio));
              return (
                <g key={ratio}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={svgW - padR}
                    y2={y}
                    stroke="#eef2f7"
                    strokeWidth="1"
                  />
                  {showReqTick && (
                    <text
                      x={padL - 5}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      fontWeight="600"
                    >
                      {reqTick}
                    </text>
                  )}
                  <text
                    x={svgW - padR + 5}
                    y={y + 3}
                    textAnchor="start"
                    fontSize="9"
                    fill="#10b981"
                    fontWeight="700"
                  >
                    {pctTick}%
                  </text>
                </g>
              );
            })}

            {totalRequests === 0 && (
              <text
                x={(padL + svgW - padR) / 2}
                y={padT + plotH / 2}
                textAnchor="middle"
                fontSize="11"
                fill="#94a3b8"
                fontWeight="600"
              >
                Δεν καταγράφηκαν κλήσεις τις τελευταίες {rangeDays} ημέρες
              </text>
            )}

            {/* Vertical request bars */}
            {series.map((d, i) => {
              const cx = padL + i * slotW + slotW / 2;
              const rawH = totalRequests > 0 ? (d.totalRequests / maxReq) * plotH : 0;
              const barH = d.totalRequests > 0 ? Math.max(2, rawH) : 0;
              const y = padT + plotH - barH;
              const isHovered = reqHoverIdx === i;
              return (
                <g key={d.date}>
                  {barH > 0 && (
                    <rect
                      x={cx - barW / 2}
                      y={y}
                      width={barW}
                      height={barH}
                      rx="2"
                      fill={isHovered ? '#4338ca' : '#6366f1'}
                      opacity={isHovered ? 1 : 0.85}
                    />
                  )}
                  <rect
                    x={padL + i * slotW}
                    y={padT}
                    width={slotW}
                    height={plotH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setReqHoverIdx(i)}
                    onClick={() => setReqHoverIdx((cur) => (cur === i ? null : i))}
                  />
                </g>
              );
            })}

            {/* Green Success Rate line */}
            {successPoints.length > 1 && (
              <path
                d={successLinePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none"
              />
            )}
            {successPoints.map((p) => (
              <circle
                key={p.date}
                cx={p.cx}
                cy={p.cy}
                r={reqHoverIdx === p.idx ? 3.8 : 2.3}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="1.2"
                className="pointer-events-none"
              />
            ))}

            {/* X-axis labels */}
            {[0, Math.floor((series.length - 1) / 2), series.length - 1].map((idx) => {
              const d = series[idx];
              if (!d) return null;
              const x = padL + idx * slotW + slotW / 2;
              return (
                <text
                  key={idx}
                  x={x}
                  y={svgH - 4}
                  textAnchor={idx === 0 ? 'start' : idx === series.length - 1 ? 'end' : 'middle'}
                  fontSize="9"
                  fill="#94a3b8"
                  fontWeight="600"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Chart 2: Total API Errors (rose bars) */}
        <div className="p-4 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-extrabold text-[#1b2a4a]">
                Total API Errors (4xx / 5xx / Quota 429)
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-xl font-black ${
                    totalErrors > 0 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {totalErrors.toLocaleString('el-GR')}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  σφάλματα ({rangeDays} ημ.)
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${
                totalErrors > 0
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {totalErrors > 0
                ? `${((totalErrors / Math.max(1, totalRequests)) * 100)
                    .toFixed(1)
                    .replace('.', ',')}% error rate`
                : '0 σφάλματα'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
              Αποτυχημένες κλήσεις / ημέρα
            </span>
            {hoveredErr ? (
              <span className="text-rose-800 font-bold">
                {hoveredErr.label}: {hoveredErr.errors.toLocaleString('el-GR')} σφάλματα
              </span>
            ) : !isCloudConnected && totalErrors === 0 ? (
              <span className="text-slate-400">
                Σύνδεσε το FreiderikosK για ζωντανά 4xx/5xx σφάλματα
              </span>
            ) : null}
          </div>

          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-40 select-none"
            role="img"
            aria-label="Συνολικά σφάλματα Gemini API"
            onMouseLeave={() => setErrHoverIdx(null)}
          >
            {[0, 0.5, 1].map((ratio) => {
              const y = padT + ratio * plotH;
              const showErrTick =
                totalErrors === 0
                  ? ratio === 1
                  : ratio === 0 || ratio === 1 || maxErr >= 2;
              const errTick =
                totalErrors === 0
                  ? '0'
                  : formatCompactNumber(Math.round(maxErr * (1 - ratio)));
              return (
                <g key={ratio}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={svgW - 12}
                    y2={y}
                    stroke="#eef2f7"
                    strokeWidth="1"
                  />
                  {showErrTick && (
                    <text
                      x={padL - 5}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      fontWeight="600"
                    >
                      {errTick}
                    </text>
                  )}
                </g>
              );
            })}

            {totalErrors === 0 && (
              <text
                x={(padL + svgW - 12) / 2}
                y={padT + plotH / 2}
                textAnchor="middle"
                fontSize="11"
                fill="#94a3b8"
                fontWeight="600"
              >
                {isCloudConnected
                  ? 'Καθαρό ιστορικό — 0 σφάλματα API'
                  : '0 καταγεγραμμένα σφάλματα (App Telemetry fallback)'}
              </text>
            )}

            {series.map((d, i) => {
              const cx = padL + i * errSlotW + errSlotW / 2;
              const rawH = totalErrors > 0 ? (d.errors / maxErr) * plotH : 0;
              const barH = d.errors > 0 ? Math.max(2, rawH) : 0;
              const y = padT + plotH - barH;
              const isHovered = errHoverIdx === i;
              return (
                <g key={d.date}>
                  {barH > 0 && (
                    <rect
                      x={cx - errBarW / 2}
                      y={y}
                      width={errBarW}
                      height={barH}
                      rx="2"
                      fill={isHovered ? '#be123c' : '#f43f5e'}
                      opacity={isHovered ? 1 : 0.9}
                    />
                  )}
                  <rect
                    x={padL + i * errSlotW}
                    y={padT}
                    width={errSlotW}
                    height={plotH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setErrHoverIdx(i)}
                    onClick={() => setErrHoverIdx((cur) => (cur === i ? null : i))}
                  />
                </g>
              );
            })}

            {[0, Math.floor((series.length - 1) / 2), series.length - 1].map((idx) => {
              const d = series[idx];
              if (!d) return null;
              const x = padL + idx * errSlotW + errSlotW / 2;
              return (
                <text
                  key={idx}
                  x={x}
                  y={svgH - 4}
                  textAnchor={idx === 0 ? 'start' : idx === series.length - 1 ? 'end' : 'middle'}
                  fontSize="9"
                  fill="#94a3b8"
                  fontWeight="600"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Compact Inline Cross-Project FreiderikosK Monitoring Setup */}
      <div className="p-4 rounded-2xl bg-[#f7f5f0] border border-[#dfd8cb] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1b2a4a]">
              <Link2 className="w-3.5 h-3.5 text-purple-700" />
              <span>Cross-Project Gemini Monitoring (Project: FreiderikosK)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Κράτησε το Gemini API key στο δωρεάν project <strong>FreiderikosK</strong> και δώσε ρόλο{' '}
              <code className="px-1 py-0.5 rounded bg-white border border-[#dfd8cb] text-[10.5px] font-bold text-[#1b2a4a]">
                Monitoring Viewer
              </code>{' '}
              στο παρακάτω Service Account για ζωντανές μετρήσεις AI Studio εδώ.
            </p>
          </div>

          <a
            href={iamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#dfd8cb] text-[11px] font-extrabold text-[#1b2a4a] transition shrink-0 self-start lg:self-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Άνοιγμα Google Cloud IAM</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Service Account 1-click Copy Box */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-[#dfd8cb]">
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Service Account (Monitoring Viewer)
              </div>
              <div className="text-[11.5px] font-mono font-bold text-[#1b2a4a] truncate">
                {serviceAccountEmail}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyServiceAccount}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer shrink-0 ${
                copiedSa
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-[#eef3f8] hover:bg-[#dfe9f3] text-[#1b2a4a] border border-[#1b2a4a]/15'
              }`}
            >
              {copiedSa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSa ? 'Αντιγράφηκε' : 'Αντιγραφή'}</span>
            </button>
          </div>

          {/* Inline Project ID Save Form */}
          <form onSubmit={handleSaveGeminiProject} className="flex items-center gap-2">
            <input
              type="text"
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              placeholder="Project ID του FreiderikosK (π.χ. gen-lang-client-0123456789)"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white border border-[#dfd8cb] text-xs font-mono font-semibold text-[#1b2a4a] placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
            />
            <button
              type="submit"
              disabled={isSavingProject}
              className="px-3.5 py-2 rounded-xl bg-[#1b2a4a] hover:bg-[#152238] text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingProject ? 'Αποθήκευση...' : 'Αποθήκευση'}</span>
            </button>
          </form>
        </div>

        {projectFeedback && (
          <div
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              projectFeedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : projectFeedback.type === 'warn'
                ? 'bg-amber-50 border border-amber-200 text-amber-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            {projectFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{projectFeedback.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
