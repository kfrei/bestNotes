import type { StrokeObject, BezierPoint } from '../../../types/note';
import type {
  GravityBodyState,
  GravityEnergyStats,
  GravityLabConfig,
  GravitySegment,
} from './types';

// Scale: 1 meter = 60 logical canvas pixels (feels crisp & natural on A4 794×1123 canvas)
export const GRAVITY_PX_PER_M = 60;
const MAX_TRAIL_PTS = 160;

function getStrokeBounds(s: StrokeObject) {
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

/** Sample any stroke (line, curve, parabola, U-bowl, polygon, 3D floor/wedge) into crisp collision segments */
function sampleStrokeToSegments(s: StrokeObject): GravitySegment[] {
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

  // 4. Flat extruded ellipse disc used as a floor
  if ((s.shapeType === 'circle' || s.shapeType === 'ellipse') && pts.length === 4) {
    const b = getStrokeBounds(s);
    const yTop = b.cy + depthMidY;
    segs.push({ ax: b.minX, ay: yTop, bx: b.maxX, by: yTop, strokeId: s.id, halfWidth: segHalfW });
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
    const stepsPerSeg = Math.max(4, Math.min(16, Math.ceil(64 / Math.max(1, pts.length - 1))));
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
export function buildGravitySceneFromStrokes(
  strokes: StrokeObject[],
  pinnedOverrides: Record<string, boolean>
): {
  bodies: GravityBodyState[];
  segments: GravitySegment[];
  consumedStrokeIds: Set<string>;
} {
  const bodies: GravityBodyState[] = [];
  const segments: GravitySegment[] = [];
  const consumedStrokeIds = new Set<string>();
  const arrows: StrokeObject[] = [];
  const stickmen: StrokeObject[] = [];
  const potentialTethers: StrokeObject[] = [];
  const staticCandidates: StrokeObject[] = [];

  let bodyCounter = 1;

  for (const s of strokes) {
    if (!s.points || s.points.length < 2) continue;
    if (s.shapeType === 'stickman' || s.shapeType === 'stickman-3d') {
      stickmen.push(s);
      continue;
    }
    if (s.shapeType === 'title-box' || s.tool === 'highlighter') {
      continue;
    }

    // 1. Velocity vector arrows (initial v0)
    if (s.arrowEnd || s.arrowStart || s.shapeType === 'arrow' || s.shapeType === 'shaded-arrow') {
      arrows.push(s);
      continue;
    }

    const b = getStrokeBounds(s);
    const aspect = b.w / Math.max(1, b.h);

    // 2. Clearly static structural shapes
    if (
      s.shapeType === 'shaded-floor' ||
      s.shapeType === 'shaded-wedge' ||
      s.shapeType === 'incline-wedge' ||
      s.shapeType === 'triangle' ||
      s.shapeType === 'parabola' ||
      s.shapeType === 'arc' ||
      s.shapeType === 'sine' ||
      s.shapeType === 'cosine'
    ) {
      staticCandidates.push(s);
      continue;
    }

    // 3. 2-point straight lines: could be a tether string OR a flat floor/ramp
    if (s.shapeType === 'line' && s.points.length === 2) {
      potentialTethers.push(s);
      continue;
    }

    // 4. Open freehand curves / U-bowls -> always static track!
    const first = s.points[0];
    const last = s.points[s.points.length - 1];
    const isClosed =
      s.shapeType === 'circle' ||
      s.shapeType === 'ellipse' ||
      s.shapeType === 'sphere' ||
      s.shapeType === 'shaded-sphere' ||
      s.shapeType === 'rectangle' ||
      s.shapeType === 'cuboid' ||
      s.shapeType === 'shaded-cuboid' ||
      s.shapeType === 'trapezoid' ||
      s.shapeType === 'parallelogram' ||
      first.twist === 999 ||
      Math.hypot(first.x - last.x, first.y - last.y) <= 18;

    if (!isClosed) {
      staticCandidates.push(s);
      continue;
    }

    // 5. Flat wide shapes (width > 3 * height, e.g., 3D slab floor or wide disc) -> static floor by default!
    const isFlatPlatform = aspect > 3.0 && b.w > 75;
    // 5-gon or multi-vertex step polygon (like incline + plateau!) -> static track!
    const isComplexPolygon =
      (s.shapeType === 'rectangle' || s.shapeType === 'trapezoid') && s.points.length > 5;

    if (isComplexPolygon) {
      staticCandidates.push(s);
      continue;
    }

    const isBall =
      s.shapeType === 'circle' ||
      s.shapeType === 'ellipse' ||
      s.shapeType === 'sphere' ||
      s.shapeType === 'shaded-sphere' ||
      s.extrudeShape3D === 'sphere';

    // Default pinning heuristic:
    // - Flat wide platforms (width > 3.0 * height) -> static floor
    // - Large ramps/wedges sitting BELOW a smaller ball/box are auto-pinned in Pass 2 below!
    const defaultPinned = isFlatPlatform;
    const isPinned =
      pinnedOverrides[s.id] !== undefined ? pinnedOverrides[s.id] : defaultPinned;

    const radius = isBall
      ? Math.max(8, (b.w + b.h) * 0.25)
      : Math.max(8, Math.min(b.w, b.h) * 0.5);

    const rawMass = Math.max(0.5, Math.round(((radius * radius) / 400) * 10) / 10);
    const mass = isBall ? rawMass : Math.max(1.5, Math.min(5.0, rawMass));

    const body: GravityBodyState = {
      strokeId: s.id,
      label: isBall ? `Σφαίρα ${bodyCounter++}` : `Σώμα ${bodyCounter++}`,
      color: s.fillColor && s.fillStyle !== 'none' ? s.fillColor : s.color || '#16a34a',
      shapeKind: isBall ? 'ball' : 'box',
      pinned: isPinned,
      initCx: b.cx,
      initCy: b.cy,
      cx: b.cx,
      cy: b.cy,
      initVx: 0,
      initVy: 0,
      vx: 0,
      vy: 0,
      radius,
      halfW: b.w * 0.5,
      halfH: b.h * 0.5,
      mass,
      normalX: 0,
      normalY: 0,
      normalForceN: 0,
      frictionForceN: 0,
      onGround: false,
      trail: [{ x: b.cx, y: b.cy }],
    };

    bodies.push(body);
    if (isPinned) {
      segments.push(...sampleStrokeToSegments(s));
    } else {
      consumedStrokeIds.add(s.id);
    }
  }

  // Second pass: if a non-ball body (e.g. trapezoid/wedge/step) is BELOW and >= 2x larger in area
  // than another dynamic body in the same Lasso selection, automatically pin it as a static ramp/floor!
  if (bodies.length >= 2) {
    const strokeById = new Map(strokes.map((st) => [st.id, st]));
    for (const candidate of bodies) {
      if (candidate.pinned || candidate.shapeKind === 'ball') continue;
      if (pinnedOverrides[candidate.strokeId] !== undefined) continue;
      const candArea = candidate.halfW * candidate.halfH * 4;
      const supportsSmallerAbove = bodies.some((other) => {
        if (other.strokeId === candidate.strokeId || other.pinned) return false;
        const otherArea = other.halfW * other.halfH * 4;
        return candArea >= otherArea * 2.0 && candidate.initCy > other.initCy;
      });
      if (supportsSmallerAbove) {
        candidate.pinned = true;
        consumedStrokeIds.delete(candidate.strokeId);
        const st = strokeById.get(candidate.strokeId);
        if (st) segments.push(...sampleStrokeToSegments(st));
      }
    }
  }

  // Convert static tracks/floors/ramps into collision segments
  for (const sc of staticCandidates) {
    segments.push(...sampleStrokeToSegments(sc));
  }

  // Classify 2-point lines: if one end touches a dynamic body and the line is NOT mostly horizontal floor below it -> tether!
  for (const line of potentialTethers) {
    const p0 = line.points[0];
    const p1 = line.points[line.points.length - 1];
    const len = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const isMostlyHoriz = Math.abs(p1.y - p0.y) < Math.abs(p1.x - p0.x) * 0.25;
    let boundAsTether = false;

    if (!isMostlyHoriz && len >= 20) {
      for (const bd of bodies) {
        if (bd.pinned || bd.tether) continue;
        const d0 = Math.hypot(p0.x - bd.initCx, p0.y - bd.initCy);
        const d1 = Math.hypot(p1.x - bd.initCx, p1.y - bd.initCy);
        const tol = bd.radius + 26;
        if (d0 <= tol && d1 > d0 + 18) {
          bd.tether = { strokeId: line.id, pivotX: p1.x, pivotY: p1.y, length: Math.hypot(bd.initCx - p1.x, bd.initCy - p1.y) };
          consumedStrokeIds.add(line.id);
          boundAsTether = true;
          break;
        } else if (d1 <= tol && d0 > d1 + 18) {
          bd.tether = { strokeId: line.id, pivotX: p0.x, pivotY: p0.y, length: Math.hypot(bd.initCx - p0.x, bd.initCy - p0.y) };
          consumedStrokeIds.add(line.id);
          boundAsTether = true;
          break;
        }
      }
    }

    if (!boundAsTether) {
      segments.push(...sampleStrokeToSegments(line));
    }
  }

  // Bind initial velocity arrows (v0) to the nearest dynamic body
  const dynamicBodies = bodies.filter((bd) => !bd.pinned);
  for (const arr of arrows) {
    const tail = arr.arrowStart && !arr.arrowEnd ? arr.points[arr.points.length - 1] : arr.points[0];
    const tip = arr.arrowStart && !arr.arrowEnd ? arr.points[0] : arr.points[arr.points.length - 1];
    let bestBody: GravityBodyState | null = null;
    let bestDist = Infinity;
    for (const bd of dynamicBodies) {
      const d = Math.hypot(tail.x - bd.initCx, tail.y - bd.initCy);
      if (d <= bd.radius + 85 && d < bestDist) {
        bestDist = d;
        bestBody = bd;
      }
    }
    // If the user Lasso-selected exactly 1 dynamic body + an arrow, always bind it!
    if (!bestBody && dynamicBodies.length === 1) {
      bestBody = dynamicBodies[0];
    }
    if (bestBody) {
      // Arrow length in px * 5.2 -> initial velocity in px/s (e.g. 100px arrow at 45° -> ~450px parabolic range!)
      bestBody.initVx = (tip.x - tail.x) * 5.2;
      bestBody.initVy = (tip.y - tail.y) * 5.2;
      bestBody.vx = bestBody.initVx;
      bestBody.vy = bestBody.initVy;
      bestBody.v0ArrowStrokeId = arr.id;
      consumedStrokeIds.add(arr.id);
    }
  }

  // Bind pushing Stickmen (2D 'stickman' & 3D 'stickman-3d') to the nearest dynamic body!
  // Stickman on LEFT of body -> pushes RIGHT (+1); Stickman on RIGHT of body -> pushes LEFT (-1).
  for (const st of stickmen) {
    const sb = getStrokeBounds(st);
    let bestBody: GravityBodyState | null = null;
    let bestDist = Infinity;
    for (const bd of dynamicBodies) {
      if (bd.pusher) continue;
      const dx = Math.abs(sb.cx - bd.initCx);
      const dy = Math.abs(sb.cy - bd.initCy);
      if (dx <= bd.halfW + sb.w + 90 && dy <= bd.halfH + sb.h * 0.9 + 50 && dx < bestDist) {
        bestDist = dx;
        bestBody = bd;
      }
    }
    if (!bestBody && dynamicBodies.length === 1 && !dynamicBodies[0].pusher) {
      bestBody = dynamicBodies[0];
    }
    if (bestBody) {
      const dir: 1 | -1 = sb.cx <= bestBody.initCx ? 1 : -1;
      bestBody.pusher = { strokeId: st.id, dir };
    }
  }

  // Visual-contact seating at t = 0: if a resting body (no v0, no tether) is placed visually
  // touching a curve/ramp (within <= 8.5px of its stroke edge), seat it cleanly onto the surface
  // so it glides smoothly instead of doing a tiny micro-drop pinball bounce!
  // (Clearly floating bodies > 8.5px away still drop and bounce naturally.)
  for (const bd of dynamicBodies) {
    if (bd.tether || Math.hypot(bd.initVx, bd.initVy) > 5) continue;
    const r = bd.shapeKind === 'ball' ? bd.radius : Math.min(bd.halfW, bd.halfH);
    let bestGap = Infinity;
    let bestSeatX = bd.cx;
    let bestSeatY = bd.cy;
    for (const seg of segments) {
      const abx = seg.bx - seg.ax;
      const aby = seg.by - seg.ay;
      const lenSq = abx * abx + aby * aby;
      if (lenSq < 1e-4) continue;
      const t = Math.max(0, Math.min(1, ((bd.cx - seg.ax) * abx + (bd.cy - seg.ay) * aby) / lenSq));
      const closestX = seg.ax + t * abx;
      const closestY = seg.ay + t * aby;
      const dx = bd.cx - closestX;
      const dy = bd.cy - closestY;
      const dist = Math.hypot(dx, dy);
      const rContact = r + (seg.halfWidth ?? 1.5);
      const gap = dist - rContact;
      if (gap > 0 && gap <= 8.5 && gap < bestGap && dist > 1e-4) {
        bestGap = gap;
        bestSeatX = closestX + (dx / dist) * rContact;
        bestSeatY = closestY + (dy / dist) * rContact;
      }
    }
    if (bestGap <= 8.5) {
      bd.cx = bestSeatX;
      bd.cy = bestSeatY;
      bd.trail = [{ x: bd.cx, y: bd.cy }];
    }
  }

  return { bodies, segments, consumedStrokeIds };
}

/**
 * Advances the entire Gravity Lab scene by `dtSec` using 8 Symplectic sub-steps (480 Hz)
 * for rock-solid energy conservation on U-bowls, zero tunneling through thin lines/floors,
 * accurate Coulomb friction, aerodynamic drag, restitution, tethers, and ball-ball collisions!
 */
export function stepGravityScene(
  bodies: GravityBodyState[],
  segments: GravitySegment[],
  config: GravityLabConfig,
  dtSec: number,
  pageW: number,
  pageH: number
): void {
  const clampedDt = Math.min(0.033, Math.max(0.001, dtSec));
  const SUB_STEPS = 8;
  const subDt = clampedDt / SUB_STEPS;
  const gPx = config.gravity * GRAVITY_PX_PER_M;

  // Reset per-frame contact telemetry
  for (const b of bodies) {
    b.normalX = 0;
    b.normalY = 0;
    b.normalForceN = 0;
    b.frictionForceN = 0;
    b.onGround = false;
  }

  for (let step = 0; step < SUB_STEPS; step++) {
    // 1. Apply Gravity, Stickman Pushing Force F & Air Drag + integrate velocity & position
    for (const b of bodies) {
      if (b.pinned) continue;
      b.vy += gPx * subDt;

      // Stickman horizontal pushing force F (a = F / m)
      if (b.pusher && config.pushForceN > 0) {
        const axPx = ((b.pusher.dir * config.pushForceN) / Math.max(0.5, b.mass)) * GRAVITY_PX_PER_M;
        b.vx += axPx * subDt;
      }

      if (config.airDragEnabled && config.airDragCoeff > 0) {
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > 1e-3) {
          // Smooth quadratic + linear aerodynamic damping
          const dragFactor = Math.max(
            0,
            1 - (config.airDragCoeff * 0.45 + config.airDragCoeff * 0.0014 * speed) * subDt
          );
          b.vx *= dragFactor;
          b.vy *= dragFactor;
        }
      }

      b.cx += b.vx * subDt;
      b.cy += b.vy * subDt;
    }

    // 2. String / Pendulum Tether Constraints (|P - pivot| <= L)
    for (const b of bodies) {
      if (b.pinned || !b.tether) continue;
      const dx = b.cx - b.tether.pivotX;
      const dy = b.cy - b.tether.pivotY;
      const dist = Math.hypot(dx, dy);
      if (dist > b.tether.length && dist > 1e-4) {
        const nx = dx / dist;
        const ny = dy / dist;
        b.cx = b.tether.pivotX + nx * b.tether.length;
        b.cy = b.tether.pivotY + ny * b.tether.length;
        const vr = b.vx * nx + b.vy * ny;
        if (vr > 0) {
          b.vx -= vr * nx;
          b.vy -= vr * ny;
        }
      }
    }

    // 3. Body vs Static Segments Collision — Deepest-Contact-First (2 passes) to eliminate
    //    Box2D-style "ghost vertex" kicks when a ball hits near a joint between two flat segments!
    for (const b of bodies) {
      if (b.pinned) continue;
      const r = b.shapeKind === 'ball' ? b.radius : Math.min(b.halfW, b.halfH);

      for (let iter = 0; iter < 2; iter++) {
        let bestOverlap = 0;
        let bestNx = 0;
        let bestNy = 0;

        for (const seg of segments) {
          const abx = seg.bx - seg.ax;
          const aby = seg.by - seg.ay;
          const lenSq = abx * abx + aby * aby;
          if (lenSq < 1e-4) continue;

          const t = Math.max(0, Math.min(1, ((b.cx - seg.ax) * abx + (b.cy - seg.ay) * aby) / lenSq));
          const closestX = seg.ax + t * abx;
          const closestY = seg.ay + t * aby;
          const dx = b.cx - closestX;
          const dy = b.cy - closestY;
          const dist = Math.hypot(dx, dy);
          const rContact = r + (seg.halfWidth ?? 1.5);

          if (dist < rContact && dist > 1e-5) {
            const overlap = rContact - dist;
            if (overlap > bestOverlap) {
              bestOverlap = overlap;
              bestNx = dx / dist;
              bestNy = dy / dist;
            }
          }
        }

        if (bestOverlap <= 0) break;

        const nx = bestNx;
        const ny = bestNy;
        const yBefore = b.cy;
        const speedBeforeSq = b.vx * b.vx + b.vy * b.vy;

        b.cx += nx * bestOverlap;
        b.cy += ny * bestOverlap;

        const vn = b.vx * nx + b.vy * ny;
        if (vn < 0) {
          const tx = -ny;
          const ty = nx;
          const vtBefore = b.vx * tx + b.vy * ty;
          // Smooth grazing/rolling contact on curved U-bowls & ramps vs genuine drop/wall bounce
          // (42 px/s ≈ 1.5px micro-drop; real air drops hit at 120+ px/s and bounce cleanly!)
          const isGrazingSlide =
            Math.abs(vn) < 42 || Math.abs(vn) < Math.abs(vtBefore) * 0.42;
          const eEff = isGrazingSlide ? 0 : config.restitution;
          const jn = -(1 + eEff) * vn;
          b.vx += jn * nx;
          b.vy += jn * ny;

          // Track live normal force for vector visualization
          const nForce = (jn / Math.max(1e-4, subDt)) * (b.mass / GRAVITY_PX_PER_M);
          if (nForce > b.normalForceN) {
            b.normalForceN = nForce;
            b.normalX = nx;
            b.normalY = ny;
          }
          b.onGround = true;

          if (config.frictionEnabled && config.frictionMu > 0) {
            // Coulomb Friction along tangent (ONLY when frictionEnabled === true!)
            const vt = b.vx * tx + b.vy * ty;
            const maxFricDeltaV = config.frictionMu * Math.abs(jn);
            if (Math.abs(vt) <= maxFricDeltaV + 0.6) {
              b.vx -= vt * tx;
              b.vy -= vt * ty;
              const appliedFricN = (Math.abs(vt) / Math.max(1e-4, subDt)) * (b.mass / GRAVITY_PX_PER_M);
              b.frictionForceN = Math.max(b.frictionForceN, appliedFricN);
            } else {
              const sign = vt > 0 ? 1 : -1;
              b.vx -= sign * maxFricDeltaV * tx;
              b.vy -= sign * maxFricDeltaV * ty;
              const appliedFricN = (maxFricDeltaV / Math.max(1e-4, subDt)) * (b.mass / GRAVITY_PX_PER_M);
              b.frictionForceN = Math.max(b.frictionForceN, appliedFricN);
            }
          } else if (!config.airDragEnabled && isGrazingSlide) {
            // Ideal conservative mode (Friction OFF & Air Drag OFF):
            // Rotate velocity smoothly onto the curved tangent WITHOUT losing cos(dTheta) energy
            // across polyline chord transitions, accounting for exact ΔU = -mgΔy from push-out!
            const vt = b.vx * tx + b.vy * ty;
            const targetSpeedSq = speedBeforeSq + 2 * gPx * (b.cy - yBefore);
            if (targetSpeedSq > 1e-3 && Math.abs(vt) > 1e-3) {
              const targetSpeed = Math.sqrt(targetSpeedSq);
              const sign = vt >= 0 ? 1 : -1;
              b.vx = sign * targetSpeed * tx;
              b.vy = sign * targetSpeed * ty;
            }
          }
        }
      }

      // Keep inside A4 page bounds gently ONLY when pageBoundsEnabled is checked!
      if (config.pageBoundsEnabled) {
        const halfWBound = b.shapeKind === 'ball' ? r : b.halfW;
        const wallRestitution = b.pusher ? 0 : config.restitution;
        if (b.cx - halfWBound < 8) {
          b.cx = 8 + halfWBound;
          if (b.vx < 0) b.vx = -b.vx * wallRestitution;
        } else if (b.cx + halfWBound > pageW - 8) {
          b.cx = pageW - 8 - halfWBound;
          if (b.vx > 0) b.vx = -b.vx * wallRestitution;
        }
        if (b.cy - r < 8) {
          b.cy = 8 + r;
          if (b.vy < 0) b.vy = -b.vy * config.restitution;
        } else if (b.cy + r > pageH - 8) {
          b.cy = pageH - 8 - r;
          if (b.vy > 0) {
            const eEff = Math.abs(b.vy) < 26 ? 0 : config.restitution;
            b.vy = -b.vy * eEff;
            b.onGround = true;
            if (config.frictionEnabled) {
              b.vx *= Math.max(0, 1 - config.frictionMu * 1.8 * subDt);
            }
          }
        }
      }
    }

    // 4. Pairwise Dynamic Body-vs-Body Collisions (elastic / inelastic!)
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      if (a.pinned) continue;
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        if (b.pinned) continue;
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const dist = Math.hypot(dx, dy);
        const minD = a.radius + b.radius;
        if (dist < minD && dist > 1e-4) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minD - dist;
          const invA = 1 / a.mass;
          const invB = 1 / b.mass;
          const invSum = invA + invB;
          a.cx -= nx * overlap * (invA / invSum);
          a.cy -= ny * overlap * (invA / invSum);
          b.cx += nx * overlap * (invB / invSum);
          b.cy += ny * overlap * (invB / invSum);

          const rvx = b.vx - a.vx;
          const rvy = b.vy - a.vy;
          const vn = rvx * nx + rvy * ny;
          if (vn < 0) {
            const jImp = (-(1 + config.restitution) * vn) / invSum;
            a.vx -= jImp * invA * nx;
            a.vy -= jImp * invA * ny;
            b.vx += jImp * invB * nx;
            b.vy += jImp * invB * ny;
          }
        }
      }
    }
  }

  // Record trajectory trail points cleanly
  for (const b of bodies) {
    if (b.pinned) continue;
    const last = b.trail[b.trail.length - 1];
    if (!last || Math.hypot(b.cx - last.x, b.cy - last.y) >= 4) {
      b.trail.push({ x: b.cx, y: b.cy });
      if (b.trail.length > MAX_TRAIL_PTS) b.trail.shift();
    }
  }
}

export function computeGravityEnergyStats(
  bodies: GravityBodyState[],
  segments: GravitySegment[],
  config: GravityLabConfig,
  pageH: number
): GravityEnergyStats {
  let refFloorY = pageH - 20;
  if (segments.length > 0) {
    let maxSegY = -Infinity;
    for (const seg of segments) {
      if (seg.ay > maxSegY) maxSegY = seg.ay;
      if (seg.by > maxSegY) maxSegY = seg.by;
    }
    if (maxSegY > 0) refFloorY = maxSegY;
  }

  let kineticJ = 0;
  let potentialJ = 0;
  let primarySpeed = 0;
  let primaryHeight = 0;
  let foundPrimary = false;

  for (const b of bodies) {
    if (b.pinned) continue;
    const speedMs = Math.hypot(b.vx, b.vy) / GRAVITY_PX_PER_M;
    const heightM = Math.max(0, (refFloorY - (b.cy + b.radius)) / GRAVITY_PX_PER_M);
    kineticJ += 0.5 * b.mass * speedMs * speedMs;
    potentialJ += b.mass * config.gravity * heightM;
    if (!foundPrimary) {
      primarySpeed = speedMs;
      primaryHeight = heightM;
      foundPrimary = true;
    }
  }

  return {
    kineticJ,
    potentialJ,
    totalJ: kineticJ + potentialJ,
    speedMs: primarySpeed,
    heightM: primaryHeight,
    refFloorY,
  };
}

function drawVectorArrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  dx: number,
  dy: number,
  color: string,
  label: string
) {
  const len = Math.hypot(dx, dy);
  if (len < 10) return;
  const maxLen = 82;
  const scale = len > maxLen ? maxLen / len : 1;
  const ex = x0 + dx * scale;
  const ey = y0 + dy * scale;
  const ang = Math.atan2(ey - y0, ex - x0);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  const head = 8.5;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - head * Math.cos(ang - 0.42), ey - head * Math.sin(ang - 0.42));
  ctx.lineTo(ex - head * Math.cos(ang + 0.42), ey - head * Math.sin(ang + 0.42));
  ctx.closePath();
  ctx.fill();

  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(label, ex + 5 * Math.cos(ang) - 4, ey + 5 * Math.sin(ang) - 4);
  ctx.restore();
}

/**
 * Draws the Gravity Lab overlay: dotted trails, live tether strings, force/velocity vectors,
 * and subtle Pinned/Dynamic badges when paused!
 */
export function renderGravityOverlay(
  ctx: CanvasRenderingContext2D,
  bodies: GravityBodyState[],
  config: GravityLabConfig,
  isRunning: boolean
): void {
  ctx.save();

  for (const b of bodies) {
    if (b.pinned) {
      if (!isRunning) {
        // Subtle 📌 badge on pinned bodies when paused
        ctx.save();
        ctx.fillStyle = 'rgba(253, 251, 247, 0.92)';
        ctx.strokeStyle = '#c2b59f';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(b.cx, b.cy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#5c5346';
        ctx.fillText('📌', b.cx, b.cy + 0.5);
        ctx.restore();
      }
      continue;
    }

    // 0. Pre-launch parabolic trajectory preview & v0 badge when paused at t = 0
    if (!isRunning && b.trail.length <= 1) {
      const v0Mag = Math.hypot(b.initVx, b.initVy);
      if (v0Mag > 12) {
        const gPx = config.gravity * GRAVITY_PX_PER_M;
        ctx.save();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.42)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(b.cx, b.cy);
        const dtPreview = 0.04;
        const maxSteps = 42;
        for (let s = 1; s <= maxSteps; s++) {
          const t = s * dtPreview;
          const px = b.cx + b.initVx * t;
          const py = b.cy + b.initVy * t + 0.5 * gPx * t * t;
          ctx.lineTo(px, py);
          if (py > b.cy + b.radius + 90) break;
        }
        ctx.stroke();
        ctx.restore();

        const v0Ms = (v0Mag / GRAVITY_PX_PER_M).toFixed(1);
        drawVectorArrow(
          ctx,
          b.cx,
          b.cy,
          b.initVx * 0.22,
          b.initVy * 0.22,
          '#2563eb',
          `v₀ = ${v0Ms} m/s`
        );
      }
    }

    // 1. Live Trajectory Trail
    if (config.showTrail && b.trail.length >= 2) {
      ctx.save();
      ctx.strokeStyle = b.color || '#16a34a';
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(b.trail[0].x, b.trail[0].y);
      for (let i = 1; i < b.trail.length; i++) {
        ctx.lineTo(b.trail[i].x, b.trail[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 2. Live Pendulum / String Tether
    if (b.tether) {
      ctx.save();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.tether.pivotX, b.tether.pivotY);
      ctx.lineTo(b.cx, b.cy);
      ctx.stroke();
      ctx.fillStyle = '#234978';
      ctx.beginPath();
      ctx.arc(b.tether.pivotX, b.tether.pivotY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Live Velocity & Force Vectors (v, W, N)
    if (config.showVectors) {
      const drewV0Preview = !isRunning && b.trail.length <= 1 && Math.hypot(b.initVx, b.initVy) > 12;
      // Velocity vector v (blue)
      if (!drewV0Preview) {
        drawVectorArrow(ctx, b.cx, b.cy, b.vx * 0.22, b.vy * 0.22, '#2563eb', 'v');
      }
      // Weight W = mg (crimson/slate)
      if (config.gravity > 0.1) {
        drawVectorArrow(ctx, b.cx, b.cy, 0, Math.min(58, config.gravity * 3.6), '#dc2626', 'W');
      }
      // Normal reaction N (emerald) when in contact
      if (b.onGround && b.normalForceN > 0.2) {
        const nLen = Math.min(58, b.normalForceN * 3.4);
        drawVectorArrow(ctx, b.cx, b.cy, b.normalX * nLen, b.normalY * nLen, '#059669', 'N');
      }
      // Stickman horizontal pushing force F (royal blue)
      if (b.pusher && config.pushForceN > 0.2) {
        const fLen = Math.min(72, 22 + config.pushForceN * 1.4);
        drawVectorArrow(
          ctx,
          b.cx,
          b.cy,
          b.pusher.dir * fLen,
          0,
          '#1d4ed8',
          `F = ${config.pushForceN.toFixed(0)} N`
        );
      }
      // Friction force T (amber) opposing horizontal motion / push
      if (config.frictionEnabled && b.onGround && b.frictionForceN > 0.2) {
        const motionDir =
          Math.abs(b.vx) > 2 ? (b.vx > 0 ? 1 : -1) : b.pusher ? b.pusher.dir : 0;
        if (motionDir !== 0) {
          const tLen = Math.min(64, 18 + b.frictionForceN * 1.4);
          drawVectorArrow(ctx, b.cx, b.cy + 6, -motionDir * tLen, 0, '#d97706', 'T');
        }
      }
    }
  }

  ctx.restore();
}
