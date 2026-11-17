import React, { useEffect, useRef, useState } from 'react';

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
  sourceTitle?: string;
  sourceBadgeColor?: 'blue' | 'amber' | 'emerald';
  storagePrefix?: string;
  ambientTemperature?: number;
  onSetAmbientTemperature?: (temp: number) => void;
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

function getAmbientColor(tempC: number): string {
  if (tempC <= 12) return '#0284c7'; // Cool sky blue
  if (tempC <= 26) return '#10b981'; // Temperate emerald green
  if (tempC <= 38) return '#f59e0b'; // Warm amber
  return '#ef4444'; // Hot coral red
}

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
  sourceTitle,
  sourceBadgeColor = 'blue',
  storagePrefix,
  ambientTemperature,
  onSetAmbientTemperature,
}) => {
  const widthKey = storagePrefix ? `bestnotes_stopwatch_${storagePrefix}_width_v1` : 'bestnotes_stopwatch_width_v1';
  const posKey = storagePrefix ? `bestnotes_stopwatch_${storagePrefix}_pos_v1` : 'bestnotes_stopwatch_pos_v1';
  const customKey = storagePrefix ? `bestnotes_stopwatch_${storagePrefix}_customized_v1` : 'bestnotes_stopwatch_customized_v1';

  const [showAmbientPopover, setShowAmbientPopover] = useState(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showAmbientPopover) return;
    const handleOutside = (e: PointerEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setShowAmbientPopover(false);
      }
    };
    window.addEventListener('pointerdown', handleOutside, true);
    return () => window.removeEventListener('pointerdown', handleOutside, true);
  }, [showAmbientPopover]);

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

  const hasAmbientStrip =
    typeof ambientTemperature === 'number' && typeof onSetAmbientTemperature === 'function';
  const currentAmbient = ambientTemperature ?? 20;
  const ambientFrac = Math.max(0.06, Math.min(1, currentAmbient / 50));
  const ambientColor = getAmbientColor(currentAmbient);

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
        localStorage.setItem(widthKey, String(nextW));
        localStorage.setItem(posKey, JSON.stringify({ x: nextX, y: pos.y }));
        localStorage.setItem(customKey, 'true');
      } catch {}
    } else {
      const dx = e.clientX - rz.startX;
      const dy = e.clientY - rz.startY;
      const delta = Math.round((dx + dy) / 2);
      const nextW = Math.max(minW, Math.min(maxW, rz.origW + delta));

      onWidthChange(nextW);

      try {
        localStorage.setItem(widthKey, String(nextW));
        localStorage.setItem(customKey, 'true');
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

  // Position the Liquid Glass popover above the stopwatch if near the bottom of the screen, or to the right/below
  const openAbove = typeof window !== 'undefined' && pos.y > window.innerHeight - 280;

  return (
    <div
      ref={widgetRef}
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
      className="ipados-liquid-glass bg-[#fdfbf7]/98 backdrop-blur-2xl border border-[#dfd8cb] shadow-[0_20px_45px_-8px_rgba(0,0,0,0.22),0_4px_16px_-2px_rgba(0,0,0,0.08)] select-none text-[#1e293b] space-y-2"
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
            localStorage.setItem(posKey, JSON.stringify(nextPos));
            localStorage.setItem(customKey, 'true');
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
          {sourceTitle && (
            <span
              style={{ fontSize: `${Math.max(8.5, Math.round(9.5 * swScale))}px` }}
              className={`font-black px-1.5 py-0.5 rounded-md border tracking-tight shadow-2xs ${
                sourceBadgeColor === 'amber'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-blue-100 text-[#234978] border-blue-200'
              }`}
            >
              {sourceTitle}
            </span>
          )}
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

      {/* Main Content Row: Left = LCD + Play/Reset Buttons, Right = Thin Vertical Ambient Thermometer Strip */}
      <div className="flex items-stretch gap-2">
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
          {/* LCD Screen: Signature Dark Navy Blue (#132644) Background */}
          <div
            style={{
              backgroundColor: '#132644',
              borderColor: 'rgba(35, 73, 120, 0.65)',
              padding: `${Math.round(7 * swScale)}px ${Math.round(8 * swScale)}px`,
              borderRadius: `${Math.round(12 * swScale)}px`,
            }}
            className="border shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] text-center"
          >
            <span
              style={{ fontSize: `${Math.round((hasAmbientStrip ? 22 : 24) * swScale)}px` }}
              className="font-mono font-black tracking-widest text-white drop-shadow-xs"
            >
              {formatStopwatchDisplay(elapsedMs)}
            </span>
            <div
              style={{ fontSize: `${Math.max(7.5, Math.round(8.5 * swScale))}px` }}
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
                padding: `${Math.round(6 * swScale)}px ${Math.round(6 * swScale)}px`,
                borderRadius: `${Math.round(10 * swScale)}px`,
                fontSize: `${Math.max(9.5, Math.round(11.5 * swScale))}px`,
              }}
              className={`font-bold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer truncate ${
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
                padding: `${Math.round(6 * swScale)}px ${Math.round(6 * swScale)}px`,
                borderRadius: `${Math.round(10 * swScale)}px`,
                fontSize: `${Math.max(9.5, Math.round(11.5 * swScale))}px`,
              }}
              className="bg-[#efebe3] hover:bg-[#e4ded2] text-[#2c3e50] border border-[#dfd8cb] font-bold flex items-center justify-center gap-1 transition cursor-pointer truncate"
            >
              ↺ Μηδεν.
            </button>
          </div>
        </div>

        {/* Thin Vertical Ambient Thermometer Strip inside Stopwatch Frame */}
        {hasAmbientStrip && (
          <button
            type="button"
            onClick={() => setShowAmbientPopover((v) => !v)}
            style={{
              width: `${Math.max(32, Math.round(36 * swScale))}px`,
              borderRadius: `${Math.round(11 * swScale)}px`,
              padding: `${Math.round(4 * swScale)}px ${Math.round(3 * swScale)}px`,
            }}
            className={`shrink-0 flex flex-col items-center justify-between border transition cursor-pointer group ${
              showAmbientPopover
                ? 'bg-sky-50/95 border-[#234978] ring-2 ring-[#234978]/20 shadow-xs'
                : 'bg-[#f4f0e8]/90 hover:bg-white border-[#dfd8cb] hover:border-[#234978]/50 shadow-2xs'
            }`}
            title={`Θερμοκρασία Περιβάλλοντος: ${currentAmbient} °C — Κάνε κλικ για ρύθμιση`}
          >
            {/* Top Digital Readout */}
            <span
              style={{
                fontSize: `${Math.max(8.5, Math.round(9.5 * swScale))}px`,
                color: ambientColor,
              }}
              className="font-extrabold tracking-tight leading-none tabular-nums"
            >
              {currentAmbient}°
            </span>

            {/* Vertical Glass Thermometer Tube & Bulb */}
            <div className="relative flex-1 w-full flex items-center justify-center my-1">
              <div
                style={{ width: `${Math.max(6, Math.round(7 * swScale))}px` }}
                className="relative h-full rounded-full bg-white/95 border border-slate-400/80 shadow-inner overflow-hidden flex flex-col justify-end"
              >
                <div
                  style={{
                    height: `${Math.round(ambientFrac * 100)}%`,
                    background: `linear-gradient(to top, #2563eb, ${ambientColor})`,
                  }}
                  className="w-full rounded-t-full transition-all duration-200"
                />
              </div>
              {/* Calibration tick hairlines on right side of stem */}
              <div
                style={{ right: `${Math.max(4, Math.round(5 * swScale))}px` }}
                className="absolute inset-y-1 flex flex-col justify-between pointer-events-none opacity-45"
              >
                <span className="w-1 h-[1px] bg-slate-600 block" />
                <span className="w-1.5 h-[1px] bg-slate-700 block" />
                <span className="w-1 h-[1px] bg-slate-600 block" />
              </div>
              {/* Bottom Thermometer Bulb */}
              <div
                style={{
                  width: `${Math.max(11, Math.round(12.5 * swScale))}px`,
                  height: `${Math.max(11, Math.round(12.5 * swScale))}px`,
                  bottom: `-${Math.round(2 * swScale)}px`,
                  background: `radial-gradient(circle at 35% 35%, #60a5fa, ${ambientColor})`,
                }}
                className="absolute rounded-full border border-slate-500/80 shadow-2xs"
              />
            </div>

            {/* Subtle Bottom Label */}
            <span
              style={{ fontSize: `${Math.max(6.5, Math.round(7.5 * swScale))}px` }}
              className="font-bold uppercase tracking-tighter text-slate-500 group-hover:text-[#234978] leading-none pt-0.5"
            >
              Περιβ.
            </span>
          </button>
        )}
      </div>

      {/* Compact iPadOS Liquid Glass Popover Window for Ambient Temperature */}
      {hasAmbientStrip && showAmbientPopover && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: 0,
            width: `${Math.max(236, width)}px`,
            ...(openAbove
              ? { bottom: 'calc(100% + 10px)' }
              : { top: 'calc(100% + 10px)' }),
            zIndex: 10001,
          }}
          className="ipados-liquid-glass bg-[#fdfbf7]/88 backdrop-blur-2xl backdrop-saturate-200 border border-white/90 rounded-2xl shadow-[0_20px_48px_-10px_rgba(15,23,42,0.26),0_4px_16px_-2px_rgba(15,23,42,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/5 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: `${ambientColor}18`, borderColor: `${ambientColor}40` }}
                className="w-7 h-7 rounded-xl flex items-center justify-center border shadow-2xs"
              >
                <span className="text-xs">🌡️</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  Περιβάλλον
                </span>
                <span className="font-extrabold text-[11.5px] text-[#1e293b]">
                  Θερμοκρασία Περιβάλλοντος
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span
                style={{ color: ambientColor, borderColor: `${ambientColor}45` }}
                className="py-0.5 px-2 rounded-lg font-black text-xs bg-white/90 border shadow-2xs tabular-nums"
              >
                {currentAmbient} °C
              </span>
              <button
                type="button"
                onClick={() => setShowAmbientPopover(false)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-slate-700 hover:bg-black/5 transition cursor-pointer"
                title="Κλείσιμο"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Slider + Fine -/+ Step Controls */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSetAmbientTemperature?.(Math.max(0, currentAmbient - 1))}
                className="w-6 h-6 rounded-lg bg-white/85 hover:bg-white border border-slate-200/90 text-slate-700 font-bold text-xs flex items-center justify-center shadow-2xs cursor-pointer transition"
                title="Μείωση κατά 1 °C"
              >
                −
              </button>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={currentAmbient}
                onChange={(e) => onSetAmbientTemperature?.(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200/90 rounded-lg appearance-none cursor-pointer accent-[#234978]"
              />
              <button
                type="button"
                onClick={() => onSetAmbientTemperature?.(Math.min(50, currentAmbient + 1))}
                className="w-6 h-6 rounded-lg bg-white/85 hover:bg-white border border-slate-200/90 text-slate-700 font-bold text-xs flex items-center justify-center shadow-2xs cursor-pointer transition"
                title="Αύξηση κατά 1 °C"
              >
                +
              </button>
            </div>

            {/* Quick Preset Pills */}
            <div className="flex justify-between gap-1 pt-0.5 select-none">
              {[0, 10, 20, 25, 30, 40, 50].map((t) => {
                const isSelected = currentAmbient === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onSetAmbientTemperature?.(t)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#234978] text-white shadow-2xs'
                        : 'bg-white/75 hover:bg-white text-slate-600 hover:text-[#234978] border border-slate-200/70'
                    }`}
                    title={`Ορισμός σε ${t} °C`}
                  >
                    {t}°
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
