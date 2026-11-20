import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Calculator,
  FlaskConical,
  FileText,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  Clapperboard,
  ShieldCheck,
  Users,
  BarChart3,
  KeyRound,
  AlertOctagon,
  RefreshCw,
  Clock,
  Info,
} from 'lucide-react';
import {
  GEMINI_API1_OBSERVED_CAPACITY,
  type DailyTrafficStats,
  type GeminiApi1ProbeResult,
} from '../types';
import {
  computeOcrMetrics,
  exportOcrToCsv,
  getDayApiKeyBreakdown,
} from '../services/trafficService';
import {
  formatProbeCountdown,
  getGeminiKeyAvailability,
  isApi1ProbeDue,
  loadApi1ProbeResult,
  probeGeminiApi1Health,
} from '../services/geminiKeyHealthService';

export interface AdminOcrAnalyticsViewProps {
  traffic: DailyTrafficStats[];
  isLoading: boolean;
}

export const AdminOcrAnalyticsView: React.FC<AdminOcrAnalyticsViewProps> = ({
  traffic,
  isLoading,
}) => {
  const [searchDate, setSearchDate] = useState<string>('');
  const [chartMode, setChartMode] = useState<'apiKey' | 'type' | 'attribution'>('apiKey');
  const [probeResult, setProbeResult] = useState<GeminiApi1ProbeResult | null>(() =>
    loadApi1ProbeResult()
  );
  const [isProbingApi1, setIsProbingApi1] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const probeResultRef = useRef<GeminiApi1ProbeResult | null>(probeResult);
  probeResultRef.current = probeResult;
  const isMountedRef = useRef<boolean>(true);

  const keyAvailability = getGeminiKeyAvailability();

  const runApi1Probe = useCallback(async (force: boolean) => {
    setIsProbingApi1(true);
    try {
      const res = await probeGeminiApi1Health({ force });
      if (!isMountedRef.current) return;
      setProbeResult(res);
      setNowMs(Date.now());
    } finally {
      if (isMountedRef.current) {
        setIsProbingApi1(false);
      }
    }
  }, []);

  // Auto-run 6-hour API 1 health probe on mount if due, and re-check every 60s while panel stays open
  useEffect(() => {
    isMountedRef.current = true;
    const cached = loadApi1ProbeResult();
    if (cached) {
      setProbeResult(cached);
    }
    if (isApi1ProbeDue(cached)) {
      void runApi1Probe(false);
    }

    const intervalId = window.setInterval(() => {
      const currentNow = Date.now();
      setNowMs(currentNow);
      if (isApi1ProbeDue(probeResultRef.current, currentNow)) {
        void runApi1Probe(false);
      }
    }, 60_000);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [runApi1Probe]);

  const ocrMetrics = computeOcrMetrics(traffic);

  const filteredTraffic = traffic.filter((t) =>
    t.date.toLowerCase().includes(searchDate.toLowerCase())
  );

  // Maximum AI total across recent 14 days for proportional histogram height
  const recentDays = traffic.slice(0, 14).reverse();
  const maxOcrInChart = Math.max(
    1,
    ...recentDays.map((t) => t.ocrTotalCount || 0)
  );

  // Admin vs Others proportions today
  const adminTodayPct =
    ocrMetrics.todayTotal > 0
      ? Math.round((ocrMetrics.todayAdmin / ocrMetrics.todayTotal) * 100)
      : 0;
  const othersTodayPct =
    ocrMetrics.todayTotal > 0
      ? 100 - adminTodayPct
      : 0;

  // Derived API 1 live status
  const api1Recovered = probeResult?.status === 'ok';
  const api1RateLimited = probeResult?.status === 'rate_limited_429';
  const api1ProbeError = probeResult?.status === 'error';
  const api1DisplayTotal =
    ocrMetrics.allTimeApi1Total > 0
      ? ocrMetrics.allTimeApi1Total
      : GEMINI_API1_OBSERVED_CAPACITY;
  const api1ProbeTimeLabel = probeResult?.checkedAt
    ? new Date(probeResult.checkedAt).toLocaleString('el-GR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;
  const api1ProbeCodeLabel =
    probeResult && probeResult.httpCode > 0
      ? `HTTP ${probeResult.httpCode}`
      : 'Σφάλμα δικτύου';
  const api1NextCountdown = probeResult?.nextCheckAt
    ? formatProbeCountdown(probeResult.nextCheckAt, nowMs)
    : 'Εκκρεμεί τώρα';

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1b2a4a] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1b2a4a]" />
            <span>Ανάλυση AI & Κατάσταση Gemini API Keys</span>
          </h2>
          <p className="text-xs text-[#64748b]">
            Πραγματική καταμέτρηση OCR (Κείμενο, Μαθηματικά, Χημεία) & Ζωντανέματος ανά API Key, με αυτόματο έλεγχο ανά 6 ώρες για το API 1.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportOcrToCsv(traffic)}
          disabled={traffic.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1b2a4a] text-white hover:bg-[#152238] disabled:opacity-40 text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Εξαγωγή CSV AI Analytics</span>
        </button>
      </div>

      {/* 2. Gemini API Key 1 (Depleted / 6h Probe) vs API Key 2 (Active) Dual Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* API Key 1 Card (Old Project) */}
        <div
          className={`p-5 rounded-3xl ipados-liquid-glass backdrop-blur-2xl border shadow-sm space-y-4 ${
            api1Recovered
              ? 'bg-emerald-50/70 border-emerald-200'
              : api1RateLimited || api1ProbeError
              ? 'bg-amber-50/60 border-amber-200/90'
              : 'bg-[#fdfbf7]/85 border-rose-200/80'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-xs shrink-0 ${
                  api1Recovered
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : api1RateLimited || api1ProbeError
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-rose-100/90 border-rose-200 text-rose-700'
                }`}
              >
                {api1Recovered ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertOctagon className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1b2a4a]">
                    API Key 1 (Παλιό Project)
                  </h3>
                  {api1Recovered ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      ΕΝΕΡΓΟ / ΕΚΑΝΕ RESET (HTTP 200)
                    </span>
                  ) : api1RateLimited ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                      ΟΡΙΟ ΡΥΘΜΟΥ (HTTP 429)
                    </span>
                  ) : api1ProbeError ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                      ΣΦΑΛΜΑ ΕΛΕΓΧΟΥ ({api1ProbeCodeLabel})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                      ΕΞΑΝΤΛΗΜΕΝΟ / ΓΕΜΑΤΟ (HTTP 402)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#64748b] mt-0.5">
                  {api1Recovered
                    ? `Το API Key 1 απάντησε κανονικά (HTTP 200) — ιστορικό: ${api1DisplayTotal.toLocaleString()} αιτήματα`
                    : api1RateLimited
                    ? `Προσωρινό όριο ρυθμού/quota (HTTP 429) — ιστορικό: ${api1DisplayTotal.toLocaleString()} αιτήματα`
                    : `Εξαντλήθηκαν τα prepayment credits μετά από ~${api1DisplayTotal.toLocaleString()} καταγεγραμμένα αιτήματα`}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] font-semibold text-[#64748b]">Σύνολο API 1</div>
              <div className="text-xl font-black text-[#1b2a4a] tabular-nums">
                {ocrMetrics.allTimeApi1Total.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Fullness bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700">
                Κατάσταση Κλειδιού:{' '}
                <strong
                  className={
                    api1Recovered
                      ? 'text-emerald-700'
                      : api1RateLimited || api1ProbeError
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }
                >
                  {api1Recovered
                    ? 'Διαθέσιμο ξανά (HTTP 200)'
                    : api1RateLimited
                    ? 'Όριο ρυθμού / quota (HTTP 429)'
                    : api1ProbeError
                    ? `Αποτυχία ελέγχου (${api1ProbeCodeLabel}) — επανάληψη σύντομα`
                    : 'Γεμάτο — 100% εξαντλημένο (HTTP 402)'}
                </strong>
              </span>
              <span className="font-bold text-slate-500 tabular-nums">
                Σήμερα: {ocrMetrics.todayApi1}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden p-0.5 border border-black/5">
              <div
                style={{ width: '100%' }}
                className={`h-full rounded-full transition-all duration-700 ${
                  api1Recovered
                    ? 'bg-emerald-600'
                    : api1RateLimited || api1ProbeError
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </div>
          </div>

          {/* 6-Hour Automated Health Probe Strip */}
          <div className="p-3 rounded-2xl bg-white/80 border border-[#dfd8cb]/90 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1b2a4a]">
                <Clock className="w-3.5 h-3.5 text-[#1b2a4a]" />
                <span>Αυτόματος Έλεγχος API 1 ανά 6 ώρες</span>
              </div>

              <button
                type="button"
                onClick={() => void runApi1Probe(true)}
                disabled={isProbingApi1}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1b2a4a] text-white hover:bg-[#152238] disabled:opacity-50 text-[11px] font-semibold transition cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isProbingApi1 ? 'animate-spin' : ''}`} />
                <span>{isProbingApi1 ? 'Έλεγχος...' : 'Έλεγχος API 1 τώρα'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
              <div>
                Τελευταίος έλεγχος:{' '}
                <strong className="text-[#1b2a4a]">
                  {api1ProbeTimeLabel
                    ? `${api1ProbeTimeLabel} (${api1ProbeCodeLabel})`
                    : 'Σε εξέλιξη...'}
                </strong>
              </div>
              <div className="sm:text-right">
                Επόμενος (6ωρο):{' '}
                <strong className="text-[#1b2a4a]">{api1NextCountdown}</strong>
              </div>
            </div>

            {probeResult?.message && (
              <div className="text-[10px] font-mono text-slate-600 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/80 break-words">
                [{probeResult.model}] {probeResult.message}
              </div>
            )}

            <div className="flex items-start gap-1.5 text-[10.5px] text-slate-600 pt-0.5 leading-snug">
              <Info className="w-3.5 h-3.5 text-[#1b2a4a] shrink-0 mt-0.5" />
              <span>
                Το σφάλμα <strong>HTTP 402 (prepayment credits depleted)</strong> συνήθως{' '}
                <strong>δεν κάνει αυτόματο ημερήσιο/μηνιαίο reset</strong> εκτός αν προστεθούν credits. Ο 6ωρος έλεγχος επιβεβαιώνει αυτόματα αν η Google ανανεώσει ποτέ trial credits (HTTP 200).
              </span>
            </div>
          </div>
        </div>

        {/* API Key 2 Card (New Project — projects/949176547214) */}
        <div className="p-5 rounded-3xl ipados-liquid-glass bg-[#fdfbf7]/85 backdrop-blur-2xl border border-emerald-200/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-xs shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#1b2a4a]">
                      API Key 2 (Νέο Project)
                    </h3>
                    {keyAvailability.activeSlot === 'custom' ? (
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-300">
                        CUSTOM KEY OVERRIDE
                      </span>
                    ) : keyAvailability.hasApi2 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                        ΕΝΕΡΓΟ (ΚΥΡΙΟ)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                        ΜΗ ΔΙΑΜΟΡΦΩΜΕΝΟ
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    Project <code className="font-mono text-[#1b2a4a]">FreiderikosK</code> (<code className="font-mono text-[#1b2a4a]">949176547214</code>) • Free Tier (20 RPD/μοντέλο)
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] font-semibold text-[#64748b]">Χρήση API 2</div>
                <div className="text-xl font-black text-emerald-700 tabular-nums">
                  {ocrMetrics.allTimeApi2Total.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Realistic Capacity Reference Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Κλήσεις API 2:{' '}
                  <strong className="text-[#1b2a4a]">
                    {ocrMetrics.allTimeApi2Total.toLocaleString()}
                  </strong>{' '}
                  <span className="text-[11px] text-[#64748b]">
                    (Σήμερα: {ocrMetrics.todayApi2})
                  </span>
                </span>
                <span className="font-black text-xs text-emerald-700 tabular-nums">
                  ~{ocrMetrics.api2EstimatedUsedPercent}% της εκτίμησης
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden p-0.5 border border-black/5">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      ocrMetrics.allTimeApi2Total > 0
                        ? Math.max(3, ocrMetrics.api2EstimatedUsedPercent)
                        : 0
                    )}%`,
                  }}
                  className="h-full rounded-full transition-all duration-700 bg-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Official Google AI Studio Free Tier Limits Box */}
          <div className="p-3 rounded-2xl bg-white/80 border border-[#dfd8cb]/90 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-semibold text-[#64748b]">
                  Επίσημο Όριο Free Tier (AI Studio)
                </div>
                <div className="text-sm font-black text-[#1b2a4a] tabular-nums">
                  20 RPD / μοντέλο • 5 RPM
                </div>
                <div className="text-[10px] text-[#64748b]">
                  250K TPM • Reset κάθε μέρα 10:00 π.μ. (UTC-8)
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold text-[#64748b]">
                  Σήμερα (API 2) / Εκτίμηση
                </div>
                <div className="text-sm font-black text-emerald-700 tabular-nums">
                  {ocrMetrics.todayApi2} σήμερα • ~{ocrMetrics.api2EstimatedRemaining.toLocaleString()} σύνολο
                </div>
                <div className="text-[10px] text-[#64748b]">
                  Ενεργό slot:{' '}
                  <strong className="text-[#1b2a4a]">
                    {keyAvailability.activeSlot.toUpperCase()}
                  </strong>{' '}
                  • Αναφορά API 1: ~{ocrMetrics.api2EstimatedCapacityRef}
                </div>
              </div>
            </div>

            <div className="text-[10.5px] text-slate-600 leading-snug border-t border-[#efebe3] pt-2">
              Στο <strong>Free Tier</strong> κάθε Flash μοντέλο (<code>Gemini 3 Flash</code>, <code>Gemini 2.5/3.8 Flash</code>) έχει όριο <strong>20 αιτήματα/ημέρα (RPD)</strong> &amp; <strong>5/λεπτό (RPM)</strong> με ημερήσιο reset στις 10:00 π.μ. Ελλάδας. Με αυτόματο rotation στα 5 μοντέλα φτάνει ~40–100 OCR/ημέρα δωρεάν (ενώ σε Paid Tier 1 κοστίζει ~0,20 €/1.000 OCR).
            </div>
          </div>
        </div>
      </div>

      {/* 3. Comparative Breakdown: Admin (Εσύ) vs Υπόλοιποι Χρήστες & Guests */}
      <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-[#1b2a4a]/15 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dfd8cb]/60 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1b2a4a]" />
            <h3 className="text-xs font-bold text-[#1b2a4a]">
              Κατανομή Κατανάλωσης AI: Εσύ (Admin) vs Υπόλοιποι Χρήστες & Guests
            </h3>
          </div>
          <span className="text-[11px] text-[#64748b]">
            Σήμερα: {ocrMetrics.todayTotal} αιτήματα | Συνολικά: {ocrMetrics.allTimeOcrTotal}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Admin Card */}
          <div className="p-3.5 rounded-xl bg-[#eef3f8]/70 border border-[#1b2a4a]/25 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1b2a4a]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1b2a4a]" />
                <span>Εσύ (Admin - freiderikoskostas@gmail.com)</span>
              </div>
              <div className="text-[11px] text-[#64748b]">
                {ocrMetrics.todayAdmin} αιτήματα σήμερα ({adminTodayPct}% της σημερινής χρήσης)
              </div>
              <div className="text-[10px] text-[#64748b]">
                Σύνολο all-time: <strong className="text-[#1b2a4a]">{ocrMetrics.allTimeAdminTotal}</strong> αιτήματα
              </div>
            </div>
            <div className="text-2xl font-black text-[#1b2a4a] tabular-nums">
              {ocrMetrics.todayAdmin}
            </div>
          </div>

          {/* Others Card */}
          <div className="p-3.5 rounded-xl bg-white/80 border border-[#dfd8cb] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Users className="w-3.5 h-3.5 text-[#64748b]" />
                <span>Υπόλοιποι Χρήστες & Guests</span>
              </div>
              <div className="text-[11px] text-[#64748b]">
                {ocrMetrics.todayOthers} αιτήματα σήμερα ({othersTodayPct}% της σημερινής χρήσης)
              </div>
              <div className="text-[10px] text-[#64748b]">
                Σύνολο all-time: <strong className="text-slate-800">{ocrMetrics.allTimeOthersTotal}</strong> αιτήματα
              </div>
            </div>
            <div className="text-2xl font-black text-slate-700 tabular-nums">
              {ocrMetrics.todayOthers}
            </div>
          </div>
        </div>

        {/* Visual Split Bar */}
        {ocrMetrics.todayTotal > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#64748b]">
              <span>Admin: {adminTodayPct}%</span>
              <span>Υπόλοιποι: {othersTodayPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
              <div
                style={{ width: `${adminTodayPct}%` }}
                className="h-full bg-[#1b2a4a] transition-all"
                title={`Admin: ${adminTodayPct}%`}
              />
              <div
                style={{ width: `${othersTodayPct}%` }}
                className="h-full bg-[#7a8a9e] transition-all"
                title={`Υπόλοιποι: ${othersTodayPct}%`}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Breakdown by AI Feature (Grid of 5 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Κείμενο (Text OCR)</span>
            <FileText className="w-4 h-4 text-[#1b2a4a]" />
          </div>
          <div className="text-xl font-black text-[#1b2a4a]">
            {ocrMetrics.todayText.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#64748b] mt-0.5">Ελληνικό χειρόγραφο & tags</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Μαθηματικά (Math)</span>
            <Calculator className="w-4 h-4 text-[#1b2a4a]" />
          </div>
          <div className="text-xl font-black text-[#1b2a4a]">
            {ocrMetrics.todayMath.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#64748b] mt-0.5">Εξισώσεις & f(x) διαγράμματα</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Χημεία (Chem)</span>
            <FlaskConical className="w-4 h-4 text-[#1b2a4a]" />
          </div>
          <div className="text-xl font-black text-[#1b2a4a]">
            {ocrMetrics.todayChem.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#64748b] mt-0.5">Αντιδράσεις & 3D Μόρια</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Ζωντάνεμα (Animation)</span>
            <Clapperboard className="w-4 h-4 text-[#1b2a4a]" />
          </div>
          <div className="text-xl font-black text-[#1b2a4a]">
            {ocrMetrics.todayAnim.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#64748b] mt-0.5">Smart Sketch & Physics ήχοι</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Σύνολο AI (All-Time)</span>
            <Sparkles className="w-4 h-4 text-[#1b2a4a]" />
          </div>
          <div className="text-xl font-black text-[#1b2a4a]">
            {ocrMetrics.allTimeOcrTotal.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#64748b] mt-0.5">
            API 1: {ocrMetrics.allTimeApi1Total} • API 2: {ocrMetrics.allTimeApi2Total}
          </div>
        </div>
      </div>

      {/* 5. Daily Histograms (Last 14 days) */}
      <div className="p-5 rounded-3xl bg-white/75 backdrop-blur-md border border-white/85 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dfd8cb]/60 pb-3">
          <div>
            <h3 className="text-xs font-bold text-[#1b2a4a] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1b2a4a]" />
              <span>
                {chartMode === 'apiKey'
                  ? 'Ημερήσια Χρήση AI ανά Gemini API Key (API 1 vs API 2)'
                  : chartMode === 'type'
                  ? 'Ημερήσιο Ιστόγραμμα AI ανά Τύπο (Κείμενο, Math, Χημεία, Ζωντάνεμα)'
                  : 'Ημερήσια Κατανομή AI: Admin vs Υπόλοιποι Χρήστες'}
              </span>
            </h3>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              {chartMode === 'apiKey'
                ? `Σύνολο API 1: ${ocrMetrics.allTimeApi1Total} | Σύνολο API 2: ${ocrMetrics.allTimeApi2Total} | Τελευταίες ${recentDays.length} ημέρες`
                : `Τελευταίες ${recentDays.length} καταγεγραμμένες ημέρες`}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#efebe3]/80 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMode('apiKey')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                chartMode === 'apiKey'
                  ? 'bg-[#1b2a4a] text-white shadow-2xs'
                  : 'text-[#1b2a4a] hover:bg-white/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>API 1 vs API 2</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('type')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                chartMode === 'type'
                  ? 'bg-[#1b2a4a] text-white shadow-2xs'
                  : 'text-[#1b2a4a] hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Ανά Τύπο</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('attribution')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                chartMode === 'attribution'
                  ? 'bg-[#1b2a4a] text-white shadow-2xs'
                  : 'text-[#1b2a4a] hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin vs Άλλοι</span>
            </button>
          </div>
        </div>

        {/* Legend strip according to chart mode */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-[#64748b] gap-2 pt-1">
          {chartMode === 'apiKey' && (
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> API 1 (Παλιό — εξαντλημένο 402)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> API 2 (Νέο — ενεργό)
              </span>
            </div>
          )}

          {chartMode === 'type' && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1b2a4a]" /> Κείμενο
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2b4a7a]" /> Μαθηματικά
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#4b6a9a]" /> Χημεία
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#5c4a72]" /> Ζωντάνεμα
              </span>
            </div>
          )}

          {chartMode === 'attribution' && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1b2a4a]" /> Admin (Εσύ)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#7a8a9e]" /> Υπόλοιποι Χρήστες & Guests
              </span>
            </div>
          )}

          <span className="text-[10px] text-[#64748b]">
            Πέρασμα ποντικιού πάνω από κάθε στήλη για αναλυτικά στοιχεία
          </span>
        </div>

        {/* The Bars Render Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-4 items-end h-44 border-b border-[#dfd8cb]/40 pb-2">
          {recentDays.map((t) => {
            const total = t.ocrTotalCount || 0;
            const textC = t.ocrTextCount || 0;
            const mathC = t.ocrMathCount || 0;
            const chemC = t.ocrChemCount || 0;
            const animC = t.ocrAnimCount || 0;
            const adminC = t.ocrAdminCount || 0;
            const othersC = Math.max(0, total - adminC);
            const { api1Count, api2Count, customCount } = getDayApiKeyBreakdown(t);

            const totalHeight =
              total > 0 ? Math.max(10, Math.round((total / maxOcrInChart) * 100)) : 4;

            const keyDenominator = Math.max(total, api1Count + api2Count + customCount);
            const api1Pct = keyDenominator > 0 ? (api1Count / keyDenominator) * 100 : 0;
            const api2Pct = keyDenominator > 0 ? (api2Count / keyDenominator) * 100 : 0;
            const customPct = keyDenominator > 0 ? (customCount / keyDenominator) * 100 : 0;

            const textPct = total > 0 ? (textC / total) * 100 : 0;
            const mathPct = total > 0 ? (mathC / total) * 100 : 0;
            const chemPct = total > 0 ? (chemC / total) * 100 : 0;
            const animPct = total > 0 ? (animC / total) * 100 : 0;

            const adminPct = total > 0 ? (adminC / total) * 100 : 0;
            const othersPct = total > 0 ? (othersC / total) * 100 : 0;

            return (
              <div key={t.date} className="flex flex-col items-center gap-1 h-full justify-end group">
                {total > 0 && (
                  <span className="text-[10px] font-extrabold text-[#1b2a4a] tabular-nums">
                    {total}
                  </span>
                )}

                {/* Vertical Bar */}
                <div
                  style={{ height: `${totalHeight}%` }}
                  className="w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col justify-end bg-slate-200 transition-all shadow-2xs group-hover:opacity-90"
                  title={`${t.date}: ${total} AI requests (API 1: ${api1Count}, API 2: ${api2Count}${customCount > 0 ? `, Custom: ${customCount}` : ''} | ${textC} κείμενο, ${mathC} μαθηματικά, ${chemC} χημεία, ${animC} ζωντάνεμα | Admin: ${adminC}, Άλλοι: ${othersC})`}
                >
                  {chartMode === 'apiKey' && (
                    <>
                      {customPct > 0 && (
                        <div style={{ height: `${customPct}%` }} className="w-full bg-sky-500" />
                      )}
                      {api2Pct > 0 && (
                        <div style={{ height: `${api2Pct}%` }} className="w-full bg-emerald-600" />
                      )}
                      {api1Pct > 0 && (
                        <div style={{ height: `${api1Pct}%` }} className="w-full bg-rose-500" />
                      )}
                    </>
                  )}

                  {chartMode === 'type' && (
                    <>
                      {animPct > 0 && (
                        <div style={{ height: `${animPct}%` }} className="w-full bg-[#5c4a72]" />
                      )}
                      {chemPct > 0 && (
                        <div style={{ height: `${chemPct}%` }} className="w-full bg-[#4b6a9a]" />
                      )}
                      {mathPct > 0 && (
                        <div style={{ height: `${mathPct}%` }} className="w-full bg-[#2b4a7a]" />
                      )}
                      {textPct > 0 && (
                        <div style={{ height: `${textPct}%` }} className="w-full bg-[#1b2a4a]" />
                      )}
                    </>
                  )}

                  {chartMode === 'attribution' && (
                    <>
                      {othersPct > 0 && (
                        <div style={{ height: `${othersPct}%` }} className="w-full bg-[#7a8a9e]" />
                      )}
                      {adminPct > 0 && (
                        <div style={{ height: `${adminPct}%` }} className="w-full bg-[#1b2a4a]" />
                      )}
                    </>
                  )}
                </div>

                {/* Subtext beneath bar: date */}
                <span className="text-[10px] text-[#64748b] group-hover:text-[#1b2a4a] group-hover:font-bold transition truncate max-w-full">
                  {t.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Detailed Daily AI & OCR Table */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[#efebe3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs font-bold text-[#1b2a4a] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1b2a4a]" />
            <span>Ημερήσιο Μητρώο AI Requests ({filteredTraffic.length} ημέρες)</span>
          </div>

          <div className="w-full sm:w-56">
            <input
              type="text"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              placeholder="Αναζήτηση ημερομηνίας..."
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/90 border border-[#dfd8cb] focus:outline-none focus:ring-2 focus:ring-[#1b2a4a]/20 focus:border-[#1b2a4a] transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#efebe3]/60 text-[#1b2a4a] font-bold border-b border-[#dfd8cb]">
                <th className="py-2.5 px-3.5">Ημερομηνία</th>
                <th className="py-2.5 px-3">Σύνολο AI</th>
                <th className="py-2.5 px-3">API 1 (Παλιό)</th>
                <th className="py-2.5 px-3">API 2 (Νέο)</th>
                <th className="py-2.5 px-3">Admin (Εσύ)</th>
                <th className="py-2.5 px-3">Άλλοι / Guests</th>
                <th className="py-2.5 px-3">Κείμενο</th>
                <th className="py-2.5 px-3">Μαθηματικά</th>
                <th className="py-2.5 px-3">Χημεία</th>
                <th className="py-2.5 px-3">Ζωντάνεμα</th>
                <th className="py-2.5 px-3 text-right">Τελευταίο Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efebe3]">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-[#64748b]">
                    Φόρτωση δεδομένων AI από το Firebase...
                  </td>
                </tr>
              ) : filteredTraffic.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-[#64748b]">
                    Δεν βρέθηκαν καταγεγραμμένες εγγραφές AI.
                  </td>
                </tr>
              ) : (
                filteredTraffic.map((t) => {
                  const total = t.ocrTotalCount || 0;
                  const adminCount = t.ocrAdminCount || 0;
                  const othersCount = Math.max(0, total - adminCount);
                  const { api1Count, api2Count } = getDayApiKeyBreakdown(t);

                  return (
                    <tr key={t.date} className="hover:bg-white/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-bold text-[#1b2a4a]">{t.date}</td>
                      <td className="py-2.5 px-3 font-extrabold text-[#1b2a4a] tabular-nums">
                        {total}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[11px] border tabular-nums ${
                            api1Count > 0
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          {api1Count}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[11px] border tabular-nums ${
                            api2Count > 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          {api2Count}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#eef3f8] text-[#1b2a4a] font-bold text-[11px] border border-[#1b2a4a]/25">
                          {adminCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                          {othersCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#1b2a4a]/8 text-[#1b2a4a] font-semibold text-[11px]">
                          {t.ocrTextCount || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#1b2a4a]/8 text-[#1b2a4a] font-semibold text-[11px]">
                          {t.ocrMathCount || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#1b2a4a]/8 text-[#1b2a4a] font-semibold text-[11px]">
                          {t.ocrChemCount || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#5c4a72]/10 text-[#5c4a72] font-semibold text-[11px]">
                          {t.ocrAnimCount || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[11px] text-[#64748b]">
                        {t.updatedAt
                          ? new Date(t.updatedAt).toLocaleTimeString('el-GR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
