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
  return (
    (typeof s.extrudeDx === 'number' || typeof s.extrudeDy === 'number') &&
    Math.hypot(s.extrudeDx || 0, s.extrudeDy || 0) >= 2 &&
    !SHADED_3D_SHAPE_TYPES.has(s.shapeType || '')
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

  // BestNotes stores circles & ellipses as 4 cardinal points: [Top, Right, Bottom, Left] (supports rotation & stretch!)
  if ((s.shapeType === 'circle' || s.shapeType === 'ellipse') && pts.length === 4) {
    const cx = (pts[0].x + pts[2].x) * 0.5;
    const cy = (pts[0].y + pts[2].y) * 0.5;
    const ux = pts[1].x - cx;
    const uy = pts[1].y - cy;
    const vx = pts[2].x - cx;
    const vy = pts[2].y - cy;
    const ring: { x: number; y: number }[] = [];
    const STEPS = 48;
    for (let i = 0; i < STEPS; i++) {
      const ang = (i / STEPS) * Math.PI * 2;
      const c = Math.cos(ang);
      const sn = Math.sin(ang);
      ring.push({
        x: cx + c * ux + sn * vx,
        y: cy + c * uy + sn * vy,
      });
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

  const backPts = frontPts.map((p) => ({ x: p.x + dx, y: p.y + dy }));

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

  // 2. Wireframe mode: draw subtle translucent back + dashed back edges first
  if (style === 'wireframe') {
    ctx.save();
    ctx.fillStyle = mixRgb(baseRgb, [255, 255, 255], 0.72);
    ctx.globalAlpha = (s.opacity ?? 1) * 0.14;
    ctx.beginPath();
    ctx.moveTo(backPts[0].x, backPts[0].y);
    for (let i = 1; i < backPts.length; i++) ctx.lineTo(backPts[i].x, backPts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = inkColor;
    ctx.globalAlpha = (s.opacity ?? 1) * 0.48;
    ctx.lineWidth = Math.max(1, contourW * 0.85);
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(backPts[0].x, backPts[0].y);
    for (let i = 1; i < backPts.length; i++) ctx.lineTo(backPts[i].x, backPts[i].y);
    ctx.closePath();
    // Connecting ribs (skip dense curves by stepping cleanly)
    const ribStep = frontPts.length > 16 ? Math.floor(frontPts.length / 4) : 1;
    for (let i = 0; i < frontPts.length; i += ribStep) {
      ctx.moveTo(frontPts[i].x, frontPts[i].y);
      ctx.lineTo(backPts[i].x, backPts[i].y);
    }
    ctx.stroke();
    ctx.restore();

    // Crisp solid front face
    ctx.fillStyle = mixRgb(baseRgb, [255, 255, 255], 0.82);
    ctx.save();
    ctx.globalAlpha = (s.opacity ?? 1) * 0.12;
    ctx.beginPath();
    ctx.moveTo(frontPts[0].x, frontPts[0].y);
    for (let i = 1; i < frontPts.length; i++) ctx.lineTo(frontPts[i].x, frontPts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = Math.max(1.4, contourW * 1.1);
    ctx.beginPath();
    ctx.moveTo(frontPts[0].x, frontPts[0].y);
    for (let i = 1; i < frontPts.length; i++) ctx.lineTo(frontPts[i].x, frontPts[i].y);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
    return true;
  }

  // 3. Build side-wall quads and sort back-to-front along extrusion vector (dx, dy)
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

    // A side face is visible on the outside when its outward normal points toward the extrusion direction
    const visDot = nx * ux + ny * uy;
    const ndotl = nx * lx + ny * ly;
    const midX = (f0.x + f1.x + b0.x + b1.x) * 0.25;
    const midY = (f0.y + f1.y + b0.y + b1.y) * 0.25;
    // Higher projection along (ux, uy) = farther back -> draw first
    const depthScore = midX * ux + midY * uy;

    quads.push({
      idx: i,
      quad: [f0, f1, b1, b0],
      ndotl,
      visible: visDot > -0.02,
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
      if (!isSmoothCurve) {
        ctx.globalAlpha = baseAlpha;
        ctx.strokeStyle = mixRgb(baseRgb, [15, 23, 42], 0.28);
        ctx.lineWidth = Math.max(0.75, contourW * 0.55);
        ctx.stroke();
      }
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
      if (!isSmoothCurve) {
        ctx.globalAlpha = baseAlpha;
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = Math.max(1.3, contourW);
        ctx.stroke();
      }
    } else if (style === 'sketch') {
      ctx.globalAlpha = faceAlpha;
      ctx.fillStyle =
        brightness > 0.55 ? '#ffffff' : brightness > 0.3 ? '#f8fafc' : '#eef2f6';
      tracePoly(q.quad);
      ctx.fill();
      drawSketchHatching(ctx, q.quad, inkColor, 1 - brightness, faceAlpha);
      if (!isSmoothCurve) {
        ctx.globalAlpha = baseAlpha;
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = Math.max(1.4, contourW * 1.05);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = baseAlpha;

  // For smooth curved extruded solids (cylinders/ellipses), draw clean silhouette outer contour on back arc
  if (isSmoothCurve && (style === 'flat' || style === 'sketch' || style === 'studio')) {
    ctx.strokeStyle = style === 'studio' ? mixRgb(baseRgb, [15, 23, 42], 0.32) : inkColor;
    ctx.lineWidth = style === 'studio' ? Math.max(0.85, contourW * 0.6) : Math.max(1.3, contourW);
    for (const q of quads) {
      if (!q.visible) continue;
      ctx.beginPath();
      ctx.moveTo(q.quad[3].x, q.quad[3].y);
      ctx.lineTo(q.quad[2].x, q.quad[2].y);
      ctx.stroke();
    }
  }

  // 5. Draw Front Face (nearest to viewer)
  let fMinX = Infinity,
    fMinY = Infinity,
    fMaxX = -Infinity,
    fMaxY = -Infinity;
  for (const p of frontPts) {
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
    fg.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.24));
    fg.addColorStop(0.5, mixRgb(baseRgb, [15, 23, 42], 0.14));
    fg.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.42));
    ctx.globalAlpha = faceAlpha;
    ctx.fillStyle = fg;
    tracePoly(frontPts);
    ctx.fill();

    // Subtle bright specular bevel along front edge
    ctx.save();
    ctx.globalAlpha = baseAlpha;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = Math.max(0.85, contourW * 0.65);
    tracePoly(frontPts);
    ctx.stroke();
    ctx.restore();

    ctx.globalAlpha = baseAlpha;
    ctx.strokeStyle = mixRgb(baseRgb, [15, 23, 42], 0.34);
    ctx.lineWidth = Math.max(0.85, contourW * 0.6);
    tracePoly(frontPts);
    ctx.stroke();
  } else if (style === 'flat') {
    ctx.globalAlpha = faceAlpha;
    ctx.fillStyle = mixRgb(baseRgb, [255, 255, 255], 0.12);
    tracePoly(frontPts);
    ctx.fill();
    ctx.globalAlpha = baseAlpha;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = Math.max(1.5, contourW * 1.1);
    ctx.stroke();
  } else if (style === 'sketch') {
    ctx.globalAlpha = faceAlpha;
    ctx.fillStyle = '#ffffff';
    tracePoly(frontPts);
    ctx.fill();
    drawSketchHatching(ctx, frontPts, inkColor, 0.20, faceAlpha);
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
  return drawPolyExtruded3D(ctx, frontPts, s.extrudeDx ?? 28, s.extrudeDy ?? -22, s);
}
