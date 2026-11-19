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
          {/* Recessed faint back leg starting on upper collar outline */}
          <line x1="15" y1="5.4" x2="12.5" y2="25" stroke="#94a3b8" strokeWidth="1.6" strokeOpacity="0.65" />
          {/* Top collar ring */}
          <ellipse cx="18" cy="8.5" rx="11" ry="3.2" strokeWidth="2.0" />
          {/* Wire gauze mesh */}
          <ellipse cx="18" cy="8.5" rx="8.8" ry="2.5" strokeWidth="0.9" strokeDasharray="1.5 1.5" />
          {/* Ceramic center disc matching exact perspective ellipse */}
          <ellipse cx="18" cy="8.5" rx="4.2" ry="1.2" strokeWidth="1.1" fill="#f8fafc" />
          {/* Front Left and Right legs starting exactly on the lower collar rim */}
          <line x1="9" y1="10.4" x2="4.5" y2="31" strokeWidth="2.2" />
          <line x1="27" y1="10.4" x2="31.5" y2="31" strokeWidth="2.2" />
        </svg>
      );
    case 'beaker':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          {/* Spout on left & horizontal rim with rolled bead */}
          <path d="M 6 10.5 L 9.5 9 L 26.5 9" strokeWidth="2.0" />
          <line x1="9.5" y1="12" x2="26.5" y2="12" strokeWidth="1.2" strokeOpacity="0.4" />
          {/* Walls and rounded bottom base */}
          <path d="M 26.5 9 L 26.5 27 C 26.5 29.5 24.5 31 22 31 L 14 31 C 11.5 31 9.5 29.5 9.5 27 L 9.5 14 L 6 10.5" strokeWidth="1.9" />
        </svg>
      );
    case 'wide-basin':
      return (
        <svg className="w-11 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          {/* Spout on left & horizontal rim with rolled bead */}
          <path d="M 4 15.5 L 7.5 14 L 30 14" strokeWidth="1.9" />
          <line x1="7.5" y1="16.5" x2="30" y2="16.5" strokeWidth="1.2" strokeOpacity="0.4" />
          {/* Straight walls and rounded bottom base */}
          <path d="M 30 14 L 30 24 C 30 26.5 28 28 25.5 28 L 11.5 28 C 9 28 7.5 26.5 7.5 24 L 7.5 18 L 4 15.5" strokeWidth="1.9" />
        </svg>
      );
    case 'flask':
      return (
        <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round">
          {/* Rolled mouth collar on top of neck */}
          <rect x="13" y="6" width="10" height="4" rx="2" strokeWidth="1.8" />
          {/* Neck & conical body with rounded bottom base */}
          <path d="M 15 10 L 15 15 L 8.5 27 C 8 28.5 9.5 31 12 31 L 24 31 C 26.5 31 28 28.5 27.5 27 L 21 15 L 21 10" strokeWidth="1.9" />
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
      <div className="grid grid-cols-3 gap-2 py-1 px-0.5 select-none">
        {objects.map((obj) => {
          const isSelected = selectedObjectId === obj.id;
          const icon = getSimulationObjectIcon(obj.id);
          return (
            <button
              key={obj.id}
              type="button"
              onClick={() => onSelectObject(obj)}
              className={`w-full h-12 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#234978]/15 border-[#234978] ring-2 ring-[#234978]/30 shadow-xs scale-[1.03]'
                  : 'bg-[#fdfbf7] hover:bg-[#efebe3] border-[#dfd8cb] hover:border-[#234978]/40 hover:scale-[1.02] shadow-2xs'
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
