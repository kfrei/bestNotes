import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Download,
  Calendar,
  HardDrive,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react';
import type { UserProfileStats } from '../types';
import { formatBytes, formatMinutesLabel } from '../services/userStatsService';

export interface AdminUsersTableProps {
  users: UserProfileStats[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

type SortField = 'displayName' | 'createdAt' | 'notebooksCount' | 'totalSizeBytes' | 'avgDailyMinutes' | 'lastSeenAt';

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  onRefresh,
  isRefreshing,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('lastSeenAt');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredAndSortedUsers = useMemo(() => {
    let result = users.slice();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.uid.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB, 'el');
        return sortAsc ? cmp : -cmp;
      }

      valA = valA || 0;
      valB = valB || 0;
      return sortAsc ? valA - valB : valB - valA;
    });

    return result;
  }, [users, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const exportCsv = () => {
    if (users.length === 0) return;
    const headers = [
      'UID',
      'Ονοματεπώνυμο',
      'Email',
      'Ημ/νία Εγγραφής',
      'Τελευταία Σύνδεση',
      'Αποθηκευμένα Αρχεία',
      'Δεσμευμένος Χώρος (Bytes)',
      'Δεσμευμένος Χώρος (Αναγνώσιμο)',
      'Μέσος Χρόνος/Ημέρα (Λεπτά)',
    ];

    const rows = users.map((u) => [
      `"${u.uid}"`,
      `"${u.displayName || ''}"`,
      `"${u.email || ''}"`,
      `"${u.createdAt || ''}"`,
      `"${u.lastSeenAt || ''}"`,
      u.notebooksCount || 0,
      u.totalSizeBytes || 0,
      `"${formatBytes(u.totalSizeBytes)}"`,
      u.avgDailyMinutes || 0,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `explainboards_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Αναζήτηση ονόματος, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#dfd8cb] text-xs font-bold text-[#234978] placeholder:text-slate-400 focus:outline-none focus:border-[#234978] focus:ring-1 focus:ring-[#234978]/20 transition"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#dfd8cb] text-xs font-bold text-[#234978] hover:bg-[#efebe3] transition cursor-pointer"
          >
            <span>{isRefreshing ? '⏳ Ανανέωση...' : '🔄 Ανανέωση'}</span>
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#234978] text-white text-xs font-bold hover:bg-[#1c3c63] shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Εξαγωγή CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="ipados-liquid-glass bg-[#fdfbf7]/80 backdrop-blur-2xl border border-white/85 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#dfd8cb] bg-[#efebe3]/40 text-[#64748b] font-bold uppercase tracking-wider text-[10.5px]">
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('displayName')}
                    className="flex items-center gap-1 hover:text-[#234978] cursor-pointer"
                  >
                    <span>Χρήστης</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('createdAt')}
                    className="flex items-center gap-1 hover:text-[#234978] cursor-pointer"
                  >
                    <span>Εγγραφή</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => toggleSort('notebooksCount')}
                    className="flex items-center gap-1 mx-auto hover:text-[#234978] cursor-pointer"
                  >
                    <span>Αρχεία</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('totalSizeBytes')}
                    className="flex items-center gap-1 hover:text-[#234978] cursor-pointer"
                  >
                    <span>Χώρος</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('avgDailyMinutes')}
                    className="flex items-center gap-1 hover:text-[#234978] cursor-pointer"
                  >
                    <span>Χρόνος / Ημέρα</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('lastSeenAt')}
                    className="flex items-center gap-1 hover:text-[#234978] cursor-pointer"
                  >
                    <span>Τελευταία Σύνδεση</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfd8cb]/60">
              {filteredAndSortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold">
                    Δεν βρέθηκαν χρήστες που να ταιριάζουν με την αναζήτηση.
                  </td>
                </tr>
              ) : (
                filteredAndSortedUsers.map((u) => {
                  const regDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('el-GR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—';

                  const lastSeenDate = u.lastSeenAt
                    ? new Date(u.lastSeenAt).toLocaleString('el-GR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr
                      key={u.uid}
                      className="hover:bg-white/60 transition-colors text-[#2c3e50]"
                    >
                      {/* User Info (Avatar + Name + Email) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt=""
                              className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#234978] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {(u.displayName || u.email || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-[#1b2a4a] truncate">
                              {u.displayName || 'Χρήστης'}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate" title={u.email}>
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {regDate}
                      </td>

                      {/* Saved Notebooks Count */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200/60 text-[#234978] font-extrabold tabular-nums">
                          <FileText className="w-3 h-3" />
                          <span>{u.notebooksCount || 0}</span>
                        </span>
                      </td>

                      {/* Storage Occupied */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-[#1b2a4a] tabular-nums">
                        {formatBytes(u.totalSizeBytes)}
                      </td>

                      {/* Average Daily Time */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-[#234978] tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatMinutesLabel(u.avgDailyMinutes)}</span>
                        </span>
                      </td>

                      {/* Last Seen */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-500 font-semibold">
                        {lastSeenDate}
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
