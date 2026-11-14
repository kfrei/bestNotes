import React from 'react';
import { Users, FileText, HardDrive, Clock, Activity } from 'lucide-react';
import type { AdminAggregateMetrics } from '../types';
import { formatBytes, formatMinutesLabel } from '../services/userStatsService';

export interface AdminKpiCardsProps {
  metrics: AdminAggregateMetrics;
}

export const AdminKpiCards: React.FC<AdminKpiCardsProps> = ({ metrics }) => {
  const cards = [
    {
      label: 'Εγγεγραμμένοι Χρήστες',
      value: metrics.totalUsers.toLocaleString('el-GR'),
      subLabel: `${metrics.activeTodayCount} ενεργοί σήμερα`,
      icon: <Users className="w-5 h-5 text-[#1b2a4a]" />,
      bgIcon: 'bg-[#eef3f8] border-[#1b2a4a]/20',
    },
    {
      label: 'Αποθηκευμένα Αρχεία',
      value: metrics.totalNotebooks.toLocaleString('el-GR'),
      subLabel: `Admin: ${metrics.adminNotebooksCount || 0} • Άλλοι: ${metrics.otherUsersNotebooksCount || 0}`,
      icon: <FileText className="w-5 h-5 text-[#1b2a4a]" />,
      bgIcon: 'bg-[#eef3f8] border-[#1b2a4a]/20',
    },
    {
      label: 'Δεσμευμένος Χώρος',
      value: formatBytes(metrics.totalSizeBytes),
      subLabel: `Admin: ${formatBytes(metrics.adminSizeBytes || 0)} • Άλλοι: ${formatBytes(metrics.otherUsersSizeBytes || 0)}`,
      icon: <HardDrive className="w-5 h-5 text-[#1b2a4a]" />,
      bgIcon: 'bg-[#eef3f8] border-[#1b2a4a]/20',
    },
    {
      label: 'Μέσος Χρόνος / Ημέρα',
      value: formatMinutesLabel(metrics.avgDailyMinutesAll),
      subLabel: `Admin: ${formatMinutesLabel(metrics.adminActiveMinutes || 0)} • Μ.Ο. όλων`,
      icon: <Clock className="w-5 h-5 text-[#1b2a4a]" />,
      bgIcon: 'bg-[#eef3f8] border-[#1b2a4a]/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => (
        <div
          key={idx}
          className="ipados-liquid-glass bg-[#fdfbf7]/80 backdrop-blur-2xl border border-white/85 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
              {c.label}
            </p>
            <p className="text-2xl font-extrabold text-[#1b2a4a] mt-1 tabular-nums">
              {c.value}
            </p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1 truncate">
              {c.subLabel}
            </p>
          </div>

          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${c.bgIcon}`}
          >
            {c.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
