import React from 'react';
import type { SimulationObjectItem } from '../types';

export interface SimulationObjectRibbonProps {
  objects: readonly SimulationObjectItem[];
  selectedObjectId?: string | null;
  onSelectObject: (obj: SimulationObjectItem) => void;
  className?: string;
}

/**
 * Reusable horizontal swipeable ribbon for simulation objects (e.g. Battery, Bulb, Motor, Beaker, Burner, Thermometer).
 * Inspired by the 10-slot pencil color memory ribbon.
 */
export const SimulationObjectRibbon: React.FC<SimulationObjectRibbonProps> = ({
  objects,
  selectedObjectId,
  onSelectObject,
  className = '',
}) => {
  if (!objects || objects.length === 0) return null;

  return (
    <div className={`space-y-1.5 select-none ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-bold text-[#64748b]">
        <span>Αντικείμενα Προσομοίωσης</span>
        <span className="text-[10px] text-slate-400 font-medium">← Σύρε για περισσότερα →</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth">
        {objects.map((obj) => {
          const isSelected = selectedObjectId === obj.id;
          return (
            <button
              key={obj.id}
              type="button"
              onClick={() => onSelectObject(obj)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#234978] border-[#234978] text-white shadow-xs scale-105'
                  : 'bg-[#fdfbf7] hover:bg-[#efebe3] border-[#dfd8cb] text-[#2c3e50] hover:scale-102'
              }`}
              title={obj.handwritingHintEl || obj.nameEl}
            >
              <span>{obj.nameEl}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
