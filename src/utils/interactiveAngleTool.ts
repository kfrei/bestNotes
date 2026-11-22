import type { StrokeObject } from '../types/note';

export interface AngleArmRef {
  strokeId: string;
  /** Index of the vertex point inside this stroke */
  vertexPointIdx: number;
  /** Index of the draggable arm endpoint inside this stroke */
  armPointIdx: number;
  /** Optional duplicate index when a closed polygon repeats point 0 at length - 1 */
  closedDuplicateArmIdx?: number;
}

export interface ActiveAngleEditor {
  pageId: string;
  armA: AngleArmRef;
  armB: AngleArmRef;
  draggingArm?: 'A' | 'B' | null;
  snappedDeg?: number | null;
}

export interface AngleGeometry {
  vertex: { x: number; y: number };
  armA: { x: number; y: number };
  armB: { x: number; y: number };
  angleA: number;
  angleB: number;
  /** Signed shortest angle from armA to armB in [-PI, PI] */
  diffRad: number;
  /** Unsigned interior angle in degrees [0, 180] */
  deg: number;
  lenA: number;
  lenB: number;
}

const CURVED_SHAPE_TYPES = new Set([
  'circle',
  'ellipse',
  'arc',
  'sine',
  'cosine',
  'parabola',
  'hyperbola',
]);

const CLOSED_POLY_SHAPE_TYPES = new Set([
  'triangle',
  'rectangle',
  'parallelogram',
  'trapezoid',
  'polygon',
]);

const PRIMARY_SNAP_ANGLES = [30, 45, 60, 90, 120];
const SECONDARY_SNAP_ANGLES = [135, 150, 180];
const PRIMARY_SNAP_TOL_DEG = 3.5;
const SECONDARY_SNAP_TOL_DEG = 2.4;

function normalizeSignedAngle(rad: number): number {
  let d = rad;
  while (d <= -Math.PI) d += Math.PI * 2;
  while (d > Math.PI) d -= Math.PI * 2;
  return d;
}

function isClosedPolygonStroke(stroke: StrokeObject): boolean {
  const pts = stroke.points;
  if (!pts || pts.length < 3) return false;
  if (stroke.shapeType && CLOSED_POLY_SHAPE_TYPES.has(stroke.shapeType)) return true;
  if (pts[0]?.twist === 999) return true;
  const first = pts[0];
  const last = pts[pts.length - 1];
  return Math.hypot(first.x - last.x, first.y - last.y) < 8;
}

function isLineLikeStroke(stroke: StrokeObject): boolean {
  if (!stroke.points || stroke.points.length < 2) return false;
  if (stroke.shapeType && CURVED_SHAPE_TYPES.has(stroke.shapeType)) return false;
  if (stroke.isShape) return true;
  // Also allow simple 2-point straight lines or welded polygons
  if (stroke.points.length === 2) return true;
  if (stroke.points[0]?.twist === 999 && stroke.points.length >= 3 && stroke.points.length <= 24) {
    return true;
  }
  return false;
}

/**
 * Find the closest angle vertex at `pt` (either a vertex inside a polygon/polyline stroke,
 * or a shared vertex where two separate line/polyline strokes meet).
 */
export function findAngleVertexAtPoint(
  pt: { x: number; y: number },
  strokes: StrokeObject[],
  lockedLayerIds: Set<string>,
  pageId: string,
  hitRadius = 24
): ActiveAngleEditor | null {
  let bestDist = hitRadius;
  let bestEditor: ActiveAngleEditor | null = null;

  const eligible = strokes.filter(
    (s) => !lockedLayerIds.has(s.layerId) && isLineLikeStroke(s)
  );

  // 1. Check vertices within a single polygon / polyline stroke (>= 3 points)
  for (const s of eligible) {
    const pts = s.points;
    if (pts.length < 3) continue;
    // Skip raw dense freehand strokes (not polygon shapes)
    if (!s.isShape && pts.length > 24) continue;

    const closed = isClosedPolygonStroke(s);
    const hasDupLast =
      closed &&
      pts.length >= 4 &&
      Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) < 8;
    const uniqueCount = hasDupLast ? pts.length - 1 : pts.length;
    if (uniqueCount < 3) continue;

    for (let i = 0; i < uniqueCount; i++) {
      if (!closed && (i === 0 || i === uniqueCount - 1)) continue;
      const v = pts[i];
      const d = Math.hypot(pt.x - v.x, pt.y - v.y);
      if (d > bestDist) continue;

      const prevIdx = (i - 1 + uniqueCount) % uniqueCount;
      const nextIdx = (i + 1) % uniqueCount;
      const pPrev = pts[prevIdx];
      const pNext = pts[nextIdx];
      if (!pPrev || !pNext) continue;

      const len1 = Math.hypot(pPrev.x - v.x, pPrev.y - v.y);
      const len2 = Math.hypot(pNext.x - v.x, pNext.y - v.y);
      if (len1 < 14 || len2 < 14) continue;

      bestDist = d;
      bestEditor = {
        pageId,
        armA: {
          strokeId: s.id,
          vertexPointIdx: i,
          armPointIdx: prevIdx,
          closedDuplicateArmIdx: hasDupLast && prevIdx === 0 ? pts.length - 1 : undefined,
        },
        armB: {
          strokeId: s.id,
          vertexPointIdx: i,
          armPointIdx: nextIdx,
          closedDuplicateArmIdx: hasDupLast && nextIdx === 0 ? pts.length - 1 : undefined,
        },
        draggingArm: null,
        snappedDeg: null,
      };
    }
  }

  // 2. Check pairs of separate strokes whose endpoints meet near `pt`
  interface EndpointCandidate {
    stroke: StrokeObject;
    vertexIdx: number;
    armIdx: number;
    vPt: { x: number; y: number };
    distToClick: number;
  }

  const nearbyEndpoints: EndpointCandidate[] = [];
  for (const s of eligible) {
    const pts = s.points;
    if (pts.length < 2) continue;
    // Only check open strokes (2-point lines, arrows, open polylines)
    if (isClosedPolygonStroke(s)) continue;

    const endpoints: Array<{ vertexIdx: number; armIdx: number }> = [
      { vertexIdx: 0, armIdx: 1 },
      { vertexIdx: pts.length - 1, armIdx: pts.length - 2 },
    ];
    for (const ep of endpoints) {
      const vPt = pts[ep.vertexIdx];
      const armPt = pts[ep.armIdx];
      if (!vPt || !armPt) continue;
      if (Math.hypot(armPt.x - vPt.x, armPt.y - vPt.y) < 14) continue;
      const distToClick = Math.hypot(pt.x - vPt.x, pt.y - vPt.y);
      if (distToClick <= hitRadius + 10) {
        nearbyEndpoints.push({
          stroke: s,
          vertexIdx: ep.vertexIdx,
          armIdx: ep.armIdx,
          vPt,
          distToClick,
        });
      }
    }
  }

  for (let i = 0; i < nearbyEndpoints.length; i++) {
    for (let j = i + 1; j < nearbyEndpoints.length; j++) {
      const e1 = nearbyEndpoints[i];
      const e2 = nearbyEndpoints[j];
      if (e1.stroke.id === e2.stroke.id) continue;
      const vertexGap = Math.hypot(e1.vPt.x - e2.vPt.x, e1.vPt.y - e2.vPt.y);
      if (vertexGap > 18) continue;

      const midX = (e1.vPt.x + e2.vPt.x) / 2;
      const midY = (e1.vPt.y + e2.vPt.y) / 2;
      const distToMid = Math.hypot(pt.x - midX, pt.y - midY);
      if (distToMid > bestDist) continue;

      bestDist = distToMid;
      bestEditor = {
        pageId,
        armA: {
          strokeId: e1.stroke.id,
          vertexPointIdx: e1.vertexIdx,
          armPointIdx: e1.armIdx,
        },
        armB: {
          strokeId: e2.stroke.id,
          vertexPointIdx: e2.vertexIdx,
          armPointIdx: e2.armIdx,
        },
        draggingArm: null,
        snappedDeg: null,
      };
    }
  }

  return bestEditor;
}

export function isSameAngleEditor(
  a: ActiveAngleEditor | null,
  b: ActiveAngleEditor | null
): boolean {
  if (!a || !b) return false;
  if (a.pageId !== b.pageId) return false;
  const matchDirect =
    a.armA.strokeId === b.armA.strokeId &&
    a.armA.vertexPointIdx === b.armA.vertexPointIdx &&
    a.armB.strokeId === b.armB.strokeId &&
    a.armB.vertexPointIdx === b.armB.vertexPointIdx;
  const matchSwapped =
    a.armA.strokeId === b.armB.strokeId &&
    a.armA.vertexPointIdx === b.armB.vertexPointIdx &&
    a.armB.strokeId === b.armA.strokeId &&
    a.armB.vertexPointIdx === b.armA.vertexPointIdx;
  return matchDirect || matchSwapped;
}

export function getAngleGeometry(
  strokes: StrokeObject[],
  editor: ActiveAngleEditor
): AngleGeometry | null {
  const sA = strokes.find((s) => s.id === editor.armA.strokeId);
  const sB = strokes.find((s) => s.id === editor.armB.strokeId);
  if (!sA || !sB) return null;

  const vA = sA.points[editor.armA.vertexPointIdx];
  const pA = sA.points[editor.armA.armPointIdx];
  const vB = sB.points[editor.armB.vertexPointIdx];
  const pB = sB.points[editor.armB.armPointIdx];
  if (!vA || !pA || !vB || !pB) return null;

  const vertex =
    editor.armA.strokeId === editor.armB.strokeId
      ? { x: vA.x, y: vA.y }
      : { x: (vA.x + vB.x) / 2, y: (vA.y + vB.y) / 2 };

  const lenA = Math.hypot(pA.x - vertex.x, pA.y - vertex.y);
  const lenB = Math.hypot(pB.x - vertex.x, pB.y - vertex.y);
  if (lenA < 4 || lenB < 4) return null;

  const angleA = Math.atan2(pA.y - vertex.y, pA.x - vertex.x);
  const angleB = Math.atan2(pB.y - vertex.y, pB.x - vertex.x);
  const diffRad = normalizeSignedAngle(angleB - angleA);
  const deg = (Math.abs(diffRad) * 180) / Math.PI;

  return {
    vertex,
    armA: { x: pA.x, y: pA.y },
    armB: { x: pB.x, y: pB.y },
    angleA,
    angleB,
    diffRad,
    deg,
    lenA,
    lenB,
  };
}

export function hitTestAngleArmHandle(
  pt: { x: number; y: number },
  strokes: StrokeObject[],
  editor: ActiveAngleEditor,
  hitRadius = 20
): 'A' | 'B' | 'vertex' | null {
  const geom = getAngleGeometry(strokes, editor);
  if (!geom) return null;

  const dA = Math.hypot(pt.x - geom.armA.x, pt.y - geom.armA.y);
  const dB = Math.hypot(pt.x - geom.armB.x, pt.y - geom.armB.y);
  if (dA <= hitRadius && dA <= dB) return 'A';
  if (dB <= hitRadius) return 'B';

  const dV = Math.hypot(pt.x - geom.vertex.x, pt.y - geom.vertex.y);
  if (dV <= hitRadius) return 'vertex';
  return null;
}

/**
 * Computes the new position for a dragged angle arm endpoint, applying gentle
 * magnetic snapping when approaching 30°, 45°, 60°, 90°, 120° (and 135°, 150°, 180°).
 */
export function computeSnappedAngleArmPosition(
  rawPt: { x: number; y: number },
  vertex: { x: number; y: number },
  fixedArmPt: { x: number; y: number }
): { x: number; y: number; snappedDeg: number | null; deg: number } {
  const dist = Math.max(20, Math.hypot(rawPt.x - vertex.x, rawPt.y - vertex.y));
  const rawAng = Math.atan2(rawPt.y - vertex.y, rawPt.x - vertex.x);
  const fixedAng = Math.atan2(fixedArmPt.y - vertex.y, fixedArmPt.x - vertex.x);
  const relRad = normalizeSignedAngle(rawAng - fixedAng);
  const absDeg = (Math.abs(relRad) * 180) / Math.PI;
  const sign = relRad >= 0 ? 1 : -1;

  let snappedDeg: number | null = null;
  let bestDelta = Infinity;

  for (const target of PRIMARY_SNAP_ANGLES) {
    const delta = Math.abs(absDeg - target);
    if (delta <= PRIMARY_SNAP_TOL_DEG && delta < bestDelta) {
      bestDelta = delta;
      snappedDeg = target;
    }
  }
  if (snappedDeg === null) {
    for (const target of SECONDARY_SNAP_ANGLES) {
      const delta = Math.abs(absDeg - target);
      if (delta <= SECONDARY_SNAP_TOL_DEG && delta < bestDelta) {
        bestDelta = delta;
        snappedDeg = target;
      }
    }
  }

  if (snappedDeg !== null) {
    const targetAng = fixedAng + sign * ((snappedDeg * Math.PI) / 180);
    return {
      x: vertex.x + dist * Math.cos(targetAng),
      y: vertex.y + dist * Math.sin(targetAng),
      snappedDeg,
      deg: snappedDeg,
    };
  }

  return {
    x: vertex.x + dist * Math.cos(rawAng),
    y: vertex.y + dist * Math.sin(rawAng),
    snappedDeg: null,
    deg: absDeg,
  };
}

/**
 * Returns updated strokes with the chosen angle arm endpoint moved to `newPos`.
 */
export function applyAngleArmMoveToStrokes(
  strokes: StrokeObject[],
  editor: ActiveAngleEditor,
  arm: 'A' | 'B',
  newPos: { x: number; y: number }
): StrokeObject[] {
  const ref = arm === 'A' ? editor.armA : editor.armB;
  return strokes.map((s) => {
    if (s.id !== ref.strokeId) return s;
    const nextPoints = s.points.map((p, idx) => {
      if (
        idx === ref.armPointIdx ||
        (ref.closedDuplicateArmIdx !== undefined && idx === ref.closedDuplicateArmIdx)
      ) {
        return { ...p, x: newPos.x, y: newPos.y };
      }
      return p;
    });
    return { ...s, points: nextPoints };
  });
}

/**
 * Renders the soft emerald-green angle wedge/right-angle square, live degree pill,
 * and draggable arm endpoint handles onto the canvas.
 */
export function drawInteractiveAngleOverlay(
  ctx: CanvasRenderingContext2D,
  strokes: StrokeObject[],
  editor: ActiveAngleEditor
): void {
  const geom = getAngleGeometry(strokes, editor);
  if (!geom) return;

  const { vertex, armA, armB, angleA, angleB, diffRad, deg, lenA, lenB } = geom;
  const anticlockwise = diffRad < 0;
  const isRightAngle = Math.abs(deg - 90) < 0.45;
  const isSnapped =
    editor.snappedDeg != null ||
    PRIMARY_SNAP_ANGLES.some((t) => Math.abs(deg - t) < 0.35);

  const arcR = Math.max(26, Math.min(54, Math.min(lenA, lenB) * 0.36));

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Soft emerald-green interior angle wedge (or right-angle square at 90°)
  if (isRightAngle) {
    const sq = Math.max(18, Math.min(30, arcR * 0.65));
    const uAx = Math.cos(angleA);
    const uAy = Math.sin(angleA);
    const uBx = Math.cos(angleB);
    const uBy = Math.sin(angleB);
    const p1x = vertex.x + uAx * sq;
    const p1y = vertex.y + uAy * sq;
    const p2x = vertex.x + (uAx + uBx) * sq;
    const p2y = vertex.y + (uAy + uBy) * sq;
    const p3x = vertex.x + uBx * sq;
    const p3y = vertex.y + uBy * sq;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.20)';
    ctx.beginPath();
    ctx.moveTo(vertex.x, vertex.y);
    ctx.lineTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.stroke();

    // Right-angle center dot
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(
      vertex.x + (uAx + uBx) * (sq * 0.48),
      vertex.y + (uAy + uBy) * (sq * 0.48),
      2.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else {
    ctx.fillStyle = isSnapped
      ? 'rgba(16, 185, 129, 0.22)'
      : 'rgba(16, 185, 129, 0.16)';
    ctx.beginPath();
    ctx.moveTo(vertex.x, vertex.y);
    ctx.arc(vertex.x, vertex.y, arcR, angleA, angleB, anticlockwise);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isSnapped ? '#059669' : '#10b981';
    ctx.lineWidth = isSnapped ? 2.5 : 2.1;
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, arcR, angleA, angleB, anticlockwise);
    ctx.stroke();
  }

  // 2. Live Degree Pill positioned along the angle bisector
  const midAngle = angleA + diffRad / 2;
  const labelDist = isRightAngle ? Math.max(42, arcR + 12) : arcR + 22;
  const lx = vertex.x + labelDist * Math.cos(midAngle);
  const ly = vertex.y + labelDist * Math.sin(midAngle);

  const rounded = Math.round(deg);
  const labelText =
    Math.abs(deg - rounded) < 0.15 ? `${rounded}°` : `${deg.toFixed(1)}°`;

  ctx.font = '700 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const tw = ctx.measureText(labelText).width;
  const pillW = Math.max(38, tw + 16);
  const pillH = 22;

  ctx.save();
  ctx.shadowColor = 'rgba(5, 150, 105, 0.20)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = isSnapped ? '#059669' : 'rgba(236, 253, 245, 0.96)';
  ctx.strokeStyle = isSnapped ? '#047857' : '#10b981';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(lx - pillW / 2, ly - pillH / 2, pillW, pillH, 11);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = isSnapped ? '#ffffff' : '#065f46';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(labelText, lx, ly + 0.5);

  // 3. Subtle vertex anchor dot
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(vertex.x, vertex.y, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Draggable Arm Endpoint Handles (P1 and P2)
  const handles: Array<{ pt: { x: number; y: number }; active: boolean }> = [
    { pt: armA, active: editor.draggingArm === 'A' },
    { pt: armB, active: editor.draggingArm === 'B' },
  ];

  for (const h of handles) {
    // Soft green halo
    ctx.fillStyle = h.active
      ? 'rgba(16, 185, 129, 0.34)'
      : 'rgba(16, 185, 129, 0.20)';
    ctx.beginPath();
    ctx.arc(h.pt.x, h.pt.y, h.active ? 15 : 12.5, 0, Math.PI * 2);
    ctx.fill();

    // Crisp draggable knob
    ctx.fillStyle = h.active ? '#059669' : '#ffffff';
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(h.pt.x, h.pt.y, h.active ? 8 : 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
