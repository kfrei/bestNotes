import polygonClipping from 'polygon-clipping';
import type { MultiPolygon, Polygon, Ring } from 'polygon-clipping';
import type { BezierPoint, StrokeObject } from '../types/note';

export type BooleanShapeOp = 'union' | 'intersect' | 'subtract' | 'exclude' | 'divide';

const CLOSED_SHAPE_TYPES = new Set([
  'rectangle',
  'square',
  'circle',
  'ellipse',
  'sphere',
  'shaded-sphere',
  'triangle',
  'rhombus',
  'pentagon',
  'hexagon',
  'star',
  'diamond',
  'parallelogram',
  'trapezoid',
  'polygon',
]);

/** Returns true if a stroke represents a closed 2D area suitable for Boolean shape operations. */
export function isClosedBooleanShape(s: StrokeObject | undefined | null): boolean {
  if (!s || !s.points || s.points.length < 3) return false;
  if (s.tool === 'highlighter') return false;
  if (s.shapeType && CLOSED_SHAPE_TYPES.has(s.shapeType)) return true;
  if (s.fillStyle && s.fillStyle !== 'none') return true;
  const first = s.points[0];
  const last = s.points[s.points.length - 1];
  if (first.twist === 999) return true;
  if (Math.hypot(first.x - last.x, first.y - last.y) <= 22) return true;
  return false;
}

/** Sample a closed StrokeObject into a clean 2D polygon Ring ([[x, y], ...]). */
export function strokeToPolygonRing(s: StrokeObject): Ring {
  const pts = s.points;
  const ring: Ring = [];
  if (!pts || pts.length < 3) return ring;

  // Check if points have cubic/quadratic Bezier handles
  const hasBezier = pts.some(
    (p) =>
      (p.outDx !== undefined && Math.abs(p.outDx) > 0.25) ||
      (p.outDy !== undefined && Math.abs(p.outDy) > 0.25) ||
      (p.inDx !== undefined && Math.abs(p.inDx) > 0.25) ||
      (p.inDy !== undefined && Math.abs(p.inDy) > 0.25) ||
      (p.cx !== undefined && p.cy !== undefined)
  );

  // If it's a circle/ellipse with only a few points (e.g. 4 Bezier points), sample smoothly to 72 points
  const isRoundShape =
    s.shapeType === 'circle' ||
    s.shapeType === 'ellipse' ||
    s.shapeType === 'sphere' ||
    s.shapeType === 'shaded-sphere';

  // Circle / Ellipse / Sphere shapes in BestNotes are stored as 4 cardinal points (or bounds) without
  // Bezier handles and rendered via ctx.ellipse(cx, cy, rx, ry) — always sample them into a crisp 72-pt ellipse ring!
  if (isRoundShape && !hasBezier && pts.length <= 12) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const cx = (minX + maxX) * 0.5;
    const cy = (minY + maxY) * 0.5;
    const rx = Math.max(1, (maxX - minX) * 0.5);
    const ry = Math.max(1, (maxY - minY) * 0.5);
    const STEPS = 72;
    for (let i = 0; i < STEPS; i++) {
      const a = (i / STEPS) * Math.PI * 2;
      pushDedup(ring, cx + rx * Math.cos(a), cy + ry * Math.sin(a));
    }
    if (ring.length >= 3) {
      ring.push([ring[0][0], ring[0][1]]);
    }
    return ring;
  }

  if (hasBezier) {
    const stepsPerSeg = isRoundShape
      ? Math.max(12, Math.ceil(72 / Math.max(1, pts.length - 1)))
      : Math.max(6, Math.min(24, Math.ceil(64 / Math.max(1, pts.length - 1))));
    const segCount =
      Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) <= 2
        ? pts.length - 1
        : pts.length;

    for (let i = 0; i < segCount; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
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
        let x: number;
        let y: number;
        if (hasCubic) {
          x =
            mt * mt * mt * a.x +
            3 * mt * mt * t * cp1x +
            3 * mt * t * t * cp2x +
            t * t * t * b.x;
          y =
            mt * mt * mt * a.y +
            3 * mt * mt * t * cp1y +
            3 * mt * t * t * cp2y +
            t * t * t * b.y;
        } else if (hasQuad) {
          x = mt * mt * a.x + 2 * mt * t * b.cx! + t * t * b.x;
          y = mt * mt * a.y + 2 * mt * t * b.cy! + t * t * b.y;
        } else {
          x = a.x + (b.x - a.x) * t;
          y = a.y + (b.y - a.y) * t;
        }
        pushDedup(ring, x, y);
      }
    }
  } else {
    for (let i = 0; i < pts.length; i++) {
      pushDedup(ring, pts[i].x, pts[i].y);
    }
  }

  // Ensure ring is explicitly closed
  if (ring.length >= 3) {
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (Math.hypot(first[0] - last[0], first[1] - last[1]) > 1e-4) {
      ring.push([first[0], first[1]]);
    }
  }
  return ring;
}

function pushDedup(ring: Ring, x: number, y: number) {
  const rx = Math.round(x * 100) / 100;
  const ry = Math.round(y * 100) / 100;
  if (ring.length > 0) {
    const prev = ring[ring.length - 1];
    if (Math.hypot(prev[0] - rx, prev[1] - ry) < 0.25) return;
  }
  ring.push([rx, ry]);
}

function ringAreaAbs(ring: Ring): number {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area) * 0.5;
}

/** Convert a Polygon (with optional holes) into a closed BestNotes vector StrokeObject.
 *  Holes are encoded as clean independent subpaths marked with `twist: 888` on their start vertex
 *  (zero visible keyhole bridge lines; rendered with `ctx.fill('evenodd')` & full move/scale/rotate/mirror support!). */
function polygonToStroke(
  poly: Polygon,
  template: StrokeObject,
  idSuffix: string,
  zOrder: number,
  overrideColor?: string
): StrokeObject | null {
  if (!poly || poly.length === 0 || poly[0].length < 4) return null;
  if (ringAreaAbs(poly[0]) < 16) return null; // skip microscopic numerical slivers

  const points: BezierPoint[] = [];
  const outer = poly[0];
  for (let idx = 0; idx < outer.length; idx++) {
    const [x, y] = outer[idx];
    points.push({
      x,
      y,
      pressure: 0.5,
      smooth: false,
      ...(idx === 0 || idx === outer.length - 1 ? { twist: 999 } : {}),
    });
  }

  for (let h = 1; h < poly.length; h++) {
    const hole = poly[h];
    if (!hole || hole.length < 4 || ringAreaAbs(hole) < 12) continue;
    for (let idx = 0; idx < hole.length; idx++) {
      const [x, y] = hole[idx];
      points.push({
        x,
        y,
        pressure: 0.5,
        smooth: false,
        ...(idx === 0 ? { twist: 888 } : {}),
      });
    }
  }

  if (points.length < 4) return null;

  return {
    id: `bool-${Date.now()}-${idSuffix}-${Math.random().toString(36).slice(2, 6)}`,
    tool: template.tool === 'pencil' ? 'pencil' : 'pen',
    color: overrideColor || template.color,
    width: template.width,
    opacity: template.opacity ?? 1,
    layerId: template.layerId,
    isShape: true,
    shapeType: 'polygon',
    lineStyle: template.lineStyle,
    fillStyle: template.fillStyle,
    fillColor: overrideColor || template.fillColor || template.color,
    fillTransparency: template.fillTransparency,
    zOrder,
    points,
  };
}

function multiPolygonToStrokes(
  mp: MultiPolygon,
  template: StrokeObject,
  tag: string,
  baseZOrder: number,
  overrideColor?: string
): StrokeObject[] {
  const out: StrokeObject[] = [];
  for (let i = 0; i < mp.length; i++) {
    const st = polygonToStroke(mp[i], template, `${tag}-${i}`, baseZOrder + i, overrideColor);
    if (st) out.push(st);
  }
  return out;
}

/**
 * Execute a Photoshop / Illustrator-style Boolean shape operation on 2+ closed strokes.
 * Strokes are ordered bottom-to-top by zOrder (or original array order).
 */
export function applyBooleanShapeOp(
  selectedStrokes: StrokeObject[],
  op: BooleanShapeOp,
  baseZOrder: number
): StrokeObject[] {
  const closed = selectedStrokes
    .filter(isClosedBooleanShape)
    .sort((a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0));

  if (closed.length < 2) return [];

  const polys: { stroke: StrokeObject; poly: Polygon }[] = [];
  for (const st of closed) {
    const ring = strokeToPolygonRing(st);
    if (ring.length >= 4 && ringAreaAbs(ring) >= 16) {
      polys.push({ stroke: st, poly: [ring] });
    }
  }
  if (polys.length < 2) return [];

  const baseStroke = polys[0].stroke;
  const topStroke = polys[polys.length - 1].stroke;
  const allPolys = polys.map((p) => p.poly);

  if (op === 'union') {
    const res = polygonClipping.union(allPolys[0], ...allPolys.slice(1));
    return multiPolygonToStrokes(res, baseStroke, 'union', baseZOrder);
  }

  if (op === 'intersect') {
    const res = polygonClipping.intersection(allPolys[0], ...allPolys.slice(1));
    return multiPolygonToStrokes(res, topStroke, 'intersect', baseZOrder);
  }

  if (op === 'subtract') {
    // Subtract upper shape(s) from the bottom-most shape (Photoshop "Subtract Front Shape")
    const res = polygonClipping.difference(allPolys[0], ...allPolys.slice(1));
    return multiPolygonToStrokes(res, baseStroke, 'subtract', baseZOrder);
  }

  if (op === 'exclude') {
    const res = polygonClipping.xor(allPolys[0], ...allPolys.slice(1));
    return multiPolygonToStrokes(res, baseStroke, 'exclude', baseZOrder);
  }

  if (op === 'divide') {
    // Illustrator "Divide": split into independent non-overlapping pieces!
    const pieces: StrokeObject[] = [];
    let z = baseZOrder;

    if (polys.length === 2) {
      const aOnly = polygonClipping.difference(allPolys[0], allPolys[1]);
      const bOnly = polygonClipping.difference(allPolys[1], allPolys[0]);
      const inter = polygonClipping.intersection(allPolys[0], allPolys[1]);

      const aStrokes = multiPolygonToStrokes(aOnly, polys[0].stroke, 'div-a', z);
      z += aStrokes.length;
      const bStrokes = multiPolygonToStrokes(bOnly, polys[1].stroke, 'div-b', z);
      z += bStrokes.length;
      const iStrokes = multiPolygonToStrokes(inter, polys[1].stroke, 'div-ab', z);

      pieces.push(...aStrokes, ...bStrokes, ...iStrokes);
    } else {
      // General N-shape divide: each exclusive region + pairwise/common overlap
      for (let i = 0; i < polys.length; i++) {
        const others = allPolys.filter((_, j) => j !== i);
        const exclusive = polygonClipping.difference(allPolys[i], ...others);
        const sList = multiPolygonToStrokes(exclusive, polys[i].stroke, `div-ex-${i}`, z);
        z += sList.length;
        pieces.push(...sList);
      }
      // Common intersections
      for (let i = 0; i < polys.length; i++) {
        for (let j = i + 1; j < polys.length; j++) {
          const pairInter = polygonClipping.intersection(allPolys[i], allPolys[j]);
          if (pairInter.length > 0) {
            const others = allPolys.filter((_, k) => k !== i && k !== j);
            const cleanInter =
              others.length > 0 ? polygonClipping.difference(pairInter, ...others) : pairInter;
            const sList = multiPolygonToStrokes(cleanInter, polys[j].stroke, `div-in-${i}-${j}`, z);
            z += sList.length;
            pieces.push(...sList);
          }
        }
      }
      if (polys.length >= 3) {
        const allInter = polygonClipping.intersection(allPolys[0], ...allPolys.slice(1));
        const sList = multiPolygonToStrokes(allInter, topStroke, 'div-all', z);
        pieces.push(...sList);
      }
    }
    return pieces;
  }

  return [];
}
