import type { StrokeObject } from '../../../types/note';
import type { GravityBodyState, GravityLabConfig, GravitySegment } from './types';
import {
  GRAVITY_PX_PER_M,
  getStrokeBounds,
  getOrientedHalfExtents,
  sampleStrokeToSegments,
} from './gravityGeometry';

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
    // Curved 2-point Bézier arcs (e.g. quarter-circle) have non-zero handles and are ALWAYS static tracks!
    const hasCurveHandles = s.points.some(
      (p) =>
        (p.outDx !== undefined && Math.abs(p.outDx) > 0.5) ||
        (p.outDy !== undefined && Math.abs(p.outDy) > 0.5) ||
        (p.inDx !== undefined && Math.abs(p.inDx) > 0.5) ||
        (p.inDy !== undefined && Math.abs(p.inDy) > 0.5) ||
        (p.cx !== undefined && p.cy !== undefined)
    );
    if (s.shapeType === 'line' && s.points.length === 2 && !hasCurveHandles) {
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

    const oriented = isBall ? null : getOrientedHalfExtents(s);
    const strokeHalfPad = Math.min(3, (s.width || 2) * 0.5);
    const boxHalfH = oriented ? oriented.halfThickness + strokeHalfPad : b.h * 0.5;
    const boxHalfW = oriented ? oriented.halfLength + strokeHalfPad : b.w * 0.5;

    const radius = isBall
      ? Math.max(8, (b.w + b.h) * 0.25)
      : Math.max(6, Math.min(boxHalfW, boxHalfH));

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
      halfW: isBall ? b.w * 0.5 : boxHalfW,
      halfH: isBall ? b.h * 0.5 : boxHalfH,
      initAngle: oriented ? oriented.longAxisAngle : 0,
      angle: oriented ? oriented.longAxisAngle : 0,
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

  // Second pass:
  //   a) If a big circle/ellipse ENCLOSES a smaller dynamic body (loop-the-loop / ανακύκλωση), auto-pin it as a hollow circular track!
  //   b) If a non-ball body (e.g. trapezoid/wedge/step) is BELOW and >= 2x larger in area than another dynamic body, auto-pin it as a static ramp/floor!
  if (bodies.length >= 2) {
    const strokeById = new Map(strokes.map((st) => [st.id, st]));
    for (const candidate of bodies) {
      if (candidate.pinned) continue;
      if (pinnedOverrides[candidate.strokeId] !== undefined) continue;
      if (candidate.shapeKind === 'ball') {
        const enclosesSmaller = bodies.some((other) => {
          if (other.strokeId === candidate.strokeId || other.pinned) return false;
          if (candidate.radius < other.radius * 2.0) return false;
          const nx = (other.initCx - candidate.initCx) / Math.max(1, candidate.halfW);
          const ny = (other.initCy - candidate.initCy) / Math.max(1, candidate.halfH);
          return nx * nx + ny * ny <= 1.05;
        });
        if (enclosesSmaller) {
          candidate.pinned = true;
          candidate.label = 'Δάπεδο (Κύκλος)';
          consumedStrokeIds.delete(candidate.strokeId);
          const st = strokeById.get(candidate.strokeId);
          if (st) segments.push(...sampleStrokeToSegments(st));
        }
        continue;
      }
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
        // Strict pendulum tether binding: ONLY when the sphere's CENTER is very close to the
        // endpoint of a straight 2-point line segment (e.g. magnetically snapped there), so a ball
        // merely resting on top of an inclined ramp (center >= radius away) NEVER turns the ramp into a pendulum!
        const tol = Math.max(8, Math.min(12, bd.radius * 0.55));
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

  // Bind initial velocity arrows (v0) ONLY to a nearby dynamic body (tail or midpoint within radius + 115px)
  // so moving the ball far away from a left-behind arrow immediately detaches v0!
  const dynamicBodies = bodies.filter((bd) => !bd.pinned);
  for (const arr of arrows) {
    const tail = arr.arrowStart && !arr.arrowEnd ? arr.points[arr.points.length - 1] : arr.points[0];
    const tip = arr.arrowStart && !arr.arrowEnd ? arr.points[0] : arr.points[arr.points.length - 1];
    const midX = (tail.x + tip.x) * 0.5;
    const midY = (tail.y + tip.y) * 0.5;
    let bestBody: GravityBodyState | null = null;
    let bestDist = Infinity;
    for (const bd of dynamicBodies) {
      const dTail = Math.hypot(tail.x - bd.initCx, tail.y - bd.initCy);
      const dMid = Math.hypot(midX - bd.initCx, midY - bd.initCy);
      const d = Math.min(dTail, dMid);
      if (d <= bd.radius + 115 && d < bestDist) {
        bestDist = d;
        bestBody = bd;
      }
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

  // Bind ALL Stickmen (2D 'stickman' & 3D 'stickman-3d') to their nearest dynamic body!
  // Supports 1, 2, or more Stickmen acting simultaneously on the same box (same-direction or tug-of-war!).
  const SUBSCRIPT_DIGITS = ['₁', '₂', '₃', '₄', '₅', '₆'];
  for (const st of stickmen) {
    const sb = getStrokeBounds(st);
    let bestBody: GravityBodyState | null = null;
    let bestDist = Infinity;
    for (const bd of dynamicBodies) {
      const dx = Math.abs(sb.cx - bd.initCx);
      const dy = Math.abs(sb.cy - bd.initCy);
      if (dx <= bd.halfW + sb.w + 140 && dy <= bd.halfH + sb.h * 1.1 + 80 && dx < bestDist) {
        bestDist = dx;
        bestBody = bd;
      }
    }
    if (!bestBody && dynamicBodies.length === 1) {
      bestBody = dynamicBodies[0];
    }
    if (bestBody) {
      // Detect push vs pull direction from Stickman's torso lean (head p[0] vs hip p[2]):
      // Leaning RIGHT (head.x > hip.x) -> force RIGHT (+1, either pushing from left or pulling from right!)
      // Leaning LEFT (head.x < hip.x) -> force LEFT (-1, either pushing from right or pulling from left!)
      const head = st.points[0];
      const hip = st.points[2];
      const leanX = head && hip ? head.x - hip.x : 0;
      const dir: 1 | -1 =
        Math.abs(leanX) > 4 ? (leanX > 0 ? 1 : -1) : sb.cx <= bestBody.initCx ? 1 : -1;
      const isLeftOfBox = sb.cx <= bestBody.initCx;
      const role: 'push' | 'pull' = (isLeftOfBox && dir === 1) || (!isLeftOfBox && dir === -1) ? 'push' : 'pull';
      if (!bestBody.pushers) bestBody.pushers = [];
      bestBody.pushers.push({
        strokeId: st.id,
        dir,
        role,
        color: st.color || '#2563eb',
        label: 'F',
        initCx: sb.cx,
      });
    }
  }

  // Sort pushers left-to-right per body and assign clean labels ('F' if 1, 'F₁' / 'F₂' if 2+)
  for (const bd of dynamicBodies) {
    if (bd.pushers && bd.pushers.length > 0) {
      bd.pushers.sort((a, b) => a.initCx - b.initCx);
      if (bd.pushers.length === 1) {
        bd.pushers[0].label = 'F';
      } else {
        bd.pushers.forEach((p, idx) => {
          p.label = `F${SUBSCRIPT_DIGITS[idx] || idx + 1}`;
        });
      }
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
