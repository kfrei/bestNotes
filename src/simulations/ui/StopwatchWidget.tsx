import React, { useRef } from 'react';

export interface StopwatchWidgetProps {
  pos: { x: number; y: number };
  width: number;
  running: boolean;
  elapsedMs: number;
  onPosChange: (pos: { x: number; y: number }) => void;
  onWidthChange: (width: number) => void;
  onClose: () => void;
  onTogglePlayPause: () => void;
  onReset: () => void;
  className?: string;
}

export const formatStopwatchDisplay = (elapsedMs: number): string => {
  const totalDecis = Math.floor(elapsedMs / 100);
  const decis = totalDecis % 10;
  const totalSec = Math.floor(totalDecis / 10);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  const mm = String(min).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return `${mm}:${ss}.${decis}`;
};

export const StopwatchWidget: React.FC<StopwatchWidgetProps> = ({
  pos,
  width,
  running,
  elapsedMs,
  onPosChange,
  onWidthChange,
  onClose,
  onTogglePlayPause,
  onReset,
}) => {
  const dragRef = useRef<{
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const resizeRef = useRef<{
    corner: 'br' | 'bl';
    startX: number;
    startY: number;
    origW: number;
    origX: number;
  } | null>(null);

  const swScale = Math.max(0.75, Math.min(1.85, width / 260));
  const padPx = Math.max(6, Math.min(18, Math.round(10 * swScale)));
  const radiusPx = Math.max(12, Math.min(28, Math.round(18 * swScale)));

  const startResize = (e: React.PointerEvent<HTMLDivElement>, corner: 'br' | 'bl') => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = {
      corner,
      startX: e.clientX,
      startY: e.clientY,
      origW: width,
      origX: pos.x,
    };
  };

  const moveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const rz = resizeRef.current;
    if (!rz) return;
    const minW = 220;
    const maxW = 600;

    if (rz.corner === 'bl') {
      const dx = e.clientX - rz.startX;
      const dy = e.clientY - rz.startY;
      const delta = Math.round((-dx + dy) / 2);
      const nextW = Math.max(minW, Math.min(maxW, rz.origW + delta));
      const rightEdge = rz.origX + rz.origW;
      const nextX = Math.max(8, rightEdge - nextW);

      onWidthChange(nextW);
      onPosChange({ x: nextX, y: pos.y });

      try {
        localStorage.setItem('bestnotes_stopwatch_width_v1', String(nextW));
        localStorage.setItem('bestnotes_stopwatch_pos_v1', JSON.stringify({ x: nextX, y: pos.y }));
        localStorage.setItem('bestnotes_stopwatch_customized_v1', 'true');
      } catch {}
    } else {
      const dx = e.clientX - rz.startX;
      const dy = e.clientY - rz.startY;
      const delta = Math.round((dx + dy) / 2);
      const nextW = Math.max(minW, Math.min(maxW, rz.origW + delta));

      onWidthChange(nextW);

      try {
        localStorage.setItem('bestnotes_stopwatch_width_v1', String(nextW));
        localStorage.setItem('bestnotes_stopwatch_customized_v1', 'true');
      } catch {}
    }
  };

  const endResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    resizeRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div
      data-ui-panel="true"
      data-popover-panel="stopwatch"
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 9999,
        width: `${width}px`,
        padding: `${padPx}px`,
        borderRadius: `${radiusPx}px`,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="ipados-liquid-glass bg-[#fdfbf7]/98 backdrop-blur-2xl border border-[#dfd8cb] shadow-[0_20px_45px_-8px_rgba(0,0,0,0.22),0_4px_16px_-2px_rgba(0,0,0,0.08)] select-none text-[#1e293b] space-y-2.5"
    >
      {/* Drag Header */}
      <div
        onPointerDown={(e) => {
          if (
            (e.target as HTMLElement).closest('button') ||
            (e.target as HTMLElement).closest('[data-sw-resize="true"]')
          ) {
            return;
          }
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          dragRef.current = {
            startClientX: e.clientX,
            startClientY: e.clientY,
            origX: pos.x,
            origY: pos.y,
          };
        }}
        onPointerMove={(e) => {
          const drag = dragRef.current;
          if (!drag) return;
          const nextX = Math.max(
            8,
            Math.min(window.innerWidth - width - 8, drag.origX + (e.clientX - drag.startClientX))
          );
          const nextY = Math.max(
            8,
            Math.min(window.innerHeight - 120, drag.origY + (e.clientY - drag.startClientY))
          );
          const nextPos = { x: nextX, y: nextY };
          onPosChange(nextPos);
          try {
            localStorage.setItem('bestnotes_stopwatch_pos_v1', JSON.stringify(nextPos));
            localStorage.setItem('bestnotes_stopwatch_customized_v1', 'true');
          } catch {}
        }}
        onPointerUp={(e) => {
          dragRef.current = null;
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {}
        }}
        className="flex items-center justify-between cursor-grab active:cursor-grabbing pb-1 border-b border-[#dfd8cb]/60"
      >
        <div
          className="flex items-center gap-1.5 font-bold text-[#1e293b]"
          style={{ fontSize: `${Math.max(10, Math.round(12 * swScale))}px` }}
        >
          <span style={{ fontSize: `${Math.round(14 * swScale)}px` }}>⏱️</span>
          <span>Χρονόμετρο</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: `${Math.round(20 * swScale)}px`,
            height: `${Math.round(20 * swScale)}px`,
            fontSize: `${Math.max(9, Math.round(11 * swScale))}px`,
          }}
          className="flex items-center justify-center rounded-full hover:bg-[#efebe3] text-[#64748b] hover:text-[#0f172a] font-bold transition cursor-pointer"
          title="Κλείσιμο χρονομέτρου"
        >
          ✕
        </button>
      </div>

      {/* LCD Screen: Signature Dark Navy Blue (#132644) Background */}
      <div
        style={{
          backgroundColor: '#132644',
          borderColor: 'rgba(35, 73, 120, 0.65)',
          padding: `${Math.round(7 * swScale)}px ${Math.round(10 * swScale)}px`,
          borderRadius: `${Math.round(12 * swScale)}px`,
        }}
        className="border shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] text-center"
      >
        <span
          style={{ fontSize: `${Math.round(24 * swScale)}px` }}
          className="font-mono font-black tracking-widest text-white drop-shadow-xs"
        >
          {formatStopwatchDisplay(elapsedMs)}
        </span>
        <div
          style={{ fontSize: `${Math.max(8, Math.round(9 * swScale))}px` }}
          className="text-[#93c5fd]/70 font-mono tracking-wider mt-0.5"
        >
          ΛΕΠ : ΔΕΥΤ . ΔΕΚ
        </div>
      </div>

      {/* Buttons: Play/Pause and Reset */}
      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={onTogglePlayPause}
          style={{
            padding: `${Math.round(6 * swScale)}px ${Math.round(8 * swScale)}px`,
            borderRadius: `${Math.round(10 * swScale)}px`,
            fontSize: `${Math.max(10, Math.round(12 * swScale))}px`,
          }}
          className={`font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer ${
            running
              ? 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
              : 'bg-[#234978] hover:bg-[#1c3c63] text-white'
          }`}
        >
          {running
            ? '❚❚ Παύση'
            : elapsedMs > 0
            ? '▶ Συνέχεια'
            : '▶ Έναρξη'}
        </button>
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: `${Math.round(6 * swScale)}px ${Math.round(8 * swScale)}px`,
            borderRadius: `${Math.round(10 * swScale)}px`,
            fontSize: `${Math.max(10, Math.round(12 * swScale))}px`,
          }}
          className="bg-[#efebe3] hover:bg-[#e4ded2] text-[#2c3e50] border border-[#dfd8cb] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
        >
          ↺ Μηδεν.
        </button>
      </div>

      {/* Bottom-Left Uniform Resize Handle */}
      <div
        data-sw-resize="true"
        onPointerDown={(e) => startResize(e, 'bl')}
        onPointerMove={moveResize}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        className="absolute -bottom-1 -left-1 w-5 h-5 cursor-sw-resize flex items-end justify-start p-1 text-[#94a3b8] hover:text-[#234978] transition"
        title="Σύρετε για ομοιόμορφη αλλαγή μεγέθους"
      >
        <svg width="9" height="9" viewBox="0 0 9 9" className="opacity-70 hover:opacity-100">
          <path
            d="M1 2 L7 8 M1 5 L4 8 M1 8 L1 8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Bottom-Right Uniform Resize Handle */}
      <div
        data-sw-resize="true"
        onPointerDown={(e) => startResize(e, 'br')}
        onPointerMove={moveResize}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        className="absolute -bottom-1 -right-1 w-5 h-5 cursor-se-resize flex items-end justify-end p-1 text-[#94a3b8] hover:text-[#234978] transition"
        title="Σύρετε για ομοιόμορφη αλλαγή μεγέθους"
      >
        <svg width="9" height="9" viewBox="0 0 9 9" className="opacity-70 hover:opacity-100">
          <path
            d="M8 2 L2 8 M8 5 L5 8 M8 8 L8 8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
