import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Calculator,
  FlaskConical,
  FileText,
  Download,
  Info,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
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

  // Maximum OCR total across recent days for proportional histogram height
  const maxOcrInChart = Math.max(
    1,
    ...traffic.slice(0, 14).map((t) => t.ocrTotalCount || 0)
  );

  // Status color based on quota consumption
  const isSafeQuota = ocrMetrics.quotaUsedPercent < 65;
  const isModerateQuota = ocrMetrics.quotaUsedPercent >= 65 && ocrMetrics.quotaUsedPercent < 85;

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#234978] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Ανάλυση AI OCR & Κατανάλωση Δωρεάν Ορίου Gemini</span>
          </h2>
          <p className="text-xs text-[#64748b]">
            Καταμέτρηση αναγνωρίσεων κειμένου, μαθηματικών & χημείας και έλεγχος ποσοστού του δωρεάν ορίου Google Gemini (1.500 requests/day)
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportOcrToCsv(traffic)}
          disabled={traffic.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#234978] text-white hover:bg-[#1a385c] disabled:opacity-40 text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Εξαγωγή CSV OCR</span>
        </button>
      </div>

      {/* 2. Google Gemini Free Tier Quota Hero Card */}
      <div className="p-5 rounded-3xl ipados-liquid-glass bg-gradient-to-br from-[#fdfbf7] via-white to-[#f5f0e8] border border-white/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#234978] text-amber-300 flex items-center justify-center shadow-md">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#1b2a4a]">
                  Ημερήσια Χρήση Δωρεάν AI (Google Gemini API Free Tier)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  100% ΔΩΡΕΑΝ
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Όριο: <strong className="text-[#234978]">1.500 αιτήματα / ημέρα (RPD)</strong> & 15 αιτήματα / λεπτό (RPM)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/70 px-4 py-2.5 rounded-2xl border border-[#dfd8cb]/80 shadow-2xs">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-[#64748b]">Υπόλοιπο Σήμερα</div>
              <div className="text-lg font-black text-emerald-600 tabular-nums">
                {ocrMetrics.quotaRemaining.toLocaleString()} / 1.500
              </div>
            </div>
            {isSafeQuota ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            )}
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Κατανάλωση Σήμερα: <strong className="text-[#234978]">{ocrMetrics.todayTotal} αιτήματα OCR</strong>
            </span>
            <span
              className={`font-black text-xs ${
                isSafeQuota
                  ? 'text-emerald-700'
                  : isModerateQuota
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {ocrMetrics.quotaUsedPercent}% του δωρεάν ορίου
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden p-0.5 border border-black/5">
            <div
              style={{ width: `${Math.min(100, Math.max(3, ocrMetrics.quotaUsedPercent))}%` }}
              className={`h-full rounded-full transition-all duration-700 ${
                isSafeQuota
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : isModerateQuota
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-rose-500 to-red-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 3. Breakdown by OCR Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Κείμενο (Text OCR)</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-600">
            {ocrMetrics.todayText.toLocaleString()}
          </div>
          <div className="text-[10px] text-sky-700/70 mt-0.5">Ελληνικό χειρόγραφο σήμερα</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Μαθηματικά (Math OCR)</span>
            <Calculator className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-600">
            {ocrMetrics.todayMath.toLocaleString()}
          </div>
          <div className="text-[10px] text-purple-700/70 mt-0.5">Εξισώσεις & LaTeX σήμερα</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Χημεία (Chem OCR)</span>
            <FlaskConical className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600">
            {ocrMetrics.todayChem.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700/70 mt-0.5">Αντιδράσεις & 3D Μόρια</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Σύνολο Όλων (All-Time)</span>
            <Sparkles className="w-4 h-4 text-[#234978]" />
          </div>
          <div className="text-xl font-black text-[#234978]">
            {ocrMetrics.allTimeOcrTotal.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#64748b] mt-0.5">όλα τα OCR αιτήματα</div>
        </div>
      </div>

      {/* 4. Daily Stacked Histogram Chart (Last 14 days) */}
      <div className="p-5 rounded-3xl bg-white/75 backdrop-blur-md border border-white/85 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-[#234978] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#234978]" />
            <span>Ημερήσιο Ιστόγραμμα OCR ανά Τύπο (Τελευταίες 14 Ημέρες)</span>
          </h3>

          <div className="flex items-center gap-3 text-[11px] text-[#64748b]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Κείμενο
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Μαθηματικά
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Χημεία
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

              const totalHeight = total > 0 ? Math.max(10, Math.round((total / maxOcrInChart) * 100)) : 4;

              const textPct = total > 0 ? (textC / total) * 100 : 0;
              const mathPct = total > 0 ? (mathC / total) * 100 : 0;
              const chemPct = total > 0 ? (chemC / total) * 100 : 0;

              return (
                <div key={t.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    style={{ height: `${totalHeight}%` }}
                    className="w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col justify-end bg-slate-200 transition-all shadow-2xs group-hover:opacity-90"
                    title={`${t.date}: ${total} OCR (${textC} κείμενο, ${mathC} μαθηματικά, ${chemC} χημεία)`}
                  >
                    {chemPct > 0 && (
                      <div style={{ height: `${chemPct}%` }} className="w-full bg-emerald-500" />
                    )}
                    {mathPct > 0 && (
                      <div style={{ height: `${mathPct}%` }} className="w-full bg-purple-500" />
                    )}
                    {textPct > 0 && (
                      <div style={{ height: `${textPct}%` }} className="w-full bg-sky-500" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#64748b] group-hover:text-[#234978] group-hover:font-bold transition truncate max-w-full">
                    {t.date.slice(5)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* 5. Detailed Daily OCR Table */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[#efebe3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs font-bold text-[#234978] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#234978]" />
            <span>Ημερήσιο Μητρώο OCR ({filteredTraffic.length} ημέρες)</span>
          </div>

          <div className="w-full sm:w-56">
            <input
              type="text"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              placeholder="Αναζήτηση ημερομηνίας..."
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/90 border border-[#dfd8cb] focus:outline-none focus:ring-2 focus:ring-[#234978]/20 focus:border-[#234978] transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#efebe3]/60 text-[#234978] font-bold border-b border-[#dfd8cb]">
                <th className="py-2.5 px-3.5">Ημερομηνία</th>
                <th className="py-2.5 px-3">Σύνολο OCR</th>
                <th className="py-2.5 px-3">Κείμενο</th>
                <th className="py-2.5 px-3">Μαθηματικά</th>
                <th className="py-2.5 px-3">Χημεία</th>
                <th className="py-2.5 px-3">Κατανάλωση Quota (1.500)</th>
                <th className="py-2.5 px-3">Υπόλοιπο Δωρεάν</th>
                <th className="py-2.5 px-3 text-right">Τελευταίο Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efebe3]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#64748b]">
                    Φόρτωση δεδομένων OCR από το Firebase...
                  </td>
                </tr>
              ) : filteredTraffic.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#64748b]">
                    Δεν βρέθηκαν καταγεγραμμένες εγγραφές OCR.
                  </td>
                </tr>
              ) : (
                filteredTraffic.map((t) => {
                  const total = t.ocrTotalCount || 0;
                  const pct = Number(((total / 1500) * 100).toFixed(1));
                  const rem = Math.max(0, 1500 - total);

                  return (
                    <tr key={t.date} className="hover:bg-white/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-bold text-[#234978]">{t.date}</td>
                      <td className="py-2.5 px-3 font-extrabold text-[#1b2a4a]">{total}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-[11px] border border-sky-200">
                          {t.ocrTextCount || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-200">
                          {t.ocrMathCount || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                          {t.ocrChemCount || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            pct < 65
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : pct < 85
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
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
