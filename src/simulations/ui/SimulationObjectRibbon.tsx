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
          {/* Top nozzle head with stepped collar and open mouth */}
          <ellipse cx="18" cy="8.5" rx="3.5" ry="1.3" strokeWidth="1.6" />
          <line x1="14.5" y1="8.5" x2="14.5" y2="12" strokeWidth="1.6" />
          <line x1="21.5" y1="8.5" x2="21.5" y2="12" strokeWidth="1.6" />
          <ellipse cx="18" cy="12" rx="2.5" ry="0.9" strokeWidth="1.3" />
          {/* Chimney barrel */}
          <line x1="15.8" y1="12" x2="15.8" y2="18.5" strokeWidth="1.7" />
          <line x1="20.2" y1="12" x2="20.2" y2="18.5" strokeWidth="1.7" />
          {/* Air collar sleeve with oval aperture and knob */}
          <ellipse cx="18" cy="18.5" rx="3.2" ry="1.1" strokeWidth="1.4" />
          <line x1="14.8" y1="18.5" x2="14.8" y2="23" strokeWidth="1.4" />
          <line x1="21.2" y1="18.5" x2="21.2" y2="23" strokeWidth="1.4" />
          <ellipse cx="18" cy="23" rx="3.2" ry="1.1" strokeWidth="1.4" />
          <ellipse cx="18" cy="20.8" rx="0.9" ry="1.3" strokeWidth="1.2" />
          <line x1="21.2" y1="20.5" x2="23" y2="20.5" strokeWidth="1.3" />
          {/* Flared conical bell skirt down to 2.5D weighted base */}
          <path d="M 15 23.5 C 13.5 26 10 27.5 6.5 28 L 6.5 30 C 6.5 32 11.5 33.2 18 33.2 C 24.5 33.2 29.5 32 29.5 30 L 29.5 28 C 26 27.5 22.5 26 21 23.5" strokeWidth="1.8" />
          <path d="M 6.5 28 C 6.5 30 11.5 31.2 18 31.2 C 24.5 31.2 29.5 30 29.5 28" strokeWidth="1.4" />
        </svg>
      );
    case 'tripod':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          {/* Recessed faint back leg shifted off-center to the left */}
          <line x1="14" y1="8.5" x2="11.5" y2="26" stroke="#94a3b8" strokeWidth="1.6" strokeOpacity="0.65" />
          {/* Top collar ring */}
          <ellipse cx="18" cy="8.5" rx="11" ry="3.5" strokeWidth="2.0" />
          {/* Wire gauze mesh */}
          <ellipse cx="18" cy="8.5" rx="6.5" ry="1.9" strokeWidth="1.1" strokeDasharray="2 2" />
          <line x1="11.5" y1="8.5" x2="24.5" y2="8.5" strokeWidth="1.1" />
          {/* Front Left and Right legs */}
          <line x1="8" y1="10" x2="4" y2="31" strokeWidth="2.3" />
          <line x1="26" y1="10" x2="31" y2="31" strokeWidth="2.3" />
        </svg>
      );
    case 'beaker':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          {/* Spout on left & outer walls */}
          <path d="M 9 9 L 6 9.5 L 9.5 12 L 9.5 28 C 9.5 30.5 13.5 31.8 18 31.8 C 22.5 31.8 26.5 30.5 26.5 28 L 26.5 9" strokeWidth="1.9" />
          {/* Top 2.5D rim ellipse */}
          <ellipse cx="18" cy="9" rx="8.5" ry="2.8" strokeWidth="1.7" />
          {/* Inner glass lip */}
          <ellipse cx="18" cy="9" rx="7" ry="2.1" strokeWidth="1.1" strokeOpacity="0.45" />
          {/* Bottom depth curve */}
          <path d="M 9.5 28 C 9.5 29.8 13.5 30.8 18 30.8 C 22.5 30.8 26.5 29.8 26.5 28" strokeWidth="1.2" strokeOpacity="0.35" />
        </svg>
      );
    case 'wide-basin':
      return (
        <svg className="w-11 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          {/* Basin rim ellipse with handles */}
          <ellipse cx="18" cy="12" rx="13.5" ry="4" strokeWidth="1.8" />
          <ellipse cx="18" cy="12" rx="11.5" ry="3.2" strokeWidth="1.1" strokeOpacity="0.45" />
          <path d="M 4 12 C 3 10.5 4 8 5.5 8" strokeWidth="1.6" />
          <path d="M 32 12 C 33 10.5 32 8 30.5 8" strokeWidth="1.6" />
          <path d="M 4.5 12 L 5.5 25 C 5.5 28.5 10.5 30.5 18 30.5 C 25.5 30.5 30.5 28.5 30.5 25 L 31.5 12" strokeWidth="1.9" />
          <path d="M 5.5 25 C 5.5 27.2 10.5 29.2 18 29.2 C 25.5 29.2 30.5 27.2 30.5 25" strokeWidth="1.2" strokeOpacity="0.35" />
        </svg>
      );
    case 'flask':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          {/* Flared mouth */}
          <ellipse cx="18" cy="6" rx="4.5" ry="1.6" strokeWidth="1.7" />
          {/* Conical body down to curved bottom */}
          <path d="M 15 6 L 15 13 L 7.5 28 C 7.5 30.8 12 32 18 32 C 24 32 28.5 30.8 28.5 28 L 21 13 L 21 6" strokeWidth="1.9" />
          {/* Bottom depth curve */}
          <path d="M 7.5 28 C 7.5 29.6 12 30.8 18 30.8 C 24 30.8 28.5 29.6 28.5 28" strokeWidth="1.2" strokeOpacity="0.35" />
        </svg>
      );
    case 'thermometer':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          {/* Capillary stem */}
          <rect x="15.5" y="4" width="5" height="19" rx="2.5" strokeWidth="1.7" />
          {/* Empty bottom bulb */}
          <circle cx="18" cy="27.5" r="4.5" strokeWidth="1.8" />
          {/* Central bore capillary line */}
          <line x1="18" y1="8" x2="18" y2="24" strokeWidth="1.2" strokeOpacity="0.5" />
          {/* Graduations */}
          <line x1="21.5" y1="8" x2="25" y2="8" strokeWidth="1.2" />
          <line x1="21.5" y1="12" x2="26" y2="12" strokeWidth="1.4" />
          <line x1="21.5" y1="16" x2="25" y2="16" strokeWidth="1.2" />
          <line x1="21.5" y1="20" x2="26" y2="20" strokeWidth="1.4" />
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
