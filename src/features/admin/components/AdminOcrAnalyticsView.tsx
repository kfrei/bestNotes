import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
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
} from 'lucide-react';
import type { DailyTrafficStats } from '../types';
import {
  computeOcrMetrics,
  exportOcrToCsv,
} from '../services/trafficService';

export interface AdminOcrAnalyticsViewProps {
  traffic: DailyTrafficStats[];
  isLoading: boolean;
}

export const AdminOcrAnalyticsView: React.FC<AdminOcrAnalyticsViewProps> = ({
  traffic,
  isLoading,
}) => {
  const [searchDate, setSearchDate] = useState<string>('');
  const ocrMetrics = computeOcrMetrics(traffic);

  const filteredTraffic = traffic.filter((t) =>
    t.date.toLowerCase().includes(searchDate.toLowerCase())
  );

  // Maximum AI total across recent days for proportional histogram height
  const maxOcrInChart = Math.max(
    1,
    ...traffic.slice(0, 14).map((t) => t.ocrTotalCount || 0)
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

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1b2a4a] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1b2a4a]" />
            <span>Ανάλυση AI & Κατανάλωση Δωρεάν Ορίου Gemini</span>
          </h2>
          <p className="text-xs text-[#64748b]">
            Πλήρης καταμέτρηση OCR (Κείμενο, Μαθηματικά, Χημεία) & Έξυπνου Ζωντανέματος (Smart Sketch) με διαχωρισμό Admin vs Υπολοίπων.
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

      {/* 2. Google Gemini Free Tier Quota Hero Card */}
      <div className="p-5 rounded-3xl ipados-liquid-glass bg-[#fdfbf7]/80 backdrop-blur-2xl border border-white/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#eef3f8] border border-[#1b2a4a]/20 text-[#1b2a4a] flex items-center justify-center shadow-xs">
              <Cpu className="w-6 h-6 text-[#1b2a4a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#1b2a4a]">
                  Ημερήσια Χρήση Δωρεάν AI (Google Gemini API Free Tier)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#eef3f8] text-[#1b2a4a] text-[10px] font-bold border border-[#1b2a4a]/20">
                  100% ΔΩΡΕΑΝ
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Όριο: <strong className="text-[#1b2a4a]">1.500 αιτήματα / ημέρα (RPD)</strong> & 15 αιτήματα / λεπτό (RPM)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/70 px-4 py-2.5 rounded-2xl border border-[#dfd8cb]/80 shadow-2xs">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-[#64748b]">Υπόλοιπο Σήμερα</div>
              <div className="text-lg font-black text-[#1b2a4a] tabular-nums">
                {ocrMetrics.quotaRemaining.toLocaleString()} / 1.500
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-[#1b2a4a]" />
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Κατανάλωση Σήμερα: <strong className="text-[#1b2a4a]">{ocrMetrics.todayTotal} αιτήματα AI</strong>
            </span>
            <span className="font-black text-xs text-[#1b2a4a]">
              {ocrMetrics.quotaUsedPercent}% του δωρεάν ορίου
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden p-0.5 border border-black/5">
            <div
              style={{ width: `${Math.min(100, Math.max(3, ocrMetrics.quotaUsedPercent))}%` }}
              className="h-full rounded-full transition-all duration-700 bg-[#1b2a4a]"
            />
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
          <div className="text-[10px] text-[#64748b] mt-0.5">όλα τα requests AI</div>
        </div>
      </div>

      {/* 5. Daily Stacked Histogram Chart (Last 14 days) */}
      <div className="p-5 rounded-3xl bg-white/75 backdrop-blur-md border border-white/85 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-[#1b2a4a] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1b2a4a]" />
            <span>Ημερήσιο Ιστόγραμμα AI ανά Τύπο (Τελευταίες 14 Ημέρες)</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748b]">
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
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-4 items-end h-40">
          {traffic
            .slice(0, 14)
            .reverse()
            .map((t) => {
              const total = t.ocrTotalCount || 0;
              const textC = t.ocrTextCount || 0;
              const mathC = t.ocrMathCount || 0;
              const chemC = t.ocrChemCount || 0;
              const animC = t.ocrAnimCount || 0;
              const adminC = t.ocrAdminCount || 0;
              const othersC = Math.max(0, total - adminC);

              const totalHeight = total > 0 ? Math.max(10, Math.round((total / maxOcrInChart) * 100)) : 4;

              const textPct = total > 0 ? (textC / total) * 100 : 0;
              const mathPct = total > 0 ? (mathC / total) * 100 : 0;
              const chemPct = total > 0 ? (chemC / total) * 100 : 0;
              const animPct = total > 0 ? (animC / total) * 100 : 0;

              return (
                <div key={t.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    style={{ height: `${totalHeight}%` }}
                    className="w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col justify-end bg-slate-200 transition-all shadow-2xs group-hover:opacity-90"
                    title={`${t.date}: ${total} AI (${textC} κείμενο, ${mathC} μαθηματικά, ${chemC} χημεία, ${animC} ζωντάνεμα | Admin: ${adminC}, Άλλοι: ${othersC})`}
                  >
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
                  </div>
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
                <th className="py-2.5 px-3">Admin (Εσύ)</th>
                <th className="py-2.5 px-3">Άλλοι / Guests</th>
                <th className="py-2.5 px-3">Κείμενο</th>
                <th className="py-2.5 px-3">Μαθηματικά</th>
                <th className="py-2.5 px-3">Χημεία</th>
                <th className="py-2.5 px-3">Ζωντάνεμα</th>
                <th className="py-2.5 px-3">Κατανάλωση Quota</th>
                <th className="py-2.5 px-3">Υπόλοιπο Δωρεάν</th>
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
                  const pct = Number(((total / 1500) * 100).toFixed(1));
                  const rem = Math.max(0, 1500 - total);

                  return (
                    <tr key={t.date} className="hover:bg-white/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-bold text-[#1b2a4a]">{t.date}</td>
                      <td className="py-2.5 px-3 font-extrabold text-[#1b2a4a]">{total}</td>
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
                      <td className="py-2.5 px-3 font-semibold">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border bg-[#eef3f8] text-[#1b2a4a] border-[#1b2a4a]/20">
                          {pct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 tabular-nums font-semibold">
                        {rem.toLocaleString()}
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