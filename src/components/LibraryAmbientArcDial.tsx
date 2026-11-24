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

/**
 * Lightweight 30fps-capped 3D perspective undulating node-mesh carpet ("Κόμβοι").
 * Zero per-frame allocations (preallocated Float32Arrays), zero pointer listeners,
 * pauses automatically on hidden tab & prefers-reduced-motion, unmounts outside Library.
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
    let cols = width < 768 ? 18 : 30;
    let rows = width < 768 ? 14 : 19;
    let total = cols * rows;
    let projX = new Float32Array(total);
    let projY = new Float32Array(total);
    let projScale = new Float32Array(total);
    let projFade = new Float32Array(total);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      cols = width < 768 ? 18 : 30;
      rows = width < 768 ? 14 : 19;
      total = cols * rows;
      if (projX.length !== total) {
        projX = new Float32Array(total);
        projY = new Float32Array(total);
        projScale = new Float32Array(total);
        projFade = new Float32Array(total);
      }
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let rafId = 0;
    let lastTs = 0;
    let phase = 0;

    const drawFrame = (ts: number) => {
      if (document.hidden) {
        rafId = window.requestAnimationFrame(drawFrame);
        return;
      }
      if (ts - lastTs < 32) {
        rafId = window.requestAnimationFrame(drawFrame);
        return;
      }
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.032;
      lastTs = ts;
      if (!prefersReducedMotion) {
        phase += dt * 0.56; // Slow, calm carpet undulation
      }

      ctx.clearRect(0, 0, width, height);
      const tone = colorsRef.current;
      const xFov = Math.max(width, height) * 0.66;
      const yFov = height * 0.68;
      // High horizon so distant crests rise softly toward the folders
      const horizonY = height * 0.41;

      // 1. Project 3D undulating carpet grid into screen space
      for (let r = 0; r < rows; r++) {
        const depthT = r / (rows - 1); // 0 = nearest front row, 1 = farthest horizon row
        // Front row (z=0.28) mathematically guarantees projY > 1.20 * height even at peak wave crest
        const z = 0.28 + Math.pow(depthT, 1.15) * 3.85;
        // Soft fade-out toward the horizon (top)
        const horizonFade = Math.pow(1 - depthT, 1.38);

        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const u = c / (cols - 1) - 0.5; // -0.5 .. +0.5
          // Wide enough to always bleed cleanly beyond left & right edges at all depths
          const worldX = u * 3.8;
          const waveY =
            0.12 * Math.sin(c * 0.40 + phase) +
            0.095 * Math.cos(r * 0.48 - phase * 0.74) +
            0.05 * Math.sin((c + r) * 0.30 + phase * 0.50);
          // worldY >= 0.315 at all times -> front row (r=0) stays strictly below viewport bottom
          const worldY = 0.58 + waveY;

          const invZ = 1 / z;
          projX[idx] = width * 0.5 + worldX * xFov * invZ;
          projY[idx] = horizonY + worldY * yFov * invZ;
          projScale[idx] = Math.min(1.6, invZ);
          projFade[idx] = horizonFade;
        }
      }

      // 2. Draw wireframe edges (back-to-front for natural depth)
      const er = tone.edgeRgb[0];
      const eg = tone.edgeRgb[1];
      const eb = tone.edgeRgb[2];
      for (let r = rows - 1; r >= 0; r--) {
        const rowFade = projFade[r * cols];
        const edgeAlpha = 0.34 * rowFade;
        if (edgeAlpha < 0.015) continue;

        ctx.strokeStyle = `rgba(${er},${eg},${eb},${edgeAlpha.toFixed(3)})`;
        ctx.lineWidth = 0.65 + projScale[r * cols] * 0.48;
        ctx.beginPath();

        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const x = projX[idx];
          const y = projY[idx];

          // Horizontal edge to right neighbor
          if (c < cols - 1) {
            ctx.moveTo(x, y);
            ctx.lineTo(projX[idx + 1], projY[idx + 1]);
          }
          // Depth edge to nearer row
          if (r > 0) {
            const nearIdx = (r - 1) * cols + c;
            ctx.moveTo(x, y);
            ctx.lineTo(projX[nearIdx], projY[nearIdx]);
            // Alternating diagonal creates a clean organic triangulated mesh like the reference
            if ((r + c) % 2 === 0 && c < cols - 1) {
              ctx.moveTo(x, y);
              ctx.lineTo(projX[nearIdx + 1], projY[nearIdx + 1]);
            }
          }
        }
        ctx.stroke();
      }

      // 3. Draw soft luminous nodes (subtle core + delicate halo scaled by perspective)
      const nr = tone.nodeRgb[0];
      const ng = tone.nodeRgb[1];
      const nb = tone.nodeRgb[2];
      for (let r = rows - 1; r >= 0; r--) {
        const rowFade = projFade[r * cols];
        if (rowFade < 0.03) continue;
        const scale = projScale[r * cols];
        const radius = Math.max(0.9, 2.35 * scale);
        const haloRadius = radius + 2.4 * scale;
        const coreAlpha = 0.36 * rowFade;
        const haloAlpha = 0.09 * rowFade;

        ctx.fillStyle = `rgba(${nr},${ng},${nb},${haloAlpha.toFixed(3)})`;
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const x = projX[idx];
          const y = projY[idx];
          ctx.moveTo(x + haloRadius, y);
          ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.fillStyle = `rgba(${nr},${ng},${nb},${coreAlpha.toFixed(3)})`;
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const x = projX[idx];
          const y = projY[idx];
          ctx.moveTo(x + radius, y);
          ctx.arc(x, y, radius, 0, Math.PI * 2);
        }
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
