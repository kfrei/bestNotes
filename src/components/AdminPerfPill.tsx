import React, { useEffect, useState, useRef } from 'react';
import { Activity, PauseCircle, Gauge, Cpu, Layers, AlertTriangle, ExternalLink } from 'lucide-react';
import { getPerfSnapshot, resetPerfPeaks, type PerfSnapshot } from '../utils/perfTelemetry';

export interface AdminPerfPillProps {
  openTabsCount: number;
  activePageCount: number;
  activePageStrokeCount: number;
  onPauseAllSimulations: () => void;
  onOpenAdminPerfTab: () => void;
}

export const AdminPerfPill: React.FC<AdminPerfPillProps> = ({
  openTabsCount,
  activePageCount,
  activePageStrokeCount,
  onPauseAllSimulations,
  onOpenAdminPerfTab,
}) => {
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState<PerfSnapshot>(() => getPerfSnapshot(false));
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setSnap(getPerfSnapshot(true));
    };
    tick();
    const id = window.setInterval(tick, 1500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

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
      : 'Άριστη (0% CPU Idle)';

  const pillText = snap.simRafActive
    ? `${snap.avgSimFrameMs.toFixed(1)}ms • ${Math.max(1, snap.activeSimLabels.length)} live`
    : snap.longTasksLastMin > 0
    ? `Idle • ${snap.longTasksLastMin} lag`
    : '0.0ms • Idle';

  return (
    <div ref={containerRef} className="relative">
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
        title="Live Μετρητής Απόδοσης (CPU / Προσομοιώσεις / VRAM / Long Tasks)"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        <Activity className="w-3 h-3 opacity-85 shrink-0" />
        <span className="hidden md:inline tabular-nums">{pillText}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 ipados-liquid-glass bg-[#fdfbf7]/95 backdrop-blur-2xl text-[#1b2a4a] rounded-2xl shadow-2xl border border-white/90 ring-1 ring-black/10 p-3.5 z-50 space-y-3 text-xs">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#dfd8cb]">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#1b2a4a]" />
              <div>
                <div className="font-extrabold text-[#1b2a4a] leading-tight">Live Απόδοση Συσκευής</div>
                <div className="text-[10px] font-semibold text-slate-500">
                  {snap.deviceLabel} {snap.hardwareConcurrency > 0 ? `• ${snap.hardwareConcurrency} cores` : ''}
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                snap.health === 'slow'
                  ? 'bg-rose-100 text-rose-800'
                  : snap.health === 'busy'
                  ? 'bg-amber-100 text-amber-900'
                  : snap.simRafActive
                  ? 'bg-sky-100 text-sky-900'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {statusLabel}
            </span>
          </div>

          {/* 3 Compact Telemetry Boxes */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-white border border-[#e5dfd3]">
              <div className="text-[10px] font-bold text-slate-500">Sim Frame</div>
              <div className="text-sm font-black text-[#1b2a4a] tabular-nums mt-0.5">
                {snap.avgSimFrameMs.toFixed(2)} ms
              </div>
              <div className="text-[9.5px] text-slate-400">Όριο: 16.6ms</div>
            </div>

            <div className="p-2 rounded-xl bg-white border border-[#e5dfd3]">
              <div className="text-[10px] font-bold text-slate-500">Sim FPS</div>
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

          {/* Workspace / Tabs / VRAM breakdown */}
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
          <div className="flex items-center justify-between gap-2 pt-1">
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
      )}
    </div>
  );
};
