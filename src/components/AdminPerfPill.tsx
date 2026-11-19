import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  PauseCircle,
  Gauge,
  Cpu,
  Layers,
  AlertTriangle,
  ExternalLink,
  GripHorizontal,
  X,
} from 'lucide-react';
import { getPerfSnapshot, resetPerfPeaks, type PerfSnapshot } from '../utils/perfTelemetry';

export interface AdminPerfPillProps {
  openTabsCount: number;
  activePageCount: number;
  activePageStrokeCount: number;
  onPauseAllSimulations: () => void;
  onOpenAdminPerfTab: () => void;
}

const PANEL_WIDTH = 344;

export const AdminPerfPill: React.FC<AdminPerfPillProps> = ({
  openTabsCount,
  activePageCount,
  activePageStrokeCount,
  onPauseAllSimulations,
  onOpenAdminPerfTab,
}) => {
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState<PerfSnapshot>(() => getPerfSnapshot(false));

  // Floating panel position — starts cleanly BELOW both top toolbars (y = 112) on the right
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    return { x: Math.max(16, w - PANEL_WIDTH - 16), y: 112 };
  });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Sample every 1.5s (0 RAF loops, paused when tab is hidden) so 5-min history builds continuously
  useEffect(() => {
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setSnap(getPerfSnapshot(true));
    };
    tick();
    const id = window.setInterval(tick, 1500);
    return () => window.clearInterval(id);
  }, []);

  // Keep panel inside viewport on window resize
  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      setPos((p) => ({
        x: Math.max(8, Math.min(window.innerWidth - PANEL_WIDTH - 8, p.x)),
        y: Math.max(56, Math.min(window.innerHeight - 120, p.y)),
      }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement)?.closest('button')) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
  };

  const handleDragPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const maxX = Math.max(8, window.innerWidth - PANEL_WIDTH - 8);
    const maxY = Math.max(56, window.innerHeight - 100);
    setPos({
      x: Math.max(8, Math.min(maxX, dragRef.current.origX + dx)),
      y: Math.max(56, Math.min(maxY, dragRef.current.origY + dy)),
    });
  };

  const handleDragPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    dragRef.current = null;
  };

  const dotColor =
    snap.health === 'slow'
      ? 'bg-rose-400 animate-pulse'
      : snap.health === 'busy'
      ? 'bg-amber-400'
      : snap.simRafActive
      ? 'bg-sky-400'
      : 'bg-emerald-400';

  const statusLabel =
    snap.health === 'slow'
      ? 'Επιβαρυμένο'
      : snap.health === 'busy'
      ? 'Αυξημένο Φορτίο'
      : snap.simRafActive
      ? 'Ενεργή Προσομοίωση'
      : 'Άριστη (0% CPU)';

  const pillText = snap.simRafActive
    ? `${snap.avgSimFrameMs.toFixed(1)}ms • ${Math.max(1, snap.activeSimLabels.length)} live`
    : snap.longTasksLastMin > 0
    ? `Idle • ${snap.longTasksLastMin} lag`
    : '0.0ms • Idle';

  // Compute 5-minute SVG polylines (pure math, 0ms cost)
  const chartW = 296;
  const chartH = 74;
  const hist = snap.history;
  const maxCpuMs = Math.max(8, ...hist.map((h) => h.simMs));
  const maxFps = Math.max(60, ...hist.map((h) => h.simFps));
  const ramValues = hist.map((h) => h.heapMB).filter((v): v is number => v !== null);
  const minRam = ramValues.length > 0 ? Math.max(0, Math.min(...ramValues) - 10) : 0;
  const maxRam = ramValues.length > 0 ? Math.max(minRam + 20, Math.max(...ramValues) + 10) : 100;

  const buildPolyline = (getVal: (idx: number) => number | null, minV: number, maxV: number): string => {
    if (hist.length === 0) return '';
    const span = Math.max(0.001, maxV - minV);
    const pts: string[] = [];
    const denom = Math.max(1, hist.length - 1);
    for (let i = 0; i < hist.length; i++) {
      const v = getVal(i);
      if (v === null) continue;
      const x = hist.length === 1 ? chartW : (i / denom) * chartW;
      const norm = Math.max(0, Math.min(1, (v - minV) / span));
      const y = chartH - 4 - norm * (chartH - 10);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const cpuPoints = buildPolyline((i) => hist[i].simMs, 0, maxCpuMs);
  const fpsPoints = buildPolyline((i) => hist[i].simFps, 0, maxFps);
  const ramPoints = buildPolyline((i) => hist[i].heapMB, minRam, maxRam);
  const cpuBudgetPct = Math.min(100, Math.round((snap.avgSimFrameMs / 16.67) * 100));

  const floatingPanel =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            style={{
              position: 'fixed',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: `${PANEL_WIDTH}px`,
              zIndex: 9990,
            }}
            className="ipados-liquid-glass bg-[#fdfbf7]/96 backdrop-blur-2xl text-[#1b2a4a] rounded-2xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.32)] border border-white/95 ring-1 ring-black/10 overflow-hidden select-none text-xs"
          >
            {/* Draggable Header Bar */}
            <div
              onPointerDown={handleDragPointerDown}
              onPointerMove={handleDragPointerMove}
              onPointerUp={handleDragPointerUp}
              onPointerCancel={handleDragPointerUp}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-[#1b2a4a] text-white cursor-grab active:cursor-grabbing touch-none"
              title="Σύρε από εδώ για να μετακινήσεις το παράθυρο"
            >
              <div className="flex items-center gap-2 min-w-0">
                <GripHorizontal className="w-4 h-4 text-white/60 shrink-0" />
                <Gauge className="w-4 h-4 text-sky-300 shrink-0" />
                <div className="min-w-0">
                  <div className="font-extrabold text-[12px] leading-tight truncate">
                    Live Απόδοση (5 λεπτά)
                  </div>
                  <div className="text-[9.5px] font-medium text-slate-300 truncate">
                    {snap.deviceLabel} {snap.hardwareConcurrency > 0 ? `• ${snap.hardwareConcurrency} cores` : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${
                    snap.health === 'slow'
                      ? 'bg-rose-500/30 text-rose-100'
                      : snap.health === 'busy'
                      ? 'bg-amber-500/30 text-amber-100'
                      : snap.simRafActive
                      ? 'bg-sky-400/25 text-sky-100'
                      : 'bg-emerald-400/25 text-emerald-100'
                  }`}
                >
                  {statusLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition cursor-pointer"
                  aria-label="Κλείσιμο"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3.5 space-y-3">
              {/* 5-Minute Live Multi-Metric Chart (CPU ms, Frames FPS, RAM MB) */}
              <div className="p-2.5 rounded-xl bg-white border border-[#dfd8cb] space-y-1.5">
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold text-[#1b2a4a]">Τελευταία 5 Λεπτά (Live)</div>
                  <div className="flex items-center gap-3 text-[10px] font-extrabold tabular-nums">
                    <span className="inline-flex items-center gap-1 text-sky-700">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      CPU {cpuBudgetPct}%
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {snap.simFps}fps
                    </span>
                    {snap.jsHeapUsedMB !== null && (
                      <span className="inline-flex items-center gap-1 text-purple-700">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        {Math.round(snap.jsHeapUsedMB)}MB
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative rounded-lg bg-slate-50/80 border border-slate-200/80 overflow-hidden">
                  <svg
                    viewBox={`0 0 ${chartW} ${chartH}`}
                    className="w-full h-[74px] block"
                    preserveAspectRatio="none"
                  >
                    {/* Subtle horizontal gridlines */}
                    <line x1="0" y1={chartH * 0.25} x2={chartW} y2={chartH * 0.25} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1={chartH * 0.5} x2={chartW} y2={chartH * 0.5} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1={chartH * 0.75} x2={chartW} y2={chartH * 0.75} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />

                    {/* RAM line (purple) */}
                    {ramPoints && (
                      <polyline
                        fill="none"
                        stroke="#9333ea"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        opacity="0.75"
                        points={ramPoints}
                      />
                    )}

                    {/* Frames FPS line (emerald) */}
                    {fpsPoints && (
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        opacity="0.85"
                        points={fpsPoints}
                      />
                    )}

                    {/* CPU / Sim Frame ms line (sky blue) */}
                    {cpuPoints && (
                      <polyline
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={cpuPoints}
                      />
                    )}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-semibold">
                  <span>-5λ</span>
                  <span>
                    Κλίμακα: CPU 0–{maxCpuMs.toFixed(0)}ms • FPS 0–{maxFps}
                    {snap.jsHeapUsedMB !== null ? ` • RAM ${Math.round(minRam)}–${Math.round(maxRam)}MB` : ''}
                  </span>
                  <span>Τώρα</span>
                </div>
              </div>

              {/* 3 Compact Telemetry Boxes */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-white border border-[#e5dfd3]">
                  <div className="text-[10px] font-bold text-slate-500">CPU / Frame</div>
                  <div className="text-sm font-black text-[#1b2a4a] tabular-nums mt-0.5">
                    {snap.avgSimFrameMs.toFixed(2)} ms
                  </div>
                  <div className="text-[9.5px] text-slate-400">Όριο: 16.6ms</div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-[#e5dfd3]">
                  <div className="text-[10px] font-bold text-slate-500">Frames</div>
                  <div className="text-sm font-black text-[#1b2a4a] tabular-nums mt-0.5">
                    {snap.simRafActive ? `${snap.simFps} fps` : '0 (Idle)'}
                  </div>
                  <div className="text-[9.5px] text-slate-400">Peak: {snap.maxSimFrameMs.toFixed(1)}ms</div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-[#e5dfd3]">
                  <div className="text-[10px] font-bold text-slate-500">Lag (&gt;50ms)</div>
                  <div
                    className={`text-sm font-black tabular-nums mt-0.5 ${
                      snap.longTasksLastMin > 0 ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {snap.longTasksLastMin}/λεπτό
                  </div>
                  <div className="text-[9.5px] text-slate-400">Max: {snap.maxLongTaskMs}ms</div>
                </div>
              </div>

              {/* Running Live Simulations */}
              <div className="p-2.5 rounded-xl bg-[#f7f5f0] border border-[#e5dfd3] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold text-[#1b2a4a] flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    Τι τρέχει live τώρα
                  </span>
                  {snap.simRafActive && (
                    <button
                      type="button"
                      onClick={() => {
                        onPauseAllSimulations();
                        setTimeout(() => setSnap(getPerfSnapshot(false)), 120);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold transition cursor-pointer"
                    >
                      <PauseCircle className="w-3 h-3" />
                      Παύση Όλων
                    </button>
                  )}
                </div>
                {snap.activeSimLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {snap.activeSimLabels.map((lbl) => (
                      <span
                        key={lbl}
                        className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200 text-[10px] font-bold"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] font-semibold text-emerald-700">
                    ✓ Καμία ενεργή προσομοίωση — 0 RAF/sec (0% CPU)
                  </div>
                )}
              </div>

              {/* Workspace / Tabs / RAM & VRAM breakdown */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white border border-[#e5dfd3] flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-extrabold text-[#1b2a4a]">
                      {openTabsCount} tabs • {activePageCount} σελ.
                    </div>
                    <div className="text-[10px] text-slate-500">{activePageStrokeCount} strokes σελίδας</div>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#e5dfd3]">
                  <div className="font-extrabold text-[#1b2a4a]">
                    {snap.domCanvasCount} canvas ({snap.activeCanvasPixelsMP} MP)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {snap.jsHeapUsedMB !== null ? `RAM: ${snap.jsHeapUsedMB} MB` : 'VRAM: Βελτιστοποιημένη'}
                  </div>
                </div>
              </div>

              {openTabsCount > 6 && (
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10.5px] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Έχεις {openTabsCount} ανοιχτά tabs — κλείσε όσα δεν χρειάζεσαι για μικρότερη RAM.</span>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    resetPerfPeaks();
                    setSnap(getPerfSnapshot(false));
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#dfd8cb] text-[10.5px] font-bold text-slate-600 transition cursor-pointer"
                >
                  Μηδενισμός Peaks
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onOpenAdminPerfTab();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1b2a4a] hover:bg-[#152238] text-white text-[10.5px] font-extrabold transition cursor-pointer"
                >
                  <span>Αναλυτικά στο Admin</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer shadow-xs active:scale-95 ${
          open
            ? 'bg-white/25 text-white border-white/40'
            : snap.health === 'slow'
            ? 'bg-rose-500/25 hover:bg-rose-500/35 text-rose-100 border-rose-400/50'
            : snap.health === 'busy'
            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border-amber-400/40'
            : 'bg-white/10 hover:bg-white/20 text-white/95 border-white/20'
        }`}
        title="Live Μετρητής Απόδοσης (5 λεπτά — CPU / Frames / RAM / Προσομοιώσεις)"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        <Activity className="w-3 h-3 opacity-85 shrink-0" />
        <span className="hidden md:inline tabular-nums">{pillText}</span>
      </button>
      {floatingPanel}
    </div>
  );
};
