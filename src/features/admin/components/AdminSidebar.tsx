import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  Users,
  HardDrive,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Coins,
  Gauge,
  Crown,
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
      id: 'plans',
      label: 'Πλάνα & Όρια',
      icon: <Crown className="w-5 h-5" />,
    },
    {
      id: 'billing',
      label: 'Κλήσεις & Κόστος Firebase',
      icon: <Coins className="w-5 h-5" />,
    },
    {
      id: 'perf',
      label: 'Απόδοση',
      icon: <Gauge className="w-5 h-5" />,
    },
    {
      id: 'traffic',
      label: 'Κίνηση',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: 'ocr',
      label: 'AI & Ανάλυση Quota',
      icon: <Sparkles className="w-5 h-5" />,
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
    <aside className="w-60 lg:w-64 h-full min-h-0 shrink-0 bg-[#1b2a4a] text-white flex flex-col justify-between px-3.5 pt-[max(0.875rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl select-none overflow-hidden">
      {/* Top Branding + Scrollable Nav */}
      <div className="flex flex-col min-h-0 flex-1 gap-3.5">
        <div className="flex items-center gap-3 px-2 pt-1 shrink-0">
          <img
            src="/explainboards-icon.png"
            alt="ExplainBoards"
            className="w-9 h-9 rounded-2xl shadow-md shrink-0 object-contain"
          />
          <div className="min-w-0">
            <h1 className="text-base font-extrabold tracking-tight truncate leading-tight">
              <span className="text-white">Explain</span>
              <span className="bg-gradient-to-r from-[#e11d48] to-[#f43f5e] bg-clip-text text-transparent font-black">Boards</span>
            </h1>
            <p className="text-[11px] font-semibold text-slate-300 truncate">
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* Navigation Items (Monochrome Minimal Navy & Warm Beige) */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-1 pr-0.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#fdfbf7] text-[#1b2a4a] shadow-md shadow-black/20'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-[#1b2a4a]' : 'text-white/70'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Back Action (Always visible, never clipped on iPad) */}
      <div className="space-y-2.5 pt-3 mt-2 border-t border-white/15 shrink-0">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Συνδεδεμένος Admin
          </p>
          <p className="text-xs font-bold text-white truncate mt-0.5" title={adminEmail}>
            {adminEmail}
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToNotes}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="truncate">Επιστροφή στις Σημειώσεις</span>
        </button>
      </div>
    </aside>
  );
};
