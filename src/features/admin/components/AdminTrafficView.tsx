import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  UserCheck,
  FileText,
  FilePlus,
  Download,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import type { DailyTrafficStats } from '../types';
import { exportTrafficToCsv } from '../services/trafficService';

export interface AdminTrafficViewProps {
  traffic: DailyTrafficStats[];
  isLoading: boolean;
}

export const AdminTrafficView: React.FC<AdminTrafficViewProps> = ({
  traffic,
  isLoading,
}) => {
  const [searchDate, setSearchDate] = useState<string>('');

  const filteredTraffic = traffic.filter((t) =>
    t.date.toLowerCase().includes(searchDate.toLowerCase())
  );

  const totalAllVisits = traffic.reduce((acc, t) => acc + (t.totalVisits || 0), 0);
  const totalGuestVisits = traffic.reduce((acc, t) => acc + (t.guestVisits || 0), 0);
  const totalRegVisits = traffic.reduce((acc, t) => acc + (t.registeredVisits || 0), 0);
  const totalGuestFiles = traffic.reduce((acc, t) => acc + (t.guestFilesCreated || 0), 0);
  const totalAllFiles = traffic.reduce((acc, t) => acc + (t.totalFilesCreated || 0), 0);

  const guestVisitsPercent =
    totalAllVisits > 0 ? Math.round((totalGuestVisits / totalAllVisits) * 100) : 0;

  // Max visits for relative bar heights in chart
  const maxVisitsInChart = Math.max(1, ...traffic.slice(0, 14).map((t) => t.totalVisits || 0));

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#234978] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#234978]" />
            <span>Κίνηση Επισκεπτών & Δημιουργία Αρχείων (Daily Traffic)</span>
          </h2>
          <p className="text-xs text-[#64748b]">
            Ημερήσια καταγραφή επισκέψεων (Guests & Users) και νέων αρχείων από την έναρξη λειτουργίας
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportTrafficToCsv(traffic)}
          disabled={traffic.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#234978] text-white hover:bg-[#1a385c] disabled:opacity-40 text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Εξαγωγή CSV</span>
        </button>
      </div>

      {/* 2. Informational Banner regarding Firebase & Guest tracking */}
      <div className="p-4 rounded-2xl bg-[#efebe3]/70 border border-[#dfd8cb] flex items-start gap-3 text-xs text-[#475569] leading-relaxed">
        <Info className="w-4 h-4 text-[#234978] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#234978] font-bold">Πώς καταγράφονται τα δεδομένα:</strong>{' '}
          Επειδή το BestNotes είναι <em>Local-First</em>, οι απλοί επισκέπτες αποθηκεύουν τα αρχεία τους στον browser τους (IndexedDB). 
          Το σύστημα τηλεμετρίας καταγράφει αυτόματα κάθε νέα συνεδρία και κάθε νέο αρχείο που δημιουργεί ένας επισκέπτης στη συλλογή{' '}
          <code className="px-1.5 py-0.5 rounded bg-white text-[#234978] font-mono text-[11px] font-semibold border border-[#dfd8cb]">
            daily_traffic
          </code>{' '}
          του Firestore. Παράλληλα, όταν παλιοί επισκέπτες επιστρέφουν στην εφαρμογή, τα αρχεία τους συγχρονίζονται αναδρομικά στις σωστές ημερομηνίες!
        </div>
      </div>

      {/* 3. Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Συνολικές Επισκέψεις</span>
            <TrendingUp className="w-4 h-4 text-[#234978]" />
          </div>
          <div className="text-xl font-black text-[#234978]">{totalAllVisits.toLocaleString()}</div>
          <div className="text-[10px] text-[#64748b] mt-0.5">καταγεγραμμένα sessions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Επισκέπτες (Guests)</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-600">{totalGuestVisits.toLocaleString()}</div>
          <div className="text-[10px] text-sky-700/70 mt-0.5">{guestVisitsPercent}% του συνόλου</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Συνδεδεμένοι Χρήστες</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600">{totalRegVisits.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-700/70 mt-0.5">Google / Email logins</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Αρχεία από Guests</span>
            <FilePlus className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600">{totalGuestFiles.toLocaleString()}</div>
          <div className="text-[10px] text-amber-700/70 mt-0.5">χωρίς σύνδεση λογαριασμού</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] mb-1">
            <span>Σύνολο Νέων Αρχείων</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-600">{totalAllFiles.toLocaleString()}</div>
          <div className="text-[10px] text-indigo-700/70 mt-0.5">τετράδια & σημειώσεις</div>
        </div>
      </div>

      {/* 4. Visual Timeline Bar Chart (Last 14 days) */}
      {traffic.length > 0 && (
        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#234978] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#234978]" />
              <span>Τελευταίες Ημέρες (Επισκέψεις & Δημιουργία Αρχείων)</span>
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-[#64748b]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#234978]" /> Επισκέψεις
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Αρχεία Guests
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-4 items-end h-36">
            {traffic
              .slice(0, 14)
              .reverse()
              .map((t) => {
                const visitsHeight = Math.max(8, Math.round(((t.totalVisits || 0) / maxVisitsInChart) * 100));
                return (
                  <div key={t.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-24">
                      {/* Visits Bar */}
                      <div
                        style={{ height: `${visitsHeight}%` }}
                        className="w-2.5 sm:w-3.5 rounded-t-sm bg-[#234978] hover:bg-[#1a385c] transition-all relative"
                        title={`${t.date}: ${t.totalVisits} επισκέψεις (${t.guestVisits} guests, ${t.registeredVisits} users)`}
                      />
                      {/* Guest Files Bar */}
                      {t.guestFilesCreated > 0 && (
                        <div
                          style={{
                            height: `${Math.max(8, Math.min(100, Math.round((t.guestFilesCreated / maxVisitsInChart) * 100)))}%`,
                          }}
                          className="w-2.5 sm:w-3.5 rounded-t-sm bg-amber-500 hover:bg-amber-600 transition-all"
                          title={`${t.date}: ${t.guestFilesCreated} αρχεία από επισκέπτες`}
                        />
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
      )}

      {/* 5. Detailed Daily Log Table */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[#efebe3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs font-bold text-[#234978] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#234978]" />
            <span>Ημερολόγιο Κίνησης ({filteredTraffic.length} ημέρες)</span>
          </div>

          <div className="w-full sm:w-56">
            <input
              type="text"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              placeholder="Αναζήτηση ημερομηνίας (π.χ. 2026-11)..."
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/90 border border-[#dfd8cb] focus:outline-none focus:ring-2 focus:ring-[#234978]/20 focus:border-[#234978] transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#efebe3]/60 text-[#234978] font-bold border-b border-[#dfd8cb]">
                <th className="py-2.5 px-3.5">Ημερομηνία</th>
                <th className="py-2.5 px-3">Συνολικές Επισκέψεις</th>
                <th className="py-2.5 px-3">Guests</th>
                <th className="py-2.5 px-3">Συνδεδεμένοι</th>
                <th className="py-2.5 px-3">Αρχεία Guests</th>
                <th className="py-2.5 px-3">Αρχεία Χρηστών</th>
                <th className="py-2.5 px-3">Σύνολο Αρχείων</th>
                <th className="py-2.5 px-3 text-right">Τελευταίο Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efebe3]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#64748b]">
                    Φόρτωση δεδομένων κίνησης από το Firebase...
                  </td>
                </tr>
              ) : filteredTraffic.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#64748b]">
                    Δεν βρέθηκαν εγγραφές κίνησης.
                  </td>
                </tr>
              ) : (
                filteredTraffic.map((t) => (
                  <tr key={t.date} className="hover:bg-white/80 transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-[#234978]">
                      {t.date}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {t.totalVisits.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-[11px]">
                        {t.guestVisits.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                        {t.registeredVisits.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-600">
                      +{t.guestFilesCreated}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      +{t.registeredFilesCreated}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#234978]">
                      {t.totalFilesCreated}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[11px] text-[#64748b]">
                      {t.updatedAt ? new Date(t.updatedAt).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
