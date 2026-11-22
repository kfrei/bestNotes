import polygonClipping from 'polygon-clipping';
import type { MultiPolygon, Polygon, Ring } from 'polygon-clipping';
import type { BezierPoint, StrokeObject } from '../types/note';
import { isClosedBooleanShape, strokeToPolygonRing } from './shapeBooleanOps';

export type EqualSlicePreset = 'quarter-split' | 2 | 3 | 4 | 6 | 8;
export type SliceStyleMode = 'closed' | 'outline';

function getRingBounds(ring: Ring) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
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

function ringAreaAbs(ring: Ring): number {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area) * 0.5;
}

function ringCentroid(ring: Ring): { x: number; y: number } {
  let sx = 0;
  let sy = 0;
  const n = Math.max(1, ring.length - 1);
  for (let i = 0; i < n; i++) {
    sx += ring[i][0];
    sy += ring[i][1];
  }
  return { x: sx / n, y: sy / n };
}

function multiPolygonToSliceStrokes(
  mp: MultiPolygon,
  template: StrokeObject,
  tag: string,
  baseZOrder: number,
  offsetX = 0,
  offsetY = 0
): StrokeObject[] {
  const out: StrokeObject[] = [];
  for (let i = 0; i < mp.length; i++) {
    const outer = mp[i]?.[0];
    if (!outer || outer.length < 4 || ringAreaAbs(outer) < 16) continue;
    const points: BezierPoint[] = outer.map(([x, y], idx) => ({
      x: Math.round((x + offsetX) * 100) / 100,
      y: Math.round((y + offsetY) * 100) / 100,
      pressure: 0.5,
      smooth: false,
      ...(idx === 0 || idx === outer.length - 1 ? { twist: 999 } : {}),
    }));
    out.push({
      id: `slice-${Date.now()}-${tag}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      tool: template.tool === 'pencil' ? 'pencil' : 'pen',
      color: template.color,
      width: template.width,
      opacity: template.opacity ?? 1,
      layerId: template.layerId,
      isShape: true,
      shapeType: 'polygon',
      lineStyle: template.lineStyle,
      fillStyle: template.fillStyle,
      fillColor: template.fillColor || template.color,
      fillTransparency: template.fillTransparency,
      zOrder: baseZOrder + out.length,
      points,
    });
  }
  return out;
}

/** Segment-segment intersection returning param u on [a,b] in [0,1] and point (x,y), or null. */
function segmentIntersectParam(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number
): { u: number; x: number; y: number } | null {
  const rx = bx - ax;
  const ry = by - ay;
  const sx = dx - cx;
  const sy = dy - cy;
  const denom = rx * sy - ry * sx;
  if (Math.abs(denom) < 1e-9) return null;
  const qpx = cx - ax;
  const qpy = cy - ay;
  const u = (qpx * sy - qpy * sx) / denom;
  const v = (qpx * ry - qpy * rx) / denom;
  if (u >= -1e-6 && u <= 1 + 1e-6 && v >= -1e-6 && v <= 1 + 1e-6) {
    const cu = Math.max(0, Math.min(1, u));
    return { u: cu, x: ax + cu * rx, y: ay + cu * ry };
  }
  return null;
}

/**
 * Split a closed polygon ring into open perimeter arcs at every intersection with `cutSegments`.
 * Returns open StrokeObjects (no interior chords/radii — pure outline arcs!).
 */
function splitRingOutlineBySegments(
  ring: Ring,
  cutSegments: { ax: number; ay: number; bx: number; by: number }[],
  template: StrokeObject,
  tag: string,
  baseZOrder: number,
  explodeDist = 3.5,
  specialTopLeftQuarterShift = false
): StrokeObject[] {
  const n = ring.length - 1;
  if (n < 3) return [];
  const bounds = getRingBounds(ring);

  // Collect all cuts along the ring parameterized by (segIdx + u)
  const cuts: { pos: number; x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[i + 1];
    for (const cs of cutSegments) {
      const hit = segmentIntersectParam(ax, ay, bx, by, cs.ax, cs.ay, cs.bx, cs.by);
      if (hit) {
        cuts.push({ pos: i + hit.u, x: hit.x, y: hit.y });
      }
    }
  }
  if (cuts.length < 2) return [];

  cuts.sort((a, b) => a.pos - b.pos);
  // Deduplicate cuts that are virtually identical (e.g. right on a vertex)
  const dedupCuts: { pos: number; x: number; y: number }[] = [];
  for (const c of cuts) {
    const prev = dedupCuts[dedupCuts.length - 1];
    if (!prev || Math.hypot(c.x - prev.x, c.y - prev.y) > 0.8) {
      dedupCuts.push(c);
    }
  }
  if (
    dedupCuts.length >= 2 &&
    Math.hypot(
      dedupCuts[0].x - dedupCuts[dedupCuts.length - 1].x,
      dedupCuts[0].y - dedupCuts[dedupCuts.length - 1].y
    ) <= 0.8
  ) {
    dedupCuts.pop();
  }
  if (dedupCuts.length < 2) return [];

  const out: StrokeObject[] = [];
  for (let ci = 0; ci < dedupCuts.length; ci++) {
    const startCut = dedupCuts[ci];
    const endCut = dedupCuts[(ci + 1) % dedupCuts.length];
    const pts: { x: number; y: number }[] = [{ x: startCut.x, y: startCut.y }];

    const startNextVert = Math.floor(startCut.pos) + 1;
    const endPrevVert = Math.floor(endCut.pos);
    const wraps = ci === dedupCuts.length - 1;

    if (!wraps) {
      for (let v = startNextVert; v <= endPrevVert; v++) {
        const idx = v % n;
        const p = { x: ring[idx][0], y: ring[idx][1] };
        const last = pts[pts.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) > 0.4) pts.push(p);
      }
    } else {
      for (let v = startNextVert; v < n; v++) {
        const p = { x: ring[v][0], y: ring[v][1] };
        const last = pts[pts.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) > 0.4) pts.push(p);
      }
      for (let v = 0; v <= endPrevVert; v++) {
        const p = { x: ring[v][0], y: ring[v][1] };
        const last = pts[pts.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) > 0.4) pts.push(p);
      }
    }
    const lastBeforeEnd = pts[pts.length - 1];
    if (Math.hypot(endCut.x - lastBeforeEnd.x, endCut.y - lastBeforeEnd.y) > 0.4) {
      pts.push({ x: endCut.x, y: endCut.y });
    }
    if (pts.length < 2) continue;

    // Arc length check to skip tiny slivers
    let arcLen = 0;
    for (let k = 1; k < pts.length; k++) {
      arcLen += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
    }
    if (arcLen < 6) continue;

    // Gentle outward shift from shape center
    const midPt = pts[Math.floor(pts.length / 2)];
    let ox = 0;
    let oy = 0;
    if (specialTopLeftQuarterShift && midPt.x < bounds.cx && midPt.y < bounds.cy) {
      ox = -10;
      oy = -10;
    } else if (explodeDist > 0) {
      const dx = midPt.x - bounds.cx;
      const dy = midPt.y - bounds.cy;
      const dLen = Math.hypot(dx, dy) || 1;
      ox = (dx / dLen) * explodeDist;
      oy = (dy / dLen) * explodeDist;
    }

    const bezPts: BezierPoint[] = pts.map((p) => ({
      x: Math.round((p.x + ox) * 100) / 100,
      y: Math.round((p.y + oy) * 100) / 100,
      pressure: 0.5,
      smooth: false,
    }));

    out.push({
      id: `slice-${Date.now()}-${tag}-arc-${ci}-${Math.random().toString(36).slice(2, 6)}`,
      tool: template.tool === 'pencil' ? 'pencil' : 'pen',
      color: template.color,
      width: template.width,
      opacity: template.opacity ?? 1,
      layerId: template.layerId,
      isShape: true,
      shapeType: 'line',
      lineStyle: template.lineStyle,
      fillStyle: 'none',
      zOrder: baseZOrder + out.length,
      points: bezPts,
    });
  }
  return out;
}

/**
 * Slice any closed shape along an arbitrary user-drawn polyline/angle/curve using an exact
 * half-plane clipping polygon (closed mode) OR splitting only the perimeter into open arcs (outline mode).
 */
export function sliceShapeWithPath(
  stroke: StrokeObject,
  rawCutPoints: { x: number; y: number }[],
  baseZOrder: number,
  style: SliceStyleMode = 'closed'
): StrokeObject[] {
  if (!isClosedBooleanShape(stroke) || rawCutPoints.length < 2) return [];

  const shapeRing = strokeToPolygonRing(stroke);
  if (shapeRing.length < 4) return [];
  const bounds = getRingBounds(shapeRing);
  const pad = Math.max(bounds.w, bounds.h) * 2.5 + 240;

  // Simplify cut path slightly to avoid tiny jitter micro-loops
  const cut: { x: number; y: number }[] = [rawCutPoints[0]];
  for (let i = 1; i < rawCutPoints.length; i++) {
    const prev = cut[cut.length - 1];
    const cur = rawCutPoints[i];
    if (Math.hypot(cur.x - prev.x, cur.y - prev.y) >= 4 || i === rawCutPoints.length - 1) {
      cut.push(cur);
    }
  }
  if (cut.length < 2) return [];

  // Extend start & end rays outward past the shape bounding box so the cut cleanly bisects the shape
  const pStart = cut[0];
  const pStartNext = cut[1];
  const dsLen = Math.hypot(pStartNext.x - pStart.x, pStartNext.y - pStart.y) || 1;
  const startExt: [number, number] = [
    pStart.x - ((pStartNext.x - pStart.x) / dsLen) * pad,
    pStart.y - ((pStartNext.y - pStart.y) / dsLen) * pad,
  ];

  const pEnd = cut[cut.length - 1];
  const pEndPrev = cut[cut.length - 2];
  const deLen = Math.hypot(pEnd.x - pEndPrev.x, pEnd.y - pEndPrev.y) || 1;
  const endExt: [number, number] = [
    pEnd.x + ((pEnd.x - pEndPrev.x) / deLen) * pad,
    pEnd.y + ((pEnd.y - pEndPrev.y) / deLen) * pad,
  ];

  if (style === 'outline') {
    const extPoly = [
      { x: startExt[0], y: startExt[1] },
      ...cut,
      { x: endExt[0], y: endExt[1] },
    ];
    const cutSegs: { ax: number; ay: number; bx: number; by: number }[] = [];
    for (let i = 0; i < extPoly.length - 1; i++) {
      cutSegs.push({
        ax: extPoly[i].x,
        ay: extPoly[i].y,
        bx: extPoly[i + 1].x,
        by: extPoly[i + 1].y,
      });
    }
    return splitRingOutlineBySegments(shapeRing, cutSegs, stroke, 'knife', baseZOrder, 3.5, false);
  }

  // Build huge half-plane polygon on one side of the extended cut polyline
  const vx = endExt[0] - startExt[0];
  const vy = endExt[1] - startExt[1];
  const vLen = Math.hypot(vx, vy) || 1;
  const nx = -vy / vLen;
  const ny = vx / vLen;

  const halfRing: Ring = [
    startExt,
    ...cut.map((p): [number, number] => [p.x, p.y]),
    endExt,
    [endExt[0] + nx * pad, endExt[1] + ny * pad],
    [startExt[0] + nx * pad, startExt[1] + ny * pad],
    startExt,
  ];

  const shapePoly: Polygon = [shapeRing];
  const halfPoly: Polygon = [halfRing];

  const sideA = polygonClipping.intersection(shapePoly, halfPoly);
  const sideB = polygonClipping.difference(shapePoly, halfPoly);

  if (sideA.length === 0 || sideB.length === 0) {
    return [];
  }

  // Gently separate the two halves by ±3px along the cut normal so the split is immediately visible!
  const SEP = 3;
  const strokesA = multiPolygonToSliceStrokes(sideA, stroke, 'knifeA', baseZOrder, nx * SEP, ny * SEP);
  const strokesB = multiPolygonToSliceStrokes(
    sideB,
    stroke,
    'knifeB',
    baseZOrder + strokesA.length,
    -nx * SEP,
    -ny * SEP
  );
  return [...strokesA, ...strokesB];
}

/** Build a pie wedge polygon from center (cx, cy) with radius R between startAngle and endAngle (radians). */
function buildPieWedgePoly(
  cx: number,
  cy: number,
  radius: number,
  startRad: number,
  endRad: number
): Polygon {
  const steps = Math.max(8, Math.ceil((Math.abs(endRad - startRad) / (Math.PI * 2)) * 72));
  const ring: Ring = [[cx, cy]];
  for (let i = 0; i <= steps; i++) {
    const a = startRad + ((endRad - startRad) * i) / steps;
    ring.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
  }
  ring.push([cx, cy]);
  return [ring];
}

/**
 * 1-click equal slice (½, ⅓, ¼, ⅙, ⅛) or iconic ¼ + ¾ split!
 * Circles/ellipses/polygons are sliced into equal radial pie wedges;
 * rectangles/squares are sliced into equal vertical strips (except 'quarter-split' which cuts the top-left ¼).
 */
export function sliceShapeEqualParts(
  stroke: StrokeObject,
  preset: EqualSlicePreset,
  baseZOrder: number,
  style: SliceStyleMode = 'closed'
): StrokeObject[] {
  if (!isClosedBooleanShape(stroke)) return [];
  const shapeRing = strokeToPolygonRing(stroke);
  if (shapeRing.length < 4) return [];

  const bounds = getRingBounds(shapeRing);
  const shapePoly: Polygon = [shapeRing];
  const R = Math.hypot(bounds.w, bounds.h) + 60;

  if (style === 'outline') {
    const cutSegs: { ax: number; ay: number; bx: number; by: number }[] = [];
    if (preset === 'quarter-split') {
      // 2 rays at 180° (left) and 270° (top) -> splits outline into open ¼ arc + open ¾ arc!
      cutSegs.push({ ax: bounds.cx, ay: bounds.cy, bx: bounds.cx - R, by: bounds.cy });
      cutSegs.push({ ax: bounds.cx, ay: bounds.cy, bx: bounds.cx, by: bounds.cy - R });
      return splitRingOutlineBySegments(shapeRing, cutSegs, stroke, 'q', baseZOrder, 2.5, true);
    }
    const count = preset;
    const isBoxLike = stroke.shapeType === 'rectangle' || stroke.shapeType === 'square';
    if (isBoxLike) {
      const stepW = bounds.w / count;
      for (let i = 1; i < count; i++) {
        const xCut = bounds.minX + i * stepW;
        cutSegs.push({ ax: xCut, ay: bounds.minY - 30, bx: xCut, by: bounds.maxY + 30 });
      }
      return splitRingOutlineBySegments(shapeRing, cutSegs, stroke, `eq${count}`, baseZOrder, 3, false);
    }
    const stepAngle = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + i * stepAngle;
      cutSegs.push({
        ax: bounds.cx,
        ay: bounds.cy,
        bx: bounds.cx + Math.cos(a) * R,
        by: bounds.cy + Math.sin(a) * R,
      });
    }
    return splitRingOutlineBySegments(shapeRing, cutSegs, stroke, `eq${count}`, baseZOrder, 3.5, false);
  }

  if (preset === 'quarter-split') {
    // Iconic top-left ¼ (180° -> 270°) + remaining ¾, nudging the ¼ slice slightly up-left!
    const quarterWedge = buildPieWedgePoly(bounds.cx, bounds.cy, R, Math.PI, Math.PI * 1.5);
    const quarterMp = polygonClipping.intersection(shapePoly, quarterWedge);
    const restMp = polygonClipping.difference(shapePoly, quarterWedge);
    if (quarterMp.length === 0 || restMp.length === 0) return [];
    const qStrokes = multiPolygonToSliceStrokes(quarterMp, stroke, 'q1', baseZOrder + 1, -10, -10);
    const rStrokes = multiPolygonToSliceStrokes(restMp, stroke, 'q3', baseZOrder, 2, 2);
    return [...rStrokes, ...qStrokes];
  }

  const count = preset;
  const isBoxLike = stroke.shapeType === 'rectangle' || stroke.shapeType === 'square';
  const result: StrokeObject[] = [];
  let z = baseZOrder;

  if (isBoxLike) {
    // Clean equal vertical strips for rectangles/squares
    const stepW = bounds.w / count;
    const gap = 3;
    for (let i = 0; i < count; i++) {
      const x1 = bounds.minX + i * stepW - (i === 0 ? 10 : 0);
      const x2 = bounds.minX + (i + 1) * stepW + (i === count - 1 ? 10 : 0);
      const y1 = bounds.minY - 10;
      const y2 = bounds.maxY + 10;
      const stripPoly: Polygon = [
        [
          [x1, y1],
          [x2, y1],
          [x2, y2],
          [x1, y2],
          [x1, y1],
        ],
      ];
      const clipped = polygonClipping.intersection(shapePoly, stripPoly);
      const shiftX = (i - (count - 1) * 0.5) * gap;
      const pieceStrokes = multiPolygonToSliceStrokes(clipped, stroke, `strip-${i}`, z, shiftX, 0);
      z += pieceStrokes.length;
      result.push(...pieceStrokes);
    }
    return result;
  }

  // Equal radial pie wedges starting from 12 o'clock (-π/2) clockwise!
  const stepAngle = (Math.PI * 2) / count;
  const explodeDist = 3.5;
  for (let i = 0; i < count; i++) {
    const a0 = -Math.PI / 2 + i * stepAngle;
    const a1 = a0 + stepAngle;
    const wedge = buildPieWedgePoly(bounds.cx, bounds.cy, R, a0, a1);
    const clipped = polygonClipping.intersection(shapePoly, wedge);
    if (clipped.length === 0) continue;
    const midA = (a0 + a1) * 0.5;
    const c = clipped[0]?.[0] ? ringCentroid(clipped[0][0]) : { x: bounds.cx + Math.cos(midA), y: bounds.cy + Math.sin(midA) };
    const dx = c.x - bounds.cx;
    const dy = c.y - bounds.cy;
    const dLen = Math.hypot(dx, dy) || 1;
    const pieceStrokes = multiPolygonToSliceStrokes(
      clipped,
      stroke,
      `pie-${i}`,
      z,
      (dx / dLen) * explodeDist,
      (dy / dLen) * explodeDist
    );
    z += pieceStrokes.length;
    result.push(...pieceStrokes);
  }
  return result;
}
