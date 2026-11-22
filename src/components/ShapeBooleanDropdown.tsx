import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { BooleanShapeOp } from '../utils/shapeBooleanOps';

interface ShapeBooleanDropdownProps {
  onSelectOp: (op: BooleanShapeOp) => void;
  shapeCount: number;
}

interface BooleanOpMeta {
  op: BooleanShapeOp;
  label: string;
  subtitle: string;
  badge: string;
}

const BOOLEAN_OPS: BooleanOpMeta[] = [
  {
    op: 'union',
    label: 'Ένωση',
    subtitle: 'Μόνο το εξωτερικό περίγραμμα',
    badge: 'A ∪ B',
  },
  {
    op: 'intersect',
    label: 'Τομή',
    subtitle: 'Μόνο το κοινό μέρος',
    badge: 'A ∩ B',
  },
  {
    op: 'subtract',
    label: 'Αφαίρεση',
    subtitle: 'Κόψε το επάνω από το κάτω',
    badge: 'A \\ B',
  },
  {
    op: 'exclude',
    label: 'Εκτός Τομής',
    subtitle: 'Όλα εκτός του κοινού',
    badge: 'A △ B',
  },
  {
    op: 'divide',
    label: 'Τεμαχισμός',
    subtitle: 'Χωρισμός σε ανεξάρτητα κομμάτια',
    badge: '÷',
  },
];

/** Small crisp 20×20 icon for each Pathfinder operation */
function BooleanOpIcon({ op }: { op: BooleanShapeOp }) {
  const uid = `bicon-${op}`;
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
      <defs>
        <clipPath id={`${uid}-rect`}>
          <rect x="3" y="4" width="12" height="11" rx="1.5" />
        </clipPath>
        <mask id={`${uid}-sub`}>
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle cx="15" cy="14" r="6.2" fill="black" />
        </mask>
        <mask id={`${uid}-excl`}>
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <g clipPath={`url(#${uid}-rect)`}>
            <circle cx="15" cy="14" r="6.2" fill="black" />
          </g>
        </mask>
      </defs>

      {op === 'union' && (
        <g>
          <rect x="3" y="4" width="12" height="11" rx="1.5" fill="#234978" fillOpacity="0.22" stroke="#234978" strokeWidth="1.6" />
          <circle cx="15" cy="14" r="6.2" fill="#234978" fillOpacity="0.22" stroke="#234978" strokeWidth="1.6" />
          {/* Mask internal stroke seams by refilling solid light tint */}
          <rect x="3.8" y="4.8" width="10.4" height="9.4" rx="1" fill="#dbeafe" />
          <circle cx="15" cy="14" r="5.4" fill="#dbeafe" />
        </g>
      )}

      {op === 'intersect' && (
        <g>
          <rect x="3" y="4" width="12" height="11" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2 1.8" />
          <circle cx="15" cy="14" r="6.2" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2 1.8" />
          <g clipPath={`url(#${uid}-rect)`}>
            <circle cx="15" cy="14" r="6.2" fill="#2563eb" fillOpacity="0.72" stroke="#1d4ed8" strokeWidth="1.4" />
          </g>
        </g>
      )}

      {op === 'subtract' && (
        <g>
          <circle cx="15" cy="14" r="6.2" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2 1.8" />
          <rect
            x="3"
            y="4"
            width="12"
            height="11"
            rx="1.5"
            fill="#234978"
            fillOpacity="0.72"
            stroke="#1e293b"
            strokeWidth="1.4"
            mask={`url(#${uid}-sub)`}
          />
        </g>
      )}

      {op === 'exclude' && (
        <g mask={`url(#${uid}-excl)`}>
          <rect x="3" y="4" width="12" height="11" rx="1.5" fill="#234978" fillOpacity="0.68" stroke="#1e293b" strokeWidth="1.4" />
          <circle cx="15" cy="14" r="6.2" fill="#2563eb" fillOpacity="0.68" stroke="#1d4ed8" strokeWidth="1.4" />
        </g>
      )}

      {op === 'divide' && (
        <g>
          <g transform="translate(-1.1, -0.9)">
            <rect x="3" y="4" width="12" height="11" rx="1.5" fill="#475569" fillOpacity="0.45" stroke="#1e293b" strokeWidth="1.3" mask={`url(#${uid}-sub)`} />
          </g>
          <g clipPath={`url(#${uid}-rect)`}>
            <circle cx="15" cy="14" r="6.2" fill="#f59e0b" fillOpacity="0.85" stroke="#b45309" strokeWidth="1.2" />
          </g>
          <g transform="translate(1.2, 1.0)">
            <circle cx="15" cy="14" r="6.2" fill="#2563eb" fillOpacity="0.45" stroke="#1d4ed8" strokeWidth="1.3" mask={`url(#${uid}-excl)`} />
          </g>
        </g>
      )}
    </svg>
  );
}

/** Photoshop-style live animated preview card shown on hover inside the dropdown */
function BooleanPreviewStage({ op }: { op: BooleanShapeOp }) {
  const uid = `bprev-${op}`;
  const meta = BOOLEAN_OPS.find((m) => m.op === op) || BOOLEAN_OPS[0];

  return (
    <div className="mt-1.5 pt-2 border-t border-[#e5dfd3] px-2 pb-1.5">
      <div className="relative rounded-lg bg-[#fdfbf7] border border-[#e5dfd3] overflow-hidden flex items-center justify-between px-2.5 py-2 gap-2">
        <style>{`
          @keyframes bnBoolFadeOut {
            0%, 24% { opacity: 0.78; }
            55%, 88% { opacity: 0.14; }
            100% { opacity: 0.78; }
          }
          @keyframes bnBoolHighlight {
            0%, 24% { opacity: 0.35; transform: scale(1); }
            55%, 88% { opacity: 1; transform: scale(1.03); }
            100% { opacity: 0.35; transform: scale(1); }
          }
          @keyframes bnBoolSplitA {
            0%, 22% { transform: translate(0px, 0px); }
            55%, 85% { transform: translate(-6px, -4px); }
            100% { transform: translate(0px, 0px); }
          }
          @keyframes bnBoolSplitB {
            0%, 22% { transform: translate(0px, 0px); }
            55%, 85% { transform: translate(6px, 4px); }
            100% { transform: translate(0px, 0px); }
          }
          @keyframes bnBoolPulseHole {
            0%, 22% { opacity: 0.72; }
            55%, 85% { opacity: 0.04; }
            100% { opacity: 0.72; }
          }
          @keyframes bnBoolUnionMerge {
            0%, 24% { opacity: 0; }
            55%, 88% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}</style>

        <svg
          key={op}
          width="96"
          height="64"
          viewBox="0 0 110 74"
          className="shrink-0 overflow-visible"
        >
          <defs>
            <clipPath id={`${uid}-rect`}>
              <rect x="14" y="10" width="52" height="38" rx="3" />
            </clipPath>
            <clipPath id={`${uid}-circ`}>
              <circle cx="64" cy="43" r="22" />
            </clipPath>
            <mask id={`${uid}-sub-circ`}>
              <rect x="0" y="0" width="110" height="74" fill="white" />
              <circle cx="64" cy="43" r="22" fill="black" />
            </mask>
            <mask id={`${uid}-sub-rect`}>
              <rect x="0" y="0" width="110" height="74" fill="white" />
              <rect x="14" y="10" width="52" height="38" rx="3" fill="black" />
            </mask>
            <mask id={`${uid}-excl`}>
              <rect x="0" y="0" width="110" height="74" fill="white" />
              <g clipPath={`url(#${uid}-rect)`}>
                <circle cx="64" cy="43" r="22" fill="black" />
              </g>
            </mask>
          </defs>

          {/* Subtle graph paper background inside preview */}
          <g stroke="#e2e8f0" strokeWidth="0.6" opacity="0.7">
            <line x1="0" y1="18" x2="110" y2="18" />
            <line x1="0" y1="36" x2="110" y2="36" />
            <line x1="0" y1="54" x2="110" y2="54" />
            <line x1="22" y1="0" x2="22" y2="74" />
            <line x1="44" y1="0" x2="44" y2="74" />
            <line x1="66" y1="0" x2="66" y2="74" />
            <line x1="88" y1="0" x2="88" y2="74" />
          </g>

          {op === 'union' && (
            <g>
              {/* Initial two separate shapes */}
              <rect x="14" y="10" width="52" height="38" rx="3" fill="#475569" fillOpacity="0.65" stroke="#1e293b" strokeWidth="2" />
              <circle cx="64" cy="43" r="22" fill="#3b82f6" fillOpacity="0.55" stroke="#2563eb" strokeWidth="2" />
              {/* Merged unified silhouette fading in cleanly */}
              <g style={{ animation: 'bnBoolUnionMerge 2.1s ease-in-out infinite' }}>
                <rect x="14" y="10" width="52" height="38" rx="3" fill="#234978" stroke="#0f172a" strokeWidth="2.4" />
                <circle cx="64" cy="43" r="22" fill="#234978" stroke="#0f172a" strokeWidth="2.4" />
                <rect x="15.4" y="11.4" width="49.2" height="35.2" rx="2" fill="#234978" />
                <circle cx="64" cy="43" r="20.6" fill="#234978" />
              </g>
            </g>
          )}

          {op === 'intersect' && (
            <g>
              <g style={{ animation: 'bnBoolFadeOut 2.1s ease-in-out infinite' }}>
                <rect x="14" y="10" width="52" height="38" rx="3" fill="#475569" fillOpacity="0.45" stroke="#475569" strokeWidth="1.6" strokeDasharray="3 2.5" />
                <circle cx="64" cy="43" r="22" fill="#3b82f6" fillOpacity="0.35" stroke="#3b82f6" strokeWidth="1.6" strokeDasharray="3 2.5" />
              </g>
              <g
                clipPath={`url(#${uid}-rect)`}
                style={{ transformOrigin: '54px 36px', animation: 'bnBoolHighlight 2.1s ease-in-out infinite' }}
              >
                <circle cx="64" cy="43" r="22" fill="#2563eb" fillOpacity="0.88" stroke="#1d4ed8" strokeWidth="2.2" />
              </g>
            </g>
          )}

          {op === 'subtract' && (
            <g>
              <rect
                x="14"
                y="10"
                width="52"
                height="38"
                rx="3"
                fill="#334155"
                fillOpacity="0.82"
                stroke="#0f172a"
                strokeWidth="2"
                mask={`url(#${uid}-sub-circ)`}
              />
              <circle
                cx="64"
                cy="43"
                r="22"
                fill="#3b82f6"
                fillOpacity="0.55"
                stroke="#2563eb"
                strokeWidth="1.8"
                strokeDasharray="3 2.5"
                style={{ animation: 'bnBoolFadeOut 2.1s ease-in-out infinite' }}
              />
            </g>
          )}

          {op === 'exclude' && (
            <g>
              <g mask={`url(#${uid}-excl)`}>
                <rect x="14" y="10" width="52" height="38" rx="3" fill="#334155" fillOpacity="0.78" stroke="#0f172a" strokeWidth="2" />
                <circle cx="64" cy="43" r="22" fill="#2563eb" fillOpacity="0.72" stroke="#1d4ed8" strokeWidth="2" />
              </g>
              <g clipPath={`url(#${uid}-rect)`} style={{ animation: 'bnBoolPulseHole 2.1s ease-in-out infinite' }}>
                <circle cx="64" cy="43" r="22" fill="#2563eb" fillOpacity="0.7" />
              </g>
            </g>
          )}

          {op === 'divide' && (
            <g>
              <g style={{ animation: 'bnBoolSplitA 2.2s ease-in-out infinite' }}>
                <rect
                  x="14"
                  y="10"
                  width="52"
                  height="38"
                  rx="3"
                  fill="#475569"
                  fillOpacity="0.72"
                  stroke="#0f172a"
                  strokeWidth="1.8"
                  mask={`url(#${uid}-sub-circ)`}
                />
              </g>
              <g clipPath={`url(#${uid}-rect)`}>
                <circle cx="64" cy="43" r="22" fill="#f59e0b" fillOpacity="0.85" stroke="#b45309" strokeWidth="1.8" />
              </g>
              <g style={{ animation: 'bnBoolSplitB 2.2s ease-in-out infinite' }}>
                <circle
                  cx="64"
                  cy="43"
                  r="22"
                  fill="#3b82f6"
                  fillOpacity="0.65"
                  stroke="#1d4ed8"
                  strokeWidth="1.8"
                  mask={`url(#${uid}-sub-rect)`}
                />
              </g>
            </g>
          )}
        </svg>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#1b2a4a]">{meta.label}</span>
            <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-[#ece7dc] text-[#234978]">
              {meta.badge}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{meta.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export const ShapeBooleanDropdown: React.FC<ShapeBooleanDropdownProps> = ({
  onSelectOp,
  shapeCount,
}) => {
  const [open, setOpen] = useState(false);
  const [hoveredOp, setHoveredOp] = useState<BooleanShapeOp>('union');
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
        title={`Συνδυασμός ${shapeCount} επιλεγμένων σχημάτων (Ένωση, Τομή, Αφαίρεση, Εκτός Τομής, Τεμαχισμός)`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" className="shrink-0">
          <rect
            x="3"
            y="4"
            width="11.5"
            height="10.5"
            rx="1.5"
            fill="currentColor"
            fillOpacity={open ? '0.28' : '0.18'}
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="15"
            cy="14"
            r="6"
            fill="currentColor"
            fillOpacity={open ? '0.42' : '0.32'}
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        <span>Συνδυασμός</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-[#f7f4ee] border border-[#dfd8cb] shadow-xl py-1.5 z-[120]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="px-3 pb-1 mb-1 border-b border-[#e5dfd3] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Συνδυασμός ({shapeCount} σχήματα)
            </span>
          </div>

          <div className="px-1.5 flex flex-col gap-0.5">
            {BOOLEAN_OPS.map((item) => {
              const isHover = hoveredOp === item.op;
              return (
                <button
                  key={item.op}
                  type="button"
                  onMouseEnter={() => setHoveredOp(item.op)}
                  onFocus={() => setHoveredOp(item.op)}
                  onClick={() => {
                    setOpen(false);
                    onSelectOp(item.op);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition cursor-pointer ${
                    isHover
                      ? 'bg-[#e8e2d5] text-[#1b2a4a]'
                      : 'hover:bg-[#ece7dc] text-[#2c3e50]'
                  }`}
                >
                  <BooleanOpIcon op={item.op} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold">{item.label}</span>
                      <span className="text-[9.5px] font-medium text-slate-400">{item.badge}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <BooleanPreviewStage op={hoveredOp} />
        </div>
      )}
    </div>
  );
};
