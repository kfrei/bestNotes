import {
  BezierPoint,
  StrokeObject,
  TextObject,
  ShapePresetType,
} from "../../../types/note";
import {
  distance,
  rdpSimplify,
  makePolygonBezier,
  computeResistorOrSpringPoints,
  createPhysicsStencilStrokes,
  getCubicSegmentControlPoints,
  isQuadraticSegmentCollinear,
} from "../../../utils/geometryAndAlgorithms";

// CIRCUIT TERMINALS, AUTO-SPLIT WIRE ROUTING, 1-CLICK CONVERSION & SIMULATION
// ============================================================================

export type CircuitComponentKind =
  | 'battery'
  | 'voltage-source'
  | 'bulb'
  | 'resistor'
  | 'switch'
  | 'fan'
  | 'ammeter'
  | 'voltmeter';

export interface CircuitComponentInfo {
  key: string; // groupId or stroke.id
  kind: CircuitComponentKind;
  strokeIds: string[];
  color: string;
  layerId: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
  leftTerm: { x: number; y: number };
  rightTerm: { x: number; y: number };
  topTerm?: { x: number; y: number };
  bottomTerm?: { x: number; y: number };
  circleCx?: number;
  circleCy?: number;
  circleR?: number;
  orientation?: 'h' | 'v';
  switchClosed?: boolean;
}

export function classifyCircuitStrokeKind(s: StrokeObject): CircuitComponentKind | null {
  const st = s.shapeType;
  if (st === 'battery') return 'battery';
  if (st === 'voltage-source') return 'voltage-source';
  if (st === 'bulb') return 'bulb';
  if (st === 'resistor') return 'resistor';
  if (st === 'switch' || st === 'switch-blade' || st === 'switch-knob') return 'switch';
  if (st === 'fan' || st === 'fan-blade' || st === 'fan-hub') return 'fan';
  if (st === 'ammeter' || st === 'ammeter-needle' || st === 'ammeter-label') return 'ammeter';
  if (st === 'voltmeter' || st === 'voltmeter-needle' || st === 'voltmeter-label') return 'voltmeter';
  return null;
}

const circuitCompsByArrayCache = new WeakMap<StrokeObject[], CircuitComponentInfo[]>();
const circuitCompsBySigCache = new Map<string, CircuitComponentInfo[]>();

function buildCircuitStrokesFastSig(strokes: StrokeObject[]): string | null {
  if (strokes.length > 96) return null;
  let sig = `${strokes.length}:`;
  for (let i = 0; i < strokes.length; i++) {
    const s = strokes[i];
    const p0 = s.points[0];
    const pN = s.points[s.points.length - 1];
    sig += `${s.id},${s.points.length},${p0 ? Math.round(p0.x * 2) : 0},${p0 ? Math.round(p0.y * 2) : 0},${pN ? Math.round(pN.x * 2) : 0},${pN ? Math.round(pN.y * 2) : 0};`;
  }
  return sig;
}

export function getCircuitComponentsWithTerminals(
  strokes: StrokeObject[]
): CircuitComponentInfo[] {
  if (!strokes || strokes.length === 0) return [];
  const cachedByRef = circuitCompsByArrayCache.get(strokes);
  if (cachedByRef) return cachedByRef;

  let hasAnyCircuitComp = false;
  for (let i = 0; i < strokes.length; i++) {
    if (classifyCircuitStrokeKind(strokes[i]) !== null) {
      hasAnyCircuitComp = true;
      break;
    }
  }
  if (!hasAnyCircuitComp) {
    const empty: CircuitComponentInfo[] = [];
    circuitCompsByArrayCache.set(strokes, empty);
    return empty;
  }

  const fastSig = buildCircuitStrokesFastSig(strokes);
  if (fastSig) {
    const cachedBySig = circuitCompsBySigCache.get(fastSig);
    if (cachedBySig) {
      circuitCompsByArrayCache.set(strokes, cachedBySig);
      return cachedBySig;
    }
  }

  interface CompCandidate {
    stroke: StrokeObject;
    kind: CircuitComponentKind;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }

  // Detect whether a groupId is a dedicated single-component group or a macro "sim group" (shared across multiple component kinds or wires)
  const groupKinds = new Map<string, Set<CircuitComponentKind>>();
  const groupHasWire = new Set<string>();
  for (const s of strokes) {
    if (!s.groupId) continue;
    const kind = classifyCircuitStrokeKind(s);
    if (kind) {
      let set = groupKinds.get(s.groupId);
      if (!set) {
        set = new Set();
        groupKinds.set(s.groupId, set);
      }
      set.add(kind);
    } else {
      groupHasWire.add(s.groupId);
    }
  }

  const candidates: CompCandidate[] = [];
  for (const s of strokes) {
    const kind = classifyCircuitStrokeKind(s);
    if (!kind) continue;
    let sMinX = Infinity,
      sMinY = Infinity,
      sMaxX = -Infinity,
      sMaxY = -Infinity;
    for (const p of s.points) {
      if (p.x < sMinX) sMinX = p.x;
      if (p.y < sMinY) sMinY = p.y;
      if (p.x > sMaxX) sMaxX = p.x;
      if (p.y > sMaxY) sMaxY = p.y;
    }
    if (!Number.isFinite(sMinX)) continue;
    candidates.push({
      stroke: s,
      kind,
      minX: sMinX,
      minY: sMinY,
      maxX: sMaxX,
      maxY: sMaxY,
    });
  }

  const visited = new Uint8Array(candidates.length);
  const clusters: { key: string; kind: CircuitComponentKind; strokes: StrokeObject[] }[] = [];

  for (let i = 0; i < candidates.length; i++) {
    if (visited[i]) continue;
    visited[i] = 1;
    const seed = candidates[i];
    const clusterStrokes: StrokeObject[] = [seed.stroke];
    let cMinX = seed.minX;
    let cMinY = seed.minY;
    let cMaxX = seed.maxX;
    let cMaxY = seed.maxY;

    const seedGrp = seed.stroke.groupId;
    const isDedicatedCompGroup =
      Boolean(seedGrp) &&
      (groupKinds.get(seedGrp!)?.size ?? 0) === 1 &&
      !groupHasWire.has(seedGrp!);

    let added = true;
    while (added) {
      added = false;
      for (let j = 0; j < candidates.length; j++) {
        if (visited[j]) continue;
        const cand = candidates[j];
        // Never merge strokes of different component kinds (e.g. bulb vs fan vs battery), even when grouped as one "sim group"!
        if (cand.kind !== seed.kind) continue;

        const gapX = Math.max(0, cMinX - cand.maxX, cand.minX - cMaxX);
        const gapY = Math.max(0, cMinY - cand.maxY, cand.minY - cMaxY);
        const spatiallyClose = gapX <= 16 && gapY <= 16;

        if (spatiallyClose) {
          visited[j] = 1;
          clusterStrokes.push(cand.stroke);
          cMinX = Math.min(cMinX, cand.minX);
          cMinY = Math.min(cMinY, cand.minY);
          cMaxX = Math.max(cMaxX, cand.maxX);
          cMaxY = Math.max(cMaxY, cand.maxY);
          added = true;
        }
      }
    }

    const key = `comp-${seed.kind}-${seed.stroke.id}`;
    clusters.push({ key, kind: seed.kind, strokes: clusterStrokes });
  }

  const out: CircuitComponentInfo[] = [];
  for (const entry of clusters) {
    const key = entry.key;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    let switchClosed: boolean | undefined;
    for (const s of entry.strokes) {
      if (s.switchClosed !== undefined) {
        switchClosed = s.switchClosed;
      }
      for (const p of s.points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
    }
    if (!Number.isFinite(minX)) continue;
    const w = Math.max(12, maxX - minX);
    const h = Math.max(12, maxY - minY);
    let cx = (minX + maxX) / 2;
    let cy = (minY + maxY) / 2;

    let leftTerm = { x: minX, y: cy };
    let rightTerm = { x: maxX, y: cy };
    let topTerm: { x: number; y: number } | undefined;
    let bottomTerm: { x: number; y: number } | undefined;
    let circleCx: number | undefined;
    let circleCy: number | undefined;
    let circleR: number | undefined;
    let orientation: 'h' | 'v' | undefined;

    if (entry.kind === 'ammeter' || entry.kind === 'voltmeter') {
      const ringStroke = entry.strokes.find(
        (s) => s.shapeType === entry.kind && s.points.length >= 4
      );
      if (ringStroke) {
        let rMinX = Infinity,
          rMinY = Infinity,
          rMaxX = -Infinity,
          rMaxY = -Infinity;
        for (const p of ringStroke.points) {
          if (p.x < rMinX) rMinX = p.x;
          if (p.y < rMinY) rMinY = p.y;
          if (p.x > rMaxX) rMaxX = p.x;
          if (p.y > rMaxY) rMaxY = p.y;
        }
        if (Number.isFinite(rMinX)) {
          circleCx = (rMinX + rMaxX) / 2;
          circleCy = (rMinY + rMaxY) / 2;
          circleR = Math.max(10, (rMaxX - rMinX + (rMaxY - rMinY)) / 4);
        }
      }
      if (circleCx === undefined || circleCy === undefined || circleR === undefined) {
        circleR = Math.max(14, Math.min(w, h) * 0.33);
        circleCx = minX + w * 0.42;
        circleCy = minY + h * 0.58;
      }
      cx = circleCx;
      cy = circleCy;

      // Detect whether wires attach vertically (top/bottom of circle) or horizontally (left/right of circle)
      const entryIdSet = new Set(entry.strokes.map((s) => s.id));
      let horizScore = 0;
      let vertScore = 0;
      const topPt = { x: circleCx, y: circleCy - circleR };
      const botPt = { x: circleCx, y: circleCy + circleR };
      const leftPt = { x: circleCx - circleR, y: circleCy };
      const rightPt = { x: circleCx + circleR, y: circleCy };
      const snapTol = Math.max(52, circleR * 1.55);

      for (const ws of strokes) {
        if (entryIdSet.has(ws.id) || classifyCircuitStrokeKind(ws) !== null) continue;
        if (ws.tool === 'highlighter' || ws.points.length < 2) continue;
        if (ws.shapeType && ws.shapeType !== 'line') continue;
        if (ws.points[0]?.twist === 999) continue;

        // 1. Check overall wire stroke endpoints and orientation (handles both straight lines & freehand strokes)
        const pStart = ws.points[0];
        const pEnd = ws.points[ws.points.length - 1];
        const overallDx = Math.abs(pEnd.x - pStart.x);
        const overallDy = Math.abs(pEnd.y - pStart.y);
        const isOverallV = overallDy >= Math.max(16, overallDx * 1.15);
        const isOverallH = overallDx >= Math.max(16, overallDy * 1.15);

        if (isOverallV) {
          const dStartT = distance(pStart, topPt);
          const dEndT = distance(pEnd, topPt);
          const dStartB = distance(pStart, botPt);
          const dEndB = distance(pEnd, botPt);
          if (Math.min(dStartT, dEndT) <= snapTol) vertScore += 3;
          if (Math.min(dStartB, dEndB) <= snapTol) vertScore += 3;
          const strokeMidX = (pStart.x + pEnd.x) / 2;
          if (Math.abs(strokeMidX - circleCx) <= Math.max(45, circleR * 1.6)) {
            const segMinY = Math.min(pStart.y, pEnd.y);
            const segMaxY = Math.max(pStart.y, pEnd.y);
            if (segMaxY >= topPt.y - 45 && segMinY <= botPt.y + 45) {
              vertScore += 3;
            }
          }
        } else if (isOverallH) {
          const dStartL = distance(pStart, leftPt);
          const dEndL = distance(pEnd, leftPt);
          const dStartR = distance(pStart, rightPt);
          const dEndR = distance(pEnd, rightPt);
          if (Math.min(dStartL, dEndL) <= snapTol) horizScore += 3;
          if (Math.min(dStartR, dEndR) <= snapTol) horizScore += 3;
          const strokeMidY = (pStart.y + pEnd.y) / 2;
          if (Math.abs(strokeMidY - circleCy) <= Math.max(45, circleR * 1.6)) {
            const segMinX = Math.min(pStart.x, pEnd.x);
            const segMaxX = Math.max(pStart.x, pEnd.x);
            if (segMaxX >= leftPt.x - 45 && segMinX <= rightPt.x + 45) {
              horizScore += 3;
            }
          }
        }

        // 2. Also sample segments along the stroke with step size adapted to freehand point density
        const ptStep = Math.max(1, Math.min(6, Math.floor(ws.points.length / 8)));
        for (let k = 0; k < ws.points.length - ptStep; k += ptStep) {
          const a = ws.points[k];
          const b = ws.points[k + ptStep];
          const sdx = Math.abs(b.x - a.x);
          const sdy = Math.abs(b.y - a.y);
          if (Math.hypot(sdx, sdy) < 5) continue;
          const isH = sdy <= Math.max(20, sdx * 0.4);
          const isV = sdx <= Math.max(20, sdy * 0.4);
          if (isH) {
            const dL = Math.min(distance(a, leftPt), distance(b, leftPt));
            const dR = Math.min(distance(a, rightPt), distance(b, rightPt));
            if (dL <= snapTol) horizScore += 2;
            if (dR <= snapTol) horizScore += 2;
            if (
              Math.min(a.x, b.x) < leftPt.x - 4 &&
              Math.max(a.x, b.x) > rightPt.x + 4 &&
              Math.abs((a.y + b.y) / 2 - circleCy) <= circleR * 1.35
            ) {
              horizScore += 3;
            }
            if (Math.abs((a.y + b.y) / 2 - circleCy) <= Math.max(34, circleR * 1.3)) {
              if (Math.abs(Math.max(a.x, b.x) - leftPt.x) <= snapTol || Math.abs(Math.min(a.x, b.x) - rightPt.x) <= snapTol) {
                horizScore += 2;
              }
            }
          } else if (isV) {
            const dT = Math.min(distance(a, topPt), distance(b, topPt));
            const dB = Math.min(distance(a, botPt), distance(b, botPt));
            if (dT <= snapTol) vertScore += 2;
            if (dB <= snapTol) vertScore += 2;
            if (
              Math.min(a.y, b.y) < topPt.y - 4 &&
              Math.max(a.y, b.y) > botPt.y + 4 &&
              Math.abs((a.x + b.x) / 2 - circleCx) <= circleR * 1.35
            ) {
              vertScore += 3;
            }
            if (Math.abs((a.x + b.x) / 2 - circleCx) <= Math.max(34, circleR * 1.3)) {
              if (Math.abs(Math.max(a.y, b.y) - topPt.y) <= snapTol || Math.abs(Math.min(a.y, b.y) - botPt.y) <= snapTol) {
                vertScore += 2;
              }
            }
          }
        }
      }

      if (vertScore === 0 && horizScore === 0) {
        // Fallback: check proximity to any external straight wire segment
        for (const ws of strokes) {
          if (entryIdSet.has(ws.id) || classifyCircuitStrokeKind(ws) !== null) continue;
          if (ws.tool === 'highlighter' || ws.points.length < 2) continue;
          if (ws.shapeType && ws.shapeType !== 'line') continue;
          const pStart = ws.points[0];
          const pEnd = ws.points[ws.points.length - 1];
          const sdx = Math.abs(pEnd.x - pStart.x);
          const sdy = Math.abs(pEnd.y - pStart.y);
          const isH = sdy <= Math.max(20, sdx * 0.35);
          const isV = sdx <= Math.max(20, sdy * 0.35);
          if (isV && Math.abs((pStart.x + pEnd.x) / 2 - circleCx) <= Math.max(45, circleR * 1.6)) {
            const segMinY = Math.min(pStart.y, pEnd.y);
            const segMaxY = Math.max(pStart.y, pEnd.y);
            if (segMaxY >= topPt.y - 70 && segMinY <= botPt.y + 70) {
              vertScore += 2;
            }
          } else if (isH && Math.abs((pStart.y + pEnd.y) / 2 - circleCy) <= Math.max(45, circleR * 1.6)) {
            const segMinX = Math.min(pStart.x, pEnd.x);
            const segMaxX = Math.max(pStart.x, pEnd.x);
            if (segMaxX >= leftPt.x - 70 && segMinX <= rightPt.x + 70) {
              horizScore += 2;
            }
          }
        }
      }

      topTerm = topPt;
      bottomTerm = botPt;
      if (vertScore > horizScore && vertScore > 0) {
        orientation = 'v';
        leftTerm = topPt;
        rightTerm = botPt;
      } else {
        orientation = 'h';
        leftTerm = leftPt;
        rightTerm = rightPt;
      }
    } else if (entry.kind === 'bulb') {
      const wlStroke = entry.strokes.find((s) => s.id.includes('-bulb-wl'));
      const wrStroke = entry.strokes.find((s) => s.id.includes('-bulb-wr'));
      const leftY =
        wlStroke && wlStroke.points.length > 0
          ? wlStroke.points[0].y
          : minY + h * 0.753;
      const rightY =
        wrStroke && wrStroke.points.length > 0
          ? wrStroke.points[wrStroke.points.length - 1].y
          : minY + h * 0.944;
      const leftX = wlStroke ? minX : cx - Math.max(8, w * 0.23);
      const rightX = wrStroke ? maxX : cx + Math.max(8, w * 0.23);
      leftTerm = { x: leftX, y: leftY };
      rightTerm = { x: rightX, y: rightY };
    } else if (entry.kind === 'switch') {
      const wireY = minY + h * 0.68;
      leftTerm = { x: minX, y: wireY };
      rightTerm = { x: maxX, y: wireY };
    } else if (entry.kind === 'battery') {
      const bodyStroke = entry.strokes.find((s) => s.points.length >= 6);
      if (bodyStroke) {
        let bMinX = Infinity;
        let bMaxX = -Infinity;
        let bMinY = Infinity;
        let bMaxY = -Infinity;
        for (const p of bodyStroke.points) {
          if (p.x < bMinX) bMinX = p.x;
          if (p.x > bMaxX) bMaxX = p.x;
          if (p.y < bMinY) bMinY = p.y;
          if (p.y > bMaxY) bMaxY = p.y;
        }
        const bCy = Number.isFinite(bMinY) && Number.isFinite(bMaxY) ? (bMinY + bMaxY) / 2 : cy;
        leftTerm = { x: Number.isFinite(bMinX) ? bMinX : minX + w * 0.16, y: bCy };
        rightTerm = { x: Number.isFinite(bMaxX) ? bMaxX : maxX - w * 0.16, y: bCy };
      } else {
        leftTerm = { x: minX + w * 0.16, y: cy };
        rightTerm = { x: maxX - w * 0.16, y: cy };
      }
    }

    const primaryStroke = entry.strokes[0];
    out.push({
      key,
      kind: entry.kind,
      strokeIds: entry.strokes.map((s) => s.id),
      color: primaryStroke.color || '#111827',
      layerId: primaryStroke.layerId,
      minX,
      minY,
      maxX,
      maxY,
      cx,
      cy,
      w,
      h,
      leftTerm,
      rightTerm,
      topTerm,
      bottomTerm,
      circleCx,
      circleCy,
      circleR,
      orientation,
      switchClosed: entry.kind === 'switch' ? (switchClosed ?? true) : undefined,
    });
  }

  circuitCompsByArrayCache.set(strokes, out);
  if (fastSig) {
    if (circuitCompsBySigCache.size >= 64) {
      const oldest = circuitCompsBySigCache.keys().next().value;
      if (oldest !== undefined) circuitCompsBySigCache.delete(oldest);
    }
    circuitCompsBySigCache.set(fastSig, out);
  }
  return out;
}

/**
 * Ensures all Ammeter and Voltmeter components have a true 1:1 circular ring,
 * a single crisp -45° needle, and clean 'A'/'V' label spacing (so 'A' never touches the needle tip,
 * and no duplicate or squished needle strokes remain after a non-uniform resize).
 */
export function repairCircuitMeterStrokes(strokes: StrokeObject[]): {
  strokes: StrokeObject[];
  repaired: boolean;
} {
  if (!strokes || strokes.length === 0) return { strokes, repaired: false };
  const comps = getCircuitComponentsWithTerminals(strokes).filter(
    (c) => c.kind === 'ammeter' || c.kind === 'voltmeter'
  );
  if (comps.length === 0) return { strokes, repaired: false };

  let repaired = false;
  const updatedById = new Map<string, StrokeObject>();
  const removedIds = new Set<string>();

  for (const comp of comps) {
    const memberStrokes = strokes.filter((s) => comp.strokeIds.includes(s.id));
    const ringStroke = memberStrokes.find(
      (s) => s.shapeType === comp.kind && s.points.length >= 4
    );
    if (!ringStroke) continue;

    let rMinX = Infinity,
      rMinY = Infinity,
      rMaxX = -Infinity,
      rMaxY = -Infinity;
    for (const p of ringStroke.points) {
      if (p.x < rMinX) rMinX = p.x;
      if (p.y < rMinY) rMinY = p.y;
      if (p.x > rMaxX) rMaxX = p.x;
      if (p.y > rMaxY) rMaxY = p.y;
    }
    if (!Number.isFinite(rMinX)) continue;

    const ccx = (rMinX + rMaxX) / 2;
    const ccy = (rMinY + rMaxY) / 2;
    const rW = rMaxX - rMinX;
    const rH = rMaxY - rMinY;
    const rCircle = Math.max(12, (rW + rH) / 4);

    const ang = -Math.PI / 4;
    const pivX = ccx - Math.SQRT1_2 * rCircle;
    const pivY = ccy + Math.SQRT1_2 * rCircle;
    const needleLen = rCircle * 2.60;
    const tipX = pivX + Math.cos(ang) * needleLen;
    const tipY = pivY + Math.sin(ang) * needleLen;
    const headLen = Math.max(8.0, rCircle * 0.32);
    const headHalfW = headLen * 0.52;
    const shaftEndX = tipX - Math.cos(ang) * headLen * 0.78;
    const shaftEndY = tipY - Math.sin(ang) * headLen * 0.78;
    const baseCenterX = tipX - Math.cos(ang) * headLen;
    const baseCenterY = tipY - Math.sin(ang) * headLen;
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);

    const lblH = Math.max(11.5, rCircle * 0.5);
    const lblHalfW = Math.max(3.6, lblH * 0.31);
    const lblCx =
      comp.kind === 'ammeter'
        ? tipX + rCircle * 0.34 + lblHalfW * 0.55
        : tipX + rCircle * 0.25;
    const lblBotY =
      comp.kind === 'ammeter'
        ? tipY - rCircle * 0.08
        : tipY - rCircle * 0.04;
    const lblTopY = lblBotY - lblH;

    // 1. Check if ring is squished into an ellipse
    if (Math.abs(rW - rH) > 1.2) {
      const steps = 44;
      const pts: BezierPoint[] = [];
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const px = ccx + Math.cos(a) * rCircle;
        const py = ccy + Math.sin(a) * rCircle;
        const prev = pts.length > 0 ? pts[pts.length - 1] : null;
        pts.push({
          x: px,
          y: py,
          cx: prev ? (prev.x + px) / 2 : undefined,
          cy: prev ? (prev.y + py) / 2 : undefined,
          pressure: 0.7,
          twist: i === 0 || i === steps ? 999 : undefined,
        });
      }
      updatedById.set(ringStroke.id, { ...ringStroke, points: pts });
      repaired = true;
    }

    // 2. Check needle strokes (deduplicate if multiple shafts/heads exist, and snap to exact -45° chord)
    const needleStrokes = memberStrokes.filter(
      (s) => s.shapeType === 'ammeter-needle' || s.shapeType === 'voltmeter-needle'
    );
    const shaftStrokes = needleStrokes.filter((s) => s.points.length === 2);
    const headStrokes = needleStrokes.filter((s) => s.points.length >= 3);

    if (shaftStrokes.length > 1) {
      for (let i = 1; i < shaftStrokes.length; i++) {
        removedIds.add(shaftStrokes[i].id);
        repaired = true;
      }
    }
    if (headStrokes.length > 1) {
      for (let i = 1; i < headStrokes.length; i++) {
        removedIds.add(headStrokes[i].id);
        repaired = true;
      }
    }

    if (shaftStrokes.length >= 1) {
      const sh = shaftStrokes[0];
      const d0 = Math.hypot(sh.points[0].x - pivX, sh.points[0].y - pivY);
      const d1 = Math.hypot(sh.points[1].x - shaftEndX, sh.points[1].y - shaftEndY);
      if (d0 > 1.2 || d1 > 1.2) {
        updatedById.set(sh.id, {
          ...sh,
          points: [
            { x: pivX, y: pivY, pressure: 0.7 },
            {
              x: shaftEndX,
              y: shaftEndY,
              cx: (pivX + shaftEndX) / 2,
              cy: (pivY + shaftEndY) / 2,
              pressure: 0.7,
            },
          ],
        });
        repaired = true;
      }
    }

    if (headStrokes.length >= 1) {
      const hd = headStrokes[0];
      const dTip = Math.hypot(hd.points[0].x - tipX, hd.points[0].y - tipY);
      if (dTip > 1.2) {
        const w1 = { x: baseCenterX + nx * headHalfW, y: baseCenterY + ny * headHalfW };
        const w2 = { x: baseCenterX - nx * headHalfW, y: baseCenterY - ny * headHalfW };
        updatedById.set(hd.id, {
          ...hd,
          points: [
            { x: tipX, y: tipY, pressure: 0.7, twist: 999 },
            { x: w1.x, y: w1.y, cx: (tipX + w1.x) / 2, cy: (tipY + w1.y) / 2, pressure: 0.7 },
            { x: w2.x, y: w2.y, cx: (w1.x + w2.x) / 2, cy: (w1.y + w2.y) / 2, pressure: 0.7 },
            { x: tipX, y: tipY, cx: (w2.x + tipX) / 2, cy: (w2.y + tipY) / 2, pressure: 0.7, twist: 999 },
          ],
        });
        repaired = true;
      }
    }

    // 3. Check 'A' or 'V' label strokes so 'A' never overlaps the needle tip
    const labelStrokes = memberStrokes.filter(
      (s) => s.shapeType === 'ammeter-label' || s.shapeType === 'voltmeter-label'
    );
    if (comp.kind === 'ammeter' && labelStrokes.length >= 1) {
      const archStroke = labelStrokes.find((s) => s.points.length === 3) || labelStrokes[0];
      const barStroke = labelStrokes.find((s) => s.points.length === 2);
      const targetLeftFootX = lblCx - lblHalfW;
      const curLeftFoot = archStroke.points[0];
      if (
        Math.hypot(curLeftFoot.x - targetLeftFootX, curLeftFoot.y - lblBotY) > 1.2
      ) {
        updatedById.set(archStroke.id, {
          ...archStroke,
          points: [
            { x: lblCx - lblHalfW, y: lblBotY, pressure: 0.7 },
            {
              x: lblCx,
              y: lblTopY,
              cx: (lblCx - lblHalfW + lblCx) / 2,
              cy: (lblBotY + lblTopY) / 2,
              pressure: 0.7,
            },
            {
              x: lblCx + lblHalfW,
              y: lblBotY,
              cx: (lblCx + lblCx + lblHalfW) / 2,
              cy: (lblTopY + lblBotY) / 2,
              pressure: 0.7,
            },
          ],
        });
        if (barStroke) {
          const barY = lblTopY + lblH * 0.64;
          updatedById.set(barStroke.id, {
            ...barStroke,
            points: [
              { x: lblCx - lblHalfW * 0.64, y: barY, pressure: 0.7 },
              {
                x: lblCx + lblHalfW * 0.64,
                y: barY,
                cx: lblCx,
                cy: barY,
                pressure: 0.7,
              },
            ],
          });
        }
        repaired = true;
      }
    } else if (comp.kind === 'voltmeter' && labelStrokes.length >= 1) {
      const vStroke = labelStrokes.find((s) => s.points.length === 3) || labelStrokes[0];
      if (vStroke.points.length === 3) {
        const curBotVertex = vStroke.points[1];
        if (Math.hypot(curBotVertex.x - lblCx, curBotVertex.y - lblBotY) > 1.2) {
          updatedById.set(vStroke.id, {
            ...vStroke,
            points: [
              { x: lblCx - lblHalfW, y: lblTopY, pressure: 0.7 },
              {
                x: lblCx,
                y: lblBotY,
                cx: (lblCx - lblHalfW + lblCx) / 2,
                cy: (lblTopY + lblBotY) / 2,
                pressure: 0.7,
              },
              {
                x: lblCx + lblHalfW,
                y: lblTopY,
                cx: (lblCx + lblCx + lblHalfW) / 2,
                cy: (lblBotY + lblTopY) / 2,
                pressure: 0.7,
              },
            ],
          });
          repaired = true;
        }
      }
    }
  }

  if (!repaired) return { strokes, repaired: false };
  const nextStrokes = strokes
    .filter((s) => !removedIds.has(s.id))
    .map((s) => updatedById.get(s.id) || s);
  return { strokes: nextStrokes, repaired: true };
}

export function splitWiresUnderCircuitComponent(
  strokes: StrokeObject[],
  componentStrokeIds: string[]
): StrokeObject[] {
  if (componentStrokeIds.length === 0) return strokes;
  const compSet = new Set(componentStrokeIds);
  const targetStrokes = strokes.filter((s) => compSet.has(s.id));
  if (targetStrokes.length === 0) return strokes;

  const comps = getCircuitComponentsWithTerminals(strokes).filter((c) =>
    c.strokeIds.some((id) => compSet.has(id))
  );
  if (comps.length === 0) return strokes;

  let currentStrokes = [...strokes];

  for (const comp of comps) {
    // For circular meters (ammeter / voltmeter), support centering & wire-splitting on BOTH horizontal and vertical wires!
    if (comp.kind === 'ammeter' || comp.kind === 'voltmeter') {
      let ccx = comp.circleCx ?? comp.cx;
      let ccy = comp.circleCy ?? comp.cy;
      const rC = comp.circleR ?? Math.max(14, Math.min(comp.w, comp.h) * 0.35);
      const idSet = new Set(comp.strokeIds);
      const SNAP_R = 44;

      // Pass 1: Find the closest crossing or terminal-approaching horizontal or vertical wire to center the circle dead-on the wire!
      let bestSnapAxis: 'h' | 'v' | null = null;
      let bestSnapDist = Math.max(46, rC * 1.85);
      let snapTargetCoord = 0;

      for (const s of currentStrokes) {
        if (idSet.has(s.id) || classifyCircuitStrokeKind(s) !== null) continue;
        if (
          !(s.shapeType === 'line' || (!s.isShape && s.points.length >= 2)) ||
          s.points.length < 2 ||
          s.points.length > 3
        ) {
          continue;
        }
        const p0 = s.points[0];
        const p1 = s.points[s.points.length - 1];
        const sdx = Math.abs(p1.x - p0.x);
        const sdy = Math.abs(p1.y - p0.y);
        const segLen = Math.hypot(sdx, sdy);
        if (segLen < 12) continue;
        const isH = sdy <= Math.max(20, sdx * 0.35);
        const isV = sdx <= Math.max(20, sdy * 0.35);
        if (isH) {
          const wireY = (p0.y + p1.y) / 2;
          const minWX = Math.min(p0.x, p1.x);
          const maxWX = Math.max(p0.x, p1.x);
          const crosses = minWX < ccx - rC - 4 && maxWX > ccx + rC + 4;
          const touchesSide =
            Math.hypot(p0.x - (ccx - rC), p0.y - ccy) <= SNAP_R ||
            Math.hypot(p1.x - (ccx - rC), p1.y - ccy) <= SNAP_R ||
            Math.hypot(p0.x - (ccx + rC), p0.y - ccy) <= SNAP_R ||
            Math.hypot(p1.x - (ccx + rC), p1.y - ccy) <= SNAP_R;
          const perpD = Math.abs(ccy - wireY);
          if ((crosses || touchesSide) && perpD <= bestSnapDist) {
            bestSnapDist = perpD;
            bestSnapAxis = 'h';
            snapTargetCoord = wireY;
          }
        } else if (isV) {
          const wireX = (p0.x + p1.x) / 2;
          const minWY = Math.min(p0.y, p1.y);
          const maxWY = Math.max(p0.y, p1.y);
          const crosses = minWY < ccy - rC - 4 && maxWY > ccy + rC + 4;
          const touchesTopBot =
            Math.hypot(p0.x - ccx, p0.y - (ccy - rC)) <= SNAP_R ||
            Math.hypot(p1.x - ccx, p1.y - (ccy - rC)) <= SNAP_R ||
            Math.hypot(p0.x - ccx, p0.y - (ccy + rC)) <= SNAP_R ||
            Math.hypot(p1.x - ccx, p1.y - (ccy + rC)) <= SNAP_R;
          const perpD = Math.abs(ccx - wireX);
          if ((crosses || touchesTopBot) && perpD <= bestSnapDist) {
            bestSnapDist = perpD;
            bestSnapAxis = 'v';
            snapTargetCoord = wireX;
          }
        }
      }

      if (bestSnapAxis === 'h') {
        const dy = snapTargetCoord - ccy;
        if (Math.abs(dy) >= 0.25) {
          currentStrokes = currentStrokes.map((st) =>
            idSet.has(st.id)
              ? {
                  ...st,
                  points: st.points.map((pt) => ({
                    ...pt,
                    y: pt.y + dy,
                    cy: pt.cy !== undefined ? pt.cy + dy : undefined,
                  })),
                }
              : st
          );
          ccy = snapTargetCoord;
        }
      } else if (bestSnapAxis === 'v') {
        const dx = snapTargetCoord - ccx;
        if (Math.abs(dx) >= 0.25) {
          currentStrokes = currentStrokes.map((st) =>
            idSet.has(st.id)
              ? {
                  ...st,
                  points: st.points.map((pt) => ({
                    ...pt,
                    x: pt.x + dx,
                    cx: pt.cx !== undefined ? pt.cx + dx : undefined,
                  })),
                }
              : st
          );
          ccx = snapTargetCoord;
        }
      }

      // Pass 2: Split or endpoint-snap horizontal OR vertical wires right at the circle perimeter!
      const meterNext: StrokeObject[] = [];
      const leftTerm = { x: ccx - rC, y: ccy };
      const rightTerm = { x: ccx + rC, y: ccy };
      const topTerm = { x: ccx, y: ccy - rC };
      const botTerm = { x: ccx, y: ccy + rC };

      for (const s of currentStrokes) {
        if (idSet.has(s.id) || classifyCircuitStrokeKind(s) !== null) {
          meterNext.push(s);
          continue;
        }
        if (
          (s.shapeType === 'line' || (!s.isShape && s.points.length >= 2)) &&
          s.points.length >= 2 &&
          s.points.length <= 3
        ) {
          const pStart = s.points[0];
          const pEnd = s.points[s.points.length - 1];
          const sdx = Math.abs(pEnd.x - pStart.x);
          const sdy = Math.abs(pEnd.y - pStart.y);
          const segLen = Math.hypot(sdx, sdy);
          const isH = sdy <= Math.max(20, sdx * 0.35);
          const isV = sdx <= Math.max(20, sdy * 0.35);

          if (isH && segLen > rC * 2.15) {
            const wireY = (pStart.y + pEnd.y) / 2;
            if (
              Math.min(pStart.x, pEnd.x) < leftTerm.x - 4 &&
              Math.max(pStart.x, pEnd.x) > rightTerm.x + 4 &&
              Math.abs(wireY - ccy) <= Math.max(28, rC * 1.2)
            ) {
              const leftEndPt = pStart.x <= pEnd.x ? pStart : pEnd;
              const rightEndPt = pStart.x <= pEnd.x ? pEnd : pStart;
              meterNext.push(
                {
                  ...s,
                  id: `st-${Date.now()}-mw1-${Math.random().toString(36).slice(2, 5)}`,
                  fillStyle: 'none',
                  fillColor: undefined,
                  isShape: true,
                  shapeType: 'line',
                  points: [
                    { x: leftEndPt.x, y: ccy, pressure: 0.7 },
                    {
                      x: leftTerm.x,
                      y: ccy,
                      cx: (leftEndPt.x + leftTerm.x) / 2,
                      cy: ccy,
                      pressure: 0.7,
                    },
                  ],
                },
                {
                  ...s,
                  id: `st-${Date.now()}-mw2-${Math.random().toString(36).slice(2, 5)}`,
                  fillStyle: 'none',
                  fillColor: undefined,
                  isShape: true,
                  shapeType: 'line',
                  points: [
                    { x: rightTerm.x, y: ccy, pressure: 0.7 },
                    {
                      x: rightEndPt.x,
                      y: ccy,
                      cx: (rightTerm.x + rightEndPt.x) / 2,
                      cy: ccy,
                      pressure: 0.7,
                    },
                  ],
                }
              );
              continue;
            }
          }

          if (isV && segLen > rC * 1.2) {
            const wireX = (pStart.x + pEnd.x) / 2;
            const wMinY = Math.min(pStart.y, pEnd.y);
            const wMaxY = Math.max(pStart.y, pEnd.y);
            if (Math.abs(wireX - ccx) <= Math.max(28, rC * 1.2)) {
              if (wMinY < topTerm.y - 4 && wMaxY > botTerm.y + 4) {
                const topEndPt = pStart.y <= pEnd.y ? pStart : pEnd;
                const botEndPt = pStart.y <= pEnd.y ? pEnd : pStart;
                meterNext.push(
                  {
                    ...s,
                    id: `st-${Date.now()}-mvw1-${Math.random().toString(36).slice(2, 5)}`,
                    fillStyle: 'none',
                    fillColor: undefined,
                    isShape: true,
                    shapeType: 'line',
                    points: [
                      { x: ccx, y: topEndPt.y, pressure: 0.7 },
                      {
                        x: ccx,
                        y: topTerm.y,
                        cx: ccx,
                        cy: (topEndPt.y + topTerm.y) / 2,
                        pressure: 0.7,
                      },
                    ],
                  },
                  {
                    ...s,
                    id: `st-${Date.now()}-mvw2-${Math.random().toString(36).slice(2, 5)}`,
                    fillStyle: 'none',
                    fillColor: undefined,
                    isShape: true,
                    shapeType: 'line',
                    points: [
                      { x: ccx, y: botTerm.y, pressure: 0.7 },
                      {
                        x: ccx,
                        y: botEndPt.y,
                        cx: ccx,
                        cy: (botTerm.y + botEndPt.y) / 2,
                        pressure: 0.7,
                      },
                    ],
                  }
                );
                continue;
              } else if (wMinY < topTerm.y - 4 && wMaxY > topTerm.y - 2) {
                const topEndPt = pStart.y <= pEnd.y ? pStart : pEnd;
                meterNext.push({
                  ...s,
                  points: [
                    { x: ccx, y: topEndPt.y, pressure: 0.7 },
                    { x: ccx, y: topTerm.y, cx: ccx, cy: (topEndPt.y + topTerm.y) / 2, pressure: 0.7 },
                  ],
                });
                continue;
              } else if (wMaxY > botTerm.y + 4 && wMinY < botTerm.y + 2) {
                const botEndPt = pStart.y >= pEnd.y ? pStart : pEnd;
                meterNext.push({
                  ...s,
                  points: [
                    { x: ccx, y: botTerm.y, pressure: 0.7 },
                    { x: ccx, y: botEndPt.y, cx: ccx, cy: (botTerm.y + botEndPt.y) / 2, pressure: 0.7 },
                  ],
                });
                continue;
              }
            }
          }

          if (isH && s.points.length === 2) {
            const dSL = distance(pStart, leftTerm);
            const dSR = distance(pStart, rightTerm);
            const dEL = distance(pEnd, leftTerm);
            const dER = distance(pEnd, rightTerm);
            if (dSL <= SNAP_R || dSR <= SNAP_R || dEL <= SNAP_R || dER <= SNAP_R) {
              const n0 = { ...pStart };
              const n1 = { ...pEnd };
              if (dSL <= SNAP_R && dSL <= dSR && n1.x < leftTerm.x) {
                n0.x = leftTerm.x;
                n0.y = ccy;
                if (Math.abs(n1.y - ccy) <= 24) n1.y = ccy;
              } else if (dSR <= SNAP_R && n1.x > rightTerm.x) {
                n0.x = rightTerm.x;
                n0.y = ccy;
                if (Math.abs(n1.y - ccy) <= 24) n1.y = ccy;
              }
              if (dEL <= SNAP_R && dEL <= dER && n0.x < leftTerm.x) {
                n1.x = leftTerm.x;
                n1.y = ccy;
                if (Math.abs(n0.y - ccy) <= 24) n0.y = ccy;
              } else if (dER <= SNAP_R && n0.x > rightTerm.x) {
                n1.x = rightTerm.x;
                n1.y = ccy;
                if (Math.abs(n0.y - ccy) <= 24) n0.y = ccy;
              }
              n1.cx = (n0.x + n1.x) / 2;
              n1.cy = (n0.y + n1.y) / 2;
              meterNext.push({ ...s, points: [n0, n1] });
              continue;
            }
          }

          if (isV && s.points.length === 2) {
            const dST = distance(pStart, topTerm);
            const dSB = distance(pStart, botTerm);
            const dET = distance(pEnd, topTerm);
            const dEB = distance(pEnd, botTerm);
            if (dST <= SNAP_R || dSB <= SNAP_R || dET <= SNAP_R || dEB <= SNAP_R) {
              const n0 = { ...pStart };
              const n1 = { ...pEnd };
              if (dST <= SNAP_R && dST <= dSB && n1.y < topTerm.y) {
                n0.x = ccx;
                n0.y = topTerm.y;
                if (Math.abs(n1.x - ccx) <= 24) n1.x = ccx;
              } else if (dSB <= SNAP_R && n1.y > botTerm.y) {
                n0.x = ccx;
                n0.y = botTerm.y;
                if (Math.abs(n1.x - ccx) <= 24) n1.x = ccx;
              }
              if (dET <= SNAP_R && dET <= dEB && n0.y < topTerm.y) {
                n1.x = ccx;
                n1.y = topTerm.y;
                if (Math.abs(n0.x - ccx) <= 24) n0.x = ccx;
              } else if (dEB <= SNAP_R && n0.y > botTerm.y) {
                n1.x = ccx;
                n1.y = botTerm.y;
                if (Math.abs(n0.x - ccx) <= 24) n0.x = ccx;
              }
              n1.cx = (n0.x + n1.x) / 2;
              n1.cy = (n0.y + n1.y) / 2;
              meterNext.push({ ...s, points: [n0, n1] });
              continue;
            }
          }
        }
        meterNext.push(s);
      }
      currentStrokes = meterNext;
      continue;
    }

    const nextStrokes: StrokeObject[] = [];
    const padX = Math.max(6, comp.w * 0.08);
    const padY = Math.max(8, comp.h * 0.12);
    const boxMinX = comp.minX - padX;
    const boxMaxX = comp.maxX + padX;
    const boxMinY = comp.minY - padY;
    const boxMaxY = comp.maxY + padY;

    for (const s of currentStrokes) {
      if (compSet.has(s.id) || classifyCircuitStrokeKind(s) !== null) {
        nextStrokes.push(s);
        continue;
      }

      if (
        (s.shapeType === 'line' || (!s.isShape && s.points.length >= 2)) &&
        s.points.length >= 2
      ) {
        const pStart = s.points[0];
        const pEnd = s.points[s.points.length - 1];
        const segLen = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
        const isHorizontalSeg =
          Math.abs(pEnd.y - pStart.y) <= Math.max(20, Math.abs(pEnd.x - pStart.x) * 0.35);

        const isNearlyStraight =
          s.points.length <= 3 && isHorizontalSeg && segLen > comp.w * 1.15;
        if (isNearlyStraight) {
          const midTermX = (comp.leftTerm.x + comp.rightTerm.x) / 2;
          const midTermY = (comp.leftTerm.y + comp.rightTerm.y) / 2;
          const dx = pEnd.x - pStart.x;
          const dy = pEnd.y - pStart.y;
          const lenSq = dx * dx + dy * dy;
          const tProj =
            lenSq > 1
              ? ((midTermX - pStart.x) * dx + (midTermY - pStart.y) * dy) / lenSq
              : -1;
          if (tProj > 0.08 && tProj < 0.92) {
            const projX = pStart.x + tProj * dx;
            const projY = pStart.y + tProj * dy;
            const perpDist = Math.hypot(midTermX - projX, midTermY - projY);
            const crossesHorizontally =
              Math.min(pStart.x, pEnd.x) < comp.leftTerm.x - 6 &&
              Math.max(pStart.x, pEnd.x) > comp.rightTerm.x + 6 &&
              perpDist <= Math.max(28, comp.h * 0.55);

            if (crossesHorizontally) {
              const leftEndPt = pStart.x <= pEnd.x ? pStart : pEnd;
              const rightEndPt = pStart.x <= pEnd.x ? pEnd : pStart;
              const yLeft = comp.kind === 'bulb' ? comp.leftTerm.y : leftEndPt.y;
              const yRight = comp.kind === 'bulb' ? comp.rightTerm.y : rightEndPt.y;
              const wire1: StrokeObject = {
                ...s,
                id: `st-${Date.now()}-w1-${Math.random().toString(36).slice(2, 5)}`,
                groupId: s.groupId,
                fillStyle: 'none',
                fillColor: undefined,
                originalCircuitType: undefined,
                circuitBox: undefined,
                isShape: true,
                shapeType: 'line',
                points: [
                  { x: leftEndPt.x, y: yLeft, pressure: 0.7 },
                  {
                    x: comp.leftTerm.x,
                    y: yLeft,
                    cx: (leftEndPt.x + comp.leftTerm.x) / 2,
                    cy: yLeft,
                    pressure: 0.7,
                  },
                ],
              };
              const wire2: StrokeObject = {
                ...s,
                id: `st-${Date.now()}-w2-${Math.random().toString(36).slice(2, 5)}`,
                groupId: s.groupId,
                fillStyle: 'none',
                fillColor: undefined,
                originalCircuitType: undefined,
                circuitBox: undefined,
                isShape: true,
                shapeType: 'line',
                points: [
                  { x: comp.rightTerm.x, y: yRight, pressure: 0.7 },
                  {
                    x: rightEndPt.x,
                    y: yRight,
                    cx: (comp.rightTerm.x + rightEndPt.x) / 2,
                    cy: yRight,
                    pressure: 0.7,
                  },
                ],
              };
              nextStrokes.push(wire1, wire2);
              continue;
            }
          }
        }

        const dStartL = distance(pStart, comp.leftTerm);
        const dStartR = distance(pStart, comp.rightTerm);
        const dEndL = distance(pEnd, comp.leftTerm);
        const dEndR = distance(pEnd, comp.rightTerm);
        const SNAP_R = 34;

        // Only snap horizontal 2-point wires to component horizontal terminals (never pull vertical wires inward!)
        if (
          isHorizontalSeg &&
          (dStartL <= SNAP_R || dStartR <= SNAP_R || dEndL <= SNAP_R || dEndR <= SNAP_R) &&
          s.points.length === 2 &&
          !(
            pStart.x >= boxMinX &&
            pStart.x <= boxMaxX &&
            pStart.y >= boxMinY &&
            pStart.y <= boxMaxY &&
            pEnd.x >= boxMinX &&
            pEnd.x <= boxMaxX &&
            pEnd.y >= boxMinY &&
            pEnd.y <= boxMaxY
          )
        ) {
          const newP0 = { ...pStart };
          const newP1 = { ...pEnd };
          if (dStartL <= SNAP_R && dStartL <= dStartR && newP1.x < comp.leftTerm.x) {
            newP0.x = comp.leftTerm.x;
            if (comp.kind === 'bulb' || Math.abs(newP1.y - comp.leftTerm.y) <= 28) {
              newP0.y = comp.leftTerm.y;
              newP1.y = comp.leftTerm.y;
            } else {
              newP0.y = comp.leftTerm.y;
            }
          } else if (dStartR <= SNAP_R && newP1.x > comp.rightTerm.x) {
            newP0.x = comp.rightTerm.x;
            if (comp.kind === 'bulb' || Math.abs(newP1.y - comp.rightTerm.y) <= 28) {
              newP0.y = comp.rightTerm.y;
              newP1.y = comp.rightTerm.y;
            } else {
              newP0.y = comp.rightTerm.y;
            }
          }
          if (dEndL <= SNAP_R && dEndL <= dEndR && newP0.x < comp.leftTerm.x) {
            newP1.x = comp.leftTerm.x;
            if (comp.kind === 'bulb' || Math.abs(newP0.y - comp.leftTerm.y) <= 28) {
              newP1.y = comp.leftTerm.y;
              newP0.y = comp.leftTerm.y;
            } else {
              newP1.y = comp.leftTerm.y;
            }
          } else if (dEndR <= SNAP_R && newP0.x > comp.rightTerm.x) {
            newP1.x = comp.rightTerm.x;
            if (comp.kind === 'bulb' || Math.abs(newP0.y - comp.rightTerm.y) <= 28) {
              newP1.y = comp.rightTerm.y;
              newP0.y = comp.rightTerm.y;
            } else {
              newP1.y = comp.rightTerm.y;
            }
          }
          newP1.cx = (newP0.x + newP1.x) / 2;
          newP1.cy = (newP0.y + newP1.y) / 2;
          nextStrokes.push({
            ...s,
            points: [newP0, newP1],
          });
          continue;
        }
      }

      nextStrokes.push(s);
    }
    currentStrokes = nextStrokes;
  }

  return currentStrokes;
}

interface ExternalWireLine {
  stroke: StrokeObject;
  p0Idx: number;
  p1Idx: number;
  p0: BezierPoint;
  p1: BezierPoint;
  orient: 'h' | 'v';
  wireCoord: number; // y for 'h', x for 'v'
}

function isVerticalCircuitComponent(c: CircuitComponentInfo): boolean {
  return (
    c.orientation === 'v' ||
    ((c.kind === 'switch' || c.kind === 'resistor' || c.kind === 'battery' || c.kind === 'fan') &&
      c.h > c.w * 1.18)
  );
}

function extractCircuitWireSegments(
  strokes: StrokeObject[],
  includeStroke: (s: StrokeObject) => boolean,
  excludeCompStrokeIds?: Set<string>
): ExternalWireLine[] {
  const out: ExternalWireLine[] = [];
  for (const s of strokes) {
    if (!includeStroke(s)) continue;
    if (excludeCompStrokeIds?.has(s.id) || classifyCircuitStrokeKind(s) !== null) continue;
    if (s.tool === 'highlighter' || s.arrowStart || s.arrowEnd || s.points.length < 2) continue;
    if ((s.fillStyle || 'none') !== 'none') continue;
    if (s.points[0]?.twist === 999) continue;
    const isLineShape = Boolean(s.isShape && s.shapeType === 'line');
    if (!isLineShape && !(!s.isShape && s.points.length === 2)) continue;

    if (s.points.length === 2 || !isLineShape) {
      const p0Idx = 0;
      const p1Idx = s.points.length - 1;
      const p0 = s.points[p0Idx];
      const p1 = s.points[p1Idx];
      const dx = Math.abs(p1.x - p0.x);
      const dy = Math.abs(p1.y - p0.y);
      if (Math.hypot(dx, dy) < 6) continue;
      if (dy <= Math.max(10, dx * 0.22)) {
        out.push({ stroke: s, p0Idx, p1Idx, p0, p1, orient: 'h', wireCoord: (p0.y + p1.y) / 2 });
      } else if (dx <= Math.max(10, dy * 0.22)) {
        out.push({ stroke: s, p0Idx, p1Idx, p0, p1, orient: 'v', wireCoord: (p0.x + p1.x) / 2 });
      }
    } else {
      for (let i = 0; i < s.points.length - 1; i++) {
        const p0 = s.points[i];
        const p1 = s.points[i + 1];
        const dx = Math.abs(p1.x - p0.x);
        const dy = Math.abs(p1.y - p0.y);
        if (Math.hypot(dx, dy) < 6) continue;
        if (dy <= Math.max(10, dx * 0.22)) {
          out.push({ stroke: s, p0Idx: i, p1Idx: i + 1, p0, p1, orient: 'h', wireCoord: (p0.y + p1.y) / 2 });
        } else if (dx <= Math.max(10, dy * 0.22)) {
          out.push({ stroke: s, p0Idx: i, p1Idx: i + 1, p0, p1, orient: 'v', wireCoord: (p0.x + p1.x) / 2 });
        }
      }
    }
  }
  return out;
}

function extractExternalCircuitWireLines(
  strokes: StrokeObject[],
  movingStrokeIds: Set<string>
): ExternalWireLine[] {
  return extractCircuitWireSegments(strokes, (s) => !movingStrokeIds.has(s.id));
}

function getWireSegBounds(w: ExternalWireLine): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  return {
    minX: Math.min(w.p0.x, w.p1.x),
    maxX: Math.max(w.p0.x, w.p1.x),
    minY: Math.min(w.p0.y, w.p1.y),
    maxY: Math.max(w.p0.y, w.p1.y),
  };
}

function isWirePassThroughAtPoint(
  w: ExternalWireLine,
  px: number,
  py: number,
  crossTol = 24,
  passMargin = 24
): boolean {
  const b = getWireSegBounds(w);
  if (w.orient === 'h') {
    return Math.abs(py - w.wireCoord) <= crossTol && b.minX < px - passMargin && b.maxX > px + passMargin;
  }
  return Math.abs(px - w.wireCoord) <= crossTol && b.minY < py - passMargin && b.maxY > py + passMargin;
}

function getCompTerminalList(c: CircuitComponentInfo): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [c.leftTerm, c.rightTerm];
  if (c.kind === 'bulb' || !isVerticalCircuitComponent(c)) {
    pts.push({ x: c.minX, y: c.leftTerm.y }, { x: c.maxX, y: c.rightTerm.y });
  } else {
    pts.push({ x: c.cx, y: c.minY }, { x: c.cx, y: c.maxY });
  }
  return pts;
}

function findWiresReachableFromComponents(
  comps: CircuitComponentInfo[],
  allWires: ExternalWireLine[]
): Set<string> {
  const reachable = new Set<string>();
  if (comps.length === 0 || allWires.length === 0) return reachable;

  const segKey = (w: ExternalWireLine) => `${w.stroke.id}:${w.p0Idx}`;
  const queue: ExternalWireLine[] = [];

  for (const w of allWires) {
    let touchesComp = false;
    for (const c of comps) {
      for (const term of getCompTerminalList(c)) {
        if (pointToSegmentDist(term.x, term.y, w.p0.x, w.p0.y, w.p1.x, w.p1.y) <= 30) {
          touchesComp = true;
          break;
        }
      }
      if (touchesComp) break;
    }
    if (touchesComp) {
      reachable.add(segKey(w));
      queue.push(w);
    }
  }

  let qi = 0;
  while (qi < queue.length) {
    const cur = queue[qi++];
    for (const nxt of allWires) {
      const k = segKey(nxt);
      if (reachable.has(k)) continue;
      const connected =
        pointToSegmentDist(cur.p0.x, cur.p0.y, nxt.p0.x, nxt.p0.y, nxt.p1.x, nxt.p1.y) <= 26 ||
        pointToSegmentDist(cur.p1.x, cur.p1.y, nxt.p0.x, nxt.p0.y, nxt.p1.x, nxt.p1.y) <= 26 ||
        pointToSegmentDist(nxt.p0.x, nxt.p0.y, cur.p0.x, cur.p0.y, cur.p1.x, cur.p1.y) <= 26 ||
        pointToSegmentDist(nxt.p1.x, nxt.p1.y, cur.p0.x, cur.p0.y, cur.p1.x, cur.p1.y) <= 26;
      if (connected) {
        reachable.add(k);
        queue.push(nxt);
      }
    }
  }

  return reachable;
}

/**
 * Returns subtle magnetic rail snap deltas so sliding a connected circuit component
 * or circuit wire segment along its horizontal/vertical loop rails stays razor-level.
 */
export function getCircuitWireRailSnapDelta(
  strokes: StrokeObject[],
  movingStrokeIds: Set<string>,
  candDx: number,
  candDy: number,
  snapRadius = 6.5
): { snapDx: number; snapDy: number } {
  const comps = getCircuitComponentsWithTerminals(strokes);
  const movedComps = comps.filter((c) => c.strokeIds.every((id) => movingStrokeIds.has(id)));
  if (movedComps.length === 0) {
    if (comps.length === 0 || movingStrokeIds.size === 0) return { snapDx: 0, snapDy: 0 };
    const compStrokeIds = new Set<string>();
    for (const c of comps) {
      for (const id of c.strokeIds) compStrokeIds.add(id);
    }
    const movingWires = extractCircuitWireSegments(
      strokes,
      (s) => movingStrokeIds.has(s.id),
      compStrokeIds
    );
    if (movingWires.length === 0) return { snapDx: 0, snapDy: 0 };
    const stationaryWires = extractCircuitWireSegments(
      strokes,
      (s) => !movingStrokeIds.has(s.id),
      compStrokeIds
    );
    const reachable = findWiresReachableFromComponents(comps, [...movingWires, ...stationaryWires]);
    const circuitMovingWires = movingWires.filter((w) => reachable.has(`${w.stroke.id}:${w.p0Idx}`));
    if (circuitMovingWires.length === 0) return { snapDx: 0, snapDy: 0 };

    const allVert = circuitMovingWires.every((w) => w.orient === 'v');
    const allHoriz = circuitMovingWires.every((w) => w.orient === 'h');
    const wireSnapRad = Math.max(snapRadius, 7.5);
    let snapDx = 0;
    let snapDy = 0;
    if (allVert && Math.abs(candDy) <= wireSnapRad && Math.abs(candDx) > 0.5) {
      snapDy = -candDy;
    } else if (allVert && Math.abs(candDx) <= wireSnapRad && Math.abs(candDy) > wireSnapRad) {
      snapDx = -candDx;
    } else if (allHoriz && Math.abs(candDx) <= wireSnapRad && Math.abs(candDy) > 0.5) {
      snapDx = -candDx;
    } else if (allHoriz && Math.abs(candDy) <= wireSnapRad && Math.abs(candDx) > wireSnapRad) {
      snapDy = -candDy;
    }
    return { snapDx, snapDy };
  }

  if (movedComps.length >= 2) {
    return { snapDx: 0, snapDy: 0 };
  }

  const extWires = extractExternalCircuitWireLines(strokes, movingStrokeIds);
  if (extWires.length === 0) return { snapDx: 0, snapDy: 0 };

  let snapDx = 0;
  let snapDy = 0;
  let bestDistY = snapRadius;
  let bestDistX = snapRadius;

  for (const mc of movedComps) {
    const isVert = isVerticalCircuitComponent(mc);
    if (!isVert) {
      const prevL = mc.leftTerm;
      const prevR = mc.rightTerm;
      const candYL = prevL.y + candDy;
      const candYR = prevR.y + candDy;
      for (const w of extWires) {
        if (w.orient !== 'h') continue;
        const wStartIsLeft = w.p0.x <= w.p1.x;
        const leftPt = wStartIsLeft ? w.p0 : w.p1;
        const rightPt = wStartIsLeft ? w.p1 : w.p0;
        const matchesLeft =
          leftPt.x < prevL.x - 4 &&
          rightPt.x >= prevL.x - 28 &&
          rightPt.x <= Math.max(prevL.x + 28, mc.cx + 14) &&
          Math.abs(rightPt.y - prevL.y) <= 28;
        const matchesRight =
          rightPt.x > prevR.x + 4 &&
          leftPt.x <= prevR.x + 28 &&
          leftPt.x >= prevL.x + 4 &&
          Math.abs(leftPt.y - prevR.y) <= 28;
        if (matchesLeft) {
          const dyOff = w.wireCoord - candYL;
          if (Math.abs(dyOff) < bestDistY) {
            bestDistY = Math.abs(dyOff);
            snapDy = dyOff;
          }
        } else if (matchesRight) {
          const dyOff = w.wireCoord - candYR;
          if (Math.abs(dyOff) < bestDistY) {
            bestDistY = Math.abs(dyOff);
            snapDy = dyOff;
          }
        }
      }
    } else {
      const prevT = mc.orientation === 'v' ? mc.leftTerm : { x: mc.cx, y: mc.minY };
      const prevB = mc.orientation === 'v' ? mc.rightTerm : { x: mc.cx, y: mc.maxY };
      const candXT = prevT.x + candDx;
      const candXB = prevB.x + candDx;
      for (const w of extWires) {
        if (w.orient !== 'v') continue;
        const wStartIsTop = w.p0.y <= w.p1.y;
        const topPt = wStartIsTop ? w.p0 : w.p1;
        const botPt = wStartIsTop ? w.p1 : w.p0;
        const matchesTop =
          topPt.y < prevT.y - 4 &&
          botPt.y >= prevT.y - 28 &&
          botPt.y <= Math.max(prevT.y + 28, mc.cy + 14) &&
          Math.abs(botPt.x - prevT.x) <= 28;
        const matchesBot =
          botPt.y > prevB.y + 4 &&
          topPt.y <= prevB.y + 28 &&
          topPt.y >= prevT.y + 4 &&
          Math.abs(topPt.x - prevB.x) <= 28;
        if (matchesTop) {
          const dxOff = w.wireCoord - candXT;
          if (Math.abs(dxOff) < bestDistX) {
            bestDistX = Math.abs(dxOff);
            snapDx = dxOff;
          }
        } else if (matchesBot) {
          const dxOff = w.wireCoord - candXB;
          if (Math.abs(dxOff) < bestDistX) {
            bestDistX = Math.abs(dxOff);
            snapDx = dxOff;
          }
        }
      }
    }
  }

  return { snapDx, snapDy };
}

function isCubicSegmentCollinear(prev: BezierPoint, curr: BezierPoint, tol = 2.0): boolean {
  const ctrl = getCubicSegmentControlPoints(prev, curr);
  if (!ctrl) return false;
  return (
    pointToSegmentDist(ctrl.cp1x, ctrl.cp1y, prev.x, prev.y, curr.x, curr.y) <= tol &&
    pointToSegmentDist(ctrl.cp2x, ctrl.cp2y, prev.x, prev.y, curr.x, curr.y) <= tol
  );
}

/**
 * Updates quadratic `(cx, cy)` midpoints and strips dormant collinear cubic handles
 * on segments touched by `editedIndices`, so adapted multi-segment wires stay straight
 * instead of bowing or warping into cubic S-curves while genuine curves shift cleanly.
 */
function updateEditedLineWireHandles(
  beforeEditPts: BezierPoint[],
  pts: BezierPoint[],
  editedIndices: ReadonlySet<number>,
  refPts: BezierPoint[] = beforeEditPts
): void {
  if (editedIndices.size === 0) return;
  for (let i = 1; i < pts.length; i++) {
    if (!editedIndices.has(i - 1) && !editedIndices.has(i)) continue;
    const befPrev = beforeEditPts[i - 1];
    const befCurr = beforeEditPts[i];
    const refPrev = refPts[i - 1] ?? befPrev;
    const refCurr = refPts[i] ?? befCurr;

    if (befCurr?.cx !== undefined && befCurr?.cy !== undefined) {
      const wasLinear =
        (refPrev && refCurr && isQuadraticSegmentCollinear(refPrev, refCurr, 2.0)) ||
        (befPrev && befCurr && isQuadraticSegmentCollinear(befPrev, befCurr, 2.0));
      if (wasLinear) {
        pts[i] = {
          ...pts[i],
          cx: (pts[i - 1].x + pts[i].x) / 2,
          cy: (pts[i - 1].y + pts[i].y) / 2,
        };
      } else if (befPrev) {
        const avgDx = (pts[i - 1].x - befPrev.x + (pts[i].x - befCurr.x)) / 2;
        const avgDy = (pts[i - 1].y - befPrev.y + (pts[i].y - befCurr.y)) / 2;
        pts[i] = {
          ...pts[i],
          cx: befCurr.cx + avgDx,
          cy: befCurr.cy + avgDy,
        };
      }
    }

    const hadFlatCubic =
      (refPrev && refCurr && isCubicSegmentCollinear(refPrev, refCurr, 2.0)) ||
      (befPrev && befCurr && isCubicSegmentCollinear(befPrev, befCurr, 2.0));
    if (hadFlatCubic) {
      pts[i - 1] = { ...pts[i - 1], outDx: undefined, outDy: undefined };
      pts[i] = { ...pts[i], inDx: undefined, inDy: undefined };
    }
  }
}

function adaptCircuitLoopFromSegments(
  prevStrokes: StrokeObject[],
  nextStrokes: StrokeObject[],
  movingStrokeIds: Set<string>,
  prevComps: CircuitComponentInfo[],
  mode: 'move' | 'scale-x' | 'scale-y',
  dx: number,
  dy: number,
  alreadyAdaptedStrokeIds?: Set<string>
): StrokeObject[] {
  if (prevComps.length === 0 || movingStrokeIds.size === 0) return nextStrokes;

  const compStrokeIds = new Set<string>();
  const movedCompKeys = new Set<string>();
  for (const c of prevComps) {
    for (const id of c.strokeIds) compStrokeIds.add(id);
    if (c.strokeIds.every((id) => movingStrokeIds.has(id))) {
      movedCompKeys.add(c.key);
    }
  }

  const movingWires = extractCircuitWireSegments(
    prevStrokes,
    (s) => movingStrokeIds.has(s.id),
    compStrokeIds
  );
  if (movingWires.length === 0) return nextStrokes;

  const stationaryWires = extractCircuitWireSegments(
    prevStrokes,
    (s) => !movingStrokeIds.has(s.id),
    compStrokeIds
  );
  const allWires = [...movingWires, ...stationaryWires];
  const reachable = findWiresReachableFromComponents(prevComps, allWires);
  const segKey = (w: ExternalWireLine) => `${w.stroke.id}:${w.p0Idx}`;
  const activeMovingWires = movingWires.filter((w) => reachable.has(segKey(w)));
  if (activeMovingWires.length === 0) return nextStrokes;

  const nextStrokeMap = new Map(nextStrokes.map((s) => [s.id, s]));
  const segDeltaMap = new Map<string, { dx: number; dy: number }>();
  for (const w of activeMovingWires) {
    if (mode === 'move') {
      segDeltaMap.set(segKey(w), { dx, dy });
    } else {
      const ns = nextStrokeMap.get(w.stroke.id);
      const np0 = ns?.points[w.p0Idx];
      const np1 = ns?.points[w.p1Idx];
      if (!np0 || !np1) {
        segDeltaMap.set(segKey(w), { dx: 0, dy: 0 });
      } else {
        const sDx = mode === 'scale-x' ? ((np0.x - w.p0.x) + (np1.x - w.p1.x)) / 2 : 0;
        const sDy = mode === 'scale-y' ? ((np0.y - w.p0.y) + (np1.y - w.p1.y)) / 2 : 0;
        segDeltaMap.set(segKey(w), { dx: sDx, dy: sDy });
      }
    }
  }

  const vertexEdits = new Map<string, Map<number, { x?: number; y?: number }>>();
  const setVertexCoord = (strokeId: string, ptIdx: number, axis: 'x' | 'y', val: number) => {
    let map = vertexEdits.get(strokeId);
    if (!map) {
      map = new Map();
      vertexEdits.set(strokeId, map);
    }
    const prev = map.get(ptIdx) || {};
    prev[axis] = val;
    map.set(ptIdx, prev);
  };

  const strokeShifts = new Map<string, { dx: number; dy: number }>();
  const addStrokeShift = (strokeId: string, sdx: number, sdy: number) => {
    if (movingStrokeIds.has(strokeId) || alreadyAdaptedStrokeIds?.has(strokeId)) return;
    const prev = strokeShifts.get(strokeId) || { dx: 0, dy: 0 };
    if (Math.abs(sdx) > 1e-4 && Math.abs(prev.dx) < 1e-4) prev.dx = sdx;
    if (Math.abs(sdy) > 1e-4 && Math.abs(prev.dy) < 1e-4) prev.dy = sdy;
    strokeShifts.set(strokeId, prev);
  };

  const isEndpointPinnedToUnmovedComp = (
    pt: { x: number; y: number },
    expectedCompOrient: 'h' | 'v'
  ): boolean => {
    for (const c of prevComps) {
      if (movedCompKeys.has(c.key) || strokeShifts.has(c.strokeIds[0])) continue;
      const cVert = isVerticalCircuitComponent(c);
      if ((expectedCompOrient === 'v') !== cVert) continue;
      for (const term of getCompTerminalList(c)) {
        if (distance(pt, term) <= 28) return true;
      }
    }
    return false;
  };

  const findTouchingCompForSegOrPt = (
    seg: ExternalWireLine | null,
    pt: { x: number; y: number } | null,
    orient: 'h' | 'v',
    skipKeys: Set<string>
  ): CircuitComponentInfo | null => {
    for (const c of prevComps) {
      if (skipKeys.has(c.key)) continue;
      const cVert = isVerticalCircuitComponent(c);
      if ((orient === 'v') !== cVert) continue;
      const terms = [c.leftTerm, c.rightTerm];
      if (seg) {
        for (const t of terms) {
          if (pointToSegmentDist(t.x, t.y, seg.p0.x, seg.p0.y, seg.p1.x, seg.p1.y) <= 28) {
            return c;
          }
        }
      }
      if (pt) {
        if (distance(pt, c.leftTerm) <= 28 || distance(pt, c.rightTerm) <= 28) {
          return c;
        }
      }
    }
    return null;
  };

  const collectCollinearBranch = (
    seeds: ExternalWireLine[],
    orient: 'h' | 'v'
  ): { wireSegs: ExternalWireLine[]; comps: CircuitComponentInfo[] } => {
    const wireSegs: ExternalWireLine[] = [];
    const comps: CircuitComponentInfo[] = [];
    const seenSegs = new Set<string>();
    const seenComps = new Set<string>();
    const frontierPts: { x: number; y: number }[] = [];
    const frontierSegs: ExternalWireLine[] = [];

    const addSeg = (w: ExternalWireLine) => {
      const k = segKey(w);
      if (seenSegs.has(k)) return;
      seenSegs.add(k);
      wireSegs.push(w);
      frontierSegs.push(w);
      frontierPts.push(w.p0, w.p1);
    };

    for (const s of seeds) {
      if (s.orient === orient) addSeg(s);
    }

    let pi = 0;
    let si = 0;
    while (pi < frontierPts.length || si < frontierSegs.length) {
      while (si < frontierSegs.length) {
        const seg = frontierSegs[si++];
        const comp = findTouchingCompForSegOrPt(seg, null, orient, seenComps);
        if (comp) {
          seenComps.add(comp.key);
          comps.push(comp);
          frontierPts.push(comp.leftTerm, comp.rightTerm);
        }
      }
      if (pi >= frontierPts.length) break;
      const pt = frontierPts[pi++];

      for (const w of allWires) {
        if (w.orient !== orient) continue;
        const k = segKey(w);
        if (seenSegs.has(k)) continue;
        const nearDist = Math.min(distance(pt, w.p0), distance(pt, w.p1));
        if (nearDist <= 22) {
          addSeg(w);
        }
      }

      const comp = findTouchingCompForSegOrPt(null, pt, orient, seenComps);
      if (comp) {
        seenComps.add(comp.key);
        comps.push(comp);
        frontierPts.push(comp.leftTerm, comp.rightTerm);
      }
    }

    return { wireSegs, comps };
  };

  interface BranchSegRef {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    coord: number; // oldY for 'h', oldX for 'v'
  }

  const getHorizontalBranchSegments = (branch: {
    wireSegs: ExternalWireLine[];
    comps: CircuitComponentInfo[];
  }): BranchSegRef[] => {
    const segs: BranchSegRef[] = [];
    for (const w of branch.wireSegs) {
      const b = getWireSegBounds(w);
      segs.push({ ...b, coord: w.wireCoord });
    }
    for (const c of branch.comps) {
      segs.push({
        minX: c.minX,
        maxX: c.maxX,
        minY: Math.min(c.leftTerm.y, c.rightTerm.y),
        maxY: Math.max(c.leftTerm.y, c.rightTerm.y),
        coord: c.leftTerm.y,
      });
      if (Math.abs(c.rightTerm.y - c.leftTerm.y) > 2) {
        segs.push({
          minX: c.cx,
          maxX: c.maxX,
          minY: c.rightTerm.y,
          maxY: c.rightTerm.y,
          coord: c.rightTerm.y,
        });
      }
    }
    return segs;
  };

  const getVerticalBranchSegments = (branch: {
    wireSegs: ExternalWireLine[];
    comps: CircuitComponentInfo[];
  }): BranchSegRef[] => {
    const segs: BranchSegRef[] = [];
    for (const w of branch.wireSegs) {
      const b = getWireSegBounds(w);
      segs.push({ ...b, coord: w.wireCoord });
    }
    for (const c of branch.comps) {
      const topY = c.orientation === 'v' ? Math.min(c.leftTerm.y, c.rightTerm.y) : c.minY;
      const botY = c.orientation === 'v' ? Math.max(c.leftTerm.y, c.rightTerm.y) : c.maxY;
      segs.push({
        minX: c.leftTerm.x,
        maxX: c.rightTerm.x,
        minY: topY,
        maxY: botY,
        coord: c.cx,
      });
    }
    return segs;
  };

  const movingH = activeMovingWires.filter((w) => w.orient === 'h');
  const movingV = activeMovingWires.filter((w) => w.orient === 'v');

  // --- PASS 1: VERTICAL LOOP / BRANCH PULL (when mode === 'move' or 'scale-y') ---
  if (mode !== 'scale-x') {
    const seedDeltaY = new Map<string, number>();
    const hSeeds: ExternalWireLine[] = [];

    for (const mh of movingH) {
      const d = segDeltaMap.get(segKey(mh))?.dy ?? 0;
      if (Math.abs(d) > 0.05) {
        hSeeds.push(mh);
        seedDeltaY.set(segKey(mh), d);
      }
    }

    if (mode === 'move' && Math.abs(dy) > 1e-4) {
      for (const mv of movingV) {
        const ends: { pt: { x: number; y: number }; idx: number }[] = [
          { pt: mv.p0, idx: mv.p0Idx },
          { pt: mv.p1, idx: mv.p1Idx },
        ];
        for (const ep of ends) {
          const passH = stationaryWires.find(
            (sw) => sw.orient === 'h' && isWirePassThroughAtPoint(sw, ep.pt.x, ep.pt.y)
          );
          if (passH) {
            setVertexCoord(mv.stroke.id, ep.idx, 'y', passH.wireCoord);
            continue;
          }
          if (isEndpointPinnedToUnmovedComp(ep.pt, 'v')) {
            setVertexCoord(mv.stroke.id, ep.idx, 'y', ep.pt.y);
            continue;
          }
          for (const hw of stationaryWires) {
            if (hw.orient !== 'h') continue;
            const dEnd = Math.min(distance(ep.pt, hw.p0), distance(ep.pt, hw.p1));
            if (dEnd <= 24) {
              hSeeds.push(hw);
              seedDeltaY.set(segKey(hw), dy);
            }
          }
        }
      }
    }

    if (mode === 'scale-y') {
      for (const mv of movingV) {
        for (const ep of [
          { pt: mv.p0, idx: mv.p0Idx },
          { pt: mv.p1, idx: mv.p1Idx },
        ]) {
          const passH = stationaryWires.find(
            (sw) => sw.orient === 'h' && isWirePassThroughAtPoint(sw, ep.pt.x, ep.pt.y)
          );
          if (passH && Math.abs((segDeltaMap.get(segKey(mv))?.dy ?? 0)) < 0.05) {
            setVertexCoord(mv.stroke.id, ep.idx, 'y', passH.wireCoord);
          } else if (isEndpointPinnedToUnmovedComp(ep.pt, 'v')) {
            setVertexCoord(mv.stroke.id, ep.idx, 'y', ep.pt.y);
          }
        }
      }
    }

    if (hSeeds.length > 0) {
      const processedSeeds = new Set<string>();
      for (const seed of hSeeds) {
        if (processedSeeds.has(segKey(seed))) continue;
        const targetDy = seedDeltaY.get(segKey(seed)) ?? dy;
        if (Math.abs(targetDy) < 1e-4) continue;

        const branchH = collectCollinearBranch([seed], 'h');
        for (const w of branchH.wireSegs) processedSeeds.add(segKey(w));

        const branchSegs = getHorizontalBranchSegments(branchH);
        const branchWireIdSet = new Set(branchH.wireSegs.map((w) => segKey(w)));
        const branchCompStrokeSet = new Set<string>();
        for (const c of branchH.comps) {
          for (const id of c.strokeIds) branchCompStrokeSet.add(id);
        }

        let minDy = -Infinity;
        let maxDy = Infinity;

        type AttachedVEnd = {
          vw: ExternalWireLine;
          ptIdx: number;
          segY: number;
        };
        const attachedVEnds: AttachedVEnd[] = [];

        for (const vw of stationaryWires) {
          if (vw.orient !== 'v') continue;
          if (branchWireIdSet.has(segKey(vw)) || branchCompStrokeSet.has(vw.stroke.id)) continue;

          const topIsP0 = vw.p0.y <= vw.p1.y;
          const topPt = topIsP0 ? vw.p0 : vw.p1;
          const topIdx = topIsP0 ? vw.p0Idx : vw.p1Idx;
          const botPt = topIsP0 ? vw.p1 : vw.p0;
          const botIdx = topIsP0 ? vw.p1Idx : vw.p0Idx;
          const vLen = Math.abs(botPt.y - topPt.y);

          for (const seg of branchSegs) {
            const xInSeg = vw.wireCoord >= seg.minX - 24 && vw.wireCoord <= seg.maxX + 24;
            if (!xInSeg) continue;
            const dTop = Math.abs(topPt.y - seg.coord);
            const dBot = Math.abs(botPt.y - seg.coord);

            if (topPt.y < seg.coord - 24 && botPt.y > seg.coord + 24) {
              minDy = Math.max(minDy, topPt.y + 2 - seg.coord);
              maxDy = Math.min(maxDy, botPt.y - 2 - seg.coord);
            } else if (
              dTop <= 24 &&
              botPt.y > seg.coord + 12 &&
              vLen >= 10 &&
              !isEndpointPinnedToUnmovedComp(topPt, 'v')
            ) {
              maxDy = Math.min(maxDy, botPt.y - 8 - seg.coord);
              attachedVEnds.push({ vw, ptIdx: topIdx, segY: seg.coord });
              break;
            } else if (
              dBot <= 24 &&
              topPt.y < seg.coord - 12 &&
              vLen >= 10 &&
              !isEndpointPinnedToUnmovedComp(botPt, 'v')
            ) {
              minDy = Math.max(minDy, topPt.y + 8 - seg.coord);
              attachedVEnds.push({ vw, ptIdx: botIdx, segY: seg.coord });
              break;
            }
          }
        }

        const effDy = Math.max(minDy, Math.min(maxDy, targetDy));

        for (const w of branchH.wireSegs) {
          if (movingStrokeIds.has(w.stroke.id)) {
            if (Math.abs(effDy - targetDy) > 1e-4 || mode === 'scale-y') {
              setVertexCoord(w.stroke.id, w.p0Idx, 'y', w.p0.y + effDy);
              setVertexCoord(w.stroke.id, w.p1Idx, 'y', w.p1.y + effDy);
            }
          } else if (!alreadyAdaptedStrokeIds?.has(w.stroke.id)) {
            // Shift only the horizontal segment's vertices (preserves welded multi-segment polylines like C-loops!)
            setVertexCoord(w.stroke.id, w.p0Idx, 'y', w.p0.y + effDy);
            setVertexCoord(w.stroke.id, w.p1Idx, 'y', w.p1.y + effDy);
          }
        }
        for (const c of branchH.comps) {
          if (movedCompKeys.has(c.key)) continue;
          for (const sid of c.strokeIds) {
            addStrokeShift(sid, 0, effDy);
          }
        }
        for (const ae of attachedVEnds) {
          setVertexCoord(ae.vw.stroke.id, ae.ptIdx, 'y', ae.segY + effDy);
        }
        for (const mv of movingV) {
          for (const bw of branchH.wireSegs) {
            const d0 = Math.min(distance(mv.p0, bw.p0), distance(mv.p0, bw.p1));
            const d1 = Math.min(distance(mv.p1, bw.p0), distance(mv.p1, bw.p1));
            if (d0 <= 24 && d0 <= d1) {
              setVertexCoord(mv.stroke.id, mv.p0Idx, 'y', mv.p0.y + effDy);
            } else if (d1 <= 24 && d1 < d0) {
              setVertexCoord(mv.stroke.id, mv.p1Idx, 'y', mv.p1.y + effDy);
            }
          }
        }
      }
    }
  }

  // --- PASS 2: HORIZONTAL LOOP / BRANCH PULL (when mode === 'move' or 'scale-x') ---
  if (mode !== 'scale-y') {
    const seedDeltaX = new Map<string, number>();
    const vSeeds: ExternalWireLine[] = [];

    for (const mv of movingV) {
      const d = segDeltaMap.get(segKey(mv))?.dx ?? 0;
      if (Math.abs(d) > 0.05 || mode === 'move') {
        vSeeds.push(mv);
        seedDeltaX.set(segKey(mv), d);
      }
    }

    if (mode === 'scale-x') {
      // Keep moving horizontal endpoints attached to stationary components pinned during horizontal stretch!
      for (const mh of movingH) {
        if (isEndpointPinnedToUnmovedComp(mh.p0, 'h')) {
          setVertexCoord(mh.stroke.id, mh.p0Idx, 'x', mh.p0.x);
        }
        if (isEndpointPinnedToUnmovedComp(mh.p1, 'h')) {
          setVertexCoord(mh.stroke.id, mh.p1Idx, 'x', mh.p1.x);
        }
      }
    }

    if (mode === 'move' && Math.abs(dx) > 1e-4) {
      for (const mh of movingH) {
        for (const ep of [
          { pt: mh.p0, idx: mh.p0Idx },
          { pt: mh.p1, idx: mh.p1Idx },
        ]) {
          if (isEndpointPinnedToUnmovedComp(ep.pt, 'h')) {
            setVertexCoord(mh.stroke.id, ep.idx, 'x', ep.pt.x);
            continue;
          }
          const passV = stationaryWires.find(
            (sw) => sw.orient === 'v' && isWirePassThroughAtPoint(sw, ep.pt.x, ep.pt.y)
          );
          if (passV) {
            vSeeds.push(passV);
            seedDeltaX.set(segKey(passV), dx);
            continue;
          }
          for (const vw of stationaryWires) {
            if (vw.orient !== 'v') continue;
            const dEnd = Math.min(distance(ep.pt, vw.p0), distance(ep.pt, vw.p1));
            if (dEnd <= 24) {
              vSeeds.push(vw);
              seedDeltaX.set(segKey(vw), dx);
            }
          }
        }
      }
    }

    if (vSeeds.length > 0) {
      const processedSeeds = new Set<string>();
      for (const seed of vSeeds) {
        if (processedSeeds.has(segKey(seed))) continue;
        const targetDx = seedDeltaX.get(segKey(seed)) ?? dx;

        const branchV = collectCollinearBranch([seed], 'v');
        for (const w of branchV.wireSegs) processedSeeds.add(segKey(w));

        const branchSegs = getVerticalBranchSegments(branchV);
        const branchWireIdSet = new Set(branchV.wireSegs.map((w) => segKey(w)));
        const branchCompStrokeSet = new Set<string>();
        for (const c of branchV.comps) {
          for (const id of c.strokeIds) branchCompStrokeSet.add(id);
        }

        let minDx = -Infinity;
        let maxDx = Infinity;

        type AttachedHEnd = {
          hw: ExternalWireLine;
          ptIdx: number;
          segX: number;
        };
        const attachedHEnds: AttachedHEnd[] = [];

        for (const hw of stationaryWires) {
          if (hw.orient !== 'h') continue;
          if (branchWireIdSet.has(segKey(hw)) || branchCompStrokeSet.has(hw.stroke.id)) continue;

          const leftIsP0 = hw.p0.x <= hw.p1.x;
          const leftPt = leftIsP0 ? hw.p0 : hw.p1;
          const leftIdx = leftIsP0 ? hw.p0Idx : hw.p1Idx;
          const rightPt = leftIsP0 ? hw.p1 : hw.p0;
          const rightIdx = leftIsP0 ? hw.p1Idx : hw.p0Idx;
          const hLen = Math.abs(rightPt.x - leftPt.x);

          for (const seg of branchSegs) {
            const yInSeg = hw.wireCoord >= seg.minY - 24 && hw.wireCoord <= seg.maxY + 24;
            if (!yInSeg) continue;
            const dLeft = Math.abs(leftPt.x - seg.coord);
            const dRight = Math.abs(rightPt.x - seg.coord);

            if (leftPt.x < seg.coord - 24 && rightPt.x > seg.coord + 24) {
              minDx = Math.max(minDx, leftPt.x + 2 - seg.coord);
              maxDx = Math.min(maxDx, rightPt.x - 2 - seg.coord);
            } else if (
              dLeft <= 24 &&
              rightPt.x > seg.coord + 12 &&
              hLen >= 10 &&
              !isEndpointPinnedToUnmovedComp(leftPt, 'h')
            ) {
              maxDx = Math.min(maxDx, rightPt.x - 8 - seg.coord);
              attachedHEnds.push({ hw, ptIdx: leftIdx, segX: seg.coord });
              break;
            } else if (
              dRight <= 24 &&
              leftPt.x < seg.coord - 12 &&
              hLen >= 10 &&
              !isEndpointPinnedToUnmovedComp(rightPt, 'h')
            ) {
              minDx = Math.max(minDx, leftPt.x + 8 - seg.coord);
              attachedHEnds.push({ hw, ptIdx: rightIdx, segX: seg.coord });
              break;
            }
          }
        }

        const effDx = Math.max(minDx, Math.min(maxDx, targetDx));

        for (const w of branchV.wireSegs) {
          if (movingStrokeIds.has(w.stroke.id)) {
            if (Math.abs(effDx - targetDx) > 1e-4 || mode === 'scale-x') {
              setVertexCoord(w.stroke.id, w.p0Idx, 'x', w.p0.x + effDx);
              setVertexCoord(w.stroke.id, w.p1Idx, 'x', w.p1.x + effDx);
            }
          } else if (!alreadyAdaptedStrokeIds?.has(w.stroke.id)) {
            setVertexCoord(w.stroke.id, w.p0Idx, 'x', w.p0.x + effDx);
            setVertexCoord(w.stroke.id, w.p1Idx, 'x', w.p1.x + effDx);
          }
        }
        for (const c of branchV.comps) {
          if (movedCompKeys.has(c.key)) continue;
          for (const sid of c.strokeIds) {
            addStrokeShift(sid, effDx, 0);
          }
        }
        for (const ae of attachedHEnds) {
          setVertexCoord(ae.hw.stroke.id, ae.ptIdx, 'x', ae.segX + effDx);
        }
        for (const mh of movingH) {
          for (const bw of branchV.wireSegs) {
            const d0 = Math.min(distance(mh.p0, bw.p0), distance(mh.p0, bw.p1));
            const d1 = Math.min(distance(mh.p1, bw.p0), distance(mh.p1, bw.p1));
            if (d0 <= 24 && d0 <= d1) {
              setVertexCoord(mh.stroke.id, mh.p0Idx, 'x', mh.p0.x + effDx);
            } else if (d1 <= 24 && d1 < d0) {
              setVertexCoord(mh.stroke.id, mh.p1Idx, 'x', mh.p1.x + effDx);
            }
          }
        }
      }
    }
  }

  if (vertexEdits.size === 0 && strokeShifts.size === 0) return nextStrokes;

  const prevStrokeMap = new Map(prevStrokes.map((s) => [s.id, s]));

  return nextStrokes.map((s) => {
    const shift = strokeShifts.get(s.id);
    const vEdit = vertexEdits.get(s.id);
    if (!shift && !vEdit) return s;

    let pts = s.points.map((p) => ({ ...p }));
    if (shift && (Math.abs(shift.dx) > 1e-4 || Math.abs(shift.dy) > 1e-4)) {
      pts = pts.map((p) => ({
        ...p,
        x: p.x + shift.dx,
        y: p.y + shift.dy,
        cx: p.cx !== undefined ? p.cx + shift.dx : undefined,
        cy: p.cy !== undefined ? p.cy + shift.dy : undefined,
      }));
    }
    if (vEdit) {
      const refPts = prevStrokeMap.get(s.id)?.points ?? s.points;
      const beforeEditPts = pts.map((p) => ({ ...p }));
      const editedIndices = new Set<number>();
      for (const [idx, coords] of vEdit.entries()) {
        if (idx < 0 || idx >= pts.length) continue;
        pts[idx] = {
          ...pts[idx],
          x: coords.x !== undefined ? coords.x : pts[idx].x,
          y: coords.y !== undefined ? coords.y : pts[idx].y,
        };
        editedIndices.add(idx);
      }
      updateEditedLineWireHandles(beforeEditPts, pts, editedIndices, refPts);
    }

    return {
      ...s,
      circuitBox:
        shift && s.circuitBox
          ? {
              ...s.circuitBox,
              cx: s.circuitBox.cx + shift.dx,
              termY: s.circuitBox.termY + shift.dy,
            }
          : s.circuitBox,
      points: pts,
    };
  });
}

/**
 * Adapts connected circuit branches/components when scaling a wire frame via Lasso orange side handles
 * ('scale-x' or 'scale-y'), keeping connected horizontal/vertical circuit rails & bulbs/batteries intact.
 */
export function adaptCircuitWiresOnScaleTransform(
  prevStrokes: StrokeObject[],
  nextStrokes: StrokeObject[],
  movingStrokeIds: Set<string>,
  scaleMode: 'scale-x' | 'scale-y'
): StrokeObject[] {
  if (movingStrokeIds.size === 0) return nextStrokes;
  const prevComps = getCircuitComponentsWithTerminals(prevStrokes);
  if (prevComps.length === 0) return nextStrokes;
  const movedComps = prevComps.filter((c) => c.strokeIds.every((id) => movingStrokeIds.has(id)));
  if (movedComps.length > 0) return nextStrokes;

  return adaptCircuitLoopFromSegments(
    prevStrokes,
    nextStrokes,
    movingStrokeIds,
    prevComps,
    scaleMode,
    0,
    0
  );
}

/**
 * Live-adapts connected circuit wires (and orthogonal corners / T-risers) when one or more
 * circuit components (bulb, battery, resistor, switch, fan, ammeter, voltmeter, voltage-source)
 * or circuit wire segments are moved by (dx, dy) via pointer drag or arrow-key nudge.
 */
export function adaptCircuitWiresOnComponentMove(
  prevStrokes: StrokeObject[],
  nextStrokes: StrokeObject[],
  movingStrokeIds: Set<string>,
  dx: number,
  dy: number
): StrokeObject[] {
  if ((Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) || movingStrokeIds.size === 0) {
    return nextStrokes;
  }

  const prevComps = getCircuitComponentsWithTerminals(prevStrokes);
  if (prevComps.length === 0) return nextStrokes;
  const movedComps = prevComps.filter((c) => c.strokeIds.every((id) => movingStrokeIds.has(id)));
  if (movedComps.length === 0) {
    return adaptCircuitLoopFromSegments(
      prevStrokes,
      nextStrokes,
      movingStrokeIds,
      prevComps,
      'move',
      dx,
      dy
    );
  }

  const movedKeySet = new Set(movedComps.map((c) => c.key));
  const unmovedComps = prevComps.filter((c) => !movedKeySet.has(c.key));

  // When an entire connected multi-component circuit is being moved together (all components in its
  // wire network are in `movedComps`), translate the circuit rigidly as a single cohesive unit
  // (including any connected parallel-voltmeter or loop wire that might not have been in `movingStrokeIds`)
  // without warping wires against unrelated lines on the page!
  if (movedComps.length >= 2) {
    const compStrokeIds = new Set<string>();
    for (const c of prevComps) {
      for (const id of c.strokeIds) compStrokeIds.add(id);
    }
    const movingWires = extractCircuitWireSegments(
      prevStrokes,
      (s) => movingStrokeIds.has(s.id),
      compStrokeIds
    );
    const stationaryWires = extractCircuitWireSegments(
      prevStrokes,
      (s) => !movingStrokeIds.has(s.id),
      compStrokeIds
    );
    const allWires = [...movingWires, ...stationaryWires];
    const reachableFromMoved = findWiresReachableFromComponents(movedComps, allWires);
    const reachableWireSegs = allWires.filter((w) =>
      reachableFromMoved.has(`${w.stroke.id}:${w.p0Idx}`)
    );
    const hasConnectedUnmovedComp = unmovedComps.some((uc) =>
      getCompTerminalList(uc).some((term) =>
        reachableWireSegs.some(
          (w) => pointToSegmentDist(term.x, term.y, w.p0.x, w.p0.y, w.p1.x, w.p1.y) <= 30
        )
      )
    );
    if (!hasConnectedUnmovedComp) {
      const missedCircuitWireIds = new Set<string>();
      for (const sw of stationaryWires) {
        if (reachableFromMoved.has(`${sw.stroke.id}:${sw.p0Idx}`)) {
          missedCircuitWireIds.add(sw.stroke.id);
        }
      }
      if (missedCircuitWireIds.size === 0) {
        return nextStrokes;
      }
      return nextStrokes.map((s) =>
        !missedCircuitWireIds.has(s.id)
          ? s
          : {
              ...s,
              points: s.points.map((p) => ({
                ...p,
                x: p.x + dx,
                y: p.y + dy,
                cx: p.cx !== undefined ? p.cx + dx : undefined,
                cy: p.cy !== undefined ? p.cy + dy : undefined,
              })),
            }
      );
    }
  }

  const extWires = extractExternalCircuitWireLines(prevStrokes, movingStrokeIds);
  if (extWires.length === 0) {
    return adaptCircuitLoopFromSegments(
      prevStrokes,
      nextStrokes,
      movingStrokeIds,
      prevComps,
      'move',
      dx,
      dy
    );
  }

  const wireEdits = new Map<string, Map<number, { x: number; y: number }>>();
  const setWireVertex = (wId: string, ptIdx: number, x: number, y: number) => {
    let map = wireEdits.get(wId);
    if (!map) {
      map = new Map();
      wireEdits.set(wId, map);
    }
    map.set(ptIdx, { x, y });
  };

  const isPinnedByUnmovedComp = (px: number, py: number, movedOrient: 'h' | 'v'): boolean => {
    for (const uc of unmovedComps) {
      const uVert = isVerticalCircuitComponent(uc);
      if (movedOrient === 'h' && !uVert) {
        if (
          distance({ x: px, y: py }, uc.leftTerm) <= 30 ||
          distance({ x: px, y: py }, uc.rightTerm) <= 30 ||
          (px >= uc.minX - 16 && px <= uc.maxX + 16 && Math.abs(py - uc.cy) <= 30)
        ) {
          return true;
        }
      } else if (movedOrient === 'v' && uVert) {
        const uTop = uc.orientation === 'v' ? uc.leftTerm : { x: uc.cx, y: uc.minY };
        const uBot = uc.orientation === 'v' ? uc.rightTerm : { x: uc.cx, y: uc.maxY };
        if (
          distance({ x: px, y: py }, uTop) <= 30 ||
          distance({ x: px, y: py }, uBot) <= 30 ||
          (py >= uc.minY - 16 && py <= uc.maxY + 16 && Math.abs(px - uc.cx) <= 30)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const hasUnmovedCompBetweenX = (xA: number, xB: number, refY: number): boolean => {
    const lo = Math.min(xA, xB) + 6;
    const hi = Math.max(xA, xB) - 6;
    if (lo >= hi) return false;
    return unmovedComps.some((uc) => uc.cx >= lo && uc.cx <= hi && Math.abs(uc.cy - refY) <= 36);
  };

  const hasUnmovedCompBetweenY = (yA: number, yB: number, refX: number): boolean => {
    const lo = Math.min(yA, yB) + 6;
    const hi = Math.max(yA, yB) - 6;
    if (lo >= hi) return false;
    return unmovedComps.some((uc) => uc.cy >= lo && uc.cy <= hi && Math.abs(uc.cx - refX) <= 36);
  };

  for (const mc of movedComps) {
    const isVert = isVerticalCircuitComponent(mc);

    if (!isVert) {
      const prevL = mc.leftTerm;
      const prevR = mc.rightTerm;
      const newL = { x: prevL.x + dx, y: prevL.y + dy };
      const newR = { x: prevR.x + dx, y: prevR.y + dy };

      for (const w of extWires) {
        if (w.orient !== 'h') continue;
        const wStartIsLeft = w.p0.x <= w.p1.x;
        const leftIdx = wStartIsLeft ? w.p0Idx : w.p1Idx;
        const rightIdx = wStartIsLeft ? w.p1Idx : w.p0Idx;
        const leftPt = wStartIsLeft ? w.p0 : w.p1;
        const rightPt = wStartIsLeft ? w.p1 : w.p0;

        // 1. Horizontal wire approaching from the LEFT into mc.leftTerm
        const attachesLeft =
          leftPt.x < prevL.x - 4 &&
          rightPt.x >= prevL.x - 28 &&
          rightPt.x <= Math.max(prevL.x + 28, mc.cx + 14) &&
          Math.abs(rightPt.y - prevL.y) <= 28 &&
          !hasUnmovedCompBetweenX(leftPt.x, prevL.x, prevL.y);

        // 2. Horizontal wire approaching from the RIGHT into mc.rightTerm (also trims overlaps inside body!)
        const attachesRight =
          !attachesLeft &&
          rightPt.x > prevR.x + 4 &&
          leftPt.x <= prevR.x + 28 &&
          leftPt.x >= prevL.x + 4 &&
          Math.abs(leftPt.y - prevR.y) <= 28 &&
          !hasUnmovedCompBetweenX(prevR.x, rightPt.x, prevR.y);

        if (!attachesLeft && !attachesRight) continue;

        const innerIdx = attachesLeft ? rightIdx : leftIdx;
        const outerIdx = attachesLeft ? leftIdx : rightIdx;
        const innerOldPt = attachesLeft ? rightPt : leftPt;
        const outerPt = attachesLeft ? leftPt : rightPt;
        const targetTerm = attachesLeft ? newL : newR;

        // Avoid flipping wire direction backward if component is dragged all the way past the far rail
        if (attachesLeft && targetTerm.x <= outerPt.x + 2) continue;
        if (attachesRight && targetTerm.x >= outerPt.x - 2) continue;

        setWireVertex(w.stroke.id, innerIdx, targetTerm.x, targetTerm.y);

        if (
          Math.abs(targetTerm.y - outerPt.y) > 0.1 &&
          !isPinnedByUnmovedComp(outerPt.x, outerPt.y, 'h')
        ) {
          setWireVertex(w.stroke.id, outerIdx, outerPt.x, targetTerm.y);

          // Extend/shrink any vertical corner or T-riser wire whose endpoint meets this horizontal wire
          const spanMinX = Math.min(outerPt.x, innerOldPt.x, targetTerm.x) - 20;
          const spanMaxX = Math.max(outerPt.x, innerOldPt.x, targetTerm.x) + 20;
          for (const vw of extWires) {
            if (vw.orient !== 'v') continue;
            if (vw.stroke.id === w.stroke.id && (vw.p0Idx === outerIdx || vw.p1Idx === outerIdx)) {
              // Shared corner vertex on the same polyline is already updated via outerIdx
              continue;
            }
            if (vw.wireCoord < spanMinX || vw.wireCoord > spanMaxX) continue;
            const d0 = Math.abs(vw.p0.y - outerPt.y);
            const d1 = Math.abs(vw.p1.y - outerPt.y);
            if (d0 <= 24 && d0 <= d1 && Math.hypot(vw.p1.x - vw.p0.x, vw.p1.y - vw.p0.y) > 16) {
              setWireVertex(vw.stroke.id, vw.p0Idx, vw.p0.x, targetTerm.y);
            } else if (
              d1 <= 24 &&
              d1 < d0 &&
              Math.hypot(vw.p1.x - vw.p0.x, vw.p1.y - vw.p0.y) > 16
            ) {
              setWireVertex(vw.stroke.id, vw.p1Idx, vw.p1.x, targetTerm.y);
            }
          }
        }
      }
    } else {
      const prevT = mc.orientation === 'v' ? mc.leftTerm : { x: mc.cx, y: mc.minY };
      const prevB = mc.orientation === 'v' ? mc.rightTerm : { x: mc.cx, y: mc.maxY };
      const newT = { x: prevT.x + dx, y: prevT.y + dy };
      const newB = { x: prevB.x + dx, y: prevB.y + dy };

      for (const w of extWires) {
        if (w.orient !== 'v') continue;
        const wStartIsTop = w.p0.y <= w.p1.y;
        const topIdx = wStartIsTop ? w.p0Idx : w.p1Idx;
        const botIdx = wStartIsTop ? w.p1Idx : w.p0Idx;
        const topPt = wStartIsTop ? w.p0 : w.p1;
        const botPt = wStartIsTop ? w.p1 : w.p0;

        const attachesTop =
          topPt.y < prevT.y - 4 &&
          botPt.y >= prevT.y - 28 &&
          botPt.y <= Math.max(prevT.y + 28, mc.cy + 14) &&
          Math.abs(botPt.x - prevT.x) <= 28 &&
          !hasUnmovedCompBetweenY(topPt.y, prevT.y, prevT.x);

        const attachesBot =
          !attachesTop &&
          botPt.y > prevB.y + 4 &&
          topPt.y <= prevB.y + 28 &&
          topPt.y >= prevT.y + 4 &&
          Math.abs(topPt.x - prevB.x) <= 28 &&
          !hasUnmovedCompBetweenY(prevB.y, botPt.y, prevB.x);

        if (!attachesTop && !attachesBot) continue;

        const innerIdx = attachesTop ? botIdx : topIdx;
        const outerIdx = attachesTop ? topIdx : botIdx;
        const innerOldPt = attachesTop ? botPt : topPt;
        const outerPt = attachesTop ? topPt : botPt;
        const targetTerm = attachesTop ? newT : newB;

        if (attachesTop && targetTerm.y <= outerPt.y + 2) continue;
        if (attachesBot && targetTerm.y >= outerPt.y - 2) continue;

        setWireVertex(w.stroke.id, innerIdx, targetTerm.x, targetTerm.y);

        if (
          Math.abs(targetTerm.x - outerPt.x) > 0.1 &&
          !isPinnedByUnmovedComp(outerPt.x, outerPt.y, 'v')
        ) {
          setWireVertex(w.stroke.id, outerIdx, targetTerm.x, outerPt.y);

          const spanMinY = Math.min(outerPt.y, innerOldPt.y, targetTerm.y) - 20;
          const spanMaxY = Math.max(outerPt.y, innerOldPt.y, targetTerm.y) + 20;
          for (const hw of extWires) {
            if (hw.orient !== 'h') continue;
            if (hw.stroke.id === w.stroke.id && (hw.p0Idx === outerIdx || hw.p1Idx === outerIdx)) {
              // Shared corner vertex on the same polyline is already updated via outerIdx
              continue;
            }
            if (hw.wireCoord < spanMinY || hw.wireCoord > spanMaxY) continue;
            const d0 = Math.abs(hw.p0.x - outerPt.x);
            const d1 = Math.abs(hw.p1.x - outerPt.x);
            if (d0 <= 24 && d0 <= d1 && Math.hypot(hw.p1.x - hw.p0.x, hw.p1.y - hw.p0.y) > 16) {
              setWireVertex(hw.stroke.id, hw.p0Idx, targetTerm.x, hw.p0.y);
            } else if (
              d1 <= 24 &&
              d1 < d0 &&
              Math.hypot(hw.p1.x - hw.p0.x, hw.p1.y - hw.p0.y) > 16
            ) {
              setWireVertex(hw.stroke.id, hw.p1Idx, targetTerm.x, hw.p1.y);
            }
          }
        }
      }
    }
  }

  const adaptedAfterComps =
    wireEdits.size === 0
      ? nextStrokes
      : nextStrokes.map((s) => {
          const vEdit = wireEdits.get(s.id);
          if (!vEdit || s.points.length < 2) return s;
          const pts = s.points.map((p) => ({ ...p }));
          const editedIndices = new Set<number>();
          for (const [idx, pos] of vEdit.entries()) {
            if (idx < 0 || idx >= pts.length) continue;
            pts[idx] = { ...pts[idx], x: pos.x, y: pos.y };
            editedIndices.add(idx);
          }
          updateEditedLineWireHandles(s.points, pts, editedIndices);
          return { ...s, points: pts };
        });

  return adaptCircuitLoopFromSegments(
    prevStrokes,
    adaptedAfterComps,
    movingStrokeIds,
    prevComps,
    'move',
    dx,
    dy,
    new Set(wireEdits.keys())
  );
}

export function toggleSwitchStrokeGroup(
  strokes: StrokeObject[],
  switchKeyOrStrokeId: string
): { strokes: StrokeObject[]; newClosedState: boolean } {
  const comps = getCircuitComponentsWithTerminals(strokes);
  const swComp = comps.find(
    (c) =>
      c.kind === 'switch' &&
      (c.key === switchKeyOrStrokeId || c.strokeIds.includes(switchKeyOrStrokeId))
  );
  if (!swComp) return { strokes, newClosedState: true };

  const nextClosed = !(swComp.switchClosed ?? true);
  const replacementStrokes = createPhysicsStencilStrokes(
    'switch',
    swComp.minX,
    swComp.minY,
    swComp.w,
    swComp.h,
    swComp.color,
    swComp.layerId,
    '#2563eb',
    nextClosed
  ).map((s) => ({ ...s, groupId: swComp.key }));

  const removeSet = new Set(swComp.strokeIds);
  const out: StrokeObject[] = [];
  let inserted = false;
  for (const s of strokes) {
    if (removeSet.has(s.id)) {
      if (!inserted) {
        out.push(...replacementStrokes);
        inserted = true;
      }
      continue;
    }
    out.push(s);
  }
  return { strokes: out, newClosedState: nextClosed };
}

export interface HandDrawnCircuitRecognitionResult {
  changed: boolean;
  strokes: StrokeObject[];
  removedStrokeIds: string[];
  addedCompStrokeIds: string[];
  addedWireStrokeIds?: string[];
  removedTextIds: string[];
}

function getStrokeBBoxHelper(s: StrokeObject): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
} {
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
  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, w: 0, h: 0, cx: 0, cy: 0 };
  }
  const w = maxX - minX;
  const h = maxY - minY;
  return { minX, minY, maxX, maxY, w, h, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

function classifyHandwrittenMeterLetter(
  cluster: StrokeObject[]
): 'ammeter' | 'voltmeter' | null {
  if (cluster.length === 0 || cluster.length > 4) return null;
  let gMinX = Infinity,
    gMinY = Infinity,
    gMaxX = -Infinity,
    gMaxY = -Infinity;
  for (const s of cluster) {
    for (const p of s.points) {
      if (p.x < gMinX) gMinX = p.x;
      if (p.y < gMinY) gMinY = p.y;
      if (p.x > gMaxX) gMaxX = p.x;
      if (p.y > gMaxY) gMaxY = p.y;
    }
  }
  const gw = gMaxX - gMinX;
  const gh = gMaxY - gMinY;
  if (gh < 6 || gw < 3.8 || gw / gh < 0.16 || gw / gh > 2.65) return null;

  const isInvertedVStroke = (s: StrokeObject, lMinY: number, lW: number, lH: number): boolean => {
    const pts = s.points;
    if (pts.length < 3) return false;
    const p0 = pts[0];
    const pN = pts[pts.length - 1];
    let topPt = pts[0];
    for (const p of pts) {
      if (p.y < topPt.y) topPt = p;
    }
    if (topPt.y > lMinY + Math.max(3, lH * 0.12)) return false;
    if (p0.y < lMinY + lH * 0.44 || pN.y < lMinY + lH * 0.44) return false;
    const footSpan = Math.abs(pN.x - p0.x);
    if (footSpan < Math.max(3.8, lW * 0.30)) return false;
    const minFootX = Math.min(p0.x, pN.x);
    const maxFootX = Math.max(p0.x, pN.x);
    return topPt.x >= minFootX - lW * 0.22 && topPt.x <= maxFootX + lW * 0.22;
  };

  // 1. Test Handwritten 'A' / 'Α'
  if (cluster.length >= 2) {
    for (const bar of cluster) {
      const bb = getStrokeBBoxHelper(bar);
      const isHorizBar =
        bb.w >= Math.max(3.0, gw * 0.18) &&
        bb.h <= Math.max(9.5, bb.w * 0.72) &&
        bb.cy >= gMinY + gh * 0.22 &&
        bb.cy <= gMinY + gh * 0.90;
      if (!isHorizBar) continue;

      const legs = cluster.filter((s) => s.id !== bar.id);
      let lMinX = Infinity,
        lMinY = Infinity,
        lMaxX = -Infinity,
        lMaxY = -Infinity;
      for (const ls of legs) {
        for (const p of ls.points) {
          if (p.x < lMinX) lMinX = p.x;
          if (p.y < lMinY) lMinY = p.y;
          if (p.x > lMaxX) lMaxX = p.x;
          if (p.y > lMaxY) lMaxY = p.y;
        }
      }
      const lW = lMaxX - lMinX;
      const lH = lMaxY - lMinY;
      if (lH < gh * 0.68 || lW < Math.max(4.0, lH * 0.18)) continue;
      if (bb.maxX < lMinX - 6 || bb.minX > lMaxX + 6) continue;

      if (legs.length === 1) {
        if (isInvertedVStroke(legs[0], lMinY, lW, lH)) return 'ammeter';
      } else {
        const sortedLegs = [...legs].sort(
          (a, b) => getStrokeBBoxHelper(b).h - getStrokeBBoxHelper(a).h
        );
        if (isInvertedVStroke(sortedLegs[0], lMinY, lW, lH)) return 'ammeter';
        const legA = sortedLegs[0];
        const legB = sortedLegs[1];
        const ba = getStrokeBBoxHelper(legA);
        const bb2 = getStrokeBBoxHelper(legB);
        if (ba.h >= lH * 0.50 && bb2.h >= lH * 0.50 && legA.points.length >= 2 && legB.points.length >= 2) {
          const a0 = legA.points[0];
          const a1 = legA.points[legA.points.length - 1];
          const aTop = a0.y <= a1.y ? a0 : a1;
          const aBot = a0.y <= a1.y ? a1 : a0;
          const b0 = legB.points[0];
          const b1 = legB.points[legB.points.length - 1];
          const bTop = b0.y <= b1.y ? b0 : b1;
          const bBot = b0.y <= b1.y ? b1 : b0;
          const topDist = distance(aTop, bTop);
          const botSpanX = Math.abs(aBot.x - bBot.x);
          const topSpanX = Math.abs(aTop.x - bTop.x);
          if (
            topDist <= Math.max(15, lW * 0.62) &&
            botSpanX >= Math.max(4.5, lW * 0.34) &&
            (botSpanX > topSpanX * 1.18 || (topDist <= 9 && botSpanX >= 5.5))
          ) {
            return 'ammeter';
          }
        }
      }
    }
  } else if (cluster.length === 1) {
    // Single-stroke continuous 'A' (up to top peak, down to opposite foot, then across for crossbar)
    const s = cluster[0];
    const pts = s.points;
    if (!s.isShape && pts.length >= 8) {
      let pathLen = 0;
      let topPt = pts[0];
      let hasBL = false;
      let hasBR = false;
      for (let i = 0; i < pts.length; i++) {
        if (i > 0) pathLen += distance(pts[i - 1], pts[i]);
        if (pts[i].y < topPt.y) topPt = pts[i];
        if (pts[i].x <= gMinX + gw * 0.38 && pts[i].y >= gMinY + gh * 0.62) hasBL = true;
        if (pts[i].x >= gMaxX - gw * 0.38 && pts[i].y >= gMinY + gh * 0.62) hasBR = true;
      }
      if (
        pathLen >= gh * 2.30 &&
        pathLen <= gh * 6.2 &&
        hasBL &&
        hasBR &&
        topPt.x >= gMinX + gw * 0.10 &&
        topPt.x <= gMaxX - gw * 0.10
      ) {
        const tailStart = Math.floor(pts.length * 0.48);
        let hasCrossSeg = false;
        for (let i = tailStart; i < pts.length - 1 && !hasCrossSeg; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = Math.abs(pts[j].x - pts[i].x);
            const dy = Math.abs(pts[j].y - pts[i].y);
            if (
              dx >= gw * 0.30 &&
              dy <= dx * 0.65 &&
              pts[i].y >= gMinY + gh * 0.24 &&
              pts[i].y <= gMinY + gh * 0.90 &&
              pts[j].y >= gMinY + gh * 0.24 &&
              pts[j].y <= gMinY + gh * 0.90
            ) {
              hasCrossSeg = true;
              break;
            }
          }
        }
        if (hasCrossSeg) return 'ammeter';
      }
    }
  }

  // 2. Test Handwritten 'V' (no horizontal crossbar)
  const hasAnyHorizBar = cluster.some((s) => {
    const bb = getStrokeBBoxHelper(s);
    return bb.w >= 4 && bb.h <= bb.w * 0.55;
  });
  if (hasAnyHorizBar) return null;

  if (cluster.length === 1) {
    const s = cluster[0];
    const pts = s.points;
    const isSnappedOpenUpCurve =
      (s.shapeType === 'parabola' || s.shapeType === 'hyperbola' || s.shapeType === 'arc') &&
      pts.length === 3;
    if ((!s.isShape && pts.length >= 3) || isSnappedOpenUpCurve) {
      const p0 = pts[0];
      const pN = pts[pts.length - 1];
      const topSpanX = Math.abs(pN.x - p0.x);
      if (
        p0.y <= gMinY + gh * 0.45 &&
        pN.y <= gMinY + gh * 0.45 &&
        topSpanX >= Math.max(4.2, gw * 0.42) &&
        distance(p0, pN) >= Math.max(4.2, gw * 0.42)
      ) {
        let botIdx = 0;
        let pathLen = 0;
        for (let i = 0; i < pts.length; i++) {
          if (i > 0) pathLen += distance(pts[i - 1], pts[i]);
          if (pts[i].y > pts[botIdx].y) botIdx = i;
        }
        const botPt = pts[botIdx];
        const minTopX = Math.min(p0.x, pN.x);
        const maxTopX = Math.max(p0.x, pN.x);
        if (
          botIdx > 0 &&
          botIdx < pts.length - 1 &&
          botPt.x >= minTopX + topSpanX * 0.08 &&
          botPt.x <= maxTopX - topSpanX * 0.08 &&
          pathLen >= gh * 1.42 &&
          pathLen <= Math.hypot(gw, gh) * 2.95
        ) {
          let monotonicDownUp = true;
          let maxYSoFar = pts[0].y;
          for (let i = 1; i <= botIdx; i++) {
            if (pts[i].y > maxYSoFar) maxYSoFar = pts[i].y;
            if (pts[i].y < maxYSoFar - gh * 0.25) {
              monotonicDownUp = false;
              break;
            }
          }
          let minYAfter = pts[botIdx].y;
          for (let i = botIdx + 1; i < pts.length && monotonicDownUp; i++) {
            if (pts[i].y < minYAfter) minYAfter = pts[i].y;
            if (pts[i].y > minYAfter + gh * 0.25) {
              monotonicDownUp = false;
              break;
            }
          }
          if (monotonicDownUp) return 'voltmeter';
        }
      }
    }
  } else if (cluster.length === 2) {
    const [legA, legB] = cluster;
    const okTypeA = !legA.isShape || legA.shapeType === 'line';
    const okTypeB = !legB.isShape || legB.shapeType === 'line';
    const ba = getStrokeBBoxHelper(legA);
    const bb = getStrokeBBoxHelper(legB);
    if (
      okTypeA &&
      okTypeB &&
      legA.points.length >= 2 &&
      legB.points.length >= 2 &&
      ba.h >= gh * 0.56 &&
      bb.h >= gh * 0.56 &&
      ba.w <= ba.h * 1.65 &&
      bb.w <= bb.h * 1.65
    ) {
      const a0 = legA.points[0];
      const a1 = legA.points[legA.points.length - 1];
      const aTop = a0.y <= a1.y ? a0 : a1;
      const aBot = a0.y <= a1.y ? a1 : a0;
      const b0 = legB.points[0];
      const b1 = legB.points[legB.points.length - 1];
      const bTop = b0.y <= b1.y ? b0 : b1;
      const bBot = b0.y <= b1.y ? b1 : b0;
      const botDist = distance(aBot, bBot);
      const topSpanX = Math.abs(aTop.x - bTop.x);
      if (
        aTop.y <= gMinY + gh * 0.40 &&
        bTop.y <= gMinY + gh * 0.40 &&
        aBot.y >= gMinY + gh * 0.65 &&
        bBot.y >= gMinY + gh * 0.65 &&
        botDist <= Math.max(14, gw * 0.48) &&
        topSpanX >= Math.max(5.0, gw * 0.45) &&
        (topSpanX >= botDist * 1.35 || (botDist <= 8.5 && topSpanX >= 5.5))
      ) {
        return 'voltmeter';
      }
    }
  }

  return null;
}

/**
 * Recognizes hand-drawn Ammeters ('A'/'Α' + circle), Voltmeters ('V' + circle),
 * Pictorial & Schematic Batteries, Voltage Sources (long + short parallel plates),
 * Pictorial & Schematic Light Bulbs, Zig-Zag Resistors, and Freehand Wires
 * drawn by the user on/in an electric circuit and converts them into crisp interactive stencils.
 */
export function recognizeHandDrawnCircuitSymbols(
  strokes: StrokeObject[],
  texts: TextObject[] = [],
  options?: {
    requireCircuitContext?: boolean;
    explicitCircuitIntent?: boolean;
    convertFreehandWires?: boolean;
  }
): HandDrawnCircuitRecognitionResult {
  const requireContext = options?.requireCircuitContext ?? false;
  const explicitCircuitIntent = options?.explicitCircuitIntent ?? false;
  const convertFreehandWires = options?.convertFreehandWires ?? false;
  if (strokes.length === 0) {
    return {
      changed: false,
      strokes,
      removedStrokeIds: [],
      addedCompStrokeIds: [],
      addedWireStrokeIds: [],
      removedTextIds: [],
    };
  }

  const hasExistingCircuitCompOnPage = strokes.some((s) => classifyCircuitStrokeKind(s) !== null);
  const consumedStrokeIds = new Set<string>();
  const consumedTextIds = new Set<string>();
  const replacements = new Map<string, StrokeObject[]>();
  const addedCompStrokeIds: string[] = [];

  const isWireLikeStroke = (ws: StrokeObject, excludeIds: Set<string>): boolean => {
    if (excludeIds.has(ws.id) || classifyCircuitStrokeKind(ws) !== null) return false;
    if (ws.tool === 'highlighter' || ws.points.length < 2) return false;
    if (ws.shapeType && ws.shapeType !== 'line') return false;
    if (ws.points[0]?.twist === 999) return false;
    const p0 = ws.points[0];
    const p1 = ws.points[ws.points.length - 1];
    return distance(p0, p1) >= 18;
  };

  const circleTouchesOrCrossesWire = (
    cx: number,
    cy: number,
    r: number,
    excludeIds: Set<string>
  ): boolean => {
    for (const ws of strokes) {
      if (!isWireLikeStroke(ws, excludeIds)) continue;
      for (let k = 0; k < ws.points.length - 1; k++) {
        const a = ws.points[k];
        const b = ws.points[k + 1];
        const sdx = b.x - a.x;
        const sdy = b.y - a.y;
        const lenSq = sdx * sdx + sdy * sdy;
        if (lenSq < 64) continue;
        const isHV =
          Math.abs(sdy) <= Math.max(20, Math.abs(sdx) * 0.36) ||
          Math.abs(sdx) <= Math.max(20, Math.abs(sdy) * 0.36);
        if (!isHV) continue;
        const t = Math.max(0, Math.min(1, ((cx - a.x) * sdx + (cy - a.y) * sdy) / lenSq));
        const projX = a.x + t * sdx;
        const projY = a.y + t * sdy;
        const dCenter = Math.hypot(cx - projX, cy - projY);
        if (dCenter <= r + 38) return true;
      }
    }
    return false;
  };

  // Find candidate hand-drawn circles / ellipses
  for (const cs of strokes) {
    if (consumedStrokeIds.has(cs.id) || classifyCircuitStrokeKind(cs) !== null) continue;
    if (cs.tool === 'highlighter' || cs.points.length < 4) continue;

    const cb = getStrokeBBoxHelper(cs);
    if (cb.w < 22 || cb.h < 22 || cb.w > 180 || cb.h > 180) continue;
    const aspect = cb.w / cb.h;
    if (aspect < 0.55 || aspect > 1.82) continue;

    let isCircleCand = cs.shapeType === 'circle' || cs.shapeType === 'ellipse';
    if (!isCircleCand && !cs.isShape && cs.points.length >= 7) {
      const pFirst = cs.points[0];
      const pLast = cs.points[cs.points.length - 1];
      const diag = Math.hypot(cb.w, cb.h);
      if (distance(pFirst, pLast) <= Math.max(26, diag * 0.42)) {
        const rx = Math.max(10, cb.w / 2);
        const ry = Math.max(10, cb.h / 2);
        let errSum = 0;
        for (const p of cs.points) {
          const nr = Math.hypot((p.x - cb.cx) / rx, (p.y - cb.cy) / ry);
          errSum += Math.abs(nr - 1);
        }
        if (errSum / cs.points.length <= 0.27) {
          isCircleCand = true;
        }
      }
    }
    if (!isCircleCand) continue;

    const cx = cb.cx;
    const cy = cb.cy;
    const r = Math.max(15, Math.min(58, (cb.w + cb.h) / 4));

    // Look for an optional diagonal needle/slash/arrow stroke crossing through the circle
    const needleIds: string[] = [];
    let needleUpperTip: { x: number; y: number } | null = null;
    for (const ns of strokes) {
      if (ns.id === cs.id || consumedStrokeIds.has(ns.id) || classifyCircuitStrokeKind(ns) !== null) {
        continue;
      }
      if (ns.tool === 'highlighter' || ns.points.length < 2) continue;
      if (
        ns.isShape &&
        ns.shapeType !== 'line' &&
        ns.shapeType !== 'arrow' &&
        ns.shapeType !== 'spring-pointer'
      ) {
        continue;
      }
      if (!ns.isShape && ns.points.length > 3) {
        // Check straightness for freehand diagonal slash
        let pLen = 0;
        for (let i = 1; i < ns.points.length; i++) pLen += distance(ns.points[i - 1], ns.points[i]);
        if (distance(ns.points[0], ns.points[ns.points.length - 1]) < pLen * 0.76) continue;
      }
      const p0 = ns.points[0];
      const p1 = ns.points[ns.points.length - 1];
      const chord = distance(p0, p1);
      if (chord < r * 1.15 || chord > r * 4.4) continue;
      const deg = Math.abs((Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI);
      const isDiag = (deg >= 16 && deg <= 76) || (deg >= 104 && deg <= 164);
      if (!isDiag) continue;
      // Closest distance from circle center (cx, cy) to segment (p0, p1)
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const t = Math.max(0, Math.min(1, ((cx - p0.x) * dx + (cy - p0.y) * dy) / (dx * dx + dy * dy)));
      const dMid = Math.hypot(cx - (p0.x + t * dx), cy - (p0.y + t * dy));
      if (dMid <= r * 0.58) {
        needleIds.push(ns.id);
        needleUpperTip = p0.y <= p1.y ? p0 : p1;
        break;
      }
    }

    // Also detect any tiny manual 45° arrowhead sitting right on needleUpperTip (apex at top-right corner, no crossbar)
    const needleTipHeadIds: string[] = [];
    if (needleUpperTip) {
      for (const hs of strokes) {
        if (
          hs.id === cs.id ||
          needleIds.includes(hs.id) ||
          consumedStrokeIds.has(hs.id) ||
          classifyCircuitStrokeKind(hs) !== null ||
          hs.tool === 'highlighter'
        ) {
          continue;
        }
        const hb = getStrokeBBoxHelper(hs);
        if (hb.w < 3 || hb.h < 3 || hb.w > r * 0.95 || hb.h > r * 0.95) continue;
        const nearTip = hs.points.some((p) => distance(p, needleUpperTip!) <= 15);
        if (!nearTip) continue;
        // Only treat as needle arrowhead if it is NOT itself 'A' or 'V'
        if (classifyHandwrittenMeterLetter([hs]) === null) {
          // Check if its apex is near (hb.maxX, hb.minY) or (hb.minX, hb.minY) right at the tip
          if (distance({ x: hb.maxX, y: hb.minY }, needleUpperTip) <= 16) {
            needleTipHeadIds.push(hs.id);
          }
        }
      }
    }

    // A. Check Typed TextObject ('A'/'Α' or 'V') inside or near the circle
    let matchedKind: 'ammeter' | 'voltmeter' | null = null;
    let matchedLetterInside = false;
    let matchedTextId: string | null = null;
    let matchedLetterStrokeIds: string[] = [];

    for (const tx of texts) {
      if (consumedTextIds.has(tx.id)) continue;
      const clean = (tx.text || '').trim();
      let txKind: 'ammeter' | 'voltmeter' | null = null;
      if (clean === 'A' || clean === 'Α' || clean === 'a' || clean === 'α') txKind = 'ammeter';
      else if (clean === 'V' || clean === 'v') txKind = 'voltmeter';
      if (!txKind) continue;
      const fs = tx.fontSize || 24;
      const tcx = tx.x + fs * 0.35;
      const tcy = tx.y + fs * 0.55;
      const dCenter = Math.hypot(tcx - cx, tcy - cy);
      const dTip = needleUpperTip ? Math.hypot(tcx - needleUpperTip.x, tcy - needleUpperTip.y) : Infinity;
      if (dCenter <= r * 2.5 || dTip <= Math.max(44, r * 1.35)) {
        matchedKind = txKind;
        matchedLetterInside = dCenter <= r * 0.85;
        matchedTextId = tx.id;
        break;
      }
    }

    // B. Check Handwritten 'A'/'Α' or 'V' strokes inside or near the circle
    if (!matchedKind) {
      const excludeSet = new Set<string>([cs.id, ...needleIds, ...needleTipHeadIds]);
      const candStrokes: StrokeObject[] = [];
      for (const ls of strokes) {
        if (excludeSet.has(ls.id) || consumedStrokeIds.has(ls.id)) continue;
        if (classifyCircuitStrokeKind(ls) !== null || ls.tool === 'highlighter') continue;
        if (ls.shapeType === 'circle' || ls.shapeType === 'ellipse' || ls.shapeType === 'rectangle') {
          continue;
        }
        const lb = getStrokeBBoxHelper(ls);
        if (lb.w < 2.5 && lb.h < 2.5) continue;
        if (lb.w > Math.max(60, r * 2.15) || lb.h > Math.max(64, r * 2.25)) continue;
        if (Math.hypot(lb.w, lb.h) > Math.max(76, r * 2.55)) continue;
        const dCenter = Math.hypot(lb.cx - cx, lb.cy - cy);
        const dTip = needleUpperTip
          ? Math.hypot(lb.cx - needleUpperTip.x, lb.cy - needleUpperTip.y)
          : Infinity;
        if (dCenter <= r * 2.55 || dTip <= Math.max(44, r * 1.4)) {
          candStrokes.push(ls);
        }
      }

      // Group spatially close letter strokes (bbox gap <= 14px) into letter clusters
      const visited = new Uint8Array(candStrokes.length);
      const clusters: StrokeObject[][] = [];
      for (let i = 0; i < candStrokes.length; i++) {
        if (visited[i]) continue;
        visited[i] = 1;
        const grp: StrokeObject[] = [candStrokes[i]];
        let b0 = getStrokeBBoxHelper(candStrokes[i]);
        let gMinX = b0.minX,
          gMinY = b0.minY,
          gMaxX = b0.maxX,
          gMaxY = b0.maxY;
        let grew = true;
        while (grew && grp.length < 4) {
          grew = false;
          for (let j = 0; j < candStrokes.length; j++) {
            if (visited[j]) continue;
            const bj = getStrokeBBoxHelper(candStrokes[j]);
            const gapX = Math.max(0, gMinX - bj.maxX, bj.minX - gMaxX);
            const gapY = Math.max(0, gMinY - bj.maxY, bj.minY - gMaxY);
            if (gapX <= 14 && gapY <= 14) {
              visited[j] = 1;
              grp.push(candStrokes[j]);
              gMinX = Math.min(gMinX, bj.minX);
              gMinY = Math.min(gMinY, bj.minY);
              gMaxX = Math.max(gMaxX, bj.maxX);
              gMaxY = Math.max(gMaxY, bj.maxY);
              grew = true;
              if (grp.length >= 4) break;
            }
          }
        }
        clusters.push(grp);
      }

      // Sort clusters so inside-the-circle or closest-to-needle-tip clusters are tested first
      clusters.sort((ca, cb2) => {
        const ba = getStrokeBBoxHelper(ca[0]);
        const bb = getStrokeBBoxHelper(cb2[0]);
        const da = needleUpperTip
          ? Math.min(Math.hypot(ba.cx - cx, ba.cy - cy), Math.hypot(ba.cx - needleUpperTip.x, ba.cy - needleUpperTip.y))
          : Math.hypot(ba.cx - cx, ba.cy - cy);
        const db = needleUpperTip
          ? Math.min(Math.hypot(bb.cx - cx, bb.cy - cy), Math.hypot(bb.cx - needleUpperTip.x, bb.cy - needleUpperTip.y))
          : Math.hypot(bb.cx - cx, bb.cy - cy);
        return da - db;
      });

      for (const grp of clusters) {
        const kind = classifyHandwrittenMeterLetter(grp);
        if (kind) {
          let lMinX = Infinity,
            lMinY = Infinity,
            lMaxX = -Infinity,
            lMaxY = -Infinity;
          for (const gs of grp) {
            for (const p of gs.points) {
              if (p.x < lMinX) lMinX = p.x;
              if (p.y < lMinY) lMinY = p.y;
              if (p.x > lMaxX) lMaxX = p.x;
              if (p.y > lMaxY) lMaxY = p.y;
            }
          }
          const lcx = (lMinX + lMaxX) / 2;
          const lcy = (lMinY + lMaxY) / 2;
          const lh = lMaxY - lMinY;
          const dCircle = Math.hypot(lcx - cx, lcy - cy);
          matchedKind = kind;
          matchedLetterInside = dCircle <= r * 0.62 && lh >= r * 0.36;
          matchedLetterStrokeIds = grp.map((gs) => gs.id);
          break;
        }
      }
    }

    if (matchedKind) {
      const allInvolved = new Set<string>([
        cs.id,
        ...needleIds,
        ...needleTipHeadIds,
        ...matchedLetterStrokeIds,
      ]);
      const hasWire = circleTouchesOrCrossesWire(cx, cy, r, allInvolved);
      const passesContext =
        !requireContext ||
        needleIds.length > 0 ||
        hasWire ||
        hasExistingCircuitCompOnPage ||
        (matchedLetterInside && r <= 50);

      if (passesContext) {
        const boxW = r / 0.33;
        const boxH = r / 0.33;
        const boxX = cx - boxW * 0.42;
        const boxY = cy - boxH * 0.58;
        const meterStrokes = createPhysicsStencilStrokes(
          matchedKind,
          boxX,
          boxY,
          boxW,
          boxH,
          cs.color || '#111827',
          cs.layerId || 'layer-1'
        );
        for (const id of allInvolved) consumedStrokeIds.add(id);
        if (matchedTextId) consumedTextIds.add(matchedTextId);
        replacements.set(cs.id, meterStrokes);
        for (const ms of meterStrokes) addedCompStrokeIds.push(ms.id);
        continue;
      }
    }

    // C. Hand-drawn Schematic or Pictorial Lamp on a circle/dome:
    //    (1) Circle + 'X' cross inside, OR
    //    (2) Circle/dome + internal filament (loop/coil/M/arch) and/or screw-base lines right underneath!
    const innerFilamentIds: string[] = [];
    const innerDiagStrokes: { id: string; slope: number }[] = [];
    for (const ds of strokes) {
      if (ds.id === cs.id || consumedStrokeIds.has(ds.id) || classifyCircuitStrokeKind(ds) !== null) {
        continue;
      }
      if (ds.tool === 'highlighter' || ds.points.length < 2) continue;
      const db = getStrokeBBoxHelper(ds);
      if (Math.hypot(db.cx - cx, db.cy - cy) > r * 0.65) continue;
      if (db.w > cb.w * 1.15 || db.h > cb.h * 1.15) continue;
      if (Math.hypot(db.w, db.h) < Math.max(7, r * 0.40)) continue;
      innerFilamentIds.push(ds.id);

      if (!ds.isShape || ds.shapeType === 'line') {
        const p0 = ds.points[0];
        const p1 = ds.points[ds.points.length - 1];
        const chord = distance(p0, p1);
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        if (chord >= r * 0.75 && chord <= r * 2.4 && Math.abs(dx) >= r * 0.30 && Math.abs(dy) >= r * 0.30) {
          innerDiagStrokes.push({ id: ds.id, slope: dy / dx });
        }
      }
    }

    const baseStrokeIds: string[] = [];
    for (const bs of strokes) {
      if (
        bs.id === cs.id ||
        innerFilamentIds.includes(bs.id) ||
        consumedStrokeIds.has(bs.id) ||
        classifyCircuitStrokeKind(bs) !== null ||
        bs.tool === 'highlighter' ||
        bs.points.length < 2
      ) {
        continue;
      }
      const bb = getStrokeBBoxHelper(bs);
      if (bb.w > cb.w * 0.92 || bb.h > cb.h * 0.85) continue;
      if (Math.hypot(bb.w, bb.h) > Math.max(92, cb.w * 1.35)) continue;
      if (Math.hypot(bb.w, bb.h) < 4) continue;
      if (
        Math.abs(bb.cx - cx) <= cb.w * 0.52 &&
        bb.cy >= cb.maxY - cb.h * 0.26 &&
        bb.cy <= cb.maxY + cb.h * 0.82 &&
        bb.minY >= cy - cb.h * 0.10
      ) {
        baseStrokeIds.push(bs.id);
      }
    }

    const posDiag = innerDiagStrokes.find((d) => d.slope > 0.30 && d.slope < 3.1);
    const negDiag = innerDiagStrokes.find((d) => d.slope < -0.30 && d.slope > -3.1);
    const hasXCross = Boolean(posDiag && negDiag);
    const isPictorialBulbWithBase = baseStrokeIds.length >= 1 && (innerFilamentIds.length >= 1 || !requireContext);
    const isLassoCircleWithFilament = !requireContext && innerFilamentIds.length >= 1;

    if (hasXCross || isPictorialBulbWithBase || isLassoCircleWithFilament) {
      const lampInvolved = new Set<string>([
        cs.id,
        ...innerFilamentIds,
        ...(isPictorialBulbWithBase ? baseStrokeIds : []),
      ]);
      const hasWire = circleTouchesOrCrossesWire(cx, cy, r + 14, lampInvolved);
      if (!requireContext || hasWire || hasExistingCircuitCompOnPage || (hasXCross && baseStrokeIds.length >= 1)) {
        const bw = 96;
        const bh = 88;
        const bx = cx - bw / 2;
        const by = isPictorialBulbWithBase ? cb.minY : cy - bh * 0.848;
        const bulbStrokes = createPhysicsStencilStrokes(
          'bulb',
          bx,
          by,
          bw,
          bh,
          cs.color || '#111827',
          cs.layerId || 'layer-1'
        );
        for (const id of lampInvolved) consumedStrokeIds.add(id);
        replacements.set(cs.id, bulbStrokes);
        for (const bs of bulbStrokes) addedCompStrokeIds.push(bs.id);
      }
    }
  }

  // C2. Single-stroke Pear / Lightbulb Silhouette (wide rounded top dome + narrower bottom screw neck, or open-bottom arch dome + screw base!)
  for (const ps of strokes) {
    if (consumedStrokeIds.has(ps.id) || classifyCircuitStrokeKind(ps) !== null) continue;
    if (ps.tool === 'highlighter' || ps.points.length < 5) continue;
    const pb = getStrokeBBoxHelper(ps);
    if (pb.w < 18 || pb.h < 24 || pb.w > 165 || pb.h > 190) continue;

    // Open-bottom dome/arch ('arc', 'parabola', or inverted-U freehand) + bottom base/filament strokes
    const pFirst = ps.points[0];
    const pLast = ps.points[ps.points.length - 1];
    const diag = Math.hypot(pb.w, pb.h);
    const isArchDome =
      ((ps.shapeType === 'arc' || ps.shapeType === 'parabola') &&
        ps.points.length === 3 &&
        ps.points[1].y < Math.min(pFirst.y, pLast.y) - pb.h * 0.35) ||
      (!ps.isShape &&
        pFirst.y >= pb.minY + pb.h * 0.45 &&
        pLast.y >= pb.minY + pb.h * 0.45 &&
        distance(pFirst, pLast) <= pb.w * 0.92);

    // Closed pear silhouette: top 55% is wide dome, bottom 26% narrows into screw neck (and top 22% is NOT narrower than middle, distinguishing from vertical AA battery!)
    let isPearBulb = false;
    if (!ps.isShape && ps.points.length >= 8 && pb.h >= pb.w * 0.85 && pb.h <= pb.w * 2.35 && distance(pFirst, pLast) <= Math.max(36, diag * 0.50)) {
      let topMinX = Infinity, topMaxX = -Infinity;
      let upperMinX = Infinity, upperMaxX = -Infinity;
      let lowerMinX = Infinity, lowerMaxX = -Infinity;
      for (const pt of ps.points) {
        if (pt.y <= pb.minY + pb.h * 0.25) {
          if (pt.x < topMinX) topMinX = pt.x;
          if (pt.x > topMaxX) topMaxX = pt.x;
        }
        if (pt.y <= pb.minY + pb.h * 0.58) {
          if (pt.x < upperMinX) upperMinX = pt.x;
          if (pt.x > upperMaxX) upperMaxX = pt.x;
        }
        if (pt.y >= pb.maxY - pb.h * 0.26) {
          if (pt.x < lowerMinX) lowerMinX = pt.x;
          if (pt.x > lowerMaxX) lowerMaxX = pt.x;
        }
      }
      const topW = Number.isFinite(topMinX) ? topMaxX - topMinX : 0;
      const upperW = Number.isFinite(upperMinX) ? upperMaxX - upperMinX : 0;
      const lowerW = Number.isFinite(lowerMinX) ? lowerMaxX - lowerMinX : 0;
      if (
        upperW >= pb.w * 0.84 &&
        topW >= lowerW * 0.92 &&
        lowerW >= upperW * 0.14 &&
        lowerW <= upperW * 0.74
      ) {
        isPearBulb = true;
      }
    }

    if (!isPearBulb && !isArchDome) continue;

    const extraBulbIds: string[] = [];
    for (const es of strokes) {
      if (es.id === ps.id || consumedStrokeIds.has(es.id) || classifyCircuitStrokeKind(es) !== null) continue;
      if (es.tool === 'highlighter') continue;
      const eb = getStrokeBBoxHelper(es);
      if (eb.w > pb.w * 1.05 || eb.h > pb.h * 1.05 || Math.hypot(eb.w, eb.h) > Math.max(92, pb.w * 1.35)) continue;
      const insideDome =
        eb.cx >= pb.minX - 8 &&
        eb.cx <= pb.maxX + 8 &&
        eb.cy >= pb.minY - 6 &&
        eb.cy <= pb.maxY + pb.h * 0.72;
      if (insideDome) extraBulbIds.push(es.id);
    }

    if (isArchDome && extraBulbIds.length === 0) continue;
    const involved = new Set<string>([ps.id, ...extraBulbIds]);
    const hasWire = circleTouchesOrCrossesWire(pb.cx, pb.cy, Math.max(pb.w, pb.h) * 0.55, involved);
    if (requireContext && !hasWire && !hasExistingCircuitCompOnPage) continue;

    const bw = 96;
    const bh = 88;
    const bx = pb.cx - bw / 2;
    const by = pb.minY;
    const bulbStrokes = createPhysicsStencilStrokes(
      'bulb',
      bx,
      by,
      bw,
      bh,
      ps.color || '#111827',
      ps.layerId || 'layer-1'
    );
    for (const id of involved) consumedStrokeIds.add(id);
    replacements.set(ps.id, bulbStrokes);
    for (const bs of bulbStrokes) addedCompStrokeIds.push(bs.id);
  }

  // Helper: check if a bounding box encloses an already-recognized component deep inside its interior (meaning it's an outer circuit wire loop!)
  const boxEnclosesComponent = (minX: number, minY: number, maxX: number, maxY: number): boolean => {
    for (const [repAnchorId] of replacements) {
      const orig = strokes.find((st) => st.id === repAnchorId);
      if (!orig) continue;
      const ob = getStrokeBBoxHelper(orig);
      if (ob.cx > minX + 12 && ob.cx < maxX - 12 && ob.cy > minY + 12 && ob.cy < maxY - 12) {
        return true;
      }
    }
    for (const st of strokes) {
      if (classifyCircuitStrokeKind(st) === null) continue;
      const ob = getStrokeBBoxHelper(st);
      if (ob.cx > minX + 12 && ob.cx < maxX - 12 && ob.cy > minY + 12 && ob.cy < maxY - 12) {
        return true;
      }
    }
    return false;
  };

  // D1. Hand-drawn Pictorial Battery ('battery'):
  //     Supports:
  //     - 1-stroke stepped battery outline (main rectangle with narrower protruding button cap on left, right, or top),
  //     - 1-stroke OR multi-stroke (2..5 lines) rectangular/cylindrical box + small protruding cap nub,
  //     - Box + '+' / '-' polarity signs or typed '+'/'-'/'1.5V'/'9V' text,
  //     - Box + internal cell-band divider line!
  interface HandBoxCand {
    strokeIds: string[];
    primary: StrokeObject;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    w: number;
    h: number;
    cx: number;
    cy: number;
    isSteppedBattery: boolean;
  }

  const boxCandidates: HandBoxCand[] = [];

  // (a) Single-stroke boxes, cylinders, or stepped battery silhouettes
  for (const bs of strokes) {
    if (consumedStrokeIds.has(bs.id) || classifyCircuitStrokeKind(bs) !== null) continue;
    if (bs.tool === 'highlighter' || bs.points.length < 4) continue;
    const bb = getStrokeBBoxHelper(bs);
    if (bb.w < 22 || bb.h < 14 || bb.w > 225 || bb.h > 165) continue;
    const ratio = bb.w / bb.h;
    if (ratio < 0.30 || ratio > 4.2) continue;
    if (boxEnclosesComponent(bb.minX, bb.minY, bb.maxX, bb.maxY)) continue;

    const isSnappedBox =
      bs.shapeType === 'rectangle' ||
      bs.shapeType === 'parallelogram' ||
      bs.shapeType === 'cuboid' ||
      bs.shapeType === 'cylinder';
    const p0 = bs.points[0];
    const pLast = bs.points[bs.points.length - 1];
    const diag = Math.hypot(bb.w, bb.h);
    const isClosedFreehand =
      !bs.isShape && bs.points.length >= 5 && distance(p0, pLast) <= Math.max(38, diag * 0.50);
    if (!isSnappedBox && !isClosedFreehand) continue;

    // Exclude smooth near-circular loops without corners unless they have stepped battery profile
    let isSteppedBattery = false;
    if (!bs.isShape && bs.points.length >= 7) {
      if (bb.w >= bb.h * 1.05) {
        let lMinY = Infinity, lMaxY = -Infinity;
        let mrMinY = Infinity, mrMaxY = -Infinity;
        let rMinY = Infinity, rMaxY = -Infinity;
        let mlMinY = Infinity, mlMaxY = -Infinity;
        for (const p of bs.points) {
          if (p.x <= bb.minX + bb.w * 0.25) {
            if (p.y < lMinY) lMinY = p.y;
            if (p.y > lMaxY) lMaxY = p.y;
          }
          if (p.x >= bb.minX + bb.w * 0.33 && p.x <= bb.maxX - bb.w * 0.06) {
            if (p.y < mrMinY) mrMinY = p.y;
            if (p.y > mrMaxY) mrMaxY = p.y;
          }
          if (p.x >= bb.maxX - bb.w * 0.25) {
            if (p.y < rMinY) rMinY = p.y;
            if (p.y > rMaxY) rMaxY = p.y;
          }
          if (p.x >= bb.minX + bb.w * 0.06 && p.x <= bb.maxX - bb.w * 0.33) {
            if (p.y < mlMinY) mlMinY = p.y;
            if (p.y > mlMaxY) mlMaxY = p.y;
          }
        }
        const lSpan = Number.isFinite(lMinY) ? lMaxY - lMinY : 0;
        const mrSpan = Number.isFinite(mrMinY) ? mrMaxY - mrMinY : 0;
        const rSpan = Number.isFinite(rMinY) ? rMaxY - rMinY : 0;
        const mlSpan = Number.isFinite(mlMinY) ? mlMaxY - mlMinY : 0;
        if (
          (lSpan >= bb.h * 0.16 && lSpan <= bb.h * 0.76 && mrSpan >= bb.h * 0.85) ||
          (rSpan >= bb.h * 0.16 && rSpan <= bb.h * 0.76 && mlSpan >= bb.h * 0.85)
        ) {
          isSteppedBattery = true;
        }
      } else if (bb.h > bb.w * 1.08) {
        let tMinX = Infinity, tMaxX = -Infinity;
        let mMinX = Infinity, mMaxX = -Infinity;
        let bMinX = Infinity, bMaxX = -Infinity;
        for (const p of bs.points) {
          if (p.y <= bb.minY + bb.h * 0.25) {
            if (p.x < tMinX) tMinX = p.x;
            if (p.x > tMaxX) tMaxX = p.x;
          }
          if (p.y >= bb.minY + bb.h * 0.34 && p.y <= bb.maxY - bb.h * 0.22) {
            if (p.x < mMinX) mMinX = p.x;
            if (p.x > mMaxX) mMaxX = p.x;
          }
          if (p.y >= bb.maxY - bb.h * 0.22) {
            if (p.x < bMinX) bMinX = p.x;
            if (p.x > bMaxX) bMaxX = p.x;
          }
        }
        const tSpan = Number.isFinite(tMinX) ? tMaxX - tMinX : 0;
        const mSpan = Number.isFinite(mMinX) ? mMaxX - mMinX : 0;
        const bSpan = Number.isFinite(bMinX) ? bMaxX - bMinX : 0;
        if (tSpan >= bb.w * 0.16 && tSpan <= bb.w * 0.74 && mSpan >= bb.w * 0.85 && bSpan >= bb.w * 0.76) {
          isSteppedBattery = true;
        }
      }

      if (!isSteppedBattery && Math.abs(bb.w - bb.h) <= Math.max(bb.w, bb.h) * 0.35) {
        const rx = Math.max(10, bb.w / 2);
        const ry = Math.max(10, bb.h / 2);
        let errSum = 0;
        for (const p of bs.points) {
          errSum += Math.abs(Math.hypot((p.x - bb.cx) / rx, (p.y - bb.cy) / ry) - 1);
        }
        // Pure smooth circle (not oblong rectangle/box) -> leave for bulb/circle logic unless it has battery cap/polarity!
        if (errSum / bs.points.length <= 0.14) continue;
      }
    }

    boxCandidates.push({
      strokeIds: [bs.id],
      primary: bs,
      minX: bb.minX,
      minY: bb.minY,
      maxX: bb.maxX,
      maxY: bb.maxY,
      w: bb.w,
      h: bb.h,
      cx: bb.cx,
      cy: bb.cy,
      isSteppedBattery,
    });
  }

  // (b) Multi-stroke (2..5 strokes) hand-drawn boxes (e.g. 4 separate wall lines or 2 L-brackets)
  const wallPool = strokes.filter((s) => {
    if (consumedStrokeIds.has(s.id) || classifyCircuitStrokeKind(s) !== null) return false;
    if (s.tool === 'highlighter' || s.points.length < 2) return false;
    if (s.isShape && s.shapeType !== 'line') return false;
    if (boxCandidates.some((bc) => bc.strokeIds.includes(s.id))) return false;
    const b = getStrokeBBoxHelper(s);
    const d = Math.hypot(b.w, b.h);
    return d >= 12 && d <= 220;
  });
  const wallVisited = new Uint8Array(wallPool.length);
  for (let i = 0; i < wallPool.length; i++) {
    if (wallVisited[i]) continue;
    wallVisited[i] = 1;
    const grp: StrokeObject[] = [wallPool[i]];
    let grew = true;
    while (grew && grp.length < 5) {
      grew = false;
      for (let j = 0; j < wallPool.length; j++) {
        if (wallVisited[j]) continue;
        const cand = wallPool[j];
        const touchesGrp = grp.some((m) => {
          const mp0 = m.points[0];
          const mp1 = m.points[m.points.length - 1];
          const cp0 = cand.points[0];
          const cp1 = cand.points[cand.points.length - 1];
          return (
            distance(mp0, cp0) <= 20 ||
            distance(mp0, cp1) <= 20 ||
            distance(mp1, cp0) <= 20 ||
            distance(mp1, cp1) <= 20
          );
        });
        if (touchesGrp) {
          // Only merge if combined bbox stays compact (<= 220x165)
          let tMinX = Infinity, tMinY = Infinity, tMaxX = -Infinity, tMaxY = -Infinity;
          for (const ms of [...grp, cand]) {
            for (const p of ms.points) {
              if (p.x < tMinX) tMinX = p.x;
              if (p.y < tMinY) tMinY = p.y;
              if (p.x > tMaxX) tMaxX = p.x;
              if (p.y > tMaxY) tMaxY = p.y;
            }
          }
          if (tMaxX - tMinX <= 225 && tMaxY - tMinY <= 165) {
            wallVisited[j] = 1;
            grp.push(cand);
            grew = true;
            if (grp.length >= 5) break;
          }
        }
      }
    }
    if (grp.length >= 2) {
      let gMinX = Infinity, gMinY = Infinity, gMaxX = -Infinity, gMaxY = -Infinity;
      for (const ms of grp) {
        for (const p of ms.points) {
          if (p.x < gMinX) gMinX = p.x;
          if (p.y < gMinY) gMinY = p.y;
          if (p.x > gMaxX) gMaxX = p.x;
          if (p.y > gMaxY) gMaxY = p.y;
        }
      }
      const gw = gMaxX - gMinX;
      const gh = gMaxY - gMinY;
      if (gw >= 34 && gh >= 22 && gw <= 225 && gh <= 165 && !boxEnclosesComponent(gMinX, gMinY, gMaxX, gMaxY)) {
        let totalPts = 0;
        let wallPts = 0;
        let topMinX = Infinity, topMaxX = -Infinity;
        let botMinX = Infinity, botMaxX = -Infinity;
        let leftMinY = Infinity, leftMaxY = -Infinity;
        let rightMinY = Infinity, rightMaxY = -Infinity;
        const tolX = Math.max(6, gw * 0.22);
        const tolY = Math.max(6, gh * 0.22);
        for (const ms of grp) {
          for (const p of ms.points) {
            totalPts++;
            const onTop = p.y <= gMinY + tolY;
            const onBot = p.y >= gMaxY - tolY;
            const onLeft = p.x <= gMinX + tolX;
            const onRight = p.x >= gMaxX - tolX;
            if (onTop || onBot || onLeft || onRight) wallPts++;
            if (onTop) {
              topMinX = Math.min(topMinX, p.x);
              topMaxX = Math.max(topMaxX, p.x);
            }
            if (onBot) {
              botMinX = Math.min(botMinX, p.x);
              botMaxX = Math.max(botMaxX, p.x);
            }
            if (onLeft) {
              leftMinY = Math.min(leftMinY, p.y);
              leftMaxY = Math.max(leftMaxY, p.y);
            }
            if (onRight) {
              rightMinY = Math.min(rightMinY, p.y);
              rightMaxY = Math.max(rightMaxY, p.y);
            }
          }
        }
        const closedWalls =
          totalPts >= 4 &&
          wallPts / totalPts >= 0.80 &&
          topMaxX - topMinX >= gw * 0.55 &&
          botMaxX - botMinX >= gw * 0.55 &&
          leftMaxY - leftMinY >= gh * 0.55 &&
          rightMaxY - rightMinY >= gh * 0.55;
        if (closedWalls) {
          boxCandidates.push({
            strokeIds: grp.map((s) => s.id),
            primary: grp[0],
            minX: gMinX,
            minY: gMinY,
            maxX: gMaxX,
            maxY: gMaxY,
            w: gw,
            h: gh,
            cx: (gMinX + gMaxX) / 2,
            cy: (gMinY + gMaxY) / 2,
            isSteppedBattery: false,
          });
        }
      }
    }
  }

  for (const bc of boxCandidates) {
    if (bc.strokeIds.some((id) => consumedStrokeIds.has(id))) continue;
    const boxIdSet = new Set<string>(bc.strokeIds);

    // 1. Protruding battery cap nub on Left, Right, or Top wall
    const capIds: string[] = [];
    for (const cs of strokes) {
      if (boxIdSet.has(cs.id) || consumedStrokeIds.has(cs.id) || classifyCircuitStrokeKind(cs) !== null) continue;
      if (cs.tool === 'highlighter' || cs.points.length < 2) continue;
      const cb = getStrokeBBoxHelper(cs);
      if (Math.max(cb.w, cb.h) < 3.5) continue;
      if (Math.hypot(cb.w, cb.h) > Math.max(64, Math.max(bc.w, bc.h) * 0.85)) continue;

      // Reject pure straight horizontal/vertical wire leads (e.g. a 2-point straight wire going away from the box)
      if (cs.shapeType === 'line' && cs.points.length === 2 && (cb.h <= 3 || cb.w <= 3) && Math.max(cb.w, cb.h) > 22) {
        continue;
      }

      const isLeftCap =
        cb.minX < bc.minX - 2 &&
        cb.maxX >= bc.minX - 10 &&
        cb.minX <= bc.minX + 10 &&
        cb.w <= Math.max(32, bc.w * 0.42) &&
        cb.h >= bc.h * 0.16 &&
        cb.h <= bc.h * 0.80 &&
        Math.abs(cb.cy - bc.cy) <= bc.h * 0.34 &&
        (cs.points.length >= 3 || cb.h >= 8);
      const isRightCap =
        cb.maxX > bc.maxX + 2 &&
        cb.minX <= bc.maxX + 10 &&
        cb.maxX >= bc.maxX - 10 &&
        cb.w <= Math.max(32, bc.w * 0.42) &&
        cb.h >= bc.h * 0.16 &&
        cb.h <= bc.h * 0.80 &&
        Math.abs(cb.cy - bc.cy) <= bc.h * 0.34 &&
        (cs.points.length >= 3 || cb.h >= 8);
      const isTopCap =
        cb.minY < bc.minY - 2 &&
        cb.maxY >= bc.minY - 10 &&
        cb.minY <= bc.minY + 10 &&
        cb.h <= Math.max(32, bc.h * 0.42) &&
        cb.w >= bc.w * 0.14 &&
        cb.w <= bc.w * 0.76 &&
        Math.abs(cb.cx - bc.cx) <= bc.w * 0.36 &&
        (cs.points.length >= 3 || cb.w >= 8);

      if (isLeftCap || isRightCap || isTopCap) {
        capIds.push(cs.id);
      }
    }

    // 2. '+' / '-' polarity strokes or typed '+'/'-'/'1.5V'/'9V' text near/inside the box
    const signIds: string[] = [];
    let hasPlusSign = false;
    const nearbyShortStrokes = strokes.filter((ss) => {
      if (boxIdSet.has(ss.id) || capIds.includes(ss.id) || consumedStrokeIds.has(ss.id)) return false;
      if (classifyCircuitStrokeKind(ss) !== null || ss.tool === 'highlighter') return false;
      const sb = getStrokeBBoxHelper(ss);
      if (Math.max(sb.w, sb.h) < 3 || Math.max(sb.w, sb.h) > 40) return false;
      return (
        sb.cx >= bc.minX - 46 &&
        sb.cx <= bc.maxX + 46 &&
        sb.cy >= bc.minY - 36 &&
        sb.cy <= bc.maxY + 36
      );
    });
    for (let i = 0; i < nearbyShortStrokes.length; i++) {
      const s1 = nearbyShortStrokes[i];
      const b1 = getStrokeBBoxHelper(s1);
      const isH1 = b1.w >= 3.5 && b1.h <= Math.max(8, b1.w * 0.50);
      const isV1 = b1.h >= 3.5 && b1.w <= Math.max(8, b1.h * 0.50);
      if (isH1) {
        for (let j = 0; j < nearbyShortStrokes.length; j++) {
          if (i === j) continue;
          const s2 = nearbyShortStrokes[j];
          const b2 = getStrokeBBoxHelper(s2);
          const isV2 = b2.h >= 3.5 && b2.w <= Math.max(8, b2.h * 0.50);
          if (isV2 && Math.hypot(b1.cx - b2.cx, b1.cy - b2.cy) <= 14) {
            hasPlusSign = true;
            if (!signIds.includes(s1.id)) signIds.push(s1.id);
            if (!signIds.includes(s2.id)) signIds.push(s2.id);
          }
        }
      } else if (isV1) {
        // handled when paired with horizontal stroke
      }
    }
    if (hasPlusSign || bc.isSteppedBattery || capIds.length > 0) {
      for (const ss of nearbyShortStrokes) {
        if (signIds.includes(ss.id)) continue;
        const sb = getStrokeBBoxHelper(ss);
        if (sb.w >= 3.5 && sb.w <= 30 && sb.h <= Math.max(7, sb.w * 0.45)) {
          signIds.push(ss.id);
        }
      }
    }

    const matchedBatTextIds: string[] = [];
    for (const tx of texts) {
      if (consumedTextIds.has(tx.id)) continue;
      const clean = (tx.text || '').trim();
      if (!/^(\+|-|−|\+\s*\/?\s*-|\d+([.,]\d+)?\s*v|e)$/i.test(clean)) continue;
      const fs = tx.fontSize || 22;
      const tcx = tx.x + fs * 0.4;
      const tcy = tx.y + fs * 0.5;
      if (tcx >= bc.minX - 44 && tcx <= bc.maxX + 44 && tcy >= bc.minY - 36 && tcy <= bc.maxY + 36) {
        matchedBatTextIds.push(tx.id);
      }
    }

    // 3. Internal cell-band divider line across the battery body
    const dividerIds: string[] = [];
    for (const ds of strokes) {
      if (
        boxIdSet.has(ds.id) ||
        capIds.includes(ds.id) ||
        signIds.includes(ds.id) ||
        consumedStrokeIds.has(ds.id) ||
        classifyCircuitStrokeKind(ds) !== null ||
        ds.tool === 'highlighter'
      ) {
        continue;
      }
      const db = getStrokeBBoxHelper(ds);
      if (
        bc.w >= bc.h * 1.12 &&
        db.cx >= bc.minX + bc.w * 0.14 &&
        db.cx <= bc.maxX - bc.w * 0.14 &&
        Math.abs(db.cy - bc.cy) <= bc.h * 0.25 &&
        db.h >= bc.h * 0.62 &&
        db.h <= bc.h * 1.22 &&
        db.w <= Math.max(12, db.h * 0.32)
      ) {
        dividerIds.push(ds.id);
      } else if (
        bc.h > bc.w * 1.12 &&
        db.cy >= bc.minY + bc.h * 0.14 &&
        db.cy <= bc.maxY - bc.h * 0.14 &&
        Math.abs(db.cx - bc.cx) <= bc.w * 0.25 &&
        db.w >= bc.w * 0.62 &&
        db.w <= bc.w * 1.22 &&
        db.h <= Math.max(12, db.w * 0.32)
      ) {
        dividerIds.push(ds.id);
      }
    }

    const allBatInvolved = new Set<string>([
      ...bc.strokeIds,
      ...capIds,
      ...signIds,
      ...dividerIds,
    ]);
    const hasWire = circleTouchesOrCrossesWire(bc.cx, bc.cy, Math.max(bc.w, bc.h) * 0.55, allBatInvolved);
    const isTier1Battery =
      bc.isSteppedBattery ||
      capIds.length > 0 ||
      hasPlusSign ||
      matchedBatTextIds.length > 0 ||
      (dividerIds.length > 0 && (!requireContext || hasWire || hasExistingCircuitCompOnPage));

    if (!isTier1Battery) continue;
    if (
      requireContext &&
      !hasWire &&
      !hasExistingCircuitCompOnPage &&
      !hasPlusSign &&
      matchedBatTextIds.length === 0 &&
      !(bc.isSteppedBattery && capIds.length >= 0) &&
      capIds.length === 0
    ) {
      continue;
    }

    const bw = Math.max(70, Math.min(104, Math.round(Math.max(bc.w, bc.h))));
    const bh = Math.max(40, Math.min(58, Math.round(bw * 0.56)));
    const bx = bc.cx - bw / 2;
    const by = bc.cy - bh / 2;
    const batStrokes = createPhysicsStencilStrokes(
      'battery',
      bx,
      by,
      bw,
      bh,
      bc.primary.color || '#111827',
      bc.primary.layerId || 'layer-1'
    );
    for (const id of allBatInvolved) consumedStrokeIds.add(id);
    for (const tid of matchedBatTextIds) consumedTextIds.add(tid);
    replacements.set(bc.primary.id, batStrokes);
    for (const bs of batStrokes) addedCompStrokeIds.push(bs.id);
  }

  // D2. Hand-drawn Schematic Voltage Source (Long + Short parallel plates, vertical OR horizontal, relaxed hand wobble!)
  const plateBars = strokes.filter((s) => {
    if (consumedStrokeIds.has(s.id) || classifyCircuitStrokeKind(s) !== null) return false;
    if (s.tool === 'highlighter' || s.points.length < 2) return false;
    if (s.isShape && s.shapeType !== 'line') return false;
    const b = getStrokeBBoxHelper(s);
    const isVertPlate = b.h >= 8 && b.h <= 145 && b.w <= Math.max(16, b.h * 0.42);
    const isHorizPlate = b.w >= 8 && b.w <= 145 && b.h <= Math.max(16, b.w * 0.42);
    if (!isVertPlate && !isHorizPlate) return false;
    let pLen = 0;
    for (let i = 1; i < s.points.length; i++) pLen += distance(s.points[i - 1], s.points[i]);
    return distance(s.points[0], s.points[s.points.length - 1]) >= pLen * 0.72;
  });

  for (let i = 0; i < plateBars.length; i++) {
    const a = plateBars[i];
    if (consumedStrokeIds.has(a.id)) continue;
    const ba = getStrokeBBoxHelper(a);
    const aIsVert = ba.h >= ba.w;
    for (let j = i + 1; j < plateBars.length; j++) {
      const b = plateBars[j];
      if (consumedStrokeIds.has(b.id)) continue;
      const bb = getStrokeBBoxHelper(b);
      const bIsVert = bb.h >= bb.w;
      if (aIsVert !== bIsVert) continue;

      const gap = aIsVert ? Math.abs(ba.cx - bb.cx) : Math.abs(ba.cy - bb.cy);
      if (gap < 6 || gap > 52) continue;
      const longBox = (aIsVert ? ba.h >= bb.h : ba.w >= bb.w) ? ba : bb;
      const shortBox = longBox === ba ? bb : ba;
      const longLen = aIsVert ? longBox.h : longBox.w;
      const shortLen = aIsVert ? shortBox.h : shortBox.w;
      if (longLen < 26 || shortLen < 8 || longLen < shortLen * 1.24 || shortLen > longLen * 0.80) continue;
      const alignOff = aIsVert ? Math.abs(ba.cy - bb.cy) : Math.abs(ba.cx - bb.cx);
      if (alignOff > longLen * 0.22) continue;
      // Real voltage-source plates are centered: the long plate extends past BOTH ends of the short plate (rejects 'η' where tops align!)
      const extendsBothEnds = aIsVert
        ? longBox.minY < shortBox.minY - 2.5 && longBox.maxY > shortBox.maxY + 2.5
        : longBox.minX < shortBox.minX - 2.5 && longBox.maxX > shortBox.maxX + 2.5;
      if (!extendsBothEnds) continue;

      // Reject if any stroke bridges across the gap between the two plates (e.g. 'π', 'Π', 'Η', 'η' arch/crossbar!)
      const minPlateCoord = aIsVert ? Math.min(ba.cx, bb.cx) : Math.min(ba.cy, bb.cy);
      const maxPlateCoord = aIsVert ? Math.max(ba.cx, bb.cx) : Math.max(ba.cy, bb.cy);
      const hasBridgingStroke = strokes.some((bs) => {
        if (bs.id === a.id || bs.id === b.id || consumedStrokeIds.has(bs.id)) return false;
        const bsb = getStrokeBBoxHelper(bs);
        if (aIsVert) {
          return (
            bsb.minX <= minPlateCoord + 4 &&
            bsb.maxX >= maxPlateCoord - 4 &&
            bsb.maxY >= Math.min(ba.minY, bb.minY) - 8 &&
            bsb.minY <= Math.max(ba.maxY, bb.maxY) + 8 &&
            bsb.w <= gap + 28
          );
        }
        return (
          bsb.minY <= minPlateCoord + 4 &&
          bsb.maxY >= maxPlateCoord - 4 &&
          bsb.maxX >= Math.min(ba.minX, bb.minX) - 8 &&
          bsb.minX <= Math.max(ba.maxX, bb.maxX) + 8 &&
          bsb.h <= gap + 28
        );
      });
      if (hasBridgingStroke) continue;

      const pairSet = new Set<string>([a.id, b.id]);
      const midX = (ba.cx + bb.cx) / 2;
      const midY = (ba.cy + bb.cy) / 2;
      // Swallow any '+' / '-' short strokes right next to the plates
      for (const ss of strokes) {
        if (pairSet.has(ss.id) || consumedStrokeIds.has(ss.id) || classifyCircuitStrokeKind(ss) !== null) continue;
        const sb = getStrokeBBoxHelper(ss);
        if (Math.max(sb.w, sb.h) <= 28 && Math.hypot(sb.cx - midX, sb.cy - midY) <= 44) {
          pairSet.add(ss.id);
        }
      }
      const touchesWire = circleTouchesOrCrossesWire(midX, midY, gap / 2 + 16, pairSet);
      if (requireContext && !touchesWire && !hasExistingCircuitCompOnPage) continue;

      const vw = 72;
      const vh = Math.max(46, Math.min(72, Math.round(longLen * 1.05)));
      const vx = midX - vw / 2;
      const vy = midY - vh / 2;
      const vsStrokes = createPhysicsStencilStrokes(
        'voltage-source',
        vx,
        vy,
        vw,
        vh,
        a.color || '#111827',
        a.layerId || 'layer-1'
      );
      for (const id of pairSet) consumedStrokeIds.add(id);
      replacements.set(a.id, vsStrokes);
      for (const vs of vsStrokes) addedCompStrokeIds.push(vs.id);
      break;
    }
  }

  // E. Hand-drawn Zig-Zag Resistor ('/\/\/\')
  for (const rs of strokes) {
    if (consumedStrokeIds.has(rs.id) || classifyCircuitStrokeKind(rs) !== null) continue;
    if (rs.isShape || rs.tool === 'highlighter' || rs.points.length < 6) continue;
    const rb = getStrokeBBoxHelper(rs);
    if (rb.w < 24 || rb.w > 185 || rb.h < 10 || rb.h > 95 || rb.w < rb.h * 1.15) continue;
    if (distance(rs.points[0], rs.points[rs.points.length - 1]) < rb.w * 0.48) continue;

    let pathLen = 0;
    let crossings = 0;
    let lastSign = 0;
    const dead = Math.max(2.8, rb.h * 0.16);
    for (let i = 0; i < rs.points.length; i++) {
      if (i > 0) pathLen += distance(rs.points[i - 1], rs.points[i]);
      const dy = rs.points[i].y - rb.cy;
      if (Math.abs(dy) >= dead) {
        const sgn = dy > 0 ? 1 : -1;
        if (lastSign !== 0 && sgn !== lastSign) crossings++;
        lastSign = sgn;
      }
    }
    if (crossings >= 3 && pathLen >= rb.w * 1.55) {
      const inv = new Set<string>([rs.id]);
      const hasWire = circleTouchesOrCrossesWire(rb.cx, rb.cy, rb.w * 0.55, inv);
      if (requireContext && !hasWire && !hasExistingCircuitCompOnPage) continue;
      const rw = Math.max(68, Math.min(92, Math.round(rb.w)));
      const rh = 36;
      const rx = rb.cx - rw / 2;
      const ry = rb.cy - rh / 2;
      const resStroke: StrokeObject = {
        id: `st-${Date.now()}-hres-${Math.random().toString(36).slice(2, 6)}`,
        tool: 'pen',
        color: rs.color || '#111827',
        width: 2.0,
        opacity: 1,
        points: makePolygonBezier([
          { x: rx, y: ry },
          { x: rx + rw, y: ry },
          { x: rx + rw, y: ry + rh },
          { x: rx, y: ry + rh },
        ]),
        layerId: rs.layerId || 'layer-1',
        isShape: true,
        shapeType: 'resistor',
      };
      consumedStrokeIds.add(rs.id);
      replacements.set(rs.id, [resStroke]);
      addedCompStrokeIds.push(resStroke.id);
    }
  }

  // F. Tier-2 Explicit Circuit Intent Fallback (ONLY when user explicitly clicks Sim / Ένωση / Ολοκλήρωση on a Lasso selection!):
  //    If the user sketched a hasty plain rectangular box (as Battery) + circle/load (as Bulb) without '+'/'-' or cap nub,
  //    recognize them cleanly!
  if (explicitCircuitIntent) {
    const hasForceArrow = strokes.some(
      (s) => Boolean(s.arrowEnd || s.shapeType === 'arrow' || s.shapeType === 'spring-pointer')
    );
    const hasSourceAlready =
      strokes.some(
        (s) =>
          !consumedStrokeIds.has(s.id) &&
          (s.shapeType === 'battery' || s.shapeType === 'voltage-source')
      ) ||
      Array.from(replacements.values()).some((arr) =>
        arr.some((s) => s.shapeType === 'battery' || s.shapeType === 'voltage-source')
      );

    if (!hasSourceAlready && !hasForceArrow) {
      const remainingBoxes = boxCandidates
        .filter(
          (bc) =>
            !bc.strokeIds.some((id) => consumedStrokeIds.has(id)) &&
            !boxEnclosesComponent(bc.minX, bc.minY, bc.maxX, bc.maxY) &&
            strokes.length > bc.strokeIds.length
        )
        .sort((a, b) => {
          const scoreA = a.w >= a.h ? 2 : 1;
          const scoreB = b.w >= b.h ? 2 : 1;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return a.w * a.h - b.w * b.h;
        });

      if (remainingBoxes.length > 0) {
        const bc = remainingBoxes[0];
        const bw = Math.max(70, Math.min(104, Math.round(Math.max(bc.w, bc.h))));
        const bh = Math.max(40, Math.min(58, Math.round(bw * 0.56)));
        const batStrokes = createPhysicsStencilStrokes(
          'battery',
          bc.cx - bw / 2,
          bc.cy - bh / 2,
          bw,
          bh,
          bc.primary.color || '#111827',
          bc.primary.layerId || 'layer-1'
        );
        for (const id of bc.strokeIds) consumedStrokeIds.add(id);
        replacements.set(bc.primary.id, batStrokes);
        for (const bs of batStrokes) addedCompStrokeIds.push(bs.id);
      }
    }

    const hasSourceNow =
      strokes.some(
        (s) =>
          !consumedStrokeIds.has(s.id) &&
          (s.shapeType === 'battery' || s.shapeType === 'voltage-source')
      ) ||
      Array.from(replacements.values()).some((arr) =>
        arr.some((s) => s.shapeType === 'battery' || s.shapeType === 'voltage-source')
      );
    const hasLoadOrMeterNow =
      strokes.some((s) => {
        if (consumedStrokeIds.has(s.id)) return false;
        const k = classifyCircuitStrokeKind(s);
        return k !== null && k !== 'battery' && k !== 'voltage-source';
      }) ||
      Array.from(replacements.values()).some((arr) =>
        arr.some((s) => {
          const k = classifyCircuitStrokeKind(s);
          return k !== null && k !== 'battery' && k !== 'voltage-source';
        })
      );

    if (hasSourceNow && !hasLoadOrMeterNow && !hasForceArrow) {
      for (const cs of strokes) {
        if (consumedStrokeIds.has(cs.id) || classifyCircuitStrokeKind(cs) !== null) continue;
        if (cs.tool === 'highlighter' || cs.points.length < 4) continue;
        const cb = getStrokeBBoxHelper(cs);
        if (cb.w < 18 || cb.h < 18 || cb.w > 155 || cb.h > 155) continue;
        if (cb.w / cb.h < 0.52 || cb.w / cb.h > 1.85) continue;
        const p0 = cs.points[0];
        const pN = cs.points[cs.points.length - 1];
        const isCirc =
          cs.shapeType === 'circle' ||
          cs.shapeType === 'ellipse' ||
          (!cs.isShape && cs.points.length >= 6 && distance(p0, pN) <= Math.max(30, Math.hypot(cb.w, cb.h) * 0.45));
        if (!isCirc) continue;
        const bw = 96;
        const bh = 88;
        const bulbStrokes = createPhysicsStencilStrokes(
          'bulb',
          cb.cx - bw / 2,
          cb.cy - bh * 0.848,
          bw,
          bh,
          cs.color || '#111827',
          cs.layerId || 'layer-1'
        );
        consumedStrokeIds.add(cs.id);
        replacements.set(cs.id, bulbStrokes);
        for (const bs of bulbStrokes) addedCompStrokeIds.push(bs.id);
        break;
      }
    }
  }

  // G. Freehand Wire Corner-Splitting & Straightening (when convertFreehandWires === true):
  //    Turns remaining hand-drawn freehand wire strokes (including L-shaped / U-shaped / rectangular wire paths!)
  //    into clean 2-point `shapeType: 'line'` segments so circuit alignment & simulation handle them 100% natively!
  const addedWireStrokeIds: string[] = [];
  const hasAnyCircuitElementNow =
    addedCompStrokeIds.length > 0 || strokes.some((s) => classifyCircuitStrokeKind(s) !== null);

  if (convertFreehandWires && hasAnyCircuitElementNow) {
    for (const ws of strokes) {
      if (consumedStrokeIds.has(ws.id) || classifyCircuitStrokeKind(ws) !== null) continue;
      if (ws.isShape || ws.tool === 'highlighter' || ws.points.length < 2) continue;
      const wb = getStrokeBBoxHelper(ws);
      const diag = Math.hypot(wb.w, wb.h);
      if (diag < 14) continue;

      const simplified = rdpSimplify(ws.points, Math.max(9, diag * 0.062));
      const verts: { x: number; y: number }[] = [];
      for (const pt of simplified) {
        if (verts.length === 0 || distance(verts[verts.length - 1], pt) >= 12) {
          verts.push({ x: pt.x, y: pt.y });
        }
      }
      if (verts.length < 2) {
        const p0 = ws.points[0];
        const pN = ws.points[ws.points.length - 1];
        if (distance(p0, pN) >= 12) {
          verts.length = 0;
          verts.push({ x: p0.x, y: p0.y }, { x: pN.x, y: pN.y });
        }
      }
      if (verts.length < 2) continue;

      // Orthogonalize nearly horizontal/vertical legs (<= 14°) while keeping consecutive vertices welded
      for (let k = 0; k < verts.length - 1; k++) {
        const a = verts[k];
        const b = verts[k + 1];
        const dx = Math.abs(b.x - a.x);
        const dy = Math.abs(b.y - a.y);
        if (dx >= 14 && dy <= dx * 0.25) {
          const avgY = (a.y + b.y) / 2;
          a.y = avgY;
          b.y = avgY;
        } else if (dy >= 14 && dx <= dy * 0.25) {
          const avgX = (a.x + b.x) / 2;
          a.x = avgX;
          b.x = avgX;
        }
      }

      const wireSegStrokes: StrokeObject[] = [];
      for (let k = 0; k < verts.length - 1; k++) {
        const a = verts[k];
        const b = verts[k + 1];
        if (distance(a, b) < 8) continue;
        const wid = `st-${Date.now()}-hw-${k}-${Math.random().toString(36).slice(2, 6)}`;
        wireSegStrokes.push({
          ...ws,
          id: wid,
          isShape: true,
          shapeType: 'line',
          fillStyle: 'none',
          fillColor: undefined,
          keyNodeIndices: undefined,
          points: [
            { x: a.x, y: a.y, pressure: 0.7 },
            {
              x: b.x,
              y: b.y,
              cx: (a.x + b.x) / 2,
              cy: (a.y + b.y) / 2,
              pressure: 0.7,
            },
          ],
        });
        addedWireStrokeIds.push(wid);
      }

      if (wireSegStrokes.length > 0) {
        consumedStrokeIds.add(ws.id);
        replacements.set(ws.id, wireSegStrokes);
      }
    }
  }

  if (consumedStrokeIds.size === 0) {
    return {
      changed: false,
      strokes,
      removedStrokeIds: [],
      addedCompStrokeIds: [],
      addedWireStrokeIds: [],
      removedTextIds: [],
    };
  }

  const nextStrokes: StrokeObject[] = [];
  for (const s of strokes) {
    const rep = replacements.get(s.id);
    if (rep) {
      nextStrokes.push(...rep);
      continue;
    }
    if (consumedStrokeIds.has(s.id)) continue;
    nextStrokes.push(s);
  }

  return {
    changed: true,
    strokes: nextStrokes,
    removedStrokeIds: Array.from(consumedStrokeIds),
    addedCompStrokeIds,
    addedWireStrokeIds,
    removedTextIds: Array.from(consumedTextIds),
  };
}

export function autoAlignAndConnectCircuit(
  strokes: StrokeObject[],
  options?: { recognizeHandDrawn?: boolean }
): StrokeObject[] {
  let currentStrokes = strokes.map((s) => ({
    ...s,
    points: s.points.map((p) => ({ ...p })),
  }));

  // 0a. Only run hand-drawn symbol guessing when explicitly requested by Simulation -> Circuits!
  if (options?.recognizeHandDrawn === true) {
    const handRec = recognizeHandDrawnCircuitSymbols(currentStrokes, [], {
      requireCircuitContext: false,
      explicitCircuitIntent: true,
      convertFreehandWires: true,
    });
    if (handRec.changed) {
      currentStrokes = handRec.strokes;
    }
  }

  // 0. Strip any legacy M-shaped bulb filament strokes ('-bulb-fil' or 5-point bulb filament),
  //    upgrade legacy 4-point diamond fans, and auto-repair any oversized fan/resistor from older conversions!
  currentStrokes = currentStrokes.filter(
    (s) => !(s.id.includes('-bulb-fil') || (s.shapeType === 'bulb' && s.points.length === 5))
  );
  const preComps = getCircuitComponentsWithTerminals(currentStrokes);
  if (preComps.length === 0) return currentStrokes;

  let repairedOversizedComp = false;
  for (const comp of preComps) {
    if (comp.kind === 'fan') {
      const hasModernBlades = currentStrokes.some(
        (s) => comp.strokeIds.includes(s.id) && s.shapeType === 'fan-blade'
      );
      const isOversizedFan = comp.w > 135 || comp.h > 110;
      if (!hasModernBlades || isOversizedFan) {
        if (isOversizedFan) repairedOversizedComp = true;
        const fw = isOversizedFan ? 96 : Math.max(88, Math.min(125, comp.w));
        const fh = isOversizedFan ? 72 : Math.max(68, Math.min(96, Math.round(fw * 0.75)));
        const fx = comp.cx - fw / 2;
        const fy = comp.cy - fh / 2;
        const box = {
          cx: comp.cx,
          termY: comp.cy,
          pictorialW: fw,
          pictorialH: fh,
          schematicW: Math.max(76, Math.min(100, Math.round(fw * 0.88))),
          schematicH: 36,
        };
        const upgradedFan = createPhysicsStencilStrokes(
          'fan',
          fx,
          fy,
          fw,
          fh,
          comp.color,
          comp.layerId
        ).map((s) => ({ ...s, circuitBox: box }));
        const removeSet = new Set(comp.strokeIds);
        const next: StrokeObject[] = [];
        let inserted = false;
        for (const s of currentStrokes) {
          if (removeSet.has(s.id)) {
            if (!inserted) {
              next.push(...upgradedFan);
              inserted = true;
            }
            continue;
          }
          next.push(s);
        }
        currentStrokes = next;
      }
    } else if (comp.kind === 'resistor' && (comp.w > 135 || comp.h > 80)) {
      repairedOversizedComp = true;
      const origStroke = currentStrokes.find((s) => comp.strokeIds.includes(s.id));
      const isFromFan = origStroke?.originalCircuitType === 'fan';
      const rw = isFromFan ? 84 : 74;
      const rh = 36;
      const rx = comp.cx - rw / 2;
      const ry = comp.cy - rh / 2;
      const box = {
        cx: comp.cx,
        termY: comp.cy,
        pictorialW: isFromFan ? 96 : 68,
        pictorialH: isFromFan ? 72 : 88,
        schematicW: rw,
        schematicH: rh,
      };
      const fixedRes: StrokeObject = {
        id: `st-${Date.now()}-res-${Math.random().toString(36).slice(2, 6)}`,
        tool: 'pen',
        color: comp.color,
        width: 2.0,
        opacity: 1,
        points: makePolygonBezier([
          { x: rx, y: ry },
          { x: rx + rw, y: ry },
          { x: rx + rw, y: ry + rh },
          { x: rx, y: ry + rh },
        ]),
        layerId: comp.layerId,
        isShape: true,
        shapeType: 'resistor',
        originalCircuitType: origStroke?.originalCircuitType ?? 'fan',
        circuitBox: box,
      };
      const removeSet = new Set(comp.strokeIds);
      const next: StrokeObject[] = [];
      let inserted = false;
      for (const s of currentStrokes) {
        if (removeSet.has(s.id)) {
          if (!inserted) {
            next.push(fixedRes);
            inserted = true;
          }
          continue;
        }
        next.push(s);
      }
      currentStrokes = next;
    } else if (comp.kind === 'bulb') {
      const hasModernBulb = currentStrokes.some(
        (s) => comp.strokeIds.includes(s.id) && s.id.includes('-bulb-coil')
      );
      if (!hasModernBulb) {
        const bw = comp.w < 84 ? Math.max(96, Math.round(comp.w * 1.5)) : Math.max(92, Math.min(128, comp.w));
        const bh = Math.max(82, Math.min(110, comp.h));
        const bx = comp.cx - bw / 2;
        const by = comp.minY;
        const upgradedBulb = createPhysicsStencilStrokes(
          'bulb',
          bx,
          by,
          bw,
          bh,
          comp.color,
          comp.layerId
        );
        const removeSet = new Set(comp.strokeIds);
        const next: StrokeObject[] = [];
        let inserted = false;
        for (const s of currentStrokes) {
          if (removeSet.has(s.id)) {
            if (!inserted) {
              next.push(...upgradedBulb);
              inserted = true;
            }
            continue;
          }
          next.push(s);
        }
        currentStrokes = next;
      }
    } else if (comp.kind === 'battery') {
      const targetSignY = comp.minY + comp.h * 0.22;
      const idSet = new Set(comp.strokeIds);
      currentStrokes = currentStrokes.map((s) => {
        if (!idSet.has(s.id) || s.points.length !== 2) return s;
        const midY = (s.points[0].y + s.points[1].y) / 2;
        if (Math.abs(midY - comp.cy) <= comp.h * 0.16) {
          const dy = targetSignY - midY;
          return {
            ...s,
            points: s.points.map((pt) => ({
              ...pt,
              y: pt.y + dy,
              cy: pt.cy !== undefined ? pt.cy + dy : undefined,
            })),
          };
        }
        return s;
      });
    } else if (comp.kind === 'ammeter' || comp.kind === 'voltmeter') {
      const rC = comp.circleR ?? Math.max(15, Math.min(comp.w, comp.h) * 0.33);
      const ccx = comp.circleCx ?? comp.cx;
      const ccy = comp.circleCy ?? comp.cy;
      const shaftSt = currentStrokes.find(
        (s) =>
          comp.strokeIds.includes(s.id) &&
          (s.shapeType === 'ammeter-needle' || s.shapeType === 'voltmeter-needle') &&
          s.points.length === 2
      );
      if (shaftSt && distance(shaftSt.points[0], shaftSt.points[1]) < rC * 2.22) {
        const boxW = Math.max(15, rC) / 0.33;
        const boxH = boxW;
        const boxX = ccx - boxW * 0.42;
        const boxY = ccy - boxH * 0.58;
        const upgradedMeter = createPhysicsStencilStrokes(
          comp.kind,
          boxX,
          boxY,
          boxW,
          boxH,
          comp.color,
          comp.layerId
        );
        const removeSet = new Set(comp.strokeIds);
        const next: StrokeObject[] = [];
        let inserted = false;
        for (const s of currentStrokes) {
          if (removeSet.has(s.id)) {
            if (!inserted) {
              next.push(...upgradedMeter);
              inserted = true;
            }
            continue;
          }
          next.push(s);
        }
        currentStrokes = next;
      }
    }
  }

  // 0b. First split any wire that physically passes straight through a circuit component's body
  const allCompStrokeIds = currentStrokes
    .filter(
      (s) =>
        s.shapeType === 'bulb' ||
        s.shapeType === 'battery' ||
        s.shapeType === 'voltage-source' ||
        s.shapeType === 'resistor' ||
        s.shapeType === 'fan' ||
        s.shapeType === 'ammeter' ||
        s.shapeType === 'voltmeter'
    )
    .map((s) => s.id);
  if (allCompStrokeIds.length > 0) {
    currentStrokes = splitWiresUnderCircuitComponent(currentStrokes, allCompStrokeIds);
  }

  const initialComps = getCircuitComponentsWithTerminals(currentStrokes);
  if (initialComps.length === 0) return currentStrokes;

  const compStrokeSet = new Set<string>();
  for (const c of initialComps) {
    for (const id of c.strokeIds) compStrokeSet.add(id);
  }

  // 1. Identify straight wire segments (not belonging to any circuit component)
  interface WireRef {
    strokeIdx: number;
    stroke: StrokeObject;
    orientation: 'h' | 'v' | 'diag';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    avgX: number;
    avgY: number;
  }

  const wireRefs: WireRef[] = [];
  currentStrokes.forEach((s, idx) => {
    if (compStrokeSet.has(s.id)) return;
    if (s.tool === 'highlighter' || s.points.length < 2) return;
    if (!s.isShape || s.shapeType !== 'line') return;
    if (s.arrowStart || s.arrowEnd) return;
    if (s.points[0]?.twist === 999) return;
    for (let k = 0; k < s.points.length - 1; k++) {
      const p0 = s.points[k];
      const p1 = s.points[k + 1];
      const dx = Math.abs(p1.x - p0.x);
      const dy = Math.abs(p1.y - p0.y);
      const len = Math.hypot(dx, dy);
      if (len < 10) continue;
      let orientation: 'h' | 'v' | 'diag' = 'diag';
      if (dy <= Math.max(20, dx * 0.28)) orientation = 'h';
      else if (dx <= Math.max(20, dy * 0.28)) orientation = 'v';
      wireRefs.push({
        strokeIdx: idx,
        stroke: s,
        orientation,
        x1: p0.x,
        y1: p0.y,
        x2: p1.x,
        y2: p1.y,
        avgX: (p0.x + p1.x) / 2,
        avgY: (p0.y + p1.y) / 2,
      });
    }
  });

  if (wireRefs.length === 0) return currentStrokes;

  // 2. Cluster horizontal rows (within 36px) & vertical columns (within 36px)
  const hRows: { yValues: number[]; yRow: number; wireIndices: number[] }[] = [];
  for (let i = 0; i < wireRefs.length; i++) {
    const w = wireRefs[i];
    if (w.orientation !== 'h') continue;
    const row = hRows.find((r) => Math.abs(r.yRow - w.avgY) <= 36);
    if (row) {
      row.yValues.push(w.avgY);
      row.yRow = row.yValues.reduce((a, b) => a + b, 0) / row.yValues.length;
      row.wireIndices.push(i);
    } else {
      hRows.push({ yValues: [w.avgY], yRow: w.avgY, wireIndices: [i] });
    }
  }

  const vCols: { xValues: number[]; xCol: number; wireIndices: number[] }[] = [];
  for (let i = 0; i < wireRefs.length; i++) {
    const w = wireRefs[i];
    if (w.orientation !== 'v') continue;
    const col = vCols.find((c) => Math.abs(c.xCol - w.avgX) <= 36);
    if (col) {
      col.xValues.push(w.avgX);
      col.xCol = col.xValues.reduce((a, b) => a + b, 0) / col.xValues.length;
      col.wireIndices.push(i);
    } else {
      vCols.push({ xValues: [w.avgX], xCol: w.avgX, wireIndices: [i] });
    }
  }

  for (const row of hRows) {
    row.yRow = Math.round(row.yRow);
  }
  vCols.sort((a, b) => a.xCol - b.xCol);
  for (const col of vCols) {
    col.xCol = Math.round(col.xCol);
    for (const wi of col.wireIndices) {
      wireRefs[wi].x1 = col.xCol;
      wireRefs[wi].x2 = col.xCol;
      wireRefs[wi].avgX = col.xCol;
    }
  }

  // 3. Vertically align each horizontal-wired circuit component to its nearest horizontal wire row ONLY if visibly close
  //    (chaining stepped 2-terminal bulb heights left-to-right so any meter/component after a bulb centers dead-on the wire!),
  //    and horizontally align vertical-wired meters to their nearest vertical column!
  const maxRowAlignDist = repairedOversizedComp ? 95 : 42;
  const compsByRowIdx = new Map<number, typeof initialComps>();
  for (const comp of initialComps) {
    if (comp.orientation === 'v') {
      let bestCol: (typeof vCols)[number] | null = null;
      let bestColDist = maxRowAlignDist;
      const refX = comp.circleCx ?? comp.cx;
      for (const col of vCols) {
        const d = Math.abs(col.xCol - refX);
        if (d <= bestColDist) {
          bestColDist = d;
          bestCol = col;
        }
      }
      if (bestCol) {
        const dx = bestCol.xCol - refX;
        if (Math.abs(dx) >= 0.5) {
          const idSet = new Set(comp.strokeIds);
          currentStrokes = currentStrokes.map((s) =>
            !idSet.has(s.id)
              ? s
              : {
                  ...s,
                  points: s.points.map((p) => ({
                    ...p,
                    x: p.x + dx,
                    cx: p.cx !== undefined ? p.cx + dx : undefined,
                  })),
                }
          );
        }
      }
      continue;
    }

    if (comp.kind === 'ammeter' || comp.kind === 'voltmeter') {
      const refX = comp.circleCx ?? comp.cx;
      const refY = comp.circleCy ?? comp.cy;
      let minColDist = Infinity;
      let closestCol: (typeof vCols)[number] | null = null;
      for (const col of vCols) {
        const d = Math.abs(col.xCol - refX);
        if (d < minColDist) {
          minColDist = d;
          closestCol = col;
        }
      }
      const hasVertWiresNearby = wireRefs.some(
        (w) =>
          w.orientation === 'v' &&
          Math.abs(w.avgX - refX) <= Math.max(38, maxRowAlignDist) &&
          Math.min(w.y1, w.y2) <= refY + 50 &&
          Math.max(w.y1, w.y2) >= refY - 50
      );
      const hasRightHWire = wireRefs.some(
        (w) =>
          w.orientation === 'h' &&
          w.avgX > refX + 20 &&
          Math.abs(w.avgY - refY) <= 36
      );
      const isVertBranchMeter =
        Boolean(closestCol && minColDist <= maxRowAlignDist && (hasVertWiresNearby || !hasRightHWire));

      if (isVertBranchMeter && closestCol) {
        comp.orientation = 'v';
        const rC = comp.circleR ?? Math.max(15, Math.min(comp.w, comp.h) * 0.33);
        comp.leftTerm = { x: closestCol.xCol, y: refY - rC };
        comp.rightTerm = { x: closestCol.xCol, y: refY + rC };
        comp.topTerm = { x: closestCol.xCol, y: refY - rC };
        comp.bottomTerm = { x: closestCol.xCol, y: refY + rC };
        const dx = closestCol.xCol - refX;
        if (Math.abs(dx) >= 0.5) {
          const idSet = new Set(comp.strokeIds);
          currentStrokes = currentStrokes.map((s) =>
            !idSet.has(s.id)
              ? s
              : {
                  ...s,
                  points: s.points.map((p) => ({
                    ...p,
                    x: p.x + dx,
                    cx: p.cx !== undefined ? p.cx + dx : undefined,
                  })),
                }
          );
        }
        continue;
      }
    }
    const termY =
      comp.kind === 'ammeter' || comp.kind === 'voltmeter'
        ? (comp.circleCy ?? comp.cy)
        : comp.leftTerm.y;
    let bestRowIdx = -1;
    let bestDist = maxRowAlignDist;
    for (let rIdx = 0; rIdx < hRows.length; rIdx++) {
      const row = hRows[rIdx];
      const d =
        comp.kind === 'bulb'
          ? Math.min(Math.abs(row.yRow - comp.leftTerm.y), Math.abs(row.yRow - comp.rightTerm.y))
          : Math.abs(row.yRow - termY);
      if (d <= bestDist) {
        bestDist = d;
        bestRowIdx = rIdx;
      }
    }
    if (bestRowIdx >= 0) {
      const list = compsByRowIdx.get(bestRowIdx) || [];
      list.push(comp);
      compsByRowIdx.set(bestRowIdx, list);
    }
  }

  for (const [rIdx, list] of compsByRowIdx.entries()) {
    const row = hRows[rIdx];
    list.sort((a, b) => a.cx - b.cx);
    let curWireY = row.yRow;
    const firstBulb = list.find((c) => c.kind === 'bulb');
    if (firstBulb && list[0].key === firstBulb.key) {
      const leftWires = row.wireIndices
        .map((wi) => wireRefs[wi])
        .filter((w) => w.avgX < firstBulb.cx - 4);
      const rightWires = row.wireIndices
        .map((wi) => wireRefs[wi])
        .filter((w) => w.avgX > firstBulb.cx + 4);
      if (leftWires.length > 0 && rightWires.length > 0) {
        const avgLeftY = leftWires.reduce((acc, w) => acc + w.avgY, 0) / leftWires.length;
        const avgRightY = rightWires.reduce((acc, w) => acc + w.avgY, 0) / rightWires.length;
        if (
          Math.abs(avgLeftY - firstBulb.leftTerm.y) <= 4 &&
          Math.abs(avgRightY - firstBulb.rightTerm.y) <= 4
        ) {
          curWireY = Math.round(firstBulb.leftTerm.y);
          row.yRow = curWireY;
        } else {
          curWireY = Math.round(avgLeftY);
          row.yRow = curWireY;
        }
      }
    }

    for (const comp of list) {
      const refY =
        comp.kind === 'ammeter' || comp.kind === 'voltmeter'
          ? (comp.circleCy ?? comp.cy)
          : comp.leftTerm.y;
      const dy = Math.round(curWireY) - refY;
      if (Math.abs(dy) >= 0.5) {
        const idSet = new Set(comp.strokeIds);
        currentStrokes = currentStrokes.map((s) => {
          if (!idSet.has(s.id)) return s;
          return {
            ...s,
            circuitBox: s.circuitBox
              ? { ...s.circuitBox, termY: s.circuitBox.termY + dy }
              : undefined,
            points: s.points.map((p) => ({
              ...p,
              y: p.y + dy,
              cy: p.cy !== undefined ? p.cy + dy : undefined,
            })),
          };
        });
      }
      curWireY += comp.rightTerm.y - comp.leftTerm.y;
    }
  }

  for (const row of hRows) {
    for (const wi of row.wireIndices) {
      wireRefs[wi].y1 = row.yRow;
      wireRefs[wi].y2 = row.yRow;
      wireRefs[wi].avgY = row.yRow;
    }
  }

  const CLOSE_SNAP_TOL = 44;
  const TERM_SNAP_TOL = 56;

  // 3b. Symmetrically center Ammeters & Voltmeters along their horizontal or vertical wire spans
  //     so the circle sits dead-center between its bounding junctions/components!
  const preSymComps = getCircuitComponentsWithTerminals(currentStrokes);
  for (let rIdx = 0; rIdx < hRows.length; rIdx++) {
    const row = hRows[rIdx];
    const yRow = row.yRow;
    const rowComps = preSymComps
      .filter(
        (c) =>
          c.orientation !== 'v' &&
          (Math.abs(c.leftTerm.y - yRow) <= 44 || Math.abs(c.rightTerm.y - yRow) <= 44)
      )
      .sort((a, b) => a.cx - b.cx);
    if (!rowComps.some((c) => c.kind === 'ammeter' || c.kind === 'voltmeter')) continue;

    const activeRowCols = vCols
      .filter((col) =>
        col.wireIndices.some((cwi) => {
          const cw = wireRefs[cwi];
          const minY = Math.min(cw.y1, cw.y2) - CLOSE_SNAP_TOL;
          const maxY = Math.max(cw.y1, cw.y2) + CLOSE_SNAP_TOL;
          return yRow >= minY && yRow <= maxY;
        })
      )
      .sort((a, b) => a.xCol - b.xCol);

    let minRowWireX = Infinity;
    let maxRowWireX = -Infinity;
    for (const wi of row.wireIndices) {
      const w = wireRefs[wi];
      minRowWireX = Math.min(minRowWireX, w.x1, w.x2);
      maxRowWireX = Math.max(maxRowWireX, w.x1, w.x2);
    }

    let idx = 0;
    while (idx < rowComps.length) {
      if (rowComps[idx].kind !== 'ammeter' && rowComps[idx].kind !== 'voltmeter') {
        idx++;
        continue;
      }
      const startIdx = idx;
      while (
        idx + 1 < rowComps.length &&
        (rowComps[idx + 1].kind === 'ammeter' || rowComps[idx + 1].kind === 'voltmeter')
      ) {
        idx++;
      }
      const endIdx = idx;

      const prevCompRight = startIdx > 0 ? rowComps[startIdx - 1].rightTerm.x : undefined;
      const nextCompLeft =
        endIdx < rowComps.length - 1 ? rowComps[endIdx + 1].leftTerm.x : undefined;

      // Also respect any T-junction vertical column (e.g. parallel Voltmeter riser) between neighbors!
      let boundL = prevCompRight;
      for (const col of activeRowCols) {
        if (
          col.xCol <= rowComps[startIdx].leftTerm.x + 6 &&
          (prevCompRight === undefined || col.xCol >= prevCompRight - 4)
        ) {
          boundL = boundL !== undefined ? Math.max(boundL, col.xCol) : col.xCol;
        }
      }
      if (boundL === undefined && Number.isFinite(minRowWireX) && minRowWireX < rowComps[startIdx].leftTerm.x - 8) {
        boundL = minRowWireX;
      }

      let boundR = nextCompLeft;
      for (let ci = activeRowCols.length - 1; ci >= 0; ci--) {
        const col = activeRowCols[ci];
        if (
          col.xCol >= rowComps[endIdx].rightTerm.x - 6 &&
          (nextCompLeft === undefined || col.xCol <= nextCompLeft + 4)
        ) {
          boundR = boundR !== undefined ? Math.min(boundR, col.xCol) : col.xCol;
        }
      }
      if (boundR === undefined && Number.isFinite(maxRowWireX) && maxRowWireX > rowComps[endIdx].rightTerm.x + 8) {
        boundR = maxRowWireX;
      }

      if (boundL !== undefined && boundR !== undefined) {
        const radii: number[] = [];
        let sumDiam = 0;
        for (let j = startIdx; j <= endIdx; j++) {
          const rj =
            rowComps[j].circleR ??
            Math.max(15, (rowComps[j].rightTerm.x - rowComps[j].leftTerm.x) / 2);
          radii.push(rj);
          sumDiam += rj * 2;
        }
        const count = endIdx - startIdx + 1;
        const freeW = boundR - boundL - sumDiam;
        if (freeW >= (count + 1) * 10) {
          const equalGap = freeW / (count + 1);
          let cursorX = boundL;
          for (let j = startIdx; j <= endIdx; j++) {
            const mc = rowComps[j];
            const rj = radii[j - startIdx];
            const oldCx = mc.circleCx ?? mc.cx;
            const oldLeftX = oldCx - rj;
            const oldRightX = oldCx + rj;
            const targetCx = Math.round(cursorX + equalGap + rj);
            cursorX += equalGap + rj * 2;
            const dx = targetCx - oldCx;
            if (Math.abs(dx) >= 0.5) {
              const idSet = new Set(mc.strokeIds);
              currentStrokes = currentStrokes.map((s) =>
                !idSet.has(s.id)
                  ? s
                  : {
                      ...s,
                      points: s.points.map((p) => ({
                        ...p,
                        x: p.x + dx,
                        cx: p.cx !== undefined ? p.cx + dx : undefined,
                      })),
                    }
              );
              const newLeftX = targetCx - rj;
              const newRightX = targetCx + rj;
              for (const wi of row.wireIndices) {
                const w = wireRefs[wi];
                const minW = Math.min(w.x1, w.x2);
                const maxW = Math.max(w.x1, w.x2);
                if (maxW <= oldCx + 2 && Math.abs(maxW - oldLeftX) <= TERM_SNAP_TOL) {
                  if (w.x1 >= w.x2) w.x1 = newLeftX;
                  else w.x2 = newLeftX;
                  w.avgX = (w.x1 + w.x2) / 2;
                } else if (minW >= oldCx - 2 && Math.abs(minW - oldRightX) <= TERM_SNAP_TOL) {
                  if (w.x1 <= w.x2) w.x1 = newRightX;
                  else w.x2 = newRightX;
                  w.avgX = (w.x1 + w.x2) / 2;
                }
              }
            }
          }
        }
      }
      idx++;
    }
  }

  for (let cIdx = 0; cIdx < vCols.length; cIdx++) {
    const col = vCols[cIdx];
    const xCol = col.xCol;
    const colComps = preSymComps
      .filter((c) => c.orientation === 'v' && Math.abs((c.circleCx ?? c.cx) - xCol) <= 38)
      .sort((a, b) => a.cy - b.cy);
    if (!colComps.some((c) => c.kind === 'ammeter' || c.kind === 'voltmeter')) continue;

    const activeColRows = hRows
      .filter((row) =>
        row.wireIndices.some((rwi) => {
          const rw = wireRefs[rwi];
          const minX = Math.min(rw.x1, rw.x2) - CLOSE_SNAP_TOL;
          const maxX = Math.max(rw.x1, rw.x2) + CLOSE_SNAP_TOL;
          return xCol >= minX && xCol <= maxX;
        })
      )
      .sort((a, b) => a.yRow - b.yRow);

    let minColWireY = Infinity;
    let maxColWireY = -Infinity;
    for (const wi of col.wireIndices) {
      const w = wireRefs[wi];
      minColWireY = Math.min(minColWireY, w.y1, w.y2);
      maxColWireY = Math.max(maxColWireY, w.y1, w.y2);
    }

    let idx = 0;
    while (idx < colComps.length) {
      if (colComps[idx].kind !== 'ammeter' && colComps[idx].kind !== 'voltmeter') {
        idx++;
        continue;
      }
      const startIdx = idx;
      while (
        idx + 1 < colComps.length &&
        (colComps[idx + 1].kind === 'ammeter' || colComps[idx + 1].kind === 'voltmeter')
      ) {
        idx++;
      }
      const endIdx = idx;

      const prevCompBot = startIdx > 0 ? colComps[startIdx - 1].rightTerm.y : undefined;
      const nextCompTop =
        endIdx < colComps.length - 1 ? colComps[endIdx + 1].leftTerm.y : undefined;

      let boundT = prevCompBot;
      for (const row of activeColRows) {
        if (
          row.yRow <= colComps[startIdx].leftTerm.y + 6 &&
          (prevCompBot === undefined || row.yRow >= prevCompBot - 4)
        ) {
          boundT = boundT !== undefined ? Math.max(boundT, row.yRow) : row.yRow;
        }
      }
      if (boundT === undefined && Number.isFinite(minColWireY) && minColWireY < colComps[startIdx].leftTerm.y - 8) {
        boundT = minColWireY;
      }

      let boundB = nextCompTop;
      for (let ri = activeColRows.length - 1; ri >= 0; ri--) {
        const row = activeColRows[ri];
        if (
          row.yRow >= colComps[endIdx].rightTerm.y - 6 &&
          (nextCompTop === undefined || row.yRow <= nextCompTop + 4)
        ) {
          boundB = boundB !== undefined ? Math.min(boundB, row.yRow) : row.yRow;
        }
      }
      if (boundB === undefined && Number.isFinite(maxColWireY) && maxColWireY > colComps[endIdx].rightTerm.y + 8) {
        boundB = maxColWireY;
      }

      if (boundT !== undefined && boundB !== undefined) {
        const radii: number[] = [];
        let sumDiam = 0;
        for (let j = startIdx; j <= endIdx; j++) {
          const rj =
            colComps[j].circleR ??
            Math.max(15, (colComps[j].rightTerm.y - colComps[j].leftTerm.y) / 2);
          radii.push(rj);
          sumDiam += rj * 2;
        }
        const count = endIdx - startIdx + 1;
        const freeH = boundB - boundT - sumDiam;
        if (freeH >= (count + 1) * 10) {
          const equalGap = freeH / (count + 1);
          let cursorY = boundT;
          for (let j = startIdx; j <= endIdx; j++) {
            const mc = colComps[j];
            const rj = radii[j - startIdx];
            const oldCy = mc.circleCy ?? mc.cy;
            const oldTopY = oldCy - rj;
            const oldBotY = oldCy + rj;
            const targetCy = Math.round(cursorY + equalGap + rj);
            cursorY += equalGap + rj * 2;
            const dy = targetCy - oldCy;
            if (Math.abs(dy) >= 0.5) {
              const idSet = new Set(mc.strokeIds);
              currentStrokes = currentStrokes.map((s) =>
                !idSet.has(s.id)
                  ? s
                  : {
                      ...s,
                      points: s.points.map((p) => ({
                        ...p,
                        y: p.y + dy,
                        cy: p.cy !== undefined ? p.cy + dy : undefined,
                      })),
                    }
              );
              const newTopY = targetCy - rj;
              const newBotY = targetCy + rj;
              for (const wi of col.wireIndices) {
                const w = wireRefs[wi];
                const minW = Math.min(w.y1, w.y2);
                const maxW = Math.max(w.y1, w.y2);
                if (maxW <= oldCy + 2 && Math.abs(maxW - oldTopY) <= TERM_SNAP_TOL) {
                  if (w.y1 >= w.y2) w.y1 = newTopY;
                  else w.y2 = newTopY;
                  w.avgY = (w.y1 + w.y2) / 2;
                } else if (minW >= oldCy - 2 && Math.abs(minW - oldBotY) <= TERM_SNAP_TOL) {
                  if (w.y1 <= w.y2) w.y1 = newBotY;
                  else w.y2 = newBotY;
                  w.avgY = (w.y1 + w.y2) / 2;
                }
              }
            }
          }
        }
      }
      idx++;
    }
  }

  // Recompute component terminal positions after vertical & symmetric alignment
  const alignedComps = getCircuitComponentsWithTerminals(currentStrokes);

  // 4. Snap horizontal wire endpoints when visibly close to a component terminal or vertical wire,
  //    never snap/merge across a component body, and merge collinear horizontal segments!
  const replacedWireStrokeIds = new Set<string>();
  const newWireStrokes: StrokeObject[] = [];

  const makeCleanWireStroke = (
    templateStroke: StrokeObject,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    suffix: string
  ): StrokeObject => ({
    ...templateStroke,
    id: `st-wire-${Date.now()}-${suffix}-${Math.random().toString(36).slice(2, 6)}`,
    groupId: templateStroke.groupId,
    fillStyle: 'none',
    fillColor: undefined,
    originalCircuitType: undefined,
    circuitBox: undefined,
    isShape: true,
    shapeType: 'line',
    points: [
      { x: Math.round(x1), y: Math.round(y1), pressure: 0.7 },
      {
        x: Math.round(x2),
        y: Math.round(y2),
        cx: Math.round((x1 + x2) / 2),
        cy: Math.round((y1 + y2) / 2),
        pressure: 0.7,
      },
    ],
  });

  for (let rIdx = 0; rIdx < hRows.length; rIdx++) {
    const row = hRows[rIdx];
    const yRow = row.yRow;
    const rowComps = alignedComps
      .filter(
        (c) =>
          c.orientation !== 'v' &&
          (Math.abs(c.leftTerm.y - yRow) <= 44 || Math.abs(c.rightTerm.y - yRow) <= 44)
      )
      .sort((a, b) => a.cx - b.cx);

    // Compute exact wire Y for any horizontal segment [segXL, segXR] along this row,
    // stepping smoothly across 2-terminal bulbs whose rightTerm.y sits at the bottom contact!
    const getRowSegY = (segXL: number, segXR: number): number => {
      const segMidX = (segXL + segXR) / 2;
      let curY = yRow;
      for (const c of rowComps) {
        if (segMidX < c.cx) {
          return Math.round(c.leftTerm.y);
        }
        curY = Math.round(c.rightTerm.y);
      }
      return curY;
    };

    // Identify vertical columns that connect to this row
    const activeRowCols = vCols
      .filter((col) =>
        col.wireIndices.some((cwi) => {
          const cw = wireRefs[cwi];
          const minY = Math.min(cw.y1, cw.y2) - CLOSE_SNAP_TOL;
          const maxY = Math.max(cw.y1, cw.y2) + CLOSE_SNAP_TOL;
          return yRow >= minY && yRow <= maxY;
        })
      )
      .sort((a, b) => a.xCol - b.xCol);

    // Split any raw wire segment that physically crosses over a component on this row
    const rawSegs: { xL: number; xR: number; stroke: StrokeObject }[] = [];
    for (const wi of row.wireIndices) {
      const w = wireRefs[wi];
      replacedWireStrokeIds.add(w.stroke.id);
      let pieces = [{ xL: Math.min(w.x1, w.x2), xR: Math.max(w.x1, w.x2), stroke: w.stroke }];
      for (const c of rowComps) {
        const nextPieces: typeof pieces = [];
        for (const p of pieces) {
          if (p.xL < c.leftTerm.x - 2 && p.xR > c.rightTerm.x + 2) {
            nextPieces.push({ xL: p.xL, xR: c.leftTerm.x, stroke: p.stroke });
            nextPieces.push({ xL: c.rightTerm.x, xR: p.xR, stroke: p.stroke });
          } else {
            nextPieces.push(p);
          }
        }
        pieces = nextPieces;
      }
      rawSegs.push(...pieces);
    }

    const intervals: { xL: number; xR: number; stroke: StrokeObject }[] = [];
    for (const seg of rawSegs) {
      let xL = seg.xL;
      let xR = seg.xR;

      // Trim or snap if wire endpoint overlaps or approaches a component's terminal from outside
      for (const c of rowComps) {
        if (xL >= c.leftTerm.x - 4 && xR <= c.rightTerm.x + 4) {
          xR = xL;
          break;
        }
        if (xL >= c.leftTerm.x - 10 && xL <= c.rightTerm.x + TERM_SNAP_TOL && xR > c.rightTerm.x + 4) {
          const otherCompBetween = rowComps.some(
            (oc) => oc.key !== c.key && oc.cx > c.rightTerm.x && oc.cx < xL
          );
          if (!otherCompBetween) xL = c.rightTerm.x;
        }
        if (xR <= c.rightTerm.x + 10 && xR >= c.leftTerm.x - TERM_SNAP_TOL && xL < c.leftTerm.x - 4) {
          const otherCompBetween = rowComps.some(
            (oc) => oc.key !== c.key && oc.cx > xR && oc.cx < c.leftTerm.x
          );
          if (!otherCompBetween) xR = c.leftTerm.x;
        }
      }
      if (xR - xL < 4) continue;

      // Snap left endpoint xL to a vertical column ONLY if xL is NOT attached to a component's right terminal
      // and no component lies between xL and col.xCol
      const xLAtCompRight = rowComps.some((c) => Math.abs(xL - c.rightTerm.x) <= 14);
      if (!xLAtCompRight) {
        for (const col of activeRowCols) {
          const compBlocking = rowComps.some(
            (c) => c.cx >= Math.min(xL, col.xCol) - 6 && c.cx <= Math.max(xL, col.xCol) + 6
          );
          if (!compBlocking && Math.abs(xL - col.xCol) <= CLOSE_SNAP_TOL) {
            xL = col.xCol;
            break;
          }
        }
      }

      // Snap right endpoint xR to a vertical column ONLY if xR is NOT attached to a component's left terminal
      // and no component lies between xR and col.xCol
      const xRAtCompLeft = rowComps.some((c) => Math.abs(xR - c.leftTerm.x) <= 14);
      if (!xRAtCompLeft) {
        for (const col of activeRowCols) {
          const compBlocking = rowComps.some(
            (c) => c.cx >= Math.min(xR, col.xCol) - 6 && c.cx <= Math.max(xR, col.xCol) + 6
          );
          if (!compBlocking && Math.abs(xR - col.xCol) <= CLOSE_SNAP_TOL) {
            xR = col.xCol;
            break;
          }
        }
      }

      // Trim any dangling outer overhang past the outermost vertical rail on this row (e.g. left corner tail)
      if (activeRowCols.length > 0) {
        const leftRailX = activeRowCols[0].xCol;
        const hasCompLeftOfRail = rowComps.some((c) => c.cx < leftRailX);
        if (
          !hasCompLeftOfRail &&
          xL < leftRailX &&
          xR > leftRailX + 6 &&
          leftRailX - xL <= 150
        ) {
          xL = leftRailX;
        }
        const rightRailX = activeRowCols[activeRowCols.length - 1].xCol;
        const hasCompRightOfRail = rowComps.some((c) => c.cx > rightRailX);
        if (
          !hasCompRightOfRail &&
          xR > rightRailX &&
          xL < rightRailX - 6 &&
          xR - rightRailX <= 150
        ) {
          xR = rightRailX;
        }
      }

      if (xR - xL >= 6) {
        intervals.push({ xL, xR, stroke: seg.stroke });
      }
    }

    // Sort intervals left-to-right and merge collinear segments that touch or have a tiny gap (<= 38px) with no component between them
    intervals.sort((a, b) => a.xL - b.xL);
    const merged: { xL: number; xR: number; stroke: StrokeObject }[] = [];
    for (const seg of intervals) {
      if (merged.length === 0) {
        merged.push({ ...seg });
      } else {
        const prev = merged[merged.length - 1];
        const gap = seg.xL - prev.xR;
        const spanMin = Math.min(prev.xR, seg.xL) - 8;
        const spanMax = Math.max(prev.xR, seg.xL) + 8;
        const compBetween = rowComps.some(
          (c) => c.cx >= spanMin && c.cx <= spanMax
        );
        if (gap <= 38 && !compBetween) {
          prev.xR = Math.max(prev.xR, seg.xR);
          if ((seg.stroke.opacity ?? 1) > (prev.stroke.opacity ?? 1)) {
            prev.stroke = seg.stroke;
          }
        } else {
          merged.push({ ...seg });
        }
      }
    }

    // Re-snap merged interval endpoints to nearby component terminals (<= TERM_SNAP_TOL)
    // and ensure no merged interval overlaps inside [c.leftTerm.x, c.rightTerm.x]
    const finalRowSegments: { xL: number; xR: number; stroke: StrokeObject }[] = [];
    for (let mIdx = 0; mIdx < merged.length; mIdx++) {
      const m = merged[mIdx];
      for (const c of rowComps) {
        if (m.xL >= c.leftTerm.x - 4 && m.xR <= c.rightTerm.x + 4) {
          m.xR = m.xL;
          break;
        }
        const otherBetweenR = rowComps.some(
          (oc) => oc.key !== c.key && oc.cx > c.rightTerm.x && oc.cx < m.xL
        );
        if (
          !otherBetweenR &&
          (Math.abs(m.xL - c.rightTerm.x) <= TERM_SNAP_TOL ||
            (m.xL >= c.leftTerm.x - 4 && m.xL <= c.rightTerm.x)) &&
          m.xR > c.rightTerm.x + 4
        ) {
          m.xL = c.rightTerm.x;
        }
        const otherBetweenL = rowComps.some(
          (oc) => oc.key !== c.key && oc.cx > m.xR && oc.cx < c.leftTerm.x
        );
        if (
          !otherBetweenL &&
          (Math.abs(m.xR - c.leftTerm.x) <= TERM_SNAP_TOL ||
            (m.xR >= c.leftTerm.x && m.xR <= c.rightTerm.x + 4)) &&
          m.xL < c.leftTerm.x - 4
        ) {
          m.xR = c.leftTerm.x;
        }
      }
      if (m.xR - m.xL >= 6) {
        finalRowSegments.push(m);
        const segY = getRowSegY(m.xL, m.xR);
        newWireStrokes.push(
          makeCleanWireStroke(m.stroke, m.xL, segY, m.xR, segY, `h${rIdx}-${mIdx}`)
        );
      }
    }

    // Bridge any small gap where a component's leftTerm or rightTerm sits next to a vertical rail
    // or adjacent component on the same row (especially after shrinking a resistor back to a bulb or repairing an oversized fan!)
    const templateWireStroke =
      finalRowSegments[0]?.stroke || wireRefs[row.wireIndices[0]]?.stroke || currentStrokes[0];
    if (templateWireStroke) {
      const railBridgeTol = repairedOversizedComp ? 380 : 62;
      for (const c of rowComps) {
        for (const col of activeRowCols) {
          const distR = col.xCol - c.rightTerm.x;
          const compBetweenR = rowComps.some(
            (oc) => oc.key !== c.key && oc.cx > c.cx && oc.cx < col.xCol + 6
          );
          if (!compBetweenR && distR > 1 && distR <= railBridgeTol) {
            const alreadyBridged = finalRowSegments.some(
              (m) => m.xL <= c.rightTerm.x + 6 && m.xR >= col.xCol - 6
            );
            if (!alreadyBridged) {
              const br = { xL: c.rightTerm.x, xR: col.xCol, stroke: templateWireStroke };
              finalRowSegments.push(br);
              const segYR = getRowSegY(c.rightTerm.x, col.xCol);
              newWireStrokes.push(
                makeCleanWireStroke(
                  templateWireStroke,
                  c.rightTerm.x,
                  segYR,
                  col.xCol,
                  segYR,
                  `hbr-r-${rIdx}-${c.key}`
                )
              );
            }
          }
          const distL = c.leftTerm.x - col.xCol;
          const compBetweenL = rowComps.some(
            (oc) => oc.key !== c.key && oc.cx < c.cx && oc.cx > col.xCol - 6
          );
          if (!compBetweenL && distL > 1 && distL <= railBridgeTol) {
            const alreadyBridged = finalRowSegments.some(
              (m) => m.xL <= col.xCol + 6 && m.xR >= c.leftTerm.x - 6
            );
            if (!alreadyBridged) {
              const br = { xL: col.xCol, xR: c.leftTerm.x, stroke: templateWireStroke };
              finalRowSegments.push(br);
              const segYL = getRowSegY(col.xCol, c.leftTerm.x);
              newWireStrokes.push(
                makeCleanWireStroke(
                  templateWireStroke,
                  col.xCol,
                  segYL,
                  c.leftTerm.x,
                  segYL,
                  `hbr-l-${rIdx}-${c.key}`
                )
              );
            }
          }
        }
      }

      // Also bridge adjacent components on the same row if their connecting wire was eaten by an oversized component
      // or by resistor->bulb terminal contraction
      const interCompTol = repairedOversizedComp ? 380 : 68;
      for (let ci = 0; ci < rowComps.length - 1; ci++) {
        const cLeft = rowComps[ci];
        const cRight = rowComps[ci + 1];
        const gap = cRight.leftTerm.x - cLeft.rightTerm.x;
        if (gap > 2 && gap <= interCompTol) {
          const alreadyConnected = finalRowSegments.some(
            (m) => m.xL <= cLeft.rightTerm.x + 8 && m.xR >= cRight.leftTerm.x - 8
          );
          if (!alreadyConnected) {
            const segYCC = getRowSegY(cLeft.rightTerm.x, cRight.leftTerm.x);
            newWireStrokes.push(
              makeCleanWireStroke(
                templateWireStroke,
                cLeft.rightTerm.x,
                segYCC,
                cRight.leftTerm.x,
                segYCC,
                `hbr-cc-${rIdx}-${ci}`
              )
            );
          }
        }
      }
    }
  }

  // 5. Snap vertical wire endpoints ONLY when visibly close (<= 44px) to horizontal wire endpoints,
  //    merge collinear vertical segments (gap <= 38px), and split at real T-junctions!
  const hWireSpans: { xL: number; xR: number; y: number }[] = [];
  for (const nw of newWireStrokes) {
    if (nw.points.length >= 2) {
      const p0 = nw.points[0];
      const p1 = nw.points[nw.points.length - 1];
      if (Math.abs(p0.y - p1.y) <= 2) {
        hWireSpans.push({
          xL: Math.min(p0.x, p1.x),
          xR: Math.max(p0.x, p1.x),
          y: Math.round((p0.y + p1.y) / 2),
        });
      }
    }
  }

  for (let cIdx = 0; cIdx < vCols.length; cIdx++) {
    const col = vCols[cIdx];
    const xCol = col.xCol;
    const colComps = alignedComps
      .filter((c) => c.orientation === 'v' && Math.abs(c.cx - xCol) <= 36)
      .sort((a, b) => a.cy - b.cy);
    const vIntervals: { yT: number; yB: number; stroke: StrokeObject }[] = [];

    for (const wi of col.wireIndices) {
      const w = wireRefs[wi];
      replacedWireStrokeIds.add(w.stroke.id);
      let yT = Math.min(w.y1, w.y2);
      let yB = Math.max(w.y1, w.y2);

      for (const hsp of hWireSpans) {
        if (xCol >= hsp.xL - CLOSE_SNAP_TOL && xCol <= hsp.xR + CLOSE_SNAP_TOL) {
          if (Math.abs(yT - hsp.y) <= CLOSE_SNAP_TOL && yB > hsp.y + 8) {
            yT = hsp.y;
          }
          if (Math.abs(yB - hsp.y) <= CLOSE_SNAP_TOL && yT < hsp.y - 8) {
            yB = hsp.y;
          }
        }
      }
      if (yB - yT < 6) continue;
      let pieces = [{ yT, yB, stroke: w.stroke }];
      for (const vc of colComps) {
        const compTop = Math.min(vc.leftTerm.y, vc.rightTerm.y);
        const compBot = Math.max(vc.leftTerm.y, vc.rightTerm.y);
        const nextPieces: typeof pieces = [];
        for (const p of pieces) {
          if (p.yB <= compTop) {
            nextPieces.push(p);
          } else if (p.yT >= compBot) {
            nextPieces.push(p);
          } else {
            if (p.yT < compTop && compTop - p.yT >= 6) {
              nextPieces.push({ yT: p.yT, yB: compTop, stroke: p.stroke });
            }
            if (p.yB > compBot && p.yB - compBot >= 6) {
              nextPieces.push({ yT: compBot, yB: p.yB, stroke: p.stroke });
            }
          }
        }
        pieces = nextPieces;
      }
      vIntervals.push(...pieces);
    }

    vIntervals.sort((a, b) => a.yT - b.yT);
    const mergedV: { yT: number; yB: number; stroke: StrokeObject }[] = [];
    for (const seg of vIntervals) {
      if (mergedV.length === 0) {
        mergedV.push({ ...seg });
      } else {
        const prev = mergedV[mergedV.length - 1];
        const vGapMin = Math.min(prev.yB, seg.yT) - 6;
        const vGapMax = Math.max(prev.yB, seg.yT) + 6;
        const vertCompBetween = colComps.some(
          (vc) => vc.cy >= vGapMin && vc.cy <= vGapMax
        );
        const isSwitchGap = seg.yT - prev.yB >= 14 && seg.yT - prev.yB <= 65;
        if (seg.yT - prev.yB <= 14 && !vertCompBetween) {
          prev.yB = Math.max(prev.yB, seg.yB);
        } else if (seg.yT - prev.yB <= 38 && !vertCompBetween && !isSwitchGap) {
          prev.yB = Math.max(prev.yB, seg.yB);
        } else {
          mergedV.push({ ...seg });
        }
      }
    }

    // For the leftmost vertical conductor (cIdx === 0 or lowest xCol), if there is no explicit switch anywhere in this circuit
    // and no vertical components on this column, ensure the knife switch gap is physically split and preserved!
    const hasAnyExplicitSwitch = alignedComps.some((c) => c.kind === 'switch');
    const isLeftmostCol = cIdx === 0 || xCol <= Math.min(...vCols.map((c) => c.xCol)) + 12;
    if (isLeftmostCol && !hasAnyExplicitSwitch && colComps.length === 0 && mergedV.length > 0) {
      const minY = Math.min(...mergedV.map((v) => v.yT));
      let maxY = Math.max(...mergedV.map((v) => v.yB));

      // Check if there is a bottom horizontal wire at this column that needs to be reached
      const bottomHep = hWireSpans
        .filter((hsp) => xCol >= hsp.xL - CLOSE_SNAP_TOL && xCol <= hsp.xR + CLOSE_SNAP_TOL && hsp.y > minY + 50)
        .sort((a, b) => b.y - a.y)[0];
      if (bottomHep && bottomHep.y > maxY + 30) {
        maxY = bottomHep.y;
      }

      const totalH = maxY - minY;
      if (totalH >= 50) {
        const swYCenter = (minY + maxY) / 2;
        const swHalfGap = Math.min(22, Math.max(16, totalH * 0.18));
        const swYTop = Math.round(swYCenter - swHalfGap);
        const swYBot = Math.round(swYCenter + swHalfGap);
        const nextMergedV: typeof mergedV = [];
        for (const seg of mergedV) {
          if (seg.yB <= swYTop) {
            nextMergedV.push(seg);
          } else if (seg.yT >= swYBot) {
            nextMergedV.push(seg);
          } else {
            if (seg.yT < swYTop && swYTop - seg.yT >= 6) {
              nextMergedV.push({ yT: seg.yT, yB: swYTop, stroke: seg.stroke });
            }
            if (seg.yB > swYBot && seg.yB - swYBot >= 6) {
              nextMergedV.push({ yT: swYBot, yB: seg.yB, stroke: seg.stroke });
            }
          }
        }
        // If there is no lower vertical segment reaching down to maxY, synthesize it so the knife switch has a bottom wire!
        const templateStroke = mergedV[0]?.stroke || currentStrokes[0];
        const hasBottomSeg = nextMergedV.some((seg) => seg.yB >= maxY - 14);
        if (!hasBottomSeg && templateStroke && maxY - swYBot >= 6) {
          nextMergedV.push({ yT: swYBot, yB: maxY, stroke: templateStroke });
        }
        mergedV.length = 0;
        mergedV.push(...nextMergedV);
      }
    }

    for (let mIdx = 0; mIdx < mergedV.length; mIdx++) {
      const mv = mergedV[mIdx];
      const yBreaks: number[] = [mv.yT];
      for (const hsp of hWireSpans) {
        if (
          xCol >= hsp.xL - CLOSE_SNAP_TOL &&
          xCol <= hsp.xR + CLOSE_SNAP_TOL &&
          hsp.y > mv.yT + 10 &&
          hsp.y < mv.yB - 10 &&
          !yBreaks.some((yb) => Math.abs(yb - hsp.y) <= 8)
        ) {
          yBreaks.push(hsp.y);
        }
      }
      yBreaks.push(mv.yB);
      yBreaks.sort((a, b) => a - b);

      for (let k = 0; k < yBreaks.length - 1; k++) {
        if (yBreaks[k + 1] - yBreaks[k] >= 6) {
          newWireStrokes.push(
            makeCleanWireStroke(
              mv.stroke,
              xCol,
              yBreaks[k],
              xCol,
              yBreaks[k + 1],
              `v${cIdx}-${mIdx}-${k}`
            )
          );
        }
      }
    }
  }

  const keptStrokes = currentStrokes.filter((s) => !replacedWireStrokeIds.has(s.id));
  return [...keptStrokes, ...newWireStrokes];
}

export function convertCircuitComponents(
  strokes: StrokeObject[],
  targetStrokeIds?: string[],
  forceMode: 'toggle' | 'schematic' | 'pictorial' = 'toggle'
): { strokes: StrokeObject[]; convertedCount: number; newIds: string[] } {
  const allComps = getCircuitComponentsWithTerminals(strokes);
  const targetSet =
    targetStrokeIds && targetStrokeIds.length > 0 ? new Set(targetStrokeIds) : null;

  const compsToConvert = allComps.filter((c) => {
    if (
      c.kind !== 'battery' &&
      c.kind !== 'voltage-source' &&
      c.kind !== 'bulb' &&
      c.kind !== 'resistor' &&
      c.kind !== 'fan'
    ) {
      return false;
    }
    if (targetSet) {
      return c.strokeIds.some((id) => targetSet.has(id));
    }
    return true;
  });

  if (compsToConvert.length === 0) {
    return { strokes: autoAlignAndConnectCircuit(strokes), convertedCount: 0, newIds: [] };
  }

  let currentStrokes = [...strokes];
  let convertedCount = 0;
  const newIds: string[] = [];

  for (const comp of compsToConvert) {
    const origStroke = currentStrokes.find((s) => comp.strokeIds.includes(s.id));
    let targetKind: 'battery' | 'voltage-source' | 'bulb' | 'resistor' | 'fan' | null = null;
    if (comp.kind === 'battery') {
      if (forceMode === 'toggle' || forceMode === 'schematic') targetKind = 'voltage-source';
    } else if (comp.kind === 'voltage-source') {
      if (forceMode === 'toggle' || forceMode === 'pictorial') targetKind = 'battery';
    } else if (comp.kind === 'bulb' || comp.kind === 'fan') {
      if (forceMode === 'toggle' || forceMode === 'schematic') targetKind = 'resistor';
    } else if (comp.kind === 'resistor') {
      if (forceMode === 'toggle' || forceMode === 'pictorial') {
        targetKind = origStroke?.originalCircuitType === 'fan' ? 'fan' : 'bulb';
      }
    }

    if (!targetKind) continue;
    convertedCount++;

    // Build or reuse invariant circuitBox so repeated toggles NEVER drift in size or position
    const rawBox = origStroke?.circuitBox;
    const isValidBox =
      rawBox &&
      rawBox.pictorialW >= 48 &&
      rawBox.pictorialW <= 165 &&
      rawBox.schematicW >= 48 &&
      rawBox.schematicW <= 165;

    const isFanFamily =
      comp.kind === 'fan' ||
      targetKind === 'fan' ||
      (comp.kind === 'resistor' && origStroke?.originalCircuitType === 'fan');
    const isSourceFamily =
      comp.kind === 'battery' ||
      comp.kind === 'voltage-source' ||
      targetKind === 'battery' ||
      targetKind === 'voltage-source';

    let box: NonNullable<StrokeObject['circuitBox']>;
    if (isValidBox) {
      box = {
        ...rawBox,
        cx: comp.cx,
        termY: comp.leftTerm.y,
      };
    } else if (isFanFamily) {
      const isOversized = comp.w > 135 || comp.h > 110;
      const picW = isOversized ? 96 : Math.max(88, Math.min(120, Math.round(comp.w)));
      const picH = isOversized ? 72 : Math.max(68, Math.min(92, Math.round(picW * 0.75)));
      box = {
        cx: comp.cx,
        termY: comp.leftTerm.y,
        pictorialW: picW,
        pictorialH: picH,
        schematicW: Math.max(76, Math.min(96, Math.round(picW * 0.88))),
        schematicH: 36,
      };
    } else if (isSourceFamily) {
      const picW =
        comp.kind === 'battery'
          ? Math.max(125, Math.min(160, Math.round(comp.w)))
          : Math.max(130, Math.min(155, Math.round(comp.w * 1.12)));
      const picH =
        comp.kind === 'battery'
          ? Math.max(56, Math.min(76, Math.round(comp.h)))
          : Math.max(58, Math.min(72, Math.round(comp.h * 0.92)));
      const schW =
        comp.kind === 'voltage-source'
          ? Math.max(112, Math.min(145, Math.round(comp.w)))
          : Math.max(112, Math.min(140, Math.round(picW * 0.88)));
      const schH =
        comp.kind === 'voltage-source'
          ? Math.max(64, Math.min(82, Math.round(comp.h)))
          : Math.max(64, Math.min(78, Math.round(picH * 1.06)));
      box = {
        cx: comp.cx,
        termY: comp.leftTerm.y,
        pictorialW: picW,
        pictorialH: picH,
        schematicW: schW,
        schematicH: schH,
      };
    } else {
      // Bulb <-> Resistor
      const picW =
        comp.kind === 'bulb'
          ? Math.max(92, Math.min(125, Math.round(comp.w)))
          : Math.max(96, Math.min(115, Math.round(comp.w * 1.32)));
      const picH =
        comp.kind === 'bulb'
          ? Math.max(80, Math.min(108, Math.round(comp.h)))
          : Math.max(84, Math.min(98, Math.round(picW * 0.86)));
      const schW =
        comp.kind === 'resistor' && comp.w <= 110
          ? Math.max(68, Math.min(88, Math.round(comp.w)))
          : Math.max(68, Math.min(84, Math.round(picW * 0.76)));
      box = {
        cx: comp.cx,
        termY: comp.leftTerm.y,
        pictorialW: picW,
        pictorialH: picH,
        schematicW: schW,
        schematicH: 34,
      };
    }

    const compIdSet = new Set(comp.strokeIds);
    const sharedMacroGroupId =
      origStroke?.groupId &&
      currentStrokes.some((st) => !compIdSet.has(st.id) && st.groupId === origStroke.groupId)
        ? origStroke.groupId
        : undefined;

    let replacement: StrokeObject[] = [];
    if (targetKind === 'resistor') {
      const rw = box.schematicW;
      const rh = box.schematicH;
      const rx = box.cx - rw / 2;
      const ry = box.termY - rh / 2;
      const resStroke: StrokeObject = {
        id: `st-${Date.now()}-res-${Math.random().toString(36).slice(2, 6)}`,
        groupId: sharedMacroGroupId,
        tool: 'pen',
        color: comp.color,
        width: 2.0,
        opacity: 1,
        points: makePolygonBezier([
          { x: rx, y: ry },
          { x: rx + rw, y: ry },
          { x: rx + rw, y: ry + rh },
          { x: rx, y: ry + rh },
        ]),
        layerId: comp.layerId,
        isShape: true,
        shapeType: 'resistor',
        originalCircuitType: isFanFamily ? 'fan' : 'bulb',
        circuitBox: box,
      };
      replacement = [resStroke];
    } else if (targetKind === 'fan') {
      const fw = box.pictorialW;
      const fh = box.pictorialH;
      const fx = box.cx - fw / 2;
      const fy = box.termY - fh / 2;
      replacement = createPhysicsStencilStrokes(
        'fan',
        fx,
        fy,
        fw,
        fh,
        comp.color,
        comp.layerId
      ).map((s) => ({
        ...s,
        groupId: sharedMacroGroupId || s.groupId,
        circuitBox: box,
      }));
    } else if (targetKind === 'bulb') {
      const bw = Math.max(92, box.pictorialW);
      const bh = Math.max(80, box.pictorialH);
      const bx = box.cx - bw / 2;
      const by = box.termY - bh * 0.753;
      replacement = createPhysicsStencilStrokes(
        'bulb',
        bx,
        by,
        bw,
        bh,
        comp.color,
        comp.layerId
      ).map((s) => ({
        ...s,
        groupId: sharedMacroGroupId || s.groupId,
        circuitBox: box,
      }));
    } else if (targetKind === 'voltage-source') {
      const vw = box.schematicW;
      const vh = box.schematicH;
      const vx = box.cx - vw / 2;
      const vy = box.termY - vh / 2;
      replacement = createPhysicsStencilStrokes(
        'voltage-source',
        vx,
        vy,
        vw,
        vh,
        comp.color,
        comp.layerId
      ).map((s) => ({
        ...s,
        groupId: sharedMacroGroupId || s.groupId,
        circuitBox: box,
      }));
    } else if (targetKind === 'battery') {
      const batW = box.pictorialW;
      const batH = box.pictorialH;
      const batX = box.cx - batW / 2;
      const batY = box.termY - batH / 2;
      replacement = createPhysicsStencilStrokes(
        'battery',
        batX,
        batY,
        batW,
        batH,
        comp.color,
        comp.layerId
      ).map((s) => ({
        ...s,
        groupId: sharedMacroGroupId || s.groupId,
        circuitBox: box,
      }));
    }

    newIds.push(...replacement.map((s) => s.id));
    const newCompInfo = getCircuitComponentsWithTerminals(replacement)[0];
    const removeSet = new Set(comp.strokeIds);
    const updated: StrokeObject[] = [];
    let inserted = false;
    for (const s of currentStrokes) {
      if (removeSet.has(s.id)) {
        if (!inserted) {
          updated.push(...replacement);
          inserted = true;
        }
        continue;
      }
      // Adjust adjacent horizontal wire endpoints on the same row when converting between stepped Bulb and flat Resistor (or Battery <-> Voltage Source)
      if (
        newCompInfo &&
        classifyCircuitStrokeKind(s) === null &&
        s.points.length === 2 &&
        s.tool !== 'highlighter' &&
        (!s.shapeType || s.shapeType === 'line')
      ) {
        const p0 = s.points[0];
        const p1 = s.points[1];
        const dx = Math.abs(p1.x - p0.x);
        const dy = Math.abs(p1.y - p0.y);
        if (dx >= 10 && dy <= Math.max(18, dx * 0.28)) {
          const avgX = (p0.x + p1.x) / 2;
          const avgY = (p0.y + p1.y) / 2;
          const leftIdx = p0.x <= p1.x ? 0 : 1;
          const rightIdx = leftIdx === 0 ? 1 : 0;
          const wLeft = s.points[leftIdx];
          const wRight = s.points[rightIdx];

          if (
            avgX > comp.cx &&
            Math.abs(avgY - comp.rightTerm.y) <= 34 &&
            Math.abs(wLeft.x - comp.rightTerm.x) <= 68 &&
            wRight.x > newCompInfo.rightTerm.x + 6
          ) {
            const np0 = { ...p0 };
            const np1 = { ...p1 };
            const nLeft = leftIdx === 0 ? np0 : np1;
            const nRight = leftIdx === 0 ? np1 : np0;
            nLeft.x = Math.round(newCompInfo.rightTerm.x);
            nLeft.y = Math.round(newCompInfo.rightTerm.y);
            nRight.y = Math.round(newCompInfo.rightTerm.y);
            np1.cx = (np0.x + np1.x) / 2;
            np1.cy = (np0.y + np1.y) / 2;
            updated.push({ ...s, points: [np0, np1] });
            continue;
          }
          if (
            avgX < comp.cx &&
            Math.abs(avgY - comp.leftTerm.y) <= 34 &&
            Math.abs(wRight.x - comp.leftTerm.x) <= 68 &&
            wLeft.x < newCompInfo.leftTerm.x - 6
          ) {
            const np0 = { ...p0 };
            const np1 = { ...p1 };
            const nLeft = leftIdx === 0 ? np0 : np1;
            const nRight = leftIdx === 0 ? np1 : np0;
            nRight.x = Math.round(newCompInfo.leftTerm.x);
            nRight.y = Math.round(newCompInfo.leftTerm.y);
            nLeft.y = Math.round(newCompInfo.leftTerm.y);
            np1.cx = (np0.x + np1.x) / 2;
            np1.cy = (np0.y + np1.y) / 2;
            updated.push({ ...s, points: [np0, np1] });
            continue;
          }
        }
      }
      updated.push(s);
    }
    currentStrokes = updated;
  }

  // Automatically align & join all circuit wires to the newly converted components!
  currentStrokes = autoAlignAndConnectCircuit(currentStrokes);

  return { strokes: currentStrokes, convertedCount, newIds };
}

export interface SimulatedWireSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  active: boolean;
  inClosedLoop: boolean;
  currentSpeed: number;
  highEnergy: boolean;
  pathPoints?: { x: number; y: number }[];
}

export interface SimulatedComponentState {
  comp: CircuitComponentInfo;
  active: boolean;
  powerFactor: number;
}

export interface AutoVerticalSwitchInfo {
  x: number;
  yCenter: number;
  yTop: number;
  yBottom: number;
  wireIdx: number;
  closed: boolean;
}

export interface CircuitSimulationData {
  hasSource: boolean;
  isCircuitClosed: boolean;
  sourceCount: number;
  wireSegments: SimulatedWireSegment[];
  components: SimulatedComponentState[];
  autoSwitch: AutoVerticalSwitchInfo | null;
}

export function pointToSegmentDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function distanceToComponentSide(
  pt: { x: number; y: number },
  c: CircuitComponentInfo,
  side: 'L' | 'R'
): number {
  if (c.kind === 'battery') {
    if (side === 'L') {
      return pointToSegmentDist(
        pt.x,
        pt.y,
        c.minX - 6,
        c.cy,
        c.minX + c.w * 0.28,
        c.cy
      );
    }
    return pointToSegmentDist(
      pt.x,
      pt.y,
      c.maxX - c.w * 0.22,
      c.cy,
      c.maxX + 6,
      c.cy
    );
  }
  if (c.kind === 'bulb') {
    const yTop = c.minY + c.h * 0.58;
    const yBot = c.maxY + 4;
    if (side === 'L') {
      return Math.min(
        pointToSegmentDist(pt.x, pt.y, c.minX, c.leftTerm.y, c.cx - c.w * 0.1, c.leftTerm.y),
        pointToSegmentDist(pt.x, pt.y, c.cx - c.w * 0.25, yTop, c.cx - c.w * 0.15, yBot),
        Math.hypot(pt.x - c.leftTerm.x, pt.y - c.leftTerm.y)
      );
    }
    return Math.min(
      pointToSegmentDist(pt.x, pt.y, c.cx + c.w * 0.08, c.rightTerm.y, c.maxX, c.rightTerm.y),
      pointToSegmentDist(pt.x, pt.y, c.cx + c.w * 0.25, yTop, c.cx + c.w * 0.15, yBot),
      Math.hypot(pt.x - c.rightTerm.x, pt.y - c.rightTerm.y)
    );
  }
  if (c.kind === 'fan') {
    const rOuter = Math.max(18, Math.min(c.w * 0.36, c.h * 0.45));
    if (side === 'L') {
      return pointToSegmentDist(pt.x, pt.y, c.minX, c.cy, c.cx - rOuter * 0.75, c.cy);
    }
    return pointToSegmentDist(pt.x, pt.y, c.cx + rOuter * 0.75, c.cy, c.maxX, c.cy);
  }
  if (c.kind === 'voltage-source') {
    const plateGap = Math.max(10, Math.min(26, c.w * 0.11));
    if (side === 'L') {
      return pointToSegmentDist(pt.x, pt.y, c.minX, c.cy, c.cx - plateGap / 2, c.cy);
    }
    return pointToSegmentDist(pt.x, pt.y, c.cx + plateGap / 2, c.cy, c.maxX, c.cy);
  }
  if (c.kind === 'switch') {
    const wireY = c.minY + c.h * 0.68;
    if (side === 'L') {
      return pointToSegmentDist(pt.x, pt.y, c.minX, wireY, c.minX + c.w * 0.28, wireY);
    }
    return pointToSegmentDist(pt.x, pt.y, c.minX + c.w * 0.72, wireY, c.maxX, wireY);
  }
  if (c.kind === 'resistor') {
    if (side === 'L') {
      return pointToSegmentDist(pt.x, pt.y, c.minX, c.minY + c.h * 0.15, c.minX, c.maxY - c.h * 0.15);
    }
    return pointToSegmentDist(pt.x, pt.y, c.maxX, c.minY + c.h * 0.15, c.maxX, c.maxY - c.h * 0.15);
  }
  return side === 'L'
    ? Math.hypot(pt.x - c.leftTerm.x, pt.y - c.leftTerm.y)
    : Math.hypot(pt.x - c.rightTerm.x, pt.y - c.rightTerm.y);
}

const circuitSimAnalysisCache = new Map<string, CircuitSimulationData>();

function buildCircuitStrokesSignature(strokes: StrokeObject[], circuitSwitchClosed: boolean): string {
  let sig = circuitSwitchClosed ? "1|" : "0|";
  for (let i = 0; i < strokes.length; i++) {
    const s = strokes[i];
    const pts = s.points;
    const n = pts.length;
    const p0 = n > 0 ? pts[0] : null;
    const pMid = n > 2 ? pts[n >> 1] : null;
    const pLast = n > 1 ? pts[n - 1] : p0;
    sig += `${s.id}:${s.shapeType || ""}:${n}:${p0 ? `${Math.round(p0.x * 2)},${Math.round(p0.y * 2)}` : ""}:${pMid ? `${Math.round(pMid.x * 2)},${Math.round(pMid.y * 2)}` : ""}:${pLast ? `${Math.round(pLast.x * 2)},${Math.round(pLast.y * 2)}` : ""};`;
  }
  return sig;
}

export function analyzeCircuitForSimulation(
  strokes: StrokeObject[],
  circuitSwitchClosed = true
): CircuitSimulationData {
  const cacheKey = buildCircuitStrokesSignature(strokes, circuitSwitchClosed);
  const cached = circuitSimAnalysisCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const result = analyzeCircuitForSimulationUncached(strokes, circuitSwitchClosed);
  if (circuitSimAnalysisCache.size >= 48) {
    const firstKey = circuitSimAnalysisCache.keys().next().value;
    if (firstKey !== undefined) circuitSimAnalysisCache.delete(firstKey);
  }
  circuitSimAnalysisCache.set(cacheKey, result);
  return result;
}

function analyzeCircuitForSimulationUncached(
  strokes: StrokeObject[],
  circuitSwitchClosed = true
): CircuitSimulationData {
  const comps = getCircuitComponentsWithTerminals(strokes);
  const compStrokeSet = new Set<string>();
  for (const c of comps) {
    for (const id of c.strokeIds) compStrokeSet.add(id);
  }

  const rawWires: { x1: number; y1: number; x2: number; y2: number; length: number }[] = [];
  for (const s of strokes) {
    if (compStrokeSet.has(s.id)) continue;
    if (s.tool === 'highlighter' || s.points.length < 2) continue;
    if (s.fillStyle && s.fillStyle !== 'none') continue;
    if (s.points[0]?.twist === 999) continue;
    if (!s.isShape || s.shapeType !== 'line') continue;
    if (s.arrowStart || s.arrowEnd) continue;

    for (let i = 0; i < s.points.length - 1; i++) {
      const a = s.points[i];
      const b = s.points[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len >= 6) {
        rawWires.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, length: len });
      }
    }
  }

  const splitPointsForWire: { x: number; y: number }[][] = rawWires.map(() => []);
  const allInterestPts: { x: number; y: number }[] = [];
  for (const w of rawWires) {
    allInterestPts.push({ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 });
  }
  for (const c of comps) {
    allInterestPts.push(
      c.leftTerm,
      c.rightTerm,
      { x: c.minX, y: c.leftTerm.y },
      { x: c.maxX, y: c.rightTerm.y }
    );
  }

  // 1a. Split wires where another wire's endpoint or component terminal touches the wire's interior (T-junction)
  const TJUNCTION_TOL = 40;
  for (let i = 0; i < rawWires.length; i++) {
    const w = rawWires[i];
    const dx = w.x2 - w.x1;
    const dy = w.y2 - w.y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 100) continue;
    for (const pt of allInterestPts) {
      const t = ((pt.x - w.x1) * dx + (pt.y - w.y1) * dy) / lenSq;
      if (t > 0.04 && t < 0.96) {
        const projX = w.x1 + t * dx;
        const projY = w.y1 + t * dy;
        if (Math.hypot(pt.x - projX, pt.y - projY) <= TJUNCTION_TOL) {
          splitPointsForWire[i].push({ x: projX, y: projY });
        }
      }
    }
  }

  // 1b. Also split wires at wire-wire crossings (e.g. L-corners where both wires slightly overhang past the corner)
  for (let i = 0; i < rawWires.length; i++) {
    const a = rawWires[i];
    const dax = a.x2 - a.x1;
    const day = a.y2 - a.y1;
    for (let j = i + 1; j < rawWires.length; j++) {
      const b = rawWires[j];
      const dbx = b.x2 - b.x1;
      const dby = b.y2 - b.y1;
      const denom = dax * dby - day * dbx;
      if (Math.abs(denom) < 1e-4) continue;
      const t = ((b.x1 - a.x1) * dby - (b.y1 - a.y1) * dbx) / denom;
      const u = ((b.x1 - a.x1) * day - (b.y1 - a.y1) * dax) / denom;
      if (t >= -0.05 && t <= 1.05 && u >= -0.05 && u <= 1.05) {
        const tc = Math.max(0, Math.min(1, t));
        const uc = Math.max(0, Math.min(1, u));
        const ix = a.x1 + tc * dax;
        const iy = a.y1 + tc * day;
        if (tc > 0.04 && tc < 0.96) {
          splitPointsForWire[i].push({ x: ix, y: iy });
        }
        if (uc > 0.04 && uc < 0.96) {
          splitPointsForWire[j].push({ x: ix, y: iy });
        }
      }
    }
  }

  const wires: { x1: number; y1: number; x2: number; y2: number; length: number }[] = [];
  for (let i = 0; i < rawWires.length; i++) {
    const w = rawWires[i];
    const splits = splitPointsForWire[i];
    if (splits.length === 0) {
      wires.push(w);
      continue;
    }
    const dx = w.x2 - w.x1;
    const dy = w.y2 - w.y1;
    const lenSq = dx * dx + dy * dy;
    const sorted = [
      { x: w.x1, y: w.y1, t: 0 },
      ...splits.map((p) => ({
        x: p.x,
        y: p.y,
        t: ((p.x - w.x1) * dx + (p.y - w.y1) * dy) / lenSq,
      })),
      { x: w.x2, y: w.y2, t: 1 },
    ].sort((a, b) => a.t - b.t);

    for (let k = 0; k < sorted.length - 1; k++) {
      const a = sorted[k];
      const b = sorted[k + 1];
      const segLen = Math.hypot(b.x - a.x, b.y - a.y);
      if (segLen >= 6) {
        wires.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, length: segLen });
      }
    }
  }

  // Create dedicated terminal nodes for each component first so leftTerm and rightTerm NEVER merge into the same node!
  const nodeCenters: { x: number; y: number; compKey?: string; side?: 'L' | 'R' }[] = [];
  const compNodes = comps.map((c) => {
    const u = nodeCenters.length;
    nodeCenters.push({ x: c.leftTerm.x, y: c.leftTerm.y, compKey: c.key, side: 'L' });
    const v = nodeCenters.length;
    nodeCenters.push({ x: c.rightTerm.x, y: c.rightTerm.y, compKey: c.key, side: 'R' });
    return { comp: c, u, v };
  });

  // Strict proximity tolerances so ONLY visibly close lines (<= 42px) form a closed circuit!
  const TERM_SNAP_TOL = 42;
  const WIRE_JOIN_TOL = 40;

  const resolveWireEndpointNode = (
    pt: { x: number; y: number },
    otherEnd: { x: number; y: number }
  ): number => {
    // 1. Check if wire endpoint is connecting to a component terminal zone
    let bestTermNode = -1;
    let bestTermDist = TERM_SNAP_TOL;
    for (const cn of compNodes) {
      const c = cn.comp;
      const dL = distanceToComponentSide(pt, c, 'L');
      const dR = distanceToComponentSide(pt, c, 'R');
      if (c.orientation === 'v') {
        const rHalf = (c.circleR ?? c.h * 0.35) * 0.5;
        if (dL <= dR && dL <= bestTermDist && otherEnd.y <= c.cy + rHalf) {
          bestTermDist = dL;
          bestTermNode = cn.u;
        } else if (dR < dL && dR <= bestTermDist && otherEnd.y >= c.cy - rHalf) {
          bestTermDist = dR;
          bestTermNode = cn.v;
        } else if (dL <= bestTermDist && dL <= dR) {
          bestTermDist = dL;
          bestTermNode = cn.u;
        } else if (dR <= bestTermDist && dR < dL) {
          bestTermDist = dR;
          bestTermNode = cn.v;
        }
        continue;
      }
      if (dL <= dR && dL <= bestTermDist && otherEnd.x <= c.cx + c.w * 0.25) {
        bestTermDist = dL;
        bestTermNode = cn.u;
      } else if (dR < dL && dR <= bestTermDist && otherEnd.x >= c.cx - c.w * 0.25) {
        bestTermDist = dR;
        bestTermNode = cn.v;
      } else if (dL <= bestTermDist && dL <= dR) {
        bestTermDist = dL;
        bestTermNode = cn.u;
      } else if (dR <= bestTermDist && dR < dL) {
        bestTermDist = dR;
        bestTermNode = cn.v;
      }
    }
    if (bestTermNode >= 0) return bestTermNode;

    // 2. Otherwise match existing non-component wire junction node within WIRE_JOIN_TOL
    let bestWireNode = -1;
    let bestWireDist = WIRE_JOIN_TOL;
    for (let i = 0; i < nodeCenters.length; i++) {
      if (nodeCenters[i].compKey) continue;
      const d = Math.hypot(pt.x - nodeCenters[i].x, pt.y - nodeCenters[i].y);
      if (d <= bestWireDist) {
        bestWireDist = d;
        bestWireNode = i;
      }
    }
    if (bestWireNode >= 0) return bestWireNode;

    nodeCenters.push({ x: pt.x, y: pt.y });
    return nodeCenters.length - 1;
  };

  const sources = comps.filter((c) => c.kind === 'battery' || c.kind === 'voltage-source');
  const loadCompsList = comps.filter(
    (c) => c.kind === 'bulb' || c.kind === 'resistor' || c.kind === 'fan'
  );
  const hasSource = sources.length > 0;
  const openSwitches = comps.filter((c) => c.kind === 'switch' && c.switchClosed === false);

  const wireNodes = wires.map((w, idx) => ({
    idx,
    w,
    u: resolveWireEndpointNode({ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }),
    v: resolveWireEndpointNode({ x: w.x2, y: w.y2 }, { x: w.x1, y: w.y1 }),
  }));

  interface GraphEdge {
    to: number;
    type: 'wire' | 'load' | 'closed-switch';
    wireIdx?: number;
    compKey?: string;
    resistance: number;
    forwardFromU: boolean;
  }

  const adj: GraphEdge[][] = Array.from({ length: nodeCenters.length }, () => []);
  for (const wn of wireNodes) {
    if (wn.u === wn.v) continue;
    adj[wn.u].push({
      to: wn.v,
      type: 'wire',
      wireIdx: wn.idx,
      resistance: 0.25,
      forwardFromU: true,
    });
    adj[wn.v].push({
      to: wn.u,
      type: 'wire',
      wireIdx: wn.idx,
      resistance: 0.25,
      forwardFromU: false,
    });
  }

  // Detect if there is a vertical gap on the left conductor (Auto-Switch Gap between two collinear vertical wire segments)
  let autoSwitchGap: {
    uTop: number;
    vBot: number;
    x: number;
    yTop: number;
    yBottom: number;
    yCenter: number;
    topWireIdx: number;
    botWireIdx: number;
  } | null = null;

  if (openSwitches.length === 0 && !comps.some((c) => c.kind === 'switch')) {
    let bestX = Infinity;
    for (let i = 0; i < wireNodes.length; i++) {
      const wi = wireNodes[i].w;
      const dxi = Math.abs(wi.x2 - wi.x1);
      const dyi = Math.abs(wi.y2 - wi.y1);
      if (dyi < 10 || dxi > 14) continue;
      const xColI = (wi.x1 + wi.x2) / 2;
      const yMinI = Math.min(wi.y1, wi.y2);
      const yMaxI = Math.max(wi.y1, wi.y2);

      for (let j = 0; j < wireNodes.length; j++) {
        if (i === j) continue;
        const wj = wireNodes[j].w;
        const dxj = Math.abs(wj.x2 - wj.x1);
        const dyj = Math.abs(wj.y2 - wj.y1);
        if (dyj < 10 || dxj > 14) continue;
        const xColJ = (wj.x1 + wj.x2) / 2;
        if (Math.abs(xColI - xColJ) > 14) continue;

        const yMinJ = Math.min(wj.y1, wj.y2);
        const yMaxJ = Math.max(wj.y1, wj.y2);

        if (yMinJ > yMaxI && yMinJ - yMaxI >= 14 && yMinJ - yMaxI <= 65) {
          const compInGap = comps.some(
            (c) =>
              Math.abs(c.cx - xColI) <= 32 &&
              c.cy >= yMaxI - 10 &&
              c.cy <= yMinJ + 10
          );
          if (!compInGap && xColI < bestX) {
            bestX = xColI;
            const nodeTop =
              Math.abs(wi.y1 - yMaxI) < Math.abs(wi.y2 - yMaxI)
                ? wireNodes[i].u
                : wireNodes[i].v;
            const nodeBot =
              Math.abs(wj.y1 - yMinJ) < Math.abs(wj.y2 - yMinJ)
                ? wireNodes[j].u
                : wireNodes[j].v;
            autoSwitchGap = {
              uTop: nodeTop,
              vBot: nodeBot,
              x: Math.round((xColI + xColJ) / 2),
              yTop: yMaxI,
              yBottom: yMinJ,
              yCenter: Math.round((yMaxI + yMinJ) / 2),
              topWireIdx: i,
              botWireIdx: j,
            };
          }
        }
      }
    }
  }

  // If autoSwitchGap exists and circuitSwitchClosed is TRUE, bridge the switch gap with a virtual switch edge in adj!
  if (autoSwitchGap && circuitSwitchClosed) {
    adj[autoSwitchGap.uTop].push({
      to: autoSwitchGap.vBot,
      type: 'closed-switch',
      resistance: 0.02,
      forwardFromU: true,
    });
    adj[autoSwitchGap.vBot].push({
      to: autoSwitchGap.uTop,
      type: 'closed-switch',
      resistance: 0.02,
      forwardFromU: false,
    });
  }

  for (const cn of compNodes) {
    if (
      cn.comp.kind === 'battery' ||
      cn.comp.kind === 'voltage-source' ||
      cn.comp.kind === 'voltmeter'
    ) {
      // Sources are handled separately, and ideal Voltmeters have infinite internal resistance (zero loop current through a voltmeter)!
      continue;
    }
    if (cn.comp.kind === 'switch' || cn.comp.kind === 'ammeter') {
      if (cn.comp.kind === 'switch' && cn.comp.switchClosed === false) continue;
      adj[cn.u].push({
        to: cn.v,
        type: 'closed-switch',
        compKey: cn.comp.key,
        resistance: 0.02,
        forwardFromU: true,
      });
      adj[cn.v].push({
        to: cn.u,
        type: 'closed-switch',
        compKey: cn.comp.key,
        resistance: 0.02,
        forwardFromU: false,
      });
    } else {
      adj[cn.u].push({
        to: cn.v,
        type: 'load',
        compKey: cn.comp.key,
        resistance: 1.0,
        forwardFromU: true,
      });
      adj[cn.v].push({
        to: cn.u,
        type: 'load',
        compKey: cn.comp.key,
        resistance: 1.0,
        forwardFromU: false,
      });
    }
  }

  if (sources.length > 1) {
    for (let i = 1; i < compNodes.length; i++) {
      const cn = compNodes[i];
      if (cn.comp.kind === 'battery' || cn.comp.kind === 'voltage-source') {
        adj[cn.u].push({
          to: cn.v,
          type: 'closed-switch',
          compKey: cn.comp.key,
          resistance: 0.02,
          forwardFromU: true,
        });
        adj[cn.v].push({
          to: cn.u,
          type: 'closed-switch',
          compKey: cn.comp.key,
          resistance: 0.02,
          forwardFromU: false,
        });
      }
    }
  }

  // Step 1: Identify all edges and nodes that belong to a genuine complete closed loop
  // starting at Source (+) and returning to Source (-), including parallel pure-wire branches without loads!
  const wireInLoop = new Uint8Array(wires.length);
  const compInLoop = new Set<string>();
  const nodeInLoop = new Uint8Array(nodeCenters.length);
  let anyClosedLoop = false;

  if (hasSource && openSwitches.length === 0) {
    const primarySourceNode = compNodes.find(
      (cn) => cn.comp.kind === 'battery' || cn.comp.kind === 'voltage-source'
    )!;
    const startNode = primarySourceNode.u;
    const targetNodes = new Set<number>([primarySourceNode.v]);
    for (const cn of compNodes) {
      if (cn.comp.kind === 'battery' || cn.comp.kind === 'voltage-source') {
        targetNodes.add(cn.v);
      }
    }

    const visited = new Uint8Array(nodeCenters.length);
    const pathNodes: number[] = [startNode];
    const pathEdges: GraphEdge[] = [];
    let dfsSteps = 0;
    const MAX_DFS_STEPS = 2048;

    const dfs = (curr: number, depth: number) => {
      if (depth > 28 || dfsSteps > MAX_DFS_STEPS) return;
      dfsSteps++;
      if (targetNodes.has(curr) && pathEdges.length >= 1) {
        anyClosedLoop = true;
        for (const nIdx of pathNodes) nodeInLoop[nIdx] = 1;
        for (const edge of pathEdges) {
          if (edge.wireIdx !== undefined) wireInLoop[edge.wireIdx] = 1;
          if (edge.compKey) compInLoop.add(edge.compKey);
        }
        return;
      }

      visited[curr] = 1;
      for (const edge of adj[curr]) {
        if (!visited[edge.to]) {
          pathNodes.push(edge.to);
          pathEdges.push(edge);
          dfs(edge.to, depth + 1);
          pathEdges.pop();
          pathNodes.pop();
        }
      }
      visited[curr] = 0;
    };

    dfs(startNode, 0);
  }

  // Step 2: Solve exact physical Kirchhoff Nodal Potentials (V_i in [0, 1]) on the closed-loop subgraph!
  // Source (+) is fixed at V = 1.0, Source (-) is fixed at V = 0.0.
  // Because current I = g * (V_u - V_v) is derived from a single-valued node potential V,
  // current is 100% guaranteed to flow in ONE consistent direction around every branch & corner!
  const wireFlowSum = new Float64Array(wires.length);
  const wireHighEnergy = new Array<boolean>(wires.length).fill(false);
  const compPowerMap = new Map<string, number>();
  const compSignedFlowMap = new Map<string, number>();
  const V = new Float64Array(nodeCenters.length).fill(0.5);

  if (anyClosedLoop) {
    const primarySourceNode = compNodes.find(
      (cn) => cn.comp.kind === 'battery' || cn.comp.kind === 'voltage-source'
    )!;
    const isFixed = new Uint8Array(nodeCenters.length);
    V[primarySourceNode.u] = 1.0;
    isFixed[primarySourceNode.u] = 1;
    V[primarySourceNode.v] = 0.0;
    isFixed[primarySourceNode.v] = 1;

    for (let iter = 0; iter < 240; iter++) {
      let maxDelta = 0;
      for (let u = 0; u < nodeCenters.length; u++) {
        if (isFixed[u] || !nodeInLoop[u]) continue;
        let sumGV = 0;
        let sumG = 0;
        for (const edge of adj[u]) {
          if (!nodeInLoop[edge.to]) continue;
          if (edge.wireIdx !== undefined && !wireInLoop[edge.wireIdx]) continue;
          if (edge.compKey && !compInLoop.has(edge.compKey)) continue;
          const g = 1.0 / Math.max(0.01, edge.resistance);
          sumGV += g * V[edge.to];
          sumG += g;
        }
        if (sumG > 0) {
          const nextVu = sumGV / sumG;
          const d = Math.abs(nextVu - V[u]);
          if (d > maxDelta) maxDelta = d;
          V[u] = nextVu;
        }
      }
      if (iter >= 4 && maxDelta < 1e-5) break;
    }

    const voltageBoost = Math.min(2.2, 1 + (sources.length - 1) * 0.45);

    for (const wn of wireNodes) {
      if (!wireInLoop[wn.idx] || wn.u === wn.v) continue;
      const dV = V[wn.u] - V[wn.v];
      // Physical branch current I = dV / R_wire (R_wire = 0.25 -> g = 4.0) so series wires & loads share identical current!
      const physCurrent = dV / 0.25;
      const sign = dV >= 0 ? 1 : -1;
      const mag =
        Math.abs(physCurrent) > 1e-5
          ? Math.max(0.75, Math.min(1.6, Math.abs(physCurrent) * 2.2 * voltageBoost))
          : 0.75;
      wireFlowSum[wn.idx] = sign * mag;
      wireHighEnergy[wn.idx] = (V[wn.u] + V[wn.v]) / 2 >= 0.5;
    }

    for (const cn of compNodes) {
      if (!compInLoop.has(cn.comp.key)) continue;
      const dV = V[cn.u] - V[cn.v];
      const rComp = cn.comp.kind === 'switch' || cn.comp.kind === 'ammeter' ? 0.02 : 1.0;
      const physCurrent = dV / rComp;
      const flowMag =
        Math.abs(physCurrent) > 1e-5
          ? Math.max(0.75, Math.min(1.6, Math.abs(physCurrent) * 2.2 * voltageBoost))
          : 0.75;
      const pwr =
        cn.comp.kind === 'ammeter'
          ? Math.abs(physCurrent) > 1e-4
            ? Math.max(0.55, Math.min(1.8, Math.abs(physCurrent) * 1.8 * voltageBoost))
            : 0
          : Math.max(0.5, Math.min(1.8, Math.abs(dV) * 1.15 * voltageBoost));
      compPowerMap.set(cn.comp.key, pwr);
      compSignedFlowMap.set(cn.comp.key, (dV >= 0 ? 1 : -1) * flowMag);
    }
  }

  // Detect the Left Vertical Conductor for the automatic interactive switch!
  let autoSwitch: AutoVerticalSwitchInfo | null = null;
  if (autoSwitchGap) {
    autoSwitch = {
      x: autoSwitchGap.x,
      yCenter: autoSwitchGap.yCenter,
      yTop: autoSwitchGap.yTop,
      yBottom: autoSwitchGap.yBottom,
      wireIdx: -1,
      closed: circuitSwitchClosed,
    };
  } else if (anyClosedLoop && wires.length > 0) {
    let minCircuitX = Infinity;
    let maxCircuitX = -Infinity;
    for (let i = 0; i < wires.length; i++) {
      if (!wireInLoop[i]) continue;
      const w = wires[i];
      minCircuitX = Math.min(minCircuitX, w.x1, w.x2);
      maxCircuitX = Math.max(maxCircuitX, w.x1, w.x2);
    }
    const circuitSpanW = Math.max(100, maxCircuitX - minCircuitX);
    const sourceY = sources.length > 0 ? sources[0].cy : Infinity;

    let bestLeftVertIdx = -1;
    let bestScore = Infinity;
    for (let i = 0; i < wires.length; i++) {
      if (!wireInLoop[i]) continue;
      const w = wires[i];
      const dx = Math.abs(w.x2 - w.x1);
      const dy = Math.abs(w.y2 - w.y1);
      if (dy < 42 || dx > dy * 0.4) continue;
      const midX = (w.x1 + w.x2) / 2;
      const midY = (w.y1 + w.y2) / 2;
      if (midX > minCircuitX + circuitSpanW * 0.42) continue;
      const score = (midX - minCircuitX) * 3 + Math.abs(midY - sourceY) * 0.5;
      if (score < bestScore) {
        bestScore = score;
        bestLeftVertIdx = i;
      }
    }

    if (bestLeftVertIdx >= 0) {
      const swWire = wires[bestLeftVertIdx];
      const x = (swWire.x1 + swWire.x2) / 2;
      const yCenter = (swWire.y1 + swWire.y2) / 2;
      const halfGap = Math.min(21, Math.max(14, swWire.length * 0.22));
      autoSwitch = {
        x,
        yCenter,
        yTop: yCenter - halfGap,
        yBottom: yCenter + halfGap,
        wireIdx: bestLeftVertIdx,
        closed: circuitSwitchClosed,
      };
    }
  }

  const simulatedWires: SimulatedWireSegment[] = wires.map((w, idx) => {
    const flow = wireFlowSum[idx];
    const inClosedLoop = Boolean(wireInLoop[idx]) && Math.abs(flow) > 0.01;
    const active = circuitSwitchClosed && inClosedLoop;
    const speed = Math.min(2.2, Math.max(0.4, Math.abs(flow)));

    // Extend wire endpoints that connect to a Battery, Voltage Source, Fan, or Switch right up to the inner element
    // so electrons flow seamlessly across the component's horizontal black leads with 100% uniform spacing!
    let wx1 = w.x1;
    let wy1 = w.y1;
    let wx2 = w.x2;
    let wy2 = w.y2;
    const wn = wireNodes[idx];
    if (inClosedLoop && Math.abs(w.y2 - w.y1) <= Math.abs(w.x2 - w.x1) * 0.35) {
      for (const cn of compNodes) {
        const c = cn.comp;
        if (c.kind === 'battery') {
          const batCapLeftX = c.minX + c.w * 0.16;
          const batBodyRightX = c.maxX - c.w * 0.16;
          if (wn.u === cn.u && wx1 < batCapLeftX && wx2 < wx1) wx1 = batCapLeftX;
          else if (wn.v === cn.u && wx2 < batCapLeftX && wx1 < wx2) wx2 = batCapLeftX;
          if (wn.u === cn.v && wx1 > batBodyRightX && wx2 > wx1) wx1 = batBodyRightX;
          else if (wn.v === cn.v && wx2 > batBodyRightX && wx1 > wx2) wx2 = batBodyRightX;
        } else if (c.kind === 'voltage-source') {
          const plateGap = Math.max(10, Math.min(26, c.w * 0.11));
          const plusPlateX = c.cx - plateGap / 2;
          const minusPlateX = c.cx + plateGap / 2;
          if (wn.u === cn.u && wx1 < plusPlateX && wx2 < wx1) wx1 = plusPlateX;
          else if (wn.v === cn.u && wx2 < plusPlateX && wx1 < wx2) wx2 = plusPlateX;
          if (wn.u === cn.v && wx1 > minusPlateX && wx2 > wx1) wx1 = minusPlateX;
          else if (wn.v === cn.v && wx2 > minusPlateX && wx1 > wx2) wx2 = minusPlateX;
        } else if (c.kind === 'fan') {
          const rOuter = Math.max(20, Math.min(c.w * 0.36, c.h * 0.45));
          const fanLeftEdgeX = c.cx - rOuter;
          const fanRightEdgeX = c.cx + rOuter;
          if (wn.u === cn.u && wx1 < fanLeftEdgeX && wx2 < wx1) wx1 = fanLeftEdgeX;
          else if (wn.v === cn.u && wx2 < fanLeftEdgeX && wx1 < wx2) wx2 = fanLeftEdgeX;
          if (wn.u === cn.v && wx1 > fanRightEdgeX && wx2 > wx1) wx1 = fanRightEdgeX;
          else if (wn.v === cn.v && wx2 > fanRightEdgeX && wx1 > wx2) wx2 = fanRightEdgeX;
        } else if (c.kind === 'switch') {
          const swLeftX = c.minX + c.w * 0.26;
          const swRightX = c.minX + c.w * 0.74;
          if (wn.u === cn.u && wx1 < swLeftX && wx2 < wx1) wx1 = swLeftX;
          else if (wn.v === cn.u && wx2 < swLeftX && wx1 < wx2) wx2 = swLeftX;
          if (wn.u === cn.v && wx1 > swRightX && wx2 > wx1) wx1 = swRightX;
          else if (wn.v === cn.v && wx2 > swRightX && wx1 > wx2) wx2 = swRightX;
        } else if (c.kind === 'bulb') {
          const domeRx = Math.max(14, Math.min(c.w * 0.27, c.h * 0.34));
          const baseRx = Math.max(8, domeRx * 0.52);
          const sideTermX = c.cx - baseRx * 0.96;
          const botRightX = c.cx + baseRx * 0.42;
          if (
            (wn.u === cn.u || wn.v === cn.u) &&
            Math.max(wx1, wx2) <= c.cx &&
            Math.abs(wy1 - c.leftTerm.y) <= 22 &&
            Math.abs(wy2 - c.leftTerm.y) <= 22
          ) {
            wy1 = c.leftTerm.y;
            wy2 = c.leftTerm.y;
            if (wn.u === cn.u && wx1 < sideTermX && wx2 < wx1) wx1 = sideTermX;
            else if (wn.v === cn.u && wx2 < sideTermX && wx1 < wx2) wx2 = sideTermX;
          }
          if (
            (wn.u === cn.v || wn.v === cn.v) &&
            Math.min(wx1, wx2) >= c.cx &&
            Math.abs(wy1 - c.rightTerm.y) <= 22 &&
            Math.abs(wy2 - c.rightTerm.y) <= 22
          ) {
            wy1 = c.rightTerm.y;
            wy2 = c.rightTerm.y;
            if (wn.u === cn.v && wx1 > botRightX && wx2 > wx1) wx1 = botRightX;
            else if (wn.v === cn.v && wx2 > botRightX && wx1 > wx2) wx2 = botRightX;
          }
        } else if (c.kind === 'resistor') {
          if (
            (wn.u === cn.u || wn.v === cn.u) &&
            Math.max(wx1, wx2) <= c.cx &&
            Math.abs(wy1 - c.cy) <= 22 &&
            Math.abs(wy2 - c.cy) <= 22
          ) {
            wy1 = c.cy;
            wy2 = c.cy;
            if (wn.u === cn.u && wx2 < wx1) wx1 = c.minX;
            else if (wn.v === cn.u && wx1 < wx2) wx2 = c.minX;
          }
          if (
            (wn.u === cn.v || wn.v === cn.v) &&
            Math.min(wx1, wx2) >= c.cx &&
            Math.abs(wy1 - c.cy) <= 22 &&
            Math.abs(wy2 - c.cy) <= 22
          ) {
            wy1 = c.cy;
            wy2 = c.cy;
            if (wn.u === cn.v && wx2 > wx1) wx1 = c.maxX;
            else if (wn.v === cn.v && wx1 > wx2) wx2 = c.maxX;
          }
        }
      }
    }
    const adjLen = Math.hypot(wx2 - wx1, wy2 - wy1);

    if (flow >= 0) {
      return {
        x1: wx1,
        y1: wy1,
        x2: wx2,
        y2: wy2,
        length: adjLen,
        inClosedLoop,
        active,
        currentSpeed: active ? speed : 0,
        highEnergy: wireHighEnergy[idx],
      };
    } else {
      return {
        x1: wx2,
        y1: wy2,
        x2: wx1,
        y2: wy1,
        length: adjLen,
        inClosedLoop,
        active,
        currentSpeed: active ? speed : 0,
        highEnergy: wireHighEnergy[idx],
      };
    }
  });

  // Also add the built-in horizontal lead wires of active Fan, Voltage-Source, Resistor, Battery, and Switch components
  // so electrons flow all the way across Resistors, next to the Fan circle, and next to the Voltage Source plates with zero gaps!
  if (anyClosedLoop) {
    // First ensure any horizontal wire segment on the left or right of an active bulb aligns strictly to leftTerm.y / rightTerm.y
    // BEFORE adding component lead segments and merging contiguous horizontal segments!
    const activeBulbs = comps.filter((c) => c.kind === 'bulb' && compInLoop.has(c.key));
    if (activeBulbs.length > 0) {
      for (const sw of simulatedWires) {
        if (!sw.inClosedLoop || sw.pathPoints) continue;
        const dx = sw.x2 - sw.x1;
        const dy = sw.y2 - sw.y1;
        if (Math.abs(dy) > Math.abs(dx) * 0.35 || Math.abs(dx) < 4) continue;
        const avgY = (sw.y1 + sw.y2) / 2;
        const minX = Math.min(sw.x1, sw.x2);
        const maxX = Math.max(sw.x1, sw.x2);
        for (const b of activeBulbs) {
          const domeRx = Math.max(14, Math.min(b.w * 0.27, b.h * 0.34));
          const baseRx = Math.max(8, domeRx * 0.52);
          const sideTermX = b.cx - baseRx * 0.96;
          const botTargetX = b.cx + baseRx * 0.42;
          const nearBulbRow =
            Math.abs(avgY - b.leftTerm.y) <= 32 || Math.abs(avgY - b.rightTerm.y) <= 32;
          if (!nearBulbRow) continue;
          if (maxX <= b.cx + 6) {
            sw.y1 = b.leftTerm.y;
            sw.y2 = b.leftTerm.y;
            if (sw.x1 > sideTermX && sw.x2 < sw.x1) sw.x1 = sideTermX;
            if (sw.x2 > sideTermX && sw.x1 < sw.x2) sw.x2 = sideTermX;
            sw.length = Math.max(1, Math.hypot(sw.x2 - sw.x1, sw.y2 - sw.y1));
          } else if (minX >= b.cx - 6) {
            sw.y1 = b.rightTerm.y;
            sw.y2 = b.rightTerm.y;
            if (sw.x1 < botTargetX && sw.x2 > sw.x1) sw.x1 = botTargetX;
            if (sw.x2 < botTargetX && sw.x1 > sw.x2) sw.x2 = botTargetX;
            sw.length = Math.max(1, Math.hypot(sw.x2 - sw.x1, sw.y2 - sw.y1));
          }
        }
      }
    }

    const addComponentLeadSegment = (
      lx1: number,
      ly1: number,
      lx2: number,
      ly2: number,
      signedFlow: number
    ) => {
      const len = Math.hypot(lx2 - lx1, ly2 - ly1);
      if (len < 8) return;
      const midX = (lx1 + lx2) / 2;
      const midY = (ly1 + ly2) / 2;
      // Avoid duplicating if a wire segment already covers this exact midpoint
      const alreadyCovered = simulatedWires.some(
        (sw) =>
          sw.inClosedLoop &&
          pointToSegmentDist(midX, midY, sw.x1, sw.y1, sw.x2, sw.y2) <= 8
      );
      if (alreadyCovered) return;
      const active = circuitSwitchClosed;
      const speed = Math.min(2.2, Math.max(0.4, Math.abs(signedFlow)));
      if (signedFlow >= 0) {
        simulatedWires.push({
          x1: lx1,
          y1: ly1,
          x2: lx2,
          y2: ly2,
          length: len,
          inClosedLoop: true,
          active,
          currentSpeed: active ? speed : 0,
          highEnergy: true,
        });
      } else {
        simulatedWires.push({
          x1: lx2,
          y1: ly2,
          x2: lx1,
          y2: ly1,
          length: len,
          inClosedLoop: true,
          active,
          currentSpeed: active ? speed : 0,
          highEnergy: true,
        });
      }
    };

      const activeLoopSpeeds = simulatedWires
        .filter((sw) => sw.inClosedLoop && sw.currentSpeed > 0.01)
        .map((sw) => sw.currentSpeed);
      const defaultLoopSpeed =
        activeLoopSpeeds.length > 0
          ? activeLoopSpeeds.reduce((a, b) => a + b, 0) / activeLoopSpeeds.length
          : 0.95;

      for (const cn of compNodes) {
      const c = cn.comp;
      if (c.kind === 'resistor' && compInLoop.has(c.key)) {
        const flow = compSignedFlowMap.get(c.key) ?? defaultLoopSpeed;
        const resStroke = strokes.find(
          (s) => c.strokeIds.includes(s.id) && s.shapeType === 'resistor'
        );
        let zigPts: { x: number; y: number }[];
        if (resStroke && resStroke.points.length >= 4) {
          zigPts = computeResistorOrSpringPoints('resistor', resStroke.points).map((p) => ({
            x: p.x,
            y: p.y,
          }));
        } else {
          const uStart = 0.12;
          const uEnd = 0.88;
          const numPeaks = 10;
          zigPts = [
            { x: c.minX, y: c.cy },
            { x: c.minX + uStart * c.w, y: c.cy },
          ];
          for (let k = 0; k < numPeaks; k++) {
            const u = uStart + ((k + 0.5) / numPeaks) * (uEnd - uStart);
            const vy = k % 2 === 0 ? c.minY + 0.04 * c.h : c.minY + 0.96 * c.h;
            zigPts.push({ x: c.minX + u * c.w, y: vy });
          }
          zigPts.push({ x: c.minX + uEnd * c.w, y: c.cy });
          zigPts.push({ x: c.maxX, y: c.cy });
        }
        if (zigPts.length >= 4) {
          if (zigPts[0].x > zigPts[zigPts.length - 1].x) {
            zigPts.reverse();
          }
          zigPts[0].y = c.cy;
          zigPts[1].y = c.cy;
          zigPts[zigPts.length - 2].y = c.cy;
          zigPts[zigPts.length - 1].y = c.cy;
        }
        const orderedZigPts = flow >= 0 ? zigPts : [...zigPts].reverse();
        let totalZigLen = 0;
        for (let k = 0; k < orderedZigPts.length - 1; k++) {
          totalZigLen += Math.hypot(
            orderedZigPts[k + 1].x - orderedZigPts[k].x,
            orderedZigPts[k + 1].y - orderedZigPts[k].y
          );
        }
        const active = circuitSwitchClosed;
        const speed = Math.min(2.2, Math.max(0.4, Math.abs(flow)));
        simulatedWires.push({
          x1: orderedZigPts[0].x,
          y1: orderedZigPts[0].y,
          x2: orderedZigPts[orderedZigPts.length - 1].x,
          y2: orderedZigPts[orderedZigPts.length - 1].y,
          length: Math.max(12, totalZigLen),
          inClosedLoop: true,
          active,
          currentSpeed: active ? speed : 0,
          highEnergy: true,
          pathPoints: orderedZigPts,
        });
      } else if (c.kind === 'fan' && compInLoop.has(c.key)) {
        const rOuter = Math.max(20, Math.min(c.w * 0.36, c.h * 0.45));
        const flow = compSignedFlowMap.get(c.key) ?? defaultLoopSpeed;
        addComponentLeadSegment(c.minX, c.cy, c.cx - rOuter, c.cy, flow);
        addComponentLeadSegment(c.cx + rOuter, c.cy, c.maxX, c.cy, flow);
      } else if (c.kind === 'voltage-source') {
        const plateGap = Math.max(10, Math.min(26, c.w * 0.11));
        // Conventional current leaves (+) on the left (cx - plateGap/2 -> minX) and enters (-) on the right (maxX -> cx + plateGap/2)
        addComponentLeadSegment(c.cx - plateGap / 2, c.cy, c.minX, c.cy, defaultLoopSpeed);
        addComponentLeadSegment(c.maxX, c.cy, c.cx + plateGap / 2, c.cy, defaultLoopSpeed);
      } else if (c.kind === 'battery') {
        const batCapLeftX = c.minX + c.w * 0.16;
        const batBodyRightX = c.maxX - c.w * 0.16;
        addComponentLeadSegment(batCapLeftX, c.cy, c.minX, c.cy, defaultLoopSpeed);
        addComponentLeadSegment(c.maxX, c.cy, batBodyRightX, c.cy, defaultLoopSpeed);
      } else if (c.kind === 'switch' && compInLoop.has(c.key)) {
        const wireY = c.minY + c.h * 0.68;
        const flow = compSignedFlowMap.get(c.key) ?? defaultLoopSpeed;
        addComponentLeadSegment(c.minX, wireY, c.minX + c.w * 0.26, wireY, flow);
        addComponentLeadSegment(c.minX + c.w * 0.74, wireY, c.maxX, wireY, flow);
      } else if (c.kind === 'bulb' && compInLoop.has(c.key)) {
        const flow = compSignedFlowMap.get(c.key) ?? defaultLoopSpeed;
        const domeRx = Math.max(14, Math.min(c.w * 0.27, c.h * 0.34));
        const domeRy = Math.max(14, c.h * 0.33);
        const domeCy = c.minY + domeRy + c.h * 0.02;
        const baseRx = Math.max(8, domeRx * 0.52);
        const sideTermX = c.cx - baseRx * 0.96;
        const botTargetX = c.cx + baseRx * 0.42;
        const filY = domeCy - domeRy * 0.02;
        const coilHalfW = Math.max(7, domeRx * 0.34);
        const filLeftX = c.cx - coilHalfW;
        const filRightX = c.cx + coilHalfW;

        // External horizontal leads (merge seamlessly with left & right stepped horizontal circuit wires)
        addComponentLeadSegment(c.minX, c.leftTerm.y, sideTermX, c.leftTerm.y, flow);
        addComponentLeadSegment(botTargetX, c.rightTerm.y, c.maxX, c.rightTerm.y, flow);

        // Internal path through the 2 terminals & filament (up left lead -> across filament -> down right lead)
        const rawBulbPath = [
          { x: sideTermX, y: c.leftTerm.y },
          { x: filLeftX, y: filY },
          { x: filRightX, y: filY },
          { x: botTargetX, y: c.rightTerm.y },
        ];
        const orderedPath = flow >= 0 ? rawBulbPath : [...rawBulbPath].reverse();
        let totalInnerLen = 0;
        for (let k = 0; k < orderedPath.length - 1; k++) {
          totalInnerLen += Math.hypot(
            orderedPath[k + 1].x - orderedPath[k].x,
            orderedPath[k + 1].y - orderedPath[k].y
          );
        }
        const active = circuitSwitchClosed;
        const speed = Math.min(2.2, Math.max(0.4, Math.abs(flow)));
        simulatedWires.push({
          x1: orderedPath[0].x,
          y1: orderedPath[0].y,
          x2: orderedPath[orderedPath.length - 1].x,
          y2: orderedPath[orderedPath.length - 1].y,
          length: totalInnerLen,
          inClosedLoop: true,
          active,
          currentSpeed: active ? speed : 0,
          highEnergy: true,
          pathPoints: orderedPath,
        });
      }
    }

    if (autoSwitchGap && circuitSwitchClosed) {
      const topFlow = wireFlowSum[autoSwitchGap.topWireIdx];
      const botFlow = wireFlowSum[autoSwitchGap.botWireIdx];
      const effFlow = Math.abs(topFlow) > 0.01 ? topFlow : botFlow;
      const bladeSpeed = Math.min(2.2, Math.max(0.4, Math.abs(effFlow) || 1.0));
      const dVBlade = V[autoSwitchGap.uTop] - V[autoSwitchGap.vBot];
      const fromTopToBot = dVBlade >= 0;
      simulatedWires.push({
        x1: autoSwitchGap.x,
        y1: fromTopToBot ? autoSwitchGap.yTop : autoSwitchGap.yBottom,
        x2: autoSwitchGap.x,
        y2: fromTopToBot ? autoSwitchGap.yBottom : autoSwitchGap.yTop,
        length: Math.abs(autoSwitchGap.yBottom - autoSwitchGap.yTop),
        inClosedLoop: true,
        active: true,
        currentSpeed: bladeSpeed,
        highEnergy: (V[autoSwitchGap.uTop] + V[autoSwitchGap.vBot]) / 2 >= 0.5,
      });
    }

    // Merge contiguous collinear horizontal segments that touch/overlap along the same row and flow in the same direction
    // so electrons march at a 100% uniform 32px spacing across wires, fan leads, and source leads!
    const activeResistors = comps.filter((c) => c.kind === 'resistor' && compInLoop.has(c.key));
    let mergedAny = true;
    while (mergedAny) {
      mergedAny = false;
      for (let i = 0; i < simulatedWires.length; i++) {
        const a = simulatedWires[i];
        if (!a.inClosedLoop || a.pathPoints) continue;
        const dax = a.x2 - a.x1;
        const day = a.y2 - a.y1;
        if (Math.abs(day) > Math.abs(dax) * 0.2 || Math.abs(dax) < 4) continue;
        const dirA = dax >= 0 ? 1 : -1;
        const yA = (a.y1 + a.y2) / 2;
        const minAx = Math.min(a.x1, a.x2);
        const maxAx = Math.max(a.x1, a.x2);

        for (let j = i + 1; j < simulatedWires.length; j++) {
          const b = simulatedWires[j];
          if (!b.inClosedLoop || b.pathPoints) continue;
          const dbx = b.x2 - b.x1;
          const dby = b.y2 - b.y1;
          if (Math.abs(dby) > Math.abs(dbx) * 0.2 || Math.abs(dbx) < 4) continue;
          const dirB = dbx >= 0 ? 1 : -1;
          if (dirA !== dirB) continue;
          const yB = (b.y1 + b.y2) / 2;
          if (Math.abs(yA - yB) > 8) continue;

          const minBx = Math.min(b.x1, b.x2);
          const maxBx = Math.max(b.x1, b.x2);
          const crossesBulb = activeBulbs.some(
            (bulb) =>
              Math.min(minAx, minBx) < bulb.cx - 4 &&
              Math.max(maxAx, maxBx) > bulb.cx + 4 &&
              (Math.abs(yA - bulb.leftTerm.y) <= 26 || Math.abs(yA - bulb.rightTerm.y) <= 26)
          );
          if (crossesBulb) continue;
          const crossesResistor = activeResistors.some(
            (res) =>
              Math.min(minAx, minBx) < res.cx - 4 &&
              Math.max(maxAx, maxBx) > res.cx + 4 &&
              Math.abs(yA - res.cy) <= 24
          );
          if (crossesResistor) continue;
          const crossesMeter = comps.some(
            (mc) =>
              (mc.kind === 'ammeter' || mc.kind === 'voltmeter') &&
              mc.orientation !== 'v' &&
              Math.min(minAx, minBx) < mc.cx - 4 &&
              Math.max(maxAx, maxBx) > mc.cx + 4 &&
              Math.abs(yA - mc.cy) <= (mc.circleR ?? 24)
          );
          if (crossesMeter) continue;
          const gap = Math.max(minAx, minBx) - Math.min(maxAx, maxBx);
          if (gap <= 14) {
            const newMinX = Math.min(minAx, minBx);
            const newMaxX = Math.max(maxAx, maxBx);
            const newY = (yA + yB) / 2;
            const newLen = newMaxX - newMinX;
            const avgSpeed = (a.currentSpeed * a.length + b.currentSpeed * b.length) / Math.max(1, a.length + b.length);
            simulatedWires[i] = {
              x1: dirA > 0 ? newMinX : newMaxX,
              y1: newY,
              x2: dirA > 0 ? newMaxX : newMinX,
              y2: newY,
              length: newLen,
              inClosedLoop: true,
              active: a.active || b.active,
              currentSpeed: avgSpeed,
              highEnergy: a.highEnergy || b.highEnergy,
            };
            simulatedWires.splice(j, 1);
            mergedAny = true;
            break;
          }
        }
        if (mergedAny) break;
      }
    }
  }

  // Solve general nodal potentials (including open-circuit islands connected to Source + or -)
  // so Voltmeters accurately detect voltage across a source or open switch even when zero current flows!
  const voltmeterReadingMap = new Map<string, number>();
  if (hasSource && comps.some((c) => c.kind === 'voltmeter')) {
    const primarySourceNode = compNodes.find(
      (cn) => cn.comp.kind === 'battery' || cn.comp.kind === 'voltage-source'
    )!;
    const passAdj: { to: number; g: number }[][] = Array.from(
      { length: nodeCenters.length },
      () => []
    );
    for (const wn of wireNodes) {
      if (wn.u === wn.v) continue;
      if (!circuitSwitchClosed && autoSwitch && wn.idx === autoSwitch.wireIdx) continue;
      passAdj[wn.u].push({ to: wn.v, g: 40.0 });
      passAdj[wn.v].push({ to: wn.u, g: 40.0 });
    }
    if (autoSwitchGap && circuitSwitchClosed) {
      passAdj[autoSwitchGap.uTop].push({ to: autoSwitchGap.vBot, g: 100.0 });
      passAdj[autoSwitchGap.vBot].push({ to: autoSwitchGap.uTop, g: 100.0 });
    }
    for (const cn of compNodes) {
      const k = cn.comp.kind;
      if (k === 'voltmeter' || k === 'battery' || k === 'voltage-source') continue;
      if (k === 'switch' && (!circuitSwitchClosed || cn.comp.switchClosed === false)) continue;
      const g = k === 'switch' || k === 'ammeter' ? 100.0 : 1.0;
      passAdj[cn.u].push({ to: cn.v, g });
      passAdj[cn.v].push({ to: cn.u, g });
    }
    if (sources.length > 1) {
      for (let i = 1; i < compNodes.length; i++) {
        const cn = compNodes[i];
        if (cn.comp.kind === 'battery' || cn.comp.kind === 'voltage-source') {
          passAdj[cn.u].push({ to: cn.v, g: 50.0 });
          passAdj[cn.v].push({ to: cn.u, g: 50.0 });
        }
      }
    }

    const bfsReach = (start: number): Uint8Array => {
      const seen = new Uint8Array(nodeCenters.length);
      const q: number[] = [start];
      seen[start] = 1;
      for (let qi = 0; qi < q.length; qi++) {
        const cur = q[qi];
        for (const e of passAdj[cur]) {
          if (!seen[e.to]) {
            seen[e.to] = 1;
            q.push(e.to);
          }
        }
      }
      return seen;
    };

    const reachPlus = bfsReach(primarySourceNode.u);
    const reachMinus = bfsReach(primarySourceNode.v);
    const Vgen = new Float64Array(nodeCenters.length).fill(NaN);
    const fixedGen = new Uint8Array(nodeCenters.length);

    for (let i = 0; i < nodeCenters.length; i++) {
      if (reachPlus[i] && !reachMinus[i]) {
        Vgen[i] = 1.0;
        fixedGen[i] = 1;
      } else if (reachMinus[i] && !reachPlus[i]) {
        Vgen[i] = 0.0;
        fixedGen[i] = 1;
      } else if (reachPlus[i] && reachMinus[i]) {
        Vgen[i] = 0.5;
      }
    }
    Vgen[primarySourceNode.u] = 1.0;
    fixedGen[primarySourceNode.u] = 1;
    Vgen[primarySourceNode.v] = 0.0;
    fixedGen[primarySourceNode.v] = 1;

    for (let iter = 0; iter < 200; iter++) {
      let maxDelta = 0;
      for (let u = 0; u < nodeCenters.length; u++) {
        if (fixedGen[u] || !Number.isFinite(Vgen[u])) continue;
        let sumGV = 0;
        let sumG = 0;
        for (const e of passAdj[u]) {
          if (!Number.isFinite(Vgen[e.to])) continue;
          sumGV += e.g * Vgen[e.to];
          sumG += e.g;
        }
        if (sumG > 0) {
          const nextVu = sumGV / sumG;
          const d = Math.abs(nextVu - Vgen[u]);
          if (d > maxDelta) maxDelta = d;
          Vgen[u] = nextVu;
        }
      }
      if (iter >= 4 && maxDelta < 1e-5) break;
    }

    const vBoost = Math.min(2.2, 1 + (sources.length - 1) * 0.45);
    for (const cn of compNodes) {
      if (cn.comp.kind !== 'voltmeter') continue;
      const vu = Vgen[cn.u];
      const vv = Vgen[cn.v];
      const diff = Number.isFinite(vu) && Number.isFinite(vv) ? Math.abs(vu - vv) : 0;
      if (diff > 0.025) {
        voltmeterReadingMap.set(
          cn.comp.key,
          Math.max(0.55, Math.min(1.8, diff * 1.15 * vBoost))
        );
      }
    }
  }

  const simulatedComps: SimulatedComponentState[] = comps.map((c) => {
    if (c.kind === 'battery' || c.kind === 'voltage-source') {
      return {
        comp: c,
        active: circuitSwitchClosed && anyClosedLoop,
        powerFactor: circuitSwitchClosed && anyClosedLoop ? 1 : 0,
      };
    }
    if (c.kind === 'switch') {
      return {
        comp: c,
        active: Boolean(circuitSwitchClosed && c.switchClosed && anyClosedLoop),
        powerFactor: circuitSwitchClosed && c.switchClosed && anyClosedLoop ? 1 : 0,
      };
    }
    if (c.kind === 'voltmeter') {
      const vmPwr = voltmeterReadingMap.get(c.key) || 0;
      return {
        comp: c,
        active: vmPwr > 0.01,
        powerFactor: vmPwr,
      };
    }
    const pwr = circuitSwitchClosed ? compPowerMap.get(c.key) || 0 : 0;
    return {
      comp: c,
      active: pwr > 0.01,
      powerFactor: pwr,
    };
  });

  return {
    hasSource,
    isCircuitClosed: circuitSwitchClosed && anyClosedLoop,
    sourceCount: sources.length,
    wireSegments:
      hasSource && anyClosedLoop ? simulatedWires.filter((w) => w.inClosedLoop) : [],
    components: simulatedComps,
    autoSwitch,
  };
}

