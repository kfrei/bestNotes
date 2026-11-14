import React from 'react';
import {
  LayoutDashboard,
  Users,
  HardDrive,
  Clock,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import type { AdminTab } from '../types';

export interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onBackToNotes: () => void;
  adminEmail: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onBackToNotes,
  adminEmail,
}) => {
  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Επισκόπηση',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'users',
      label: 'Χρήστες & Αρχεία',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'storage',
      label: 'Χωρητικότητα',
      icon: <HardDrive className="w-5 h-5" />,
    },
    {
      id: 'activity',
      label: 'Χρόνος Χρήσης',
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#234978] text-white flex flex-col justify-between p-4 shadow-xl select-none min-h-screen">
      {/* Top Branding */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
            <ShieldCheck className="w-6 h-6 text-sky-300" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold tracking-wide uppercase text-white truncate">
              ExplainBoards
            </h1>
            <p className="text-[11px] font-semibold text-sky-200/80 truncate">
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* Navigation Items (Monochrome Minimal Navy & Warm Beige) */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#fdfbf7] text-[#234978] shadow-md shadow-black/10 scale-[1.02]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={isActive ? 'text-[#234978]' : 'text-white/70'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Back Action */}
      <div className="space-y-3 pt-4 border-t border-white/15">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-300/70">
            Συνδεδεμένος Admin
          </p>
          <p className="text-xs font-bold text-white truncate mt-0.5" title={adminEmail}>
            {adminEmail}
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToNotes}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Επιστροφή στις Σημειώσεις</span>
        </button>
      </div>
    </aside>
  );
};
