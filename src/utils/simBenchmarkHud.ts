/**
 * Live Canvas2D / RAF / React / Tab-Lifecycle Telemetry & Stress-Test HUD
 * Strictly inert (0 overhead, 0 hooks, 0 DOM) unless `?bench=1` is present in URL!
 */

export const IS_SIM_BENCH_ENABLED =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('bench') === '1';

export interface BenchAppMeta {
  cachedPages: number;
  openTabs: number;
  activeNotebookId: string;
  viewMode: string;
  isSimulating: boolean;
  heatRunning: boolean;
}

export interface BenchActions {
  spawnHeavyCircuitMeters: () => void;
  spawnHeavyBoilingHeat: () => void;
  spawnComboHeavyPage: () => void;
  pauseAllSims: () => void;
  openFreshEmptyTab: () => void;
  closeFirstTab: () => void;
}

let installed = false;
let appRenderCount = 0;
let lsWriteCount = 0;
let lsWriteBytes = 0;
let rafScheduleCount = 0;
let rafCallbackSamplesMs: number[] = [];
let frameGapSamplesMs: number[] = [];
let lastRafTickNow = 0;

let curFrameDrawOps = 0;
let curFrameShadowBlurOps = 0;
let curFrameFilterOps = 0;
let curFrameGradientOps = 0;
let perFrameDrawOps: number[] = [];
let perFrameShadowBlurOps: number[] = [];
let perFrameFilterOps: number[] = [];
let perFrameGradientOps: number[] = [];

let latestMeta: BenchAppMeta = {
  cachedPages: 0,
  openTabs: 0,
  activeNotebookId: '',
  viewMode: 'editor',
  isSimulating: false,
  heatRunning: false,
};

let registeredActions: BenchActions | null = null;
let windowStartMs = typeof performance !== 'undefined' ? performance.now() : 0;

function resetRollingCounters() {
  appRenderCount = 0;
  lsWriteCount = 0;
  lsWriteBytes = 0;
  rafScheduleCount = 0;
  rafCallbackSamplesMs = [];
  frameGapSamplesMs = [];
  lastRafTickNow = 0;
  curFrameDrawOps = 0;
  curFrameShadowBlurOps = 0;
  curFrameFilterOps = 0;
  curFrameGradientOps = 0;
  perFrameDrawOps = [];
  perFrameShadowBlurOps = [];
  perFrameFilterOps = [];
  perFrameGradientOps = [];
  windowStartMs = performance.now();
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * p)));
  return sorted[idx];
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
}

export function registerBenchActions(actions: BenchActions): void {
  if (!IS_SIM_BENCH_ENABLED) return;
  registeredActions = actions;
}

export function recordBenchAppRender(meta: BenchAppMeta): void {
  if (!IS_SIM_BENCH_ENABLED) return;
  appRenderCount++;
  latestMeta = meta;
}

export function updateBenchAppMeta(meta: Partial<BenchAppMeta>): void {
  if (!IS_SIM_BENCH_ENABLED) return;
  latestMeta = { ...latestMeta, ...meta };
}

export function installSimBenchmarkHudIfEnabled(): void {
  if (!IS_SIM_BENCH_ENABLED || installed || typeof window === 'undefined') return;
  installed = true;
  windowStartMs = performance.now();

  // 1. Hook CanvasRenderingContext2D prototype to count GPU/CPU heavy operations per RAF frame
  const proto = CanvasRenderingContext2D.prototype;
  const origFill = proto.fill;
  const origStroke = proto.stroke;
  const origClearRect = proto.clearRect;
  const origDrawImage = proto.drawImage;
  const origRadialGrad = proto.createRadialGradient;
  const origLinearGrad = proto.createLinearGradient;

  const trackDrawState = (ctx: CanvasRenderingContext2D) => {
    curFrameDrawOps++;
    if (ctx.shadowBlur > 0) curFrameShadowBlurOps++;
    if (ctx.filter && ctx.filter !== 'none') curFrameFilterOps++;
  };

  proto.fill = function (...args: any[]) {
    trackDrawState(this);
    return (origFill as any).apply(this, args);
  };
  proto.stroke = function (...args: any[]) {
    trackDrawState(this);
    return (origStroke as any).apply(this, args);
  };
  proto.clearRect = function (x: number, y: number, w: number, h: number) {
    curFrameDrawOps++;
    return origClearRect.call(this, x, y, w, h);
  };
  proto.drawImage = function (...args: any[]) {
    trackDrawState(this);
    return (origDrawImage as any).apply(this, args);
  };
  proto.createRadialGradient = function (
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number
  ) {
    curFrameGradientOps++;
    return origRadialGrad.call(this, x0, y0, r0, x1, y1, r1);
  };
  proto.createLinearGradient = function (x0: number, y0: number, x1: number, y1: number) {
    curFrameGradientOps++;
    return origLinearGrad.call(this, x0, y0, x1, y1);
  };

  // 2. Hook localStorage.setItem to detect background JSON serialization thrashing
  const origSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key: string, value: string) {
    lsWriteCount++;
    lsWriteBytes += (key?.length || 0) + (value?.length || 0);
    return origSetItem.call(this, key, value);
  };

  // 3. Hook requestAnimationFrame to measure real callback CPU duration & active RAF rate
  const origRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    rafScheduleCount++;
    return origRaf((ts: number) => {
      if (lastRafTickNow > 0) {
        const gap = ts - lastRafTickNow;
        if (gap >= 2 && gap <= 250) {
          frameGapSamplesMs.push(gap);
          if (frameGapSamplesMs.length > 240) frameGapSamplesMs.shift();
        }
      }
      lastRafTickNow = ts;
      curFrameDrawOps = 0;
      curFrameShadowBlurOps = 0;
      curFrameFilterOps = 0;
      curFrameGradientOps = 0;

      const t0 = performance.now();
      try {
        cb(ts);
      } finally {
        const dt = performance.now() - t0;
        rafCallbackSamplesMs.push(dt);
        if (rafCallbackSamplesMs.length > 240) rafCallbackSamplesMs.shift();
        if (curFrameDrawOps > 0 || curFrameGradientOps > 0) {
          perFrameDrawOps.push(curFrameDrawOps);
          perFrameShadowBlurOps.push(curFrameShadowBlurOps);
          perFrameFilterOps.push(curFrameFilterOps);
          perFrameGradientOps.push(curFrameGradientOps);
          if (perFrameDrawOps.length > 180) {
            perFrameDrawOps.shift();
            perFrameShadowBlurOps.shift();
            perFrameFilterOps.shift();
            perFrameGradientOps.shift();
          }
        }
      }
    });
  };

  // 4. Mount Floating Benchmark HUD in DOM
  const mountHud = () => {
    if (document.getElementById('__bn_bench_hud')) return;
    const root = document.createElement('div');
    root.id = '__bn_bench_hud';
    root.setAttribute('data-ui-panel', 'true');
    root.style.cssText =
      'position:fixed;bottom:10px;right:10px;z-index:99999;background:rgba(15,23,42,0.94);color:#f8fafc;padding:8px 10px;border-radius:10px;font:11px/1.35 ui-monospace,SFMono-Regular,monospace;box-shadow:0 8px 24px rgba(0,0,0,0.35);max-width:360px;border:1px solid rgba(56,189,248,0.4);';

    const btnStyle =
      'padding:3px 6px;border-radius:6px;background:#1e3a8a;color:#e0f2fe;border:1px solid #3b82f6;font-size:10px;cursor:pointer;font-weight:600;';

    root.innerHTML = `
      <div style="font-weight:700;color:#38bdf8;margin-bottom:4px;">⚡ BestNotes Sim Bench HUD</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">
        <button id="__bn_btn_circuit_heavy" type="button" style="${btnStyle}">1. Circuit+Meters</button>
        <button id="__bn_btn_heat_heavy" type="button" style="${btnStyle}">2. Boiling Heat</button>
        <button id="__bn_btn_combo_heavy" type="button" style="${btnStyle}">3. Combo Both</button>
        <button id="__bn_btn_pause_all" type="button" style="${btnStyle}">4. Pause All</button>
        <button id="__bn_btn_new_tab" type="button" style="${btnStyle}">5. + Empty Tab</button>
        <button id="__bn_btn_close_sim_tab" type="button" style="${btnStyle}">6. Close Tab 1</button>
        <button id="__bn_btn_reset_stats" type="button" style="${btnStyle};background:#334155;border-color:#64748b;">Reset Stats</button>
      </div>
      <pre id="__bn_bench_metrics" style="margin:0;white-space:pre-wrap;font-size:10.5px;color:#e2e8f0;">Initializing...</pre>
    `;
    document.body.appendChild(root);

    document.getElementById('__bn_btn_circuit_heavy')?.addEventListener('click', () => {
      registeredActions?.spawnHeavyCircuitMeters();
      window.setTimeout(resetRollingCounters, 250);
    });
    document.getElementById('__bn_btn_heat_heavy')?.addEventListener('click', () => {
      registeredActions?.spawnHeavyBoilingHeat();
      window.setTimeout(resetRollingCounters, 250);
    });
    document.getElementById('__bn_btn_combo_heavy')?.addEventListener('click', () => {
      registeredActions?.spawnComboHeavyPage();
      window.setTimeout(resetRollingCounters, 250);
    });
    document.getElementById('__bn_btn_pause_all')?.addEventListener('click', () => {
      registeredActions?.pauseAllSims();
      window.setTimeout(resetRollingCounters, 250);
    });
    document.getElementById('__bn_btn_new_tab')?.addEventListener('click', () => {
      registeredActions?.openFreshEmptyTab();
      window.setTimeout(resetRollingCounters, 250);
    });
    document.getElementById('__bn_btn_close_sim_tab')?.addEventListener('click', () => {
      registeredActions?.closeFirstTab();
      window.setTimeout(resetRollingCounters, 300);
    });
    document.getElementById('__bn_btn_reset_stats')?.addEventListener('click', () => {
      resetRollingCounters();
    });

    const metricsEl = document.getElementById('__bn_bench_metrics');
    window.setInterval(() => {
      if (!metricsEl) return;
      const elapsedSec = Math.max(0.25, (performance.now() - windowStartMs) / 1000);
      const rafPerSec = rafScheduleCount / elapsedSec;
      const avgGap = avg(frameGapSamplesMs);
      const estFps = rafPerSec < 1 ? 0 : avgGap > 0 ? Math.min(120, 1000 / avgGap) : rafPerSec;
      const report = {
        estFps: Number(estFps.toFixed(1)),
        rafPerSec: Number(rafPerSec.toFixed(1)),
        avgRafWorkMs: Number(avg(rafCallbackSamplesMs).toFixed(2)),
        p95RafWorkMs: Number(percentile(rafCallbackSamplesMs, 0.95).toFixed(2)),
        p95FrameGapMs: Number(percentile(frameGapSamplesMs, 0.95).toFixed(1)),
        drawOpsPerFrame: Number(avg(perFrameDrawOps).toFixed(1)),
        shadowBlurPerFrame: Number(avg(perFrameShadowBlurOps).toFixed(2)),
        ctxFilterPerFrame: Number(avg(perFrameFilterOps).toFixed(2)),
        gradientsPerFrame: Number(avg(perFrameGradientOps).toFixed(2)),
        appRendersPerSec: Number((appRenderCount / elapsedSec).toFixed(2)),
        lsWritesPerSec: Number((lsWriteCount / elapsedSec).toFixed(2)),
        lsKBPerSec: Number((lsWriteBytes / 1024 / elapsedSec).toFixed(1)),
        cachedPages: latestMeta.cachedPages,
        openTabs: latestMeta.openTabs,
        viewMode: latestMeta.viewMode,
        isSimulating: latestMeta.isSimulating,
        heatRunning: latestMeta.heatRunning,
      };
      metricsEl.textContent = JSON.stringify(report, null, 2);

      // Keep rolling 3-second window fresh so numbers reflect current mode
      if (elapsedSec >= 3.0) {
        resetRollingCounters();
      }
    }, 500);
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', mountHud, { once: true });
  } else {
    mountHud();
  }
}
