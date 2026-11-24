import React, { useMemo } from 'react';

interface LibraryAmbientArcDialProps {
  /** Hex color of the active Library folder (undefined/empty at root → warm beige-grey palette). */
  folderColor?: string;
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
 * Generates an ultra-soft, desaturated grey-tinted palette derived from a folder's hex color
 * (matching the elegance of the ice-blue/slate style without ever looking saturated).
 */
function buildFolderTintedPalette(hex?: string): ArcPalette {
  if (!hex) return ROOT_GREIGE_PALETTE;
  const rgb = parseHexRgb(hex);
  if (!rgb) return ROOT_GREIGE_PALETTE;

  const softMist: [number, number, number] = [214, 220, 228];
  const neutralSlate: [number, number, number] = [148, 160, 174];
  const warmStone: [number, number, number] = [174, 170, 164];

  const outer1 = mixRgb(rgb, softMist, 0.42);
  const outer2 = mixRgb(rgb, warmStone, 0.28);
  const mid1 = mixRgb(rgb, neutralSlate, 0.30);
  const mid2 = mixRgb(rgb, softMist, 0.36);
  const stroke = mixRgb(rgb, neutralSlate, 0.34);
  const inner = mixRgb(rgb, softMist, 0.26);
  const innerSt = mixRgb(rgb, warmStone, 0.26);

  return {
    outerFill1: rgba(outer1, 0.25),
    outerFill2: rgba(outer2, 0.21),
    midFill1: rgba(mid1, 0.21),
    midFill2: rgba(mid2, 0.23),
    midStroke: rgba(stroke, 0.34),
    innerFill: rgba(inner, 0.17),
    innerStroke: rgba(innerSt, 0.28),
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
 * Pure-CSS (0% JS, 0 RAF) ambient concentric geometric arc dial anchored in the
 * bottom-right corner of the Library view. Smoothly fades out toward the folders
 * and softly adopts a desaturated tint of the currently open folder's color.
 */
export const LibraryAmbientArcDial: React.FC<LibraryAmbientArcDialProps> = React.memo(
  ({ folderColor }) => {
    const p = useMemo(() => buildFolderTintedPalette(folderColor), [folderColor]);

    return (
      <div aria-hidden="true" className="bn-library-ambient-arcs-layer">
        <div className="bn-library-ambient-arcs-dial">
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
            <g className="bn-arc-ring-outer">
              <path d={ARC_PATHS.outer1} fill={p.outerFill1} className="bn-arc-color-transition" />
              <path d={ARC_PATHS.outer2} fill={p.outerFill2} className="bn-arc-color-transition" />
              <path
                d={ARC_PATHS.outer3}
                fill="none"
                stroke={p.innerStroke}
                strokeWidth={1.2}
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
                strokeWidth={1.35}
                className="bn-arc-color-transition"
              />
              <path
                d={ARC_PATHS.mid4}
                fill="none"
                stroke={p.midStroke}
                strokeWidth={1.35}
                className="bn-arc-color-transition"
              />
            </g>

            <g className="bn-arc-ring-inner">
              <path d={ARC_PATHS.inner1} fill={p.innerFill} className="bn-arc-color-transition" />
              <path
                d={ARC_PATHS.inner2}
                fill="none"
                stroke={p.innerStroke}
                strokeWidth={1.1}
                className="bn-arc-color-transition"
              />
              <path d={ARC_PATHS.inner3} fill={p.outerFill2} className="bn-arc-color-transition" />
            </g>
          </svg>
        </div>
      </div>
    );
  }
);

LibraryAmbientArcDial.displayName = 'LibraryAmbientArcDial';
