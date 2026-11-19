import React, { useEffect, useState } from 'react';
import {
  Activity,
  Cpu,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Layers,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { getPerfSnapshot, resetPerfPeaks, type PerfSnapshot } from '../../../utils/perfTelemetry';

export const AdminPerformanceView: React.FC = () => {
  const [snap, setSnap] = useState<PerfSnapshot>(() => getPerfSnapshot(true));

  useEffect(() => {
    const id = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setSnap(getPerfSnapshot(true));
    }, 1500);
    return () => window.clearInterval(id);
  }, []);

  const maxHistMs = Math.max(4, ...snap.history.map((h) => h.simMs));

  const budgetChecks = [
    {
      label: 'Παγωμένες / Κλειστές Προσομοιώσεις = 0.00 ms & 0 RAF/sec',
      pass: !snap.simRafActive || snap.avgSimFrameMs <= 4,
      detail: snap.simRafActive
        ? `Ενεργές τώρα (${snap.avgSimFrameMs.toFixed(2)} ms/frame)`
        : 'Επαληθευμένο: 0.00 ms • 0 FPS Idle',
    },
    {
      label: 'Ενεργό Sim Frame Budget (< 4.0 ms έναντι 16.6 ms για 60fps)',
      pass: snap.avgSimFrameMs < 4.0,
      detail: `Τρέχον: ${snap.avgSimFrameMs.toFixed(2)} ms • Peak: ${snap.maxSimFrameMs.toFixed(2)} ms`,
    },
    {
      label: 'Χωρίς κολλήματα Main Thread (Long Tasks > 50ms < 3/λεπτό)',
      pass: snap.longTasksLastMin < 3,
      detail: `${snap.longTasksLastMin} το τελευταίο λεπτό (Max: ${snap.maxLongTaskMs} ms)`,
    },
    {
      label: 'Ελεγχόμενη VRAM Καμβάδων (Lazy simCanvas & active ±1 σελίδα)',
      pass: snap.activeCanvasPixelsMP <= 45,
      detail: `${snap.domCanvasCount} canvas elements • ${snap.activeCanvasPixelsMP} MP`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="ipados-liquid-glass bg-[#fdfbf7]/90 backdrop-blur-2xl border border-white/85 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300/70 text-emerald-900 text-xs font-extrabold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Slowdown Policy (v1.05)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eef3f8] border border-[#1b2a4a]/15 text-[#1b2a4a] text-[11px] font-bold">
                {snap.deviceLabel}
                {snap.hardwareConcurrency > 0 ? ` • ${snap.hardwareConcurrency} CPU cores` : ''}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#1b2a4a] pt-1">
              Ζωντανός Έλεγχος Απόδοσης, Προσομοιώσεων &amp; Rendering
            </h3>
            <p className="text-xs text-slate-500 max-w-3xl">
              Η ταχύτητα rendering (FPS, ms/frame, RAM/VRAM) εξαρτάται από τη συσκευή που τρέχει την εφαρμογή (Mac, iPad, Windows).
              Εδώ βλέπεις σε πραγματικό χρόνο τη μετρημένη επιβάρυνση της τρέχουσας συσκευής — χωρίς ο ίδιος ο μετρητής να καταναλώνει CPU (0 RAF loops).
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetPerfPeaks();
              setSnap(getPerfSnapshot(false));
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#dfd8cb] text-[#1b2a4a] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Μηδενισμός Peaks</span>
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#1b2a4a]" />
              <span>Κόστος Προσομοιώσεων</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
              {snap.avgSimFrameMs.toFixed(2)} ms
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Peak: <b>{snap.maxSimFrameMs.toFixed(2)} ms</b> • Όριο 60fps: 16,6 ms
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#1b2a4a]" />
              <span>Ενεργά Live Loops</span>
            </div>
            <div className="text-2xl font-black text-[#1b2a4a] mt-1 tabular-nums">
              {snap.simRafActive ? `${snap.activeSimLabels.length} live` : '0 (Idle)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Sim FPS: <b>{snap.simRafActive ? `${snap.simFps} fps` : '0 fps (0% CPU)'}</b>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#1b2a4a]" />
              <span>Κολλήματα (Long Tasks &gt;50ms)</span>
            </div>
            <div
              className={`text-2xl font-black mt-1 tabular-nums ${
                snap.longTasksLastMin >= 3 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {snap.longTasksLastMin} <span className="text-sm font-bold text-slate-400">/ λεπτό</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Σύνολο session: <b>{snap.longTasksTotal}</b> • Max: <b>{snap.maxLongTaskMs} ms</b>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#dfd8cb] shadow-2xs">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1b2a4a]" />
              <span>Καμβάδες &amp; Μνήμη</span>
            </div>
            <div className="text-2xl font-black text-[#1b2a4a] mt-1 tabular-nums">
              {snap.jsHeapUsedMB !== null ? `${snap.jsHeapUsedMB} MB` : `${snap.activeCanvasPixelsMP} MP`}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {snap.domCanvasCount} active &lt;canvas&gt; ({snap.activeCanvasPixelsMP} MP)
            </div>
          </div>
        </div>
      </div>

      {/* Sparkline + Policy Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Frame Time History */}
        <div className="ipados-liquid-glass bg-[#fdfbf7]/90 backdrop-blur-2xl border border-white/85 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-[#1b2a4a] uppercase tracking-wider">
              Ιστορικό Κόστους Frame (Τελευταία 5 λεπτά)
            </h4>
            <span className="text-[11px] font-bold text-slate-500">Κλίμακα: 0 – {maxHistMs.toFixed(1)} ms</span>
          </div>

          <div className="h-36 rounded-2xl bg-white border border-[#dfd8cb] p-3 flex items-end gap-1 overflow-hidden">
            {snap.history.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                Συλλογή δειγμάτων...
              </div>
            ) : (
              snap.history.map((pt, idx) => {
                const hPct = Math.max(4, Math.min(100, (pt.simMs / maxHistMs) * 100));
                const barColor =
                  pt.simMs > 12
                    ? 'bg-rose-500'
                    : pt.simMs > 6
                    ? 'bg-amber-500'
                    : pt.activeSims > 0
                    ? 'bg-sky-500'
                    : 'bg-emerald-400';
                return (
                  <div
                    key={`${pt.ts}-${idx}`}
                    className={`flex-1 rounded-t-sm transition-all ${barColor}`}
                    style={{ height: `${hPct}%` }}
                    title={`${pt.simMs.toFixed(2)} ms • ${pt.simFps} fps • ${pt.activeSims} live sims`}
                  />
                );
              })
            )}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" /> Idle (0.00 ms)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" /> Active Sim (&lt;6 ms)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Βαρύ (6–12 ms)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Αργό (&gt;12 ms)
            </span>
          </div>
        </div>

        {/* Zero-Slowdown Policy Checklist */}
        <div className="ipados-liquid-glass bg-[#fdfbf7]/90 backdrop-blur-2xl border border-white/85 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="text-sm font-extrabold text-[#1b2a4a] uppercase tracking-wider">
            Κανόνες Μηδενικής Επιβράδυνσης (Zero-Slowdown Charter)
          </h4>
          <div className="space-y-2.5">
            {budgetChecks.map((chk) => (
              <div
                key={chk.label}
                className="p-3 rounded-2xl bg-white border border-[#dfd8cb] flex items-start gap-2.5"
              >
                {chk.pass ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-[#1b2a4a]">{chk.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{chk.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
