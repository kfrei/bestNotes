import React, { useEffect, useMemo, useRef } from 'react';

export type LibraryBgEffectMode = 'arcs' | 'plexus' | 'off';

interface LibraryAmbientArcDialProps {
  /** Hex color of the active Library folder (undefined/empty at root → warm beige-grey palette). */
  folderColor?: string;
  /** Selected ambient background effect: 'arcs' (default), 'plexus' (nodes & edges), or 'off'. */
  effectMode?: LibraryBgEffectMode;
}

interface ArcPalette {
  outerFill1: string;
  outerFill2: string;
  midFill1: string;
  midFill2: string;
  midStroke: string;
  innerFill: string;
  innerStroke: string;
}

/** Warm beige-grey ("greige") palette used at the root Library level. */
const ROOT_GREIGE_PALETTE: ArcPalette = {
  outerFill1: 'rgba(196, 187, 172, 0.30)',
  outerFill2: 'rgba(170, 160, 145, 0.24)',
  midFill1: 'rgba(155, 146, 132, 0.22)',
  midFill2: 'rgba(186, 178, 165, 0.25)',
  midStroke: 'rgba(138, 130, 118, 0.36)',
  innerFill: 'rgba(176, 168, 155, 0.18)',
  innerStroke: 'rgba(148, 140, 128, 0.30)',
};

function parseHexRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b) ? [r, g, b] : null;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b) ? [r, g, b] : null;
  }
  return null;
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  weightA: number
): [number, number, number] {
  const wB = 1 - weightA;
  return [
    Math.round(a[0] * weightA + b[0] * wB),
    Math.round(a[1] * weightA + b[1] * wB),
    Math.round(a[2] * weightA + b[2] * wB),
  ];
}

function rgba([r, g, b]: [number, number, number], alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Generates an ultra-soft, multi-tone palette combining:
 * - Warm beige segments (sand/paper)
 * - Clean neutral grey segments (slate mist)
 * - Soft desaturated folder-color accent segments (so not every arc is the same hue)
 */
function buildFolderTintedPalette(hex?: string): ArcPalette {
  if (!hex) return ROOT_GREIGE_PALETTE;
  const rgb = parseHexRgb(hex);
  if (!rgb) return ROOT_GREIGE_PALETTE;

  const softMist: [number, number, number] = [214, 220, 228];
  const neutralGrey: [number, number, number] = [156, 163, 175];
  const coolGrey: [number, number, number] = [140, 148, 160];
  const warmBeige: [number, number, number] = [198, 186, 168];
  const deepBeige: [number, number, number] = [174, 162, 144];

  const accentOuter = mixRgb(rgb, softMist, 0.44);
  const accentMid = mixRgb(rgb, softMist, 0.36);
  const accentStroke = mixRgb(rgb, coolGrey, 0.28);

  return {
    outerFill1: rgba(accentOuter, 0.25),
    outerFill2: rgba(warmBeige, 0.30),
    midFill1: rgba(neutralGrey, 0.22),
    midFill2: rgba(accentMid, 0.23),
    midStroke: rgba(accentStroke, 0.34),
    innerFill: rgba(deepBeige, 0.24),
    innerStroke: rgba(coolGrey, 0.30),
  };
}

function buildPlexusColors(hex?: string): {
  nodeRgb: [number, number, number];
  edgeRgb: [number, number, number];
  hotRgb: [number, number, number];
} {
  const defaultColors = {
    nodeRgb: [142, 134, 122] as [number, number, number],
    edgeRgb: [162, 154, 142] as [number, number, number],
    hotRgb: [68, 92, 124] as [number, number, number],
  };
  if (!hex) return defaultColors;
  const rgb = parseHexRgb(hex);
  if (!rgb) return defaultColors;

  const warmStone: [number, number, number] = [152, 146, 138];
  const deepNavy: [number, number, number] = [35, 73, 120];
  return {
    nodeRgb: mixRgb(rgb, warmStone, 0.38),
    edgeRgb: mixRgb(rgb, warmStone, 0.26),
    hotRgb: mixRgb(rgb, deepNavy, 0.55),
  };
}

function arcSectorPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number
): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + rOuter * Math.cos(toRad(startDeg));
  const y1 = cy + rOuter * Math.sin(toRad(startDeg));
  const x2 = cx + rOuter * Math.cos(toRad(endDeg));
  const y2 = cy + rOuter * Math.sin(toRad(endDeg));
  const x3 = cx + rInner * Math.cos(toRad(endDeg));
  const y3 = cy + rInner * Math.sin(toRad(endDeg));
  const x4 = cx + rInner * Math.cos(toRad(startDeg));
  const y4 = cy + rInner * Math.sin(toRad(startDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x3.toFixed(1)} ${y3.toFixed(1)} A ${rInner} ${rInner} 0 ${large} 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
}

// Precomputed once at module load (0 allocations on re-render)
const ARC_PATHS = {
  outer1: arcSectorPath(200, 200, 132, 194, 212, 344),
  outer2: arcSectorPath(200, 200, 140, 192, 92, 162),
  outer3: arcSectorPath(200, 200, 148, 188, 14, 78),
  mid1: arcSectorPath(200, 200, 96, 158, 316, 408),
  mid2: arcSectorPath(200, 200, 100, 152, 248, 310),
  mid3: arcSectorPath(200, 200, 96, 150, 184, 240),
  mid4: arcSectorPath(200, 200, 100, 150, 118, 174),
  inner1: arcSectorPath(200, 200, 68, 96, 225, 318),
  inner2: arcSectorPath(200, 200, 72, 94, 40, 130),
  inner3: arcSectorPath(200, 200, 44, 62, 150, 245),
};

interface PlexusNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/**
 * Lightweight 30fps-capped Constellation / Plexus canvas (48 nodes, <0.15ms/frame).
 * Pure ambient drift with zero pointer listeners; pauses on hidden tab & prefers-reduced-motion.
 */
const LibraryPlexusCanvas: React.FC<{ folderColor?: string }> = React.memo(({ folderColor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorsRef = useRef(buildPlexusColors(folderColor));
  colorsRef.current = buildPlexusColors(folderColor);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const nodeCount = width < 768 ? 28 : 48;
    const nodes: PlexusNode[] = [];

    const initNodes = () => {
      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: 56 + Math.random() * Math.max(200, height - 64),
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: 1.9 + Math.random() * 2.2,
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length === 0) initNodes();
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let rafId = 0;
    let lastTs = 0;

    const drawFrame = (ts: number) => {
      if (document.hidden) {
        rafId = window.requestAnimationFrame(drawFrame);
        return;
      }
      if (ts - lastTs < 32) {
        rafId = window.requestAnimationFrame(drawFrame);
        return;
      }
      lastTs = ts;

      ctx.clearRect(0, 0, width, height);
      const tone = colorsRef.current;
      const maxDist = Math.min(245, Math.min(width, height) * 0.28);
      const topBound = 52;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!prefersReducedMotion) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -12) n.x = width + 12;
          if (n.x > width + 12) n.x = -12;
          if (n.y < topBound) {
            n.y = topBound;
            n.vy = Math.abs(n.vy);
          }
          if (n.y > height + 12) {
            n.y = height + 12;
            n.vy = -Math.abs(n.vy);
          }
        }
      }

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxDist) {
            const prox = 1 - d / maxDist;
            const alpha = 0.36 * prox;
            const rgb = tone.edgeRgb;
            ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.05;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const rgb = tone.nodeRgb;
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.14)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.52)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(drawFrame);
    };

    rafId = window.requestAnimationFrame(drawFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
});

LibraryPlexusCanvas.displayName = 'LibraryPlexusCanvas';

/**
 * Ambient background layer for the Library view supporting:
 * 1. 'arcs'   — Pure-CSS (0% JS / 0 RAF) counter-rotating concentric arcs (default)
 * 2. 'plexus' — Interactive sparse nodes & edges network with mouse hover highlight
 * 3. 'off'    — Disabled (zero DOM / zero GPU)
 */
export const LibraryAmbientArcDial: React.FC<LibraryAmbientArcDialProps> = React.memo(
  ({ folderColor, effectMode = 'arcs' }) => {
    const p = useMemo(() => buildFolderTintedPalette(folderColor), [folderColor]);

    if (effectMode === 'off') return null;

    return (
      <div aria-hidden="true" className="bn-library-ambient-arcs-layer">
        <div className="bn-library-ambient-topleft-glow" />
        {effectMode === 'plexus' ? (
          <LibraryPlexusCanvas folderColor={folderColor} />
        ) : (
          <div className="bn-library-ambient-arcs-mask">
            <div className="bn-library-ambient-arcs-dial">
              <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
                <g className="bn-arc-ring-outer">
                  <path d={ARC_PATHS.outer1} fill={p.outerFill1} className="bn-arc-color-transition" />
                  <path d={ARC_PATHS.outer2} fill={p.outerFill2} className="bn-arc-color-transition" />
                  <path
                    d={ARC_PATHS.outer3}
                    fill="none"
                    stroke={p.innerStroke}
                    strokeWidth={1.15}
                    className="bn-arc-color-transition"
                  />
                </g>

                <g className="bn-arc-ring-mid">
                  <path d={ARC_PATHS.mid1} fill={p.midFill2} className="bn-arc-color-transition" />
                  <path d={ARC_PATHS.mid2} fill={p.midFill1} className="bn-arc-color-transition" />
                  <path
                    d={ARC_PATHS.mid3}
                    fill="none"
                    stroke={p.midStroke}
                    strokeWidth={1.25}
                    className="bn-arc-color-transition"
                  />
                  <path
                    d={ARC_PATHS.mid4}
                    fill="none"
                    stroke={p.midStroke}
                    strokeWidth={1.25}
                    className="bn-arc-color-transition"
                  />
                </g>

                <g className="bn-arc-ring-inner">
                  <path d={ARC_PATHS.inner1} fill={p.innerFill} className="bn-arc-color-transition" />
                  <path
                    d={ARC_PATHS.inner2}
                    fill="none"
                    stroke={p.innerStroke}
                    strokeWidth={1.05}
                    className="bn-arc-color-transition"
                  />
                  <path d={ARC_PATHS.inner3} fill={p.outerFill2} className="bn-arc-color-transition" />
                </g>
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  }
);

LibraryAmbientArcDial.displayName = 'LibraryAmbientArcDial';
