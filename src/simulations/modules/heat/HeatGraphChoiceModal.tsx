import React from 'react';
import { X, LineChart, Layers, PlusCircle, Sparkles } from 'lucide-react';
import { HeatObject, LIQUID_REGISTRY } from './types';

export interface HeatGraphChoiceModalProps {
  isOpen: boolean;
  targetContainer: HeatObject | null;
  onChoose: (choice: 'existing' | 'new') => void;
  onClose: () => void;
}

export const HeatGraphChoiceModal: React.FC<HeatGraphChoiceModalProps> = ({
  isOpen,
  targetContainer,
  onChoose,
  onClose,
}) => {
  if (!isOpen || !targetContainer || !targetContainer.containerState) return null;

  const cs = targetContainer.containerState;
  const liquidProps = LIQUID_REGISTRY[cs.liquidType] || LIQUID_REGISTRY.water;

  const vesselName =
    targetContainer.type === 'beaker'
      ? 'Ποτήρι Ζέσεως'
      : targetContainer.type === 'wide-basin'
      ? 'Πλατιά Λεκάνη (Υδατόλουτρο)'
      : 'Κωνική Φιάλη';

  return (
    <div
      data-ui-panel="true"
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs select-none animate-in fade-in duration-150"
    >
      <div className="w-[420px] max-w-[95vw] rounded-3xl ipados-liquid-glass bg-[#fdfbf7]/80 backdrop-blur-2xl backdrop-saturate-200 border border-white/85 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25),0_6px_20px_-2px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/5 p-5 text-[#2c3e50] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#e2dbce]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
              <LineChart className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#234978]">
                Διάγραμμα Θερμοκρασίας - Χρόνου (θ - t)
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Επιλογή τρόπου προβολής καμπύλης
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/80 text-[#64748b] hover:text-[#234978] transition cursor-pointer"
            title="Κλείσιμο"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1e293b] flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                style={{ backgroundColor: liquidProps.color }}
              />
              <span>{vesselName}</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 shadow-2xs">
              {Math.round(cs.temperature)} °C
            </span>
          </div>
          <p className="text-[10.5px] text-[#64748b]">
            Υπάρχει ήδη ανοιχτό διάγραμμα θερμοκρασίας στον καμβά. Πώς θέλετε να προβληθεί η θερμοκρασία για αυτό το δοχείο;
          </p>
        </div>

        {/* 2 Big Choice Cards */}
        <div className="grid grid-cols-1 gap-2.5">
          {/* Option 1: Existing Graph */}
          <div
            onClick={() => onChoose('existing')}
            className="group p-3 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/90 hover:border-indigo-400 hover:ring-2 hover:ring-indigo-400/20 shadow-xs hover:shadow transition-all cursor-pointer flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="text-xs font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors">
                Παρουσίαση στο υπάρχον διάγραμμα
              </div>
              <p className="text-[10px] text-[#64748b] leading-relaxed">
                Προσθήκη ως νέα καμπύλη σύγκρισης στους ίδιους άξονες για άμεση παρατήρηση και σύγκριση θερμοχωρητικότητας.
              </p>
            </div>
          </div>

          {/* Option 2: New Graph */}
          <div
            onClick={() => onChoose('new')}
            className="group p-3 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/90 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 shadow-xs hover:shadow transition-all cursor-pointer flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="text-xs font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
                Δημιουργία νέου διαγράμματος
              </div>
              <p className="text-[10px] text-[#64748b] leading-relaxed">
                Άνοιγμα νέου ξεχωριστού παραθύρου διαγράμματος αφιερωμένου αποκλειστικά σε αυτό το δοχείο.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-[#64748b] hover:bg-white/80 transition cursor-pointer"
          >
            Ακύρωση
          </button>
        </div>
      </div>
    </div>
  );
};
