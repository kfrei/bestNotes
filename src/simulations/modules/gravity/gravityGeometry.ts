import type { StrokeObject, BezierPoint } from '../../../types/note';
import type {
  GravityBodyState,
  GravityEnergyStats,
  GravityLabConfig,
  GravitySegment,
} from './types';

// Scale: 1 meter = 60 logical canvas pixels (feels crisp & natural on A4 794×1123 canvas)
export const GRAVITY_PX_PER_M = 60;
export const MAX_TRAIL_PTS = 160;

export function getStrokeBounds(s: StrokeObject) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of s.points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    w: Math.max(1, maxX - minX),
    h: Math.max(1, maxY - minY),
    cx: (minX + maxX) * 0.5,
    cy: (minY + maxY) * 0.5,
  };
}

/**
 * Computes the true oriented half-extents (halfThickness <= halfLength) of a rotated box/polygon stroke
 * by projecting all vertices onto every edge normal, so a tilted block resting on an inclined ramp uses
 * its exact perpendicular half-thickness instead of the inflated axis-aligned bounding box!
 */
export function getOrientedHalfExtents(s: StrokeObject): {
  halfThickness: number;
  halfLength: number;
  longAxisAngle: number;
} {
  const pts = s.points;
  const aabb = getStrokeBounds(s);
  if (!pts || pts.length < 3) {
    return {
      halfThickness: Math.min(aabb.w, aabb.h) * 0.5,
      halfLength: Math.max(aabb.w, aabb.h) * 0.5,
      longAxisAngle: 0,
    };
  }
  let bestThickness = Math.min(aabb.w, aabb.h);
  let bestLength = Math.max(aabb.w, aabb.h);
  let bestAngle = aabb.w >= aabb.h ? 0 : Math.PI * 0.5;

  const count = pts.length;
  for (let i = 0; i < count; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % count];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy);
    if (len < 3) continue;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    let minU = Infinity;
    let maxU = -Infinity;
    let minN = Infinity;
    let maxN = -Infinity;
    for (let k = 0; k < count; k++) {
      const pk = pts[k];
      const pu = pk.x * ux + pk.y * uy;
      const pn = pk.x * nx + pk.y * ny;
      if (pu < minU) minU = pu;
      if (pu > maxU) maxU = pu;
      if (pn < minN) minN = pn;
      if (pn > maxN) maxN = pn;
    }
    const spanN = maxN - minN;
    const spanU = maxU - minU;
    if (spanN > 1 && spanN < bestThickness) {
      bestThickness = spanN;
      bestLength = Math.max(spanU, spanN);
      let ang = Math.atan2(uy, ux);
      while (ang > Math.PI * 0.5) ang -= Math.PI;
      while (ang <= -Math.PI * 0.5) ang += Math.PI;
      bestAngle = ang;
    }
  }

  return {
    halfThickness: Math.max(4, bestThickness * 0.5),
    halfLength: Math.max(4, bestLength * 0.5),
    longAxisAngle: bestAngle,
  };
}

/** Sample any stroke (line, curve, parabola, U-bowl, polygon, 3D floor/wedge) into crisp collision segments */
export function sampleStrokeToSegments(s: StrokeObject): GravitySegment[] {
  const pts = s.points;
  if (!pts || pts.length < 2) return [];
  const segs: GravitySegment[] = [];

  // 1. Built-in 3D Studio Floor ('shaded-floor'): top surface runs cleanly across the middle-top of the 3D slab!
  if (s.shapeType === 'shaded-floor' && pts.length >= 4) {
    const [q0, q1, q2, q3] = pts;
    const bilerp = (u: number, v: number) => ({
      x: (1 - u) * (1 - v) * q0.x + u * (1 - v) * q1.x + u * v * q2.x + (1 - u) * v * q3.x,
      y: (1 - u) * (1 - v) * q0.y + u * (1 - v) * q1.y + u * v * q2.y + (1 - u) * v * q3.y,
    });
    // Mid-depth contact line on top face so balls rest visually ON the 3D platform
    const leftTop = bilerp(0.06, 0.52);
    const rightTop = bilerp(0.94, 0.52);
    segs.push({ ax: leftTop.x, ay: leftTop.y, bx: rightTop.x, by: rightTop.y, strokeId: s.id });
    return segs;
  }

  // 2. Built-in 3D Studio Wedge ('shaded-wedge'): exact slope + base + back wall
  if (s.shapeType === 'shaded-wedge' && pts.length >= 4) {
    const [q0, q1, q2, q3] = pts;
    const bilerp = (u: number, v: number) => ({
      x: (1 - u) * (1 - v) * q0.x + u * (1 - v) * q1.x + u * v * q2.x + (1 - u) * v * q3.x,
      y: (1 - u) * (1 - v) * q0.y + u * (1 - v) * q1.y + u * v * q2.y + (1 - u) * v * q3.y,
    });
    const fBL = bilerp(0.04, 0.94);
    const fBR = bilerp(0.76, 0.94);
    const fTL = bilerp(0.04, 0.28);
    // Slight mid-depth offset so a ball rolls right down the middle of the 3D ramp face
    const ox = (bilerp(0.28, 0.08).x - fTL.x) * 0.45;
    const oy = (bilerp(0.28, 0.08).y - fTL.y) * 0.45;
    const pTL = { x: fTL.x + ox, y: fTL.y + oy };
    const pBR = { x: fBR.x + ox, y: fBR.y + oy };
    segs.push({ ax: pTL.x, ay: pTL.y, bx: pBR.x, by: pBR.y, strokeId: s.id });
    segs.push({ ax: fBL.x, ay: fBL.y, bx: fBR.x, by: fBR.y, strokeId: s.id });
    segs.push({ ax: fBL.x, ay: fBL.y, bx: fTL.x, by: fTL.y, strokeId: s.id });
    return segs;
  }

  // 3. Extruded 2D->3D flat platform / ramp: use slightly recessed top edge (mid-extrusion) so ball sits ON the 3D top face!
  const exDx = s.extrudeDx || 0;
  const exDy = s.extrudeDy || 0;
  const has3DDepth = Math.hypot(exDx, exDy) >= 4 && s.extrudeShape3D !== 'sphere';
  const depthMidX = has3DDepth ? exDx * 0.42 : 0;
  const depthMidY = has3DDepth ? exDy * 0.42 : 0;

  const segHalfW = Math.min(8, Math.max(1.5, (s.width || 3) * 0.5));

  // 4. Circle / Ellipse used as a static floor or hollow loop-the-loop track!
  if (s.shapeType === 'circle' || s.shapeType === 'ellipse') {
    const b = getStrokeBounds(s);
    if (b.w > b.h * 2.4 && has3DDepth && pts.length === 4) {
      // Flat 3D extruded disc -> horizontal top surface
      const yTop = b.cy + depthMidY;
      segs.push({ ax: b.minX, ay: yTop, bx: b.maxX, by: yTop, strokeId: s.id, halfWidth: segHalfW });
      return segs;
    }
    // Full 360° hollow circular/elliptical track (e.g. loop-the-loop / ανακύκλωση) -> 64 smooth perimeter segments!
    const rx = b.w * 0.5;
    const ry = b.h * 0.5;
    const STEPS = 64;
    let prevX = b.cx + rx;
    let prevY = b.cy;
    for (let i = 1; i <= STEPS; i++) {
      const ang = (i / STEPS) * Math.PI * 2;
      const curX = b.cx + rx * Math.cos(ang);
      const curY = b.cy + ry * Math.sin(ang);
      segs.push({ ax: prevX, ay: prevY, bx: curX, by: curY, strokeId: s.id, halfWidth: segHalfW });
      prevX = curX;
      prevY = curY;
    }
    return segs;
  }

  // 4b. BestNotes 3-point Parabola / Arc ('parabola' | 'arc'): exact quadratic Bézier passing through [p0, pMid, p2]!
  if ((s.shapeType === 'parabola' || s.shapeType === 'arc') && pts.length === 3) {
    const [p0, pMid, p2] = pts;
    const cx = 2 * pMid.x - (p0.x + p2.x) * 0.5;
    const cy = 2 * pMid.y - (p0.y + p2.y) * 0.5;
    const STEPS = 48;
    let prev = { x: p0.x + depthMidX, y: p0.y + depthMidY };
    for (let i = 1; i <= STEPS; i++) {
      const t = i / STEPS;
      const u = 1 - t;
      const cur = {
        x: u * u * p0.x + 2 * u * t * cx + t * t * p2.x + depthMidX,
        y: u * u * p0.y + 2 * u * t * cy + t * t * p2.y + depthMidY,
      };
      segs.push({ ax: prev.x, ay: prev.y, bx: cur.x, by: cur.y, strokeId: s.id, halfWidth: segHalfW });
      prev = cur;
    }
    return segs;
  }

  // 5. Sample Bezier curves or polylines cleanly
  const sampled: { x: number; y: number }[] = [];
  const isCurved = pts.some(
    (p) => p.inDx !== undefined || p.outDx !== undefined || p.cx !== undefined
  );
  if (isCurved) {
    const stepsPerSeg = Math.max(4, Math.min(64, Math.ceil(64 / Math.max(1, pts.length - 1))));
    for (let i = 0; i < pts.length - 1; i++) {
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
        const mt = 1 - t;
        if (hasCubic) {
          sampled.push({
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
        } else if (hasQuad) {
          sampled.push({
            x: mt * mt * a.x + 2 * mt * t * b.cx! + t * t * b.x,
            y: mt * mt * a.y + 2 * mt * t * b.cy! + t * t * b.y,
          });
        } else {
          sampled.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        }
      }
    }
    const last = pts[pts.length - 1];
    sampled.push({ x: last.x, y: last.y });
  } else {
    for (const p of pts) {
      if (
        sampled.length === 0 ||
        Math.hypot(p.x - sampled[sampled.length - 1].x, p.y - sampled[sampled.length - 1].y) >= 3
      ) {
        sampled.push({ x: p.x, y: p.y });
      }
    }
  }

  for (let i = 0; i < sampled.length - 1; i++) {
    const a = sampled[i];
    const b = sampled[i + 1];
    if (Math.hypot(b.x - a.x, b.y - a.y) >= 2) {
      segs.push({
        ax: a.x + depthMidX,
        ay: a.y + depthMidY,
        bx: b.x + depthMidX,
        by: b.y + depthMidY,
        strokeId: s.id,
        halfWidth: segHalfW,
      });
    }
  }

  // Close polygon if closed shape
  const isClosedPoly =
    s.shapeType === 'rectangle' ||
    s.shapeType === 'triangle' ||
    s.shapeType === 'trapezoid' ||
    s.shapeType === 'parallelogram' ||
    s.shapeType === 'incline-wedge' ||
    pts[0]?.twist === 999;
  if (isClosedPoly && sampled.length >= 3) {
    const first = sampled[0];
    const last = sampled[sampled.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) >= 2) {
      segs.push({
        ax: last.x + depthMidX,
        ay: last.y + depthMidY,
        bx: first.x + depthMidX,
        by: first.y + depthMidY,
        strokeId: s.id,
        halfWidth: segHalfW,
      });
    }
  }

  return segs;
}

/**
 * Classifies all visible strokes on the page into:
 * - Dynamic bodies (balls / compact squares & cubes)
 * - Static surfaces (floors, ramps, U-bowls, 5-gon steps, 3D slabs, pinned bodies)
 * - Initial velocity arrows (v0 attached to a body)
 * - String / pendulum tethers (2-pt line attached to a body)
 */
