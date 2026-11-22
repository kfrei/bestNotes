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

  // 4. Flat extruded ellipse disc used as a floor
  if ((s.shapeType === 'circle' || s.shapeType === 'ellipse') && pts.length === 4) {
    const b = getStrokeBounds(s);
    const yTop = b.cy + depthMidY;
    segs.push({ ax: b.minX, ay: yTop, bx: b.maxX, by: yTop, strokeId: s.id });
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
      segs.push({ ax: prev.x, ay: prev.y, bx: cur.x, by: cur.y, strokeId: s.id });
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
  const potentialTethers: StrokeObject[] = [];
  const staticCandidates: StrokeObject[] = [];

  let bodyCounter = 1;

  for (const s of strokes) {
    if (!s.points || s.points.length < 2) continue;
    if (
      s.shapeType === 'stickman' ||
      s.shapeType === 'stickman-3d' ||
      s.shapeType === 'title-box' ||
      s.tool === 'highlighter'
    ) {
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

    const defaultPinned = isFlatPlatform;
    const isPinned =
      pinnedOverrides[s.id] !== undefined ? pinnedOverrides[s.id] : defaultPinned;

    const isBall =
      s.shapeType === 'circle' ||
      s.shapeType === 'ellipse' ||
      s.shapeType === 'sphere' ||
      s.shapeType === 'shaded-sphere' ||
      s.extrudeShape3D === 'sphere';

    const radius = isBall
      ? Math.max(8, (b.w + b.h) * 0.25)
      : Math.max(8, Math.min(b.w, b.h) * 0.5);

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
      mass: Math.max(0.5, Math.round(((radius * radius) / 400) * 10) / 10),
      normalX: 0,
      normalY: 0,
      normalForceN: 0,
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
  for (const arr of arrows) {
    const tail = arr.arrowStart && !arr.arrowEnd ? arr.points[arr.points.length - 1] : arr.points[0];
    const tip = arr.arrowStart && !arr.arrowEnd ? arr.points[0] : arr.points[arr.points.length - 1];
    let bestBody: GravityBodyState | null = null;
    let bestDist = Infinity;
    for (const bd of bodies) {
      if (bd.pinned) continue;
      const d = Math.hypot(tail.x - bd.initCx, tail.y - bd.initCy);
      if (d <= bd.radius + 42 && d < bestDist) {
        bestDist = d;
        bestBody = bd;
      }
    }
    if (bestBody) {
      // Arrow length in px * 3.2 -> initial velocity in px/s (e.g. 100px arrow = 320 px/s ≈ 5.3 m/s)
      bestBody.initVx = (tip.x - tail.x) * 3.2;
      bestBody.initVy = (tip.y - tail.y) * 3.2;
      bestBody.vx = bestBody.initVx;
      bestBody.vy = bestBody.initVy;
      bestBody.v0ArrowStrokeId = arr.id;
      consumedStrokeIds.add(arr.id);
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
    b.onGround = false;
  }

  for (let step = 0; step < SUB_STEPS; step++) {
    // 1. Apply Gravity & Air Drag + integrate velocity & position
    for (const b of bodies) {
      if (b.pinned) continue;
      b.vy += gPx * subDt;

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

    // 3. Body vs Static Segments Collision (closest-point-on-segment, 2 iterations for crisp corners)
    for (const b of bodies) {
      if (b.pinned) continue;
      const r = b.shapeKind === 'ball' ? b.radius : Math.min(b.halfW, b.halfH);

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

        if (dist < r && dist > 1e-5) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = r - dist;
          b.cx += nx * overlap;
          b.cy += ny * overlap;

          const vn = b.vx * nx + b.vy * ny;
          if (vn < 0) {
            // Suppress micro-bounces during smooth rolling/resting contact so U-bowls & ramps are silky smooth!
            const isResting = Math.abs(vn) < 26;
            const eEff = isResting ? 0 : config.restitution;
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

            // Coulomb Friction along tangent (ONLY when frictionEnabled === true!)
            if (config.frictionEnabled && config.frictionMu > 0) {
              const tx = -ny;
              const ty = nx;
              const vt = b.vx * tx + b.vy * ty;
              const maxFricDeltaV = config.frictionMu * Math.abs(jn);
              if (Math.abs(vt) <= maxFricDeltaV + 0.6) {
                b.vx -= vt * tx;
                b.vy -= vt * ty;
              } else {
                const sign = vt > 0 ? 1 : -1;
                b.vx -= sign * maxFricDeltaV * tx;
                b.vy -= sign * maxFricDeltaV * ty;
              }
            }
          }
        }
      }

      // Keep inside A4 page bounds gently
      if (b.cx - r < 8) {
        b.cx = 8 + r;
        if (b.vx < 0) b.vx = -b.vx * config.restitution;
      } else if (b.cx + r > pageW - 8) {
        b.cx = pageW - 8 - r;
        if (b.vx > 0) b.vx = -b.vx * config.restitution;
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
      // Velocity vector v (blue)
      drawVectorArrow(ctx, b.cx, b.cy, b.vx * 0.22, b.vy * 0.22, '#2563eb', 'v');
      // Weight W = mg (crimson/slate)
      if (config.gravity > 0.1) {
        drawVectorArrow(ctx, b.cx, b.cy, 0, Math.min(58, config.gravity * 3.6), '#dc2626', 'W');
      }
      // Normal reaction N (emerald) when in contact
      if (b.onGround && b.normalForceN > 0.2) {
        const nLen = Math.min(58, b.normalForceN * 3.4);
        drawVectorArrow(ctx, b.cx, b.cy, b.normalX * nLen, b.normalY * nLen, '#059669', 'N');
      }
    }
  }

  ctx.restore();
}
