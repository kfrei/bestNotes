import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  FlaskConical,
  FileText,
  Download,
  Calendar,
  Layers,
  Clapperboard,
  ShieldCheck,
  Users,
  BarChart3,
  KeyRound,
  Gauge,
} from 'lucide-react';
import {
  GEMINI_FREE_TIER_DAILY_CAPACITY,
  GEMINI_FREE_TIER_MODEL_BUCKETS,
  GEMINI_FREE_TIER_ROTATION_MODELS,
  GEMINI_FREE_TIER_RPD_PER_MODEL,
  GEMINI_FREE_TIER_RPM,
  GEMINI_FREE_TIER_TPM,
  type DailyTrafficStats,
} from '../types';
import { computeOcrMetrics, exportOcrToCsv } from '../services/trafficService';
import { getActiveGeminiApiKeySlot } from '../../../utils/geometryAndAlgorithms';

export interface AdminOcrAnalyticsViewProps {
  traffic: DailyTrafficStats[];
  isLoading: boolean;
}

export const AdminOcrAnalyticsView: React.FC<AdminOcrAnalyticsViewProps> = ({
  traffic,
  isLoading,
}) => {
  const [searchDate, setSearchDate] = useState<string>('');
  const [chartMode, setChartMode] = useState<'quota' | 'type' | 'attribution'>('quota');

  const activeSlot = getActiveGeminiApiKeySlot();
  const hasActiveKey = activeSlot !== 'none';
  const freeTierTpmLabel = `${Math.round(GEMINI_FREE_TIER_TPM / 1000)}K TPM`;
  const ocrMetrics = computeOcrMetrics(traffic);

  const filteredTraffic = traffic.filter((t) =>
    t.date.toLowerCase().includes(searchDate.toLowerCase())
  );

  // Maximum AI total across recent 14 days for proportional histogram height in type/attribution modes
  const recentDays = traffic.slice(0, 14).reverse();
  const maxOcrInChart = Math.max(
    1,
    ...recentDays.map((t) => t.ocrTotalCount || 0)
  );

  // Admin vs Others proportions today
  const adminTodayPct =
    ocrMetrics.todayTotal > 0
      ? Math.min(100, Math.max(0, Math.round((ocrMetrics.todayAdmin / ocrMetrics.todayTotal) * 100)))
      : 0;
  const othersTodayPct =
    ocrMetrics.todayTotal > 0 ? Math.max(0, 100 - adminTodayPct) : 0;

  // Daily quota status colors
  const isOverDailyLimit = ocrMetrics.todayTotal >= ocrMetrics.todayDailyLimit;
  const isWarnDailyLimit = !isOverDailyLimit && ocrMetrics.todayUsedPercent >= 75;

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1b2a4a] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1b2a4a]" />
            <span>Ανάλυση AI & Όρια Gemini API Key</span>
          </h2>
          <p className="text-xs text-[#64748b]">
            Πραγματική καταμέτρηση OCR (Κείμενο, Μαθηματικά, Χημεία) & Ζωντανέματος στο ενεργό Free Tier κλειδί.
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

      {/* 2. Single Active Gemini API Key Hero Card (FreiderikosK — Free Tier) */}
      <div className="p-5 rounded-3xl ipados-liquid-glass bg-[#fdfbf7]/85 backdrop-blur-2xl border border-emerald-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-xs shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#1b2a4a]">
                  Ενεργό Gemini API Key — FreiderikosK
                </h3>
                {activeSlot === 'custom' ? (
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-300">
                    CUSTOM KEY OVERRIDE
                  </span>
                ) : hasActiveKey ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    ΕΝΕΡΓΟ • FREE TIER
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                    ΜΗ ΔΙΑΜΟΡΦΩΜΕΝΟ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#64748b] mt-0.5">
                Google AI Studio Free Tier •{' '}
                <strong className="text-[#1b2a4a]">
                  {GEMINI_FREE_TIER_RPD_PER_MODEL} RPD / Flash μοντέλο • {GEMINI_FREE_TIER_RPM} RPM • {freeTierTpmLabel}
                </strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-[10px] font-semibold text-[#64748b]">Σημερινή Χρήση</div>
            <div
              className={`text-xl font-black tabular-nums ${
                isOverDailyLimit
                  ? 'text-rose-700'
                  : isWarnDailyLimit
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              }`}
            >
              {ocrMetrics.todayTotal.toLocaleString()} / {ocrMetrics.todayDailyLimit}
            </div>
          </div>
        </div>

        {/* Daily Rotation Capacity Progress Bar (100 req/day across 5 Flash/Lite models) */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700">
              Ημερήσια χωρητικότητα rotation ({GEMINI_FREE_TIER_ROTATION_MODELS} Flash/Lite μοντέλα):{' '}
              <strong className="text-[#1b2a4a]">
                {ocrMetrics.todayTotal.toLocaleString()} / {ocrMetrics.todayDailyLimit} αιτήματα
              </strong>
            </span>
            <span
              className={`font-black text-xs tabular-nums ${
                isOverDailyLimit
                  ? 'text-rose-700'
                  : isWarnDailyLimit
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              }`}
            >
              {ocrMetrics.todayUsedPercent}% • Υπόλοιπο σήμερα: {ocrMetrics.todayRemaining}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden p-0.5 border border-black/5">
            <div
              style={{
                width: `${Math.min(
                  100,
                  ocrMetrics.todayTotal > 0 ? Math.max(2, ocrMetrics.todayUsedPercent) : 0
                )}%`,
              }}
              className={`h-full rounded-full transition-all duration-700 ${
                isOverDailyLimit
                  ? 'bg-rose-600'
                  : isWarnDailyLimit
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
            />
          </div>
        </div>

        {/* Official Google AI Studio Free Tier Limits Box */}
        <div className="p-3.5 rounded-2xl bg-white/80 border border-[#dfd8cb]/90 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] font-semibold text-[#64748b]">
                Επίσημα Όρια Free Tier (AI Studio)
              </div>
              <div className="text-xs font-black text-[#1b2a4a] tabular-nums mt-0.5">
                {GEMINI_FREE_TIER_RPD_PER_MODEL} RPD / Flash μοντέλο • {GEMINI_FREE_TIER_RPM} RPM • {freeTierTpmLabel}
              </div>
              <div className="text-[10px] text-[#64748b]">
                Όριο ανά Flash/Lite μοντέλο στο Free Tier
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-[#64748b]">
                Αυτόματο Rotation &amp; Reset
              </div>
              <div className="text-xs font-black text-emerald-700 tabular-nums mt-0.5">
                {ocrMetrics.todayDailyLimit} αιτήματα/ημέρα ({GEMINI_FREE_TIER_ROTATION_MODELS} Flash/Lite μοντέλα)
              </div>
              <div className="text-[10px] text-[#64748b]">
                Ημερήσιο reset: 10:00 π.μ. ώρα Ελλάδας (00:00 UTC-8)
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-[10px] font-semibold text-[#64748b]">
                Σύνολο All-Time • Κόστος
              </div>
              <div className="text-xs font-black text-[#1b2a4a] tabular-nums mt-0.5">
                {ocrMetrics.allTimeOcrTotal.toLocaleString()} αιτήματα • 0,00 €
              </div>
              <div className="text-[10px] text-[#64748b]">
                Paid Tier 1 αν χρειαστεί: ~0,20 €/1.000 OCR
              </div>
            </div>
          </div>

          <div className="text-[10.5px] text-slate-600 leading-snug border-t border-[#efebe3] pt-2">
            Με αυτόματο rotation σε <strong>{GEMINI_FREE_TIER_ROTATION_MODELS} Flash/Lite μοντέλα</strong> ({GEMINI_FREE_TIER_RPD_PER_MODEL} RPD το καθένα, {GEMINI_FREE_TIER_RPM} RPM, {freeTierTpmLabel}), η δωρεάν ημερήσια χωρητικότητα φτάνει τα <strong>{ocrMetrics.todayDailyLimit} αιτήματα/ημέρα</strong> με αυτόματο reset στις <strong>10:00 π.μ. ώρα Ελλάδας (00:00 UTC-8)</strong>. Αν χρειαστεί ποτέ μεγαλύτερος όγκος, το Paid Tier 1 κοστίζει μόλις ~0,20 €/1.000 OCR.
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
            Admin: {ocrMetrics.allTimeAdminTotal} • Άλλοι: {ocrMetrics.allTimeOthersTotal}
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
                {chartMode === 'quota'
                  ? `Ημερήσια Χρήση AI (Βασικό Όριο 80 Flash + 1.020 Lite)`
                  : chartMode === 'type'
                  ? 'Ημερήσιο Ιστόγραμμα AI ανά Τύπο (Κείμενο, Math, Χημεία, Ζωντάνεμα)'
                  : 'Ημερήσια Κατανομή AI: Admin vs Υπόλοιποι Χρήστες'}
              </span>
            </h3>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              {chartMode === 'quota'
                ? `Σήμερα: ${ocrMetrics.todayTotal}/80 Flash (${Math.min(100, Math.round((ocrMetrics.todayTotal / 80) * 100))}%) • Σύνολο δωρεάν: ${GEMINI_FREE_TIER_DAILY_CAPACITY}/ημ. | Τελευταίες ${recentDays.length} ημέρες`
                : `Τελευταίες ${recentDays.length} καταγεγραμμένες ημέρες`}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#efebe3]/80 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMode('quota')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                chartMode === 'quota'
                  ? 'bg-[#1b2a4a] text-white shadow-2xs'
                  : 'text-[#1b2a4a] hover:bg-white/60'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>% Ορίου (80 + 1.020)</span>
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
          {chartMode === 'quota' && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {GEMINI_FREE_TIER_MODEL_BUCKETS.map((m) => (
                <span key={m.id} className="flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  <span>
                    {m.shortLabel} ({m.rpd})
                  </span>
                </span>
              ))}
            </div>
          )}

          {chartMode === 'type' && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Κείμενο
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Μαθηματικά
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Χημεία
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" /> Ζωντάνεμα
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

            const dailyRemaining = Math.max(0, GEMINI_FREE_TIER_DAILY_CAPACITY - total);

            // Split into Primary Flash Tier (80: 4 Hydrogen, 3.8, 3.6, 3 Flash) + Dynamic Lite Overflow Bar (1,020: 3.5 Lite, 3.1 Lite, 2.5 Flash)
            const PRIMARY_FLASH_LIMIT = 80;
            const OVERFLOW_LITE_LIMIT = GEMINI_FREE_TIER_DAILY_CAPACITY - PRIMARY_FLASH_LIMIT; // 1020
            const primaryUsed = Math.min(total, PRIMARY_FLASH_LIMIT);
            const overflowUsed = Math.max(0, total - PRIMARY_FLASH_LIMIT);
            const primaryPct = Math.round((primaryUsed / PRIMARY_FLASH_LIMIT) * 100);
            const overflowPct = Number(((overflowUsed / OVERFLOW_LITE_LIMIT) * 100).toFixed(1));

            const buildBucketSegments = (
              count: number,
              buckets: readonly typeof GEMINI_FREE_TIER_MODEL_BUCKETS[number][]
            ) => {
              let rem = count;
              const segs: Array<{
                id: string;
                shortLabel: string;
                used: number;
                rpd: number;
                color: string;
                pctOfBar: number;
              }> = [];
              for (const b of buckets) {
                if (rem <= 0) break;
                const used = Math.min(rem, b.rpd);
                rem -= used;
                segs.push({
                  id: b.id,
                  shortLabel: b.shortLabel,
                  used,
                  rpd: b.rpd,
                  color: b.color,
                  pctOfBar: count > 0 ? (used / count) * 100 : 0,
                });
              }
              return segs;
            };

            // Apply the new 7-model Gemini cascade breakdown ONLY from 2026-11-24 onwards;
            // earlier historical days ran under the legacy rotation and render as a clean neutral bar.
            const isNewCascadeDay = t.date >= '2026-11-24';
            const primarySegments = isNewCascadeDay
              ? buildBucketSegments(primaryUsed, GEMINI_FREE_TIER_MODEL_BUCKETS.slice(0, 4))
              : [];
            const overflowSegments = isNewCascadeDay
              ? buildBucketSegments(overflowUsed, GEMINI_FREE_TIER_MODEL_BUCKETS.slice(4))
              : [];
            const allSegments = [...primarySegments, ...overflowSegments];
            const modelBreakdownLabel = !isNewCascadeDay
              ? 'Παλαιό σχήμα (πριν 24/11)'
              : allSegments.length > 0
              ? allSegments.map((s) => `${s.shortLabel}: ${s.used}/${s.rpd}`).join(', ')
              : 'Καμία κλήση';

            // Legacy dates (< 2026-11-24) used the old 100-req/day quota and green/amber/red thresholds
            const LEGACY_LIMIT = 100;
            const legacyPct = Math.round((total / LEGACY_LIMIT) * 100);
            const legacyBarColor =
              total >= LEGACY_LIMIT
                ? 'bg-rose-600'
                : legacyPct >= 75
                ? 'bg-amber-500'
                : 'bg-emerald-600';

            const barHeight =
              chartMode === 'quota'
                ? !isNewCascadeDay
                  ? total > 0
                    ? Math.min(100, Math.max(8, legacyPct))
                    : 4
                  : primaryUsed > 0
                  ? Math.min(100, Math.max(10, primaryPct))
                  : 4
                : total > 0
                ? Math.max(10, Math.round((total / maxOcrInChart) * 100))
                : 4;

            const overflowBarHeight =
              isNewCascadeDay && overflowUsed > 0
                ? Math.min(100, Math.max(12, Math.round((overflowUsed / OVERFLOW_LITE_LIMIT) * 100)))
                : 0;

            const textPct = total > 0 ? (textC / total) * 100 : 0;
            const mathPct = total > 0 ? (mathC / total) * 100 : 0;
            const chemPct = total > 0 ? (chemC / total) * 100 : 0;
            const animPct = total > 0 ? (animC / total) * 100 : 0;

            const adminPct = total > 0 ? Math.min(100, (adminC / total) * 100) : 0;
            const othersPct = total > 0 ? Math.max(0, 100 - adminPct) : 0;

            const quotaTooltipSummary = !isNewCascadeDay
              ? `${total}/${LEGACY_LIMIT} (${legacyPct}% παλαιού ορίου 100)`
              : `${total}/${GEMINI_FREE_TIER_DAILY_CAPACITY} (Κύρια Flash: ${primaryUsed}/80 = ${primaryPct}%${
                  overflowUsed > 0
                    ? ` • Απόθεμα Lite: +${overflowUsed}/${OVERFLOW_LITE_LIMIT} (${overflowPct}%)`
                    : ''
                }, υπόλοιπο: ${dailyRemaining})`;

            return (
              <div key={t.date} className="flex flex-col items-center gap-1 h-full justify-end group">
                {total > 0 && (
                  <span className="text-[10px] font-extrabold text-[#1b2a4a] tabular-nums whitespace-nowrap">
                    {chartMode === 'quota'
                      ? !isNewCascadeDay
                        ? `${legacyPct}%`
                        : overflowUsed > 0
                        ? `100% +${overflowUsed}`
                        : `${primaryPct}%`
                      : total}
                  </span>
                )}

                {/* Vertical Bar(s) — Legacy 100-limit bar (< 24/11) OR Primary 80-limit Flash + dynamic 1,020 Lite bar (>= 24/11) */}
                <div
                  style={{ height: `${barHeight}%` }}
                  className="w-full flex items-end justify-center gap-0.5"
                  title={`${t.date}: ${quotaTooltipSummary} | Μοντέλα: ${modelBreakdownLabel} | ${textC} κείμενο, ${mathC} μαθηματικά, ${chemC} χημεία, ${animC} ζωντάνεμα | Admin: ${adminC}, Άλλοι: ${othersC}`}
                >
                  <div
                    className={`${
                      chartMode === 'quota' && isNewCascadeDay && overflowUsed > 0
                        ? 'w-[14px]'
                        : 'w-full max-w-[28px]'
                    } h-full rounded-t-md overflow-hidden flex flex-col justify-end bg-slate-200 transition-all shadow-2xs group-hover:opacity-90`}
                  >
                    {chartMode === 'quota' && total > 0 && (
                      isNewCascadeDay ? (
                        <>
                          {[...primarySegments].reverse().map((seg) => (
                            <div
                              key={seg.id}
                              style={{
                                height: `${seg.pctOfBar}%`,
                                backgroundColor: seg.color,
                              }}
                              className="w-full border-b border-white/25 last:border-b-0"
                            />
                          ))}
                        </>
                      ) : (
                        <div style={{ height: '100%' }} className={`w-full ${legacyBarColor}`} />
                      )
                    )}

                    {chartMode === 'type' && (
                      <>
                        {animPct > 0 && (
                          <div style={{ height: `${animPct}%` }} className="w-full bg-purple-600" />
                        )}
                        {chemPct > 0 && (
                          <div style={{ height: `${chemPct}%` }} className="w-full bg-amber-500" />
                        )}
                        {mathPct > 0 && (
                          <div style={{ height: `${mathPct}%` }} className="w-full bg-emerald-500" />
                        )}
                        {textPct > 0 && (
                          <div style={{ height: `${textPct}%` }} className="w-full bg-blue-600" />
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

                  {/* Dynamic Overflow Bar (1,020 Lite Reserve) — appears ONLY on days >= 2026-11-24 with > 80 calls */}
                  {chartMode === 'quota' && isNewCascadeDay && overflowUsed > 0 && (
                    <div
                      style={{ height: `${overflowBarHeight}%` }}
                      className="w-[14px] rounded-t-md overflow-hidden flex flex-col justify-end bg-amber-100 ring-1 ring-amber-400/60 transition-all shadow-2xs group-hover:opacity-90"
                    >
                      {[...overflowSegments].reverse().map((seg) => (
                        <div
                          key={seg.id}
                          style={{
                            height: `${seg.pctOfBar}%`,
                            backgroundColor: seg.color,
                          }}
                          className="w-full border-b border-white/25 last:border-b-0"
                        />
                      ))}
                    </div>
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
                <th className="py-2.5 px-3">% Ημ. Ορίου</th>
                <th className="py-2.5 px-3">Υπόλοιπο Ημέρας</th>
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
                  const rowLimit = t.date >= '2026-11-24' ? GEMINI_FREE_TIER_DAILY_CAPACITY : 100;
                  const dailyPct = Number(((total / rowLimit) * 100).toFixed(1));
                  const remaining = Math.max(0, rowLimit - total);

                  return (
                    <tr key={t.date} className="hover:bg-white/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-bold text-[#1b2a4a]">{t.date}</td>
                      <td className="py-2.5 px-3 font-extrabold text-[#1b2a4a] tabular-nums">
                        {total}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[11px] border tabular-nums ${
                            total >= rowLimit
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : dailyPct >= 75
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : total > 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          {dailyPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[11px] border tabular-nums ${
                            remaining === 0
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : dailyPct >= 75
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {remaining}
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
