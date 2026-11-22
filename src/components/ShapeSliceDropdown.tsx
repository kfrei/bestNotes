import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Scissors, X } from 'lucide-react';
import type { EqualSlicePreset } from '../utils/shapeSliceOps';

export type SliceHoverPreview = 'knife' | EqualSlicePreset;

interface ShapeSliceDropdownProps {
  isKnifeActive: boolean;
  onStartKnifeCut: () => void;
  onCancelKnifeCut: () => void;
  onSelectEqualSlice: (preset: EqualSlicePreset) => void;
}

const EQUAL_PART_BUTTONS: { preset: 2 | 3 | 4 | 6 | 8; fraction: string; label: string }[] = [
  { preset: 2, fraction: '½', label: '2' },
  { preset: 3, fraction: '⅓', label: '3' },
  { preset: 4, fraction: '¼', label: '4' },
  { preset: 6, fraction: '⅙', label: '6' },
  { preset: 8, fraction: '⅛', label: '8' },
];

function SlicePreviewStage({ mode }: { mode: SliceHoverPreview }) {
  const cx = 52;
  const cy = 33;
  const r = 21;

  const describeWedge = (startDeg: number, endDeg: number, rad = r) => {
    const a0 = (startDeg * Math.PI) / 180;
    const a1 = (endDeg * Math.PI) / 180;
    const x0 = cx + Math.cos(a0) * rad;
    const y0 = cy + Math.sin(a0) * rad;
    const x1 = cx + Math.cos(a1) * rad;
    const y1 = cy + Math.sin(a1) * rad;
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${rad} ${rad} 0 ${largeArc} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`;
  };

  const titleMap: Record<SliceHoverPreview, { title: string; badge: string; desc: string }> = {
    knife: {
      title: 'Μαχαίρι',
      badge: 'Γραμμή / Γωνία',
      desc: 'Σύρε 1 γραμμή ή γωνία πάνω στο σχήμα για ελεύθερο κόψιμο',
    },
    'quarter-split': {
      title: 'Τέταρτο (¼ + ¾)',
      badge: '1 Κλικ',
      desc: 'Κόβει και βγάζει έξω 1 τέταρτο (¼), αφήνοντας τα ¾',
    },
    2: { title: '2 Ίσα Κομμάτια', badge: '½', desc: 'Κόβει το σχήμα σε 2 ανεξάρτητα μισά' },
    3: { title: '3 Ίσα Κομμάτια', badge: '⅓', desc: 'Κόβει το σχήμα σε 3 ίσα τρίτα' },
    4: { title: '4 Ίσα Κομμάτια', badge: '¼', desc: 'Κόβει το σχήμα σε 4 ίσα τέταρτα' },
    6: { title: '6 Ίσα Κομμάτια', badge: '⅙', desc: 'Κόβει το σχήμα σε 6 ίσα έκτα' },
    8: { title: '8 Ίσα Κομμάτια', badge: '⅛', desc: 'Κόβει το σχήμα σε 8 ίσα όγδοα' },
  };
  const info = titleMap[mode];

  return (
    <div className="mt-1.5 pt-2 border-t border-[#e5dfd3] px-2 pb-1.5">
      <div className="rounded-lg bg-[#fdfbf7] border border-[#e5dfd3] overflow-hidden flex items-center justify-between px-2.5 py-2 gap-2.5">
        <style>{`
          @keyframes slKnifeLine {
            0%, 15% { stroke-dashoffset: 80; }
            48%, 85% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 80; }
          }
          @keyframes slHalfLeft {
            0%, 42% { transform: translate(0px, 0px); }
            68%, 88% { transform: translate(-4px, -2px); }
            100% { transform: translate(0px, 0px); }
          }
          @keyframes slHalfRight {
            0%, 42% { transform: translate(0px, 0px); }
            68%, 88% { transform: translate(4px, 2px); }
            100% { transform: translate(0px, 0px); }
          }
          @keyframes slQuarterOut {
            0%, 24% { transform: translate(0px, 0px); }
            55%, 86% { transform: translate(-6px, -6px); }
            100% { transform: translate(0px, 0px); }
          }
          @keyframes slPiePop {
            0%, 22% { transform: scale(1); }
            55%, 86% { transform: scale(1.06); }
            100% { transform: scale(1); }
          }
        `}</style>

        <svg key={String(mode)} width="92" height="58" viewBox="0 0 104 66" className="shrink-0 overflow-visible rounded-lg bg-white border border-slate-200/70">
          <g stroke="#e2e8f0" strokeWidth="0.6" opacity="0.65">
            <line x1="0" y1="16" x2="104" y2="16" />
            <line x1="0" y1="33" x2="104" y2="33" />
            <line x1="0" y1="50" x2="104" y2="50" />
            <line x1="26" y1="0" x2="26" y2="66" />
            <line x1="52" y1="0" x2="52" y2="66" />
            <line x1="78" y1="0" x2="78" y2="66" />
          </g>

          {mode === 'knife' && (
            <g>
              <g style={{ animation: 'slHalfLeft 2.2s ease-in-out infinite' }}>
                <path d={describeWedge(130, 310)} fill="#3b82f6" fillOpacity="0.45" stroke="#1d4ed8" strokeWidth="1.7" />
              </g>
              <g style={{ animation: 'slHalfRight 2.2s ease-in-out infinite' }}>
                <path d={describeWedge(-50, 130)} fill="#3b82f6" fillOpacity="0.45" stroke="#1d4ed8" strokeWidth="1.7" />
              </g>
              <line
                x1="28"
                y1="54"
                x2="76"
                y2="12"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="80"
                strokeLinecap="round"
                style={{ animation: 'slKnifeLine 2.2s ease-in-out infinite' }}
              />
            </g>
          )}

          {mode === 'quarter-split' && (
            <g>
              <path d={describeWedge(-90, 180)} fill="#3b82f6" fillOpacity="0.48" stroke="#1d4ed8" strokeWidth="1.8" />
              <g style={{ animation: 'slQuarterOut 2.2s ease-in-out infinite' }}>
                <path d={describeWedge(180, 270)} fill="#2563eb" fillOpacity="0.65" stroke="#1d4ed8" strokeWidth="1.8" />
              </g>
            </g>
          )}

          {typeof mode === 'number' && (
            <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'slPiePop 2.2s ease-in-out infinite' }}>
              {Array.from({ length: mode }, (_, idx) => {
                const step = 360 / mode;
                const a0 = -90 + idx * step;
                const a1 = a0 + step;
                const midRad = (((a0 + a1) * 0.5) * Math.PI) / 180;
                const shift = 2.4;
                const tx = (Math.cos(midRad) * shift).toFixed(1);
                const ty = (Math.sin(midRad) * shift).toFixed(1);
                return (
                  <path
                    key={idx}
                    d={describeWedge(a0, a1, r - 1)}
                    transform={`translate(${tx}, ${ty})`}
                    fill={idx === 0 ? '#2563eb' : '#60a5fa'}
                    fillOpacity={idx === 0 ? '0.68' : '0.38'}
                    stroke="#1d4ed8"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          )}
        </svg>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#1b2a4a] truncate">{info.title}</span>
            <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-[#ece7dc] text-[#234978] shrink-0">
              {info.badge}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{info.desc}</p>
        </div>
      </div>
    </div>
  );
}

export const ShapeSliceDropdown: React.FC<ShapeSliceDropdownProps> = ({
  isKnifeActive,
  onStartKnifeCut,
  onCancelKnifeCut,
  onSelectEqualSlice,
}) => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<SliceHoverPreview>('quarter-split');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('pointerdown', handleOutside);
    return () => window.removeEventListener('pointerdown', handleOutside);
  }, [open]);

  if (isKnifeActive) {
    return (
      <button
        type="button"
        onClick={onCancelKnifeCut}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 text-xs font-bold shadow-xs transition cursor-pointer animate-pulse"
        title="Σύρε 1 γραμμή ή γωνία πάνω στο σχήμα για να το κόψεις! (Κλικ εδώ για ακύρωση)"
      >
        <Scissors className="w-3.5 h-3.5" />
        <span>Σύρε γραμμή κοπής</span>
        <X className="w-3.5 h-3.5 opacity-85" />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-2xs ${
          open
            ? 'bg-[#234978] text-white border-[#1b3a60]'
            : 'bg-[#ece7dc] hover:bg-[#e3ddd0] text-[#1b2a4a] border-[#dfd8cb]'
        }`}
        title="Κόψιμο σχήματος (Μαχαίρι με γραμμή/γωνία ή 1-κλικ Ίσα Κομμάτια / Κλάσματα)"
      >
        <Scissors className="w-3.5 h-3.5" />
        <span>Κόψιμο</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1.5 w-[272px] rounded-xl bg-[#f7f4ee] border border-[#dfd8cb] shadow-xl py-1.5 z-[120]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="px-3 pb-1 mb-1 border-b border-[#e5dfd3]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Κόψιμο Σχήματος
            </span>
          </div>

          <div className="px-1.5 flex flex-col gap-1">
            {/* 1. Freehand Knife Cut */}
            <button
              type="button"
              onMouseEnter={() => setHovered('knife')}
              onFocus={() => setHovered('knife')}
              onClick={() => {
                setOpen(false);
                onStartKnifeCut();
              }}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition cursor-pointer ${
                hovered === 'knife' ? 'bg-[#e8e2d5] text-[#1b2a4a]' : 'hover:bg-[#ece7dc] text-[#2c3e50]'
              }`}
            >
              <span className="w-6 h-6 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Scissors className="w-3.5 h-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">Μαχαίρι (Γραμμή / Γωνία)</div>
                <div className="text-[10px] text-slate-500 truncate">Σύρε γραμμή πάνω στο σχήμα</div>
              </div>
            </button>

            {/* 2. 1-Click Iconic ¼ + ¾ Split */}
            <button
              type="button"
              onMouseEnter={() => setHovered('quarter-split')}
              onFocus={() => setHovered('quarter-split')}
              onClick={() => {
                setOpen(false);
                onSelectEqualSlice('quarter-split');
              }}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition cursor-pointer ${
                hovered === 'quarter-split' ? 'bg-[#e8e2d5] text-[#1b2a4a]' : 'hover:bg-[#ece7dc] text-[#2c3e50]'
              }`}
            >
              <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-[#234978] font-bold text-[11px] shrink-0">
                ¼
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">Βγάλε Τέταρτο (¼ + ¾)</div>
                <div className="text-[10px] text-slate-500 truncate">Αποκόπτει ¼ έξω σε 1 κλικ</div>
              </div>
            </button>

            {/* 3. Equal Fractions Row: 2, 3, 4, 6, 8 */}
            <div className="px-1.5 pt-1">
              <div className="text-[10px] font-semibold text-slate-500 mb-1">
                Ίσα Κομμάτια (Κλάσματα):
              </div>
              <div className="grid grid-cols-5 gap-1">
                {EQUAL_PART_BUTTONS.map((btn) => (
                  <button
                    key={btn.preset}
                    type="button"
                    onMouseEnter={() => setHovered(btn.preset)}
                    onFocus={() => setHovered(btn.preset)}
                    onClick={() => {
                      setOpen(false);
                      onSelectEqualSlice(btn.preset);
                    }}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-lg border text-center transition cursor-pointer ${
                      hovered === btn.preset
                        ? 'bg-[#234978] text-white border-[#1b3a60] shadow-2xs'
                        : 'bg-[#fdfbf7] hover:bg-[#ece7dc] text-[#1b2a4a] border-[#dfd8cb]'
                    }`}
                    aria-label={`Κόψιμο σε ${btn.label} ίσα κομμάτια (${btn.fraction})`}
                  >
                    <span className="text-xs font-bold leading-none">{btn.fraction}</span>
                    <span className={`text-[9px] mt-0.5 ${hovered === btn.preset ? 'text-blue-100' : 'text-slate-500'}`}>
                      {btn.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SlicePreviewStage mode={hovered} />
        </div>
      )}
    </div>
  );
};
