import type { StrokeObject, BezierPoint } from '../types/note';

export type ShadingStyle3D = 'studio' | 'sketch' | 'flat' | 'wireframe';

export const SHADED_3D_SHAPE_TYPES = new Set([
  'shaded-cuboid',
  'shaded-cylinder',
  'shaded-sphere',
  'shaded-pyramid',
  'shaded-floor',
  'shaded-wedge',
  'shaded-arrow',
]);

export const EXTRUDABLE_2D_SHAPE_TYPES = new Set([
  'rectangle',
  'triangle',
  'trapezoid',
  'parallelogram',
  'circle',
  'ellipse',
  'polygon',
  'incline-wedge',
  'incline-block',
]);

export function hasExtrude3D(s: StrokeObject): boolean {
  if (SHADED_3D_SHAPE_TYPES.has(s.shapeType || '')) return false;
  if (s.extrudeShape3D === 'sphere') return true;
  return (
    (typeof s.extrudeDx === 'number' || typeof s.extrudeDy === 'number') &&
    Math.hypot(s.extrudeDx || 0, s.extrudeDy || 0) >= 2
  );
}

export function is3DStudioShape(s: StrokeObject): boolean {
  return SHADED_3D_SHAPE_TYPES.has(s.shapeType || '') || hasExtrude3D(s);
}

export function isExtrudable2DShape(s: StrokeObject): boolean {
  if (!s.points || s.points.length < 3) return false;
  if (SHADED_3D_SHAPE_TYPES.has(s.shapeType || '')) return false;
  if (s.shapeType === 'stickman' || s.shapeType === 'stickman-3d' || s.shapeType === 'title-box') {
    return false;
  }
  if (EXTRUDABLE_2D_SHAPE_TYPES.has(s.shapeType || '')) return true;
  // Also allow any closed freehand/polygon stroke (start near end or marked closed via twist===999)
  const first = s.points[0];
  const last = s.points[s.points.length - 1];
  if (first.twist === 999 || Math.hypot(first.x - last.x, first.y - last.y) <= 14) {
    return true;
  }
  return false;
}

/** Parse hex color into [r, g, b] */
function parseHexRgb(hex: string): [number, number, number] {
  const clean = (hex || '#64748b').replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.length >= 6
        ? clean.slice(0, 6)
        : '64748b';
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [100, 116, 139];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixRgb(a: [number, number, number], b: [number, number, number], t: number): string {
  const u = Math.max(0, Math.min(1, t));
  const r = Math.round(a[0] + (b[0] - a[0]) * u);
  const g = Math.round(a[1] + (b[1] - a[1]) * u);
  const bl = Math.round(a[2] + (b[2] - a[2]) * u);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** Sample circle/ellipse, cubic/quadratic bezier, or polygon boundary cleanly into a vertex ring */
function sampleRingFromStroke(s: StrokeObject): { x: number; y: number }[] {
  const pts = s.points;
  if (!pts || pts.length < 3) return [];

  // BestNotes stores circles & ellipses as 4 cardinal nodes: [Top, Right, Bottom, Left].
  // Sample 4 smooth closed cubic-Bézier quarter arcs passing EXACTLY through all 4 nodes
  // (exact ellipse when symmetric, AND stays 100% attached if user drags any single node!).
  if ((s.shapeType === 'circle' || s.shapeType === 'ellipse') && pts.length === 4) {
    const k = 0.55228475 * 0.5;
    const tangents = pts.map((_, i) => {
      const prev = pts[(i + 3) % 4];
      const next = pts[(i + 1) % 4];
      return { x: (next.x - prev.x) * k, y: (next.y - prev.y) * k };
    });
    const ring: { x: number; y: number }[] = [];
    const STEPS_PER_ARC = 12; // 4 * 12 = 48 smooth segments
    for (let i = 0; i < 4; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % 4];
      const ta = tangents[i];
      const tb = tangents[(i + 1) % 4];
      const cp1x = a.x + ta.x;
      const cp1y = a.y + ta.y;
      const cp2x = b.x - tb.x;
      const cp2y = b.y - tb.y;
      for (let st = 0; st < STEPS_PER_ARC; st++) {
        const t = st / STEPS_PER_ARC;
        const mt = 1 - t;
        ring.push({
          x:
            mt * mt * mt * a.x +
            3 * mt * mt * t * cp1x +
            3 * mt * t * t * cp2x +
            t * t * t * b.x,
          y:
            mt * mt * mt * a.y +
            3 * mt * mt * t * cp1y +
            3 * mt * t * t * cp2y +
            t * t * t * b.y,
        });
      }
    }
    let signedArea = 0;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];
      signedArea += a.x * b.y - b.x * a.y;
    }
    if (signedArea < 0) ring.reverse();
    return ring;
  }

  const isCurved =
    s.shapeType === 'circle' ||
    s.shapeType === 'ellipse' ||
    pts.some(
      (p) =>
        p.inDx !== undefined ||
        p.outDx !== undefined ||
        p.cx !== undefined
    );

  const ring: { x: number; y: number }[] = [];

  if (isCurved) {
    const segCount = pts.length - 1;
    const stepsPerSeg = Math.max(4, Math.min(14, Math.ceil(48 / Math.max(1, segCount))));
    for (let i = 0; i < segCount; i++) {
      const a: BezierPoint = pts[i];
      const b: BezierPoint = pts[i + 1];
      const hasCubic =
        (a.outDx !== undefined && a.outDy !== undefined) ||
        (b.inDx !== undefined && b.inDy !== undefined);
      const hasQuad = !hasCubic && b.cx !== undefined && b.cy !== undefined;
      const cp1x = a.x + (a.outDx ?? 0);
      const cp1y = a.y + (a.outDy ?? 0);
      const cp2x = b.x + (b.inDx ?? 0);
      const cp2y = b.y + (b.inDy ?? 0);
      for (let st = 0; st < stepsPerSeg; st++) {
        const t = st / stepsPerSeg;
        if (hasCubic) {
          const mt = 1 - t;
          const x =
            mt * mt * mt * a.x +
            3 * mt * mt * t * cp1x +
            3 * mt * t * t * cp2x +
            t * t * t * b.x;
          const y =
            mt * mt * mt * a.y +
            3 * mt * mt * t * cp1y +
            3 * mt * t * t * cp2y +
            t * t * t * b.y;
          ring.push({ x, y });
        } else if (hasQuad) {
          const mt = 1 - t;
          const x = mt * mt * a.x + 2 * mt * t * b.cx! + t * t * b.x;
          const y = mt * mt * a.y + 2 * mt * t * b.cy! + t * t * b.y;
          ring.push({ x, y });
        } else {
          ring.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        }
      }
    }
  } else {
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (ring.length === 0 || Math.hypot(p.x - ring[ring.length - 1].x, p.y - ring[ring.length - 1].y) >= 1.5) {
        ring.push({ x: p.x, y: p.y });
      }
    }
  }

  // Drop duplicate closing vertex if identical to ring[0]
  if (ring.length > 3 && Math.hypot(ring[0].x - ring[ring.length - 1].x, ring[0].y - ring[ring.length - 1].y) < 3) {
    ring.pop();
  }

  // Ensure consistent counter-clockwise (or clockwise in screen coords) winding
  // In screen coords (Y down), positive signed area = clockwise visually
  let signedArea = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    signedArea += a.x * b.y - b.x * a.y;
  }
  if (signedArea < 0) {
    ring.reverse();
  }
  return ring;
}

/**
 * Returns the anchor vertex (front top-right-most corner) and current draggable 3D handle position
 * for ANY extruded 2D shape OR supported shaded 3D shape ('shaded-cuboid', 'shaded-floor', 'shaded-wedge').
 */
export function get3DExtrudeHandleAnchorAndPos(
  s: StrokeObject
): { anchor: { x: number; y: number }; handle: { x: number; y: number }; dx: number; dy: number } | null {
  if (!s.points || s.points.length < 3) return null;
  if (s.extrudeShape3D === 'sphere') return null;

  if (hasExtrude3D(s)) {
    const ring = sampleRingFromStroke(s);
    if (ring.length < 3) return null;
    // Pick top-right-most point as visual anchor for the extrusion handle
    let best = ring[0];
    let bestScore = best.x - best.y;
    for (const p of ring) {
      const score = p.x - p.y;
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    const dx = s.extrudeDx ?? 28;
    const dy = s.extrudeDy ?? -22;
    return {
      anchor: best,
      handle: { x: best.x + dx, y: best.y + dy },
      dx,
      dy,
    };
  }

  if (
    s.shapeType === 'shaded-cuboid' ||
    s.shapeType === 'shaded-floor' ||
    s.shapeType === 'shaded-wedge'
  ) {
    const [p0, p1, p2, p3] = s.points;
    if (!p0 || !p1 || !p2 || !p3) return null;
    const bilerp = (u: number, v: number) => ({
      x: (1 - u) * (1 - v) * p0.x + u * (1 - v) * p1.x + u * v * p2.x + (1 - u) * v * p3.x,
      y: (1 - u) * (1 - v) * p0.y + u * (1 - v) * p1.y + u * v * p2.y + (1 - u) * v * p3.y,
    });
    const anchor =
      s.shapeType === 'shaded-cuboid'
        ? bilerp(0.72, 0.28)
        : s.shapeType === 'shaded-floor'
          ? bilerp(0.86, 0.78)
          : bilerp(0.04, 0.28);
    const defaultBack =
      s.shapeType === 'shaded-cuboid'
        ? bilerp(1.0, 0.0)
        : s.shapeType === 'shaded-floor'
          ? bilerp(0.98, 0.22)
          : bilerp(0.28, 0.08);
    const dx = s.extrudeDx ?? defaultBack.x - anchor.x;
    const dy = s.extrudeDy ?? defaultBack.y - anchor.y;
    return {
      anchor,
      handle: { x: anchor.x + dx, y: anchor.y + dy },
      dx,
      dy,
    };
  }

  return null;
}

/**
 * Draws clean diagonal pencil-hatching lines strictly inside a polygon using
 * exact analytical line-polygon clipping (NEVER overflows outside the face!).
 */
function drawSketchHatching(
  ctx: CanvasRenderingContext2D,
  poly: { x: number; y: number }[],
  inkColor: string,
  darkness: number,
  baseOpacity = 1
) {
  if (darkness <= 0.14 || poly.length < 3) return;
  // Hatch line direction: diagonal 45° (u = (0.707, -0.707)), normal n = (0.707, 0.707)
  const nx = 0.70710678;
  const ny = 0.70710678;
  let minProj = Infinity;
  let maxProj = -Infinity;
  for (const p of poly) {
    const pr = p.x * nx + p.y * ny;
    if (pr < minProj) minProj = pr;
    if (pr > maxProj) maxProj = pr;
  }
  const spacing = Math.max(5.5, 12.5 - darkness * 6.5);

  ctx.save();
  ctx.strokeStyle = inkColor;
  ctx.globalAlpha = baseOpacity * Math.min(0.36, 0.12 + darkness * 0.26);
  ctx.lineWidth = 0.85;
  ctx.beginPath();

  const m = poly.length;
  for (let d = minProj + spacing * 0.5; d < maxProj; d += spacing) {
    const hits: { x: number; y: number; t: number }[] = [];
    for (let i = 0; i < m; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % m];
      const pa = a.x * nx + a.y * ny - d;
      const pb = b.x * nx + b.y * ny - d;
      if ((pa <= 0 && pb > 0) || (pb <= 0 && pa > 0)) {
        const frac = pa / (pa - pb);
        const ix = a.x + (b.x - a.x) * frac;
        const iy = a.y + (b.y - a.y) * frac;
        hits.push({ x: ix, y: iy, t: ix * ny - iy * nx });
      }
    }
    if (hits.length >= 2) {
      hits.sort((u, v) => u.t - v.t);
      for (let k = 0; k + 1 < hits.length; k += 2) {
        ctx.moveTo(hits[k].x, hits[k].y);
        ctx.lineTo(hits[k + 1].x, hits[k + 1].y);
      }
    }
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Core renderer for any front polygon ring extruded by (dx, dy) with full 4-style shading
 * ('studio' | 'sketch' | 'flat' | 'wireframe') and directional lighting (`lightAngle3D`).
 * Shared by both extruded 2D shapes AND customizable 3D primitives (cuboid, floor, wedge).
 */
export function drawPolyExtruded3D(
  ctx: CanvasRenderingContext2D,
  rawFrontPts: { x: number; y: number }[],
  dx: number,
  dy: number,
  s: StrokeObject
): boolean {
  if (!rawFrontPts || rawFrontPts.length < 3) return false;
  const frontPts = rawFrontPts.map((p) => ({ x: p.x, y: p.y }));
  // Ensure consistent CW screen winding (positive signed area)
  let signedArea = 0;
  for (let i = 0; i < frontPts.length; i++) {
    const a = frontPts[i];
    const b = frontPts[(i + 1) % frontPts.length];
    signedArea += a.x * b.y - b.x * a.y;
  }
  if (signedArea < 0) frontPts.reverse();

  const depthLen = Math.hypot(dx, dy);
  if (depthLen < 1.5) return false;

  const style: ShadingStyle3D = s.shadingStyle3D || 'studio';
  const lightDeg = s.lightAngle3D ?? 45;
  const lightRad = (lightDeg * Math.PI) / 180;
  // Light unit vector in screen space (y-down, so 45° = top-right = (+0.707, -0.707))
  const lx = Math.cos(lightRad);
  const ly = -Math.sin(lightRad);

  // Smooth 1-point perspective convergence when a rectangle is extruded straight up/down (dx near 0):
  // the back edge tapers symmetrically inward (/‾‾‾‾\) so the top face reads as true 3D receding depth!
  let frontMinX = Infinity,
    frontMaxX = -Infinity;
  for (const p of frontPts) {
    if (p.x < frontMinX) frontMinX = p.x;
    if (p.x > frontMaxX) frontMaxX = p.x;
  }
  const frontW = Math.max(10, frontMaxX - frontMinX);
  const frontCx = (frontMinX + frontMaxX) * 0.5;
  const centerBlend =
    s.shapeType === 'rectangle' && Math.abs(dy) >= 4
      ? Math.max(0, 1 - Math.abs(dx) / 22)
      : 0;
  const perspTaper =
    centerBlend > 0
      ? centerBlend * Math.min(0.24, (Math.abs(dy) / Math.max(60, frontW)) * 0.42 + 0.08)
      : 0;

  const backPts = frontPts.map((p) => ({
    x: frontCx + (p.x - frontCx) * (1 - perspTaper) + dx,
    y: p.y + dy,
  }));

  // Base color: prefer fillColor if set and not transparent, otherwise stroke color
  const rawHex =
    s.fillColor && s.fillStyle && s.fillStyle !== 'none' ? s.fillColor : s.color || '#64748b';
  // If user drew with pure black ink in 'studio' mode, lift to sleek architectural slate so shading is visible!
  let baseRgb = parseHexRgb(rawHex);
  const lum = 0.299 * baseRgb[0] + 0.587 * baseRgb[1] + 0.114 * baseRgb[2];
  if (style === 'studio' && lum < 45) {
    baseRgb = [100, 116, 139]; // Sleek studio cool-slate grey (like Blender clay!)
  }

  const inkColor = lum < 80 ? rawHex : mixRgb(baseRgb, [15, 23, 42], 0.55);
  const contourW = Math.max(1.0, Math.min(2.6, (s.width || 2.5) * 0.72));

  // Bounding box of combined front + back for soft ground contact shadow
  let minX = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of frontPts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  for (const p of backPts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  ctx.save();
  ctx.globalAlpha = s.opacity ?? 1;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 1. Subtle, Natural Elliptical Contact Shadow (properly scaled radial falloff -> zero hard oval edge!)
  if (style === 'studio' || style === 'flat') {
    const shCx = (minX + maxX) * 0.5 - lx * 3;
    const shRx = Math.max(14, (maxX - minX) * 0.46);
    const shRy = Math.max(3, Math.min(7.5, depthLen * 0.14));
    const shAlpha =
      (style === 'studio' ? 0.15 : 0.09) *
      (s.fillTransparency !== undefined
        ? Math.max(0.15, (100 - s.fillTransparency) / 100)
        : 1);
    ctx.save();
    ctx.translate(shCx, maxY + 1.5);
    ctx.scale(1, shRy / shRx);
    const shG = ctx.createRadialGradient(0, 0, 0, 0, 0, shRx);
    shG.addColorStop(0, `rgba(15, 23, 42, ${shAlpha.toFixed(3)})`);
    shG.addColorStop(0.55, `rgba(15, 23, 42, ${(shAlpha * 0.42).toFixed(3)})`);
    shG.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = shG;
    ctx.beginPath();
    ctx.arc(0, 0, shRx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Upright mode (top cap visible on top) makes geometric sense for curved bases (cylinders) & slanted bases (parallelograms/prisms),
  // whereas an axis-aligned rectangle extruded straight up is a front face with a receding top ledge!
  const isUpright =
    s.shapeType !== 'rectangle' &&
    dy < -4 &&
    Math.abs(dx) <= Math.max(12, Math.abs(dy) * 0.28);

  // 2. Wireframe mode: textbook 3D stereometry hidden-line rendering!
  //    ONLY the truly occluded back/bottom edges are dashed; all visible outer & front edges are crisp solid!
  if (style === 'wireframe') {
    const nW = frontPts.length;
    const uxW = dx / depthLen;
    const uyW = dy / depthLen;
    const isSmoothW = nW > 16;

    // Determine which side-wall edges face the viewer (visible) vs hidden behind the solid.
    // In upright mode (rising UP from a base), front-facing walls have outward normal pointing opposite to (uxW, uyW) (i.e. downward/forward).
    const edgeVis: boolean[] = new Array(nW);
    for (let i = 0; i < nW; i++) {
      const j = (i + 1) % nW;
      const ex = frontPts[j].x - frontPts[i].x;
      const ey = frontPts[j].y - frontPts[i].y;
      const eLen = Math.hypot(ex, ey) || 1;
      const nx = ey / eLen;
      const ny = -ex / eLen;
      const dot = nx * uxW + ny * uyW;
      edgeVis[i] = isUpright ? dot < 0.02 : dot > -0.02;
    }

    const baseAlphaW = s.opacity ?? 1;
    const fillRatioW =
      s.fillTransparency !== undefined
        ? Math.max(0.03, Math.min(0.45, ((100 - s.fillTransparency) / 100) * 0.22))
        : 0.1;

    const visibleCap = isUpright ? backPts : frontPts;
    const farCap = isUpright ? frontPts : backPts;

    // Subtle translucent fill inside visible cap
    ctx.save();
    ctx.fillStyle = mixRgb(baseRgb, [255, 255, 255], 0.72);
    ctx.globalAlpha = baseAlphaW * fillRatioW;
    ctx.beginPath();
    ctx.moveTo(visibleCap[0].x, visibleCap[0].y);
    for (let i = 1; i < nW; i++) ctx.lineTo(visibleCap[i].x, visibleCap[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2a. HIDDEN edges (faint dashed): occluded edges of the far cap + occluded connecting ribs
    ctx.save();
    ctx.strokeStyle = inkColor;
    ctx.globalAlpha = baseAlphaW * 0.28;
    ctx.lineWidth = Math.max(0.85, contourW * 0.72);
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let i = 0; i < nW; i++) {
      const j = (i + 1) % nW;
      if (!edgeVis[i]) {
        ctx.moveTo(farCap[i].x, farCap[i].y);
        ctx.lineTo(farCap[j].x, farCap[j].y);
      }
      if (!isSmoothW) {
        const prevVis = edgeVis[(i - 1 + nW) % nW];
        const currVis = edgeVis[i];
        if (!prevVis && !currVis) {
          ctx.moveTo(frontPts[i].x, frontPts[i].y);
          ctx.lineTo(backPts[i].x, backPts[i].y);
        }
      }
    }
    ctx.stroke();
    ctx.restore();

    // 2b. VISIBLE edges (crisp solid): visible cap + visible edges of far cap + visible ribs
    ctx.save();
    ctx.strokeStyle = inkColor;
    ctx.globalAlpha = baseAlphaW;
    ctx.lineWidth = Math.max(1.4, contourW * 1.1);
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(visibleCap[0].x, visibleCap[0].y);
    for (let i = 1; i < nW; i++) ctx.lineTo(visibleCap[i].x, visibleCap[i].y);
    ctx.closePath();
    for (let i = 0; i < nW; i++) {
      const j = (i + 1) % nW;
      if (edgeVis[i]) {
        ctx.moveTo(farCap[i].x, farCap[i].y);
        ctx.lineTo(farCap[j].x, farCap[j].y);
      }
      const prevVis = edgeVis[(i - 1 + nW) % nW];
      const currVis = edgeVis[i];
      if (isSmoothW) {
        // For cylinders/circles, draw the 2 silhouette tangent ribs where visibility flips!
        if (prevVis !== currVis) {
          ctx.moveTo(frontPts[i].x, frontPts[i].y);
          ctx.lineTo(backPts[i].x, backPts[i].y);
        }
      } else if (prevVis || currVis) {
        ctx.moveTo(frontPts[i].x, frontPts[i].y);
        ctx.lineTo(backPts[i].x, backPts[i].y);
      }
    }
    ctx.stroke();
    ctx.restore();

    ctx.restore();
    return true;
  }

  // 3. Build side-wall quads and sort back-to-front
  const n = frontPts.length;
  const ux = dx / depthLen;
  const uy = dy / depthLen;
  const isSmoothCurve = n > 16;

  type SideQuad = {
    idx: number;
    quad: { x: number; y: number }[];
    ndotl: number; // -1..+1
    visible: boolean;
    depthScore: number;
  };

  const quads: SideQuad[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const f0 = frontPts[i];
    const f1 = frontPts[j];
    const b1 = backPts[j];
    const b0 = backPts[i];

    // Edge vector f0 -> f1; with CW screen winding, outward normal is (ey, -ex)
    const ex = f1.x - f0.x;
    const ey = f1.y - f0.y;
    const eLen = Math.hypot(ex, ey) || 1;
    const nx = ey / eLen;
    const ny = -ex / eLen;

    const visDot = nx * ux + ny * uy;
    const ndotl = nx * lx + ny * ly;
    const midX = (f0.x + f1.x + b0.x + b1.x) * 0.25;
    const midY = (f0.y + f1.y + b0.y + b1.y) * 0.25;
    const depthScore = isUpright ? -(midX * ux + midY * uy) : midX * ux + midY * uy;

    quads.push({
      idx: i,
      quad: [f0, f1, b1, b0],
      ndotl,
      visible: isUpright ? visDot < 0.02 : visDot > -0.02,
      depthScore,
    });
  }

  // Sort farthest back first
  quads.sort((a, b) => b.depthScore - a.depthScore);

  const tracePoly = (poly: { x: number; y: number }[]) => {
    ctx.beginPath();
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
    ctx.closePath();
  };

  const baseAlpha = s.opacity ?? 1;
  const fillRatio =
    s.fillTransparency !== undefined
      ? Math.max(0.05, Math.min(1, (100 - s.fillTransparency) / 100))
      : 1;
  const faceAlpha = baseAlpha * fillRatio;

  // 4. Draw visible extruded side walls
  if (isSmoothCurve && (style === 'studio' || style === 'flat')) {
    // Silky-smooth cylindrical side wrap (ZERO vertical facet stripes!)
    const visIndices: number[] = [];
    const visByIdx: boolean[] = new Array(n).fill(false);
    for (const q of quads) {
      if (q.visible) visByIdx[q.idx] = true;
    }
    // Find contiguous visible arc start (where prev is false and curr is true)
    let arcStart = -1;
    for (let i = 0; i < n; i++) {
      if (visByIdx[i] && !visByIdx[(i - 1 + n) % n]) {
        arcStart = i;
        break;
      }
    }
    if (arcStart >= 0) {
      let cur = arcStart;
      while (visByIdx[cur] && visIndices.length < n) {
        visIndices.push(cur);
        cur = (cur + 1) % n;
      }
      visIndices.push(cur); // Closing endpoint of visible arc
    }
    if (visIndices.length >= 2) {
      const farRing = isUpright ? frontPts : backPts;
      const nearRing = isUpright ? backPts : frontPts;
      const firstIdx = visIndices[0];
      const lastIdx = visIndices[visIndices.length - 1];

      // Build one smooth closed wrap silhouette polygon (near arc -> far arc reversed)
      const wrapPoly: { x: number; y: number }[] = [];
      for (const idx of visIndices) wrapPoly.push(nearRing[idx]);
      for (let k = visIndices.length - 1; k >= 0; k--) wrapPoly.push(farRing[visIndices[k]]);

      // Cylindrical lighting gradient perpendicular to extrusion axis (ux, uy)
      const px = -uy;
      const py = ux;
      const a0 = nearRing[firstIdx];
      const a1 = nearRing[lastIdx];
      const gradDir = (a1.x - a0.x) * lx + (a1.y - a0.y) * ly >= 0 ? 1 : -1;
      const gStart = gradDir > 0 ? a1 : a0;
      const gEnd = gradDir > 0 ? a0 : a1;
      const cg = ctx.createLinearGradient(gStart.x, gStart.y, gEnd.x, gEnd.y);
      if (style === 'studio') {
        cg.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.72));
        cg.addColorStop(0.28, mixRgb(baseRgb, [255, 255, 255], 0.28));
        cg.addColorStop(0.65, mixRgb(baseRgb, [15, 23, 42], 0.22));
        cg.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.48));
      } else {
        cg.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.48));
        cg.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.24));
      }
      ctx.globalAlpha = faceAlpha;
      ctx.fillStyle = cg;
      tracePoly(wrapPoly);
      ctx.fill();

      // Clean outer silhouette contour (far arc + 2 tangent side ribs)
      ctx.globalAlpha = baseAlpha;
      ctx.strokeStyle = style === 'studio' ? mixRgb(baseRgb, [15, 23, 42], 0.34) : inkColor;
      ctx.lineWidth = style === 'studio' ? Math.max(0.9, contourW * 0.65) : Math.max(1.4, contourW);
      ctx.beginPath();
      ctx.moveTo(nearRing[firstIdx].x, nearRing[firstIdx].y);
      ctx.lineTo(farRing[firstIdx].x, farRing[firstIdx].y);
      for (let k = 1; k < visIndices.length; k++) {
        ctx.lineTo(farRing[visIndices[k]].x, farRing[visIndices[k]].y);
      }
      ctx.lineTo(nearRing[lastIdx].x, nearRing[lastIdx].y);
      ctx.stroke();
      void px;
      void py;
    }
  } else {
    for (const q of quads) {
      if (!q.visible) continue;
      const brightness = (q.ndotl + 1) * 0.5; // 0 (dark) .. 1 (brightest)

      if (style === 'studio') {
        const [f0, , b1] = q.quad;
        const g = ctx.createLinearGradient(b1.x, b1.y, f0.x, f0.y);
        if (brightness > 0.55) {
          g.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.88));
          g.addColorStop(0.6, mixRgb(baseRgb, [255, 255, 255], 0.52));
          g.addColorStop(1, mixRgb(baseRgb, [255, 255, 255], 0.22));
        } else if (brightness > 0.3) {
          g.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.42));
          g.addColorStop(0.55, mixRgb(baseRgb, [255, 255, 255], 0.08));
          g.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.24));
        } else {
          g.addColorStop(0, mixRgb(baseRgb, [15, 23, 42], 0.14));
          g.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.48));
        }
        ctx.globalAlpha = faceAlpha;
        ctx.fillStyle = g;
        tracePoly(q.quad);
        ctx.fill();
        ctx.globalAlpha = baseAlpha;
        ctx.strokeStyle = mixRgb(baseRgb, [15, 23, 42], 0.28);
        ctx.lineWidth = Math.max(0.75, contourW * 0.55);
        ctx.stroke();
      } else if (style === 'flat') {
        ctx.globalAlpha = faceAlpha;
        ctx.fillStyle =
          brightness > 0.55
            ? mixRgb(baseRgb, [255, 255, 255], 0.62)
            : brightness > 0.3
              ? mixRgb(baseRgb, [255, 255, 255], 0.25)
              : mixRgb(baseRgb, [15, 23, 42], 0.26);
        tracePoly(q.quad);
        ctx.fill();
        ctx.globalAlpha = baseAlpha;
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = Math.max(1.3, contourW);
        ctx.stroke();
      } else if (style === 'sketch') {
        ctx.globalAlpha = faceAlpha;
        ctx.fillStyle =
          brightness > 0.55 ? '#ffffff' : brightness > 0.3 ? '#f8fafc' : '#eef2f6';
        tracePoly(q.quad);
        ctx.fill();
        drawSketchHatching(ctx, q.quad, inkColor, 1 - brightness, faceAlpha);
        ctx.globalAlpha = baseAlpha;
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = Math.max(1.4, contourW * 1.05);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = baseAlpha;

  // 5. Draw Visible Cap Face (Top lid when rising upright, or Front face when extruding backward)
  const capPts = isUpright ? backPts : frontPts;
  let fMinX = Infinity,
    fMinY = Infinity,
    fMaxX = -Infinity,
    fMaxY = -Infinity;
  for (const p of capPts) {
    if (p.x < fMinX) fMinX = p.x;
    if (p.y < fMinY) fMinY = p.y;
    if (p.x > fMaxX) fMaxX = p.x;
    if (p.y > fMaxY) fMaxY = p.y;
  }
  const fCx = (fMinX + fMaxX) * 0.5;
  const fCy = (fMinY + fMaxY) * 0.5;
  const fSpan = Math.max(12, Math.hypot(fMaxX - fMinX, fMaxY - fMinY) * 0.55);

  if (style === 'studio') {
    const fg = ctx.createLinearGradient(
      fCx + lx * fSpan,
      fCy + ly * fSpan,
      fCx - lx * fSpan,
      fCy - ly * fSpan
    );
    if (isUpright) {
      // Top lid catches overhead studio light brightly!
      fg.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.90));
      fg.addColorStop(0.55, mixRgb(baseRgb, [255, 255, 255], 0.56));
      fg.addColorStop(1, mixRgb(baseRgb, [255, 255, 255], 0.22));
    } else {
      fg.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.24));
      fg.addColorStop(0.5, mixRgb(baseRgb, [15, 23, 42], 0.14));
      fg.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.42));
    }
    ctx.globalAlpha = faceAlpha;
    ctx.fillStyle = fg;
    tracePoly(capPts);
    ctx.fill();

    // Subtle bright specular bevel along cap edge
    ctx.save();
    ctx.globalAlpha = baseAlpha;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = Math.max(0.85, contourW * 0.65);
    tracePoly(capPts);
    ctx.stroke();
    ctx.restore();

    ctx.globalAlpha = baseAlpha;
    ctx.strokeStyle = mixRgb(baseRgb, [15, 23, 42], 0.34);
    ctx.lineWidth = Math.max(0.85, contourW * 0.6);
    tracePoly(capPts);
    ctx.stroke();
  } else if (style === 'flat') {
    ctx.globalAlpha = faceAlpha;
    ctx.fillStyle = isUpright
      ? mixRgb(baseRgb, [255, 255, 255], 0.65)
      : mixRgb(baseRgb, [255, 255, 255], 0.12);
    tracePoly(capPts);
    ctx.fill();
    ctx.globalAlpha = baseAlpha;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = Math.max(1.5, contourW * 1.1);
    ctx.stroke();
  } else if (style === 'sketch') {
    ctx.globalAlpha = faceAlpha;
    ctx.fillStyle = '#ffffff';
    tracePoly(capPts);
    ctx.fill();
    drawSketchHatching(ctx, capPts, inkColor, 0.20, faceAlpha);
    ctx.globalAlpha = baseAlpha;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = Math.max(1.6, contourW * 1.15);
    ctx.stroke();
  }

  ctx.restore();
  return true;
}

/**
 * Renders any extruded 2D shape as a true 2.5D/3D solid with:
 * - Directional studio lighting (`lightAngle3D`)
 * - Painter's-algorithm visible side face sorting (works in ANY extrude direction!)
 * - 4 one-click shading styles: 'studio' | 'sketch' | 'flat' | 'wireframe'
 */
export function drawExtruded3DStroke(ctx: CanvasRenderingContext2D, s: StrokeObject): boolean {
  if (!hasExtrude3D(s)) return false;
  const frontPts = sampleRingFromStroke(s);
  if (frontPts.length < 3) return false;

  // 3D Sphere / Ellipsoid mode (toggled via "Σφαίρα" on any Circle or Ellipse!)
  if (s.extrudeShape3D === 'sphere') {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of frontPts) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const cx = (minX + maxX) * 0.5;
    const cy = (minY + maxY) * 0.5;
    const rx = Math.max(8, (maxX - minX) * 0.5);
    const ry = Math.max(8, (maxY - minY) * 0.5);

    const style: ShadingStyle3D = s.shadingStyle3D || 'studio';
    const lightDeg = s.lightAngle3D ?? 45;
    const lightRad = (lightDeg * Math.PI) / 180;
    const lx = Math.cos(lightRad);
    const ly = -Math.sin(lightRad);

    const rawHex =
      s.fillColor && s.fillStyle && s.fillStyle !== 'none' ? s.fillColor : s.color || '#64748b';
    let baseRgb = parseHexRgb(rawHex);
    const lum = 0.299 * baseRgb[0] + 0.587 * baseRgb[1] + 0.114 * baseRgb[2];
    if (style === 'studio' && lum < 45) {
      baseRgb = [100, 116, 139];
    }
    const inkColor = lum < 80 ? rawHex : mixRgb(baseRgb, [15, 23, 42], 0.55);
    const baseAlpha = s.opacity ?? 1;
    const fillRatio =
      s.fillTransparency !== undefined
        ? Math.max(0.05, Math.min(1, (100 - s.fillTransparency) / 100))
        : 1;
    const faceAlpha = baseAlpha * fillRatio;
    const contourW = Math.max(1.1, Math.min(2.6, (s.width || 2.5) * 0.72));

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // 1. Subtle elliptical contact shadow underneath sphere
    if (style === 'studio' || style === 'flat') {
      const shRx = rx * 0.76;
      const shRy = Math.max(3.5, Math.min(8.5, ry * 0.16));
      const shAlpha = (style === 'studio' ? 0.16 : 0.09) * Math.max(0.15, fillRatio);
      ctx.save();
      ctx.translate(cx - lx * 4, maxY + 1.5);
      ctx.scale(1, shRy / shRx);
      const shG = ctx.createRadialGradient(0, 0, 0, 0, 0, shRx);
      shG.addColorStop(0, `rgba(15, 23, 42, ${shAlpha.toFixed(3)})`);
      shG.addColorStop(0.55, `rgba(15, 23, 42, ${(shAlpha * 0.4).toFixed(3)})`);
      shG.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = shG;
      ctx.beginPath();
      ctx.arc(0, 0, shRx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (style === 'wireframe') {
      // Subtle translucent sphere tint
      ctx.save();
      ctx.globalAlpha = baseAlpha * Math.min(0.2, fillRatio * 0.14);
      ctx.fillStyle = mixRgb(baseRgb, [255, 255, 255], 0.72);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Faint dashed back equator arc (upper half of tilted equator)
      ctx.save();
      ctx.strokeStyle = inkColor;
      ctx.globalAlpha = baseAlpha * 0.28;
      ctx.lineWidth = Math.max(0.85, contourW * 0.72);
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry * 0.3, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Solid outer sphere contour + solid front equator arc
      ctx.save();
      ctx.strokeStyle = inkColor;
      ctx.globalAlpha = baseAlpha;
      ctx.lineWidth = Math.max(1.4, contourW * 1.1);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry * 0.3, 0, 0, Math.PI);
      ctx.stroke();
      ctx.restore();
    } else if (style === 'flat') {
      // Clean modern cel-shaded 3D sphere: single crisp crescent shadow + subtle glossy specular dot
      ctx.save();
      ctx.globalAlpha = faceAlpha;
      // 1. Shaded shadow-side base fill
      ctx.fillStyle = mixRgb(baseRgb, [15, 23, 42], 0.24);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Single larger offset lit circle clipped to sphere -> pure clean crescent shadow on opposite side!
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = mixRgb(baseRgb, [255, 255, 255], 0.34);
      ctx.beginPath();
      ctx.ellipse(cx + lx * rx * 0.26, cy + ly * ry * 0.26, rx * 1.02, ry * 1.02, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Crisp small specular highlight pill on the lit side
      ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
      ctx.beginPath();
      ctx.ellipse(
        cx + lx * rx * 0.44,
        cy + ly * ry * 0.44,
        Math.max(3, rx * 0.16),
        Math.max(2, ry * 0.09),
        Math.atan2(ly, lx) + Math.PI * 0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      ctx.globalAlpha = baseAlpha;
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = Math.max(1.5, contourW * 1.1);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Studio Blender-Clay 3D Sphere (5-stop radial studio lighting driven by lightAngle3D!)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, ry / rx);
      const hiX = lx * rx * 0.36;
      const hiY = ly * rx * 0.36;
      const sg = ctx.createRadialGradient(hiX, hiY, rx * 0.05, 0, 0, rx * 1.02);
      sg.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.92));
      sg.addColorStop(0.28, mixRgb(baseRgb, [255, 255, 255], 0.42));
      sg.addColorStop(0.62, mixRgb(baseRgb, [15, 23, 42], 0.12));
      sg.addColorStop(0.88, mixRgb(baseRgb, [15, 23, 42], 0.44));
      sg.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.28)); // Subtle rim bounce light
      ctx.globalAlpha = faceAlpha;
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = baseAlpha * 0.55;
      ctx.strokeStyle = mixRgb(baseRgb, [15, 23, 42], 0.36);
      ctx.lineWidth = Math.max(0.85, contourW * 0.65);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
    return true;
  }

  return drawPolyExtruded3D(ctx, frontPts, s.extrudeDx ?? 28, s.extrudeDy ?? -22, s);
}
