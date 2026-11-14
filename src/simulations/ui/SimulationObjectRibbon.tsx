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
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none">
          <path d="M 14 26 L 8 32 L 28 32 L 22 26 Z" fill="#64748b" stroke="#0f172a" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="7" y="31" width="22" height="2" rx="1" fill="#334155" />
          <rect x="16" y="14" width="4" height="12" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5" />
          <rect x="14.5" y="20" width="7" height="3" rx="0.5" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="18" cy="21.5" r="0.8" fill="#0f172a" />
          <path d="M 18 3 C 14 8 14.5 12 18 14 C 21.5 12 22 8 18 3 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1.2" />
          <path d="M 18 6 C 16 9.5 16.5 12.5 18 14 C 19.5 12.5 20 9.5 18 6 Z" fill="#fde047" />
          <path d="M 18 10 C 17 11.5 17.2 13.5 18 14 C 18.8 13.5 19 11.5 18 10 Z" fill="#38bdf8" />
        </svg>
      );
    case 'tripod':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="18" cy="9" rx="11" ry="3.5" fill="#334155" stroke="#0f172a" strokeWidth="1.8" />
          <ellipse cx="18" cy="9" rx="6.5" ry="2" fill="#fb923c" stroke="#ea580c" strokeWidth="1" />
          <line x1="14" y1="9" x2="22" y2="9" stroke="#c2410c" strokeWidth="0.8" />
          <line x1="9" y1="10" x2="4" y2="32" stroke="#0f172a" strokeWidth="2.2" />
          <line x1="27" y1="10" x2="32" y2="32" stroke="#0f172a" strokeWidth="2.2" />
          <line x1="18" y1="11" x2="18" y2="30" stroke="#0f172a" strokeWidth="1.6" strokeOpacity="0.75" />
          <circle cx="4" cy="32" r="1.2" fill="#0f172a" />
          <circle cx="32" cy="32" r="1.2" fill="#0f172a" />
          <circle cx="18" cy="30" r="1" fill="#0f172a" />
        </svg>
      );
    case 'beaker':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8 7 L 6.5 8.5 L 9 9.5 L 9 29 C 9 31 10.5 32 12.5 32 L 23.5 32 C 25.5 32 27 31 27 29 L 27 7 L 8 7" stroke="#0f172a" strokeWidth="1.8" />
          <path d="M 9.5 18 C 12 17 24 17 26.5 18 L 26.5 29 C 26.5 30.5 25.5 31.2 23.5 31.2 L 12.5 31.2 C 10.5 31.2 9.5 30.5 9.5 29 Z" fill="rgba(56, 189, 248, 0.45)" stroke="#0284c7" strokeWidth="1.2" />
          <line x1="12" y1="13" x2="16" y2="13" stroke="#0f172a" strokeWidth="1.3" />
          <line x1="12" y1="18" x2="18" y2="18" stroke="#0f172a" strokeWidth="1.4" />
          <line x1="12" y1="23" x2="16" y2="23" stroke="#0f172a" strokeWidth="1.3" />
        </svg>
      );
    case 'wide-basin':
      return (
        <svg className="w-11 h-10" viewBox="0 0 36 36" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 3 13 C 4.5 13 4.5 14 4.5 15.5 L 4.5 26 C 4.5 29.5 7 31 10 31 L 26 31 C 29 31 31.5 29.5 31.5 26 L 31.5 15.5 C 31.5 14 31.5 13 33 13" stroke="#0f172a" strokeWidth="2" />
          <path d="M 5 19 C 10 18 26 18 31 19 L 31 26 C 31 29 29 30.2 26 30.2 L 10 30.2 C 7 30.2 5 29 5 26 Z" fill="rgba(56, 189, 248, 0.45)" stroke="#0284c7" strokeWidth="1.2" />
          <ellipse cx="14" cy="23" rx="2" ry="1.2" fill="rgba(255,255,255,0.7)" />
          <ellipse cx="22" cy="22" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.6)" />
        </svg>
      );
    case 'flask':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 14 5 L 22 5 M 15 5 L 15 13 L 7 28 C 6 29.8 7.2 32 9.5 32 L 26.5 32 C 28.8 32 30 29.8 29 28 L 21 13 L 21 5" stroke="#0f172a" strokeWidth="1.8" />
          <path d="M 11.5 21 L 7.6 28.5 C 7.2 29.5 8 31.2 9.5 31.2 L 26.5 31.2 C 28 31.2 28.8 29.5 28.4 28.5 L 24.5 21 Z" fill="rgba(56, 189, 248, 0.45)" stroke="#0284c7" strokeWidth="1.2" />
          <line x1="13" y1="23" x2="16" y2="23" stroke="#0f172a" strokeWidth="1.2" />
          <line x1="12" y1="26" x2="17" y2="26" stroke="#0f172a" strokeWidth="1.3" />
        </svg>
      );
    case 'thermometer':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="15" y="4" width="6" height="20" rx="3" fill="rgba(255, 255, 255, 0.85)" stroke="#0f172a" strokeWidth="1.6" />
          <circle cx="18" cy="27" r="5" fill="#dc2626" stroke="#0f172a" strokeWidth="1.6" />
          <rect x="16.5" y="11" width="3" height="13" fill="#dc2626" />
          <circle cx="17.2" cy="26" r="1.5" fill="rgba(255,255,255,0.4)" />
          <line x1="22" y1="8" x2="25" y2="8" stroke="#0f172a" strokeWidth="1.1" />
          <line x1="22" y1="12" x2="26" y2="12" stroke="#0f172a" strokeWidth="1.4" />
          <line x1="22" y1="16" x2="25" y2="16" stroke="#0f172a" strokeWidth="1.1" />
          <line x1="22" y1="20" x2="26" y2="20" stroke="#0f172a" strokeWidth="1.4" />
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
