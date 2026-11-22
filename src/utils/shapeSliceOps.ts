import polygonClipping from 'polygon-clipping';
import type { MultiPolygon, Polygon, Ring } from 'polygon-clipping';
import type { BezierPoint, StrokeObject } from '../types/note';
import { isClosedBooleanShape, strokeToPolygonRing } from './shapeBooleanOps';

export type EqualSlicePreset = 'quarter-split' | 2 | 3 | 4 | 6 | 8;

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

/**
 * Slice any closed shape along an arbitrary user-drawn polyline/angle/curve using an exact
 * half-plane clipping polygon (zero material loss, works for straight lines, L-angles & curves!).
 */
export function sliceShapeWithPath(
  stroke: StrokeObject,
  rawCutPoints: { x: number; y: number }[],
  baseZOrder: number
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
  baseZOrder: number
): StrokeObject[] {
  if (!isClosedBooleanShape(stroke)) return [];
  const shapeRing = strokeToPolygonRing(stroke);
  if (shapeRing.length < 4) return [];

  const bounds = getRingBounds(shapeRing);
  const shapePoly: Polygon = [shapeRing];
  const R = Math.hypot(bounds.w, bounds.h) + 60;

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
