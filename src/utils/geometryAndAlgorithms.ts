import { BezierPoint, StrokeObject, ShapePresetType } from '../types/note';

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Converts raw Apple Pencil points into smooth Quadratic Bezier curves with StreamLine filtering.
 */
export function smoothStrokeToBezier(rawPoints: BezierPoint[], streamline = 0.42): BezierPoint[] {
  if (rawPoints.length <= 2) return rawPoints;

  // Step 1: Exponential moving average (StreamLine filter)
  const filtered: BezierPoint[] = [rawPoints[0]];
  for (let i = 1; i < rawPoints.length; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = rawPoints[i];
    const d = distance(prev, curr);
    if (d < 0.8 && i < rawPoints.length - 1) continue;
    const alpha = Math.max(0.25, Math.min(0.85, 1 - streamline * Math.exp(-d / 18)));
    filtered.push({
      x: prev.x + alpha * (curr.x - prev.x),
      y: prev.y + alpha * (curr.y - prev.y),
      pressure: (prev.pressure ?? 0.5) * 0.4 + (curr.pressure ?? 0.5) * 0.6,
      tiltX: curr.tiltX,
      tiltY: curr.tiltY,
      twist: curr.twist,
    });
  }

  if (filtered.length <= 2) return filtered;

  // Step 2: Build Quadratic Bezier control points (Midpoint interpolation)
  const result: BezierPoint[] = [{ ...filtered[0] }];
  for (let i = 1; i < filtered.length - 1; i++) {
    const p0 = filtered[i];
    const p1 = filtered[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    result.push({
      x: midX,
      y: midY,
      cx: p0.x,
      cy: p0.y,
      pressure: p0.pressure,
      tiltX: p0.tiltX,
      tiltY: p0.tiltY,
      twist: p0.twist,
    });
  }
  const last = filtered[filtered.length - 1];
  const secondLast = filtered[filtered.length - 2];
  result.push({
    x: last.x,
    y: last.y,
    cx: secondLast.x,
    cy: secondLast.y,
    pressure: last.pressure,
    tiltX: last.tiltX,
    tiltY: last.tiltY,
    twist: last.twist,
  });

  return result;
}

/**
 * Ramer-Douglas-Peucker polygon simplification for corner detection.
 */
function rdpSimplify(pts: BezierPoint[], epsilon: number): BezierPoint[] {
  if (pts.length < 3) return pts;
  let dmax = 0;
  let index = 0;
  const end = pts.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(pts[i], pts[0], pts[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const rec1 = rdpSimplify(pts.slice(0, index + 1), epsilon);
    const rec2 = rdpSimplify(pts.slice(index, end + 1), epsilon);
    return rec1.slice(0, rec1.length - 1).concat(rec2);
  } else {
    return [pts[0], pts[end]];
  }
}

function perpendicularDistance(
  pt: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const mag = Math.hypot(dx, dy);
  if (mag === 0) return distance(pt, lineStart);
  return Math.abs(dy * pt.x - dx * pt.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / mag;
}

/**
 * Detects if a stroke is a quick "Scribble-to-Erase" gesture.
 */
export function isScribbleEraseGesture(pts: BezierPoint[]): { isScribble: boolean; bounds?: { minX: number; minY: number; maxX: number; maxY: number } } {
  if (pts.length < 18) return { isScribble: false };
  let pathLen = 0;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let xReversals = 0;
  let lastDxSign = 0;

  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    pathLen += Math.hypot(dx, dy);
    minX = Math.min(minX, pts[i].x);
    minY = Math.min(minY, pts[i].y);
    maxX = Math.max(maxX, pts[i].x);
    maxY = Math.max(maxY, pts[i].y);

    if (Math.abs(dx) > 3) {
      const sign = dx > 0 ? 1 : -1;
      if (lastDxSign !== 0 && sign !== lastDxSign) {
        xReversals++;
      }
      lastDxSign = sign;
    }
  }

  const diag = Math.hypot(maxX - minX, maxY - minY);
  // If user scribbled back and forth at least 4 times in a compact region
  if (xReversals >= 4 && diag > 18 && pathLen / Math.max(1, diag) > 2.9) {
    return {
      isScribble: true,
      bounds: { minX: minX - 8, minY: minY - 8, maxX: maxX + 8, maxY: maxY + 8 },
    };
  }
  return { isScribble: false };
}

/**
 * Hold-to-Snap & Geometric Shape Recognizer (Line, Rectangle, Parallelogram, Ellipse, Triangle).
 */
export function recognizeAndSnapShape(
  rawPoints: BezierPoint[],
  forcedPreset: ShapePresetType = 'auto'
): { points: BezierPoint[]; shapeType: string } | null {
  if (rawPoints.length < 3) return null;

  const start = rawPoints[0];
  const end = rawPoints[rawPoints.length - 1];
  let totalLen = 0;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (let i = 0; i < rawPoints.length; i++) {
    if (i > 0) totalLen += distance(rawPoints[i - 1], rawPoints[i]);
    minX = Math.min(minX, rawPoints[i].x);
    minY = Math.min(minY, rawPoints[i].y);
    maxX = Math.max(maxX, rawPoints[i].x);
    maxY = Math.max(maxY, rawPoints[i].y);
  }

  if (totalLen < 20) return null;
  const directDist = distance(start, end);
  const straightness = directDist / totalLen;

  // Forced presets when user picks a specific shape from the Shape toolbar
  if (forcedPreset !== 'auto') {
    return buildPresetShape(start, end, minX, minY, maxX, maxY, forcedPreset);
  }

  // 1. Straight Line Test (snaps to 0°, 45°, 90° if close)
  if (straightness > 0.89) {
    let x2 = end.x;
    let y2 = end.y;
    const angleDeg = (Math.atan2(y2 - start.y, x2 - start.x) * 180) / Math.PI;
    const absAngle = Math.abs(angleDeg);

    if (absAngle < 6 || absAngle > 174) {
      y2 = start.y; // Horizontal snap (great for fraction bars & underlines!)
    } else if (Math.abs(absAngle - 90) < 6) {
      x2 = start.x; // Vertical snap
    }

    return {
      shapeType: 'line',
      points: [
        { x: start.x, y: start.y, pressure: 0.7 },
        { x: x2, y: y2, cx: (start.x + x2) / 2, cy: (start.y + y2) / 2, pressure: 0.7 },
      ],
    };
  }

  // 2. Closed Shape Test (Circle/Ellipse, Rectangle, Parallelogram, Triangle)
  const isClosed = directDist < totalLen * 0.24 || directDist < 45;
  if (isClosed) {
    const w = maxX - minX;
    const h = maxY - minY;
    const diag = Math.hypot(w, h);
    const simplified = rdpSimplify(rawPoints, diag * 0.065);

    // Triangle (3 vertices -> 4 points in closed simplified polyline)
    if (simplified.length === 4) {
      const [p0, p1, p2] = simplified;
      return {
        shapeType: 'triangle',
        points: makePolygonBezier([p0, p1, p2]),
      };
    }

    // Quadrilateral: Rectangle or Parallelogram (4 vertices -> 5 points)
    if (simplified.length === 5) {
      const [p0, p1, p2, p3] = simplified;
      // Check angle at p0-p1-p2
      const v1x = p1.x - p0.x,
        v1y = p1.y - p0.y;
      const v2x = p2.x - p1.x,
        v2y = p2.y - p1.y;
      const cosAngle =
        (v1x * v2x + v1y * v2y) / (Math.max(1, Math.hypot(v1x, v1y)) * Math.max(1, Math.hypot(v2x, v2y)));

      if (Math.abs(cosAngle) < 0.22) {
        // Axis-aligned clean rectangle
        const rectPts = [
          { x: minX, y: minY },
          { x: maxX, y: minY },
          { x: maxX, y: maxY },
          { x: minX, y: maxY },
        ];
        return {
          shapeType: 'rectangle',
          points: makePolygonBezier(rectPts),
        };
      } else {
        // True Parallelogram (force opposite sides parallel: p3 = p0 + (p2 - p1))
        const paraPts = [
          { x: p0.x, y: p0.y },
          { x: p1.x, y: p1.y },
          { x: p2.x, y: p2.y },
          { x: p0.x + (p2.x - p1.x), y: p0.y + (p2.y - p1.y) },
        ];
        return {
          shapeType: 'parallelogram',
          points: makePolygonBezier(paraPts),
        };
      }
    }

    // Smooth closed loop -> Ellipse / Circle!
    return {
      shapeType: Math.abs(w - h) < Math.max(w, h) * 0.18 ? 'circle' : 'ellipse',
      points: makeEllipseBezier((minX + maxX) / 2, (minY + maxY) / 2, w / 2, h / 2),
    };
  }

  return null;
}

export function makePolygonBezier(corners: { x: number; y: number }[]): BezierPoint[] {
  const pts: BezierPoint[] = [{ x: corners[0].x, y: corners[0].y, pressure: 0.7 }];
  for (let i = 1; i <= corners.length; i++) {
    const prev = corners[i - 1];
    const curr = corners[i % corners.length];
    pts.push({
      x: curr.x,
      y: curr.y,
      cx: (prev.x + curr.x) / 2,
      cy: (prev.y + curr.y) / 2,
      pressure: 0.7,
    });
  }
  return pts;
}

export function makeEllipseBezier(cx: number, cy: number, rx: number, ry: number): BezierPoint[] {
  const steps = 24;
  const pts: BezierPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const x = cx + rx * Math.cos(theta);
    const y = cy + ry * Math.sin(theta);
    if (i === 0) {
      pts.push({ x, y, pressure: 0.7 });
    } else {
      const prevTheta = ((i - 0.5) / steps) * Math.PI * 2;
      const ctrlR = 1 / Math.cos(Math.PI / steps);
      pts.push({
        x,
        y,
        cx: cx + rx * ctrlR * Math.cos(prevTheta),
        cy: cy + ry * ctrlR * Math.sin(prevTheta),
        pressure: 0.7,
      });
    }
  }
  return pts;
}

function buildPresetShape(
  start: BezierPoint,
  end: BezierPoint,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  preset: ShapePresetType
): { points: BezierPoint[]; shapeType: string } {
  const w = Math.max(24, maxX - minX);
  const h = Math.max(24, maxY - minY);
  if (preset === 'line' || preset === 'arrow') {
    return {
      shapeType: preset,
      points: [
        { x: start.x, y: start.y, pressure: 0.7 },
        { x: end.x, y: end.y, cx: (start.x + end.x) / 2, cy: (start.y + end.y) / 2, pressure: 0.7 },
      ],
    };
  }
  if (preset === 'rectangle') {
    return {
      shapeType: 'rectangle',
      points: makePolygonBezier([
        { x: minX, y: minY },
        { x: minX + w, y: minY },
        { x: minX + w, y: minY + h },
        { x: minX, y: minY + h },
      ]),
    };
  }
  if (preset === 'parallelogram') {
    const skew = Math.min(w * 0.25, 45);
    return {
      shapeType: 'parallelogram',
      points: makePolygonBezier([
        { x: minX + skew, y: minY },
        { x: minX + w, y: minY },
        { x: minX + w - skew, y: minY + h },
        { x: minX, y: minY + h },
      ]),
    };
  }
  if (preset === 'triangle') {
    return {
      shapeType: 'triangle',
      points: makePolygonBezier([
        { x: minX + w / 2, y: minY },
        { x: minX + w, y: minY + h },
        { x: minX, y: minY + h },
      ]),
    };
  }
  return {
    shapeType: 'ellipse',
    points: makeEllipseBezier(minX + w / 2, minY + h / 2, w / 2, h / 2),
  };
}

/**
 * Generates multi-stroke grouped Physics Stencils (e.g. Cylindrical Conductor, Coordinate Axes, Resistor)
 */
export function createPhysicsStencilStrokes(
  preset: 'cylinder' | 'axes' | 'resistor',
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  layerId: string
): StrokeObject[] {
  const groupId = `group-${Date.now()}`;
  const out: StrokeObject[] = [];

  if (preset === 'cylinder') {
    // Cylindrical conductor like the user's "Ένταση Ηλεκτρικού Ρεύματος" diagram!
    const rx = Math.max(16, Math.min(36, w * 0.08));
    const ry = h / 2;
    const leftCx = x + rx;
    const rightCx = x + w - rx;
    const midCx = (leftCx + rightCx) / 2;
    const cy = y + ry;

    // Top & bottom horizontal lines
    out.push({
      id: `st-${Date.now()}-1`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x: leftCx, y: y, pressure: 0.7 },
        { x: rightCx, y: y, cx: midCx, cy: y, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
    });
    out.push({
      id: `st-${Date.now()}-2`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x: leftCx, y: y + h, pressure: 0.7 },
        { x: rightCx, y: y + h, cx: midCx, cy: y + h, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
    });
    // Left, Middle (yellow filled cross-section!), and Right ellipses
    out.push({
      id: `st-${Date.now()}-3`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: makeEllipseBezier(leftCx, cy, rx, ry),
      layerId,
      groupId,
      isShape: true,
    });
    out.push({
      id: `st-${Date.now()}-4`,
      tool: 'pen',
      color,
      fillColor: '#fef08a',
      fillStyle: 'solid',
      width: 2.8,
      opacity: 1,
      points: makeEllipseBezier(midCx, cy, rx, ry),
      layerId,
      groupId,
      isShape: true,
    });
    out.push({
      id: `st-${Date.now()}-5`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: makeEllipseBezier(rightCx, cy, rx, ry),
      layerId,
      groupId,
      isShape: true,
    });
  } else if (preset === 'axes') {
    // X and Y axes with arrows
    out.push({
      id: `st-${Date.now()}-ax1`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x, y: y + h, pressure: 0.7 },
        { x: x + w, y: y + h, cx: x + w / 2, cy: y + h, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
    });
    out.push({
      id: `st-${Date.now()}-ax2`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x, y: y + h, pressure: 0.7 },
        { x, y, cx: x, cy: y + h / 2, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
    });
  } else if (preset === 'resistor') {
    const cy = y + h / 2;
    const segW = w / 8;
    const zigPts: { x: number; y: number }[] = [
      { x, y: cy },
      { x: x + segW, y: cy },
      { x: x + segW * 1.75, y: y },
      { x: x + segW * 2.75, y: y + h },
      { x: x + segW * 3.75, y: y },
      { x: x + segW * 4.75, y: y + h },
      { x: x + segW * 5.75, y: y },
      { x: x + segW * 6.5, y: cy },
      { x: x + w, y: cy },
    ];
    const pts: BezierPoint[] = [{ x: zigPts[0].x, y: zigPts[0].y, pressure: 0.7 }];
    for (let i = 1; i < zigPts.length; i++) {
      pts.push({
        x: zigPts[i].x,
        y: zigPts[i].y,
        cx: (zigPts[i - 1].x + zigPts[i].x) / 2,
        cy: (zigPts[i - 1].y + zigPts[i].y) / 2,
        pressure: 0.7,
      });
    }
    out.push({
      id: `st-${Date.now()}-res`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: pts,
      layerId,
      groupId,
      isShape: true,
    });
  }

  return out;
}

/**
 * Zero-AI Greek Handwriting Beautifier & Math Symbol Straightener:
 * - Aligns word baselines horizontally
 * - Applies Laplacian curve smoothing to Bezier control points
 * - Automatically straightens horizontal bars (fractions, equals '=' signs)
 */
export function beautifyHandwritingStrokes(strokes: StrokeObject[]): StrokeObject[] {
  if (strokes.length === 0) return strokes;

  // Compute global baseline average for the selected strokes
  const bboxes = strokes.map((s) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of s.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    return { id: s.id, minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
  });

  // Group strokes into horizontal text rows
  const sortedByY = [...bboxes].sort((a, b) => a.maxY - b.maxY);
  const rows: (typeof bboxes)[] = [];
  for (const box of sortedByY) {
    const existingRow = rows.find((r) => {
      const avgMaxY = r.reduce((acc, item) => acc + item.maxY, 0) / r.length;
      return Math.abs(box.maxY - avgMaxY) < 28;
    });
    if (existingRow) existingRow.push(box);
    else rows.push([box]);
  }

  const dyByStroke = new Map<string, number>();
  for (const row of rows) {
    const targetBaseline = row.reduce((acc, item) => acc + item.maxY, 0) / row.length;
    // Snap targetBaseline to nearest 24px grid line for extra neatness
    const snappedBaseline = Math.round(targetBaseline / 24) * 24;
    for (const item of row) {
      // Only shift normal character strokes, not tall brackets/fractions
      if (item.h < 55) {
        dyByStroke.set(item.id, (snappedBaseline - item.maxY) * 0.45);
      }
    }
  }

  return strokes.map((stroke) => {
    const box = bboxes.find((b) => b.id === stroke.id)!;
    const dy = dyByStroke.get(stroke.id) ?? 0;

    // Check if stroke is a horizontal bar (fraction bar, minus, or part of '=')
    if (box.w > 14 && box.h < box.w * 0.22 && stroke.points.length >= 2) {
      const midY = (box.minY + box.maxY) / 2 + dy;
      return {
        ...stroke,
        points: [
          { x: box.minX, y: midY, pressure: 0.7 },
          { x: box.maxX, y: midY, cx: (box.minX + box.maxX) / 2, cy: midY, pressure: 0.7 },
        ],
      };
    }

    // Apply gentle Laplacian smoothing + baseline alignment while preserving user's Greek handwriting style
    const pts = stroke.points.map((p) => ({ ...p, y: p.y + dy, cy: p.cy !== undefined ? p.cy + dy : undefined }));
    if (pts.length >= 3) {
      for (let i = 1; i < pts.length - 1; i++) {
        pts[i].x = pts[i].x * 0.7 + ((pts[i - 1].x + pts[i + 1].x) / 2) * 0.3;
        pts[i].y = pts[i].y * 0.7 + ((pts[i - 1].y + pts[i + 1].y) / 2) * 0.3;
        if (pts[i].cx !== undefined && pts[i].cy !== undefined) {
          pts[i].cx = (pts[i - 1].x + pts[i].x) / 2;
          pts[i].cy = (pts[i - 1].y + pts[i].y) / 2;
        }
      }
    }

    return {
      ...stroke,
      points: pts,
    };
  });
}

/**
 * Photoshop 1-Click Transparent Background (Zero-AI Color-to-Alpha + Flood Fill Magic Wand)
 */
export async function removeImageBackground(
  dataUrl: string,
  mode: 'all-white' | 'outer-flood' = 'all-white',
  tolerance = 42
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample corner pixel as background reference color (usually white/light grey paper)
      const bgR = data[0] > 180 ? data[0] : 255;
      const bgG = data[1] > 180 ? data[1] : 255;
      const bgB = data[2] > 180 ? data[2] : 255;

      const colorDist = (idx: number) => {
        const dr = data[idx] - bgR;
        const dg = data[idx + 1] - bgG;
        const db = data[idx + 2] - bgB;
        return Math.sqrt(dr * dr + dg * dg + db * db);
      };

      if (mode === 'all-white') {
        const lowT = tolerance * 0.7;
        const highT = tolerance * 1.65;
        for (let i = 0; i < data.length; i += 4) {
          const d = colorDist(i);
          if (d <= lowT) {
            data[i + 3] = 0;
          } else if (d < highT) {
            // Smooth anti-aliased alpha transition so black diagram lines stay razor-sharp
            const factor = (d - lowT) / (highT - lowT);
            data[i + 3] = Math.round(data[i + 3] * factor);
          }
        }
      } else {
        // Outer Flood-Fill (Magic Wand from image borders - keeps white insides of shapes opaque!)
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];
        for (let x = 0; x < w; x++) {
          queue.push(x, (h - 1) * w + x);
        }
        for (let y = 0; y < h; y++) {
          queue.push(y * w, y * w + (w - 1));
        }

        while (queue.length > 0) {
          const pIdx = queue.pop()!;
          if (visited[pIdx]) continue;
          visited[pIdx] = 1;
          const byteIdx = pIdx * 4;
          const d = colorDist(byteIdx);
          if (d <= tolerance * 1.35) {
            data[byteIdx + 3] = d <= tolerance * 0.8 ? 0 : Math.round(255 * ((d - tolerance * 0.8) / (tolerance * 0.55)));
            const px = pIdx % w;
            const py = Math.floor(pIdx / w);
            if (px > 0 && !visited[pIdx - 1]) queue.push(pIdx - 1);
            if (px < w - 1 && !visited[pIdx + 1]) queue.push(pIdx + 1);
            if (py > 0 && !visited[pIdx - w]) queue.push(pIdx - w);
            if (py < h - 1 && !visited[pIdx + w]) queue.push(pIdx + w);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Photoshop Magnetic Lasso: Computes Sobel Edge Gradient Map and snaps cursor to strongest contour edge.
 */
export function computeImageSobelEdgeMap(imgElement: HTMLImageElement, width: number, height: number): Float32Array {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const edgeMap = new Float32Array(w * h);
  if (!ctx) return edgeMap;

  ctx.drawImage(imgElement, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx =
        -gray[(y - 1) * w + (x - 1)] +
        gray[(y - 1) * w + (x + 1)] -
        2 * gray[y * w + (x - 1)] +
        2 * gray[y * w + (x + 1)] -
        gray[(y + 1) * w + (x - 1)] +
        gray[(y + 1) * w + (x + 1)];
      const gy =
        -gray[(y - 1) * w + (x - 1)] -
        2 * gray[(y - 1) * w + x] -
        gray[(y - 1) * w + (x + 1)] +
        gray[(y + 1) * w + (x - 1)] +
        2 * gray[(y + 1) * w + x] +
        gray[(y + 1) * w + (x + 1)];
      edgeMap[y * w + x] = Math.hypot(gx, gy);
    }
  }
  return edgeMap;
}

export function snapMagneticLassoPoint(
  localX: number,
  localY: number,
  edgeMap: Float32Array,
  w: number,
  h: number,
  searchRadius = 18
): { x: number; y: number } {
  const cx = Math.round(localX);
  const cy = Math.round(localY);
  let bestScore = -1;
  let bestX = localX;
  let bestY = localY;

  const r = Math.round(searchRadius);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const dist = Math.hypot(dx, dy);
      if (dist > searchRadius) continue;
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 1 || nx >= w - 1 || ny < 1 || ny >= h - 1) continue;
      const grad = edgeMap[ny * w + nx];
      // Weight strong edges while slightly preferring closer pixels
      const score = grad * (1 - (dist / (searchRadius * 1.4)) * 0.35);
      if (score > bestScore && grad > 35) {
        bestScore = score;
        bestX = nx;
        bestY = ny;
      }
    }
  }

  return { x: bestX, y: bestY };
}

/**
 * Offline Symbolic/Numeric CAS Equation Solver (Zero-AI, 100% Free & Instant)
 */
export function solveMathExpressionOffline(input: string): { latex: string; solution: string } {
  const clean = input.trim();
  // Check if linear equation in 1 variable e.g. "15 * t = 90" or "20 * 3600 / 1000"
  if (clean.includes('=')) {
    const [lhs, rhs] = clean.split('=').map((s) => s.trim());
    // Find variable name (t, x, I, q, u, v)
    const varMatch = clean.match(/[a-zA-Zα-ωΑ-Ω]+/);
    if (varMatch && lhs && rhs) {
      const v = varMatch[0];
      // Evaluate f(v) = lhs - (rhs) at v=0 and v=1 to solve linear equation a*v + b = 0
      const evalAt = (val: number) => {
        const expr = `(${lhs.replace(new RegExp(v, 'g'), `(${val})`)}) - (${rhs.replace(new RegExp(v, 'g'), `(${val})`)})`
          .replace(/⋅|·/g, '*')
          .replace(/:/g, '/');
        return Function(`"use strict"; return (${expr});`)() as number;
      };
      try {
        const f0 = evalAt(0);
        const f1 = evalAt(1);
        const a = f1 - f0;
        if (Math.abs(a) > 1e-9) {
          const sol = -f0 / a;
          const rounded = Math.round(sol * 1000) / 1000;
          return {
            latex: `${clean.replace(/\*/g, ' \\cdot ')} \\implies ${v} = ${rounded}`,
            solution: `${v} = ${rounded}`,
          };
        }
      } catch {
        // Fallback below
      }
    }
  }

  try {
    const safeExpr = clean.replace(/⋅|·/g, '*').replace(/=/g, '');
    const val = Function(`"use strict"; return (${safeExpr});`)();
    if (typeof val === 'number' && !Number.isNaN(val)) {
      const rounded = Math.round(val * 1000) / 1000;
      return {
        latex: `${clean.replace(/\*/g, ' \\cdot ')} = ${rounded}`,
        solution: `${rounded}`,
      };
    }
  } catch {
    // Non-numeric expression
  }

  return {
    latex: clean,
    solution: clean,
  };
}
