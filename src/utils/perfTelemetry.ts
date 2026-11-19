/**
 * BestNotes / ExplainBoards — Zero-Overhead Live Performance Telemetry
 *
 * Design rules (Zero-Slowdown Policy):
 * - NEVER runs its own 60fps requestAnimationFrame loop.
 * - NEVER triggers React re-renders from hot drawing/simulation paths.
 * - Passively listens to browser `longtask` (>50ms) via PerformanceObserver (0ms idle cost).
 * - Simulation render loops call `recordSimFrameSample()` with a single arithmetic diff.
 * - UI widgets (`AdminPerfPill`, `AdminPerformanceView`) pull a snapshot every 1.5s only when visible.
 */

export type PerfHealthStatus = 'excellent' | 'good' | 'busy' | 'slow';

export interface PerfHistoryPoint {
  ts: number;
  simMs: number;
  simFps: number;
  longTasks: number;
  heapMB: number | null;
  activeSims: number;
}

export interface PerfSnapshot {
  health: PerfHealthStatus;
  simRafActive: boolean;
  simFps: number;
  lastSimFrameMs: number;
  avgSimFrameMs: number;
  maxSimFrameMs: number;
  activeSimLabels: string[];
  longTasksTotal: number;
  longTasksLastMin: number;
  maxLongTaskMs: number;
  jsHeapUsedMB: number | null;
  jsHeapLimitMB: number | null;
  domCanvasCount: number;
  activeCanvasPixelsMP: number;
  deviceLabel: string;
  hardwareConcurrency: number;
  history: PerfHistoryPoint[];
}

interface InternalPerfState {
  simRafActive: boolean;
  lastSimFrameMs: number;
  avgSimFrameMs: number;
  maxSimFrameMs: number;
  lastSimFrameAt: number;
  simFrameTimestamps: number[];
  activeSimLabels: string[];
  longTaskTimestamps: { ts: number; duration: number }[];
  longTasksTotal: number;
  maxLongTaskMs: number;
  history: PerfHistoryPoint[];
  observerStarted: boolean;
}

const state: InternalPerfState = {
  simRafActive: false,
  lastSimFrameMs: 0,
  avgSimFrameMs: 0,
  maxSimFrameMs: 0,
  lastSimFrameAt: 0,
  simFrameTimestamps: [],
  activeSimLabels: [],
  longTaskTimestamps: [],
  longTasksTotal: 0,
  maxLongTaskMs: 0,
  history: [],
  observerStarted: false,
};

function detectDeviceLabel(): string {
  if (typeof navigator === 'undefined') return 'Unknown Device';
  const ua = navigator.userAgent || '';
  if (/iPad|Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document) {
    return 'iPad (iPadOS)';
  }
  if (/Macintosh|Mac OS X/.test(ua)) return 'Mac (macOS)';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Android/.test(ua)) return 'Android';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Web Browser';
}

export function ensurePerfObserverStarted(): void {
  if (state.observerStarted || typeof window === 'undefined') return;
  state.observerStarted = true;
  try {
    if (typeof PerformanceObserver !== 'undefined') {
      const supported = (PerformanceObserver as any).supportedEntryTypes as string[] | undefined;
      if (supported && supported.includes('longtask')) {
        const observer = new PerformanceObserver((list) => {
          const now = Date.now();
          for (const entry of list.getEntries()) {
            const dur = Math.round(entry.duration);
            state.longTasksTotal += 1;
            if (dur > state.maxLongTaskMs) state.maxLongTaskMs = dur;
            state.longTaskTimestamps.push({ ts: now, duration: dur });
          }
          // Prune entries older than 60s
          const cutoff = now - 60_000;
          if (state.longTaskTimestamps.length > 120) {
            state.longTaskTimestamps = state.longTaskTimestamps.filter((x) => x.ts >= cutoff);
          }
        });
        observer.observe({ type: 'longtask', buffered: false } as any);
      }
    }
  } catch {
    // Ignore on browsers without longtask support (e.g. older Safari)
  }
}

/**
 * Called at the end of `renderSimFrame` in App.tsx.
 * Ultra-cheap: O(1) arithmetic, no DOM reads, no React setState.
 */
export function recordSimFrameSample(
  durationMs: number,
  willContinueRaf: boolean,
  activeLabels: string[]
): void {
  const now = performance.now();
  const safeDur = Math.max(0, Math.min(250, durationMs));
  state.lastSimFrameMs = safeDur;
  state.avgSimFrameMs = state.avgSimFrameMs === 0 ? safeDur : state.avgSimFrameMs * 0.85 + safeDur * 0.15;
  if (safeDur > state.maxSimFrameMs) {
    state.maxSimFrameMs = safeDur;
  }
  state.lastSimFrameAt = now;
  state.simRafActive = willContinueRaf;
  state.activeSimLabels = activeLabels;

  state.simFrameTimestamps.push(now);
  const cutoff = now - 1000;
  // Trim in-place when needed
  while (state.simFrameTimestamps.length > 0 && state.simFrameTimestamps[0] < cutoff) {
    state.simFrameTimestamps.shift();
  }
}

export function markSimLoopStopped(): void {
  state.simRafActive = false;
  state.activeSimLabels = [];
  state.simFrameTimestamps.length = 0;
  state.lastSimFrameMs = 0;
  state.avgSimFrameMs = 0;
}

export function resetPerfPeaks(): void {
  state.maxSimFrameMs = 0;
  state.maxLongTaskMs = 0;
  state.longTasksTotal = 0;
  state.longTaskTimestamps = [];
  state.history = [];
}

/**
 * Pull a full snapshot (called at most once every 1.5s by Admin UI).
 */
export function getPerfSnapshot(pushHistory = false): PerfSnapshot {
  ensurePerfObserverStarted();

  const nowPerf = performance.now();
  const nowWall = Date.now();

  // Prune sim frame timestamps older than 1s
  const simCutoff = nowPerf - 1000;
  while (state.simFrameTimestamps.length > 0 && state.simFrameTimestamps[0] < simCutoff) {
    state.simFrameTimestamps.shift();
  }

  // If no sim frame has fired in the last 1.2s, simulation engine is resting at 0 FPS
  const isRecentlyActive = state.simRafActive && nowPerf - state.lastSimFrameAt < 1200;
  const simFps = isRecentlyActive ? state.simFrameTimestamps.length : 0;
  const effectiveAvgMs = isRecentlyActive ? state.avgSimFrameMs : 0;
  const effectiveLastMs = isRecentlyActive ? state.lastSimFrameMs : 0;
  const effectiveLabels = isRecentlyActive ? state.activeSimLabels : [];

  // Prune long tasks older than 60s
  const ltCutoff = nowWall - 60_000;
  state.longTaskTimestamps = state.longTaskTimestamps.filter((x) => x.ts >= ltCutoff);
  const longTasksLastMin = state.longTaskTimestamps.length;

  // Optional Chrome JS Heap telemetry
  let jsHeapUsedMB: number | null = null;
  let jsHeapLimitMB: number | null = null;
  const perfMem = (performance as any)?.memory;
  if (perfMem && typeof perfMem.usedJSHeapSize === 'number') {
    jsHeapUsedMB = Math.round((perfMem.usedJSHeapSize / (1024 * 1024)) * 10) / 10;
    jsHeapLimitMB = Math.round((perfMem.jsHeapSizeLimit / (1024 * 1024)) * 10) / 10;
  }

  // Count mounted <canvas> elements & total backing-store megapixels (VRAM indicator)
  let domCanvasCount = 0;
  let totalPixels = 0;
  if (typeof document !== 'undefined') {
    const canvases = document.querySelectorAll('canvas');
    domCanvasCount = canvases.length;
    for (let i = 0; i < canvases.length; i++) {
      const c = canvases[i];
      if (c.width > 0 && c.height > 0) {
        totalPixels += c.width * c.height;
      }
    }
  }
  const activeCanvasPixelsMP = Math.round((totalPixels / 1_000_000) * 10) / 10;

  // Health classification
  let health: PerfHealthStatus = 'excellent';
  if (effectiveAvgMs > 12 || longTasksLastMin >= 8) {
    health = 'slow';
  } else if (effectiveAvgMs > 6 || longTasksLastMin >= 3) {
    health = 'busy';
  } else if (effectiveAvgMs > 2.5 || effectiveLabels.length > 0) {
    health = 'good';
  }

  if (pushHistory) {
    state.history.push({
      ts: nowWall,
      simMs: Math.round(effectiveAvgMs * 100) / 100,
      simFps,
      longTasks: longTasksLastMin,
      heapMB: jsHeapUsedMB,
      activeSims: effectiveLabels.length,
    });
    if (state.history.length > 60) {
      state.history.shift();
    }
  }

  return {
    health,
    simRafActive: isRecentlyActive,
    simFps,
    lastSimFrameMs: Math.round(effectiveLastMs * 100) / 100,
    avgSimFrameMs: Math.round(effectiveAvgMs * 100) / 100,
    maxSimFrameMs: Math.round(state.maxSimFrameMs * 100) / 100,
    activeSimLabels: effectiveLabels,
    longTasksTotal: state.longTasksTotal,
    longTasksLastMin,
    maxLongTaskMs: state.maxLongTaskMs,
    jsHeapUsedMB,
    jsHeapLimitMB,
    domCanvasCount,
    activeCanvasPixelsMP,
    deviceLabel: detectDeviceLabel(),
    hardwareConcurrency: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 0 : 0,
    history: [...state.history],
  };
}
