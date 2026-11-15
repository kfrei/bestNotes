import React from 'react';
import type { SimulationObjectItem } from '../types';

export interface SimulationObjectRibbonProps {
  objects: readonly SimulationObjectItem[];
  selectedObjectId?: string | null;
  onSelectObject: (obj: SimulationObjectItem) => void;
  className?: string;
}

/**
 * High-clarity 2.5D SVG laboratory apparatus icons
 */
function getSimulationObjectIcon(id: string): React.ReactNode {
  switch (id) {
    case 'burner':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 18 3 C 14.5 7.5 15 11 18 12.5 C 21 11 21.5 7.5 18 3 Z" strokeWidth="1.8" />
          <rect x="16" y="12.5" width="4" height="13" strokeWidth="1.8" />
          <line x1="14" y1="19" x2="22" y2="19" strokeWidth="1.8" />
          <polygon points="15,25.5 8,32 28,32 21,25.5" strokeWidth="1.8" />
        </svg>
      );
    case 'tripod':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          <line x1="14.5" y1="9" x2="13" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.75" />
          <ellipse cx="18" cy="8.5" rx="11" ry="3.5" strokeWidth="2.0" />
          <ellipse cx="18" cy="8.5" rx="6" ry="1.8" strokeWidth="1.3" strokeDasharray="2 2" />
          <line x1="12" y1="8.5" x2="24" y2="8.5" strokeWidth="1.3" />
          <line x1="8" y1="10" x2="4" y2="32" strokeWidth="2.2" />
          <line x1="26" y1="10" x2="31" y2="32" strokeWidth="2.2" />
        </svg>
      );
    case 'beaker':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 7 L 6.5 8.5 L 9 9.5 L 9 29 C 9 31 10.5 32 12.5 32 L 23.5 32 C 25.5 32 27 31 27 29 L 27 7 L 8 7" strokeWidth="2.0" />
        </svg>
      );
    case 'wide-basin':
      return (
        <svg className="w-11 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 3 13 C 4.5 13 4.5 14 4.5 15.5 L 4.5 26 C 4.5 29.5 7 31 10 31 L 26 31 C 29 31 31.5 29.5 31.5 26 L 31.5 15.5 C 31.5 14 31.5 13 33 13" strokeWidth="2.0" />
          <path d="M 5 17 C 9 18.5 27 18.5 31 17" strokeWidth="1.3" strokeOpacity="0.4" />
        </svg>
      );
    case 'flask':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 14 5 L 22 5 M 15 5 L 15 13 L 7 28 C 6 29.8 7.2 32 9.5 32 L 26.5 32 C 28.8 32 30 29.8 29 28 L 21 13 L 21 5" strokeWidth="2.0" />
        </svg>
      );
    case 'thermometer':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          <rect x="15" y="4" width="6" height="20" rx="3" strokeWidth="1.8" />
          <circle cx="18" cy="27" r="5" strokeWidth="1.8" />
          <line x1="18" y1="9" x2="18" y2="27" strokeWidth="1.6" />
          <line x1="22.5" y1="8" x2="26" y2="8" strokeWidth="1.2" />
          <line x1="22.5" y1="12" x2="27" y2="12" strokeWidth="1.5" />
          <line x1="22.5" y1="16" x2="26" y2="16" strokeWidth="1.2" />
          <line x1="22.5" y1="20" x2="27" y2="20" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Reusable horizontal swipeable ribbon for simulation objects (e.g. Beaker, Burner, Thermometer, Flask, Basin, Tripod).
 * Displays large, clean, high-clarity 2.5D visual icons with swipe affordance.
 */
export const SimulationObjectRibbon: React.FC<SimulationObjectRibbonProps> = ({
  objects,
  selectedObjectId,
  onSelectObject,
  className = '',
}) => {
  if (!objects || objects.length === 0) return null;

  return (
    <div className={`select-none ${className}`}>
      <div
        onWheel={(e) => {
          if (e.deltaY !== 0 && !e.deltaX) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
        className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5 scroll-smooth select-none touch-pan-x"
      >
        {objects.map((obj) => {
          const isSelected = selectedObjectId === obj.id;
          const icon = getSimulationObjectIcon(obj.id);
          return (
            <button
              key={obj.id}
              type="button"
              onClick={() => onSelectObject(obj)}
              className={`shrink-0 w-13 h-13 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#234978]/15 border-[#234978] ring-2 ring-[#234978]/30 shadow-xs scale-105'
                  : 'bg-[#fdfbf7] hover:bg-[#efebe3] border-[#dfd8cb] hover:border-[#234978]/40 hover:scale-104 shadow-2xs'
              }`}
              title={obj.nameEl}
            >
              {icon || <span className="text-xs font-bold text-[#2c3e50]">{obj.nameEl}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
