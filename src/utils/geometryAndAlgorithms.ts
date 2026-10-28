import { BezierPoint, StrokeObject, ShapePresetType, Notebook } from '../types/note';

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Converts raw Apple Pencil points into smooth Quadratic Bezier curves with StreamLine filtering.
 */
export function smoothStrokeToBezier(rawPoints: BezierPoint[], _streamline = 0.54): BezierPoint[] {
  if (rawPoints.length === 0) return [];
  if (rawPoints.length === 1) return [{ ...rawPoints[0] }];
  if (rawPoints.length === 2) {
    const p0 = rawPoints[0];
    const p1 = rawPoints[1];
    return [
      { ...p0 },
      {
        ...p1,
        cx: (p0.x + p1.x) / 2,
        cy: (p0.y + p1.y) / 2,
      },
    ];
  }

  /*
   * NOTE (Backup / Restore Point):
   * Post-stroke StreamLine EMA + 2-pass Gaussian-Laplacian relaxation ("στρώσιμο" after lifting the pencil)
   * is disabled per user request ("οτι γραφω ας μενει ιδιο ... θα το δουμε πολυ πολυ μετα") so the committed
   * stroke matches 100% what was drawn live on the canvas without shifting or morphing on pointerUp.
   */
  const pts = rawPoints;

  // Exact 1:1 C1-continuous Quadratic Bezier Midpoint Spline matching drawIncrementalSegment live ink!
  const result: BezierPoint[] = [{ ...pts[0] }];
  const firstMidX = (pts[0].x + pts[1].x) / 2;
  const firstMidY = (pts[0].y + pts[1].y) / 2;
  result.push({
    x: firstMidX,
    y: firstMidY,
    cx: (pts[0].x + firstMidX) / 2,
    cy: (pts[0].y + firstMidY) / 2,
    pressure: pts[0].pressure,
    tiltX: pts[0].tiltX,
    tiltY: pts[0].tiltY,
    twist: pts[0].twist,
  });

  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
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

  const last = pts[pts.length - 1];
  const prevEnd = result[result.length - 1];
  result.push({
    x: last.x,
    y: last.y,
    cx: (prevEnd.x + last.x) / 2,
    cy: (prevEnd.y + last.y) / 2,
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
  if (pts.length < 28) return { isScribble: false };
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

    if (Math.abs(dx) > 4.5) {
      const sign = dx > 0 ? 1 : -1;
      if (lastDxSign !== 0 && sign !== lastDxSign) {
        xReversals++;
      }
      lastDxSign = sign;
    }
  }

  const diag = Math.hypot(maxX - minX, maxY - minY);
  // Require deliberate dense scribble (at least 6 wide horizontal reversals) so Greek curvy letters (ξ, ζ, Σ) are never erased
  if (xReversals >= 6 && diag > 24 && pathLen / Math.max(1, diag) > 4.2) {
    return {
      isScribble: true,
      bounds: { minX: minX - 8, minY: minY - 8, maxX: maxX + 8, maxY: maxY + 8 },
    };
  }
  return { isScribble: false };
}

/**
 * Hold-to-Snap & Geometric Shape Recognizer (Line, Circle, Ellipse, Square, Rectangle, Parallelogram, Triangle).
 * Triggered automatically after ~0.42s hold in Pen, Pencil, Highlighter, or Shape tools WITHOUT lifting the Apple Pencil!
 */
export function recognizeAndSnapShape(
  rawPoints: BezierPoint[],
  forcedPreset: ShapePresetType = 'auto'
): { points: BezierPoint[]; shapeType: string } | null {
  if (rawPoints.length < 2) return null;

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

  // Forced presets when user picks a specific shape from the Shape toolbar
  if (forcedPreset !== 'auto' && totalLen >= 3) {
    return buildPresetShape(start, end, minX, minY, maxX, maxY, forcedPreset, rawPoints);
  }

  if (totalLen < 8) return null;
  const directDist = distance(start, end);

  // If the user paused at the end of a straight line and the stylus hooked/retraced slightly in the last 25% of points,
  // find the farthest point in the tail so the end-hook never ruins the straight-line chord or straightness ratio!
  let trueEnd = end;
  const tailStartIdx = Math.max(1, Math.floor(rawPoints.length * 0.72));
  let maxTailDist = directDist;
  for (let i = tailStartIdx; i < rawPoints.length; i++) {
    const d = distance(start, rawPoints[i]);
    if (d > maxTailDist) {
      maxTailDist = d;
      trueEnd = rawPoints[i];
    }
  }
  const useTrueEnd =
    maxTailDist > directDist * 1.02 &&
    distance(end, trueEnd) <= Math.max(26, maxTailDist * 0.24);
  const lineEnd = useTrueEnd ? trueEnd : end;
  const lineDist = distance(start, lineEnd);
  const straightness = lineDist / Math.max(1, totalLen);

  // Compute maximum perpendicular deviation of stroke points from the chord (start -> lineEnd)
  let maxPerpDev = 0;
  if (lineDist > 6) {
    const ux = (lineEnd.x - start.x) / lineDist;
    const uy = (lineEnd.y - start.y) / lineDist;
    for (let i = 1; i < rawPoints.length - 1; i++) {
      const vx = rawPoints[i].x - start.x;
      const vy = rawPoints[i].y - start.y;
      const perp = Math.abs(vx * uy - vy * ux);
      if (perp > maxPerpDev) maxPerpDev = perp;
    }
  }

  const snapLineFromStartTo = (targetEnd: BezierPoint) => {
    let x2 = targetEnd.x;
    let y2 = targetEnd.y;
    const angleDeg = (Math.atan2(y2 - start.y, x2 - start.x) * 180) / Math.PI;
    const absAngle = Math.abs(angleDeg);

    if (absAngle < 4.5 || absAngle > 175.5) {
      y2 = start.y; // Horizontal snap
    } else if (Math.abs(absAngle - 90) < 4.5) {
      x2 = start.x; // Vertical snap
    }

    return {
      shapeType: 'line',
      points: [
        { x: start.x, y: start.y, pressure: 0.7 },
        { x: x2, y: y2, pressure: 0.7 },
      ],
    };
  };

  // 1. Straight Line Test (snaps horizontal, vertical, or any diagonal line reliably even with slight hand arc or end-hold hook!)
  const isStraightLine =
    lineDist >= 8 &&
    ((straightness > 0.80 && maxPerpDev < Math.max(28, lineDist * 0.19)) ||
      (straightness > 0.64 && maxPerpDev < Math.max(24, lineDist * 0.16)) ||
      (lineDist >= totalLen * 0.50 && maxPerpDev < Math.max(15, lineDist * 0.10)));

  if (isStraightLine) {
    return snapLineFromStartTo(lineEnd);
  }

  // 2. Closed Shape Test (Circle, Ellipse, Square, Rectangle, Parallelogram, Triangle)
  const w = Math.max(16, maxX - minX);
  const h = Math.max(16, maxY - minY);
  const diag = Math.hypot(w, h);
  const isClosed = directDist < totalLen * 0.35 || directDist < Math.max(52, diag * 0.32);

  if (isClosed && diag > 22) {
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = Math.max(8, w / 2);
    const ry = Math.max(8, h / 2);

    // Helper: Euclidean distance from point P to line segment AB
    const distToSeg = (
      px: number,
      py: number,
      ax: number,
      ay: number,
      bx: number,
      by: number
    ): number => {
      const abx = bx - ax;
      const aby = by - ay;
      const lenSq = abx * abx + aby * aby;
      if (lenSq < 1e-6) return Math.hypot(px - ax, py - ay);
      const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lenSq));
      return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
    };

    // 2a. Robust Trimmed Bounding Box (3rd–97th percentile) so a single corner overshoot doesn't skew an entire box wall
    const sortedX = rawPoints.map((p) => p.x).sort((a, b) => a - b);
    const sortedY = rawPoints.map((p) => p.y).sort((a, b) => a - b);
    const pLowIdx = Math.floor((rawPoints.length - 1) * 0.03);
    const pHighIdx = Math.ceil((rawPoints.length - 1) * 0.97);
    const trimMinX = sortedX[pLowIdx];
    const trimMaxX = sortedX[pHighIdx];
    const trimMinY = sortedY[pLowIdx];
    const trimMaxY = sortedY[pHighIdx];

    // 2b. Measure Bounding-Box Fit Error, Ellipse Fit Error, and Diagonal-to-Cardinal Radial Expansion
    let rectErrSum = 0;
    let ellipseDistErrSum = 0;
    let diagRadiusSum = 0;
    let diagRadiusCount = 0;
    let cardRadiusSum = 0;
    let cardRadiusCount = 0;

    for (const p of rawPoints) {
      const distToBoxEdge = Math.min(
        Math.abs(p.x - trimMinX),
        Math.abs(trimMaxX - p.x),
        Math.abs(p.y - trimMinY),
        Math.abs(trimMaxY - p.y)
      );
      rectErrSum += distToBoxEdge / diag;

      const ux = (p.x - cx) / rx;
      const uy = (p.y - cy) / ry;
      const normR = Math.hypot(ux, uy);
      const ang = Math.atan2(uy, ux);
      const ex = cx + rx * Math.cos(ang);
      const ey = cy + ry * Math.sin(ang);
      ellipseDistErrSum += Math.hypot(p.x - ex, p.y - ey) / diag;

      // cos(2*ang) is near ±1 on cardinal axes (0°, 90°, 180°, 270°) and near 0 on diagonals (±45°, ±135°)
      const cos2A = Math.abs(Math.cos(2 * ang));
      if (cos2A < 0.45) {
        diagRadiusSum += normR;
        diagRadiusCount++;
      } else if (cos2A > 0.55) {
        cardRadiusSum += normR;
        cardRadiusCount++;
      }
    }
    const rectErr = rectErrSum / rawPoints.length;
    const ellipseDistErr = ellipseDistErrSum / rawPoints.length;
    const diagonalExpansion =
      diagRadiusCount >= 3 && cardRadiusCount >= 3
        ? diagRadiusSum / diagRadiusCount / Math.max(0.1, cardRadiusSum / cardRadiusCount)
        : 1.0;

    // 2c. Distance from the 4 Bounding-Box Corners to the stroke
    const boxCorners = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];
    let cornerDistSum = 0;
    for (const bc of boxCorners) {
      let minD = Infinity;
      for (const p of rawPoints) {
        const d = distance(bc, p);
        if (d < minD) minD = d;
      }
      cornerDistSum += minD / diag;
    }
    const avgBoxCornerDist = cornerDistSum / 4;

    // 2d. Resample closed loop into N=64 equidistant points (with wrap-around!) so the start/end corner is never missed
    const closedPoly: BezierPoint[] = [...rawPoints];
    if (distance(rawPoints[rawPoints.length - 1], rawPoints[0]) > 2) {
      closedPoly.push(rawPoints[0]);
    }
    const cumLen: number[] = [0];
    for (let i = 1; i < closedPoly.length; i++) {
      cumLen.push(cumLen[i - 1] + distance(closedPoly[i - 1], closedPoly[i]));
    }
    const loopTotalLen = Math.max(1, cumLen[cumLen.length - 1]);
    const N_SAMPLES = 64;
    const loopSamples: { x: number; y: number }[] = [];
    let segPtr = 0;
    for (let k = 0; k < N_SAMPLES; k++) {
      const targetS = (k / N_SAMPLES) * loopTotalLen;
      while (segPtr < cumLen.length - 2 && cumLen[segPtr + 1] < targetS) {
        segPtr++;
      }
      const s0 = cumLen[segPtr];
      const s1 = cumLen[segPtr + 1];
      const t = s1 > s0 ? (targetS - s0) / (s1 - s0) : 0;
      loopSamples.push({
        x: closedPoly[segPtr].x + (closedPoly[segPtr + 1].x - closedPoly[segPtr].x) * t,
        y: closedPoly[segPtr].y + (closedPoly[segPtr + 1].y - closedPoly[segPtr].y) * t,
      });
    }

    // Compute local turning angle (in degrees) at each of the 64 samples using a ±4-step wrap-around chord (~6.25% of perimeter)
    const bendDegs: number[] = new Array(N_SAMPLES).fill(0);
    let flatSampleCount = 0;
    const STEP = 4;
    for (let k = 0; k < N_SAMPLES; k++) {
      const prev = loopSamples[(k - STEP + N_SAMPLES) % N_SAMPLES];
      const curr = loopSamples[k];
      const next = loopSamples[(k + STEP) % N_SAMPLES];
      const v1x = curr.x - prev.x;
      const v1y = curr.y - prev.y;
      const v2x = next.x - curr.x;
      const v2y = next.y - curr.y;
      const m1 = Math.hypot(v1x, v1y);
      const m2 = Math.hypot(v2x, v2y);
      if (m1 > 1e-3 && m2 > 1e-3) {
        const cosB = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (m1 * m2)));
        const deg = (Math.acos(cosB) * 180) / Math.PI;
        bendDegs[k] = deg;
        if (deg < 16) flatSampleCount++;
      }
    }
    const flatSideRatio = flatSampleCount / N_SAMPLES;

    // Count distinct wrap-around corner peaks (local maxima with bend >= 38°, separated by >= 7 samples around the loop)
    const peakIndices: number[] = [];
    for (let k = 0; k < N_SAMPLES; k++) {
      const b = bendDegs[k];
      if (b < 38) continue;
      let isLocalMax = true;
      for (let d = -3; d <= 3; d++) {
        if (d !== 0 && bendDegs[(k + d + N_SAMPLES) % N_SAMPLES] > b) {
          isLocalMax = false;
          break;
        }
      }
      if (isLocalMax) {
        const tooClose = peakIndices.some((pi) => {
          const diff = Math.abs(k - pi);
          return Math.min(diff, N_SAMPLES - diff) < 7;
        });
        if (!tooClose) {
          peakIndices.push(k);
        }
      }
    }
    const loopCornerCount = peakIndices.length;

    // 2e. Corner-Anchored RDP Polygon Extraction:
    // Rotate rawPoints so index 0 is the point farthest from the center (guaranteed to be a true polygon vertex, never mid-side!)
    let farthestIdx = 0;
    let maxNormDist = -1;
    for (let i = 0; i < rawPoints.length; i++) {
      const nd = Math.hypot((rawPoints[i].x - cx) / rx, (rawPoints[i].y - cy) / ry);
      if (nd > maxNormDist) {
        maxNormDist = nd;
        farthestIdx = i;
      }
    }
    const rotatedLoop: BezierPoint[] = [
      ...rawPoints.slice(farthestIdx),
      ...rawPoints.slice(0, farthestIdx),
      rawPoints[farthestIdx],
    ];

    const rdp = rdpSimplify(rotatedLoop, diag * 0.062);
    const mergedCorners: BezierPoint[] = [];
    for (const pt of rdp) {
      if (mergedCorners.length === 0 || distance(mergedCorners[mergedCorners.length - 1], pt) > diag * 0.14) {
        mergedCorners.push(pt);
      }
    }
    if (mergedCorners.length > 2 && distance(mergedCorners[0], mergedCorners[mergedCorners.length - 1]) < diag * 0.20) {
      mergedCorners.pop();
    }

    // Filter out collinear mid-side vertices (require corner turn angle > 34°, cosTurn < 0.829)
    const trueCorners: BezierPoint[] = [];
    const nC = mergedCorners.length;
    if (nC >= 3) {
      for (let i = 0; i < nC; i++) {
        const prev = mergedCorners[(i - 1 + nC) % nC];
        const curr = mergedCorners[i];
        const next = mergedCorners[(i + 1) % nC];
        const v1x = curr.x - prev.x,
          v1y = curr.y - prev.y;
        const v2x = next.x - curr.x,
          v2y = next.y - curr.y;
        const m1 = Math.hypot(v1x, v1y);
        const m2 = Math.hypot(v2x, v2y);
        if (m1 < 1 || m2 < 1) continue;
        const cosTurn = (v1x * v2x + v1y * v2y) / (m1 * m2);
        if (cosTurn < 0.829) {
          trueCorners.push(curr);
        }
      }
    }

    // Measure how closely rawPoints hug the extracted polygon's straight edges (polyEdgeErr)
    let polyEdgeErr = Infinity;
    if (trueCorners.length >= 3 && trueCorners.length <= 6) {
      let sumPolyDist = 0;
      const m = trueCorners.length;
      for (const p of rawPoints) {
        let minEdgeD = Infinity;
        for (let k = 0; k < m; k++) {
          const a = trueCorners[k];
          const b = trueCorners[(k + 1) % m];
          const d = distToSeg(p.x, p.y, a.x, a.y, b.x, b.y);
          if (d < minEdgeD) minEdgeD = d;
        }
        sumPolyDist += minEdgeD / diag;
      }
      polyEdgeErr = sumPolyDist / rawPoints.length;
    }

    // A. Triangle (3 distinct corners, polygon edge fit beats ellipse fit)
    if (
      trueCorners.length === 3 &&
      loopCornerCount >= 2 &&
      polyEdgeErr < ellipseDistErr * 0.90 &&
      ellipseDistErr > 0.042
    ) {
      const [p0, p1, p2] = trueCorners;
      return {
        shapeType: 'triangle',
        points: makePolygonBezier([p0, p1, p2]),
      };
    }

    // B. Square / Rectangle / Parallelogram vs Circle / Ellipse:
    // Compare the best 4-sided straight-edge model (bestQuadErr) directly against the smooth Ellipse model (ellipseDistErr),
    // combined with wrap-around corner count, flat-side ratio, and diagonal corner expansion!
    const bestQuadErr = trueCorners.length === 4 ? Math.min(rectErr, polyEdgeErr) : rectErr;
    const isBoxLike =
      // Case 1: 4-sided polygon/box model fits the stroke better than the ellipse, backed by corners & flat sides
      (bestQuadErr < ellipseDistErr * 0.96 &&
        (loopCornerCount >= 3 || trueCorners.length === 4) &&
        (flatSideRatio >= 0.26 || diagonalExpansion >= 1.075 || avgBoxCornerDist < 0.115)) ||
      // Case 2: Clear 4-corner axis-aligned box with diagonal corner expansion & flat sides (even if drawn fast with soft corners)
      (avgBoxCornerDist < 0.105 &&
        diagonalExpansion >= 1.085 &&
        rectErr < ellipseDistErr * 1.05 &&
        (loopCornerCount >= 3 || flatSideRatio >= 0.30));

    if (isBoxLike) {
      if (trueCorners.length === 4) {
        const [p0, p1, p2] = trueCorners;
        const v1x = p1.x - p0.x,
          v1y = p1.y - p0.y;
        const v2x = p2.x - p1.x,
          v2y = p2.y - p1.y;
        const cosAngle =
          (v1x * v2x + v1y * v2y) / (Math.max(1, Math.hypot(v1x, v1y)) * Math.max(1, Math.hypot(v2x, v2y)));

        // Tilted Parallelogram
        if (Math.abs(cosAngle) >= 0.26 && polyEdgeErr < rectErr * 0.85) {
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

      // Check if it's a Square (width and height within 18% of each other) vs Rectangle
      const isSquare = Math.abs(w - h) < Math.max(w, h) * 0.18;
      const halfW = isSquare ? (w + h) / 4 : w / 2;
      const halfH = isSquare ? (w + h) / 4 : h / 2;
      const rectPts = [
        { x: cx - halfW, y: cy - halfH },
        { x: cx + halfW, y: cy - halfH },
        { x: cx + halfW, y: cy + halfH },
        { x: cx - halfW, y: cy + halfH },
      ];
      return {
        shapeType: 'rectangle',
        points: makePolygonBezier(rectPts),
      };
    }

    // C. Smooth closed loop -> Perfect Circle (equal radius) or Ellipse (4 cardinal 90° nodes)!
    const isCircle = Math.abs(w - h) < Math.max(w, h) * 0.28;
    const finalRx = isCircle ? (w + h) / 4 : rx;
    const finalRy = isCircle ? (w + h) / 4 : ry;
    return {
      shapeType: isCircle ? 'circle' : 'ellipse',
      points: makeEllipseBezier(cx, cy, finalRx, finalRy),
    };
  }

  // 3. Open Mathematical Curves:
  //    - Sine ('sine') & Cosine ('cosine') waves -> 2 interactive handles (Peak + Right Endpoint)
  //    - Parabola ('parabola'), Hyperbola ('hyperbola'), Circular Arc ('arc') -> 3 handles (2 Endpoints + 1 Middle)
  if (!isClosed && totalLen > 36) {
    const yMid = (minY + maxY) / 2;
    const amp = Math.max(18, h / 2);

    // A. Check if stroke is a Sine or Cosine wave (oscillates across yMid with >= 2 lobes)
    if (w > 50 && h > 20) {
      // Sort or walk points along X and count significant extrema / zero-crossings around yMid
      let crossings = 0;
      let lastSign = 0;
      const deadband = Math.max(4, amp * 0.18);
      let firstLobeSign = 0;

      for (const p of rawPoints) {
        const dy = p.y - yMid;
        if (Math.abs(dy) > deadband) {
          const sign = dy < 0 ? 1 : -1; // +1 = above midline (screen Y smaller), -1 = below midline
          if (firstLobeSign === 0) firstLobeSign = sign;
          if (lastSign !== 0 && sign !== lastSign) {
            crossings++;
          }
          lastSign = sign;
        }
      }

      // At least 1 crossing (2 half-lobes = 1 full wave period) and predominantly horizontal progression
      if (crossings >= 1 && Math.abs(end.x - start.x) > w * 0.65) {
        const halfCycles = Math.max(2, Math.min(6, crossings + 1));
        const startDistFromMid = Math.abs(start.y - yMid);
        const isCosine = startDistFromMid >= amp * 0.48;
        const leftX = Math.min(start.x, end.x);
        const rightX = Math.max(start.x, end.x);
        const spanW = Math.max(80, rightX - leftX);
        const signDir = firstLobeSign !== 0 ? firstLobeSign : 1;

        if (isCosine) {
          return {
            shapeType: 'cosine',
            points: makeWaveBezierPoints('cosine', leftX, yMid, spanW, amp, halfCycles, -signDir),
          };
        } else {
          return {
            shapeType: 'sine',
            points: makeWaveBezierPoints('sine', leftX, yMid, spanW, amp, halfCycles, signDir),
          };
        }
      }
    }

    // B. Single-Arch Open Curve -> Symmetrical Circular Arc ('arc'), Parabola ('parabola'), or Hyperbola ('hyperbola')
    //    Strictly 3 Control Points: [Endpoint 1, Middle Apex, Endpoint 2]
    let maxPerpDist = 0;
    let apexIdx = Math.floor(rawPoints.length / 2);
    for (let i = 1; i < rawPoints.length - 1; i++) {
      const d = perpendicularDistance(rawPoints[i], start, end);
      if (d > maxPerpDist) {
        maxPerpDist = d;
        apexIdx = i;
      }
    }

    if (maxPerpDist > 14 && directDist > 28) {
      let x0 = start.x,
        y0 = start.y;
      let x2 = end.x,
        y2 = end.y;

      // Symmetrize endpoints: if chord is nearly horizontal or vertical (within 16°), level the endpoints!
      const chordAngleDeg = (Math.atan2(y2 - y0, x2 - x0) * 180) / Math.PI;
      const absChordDeg = Math.abs(chordAngleDeg);
      if (absChordDeg < 16 || absChordDeg > 164) {
        const avgY = (y0 + y2) / 2;
        y0 = avgY;
        y2 = avgY;
      } else if (Math.abs(absChordDeg - 90) < 16) {
        const avgX = (x0 + x2) / 2;
        x0 = avgX;
        x2 = avgX;
      }

      const chordMidX = (x0 + x2) / 2;
      const chordMidY = (y0 + y2) / 2;
      const cdx = x2 - x0;
      const cdy = y2 - y0;
      const chordLen = Math.max(20, Math.hypot(cdx, cdy));
      // Unit normal perpendicular to chord
      const nx = -cdy / chordLen;
      const ny = cdx / chordLen;

      const rawApex = rawPoints[apexIdx];
      const signedH = (rawApex.x - chordMidX) * nx + (rawApex.y - chordMidY) * ny;
      const symMidX = chordMidX + nx * signedH;
      const symMidY = chordMidY + ny * signedH;

      // Measure width at half-height (0.5 * signedH) to distinguish Arc vs Parabola vs Hyperbola
      const halfH = signedH * 0.5;
      let minHalfProj = Infinity;
      let maxHalfProj = -Infinity;
      const ux = cdx / chordLen;
      const uy = cdy / chordLen;

      for (const p of rawPoints) {
        const pH = (p.x - chordMidX) * nx + (p.y - chordMidY) * ny;
        if (Math.abs(pH - halfH) < Math.abs(signedH) * 0.22) {
          const projU = (p.x - chordMidX) * ux + (p.y - chordMidY) * uy;
          if (projU < minHalfProj) minHalfProj = projU;
          if (projU > maxHalfProj) maxHalfProj = projU;
        }
      }

      const halfWidthRatio =
        maxHalfProj > minHalfProj ? (maxHalfProj - minHalfProj) / chordLen : 0.7;
      const archRatio = Math.abs(signedH) / chordLen;

      let curveType: 'arc' | 'parabola' | 'hyperbola' = 'parabola';
      if (archRatio < 0.36 || halfWidthRatio > 0.77) {
        curveType = 'arc';
      } else if (halfWidthRatio < 0.61) {
        curveType = 'hyperbola';
      } else {
        curveType = 'parabola';
      }

      return {
        shapeType: curveType,
        points: [
          { x: x0, y: y0, pressure: 0.7 },
          { x: symMidX, y: symMidY, pressure: 0.7 },
          { x: x2, y: y2, pressure: 0.7 },
        ],
      };
    }
  }

  // Fallback for open flat strokes: if the user held the pen to snap an open segment that didn't arch enough to be a curve,
  // always perfect it into a clean straight line ('line') rather than leaving it unperfected!
  if (!isClosed && lineDist >= 8 && maxPerpDev < Math.max(24, lineDist * 0.20)) {
    return snapLineFromStartTo(lineEnd);
  }

  return null;
}

/**
 * Generates a `2 * halfCycles + 1` node cubic Bézier spline for a Sine ('sine') or Cosine ('cosine') wave
 * (5 nodes for 1 period: Left Endpoint, 1st Quarter, Center, 3rd Quarter, Right Endpoint) with exact cubic
 * Bézier handles so both endpoints are true editable/connectable nodes and there are no text labels.
 */
export function makeWaveBezierPoints(
  shapeType: 'sine' | 'cosine',
  leftX: number,
  yMid: number,
  spanW: number,
  amp: number,
  halfCycles = 2,
  signDir = 1
): BezierPoint[] {
  const numHalf = Math.max(1, Math.round(halfCycles));
  const numQuarters = numHalf * 2;
  const evalWave = (u: number): { x: number; y: number } => {
    const theta = u * numHalf * Math.PI;
    const x = leftX + u * spanW;
    const y =
      shapeType === 'sine'
        ? yMid - signDir * amp * Math.sin(theta)
        : yMid + signDir * amp * Math.cos(theta);
    return { x, y };
  };

  const nodes: BezierPoint[] = [];
  for (let j = 0; j <= numQuarters; j++) {
    const u = j / numQuarters;
    const pt = evalWave(u);
    nodes.push({
      x: pt.x,
      y: pt.y,
      pressure: 0.7,
      smooth: false,
      twist: 777,
    });
  }

  for (let j = 0; j < numQuarters; j++) {
    const u0 = j / numQuarters;
    const u3 = (j + 1) / numQuarters;
    const p0 = nodes[j];
    const p3 = nodes[j + 1];
    const q1 = evalWave(u0 + (u3 - u0) / 3);
    const q2 = evalWave(u0 + (2 * (u3 - u0)) / 3);
    const cp1x = (-5 * p0.x + 18 * q1.x - 9 * q2.x + 2 * p3.x) / 6;
    const cp1y = (-5 * p0.y + 18 * q1.y - 9 * q2.y + 2 * p3.y) / 6;
    const cp2x = (2 * p0.x - 9 * q1.x + 18 * q2.x - 5 * p3.x) / 6;
    const cp2y = (2 * p0.y - 9 * q1.y + 18 * q2.y - 5 * p3.y) / 6;
    p0.outDx = cp1x - p0.x;
    p0.outDy = cp1y - p0.y;
    p3.inDx = cp2x - p3.x;
    p3.inDy = cp2y - p3.y;
  }

  return nodes;
}

/**
 * Upgrades any legacy 2/3-point parametric `'sine'` or `'cosine'` stroke into a 5-node (or `2 * halfCycles + 1`-node)
 * cubic Bézier wave spline so both endpoints and all extrema/zero-crossings are normal editable nodes.
 */
export function ensureWaveBezierPoints(s: {
  shapeType?: string;
  points: BezierPoint[];
}): BezierPoint[] {
  if (
    (s.shapeType === 'sine' || s.shapeType === 'cosine') &&
    s.points.length >= 2 &&
    s.points.length <= 3 &&
    s.points[0]?.outDx === undefined &&
    s.points[1]?.inDx === undefined
  ) {
    const pPeak = s.points[0];
    const pEnd = s.points[1];
    const pStart = s.points[2] || {
      x: pPeak.x - (pEnd.x - pPeak.x) / 3,
      y: pEnd.y,
      twist: 2,
    };
    const dx = pEnd.x - pStart.x;
    const dy = pEnd.y - pStart.y;
    const spanL = Math.hypot(dx, dy) || 1;
    const ux = dx / spanL;
    const uy = dy / spanL;
    const nx = uy;
    const ny = -ux;
    const amp = (pPeak.x - pStart.x) * nx + (pPeak.y - pStart.y) * ny;
    const numHalf = Math.max(1, Math.round(pStart.twist || 2));
    const numQuarters = numHalf * 2;
    const evalRotWave = (u: number): { x: number; y: number } => {
      const along = u * spanL;
      const waveOffset =
        s.shapeType === 'sine'
          ? amp * Math.sin(u * numHalf * Math.PI)
          : -amp * Math.cos(u * numHalf * Math.PI);
      return {
        x: pStart.x + along * ux + waveOffset * nx,
        y: pStart.y + along * uy + waveOffset * ny,
      };
    };
    const nodes: BezierPoint[] = [];
    for (let j = 0; j <= numQuarters; j++) {
      const pt = evalRotWave(j / numQuarters);
      nodes.push({
        x: pt.x,
        y: pt.y,
        pressure: pPeak.pressure ?? 0.7,
        smooth: false,
        twist: 777,
      });
    }
    for (let j = 0; j < numQuarters; j++) {
      const u0 = j / numQuarters;
      const u3 = (j + 1) / numQuarters;
      const p0 = nodes[j];
      const p3 = nodes[j + 1];
      const q1 = evalRotWave(u0 + (u3 - u0) / 3);
      const q2 = evalRotWave(u0 + (2 * (u3 - u0)) / 3);
      const cp1x = (-5 * p0.x + 18 * q1.x - 9 * q2.x + 2 * p3.x) / 6;
      const cp1y = (-5 * p0.y + 18 * q1.y - 9 * q2.y + 2 * p3.y) / 6;
      const cp2x = (2 * p0.x - 9 * q1.x + 18 * q2.x - 5 * p3.x) / 6;
      const cp2y = (2 * p0.y - 9 * q1.y + 18 * q2.y - 5 * p3.y) / 6;
      p0.outDx = cp1x - p0.x;
      p0.outDy = cp1y - p0.y;
      p3.inDx = cp2x - p3.x;
      p3.inDy = cp2y - p3.y;
    }
    return nodes;
  }
  return s.points;
}

export function makePolygonBezier(corners: { x: number; y: number }[]): BezierPoint[] {
  const pts: BezierPoint[] = [{ x: corners[0].x, y: corners[0].y, pressure: 0.7 }];
  for (let i = 1; i <= corners.length; i++) {
    const curr = corners[i % corners.length];
    pts.push({
      x: curr.x,
      y: curr.y,
      pressure: 0.7,
    });
  }
  return pts;
}

export function makeEllipseBezier(cx: number, cy: number, rx: number, ry: number): BezierPoint[] {
  // Strictly 4 cardinal nodes every 90 degrees (Top 270°, Right 0°, Bottom 90°, Left 180°)
  return [
    { x: cx, y: cy - ry, pressure: 0.7 },
    { x: cx + rx, y: cy, pressure: 0.7 },
    { x: cx, y: cy + ry, pressure: 0.7 },
    { x: cx - rx, y: cy, pressure: 0.7 },
  ];
}

/**
 * Computes the high-precision polyline points for a Physics Resistor ('resistor' with 10 zig-zag peaks/valleys)
 * or Helical Coiled Spring ('spring' with 9 full coils / σπείρες) mapped onto the 4 bounding quad corners.
 * Supports 360° rotation, proportional corner scaling, and independent width/height side stretching!
 */
export function computeResistorOrSpringPoints(
  shapeType: 'resistor' | 'spring',
  corners: BezierPoint[]
): BezierPoint[] {
  if (corners.length < 4) return corners;
  const [q0, q1, q2, q3] = corners;
  const bilerp = (u: number, v: number): BezierPoint => ({
    x: (1 - u) * (1 - v) * q0.x + u * (1 - v) * q1.x + u * v * q2.x + (1 - u) * v * q3.x,
    y: (1 - u) * (1 - v) * q0.y + u * (1 - v) * q1.y + u * v * q2.y + (1 - u) * v * q3.y,
    pressure: 0.7,
  });

  if (shapeType === 'resistor') {
    // 10 zig-zag peaks/valleys (5 top crests + 5 bottom troughs) with straight lead terminals on both ends
    const uStart = 0.12;
    const uEnd = 0.88;
    const uSpan = uEnd - uStart;
    const numPeaks = 10;
    const out: BezierPoint[] = [bilerp(0, 0.5), bilerp(uStart, 0.5)];
    for (let k = 0; k < numPeaks; k++) {
      const u = uStart + ((k + 0.5) / numPeaks) * uSpan;
      const v = k % 2 === 0 ? 0.04 : 0.96;
      out.push(bilerp(u, v));
    }
    out.push(bilerp(uEnd, 0.5));
    out.push(bilerp(1, 0.5));
    return out;
  }

  // Helical coiled spring ('spring') with 9 full inner coils (σπείρες) and straight lead ends
  const uStart = 0.08;
  const uEnd = 0.92;
  const numCoils = 9;
  const ru = 0.038;
  const rv = 0.46;
  const theta0 = -Math.PI / 2;
  const theta1 = 2 * Math.PI * numCoils + Math.PI / 2;
  const dTheta = theta1 - theta0;
  const steps = 216;

  const out: BezierPoint[] = [bilerp(0, 0.5)];
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const theta = theta0 + s * dTheta;
    const uBase = uStart + ru + s * (uEnd - ru - (uStart + ru));
    const u = uBase + ru * Math.sin(theta);
    const v = 0.5 - rv * Math.cos(theta);
    out.push(bilerp(u, v));
  }
  out.push(bilerp(1, 0.5));
  return out;
}

function buildPresetShape(
  start: BezierPoint,
  end: BezierPoint,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  preset: ShapePresetType,
  rawPoints: BezierPoint[] = []
): { points: BezierPoint[]; shapeType: string } {
  const w = Math.max(40, maxX - minX);
  const h = Math.max(32, maxY - minY);
  if (preset === 'line' || preset === 'arrow' || preset === 'double-arrow') {
    let x2 = end.x;
    let y2 = end.y;
    const angleDeg = (Math.atan2(y2 - start.y, x2 - start.x) * 180) / Math.PI;
    const absAngle = Math.abs(angleDeg);
    if (absAngle < 5.5 || absAngle > 174.5) {
      y2 = start.y;
    } else if (Math.abs(absAngle - 90) < 5.5) {
      x2 = start.x;
    }
    return {
      shapeType: preset,
      points: [
        { x: start.x, y: start.y, pressure: 0.7 },
        { x: x2, y: y2, pressure: 0.7 },
      ],
    };
  }
  if (preset === 'sine') {
    const yAxis = (minY + maxY) / 2;
    const amp = Math.max(24, h / 2);
    return {
      shapeType: 'sine',
      points: makeWaveBezierPoints('sine', minX, yAxis, w, amp, 2, 1),
    };
  }
  if (preset === 'cosine') {
    const yAxis = (minY + maxY) / 2;
    const amp = Math.max(24, h / 2);
    return {
      shapeType: 'cosine',
      points: makeWaveBezierPoints('cosine', minX, yAxis, w, amp, 2, 1),
    };
  }
  if (preset === 'hyperbola') {
    // Rectangular / Inverse-Proportional Hyperbola branch (y = c/x style, e.g. isothermal P-V curve):
    // Respects the exact start/end direction and whether the user drew it with concavity up (κοίλα πάνω) or down (κοίλα κάτω)!
    const x0 = start.x <= end.x ? minX : minX + w;
    const x2 = start.x <= end.x ? minX + w : minX;
    const y0 = start.y <= end.y ? minY : minY + h;
    const y2 = start.y <= end.y ? minY + h : minY;

    const cornerA = { x: x0, y: y2 };
    const cornerB = { x: x2, y: y0 };
    let sumDistA = 0;
    let sumDistB = 0;
    const iStart = Math.max(0, Math.floor(rawPoints.length * 0.18));
    const iEnd = Math.min(rawPoints.length - 1, Math.ceil(rawPoints.length * 0.82));
    for (let i = iStart; i <= iEnd; i++) {
      const rp = rawPoints[i];
      sumDistA += Math.hypot(rp.x - cornerA.x, rp.y - cornerA.y);
      sumDistB += Math.hypot(rp.x - cornerB.x, rp.y - cornerB.y);
    }
    const asymCorner = sumDistA <= sumDistB ? cornerA : cornerB;
    const midX = (x0 + x2) / 2;
    const midY = (y0 + y2) / 2;
    const wHyp = 1.85;
    const ratio = wHyp / (1 + wHyp);

    return {
      shapeType: 'hyperbola',
      points: [
        { x: x0, y: y0, pressure: 0.7 },
        {
          x: midX + ratio * (asymCorner.x - midX),
          y: midY + ratio * (asymCorner.y - midY),
          pressure: 0.7,
        },
        { x: x2, y: y2, pressure: 0.7 },
      ],
    };
  }
  if (preset === 'parabola' || preset === 'arc') {
    const isInverted = start.y > minY + h * 0.5 && end.y > minY + h * 0.5;
    const yEnds = isInverted ? minY + h : minY;
    const yVertex = isInverted ? minY : minY + h;
    return {
      shapeType: preset,
      points: [
        { x: minX, y: yEnds, pressure: 0.7 },
        { x: minX + w / 2, y: yVertex, pressure: 0.7 },
        { x: minX + w, y: yEnds, pressure: 0.7 },
      ],
    };
  }
  if (preset === 'cuboid' || preset === 'cylinder' || preset === 'sphere' || preset === 'pyramid') {
    const w3d = Math.max(72, maxX - minX);
    const h3d = Math.max(72, maxY - minY);
    const cx = minX + w3d / 2;
    const cy = minY + h3d / 2;
    const isNearSquare = Math.abs(w3d - h3d) < Math.max(w3d, h3d) * 0.24;
    const finalW = preset === 'sphere' || (preset === 'cuboid' && isNearSquare) ? (w3d + h3d) / 2 : w3d;
    const finalH = preset === 'sphere' || (preset === 'cuboid' && isNearSquare) ? (w3d + h3d) / 2 : h3d;
    const halfW = finalW / 2;
    const halfH = finalH / 2;
    return {
      shapeType: preset,
      points: makePolygonBezier([
        { x: cx - halfW, y: cy - halfH },
        { x: cx + halfW, y: cy - halfH },
        { x: cx + halfW, y: cy + halfH },
        { x: cx - halfW, y: cy + halfH },
      ]),
    };
  }
  if (preset === 'resistor' || preset === 'spring') {
    const rawW = maxX - minX;
    const rawH = maxY - minY;
    const isVertical = rawH > rawW * 1.35;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    if (isVertical) {
      const spanLen = Math.max(120, rawH);
      const defaultThick = Math.max(42, Math.min(72, spanLen * 0.3));
      const thick = rawW < 32 ? defaultThick : Math.max(38, rawW);
      const halfW = thick / 2;
      const halfH = spanLen / 2;
      return {
        shapeType: preset,
        points: makePolygonBezier([
          { x: cx + halfW, y: cy - halfH },
          { x: cx + halfW, y: cy + halfH },
          { x: cx - halfW, y: cy + halfH },
          { x: cx - halfW, y: cy - halfH },
        ]),
      };
    } else {
      const spanLen = Math.max(120, rawW);
      const defaultThick = Math.max(42, Math.min(72, spanLen * 0.3));
      const thick = rawH < 32 ? defaultThick : Math.max(38, rawH);
      const halfW = spanLen / 2;
      const halfH = thick / 2;
      return {
        shapeType: preset,
        points: makePolygonBezier([
          { x: cx - halfW, y: cy - halfH },
          { x: cx + halfW, y: cy - halfH },
          { x: cx + halfW, y: cy + halfH },
          { x: cx - halfW, y: cy + halfH },
        ]),
      };
    }
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
  if (preset === 'trapezoid') {
    const inset = Math.min(w * 0.22, 48);
    return {
      shapeType: 'trapezoid',
      points: makePolygonBezier([
        { x: minX + inset, y: minY },
        { x: minX + w - inset, y: minY },
        { x: minX + w, y: minY + h },
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
/**
 * Computes the 4 closed-polygon Bezier corners of a rectangular block resting flush
 * on the hypotenuse (pSlopeStart -> pSlopePeak) of an inclined-plane triangle
 * whose right-angle base corner is pBaseCorner.
 * Invariant under rotation, horizontal/vertical mirror, and non-uniform scaling!
 */
export function computeInclinedPlaneBlockPoints(
  pSlopeStart: { x: number; y: number },
  pBaseCorner: { x: number; y: number },
  pSlopePeak: { x: number; y: number },
  tCenter = 0.52,
  blockLenRatio = 0.27,
  blockAspect = 0.64
): BezierPoint[] {
  const dx = pSlopePeak.x - pSlopeStart.x;
  const dy = pSlopePeak.y - pSlopeStart.y;
  const slopeLen = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / slopeLen;
  const uy = dy / slopeLen;

  // Choose the unit normal perpendicular to the hypotenuse that points AWAY from pBaseCorner
  const midX = (pSlopeStart.x + pSlopePeak.x) / 2;
  const midY = (pSlopeStart.y + pSlopePeak.y) / 2;
  const toMidX = midX - pBaseCorner.x;
  const toMidY = midY - pBaseCorner.y;
  let nx = uy;
  let ny = -ux;
  if (nx * toMidX + ny * toMidY < 0) {
    nx = -uy;
    ny = ux;
  }

  const blockL = Math.max(18, slopeLen * blockLenRatio);
  const blockH = Math.max(12, blockL * blockAspect);
  const baseCenterX = pSlopeStart.x + dx * tCenter;
  const baseCenterY = pSlopeStart.y + dy * tCenter;
  const halfL = blockL / 2;

  const b1 = {
    x: baseCenterX - ux * halfL,
    y: baseCenterY - uy * halfL,
  };
  const b2 = {
    x: baseCenterX + ux * halfL,
    y: baseCenterY + uy * halfL,
  };
  const t2 = {
    x: b2.x + nx * blockH,
    y: b2.y + ny * blockH,
  };
  const t1 = {
    x: b1.x + nx * blockH,
    y: b1.y + ny * blockH,
  };

  return makePolygonBezier([b1, b2, t2, t1]);
}

export function createPhysicsStencilStrokes(
  preset:
    | 'cylinder'
    | 'axes'
    | 'wave-axes'
    | 'resistor'
    | 'bulb'
    | 'battery'
    | 'voltage-source'
    | 'inclined-plane'
    | 'switch'
    | 'fan',
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  layerId: string,
  guideColor = '#2563eb',
  switchClosed = true
): StrokeObject[] {
  const groupId =
    preset === 'wave-axes'
      ? `wave-axes-grp-${Date.now()}`
      : preset === 'inclined-plane'
        ? `incline-grp-${Date.now()}`
        : preset === 'switch'
          ? `switch-grp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
          : preset === 'fan'
            ? `fan-grp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
            : `group-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
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
        { x: x + w, y: y + h, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-x',
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
        { x, y, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-y',
    });
  } else if (preset === 'wave-axes') {
    // Oscillation / Wave Axes Diagram:
    // 1. Vertical axis (bottom to top with upward arrow)
    // 2. Central horizontal axis (left to right at yMid with rightward arrow)
    // 3. Upper & Lower dashed horizontal amplitude guides (+A / -A) with independent color & vertical movement!
    const yMid = y + h / 2;
    const amp = Math.max(18, h * 0.34);
    const yTop = yMid - amp;
    const yBot = yMid + amp;
    const guideRightX = x + Math.max(40, w - Math.min(20, w * 0.045));
    const axisColor = '#111827';

    // 1. Vertical Y-axis (bottom -> top with arrow)
    out.push({
      id: `st-${Date.now()}-way`,
      tool: 'pen',
      color: axisColor,
      width: 2.8,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x, y: y + h, pressure: 0.7 },
        { x, y, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-y',
    });

    // 2. Horizontal X/t-axis (middle left -> middle right with arrow)
    out.push({
      id: `st-${Date.now()}-wax`,
      tool: 'pen',
      color: axisColor,
      width: 2.8,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x, y: yMid, pressure: 0.7 },
        { x: x + w, y: yMid, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-x',
    });

    // 3. Top Dashed Guide (+A) — strictly straight & parallel to horizontal axis
    out.push({
      id: `st-${Date.now()}-wgt`,
      tool: 'pen',
      color: guideColor,
      width: 2.2,
      opacity: 1,
      lineStyle: 'dashed',
      points: [
        { x, y: yTop, pressure: 0.7 },
        { x: guideRightX, y: yTop, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-guide-top',
    });

    // 4. Bottom Dashed Guide (-A) — strictly straight & parallel to horizontal axis
    out.push({
      id: `st-${Date.now()}-wgb`,
      tool: 'pen',
      color: guideColor,
      width: 2.2,
      opacity: 1,
      lineStyle: 'dashed',
      points: [
        { x, y: yBot, pressure: 0.7 },
        { x: guideRightX, y: yBot, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-guide-bottom',
    });
  } else if (preset === 'resistor') {
    const corners = makePolygonBezier([
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h },
    ]);
    out.push({
      id: `st-${Date.now()}-res`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: corners,
      layerId,
      groupId,
      isShape: true,
      shapeType: 'resistor',
    });
  } else if (preset === 'bulb') {
    // Light Bulb (Λαμπτήρας) matching the user's sketch:
    // Top pear/rounded glass dome tapering smoothly into a threaded screw base at the bottom.
    const cx = x + w / 2;
    const domeRx = Math.max(14, w * 0.44);
    const domeRy = Math.max(14, h * 0.34);
    const domeCy = y + domeRy + h * 0.02;
    const neckY = y + h * 0.66;
    const baseRx = Math.max(8, domeRx * 0.52);
    const baseBotY = y + h * 0.93;
    const tipBotY = y + h;

    // Build smooth bulb glass dome + tapering neck contour (from left neck -> up around crown -> right neck)
    const domePts: BezierPoint[] = [];
    // Left neck to left dome equator (smooth S-taper)
    const leftEqAngle = Math.PI * 0.85;
    const rightEqAngle = Math.PI * 0.15;
    const leftNeckPt = { x: cx - baseRx, y: neckY, pressure: 0.7 };
    domePts.push(leftNeckPt);
    const taperSteps = 8;
    const leftEqX = cx + domeRx * Math.cos(leftEqAngle);
    const leftEqY = domeCy + domeRy * Math.sin(leftEqAngle);
    for (let i = 1; i <= taperSteps; i++) {
      const t = i / taperSteps;
      const ease = t * t * (3 - 2 * t);
      const px = leftNeckPt.x + (leftEqX - leftNeckPt.x) * ease;
      const py = leftNeckPt.y + (leftEqY - leftNeckPt.y) * t;
      const prev = domePts[domePts.length - 1];
      domePts.push({
        x: px,
        y: py,
        cx: (prev.x + px) / 2,
        cy: (prev.y + py) / 2,
        pressure: 0.7,
      });
    }
    // Crown arc from leftEqAngle (0.85*PI) through top (1.5*PI) to rightEqAngle (2.15*PI)
    const startCrown = leftEqAngle;
    const endCrown = Math.PI * 2 + rightEqAngle;
    const crownSteps = 28;
    for (let i = 1; i <= crownSteps; i++) {
      const ang = startCrown + ((endCrown - startCrown) * i) / crownSteps;
      const px = cx + domeRx * Math.cos(ang);
      const py = domeCy + domeRy * Math.sin(ang);
      const prev = domePts[domePts.length - 1];
      domePts.push({
        x: px,
        y: py,
        cx: (prev.x + px) / 2,
        cy: (prev.y + py) / 2,
        pressure: 0.7,
      });
    }
    // Right dome equator down to right neck
    const rightEqX = cx + domeRx * Math.cos(rightEqAngle);
    const rightEqY = domeCy + domeRy * Math.sin(rightEqAngle);
    const rightNeckPt = { x: cx + baseRx, y: neckY };
    for (let i = 1; i <= taperSteps; i++) {
      const t = i / taperSteps;
      const ease = t * t * (3 - 2 * t);
      const px = rightEqX + (rightNeckPt.x - rightEqX) * ease;
      const py = rightEqY + (rightNeckPt.y - rightEqY) * t;
      const prev = domePts[domePts.length - 1];
      domePts.push({
        x: px,
        y: py,
        cx: (prev.x + px) / 2,
        cy: (prev.y + py) / 2,
        pressure: 0.7,
      });
    }

    // Continue down right side of screw base, around bottom tip, and up left side of screw base to close
    const screwSteps = 12;
    for (let i = 1; i <= screwSteps; i++) {
      const t = i / screwSteps;
      // Right screw side with slight thread wave
      const wave = Math.sin(t * Math.PI * 3) * (baseRx * 0.08);
      const px = cx + baseRx * (1 - t * 0.14) + wave;
      const py = neckY + (baseBotY - neckY) * t;
      const prev = domePts[domePts.length - 1];
      domePts.push({
        x: px,
        y: py,
        cx: (prev.x + px) / 2,
        cy: (prev.y + py) / 2,
        pressure: 0.7,
      });
    }
    // Bottom contact curve
    const botSteps = 8;
    const rBotX = cx + baseRx * 0.86;
    const lBotX = cx - baseRx * 0.86;
    for (let i = 1; i <= botSteps; i++) {
      const t = i / botSteps;
      const ang = t * Math.PI;
      const px = cx + ((rBotX - lBotX) / 2) * Math.cos(ang);
      const py = baseBotY + (tipBotY - baseBotY) * Math.sin(ang);
      const prev = domePts[domePts.length - 1];
      domePts.push({
        x: px,
        y: py,
        cx: (prev.x + px) / 2,
        cy: (prev.y + py) / 2,
        pressure: 0.7,
      });
    }
    // Left screw side up to leftNeckPt
    for (let i = 1; i <= screwSteps; i++) {
      const t = i / screwSteps;
      const wave = Math.sin((1 - t) * Math.PI * 3) * (baseRx * 0.08);
      const px = cx - baseRx * (1 - (1 - t) * 0.14) - wave;
      const py = baseBotY - (baseBotY - neckY) * t;
      const prev = domePts[domePts.length - 1];
      domePts.push({
        x: px,
        y: py,
        cx: (prev.x + px) / 2,
        cy: (prev.y + py) / 2,
        pressure: 0.7,
      });
    }

    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    out.push({
      id: `st-${uid}-bulb-body`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: domePts,
      layerId,
      groupId,
      isShape: true,
      shapeType: 'bulb',
    });

    // Spiral screw thread ribs across the base (matching the user's sketch)
    const threadFracs = [0.06, 0.36, 0.66, 0.92];
    threadFracs.forEach((frac, idx) => {
      const yL = neckY + (baseBotY - neckY) * Math.min(1, frac + 0.08);
      const yR = neckY + (baseBotY - neckY) * Math.max(0, frac - 0.04);
      const wScale = 1 - frac * 0.12;
      const xL = cx - baseRx * wScale;
      const xR = cx + baseRx * wScale;
      const midY = (yL + yR) / 2 + (baseBotY - neckY) * 0.06;
      out.push({
        id: `st-${uid}-bulb-th-${idx}`,
        tool: 'pen',
        color,
        width: 2.4,
        opacity: 1,
        points: [
          { x: xL, y: yL, pressure: 0.7 },
          { x: (xL + xR) / 2, y: midY, cx: (xL + (xL + xR) / 2) / 2, cy: (yL + midY) / 2, pressure: 0.7 },
          { x: xR, y: yR, cx: ((xL + xR) / 2 + xR) / 2, cy: (midY + yR) / 2, pressure: 0.7 },
        ],
        layerId,
        groupId,
        isShape: true,
        shapeType: 'bulb',
      });
    });
  } else if (preset === 'battery') {
    // Battery (Μπαταρία) matching the user's sketch:
    // [+]  [small protruding cap][main rectangular body]  [-]
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const cy = y + h / 2;
    const signSize = Math.max(8, Math.min(w * 0.075, h * 0.24));
    const plusCx = x + signSize * 0.95;
    const minusCx = x + w - signSize * 0.95;
    const signCy = y + h * 0.22;

    const capLeftX = x + Math.max(signSize * 2.1, w * 0.16);
    const bodyLeftX = capLeftX + Math.max(10, w * 0.1);
    const bodyRightX = x + w - Math.max(signSize * 2.1, w * 0.16);

    const bodyTopY = y + h * 0.08;
    const bodyBotY = y + h * 0.92;
    const capHalfH = (bodyBotY - bodyTopY) * 0.23;
    const capTopY = cy - capHalfH;
    const capBotY = cy + capHalfH;

    // Stepped 8-corner closed battery contour (protruding left cap + main rectangular body)
    const batteryOutline = makePolygonBezier([
      { x: bodyLeftX, y: bodyTopY },
      { x: bodyRightX, y: bodyTopY },
      { x: bodyRightX, y: bodyBotY },
      { x: bodyLeftX, y: bodyBotY },
      { x: bodyLeftX, y: capBotY },
      { x: capLeftX, y: capBotY },
      { x: capLeftX, y: capTopY },
      { x: bodyLeftX, y: capTopY },
    ]);
    out.push({
      id: `st-${uid}-bat-body`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: batteryOutline,
      layerId,
      groupId,
      isShape: true,
      shapeType: 'battery',
    });

    // '+' sign on the left (placed above the horizontal wire line so it never collides with wires/electrons!)
    out.push({
      id: `st-${uid}-bat-plus-h`,
      tool: 'pen',
      color,
      width: 2.5,
      opacity: 1,
      points: [
        { x: plusCx - signSize / 2, y: signCy, pressure: 0.7 },
        { x: plusCx + signSize / 2, y: signCy, cx: plusCx, cy: signCy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'battery',
    });
    out.push({
      id: `st-${uid}-bat-plus-v`,
      tool: 'pen',
      color,
      width: 2.5,
      opacity: 1,
      points: [
        { x: plusCx, y: signCy - signSize / 2, pressure: 0.7 },
        { x: plusCx, y: signCy + signSize / 2, cx: plusCx, cy: signCy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'battery',
    });

    // '-' sign on the right (placed above the horizontal wire line so it never collides with wires/electrons!)
    out.push({
      id: `st-${uid}-bat-minus-h`,
      tool: 'pen',
      color,
      width: 2.5,
      opacity: 1,
      points: [
        { x: minusCx - signSize / 2, y: signCy, pressure: 0.7 },
        { x: minusCx + signSize / 2, y: signCy, cx: minusCx, cy: signCy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'battery',
    });
  } else if (preset === 'voltage-source') {
    // DC Voltage Source (Πηγή Τάσης) matching the user's sketch:
    // Left horizontal wire -> tall vertical (+) plate | gap | short vertical (-) plate -> right horizontal wire
    // With '+' at top-left of tall plate and '-' at top-right of short plate
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const cy = y + h / 2;
    const cx = x + w / 2;
    const plateGap = Math.max(10, Math.min(26, w * 0.11));
    const plusPlateX = cx - plateGap / 2;
    const minusPlateX = cx + plateGap / 2;

    const tallTopY = y + h * 0.06;
    const tallBotY = y + h * 0.94;
    const shortTopY = y + h * 0.27;
    const shortBotY = y + h * 0.73;

    // 1. Left horizontal wire lead
    out.push({
      id: `st-${uid}-vs-wl`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x, y: cy, pressure: 0.7 },
        { x: plusPlateX, y: cy, cx: (x + plusPlateX) / 2, cy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'voltage-source',
    });

    // 2. Right horizontal wire lead
    out.push({
      id: `st-${uid}-vs-wr`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x: minusPlateX, y: cy, pressure: 0.7 },
        { x: x + w, y: cy, cx: (minusPlateX + x + w) / 2, cy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'voltage-source',
    });

    // 3. Tall vertical positive plate (+)
    out.push({
      id: `st-${uid}-vs-ptall`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x: plusPlateX, y: tallTopY, pressure: 0.7 },
        { x: plusPlateX, y: tallBotY, cx: plusPlateX, cy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'voltage-source',
    });

    // 4. Short vertical negative plate (-)
    out.push({
      id: `st-${uid}-vs-pshort`,
      tool: 'pen',
      color,
      width: 3.8,
      opacity: 1,
      points: [
        { x: minusPlateX, y: shortTopY, pressure: 0.7 },
        { x: minusPlateX, y: shortBotY, cx: minusPlateX, cy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'voltage-source',
    });

    // 5. '+' sign at upper-left of tall plate and '-' sign at upper-right of short plate
    const signSize = Math.max(8, Math.min(w * 0.08, h * 0.16));
    const signOffsetX = Math.max(signSize * 1.15, plateGap * 0.85);
    const signY = y + h * 0.22;
    const plusSignCx = plusPlateX - signOffsetX;
    const minusSignCx = minusPlateX + signOffsetX;

    out.push({
      id: `st-${uid}-vs-plus-h`,
      tool: 'pen',
      color,
      width: 2.4,
      opacity: 1,
      points: [
        { x: plusSignCx - signSize / 2, y: signY, pressure: 0.7 },
        { x: plusSignCx + signSize / 2, y: signY, cx: plusSignCx, cy: signY, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'voltage-source',
    });
    out.push({
      id: `st-${uid}-vs-plus-v`,
      tool: 'pen',
      color,
      width: 2.4,
      opacity: 1,
      points: [
        { x: plusSignCx, y: signY - signSize / 2, pressure: 0.7 },
        { x: plusSignCx, y: signY + signSize / 2, cx: plusSignCx, cy: signY, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'voltage-source',
    });
    out.push({
      id: `st-${uid}-vs-minus-h`,
      tool: 'pen',
      color,
      width: 2.4,
      opacity: 1,
      points: [
        { x: minusSignCx - signSize / 2, y: signY, pressure: 0.7 },
        { x: minusSignCx + signSize / 2, y: signY, cx: minusSignCx, cy: signY, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'voltage-source',
    });
  } else if (preset === 'inclined-plane') {
    // Inclined Plane with Block (Κεκλιμένο Επίπεδο με Σώμα) matching the user's screenshot:
    // 1. Right-triangle ramp (dark outline + subtle gray fill)
    // 2. Rectangular block resting flush on the hypotenuse (blue outline + subtle blue fill)
    const pSlopeStart = { x, y: y + h };
    const pBaseCorner = { x: x + w, y: y + h };
    const pSlopePeak = { x: x + w, y: y + h * 0.22 };

    const wedgePts = makePolygonBezier([pSlopeStart, pBaseCorner, pSlopePeak]);
    out.push({
      id: `st-${Date.now()}-inc-wedge`,
      tool: 'pen',
      color: color || '#111827',
      fillColor: 'rgba(148, 163, 184, 0.18)',
      fillStyle: 'solid',
      width: 2.8,
      opacity: 1,
      points: wedgePts,
      layerId,
      groupId,
      isShape: true,
      shapeType: 'incline-wedge',
    });

    const blockPts = computeInclinedPlaneBlockPoints(pSlopeStart, pBaseCorner, pSlopePeak);
    const blockStrokeColor = color === '#2563eb' ? '#1d4ed8' : '#2563eb';
    out.push({
      id: `st-${Date.now()}-inc-block`,
      tool: 'pen',
      color: blockStrokeColor,
      fillColor: 'rgba(59, 130, 246, 0.16)',
      fillStyle: 'solid',
      width: 2.8,
      opacity: 1,
      points: blockPts,
      layerId,
      groupId,
      isShape: true,
      shapeType: 'incline-block',
    });
  } else if (preset === 'switch') {
    const cy = y + h * 0.68;
    const leftPivotX = x + w * 0.26;
    const rightPivotX = x + w * 0.74;
    const pivotR = Math.max(4, Math.min(7.5, Math.min(w, h) * 0.1));
    const ts = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

    out.push({
      id: `st-${ts}-sw-wl`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x, y: cy, pressure: 0.7 },
        { x: leftPivotX - pivotR, y: cy, cx: (x + leftPivotX - pivotR) / 2, cy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'switch',
      switchClosed,
    });

    out.push({
      id: `st-${ts}-sw-wr`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x: rightPivotX + pivotR, y: cy, pressure: 0.7 },
        { x: x + w, y: cy, cx: (rightPivotX + pivotR + x + w) / 2, cy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'switch',
      switchClosed,
    });

    out.push({
      id: `st-${ts}-sw-pl`,
      tool: 'pen',
      color: '#334155',
      fillColor: '#94a3b8',
      fillStyle: 'solid',
      width: 2.2,
      opacity: 1,
      points: makeEllipseBezier(leftPivotX, cy, pivotR, pivotR),
      layerId,
      groupId,
      isShape: true,
      shapeType: 'switch',
      switchClosed,
    });
    out.push({
      id: `st-${ts}-sw-pr`,
      tool: 'pen',
      color: '#334155',
      fillColor: '#94a3b8',
      fillStyle: 'solid',
      width: 2.2,
      opacity: 1,
      points: makeEllipseBezier(rightPivotX, cy, pivotR, pivotR),
      layerId,
      groupId,
      isShape: true,
      shapeType: 'switch',
      switchClosed,
    });

    const span = rightPivotX - leftPivotX;
    const bladeEndX = switchClosed ? rightPivotX : leftPivotX + span * 0.82;
    const bladeEndY = switchClosed ? cy : cy - Math.max(18, Math.min(h * 0.56, span * 0.62));
    out.push({
      id: `st-${ts}-sw-blade`,
      tool: 'pen',
      color: '#1e293b',
      width: 3.4,
      opacity: 1,
      points: [
        { x: leftPivotX, y: cy, pressure: 0.7 },
        {
          x: bladeEndX,
          y: bladeEndY,
          cx: (leftPivotX + bladeEndX) / 2,
          cy: (cy + bladeEndY) / 2,
          pressure: 0.7,
        },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'switch-blade',
      switchClosed,
    });

    const knobCx = (leftPivotX + bladeEndX) / 2;
    const knobCy = switchClosed ? cy - pivotR * 1.4 : (cy + bladeEndY) / 2;
    const knobR = Math.max(6.5, Math.min(11, Math.min(w, h) * 0.16));
    out.push({
      id: `st-${ts}-sw-knob`,
      tool: 'pen',
      color: switchClosed ? '#16a34a' : '#dc2626',
      fillColor: switchClosed ? '#22c55e' : '#ef4444',
      fillStyle: 'solid',
      width: 2.2,
      opacity: 1,
      points: makeEllipseBezier(knobCx, knobCy, knobR, knobR),
      layerId,
      groupId,
      isShape: true,
      shapeType: 'switch-knob',
      switchClosed,
    });
  } else if (preset === 'fan') {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rOuter = Math.max(18, Math.min(w * 0.34, h * 0.45));
    const rHub = Math.max(5, rOuter * 0.22);
    const ts = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

    const makeSmoothCirclePts = (ccx: number, ccy: number, rad: number, steps = 40): BezierPoint[] => {
      const pts: BezierPoint[] = [];
      for (let i = 0; i <= steps; i++) {
        const ang = (i / steps) * Math.PI * 2;
        const px = ccx + Math.cos(ang) * rad;
        const py = ccy + Math.sin(ang) * rad;
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
      return pts;
    };

    out.push({
      id: `st-${ts}-fan-wl`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x, y: cy, pressure: 0.7 },
        { x: cx - rOuter, y: cy, cx: (x + cx - rOuter) / 2, cy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'fan',
    });
    out.push({
      id: `st-${ts}-fan-wr`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x: cx + rOuter, y: cy, pressure: 0.7 },
        { x: x + w, y: cy, cx: (cx + rOuter + x + w) / 2, cy, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'fan',
    });

    // Round grey-filled backplate circle
    out.push({
      id: `st-${ts}-fan-ring`,
      tool: 'pen',
      color: '#475569',
      fillColor: '#cbd5e1',
      fillStyle: 'solid',
      fillTransparency: 20,
      width: 2.4,
      opacity: 1,
      points: makeSmoothCirclePts(cx, cy, rOuter, 44),
      layerId,
      groupId,
      isShape: true,
      shapeType: 'fan',
    });

    // 3 Solid Blue Propeller Blades
    for (let b = 0; b < 3; b++) {
      const baseAng = (b * Math.PI * 2) / 3 - Math.PI / 2;
      const bladeLen = rOuter * 0.84;
      const spread = 0.36;
      const bladePts: { x: number; y: number }[] = [
        {
          x: cx + Math.cos(baseAng - 0.18) * rHub * 0.85,
          y: cy + Math.sin(baseAng - 0.18) * rHub * 0.85,
        },
      ];
      const arcSteps = 10;
      for (let k = 0; k <= arcSteps; k++) {
        const t = k / arcSteps;
        const ang = baseAng - spread + t * (spread * 2);
        const rCurve = bladeLen * (0.86 + 0.14 * Math.sin(t * Math.PI));
        bladePts.push({
          x: cx + Math.cos(ang) * rCurve,
          y: cy + Math.sin(ang) * rCurve,
        });
      }
      bladePts.push({
        x: cx + Math.cos(baseAng + 0.18) * rHub * 0.85,
        y: cy + Math.sin(baseAng + 0.18) * rHub * 0.85,
      });

      out.push({
        id: `st-${ts}-fan-blade-${b}`,
        tool: 'pen',
        color: '#0369a1',
        fillColor: '#0284c7',
        fillStyle: 'solid',
        fillTransparency: 0,
        width: 2.0,
        opacity: 1,
        points: makePolygonBezier(bladePts),
        layerId,
        groupId,
        isShape: true,
        shapeType: 'fan-blade',
      });
    }

    // Center hub circle
    out.push({
      id: `st-${ts}-fan-hub`,
      tool: 'pen',
      color: '#0f172a',
      fillColor: '#0ea5e9',
      fillStyle: 'solid',
      fillTransparency: 0,
      width: 2.2,
      opacity: 1,
      points: makeSmoothCirclePts(cx, cy, rHub, 24),
      layerId,
      groupId,
      isShape: true,
      shapeType: 'fan-hub',
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
 * High-efficiency canvas-to-dataUrl encoder:
 * - For opaque images (no alpha < 250): uses WebP (0.85) or JPEG (0.85), picking whichever is smaller (typically 10x-20x smaller than PNG).
 * - For transparent images (alpha < 250): uses WebP (0.86) with alpha if supported by the browser, or gently 15-bit quantized PNG (3x-4x smaller than raw 24-bit PNG).
 */
export function encodeCanvasOptimizedDataUrl(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  if (!ctx || w === 0 || h === 0) {
    return canvas.toDataURL('image/png');
  }

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  let hasTransparency = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) {
      hasTransparency = true;
      break;
    }
  }

  if (!hasTransparency) {
    const jpegUrl = canvas.toDataURL('image/jpeg', 0.85);
    const webpUrl = canvas.toDataURL('image/webp', 0.85);
    if (webpUrl.startsWith('data:image/webp') && webpUrl.length < jpegUrl.length) {
      return webpUrl;
    }
    return jpegUrl;
  }

  // Transparent image: try native alpha WebP first (supported in Chrome/Edge & modern WebKit)
  const webpUrl = canvas.toDataURL('image/webp', 0.86);

  // Also quantize RGB noise slightly (32 levels/channel = 32,768 colors) so PNG DEFLATE compresses 3x smaller on Safari
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 10) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    } else {
      data[i] = Math.min(255, (data[i] + 3) & 0xf8);
      data[i + 1] = Math.min(255, (data[i + 1] + 3) & 0xf8);
      data[i + 2] = Math.min(255, (data[i + 2] + 3) & 0xf8);
      data[i + 3] = a > 246 ? 255 : (a + 7) & 0xf0;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  const pngUrl = canvas.toDataURL('image/png');

  if (webpUrl.startsWith('data:image/webp') && webpUrl.length < pngUrl.length) {
    return webpUrl;
  }
  return pngUrl;
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
      const maxDim = 1350;
      const scale = Math.min(1, maxDim / Math.max(1, img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample 4 corner pixels as background reference color (supports BOTH white paper AND black chalkboard backgrounds!)
      const corners = [
        0,
        (w - 1) * 4,
        (h - 1) * w * 4,
        ((h - 1) * w + (w - 1)) * 4,
      ];
      let bgR = 255,
        bgG = 255,
        bgB = 255;
      for (const cIdx of corners) {
        if (data[cIdx + 3] > 128) {
          bgR = data[cIdx];
          bgG = data[cIdx + 1];
          bgB = data[cIdx + 2];
          break;
        }
      }

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
            // Smooth anti-aliased alpha transition so diagram lines stay razor-sharp
            const factor = (d - lowT) / (highT - lowT);
            data[i + 3] = Math.round(data[i + 3] * factor);
          }
        }
      } else {
        // Outer Flood-Fill (Magic Wand from image borders - keeps insides of shapes opaque!)
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
      resolve(encodeCanvasOptimizedDataUrl(canvas));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Photoshop Magnetic Lasso: Computes Multi-Channel (Alpha Silhouette + RGB Color + Luminance)
 * Sobel Edge Map with Non-Maximum Suppression (NMS) and snaps cursor smoothly along contour ridges.
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
  const n = w * h;
  const rCh = new Float32Array(n);
  const gCh = new Float32Array(n);
  const bCh = new Float32Array(n);
  const aCh = new Float32Array(n);
  const lum = new Float32Array(n);

  // Composite RGBA over white paper (255,255,255) AND keep raw alpha channel
  // so transparent PNG silhouettes and dark/colored strokes both produce strong gradients!
  for (let i = 0; i < n; i++) {
    const a = data[i * 4 + 3] / 255;
    const r = data[i * 4] * a + 255 * (1 - a);
    const g = data[i * 4 + 1] * a + 255 * (1 - a);
    const b = data[i * 4 + 2] * a + 255 * (1 - a);
    rCh[i] = r;
    gCh[i] = g;
    bCh[i] = b;
    aCh[i] = data[i * 4 + 3];
    lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const rawMag = new Float32Array(n);
  const gradDirX = new Float32Array(n);
  const gradDirY = new Float32Array(n);

  const sobelAt = (arr: Float32Array, x: number, y: number) => {
    const idxTL = (y - 1) * w + (x - 1);
    const idxTC = (y - 1) * w + x;
    const idxTR = (y - 1) * w + (x + 1);
    const idxML = y * w + (x - 1);
    const idxMR = y * w + (x + 1);
    const idxBL = (y + 1) * w + (x - 1);
    const idxBC = (y + 1) * w + x;
    const idxBR = (y + 1) * w + (x + 1);
    const gx = -arr[idxTL] + arr[idxTR] - 2 * arr[idxML] + 2 * arr[idxMR] - arr[idxBL] + arr[idxBR];
    const gy = -arr[idxTL] - 2 * arr[idxTC] - arr[idxTR] + arr[idxBL] + 2 * arr[idxBC] + arr[idxBR];
    return { gx, gy, mag: Math.hypot(gx, gy) };
  };

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const sLum = sobelAt(lum, x, y);
      const sAlpha = sobelAt(aCh, x, y);
      const sR = sobelAt(rCh, x, y);
      const sG = sobelAt(gCh, x, y);
      const sB = sobelAt(bCh, x, y);

      const maxColorMag = Math.max(sR.mag, sG.mag, sB.mag);
      // Prioritize alpha silhouette transitions (2.2x) + color/luminance edges
      const combinedMag = Math.max(sAlpha.mag * 2.2, sLum.mag, maxColorMag * 0.9);
      rawMag[idx] = combinedMag;

      const dom = sAlpha.mag * 2.2 >= sLum.mag ? sAlpha : sLum;
      const len = dom.mag || 1;
      gradDirX[idx] = dom.gx / len;
      gradDirY[idx] = dom.gy / len;
    }
  }

  // Non-Maximum Suppression (NMS) with soft 35% shoulder so contour ridges are sharp and 1-2px thin
  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      const idx = y * w + x;
      const mag = rawMag[idx];
      if (mag < 25) continue;
      const dx = Math.round(gradDirX[idx]);
      const dy = Math.round(gradDirY[idx]);
      const m1 = rawMag[(y + dy) * w + (x + dx)];
      const m2 = rawMag[(y - dy) * w + (x - dx)];
      if (mag >= m1 && mag >= m2) {
        edgeMap[idx] = mag * 1.25;
      } else {
        edgeMap[idx] = mag * 0.35;
      }
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
  searchRadius = 14,
  prevLocalX?: number,
  prevLocalY?: number
): { x: number; y: number } {
  const cx = Math.round(localX);
  const cy = Math.round(localY);
  let bestScore = -1;
  let bestX = localX;
  let bestY = localY;

  const hasPrev = prevLocalX !== undefined && prevLocalY !== undefined;
  const moveDx = hasPrev ? localX - (prevLocalX as number) : 0;
  const moveDy = hasPrev ? localY - (prevLocalY as number) : 0;
  const moveDist = Math.hypot(moveDx, moveDy);

  const r = Math.round(searchRadius);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const distToCursor = Math.hypot(dx, dy);
      if (distToCursor > searchRadius) continue;
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 1 || nx >= w - 1 || ny < 1 || ny >= h - 1) continue;
      const grad = edgeMap[ny * w + nx];
      if (grad < 45) continue;

      // Strong Gaussian preference for edges close to the cursor tip
      const cursorWeight = Math.exp(-(distToCursor * distToCursor) / (2 * (searchRadius * 0.52) ** 2));

      // Continuity weight: prevent erratic sideways jumps away from the previous contour point
      let continuityWeight = 1.0;
      if (hasPrev && moveDist > 0.5) {
        const stepFromPrev = Math.hypot(nx - (prevLocalX as number), ny - (prevLocalY as number));
        // Penalize points that jump backwards or way farther than the cursor moved
        const jumpDiff = Math.abs(stepFromPrev - moveDist);
        continuityWeight = 1 / (1 + (jumpDiff / Math.max(6, searchRadius * 0.6)) ** 2);
      }

      const score = grad * (0.35 + 0.65 * cursorWeight) * continuityWeight;
      if (score > bestScore) {
        bestScore = score;
        bestX = nx;
        bestY = ny;
      }
    }
  }

  // Smoothly blend 80% snapped edge + 20% raw cursor if edge is moderate so hand motion always feels fluid
  if (bestScore > 0 && bestScore < 140) {
    return {
      x: bestX * 0.78 + localX * 0.22,
      y: bestY * 0.78 + localY * 0.22,
    };
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

/**
 * Extracts a sparse, meaningful set of Key Node indices for a freehand stroke:
 * - Always includes the 2 endpoints (index 0 and index n - 1)
 * - Places interior nodes strictly at distinct peaks, valleys, and sharp turning corners ("διακριτές κορυφές")
 *   (e.g. ~5 interior peaks -> ~7 total nodes for a multi-peak wave, and capped at 8-10 nodes even for complex lines).
 */
export function computeFreehandKeyNodeIndices(pts: BezierPoint[]): number[] {
  const n = pts.length;
  if (n === 0) return [];
  if (n === 1) return [0];
  if (n === 2) return [0, 1];
  if (n <= 5) return pts.map((_, idx) => idx);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const cumLen = new Float64Array(n);
  cumLen[0] = 0;

  for (let i = 0; i < n; i++) {
    const p = pts[i];
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    if (i > 0) {
      cumLen[i] = cumLen[i - 1] + distance(pts[i - 1], p);
    }
  }

  const totalLen = cumLen[n - 1];
  const diag = Math.hypot(maxX - minX, maxY - minY);
  if (totalLen < 24 || diag < 16) {
    return [0, Math.floor((n - 1) / 2), n - 1];
  }

  // Lightly smooth a copy of points (3 passes) so 1-2px hand tremor never triggers false peaks
  let sm = pts.map((p) => ({ x: p.x, y: p.y }));
  for (let pass = 0; pass < 3; pass++) {
    const next = sm.map((p) => ({ ...p }));
    for (let i = 1; i < n - 1; i++) {
      next[i].x = 0.25 * sm[i - 1].x + 0.5 * sm[i].x + 0.25 * sm[i + 1].x;
      next[i].y = 0.25 * sm[i - 1].y + 0.5 * sm[i].y + 0.25 * sm[i + 1].y;
    }
    sm = next;
  }

  // 1. Compute local turning angle (0..180 deg) at each interior point over an arc-length window
  const lookDist = Math.max(10, Math.min(28, diag * 0.09, totalLen * 0.065));
  const turnDeg = new Float64Array(n);
  for (let i = 1; i < n - 1; i++) {
    let prev = i - 1;
    while (prev > 0 && cumLen[i] - cumLen[prev] < lookDist) prev--;
    let next = i + 1;
    while (next < n - 1 && cumLen[next] - cumLen[i] < lookDist) next++;

    const v1x = sm[i].x - sm[prev].x;
    const v1y = sm[i].y - sm[prev].y;
    const v2x = sm[next].x - sm[i].x;
    const v2y = sm[next].y - sm[i].y;
    const m1 = Math.hypot(v1x, v1y);
    const m2 = Math.hypot(v2x, v2y);
    if (m1 > 1e-3 && m2 > 1e-3) {
      const cosA = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (m1 * m2)));
      turnDeg[i] = (Math.acos(cosA) * 180) / Math.PI;
    }
  }

  // 2. Hysteresis 1D Local Extrema detector (finds true crests & troughs without slope noise)
  const findHysteresisExtrema = (coord: 'x' | 'y', prom: number): { idx: number; prominence: number }[] => {
    const out: { idx: number; prominence: number }[] = [];
    let minVal = sm[0][coord];
    let maxVal = sm[0][coord];
    let minIdx = 0;
    let maxIdx = 0;
    let mode: 'max' | 'min' | 'both' = 'both';

    for (let i = 1; i < n; i++) {
      const v = sm[i][coord];
      if (mode === 'both') {
        if (v > maxVal) {
          maxVal = v;
          maxIdx = i;
        }
        if (v < minVal) {
          minVal = v;
          minIdx = i;
        }
        if (maxVal - v >= prom && maxIdx > 0) {
          out.push({ idx: maxIdx, prominence: maxVal - minVal });
          minVal = v;
          minIdx = i;
          mode = 'min';
        } else if (v - minVal >= prom && minIdx > 0) {
          out.push({ idx: minIdx, prominence: maxVal - minVal });
          maxVal = v;
          maxIdx = i;
          mode = 'max';
        }
      } else if (mode === 'max') {
        if (v > maxVal) {
          maxVal = v;
          maxIdx = i;
        } else if (maxVal - v >= prom) {
          out.push({ idx: maxIdx, prominence: maxVal - minVal });
          minVal = v;
          minIdx = i;
          mode = 'min';
        }
      } else {
        if (v < minVal) {
          minVal = v;
          minIdx = i;
        } else if (v - minVal >= prom) {
          out.push({ idx: minIdx, prominence: maxVal - minVal });
          maxVal = v;
          maxIdx = i;
          mode = 'max';
        }
      }
    }
    return out;
  };

  const prominenceThreshold = Math.max(5.5, diag * 0.042);
  const yExtrema = findHysteresisExtrema('y', prominenceThreshold);
  const xExtrema = findHysteresisExtrema('x', prominenceThreshold * 1.15);

  const candidateMap = new Map<number, number>(); // idx -> score
  const minEndArc = Math.max(12, Math.min(30, totalLen * 0.055));

  const addCandidate = (rawIdx: number, bonusScore: number) => {
    // Refine within a small local neighborhood to sit right on the sharpest apex of the peak
    let bestIdx = rawIdx;
    let bestTurn = turnDeg[rawIdx];
    for (let j = Math.max(1, rawIdx - 4); j <= Math.min(n - 2, rawIdx + 4); j++) {
      if (Math.abs(cumLen[j] - cumLen[rawIdx]) <= lookDist * 0.65 && turnDeg[j] > bestTurn * 1.05) {
        bestTurn = turnDeg[j];
        bestIdx = j;
      }
    }
    if (cumLen[bestIdx] < minEndArc || totalLen - cumLen[bestIdx] < minEndArc) return;
    const score = bestTurn + bonusScore;
    const prevScore = candidateMap.get(bestIdx) ?? -1;
    if (score > prevScore) {
      candidateMap.set(bestIdx, score);
    }
  };

  for (const ex of yExtrema) addCandidate(ex.idx, 45 + Math.min(40, ex.prominence * 0.4));
  for (const ex of xExtrema) addCandidate(ex.idx, 35 + Math.min(35, ex.prominence * 0.35));

  // Also include sharp local turning-angle peaks (e.g., diagonal corners that don't reverse X or Y)
  for (let i = 2; i < n - 2; i++) {
    if (turnDeg[i] >= 36 && turnDeg[i] >= turnDeg[i - 1] && turnDeg[i] >= turnDeg[i + 1]) {
      addCandidate(i, 15);
    }
  }

  // 3. Sort candidates along the stroke and merge any candidates that are too close to each other
  const sortedCandidates = Array.from(candidateMap.entries())
    .map(([idx, score]) => ({ idx, score }))
    .sort((a, b) => a.idx - b.idx);

  const minNodeArc = Math.max(16, Math.min(40, totalLen * 0.068, diag * 0.095));
  const minNodeEuclid = Math.max(12, diag * 0.065);
  const merged: { idx: number; score: number }[] = [];

  for (const cand of sortedCandidates) {
    if (merged.length === 0) {
      merged.push(cand);
      continue;
    }
    const prev = merged[merged.length - 1];
    const arcDiff = cumLen[cand.idx] - cumLen[prev.idx];
    const euclidDiff = distance(pts[cand.idx], pts[prev.idx]);
    if (arcDiff < minNodeArc || euclidDiff < minNodeEuclid) {
      if (cand.score > prev.score) {
        merged[merged.length - 1] = cand;
      }
    } else {
      merged.push(cand);
    }
  }

  // 4. Cap maximum interior nodes so even very complex lines have a clean, small set of nodes (e.g. <= 7 interior + 2 ends = <= 9 nodes)
  const maxInterior = totalLen > diag * 3.2 ? 7 : 6;
  let finalInteriorIndices: number[];
  if (merged.length > maxInterior) {
    finalInteriorIndices = [...merged]
      .sort((a, b) => b.score - a.score)
      .slice(0, maxInterior)
      .map((c) => c.idx)
      .sort((a, b) => a - b);
  } else {
    finalInteriorIndices = merged.map((c) => c.idx);
  }

  // 5. Fallback for smooth single-arch or gentle curves that had 0 or 1 extrema:
  //    Add the point(s) of maximum perpendicular deviation from the chord so the user still has 1-2 middle nodes to bend the line!
  if (finalInteriorIndices.length === 0) {
    let bestIdx = Math.floor((n - 1) / 2);
    let maxDev = -1;
    for (let i = 1; i < n - 1; i++) {
      const d = perpendicularDistance(pts[i], pts[0], pts[n - 1]);
      if (d > maxDev) {
        maxDev = d;
        bestIdx = i;
      }
    }
    if (totalLen >= 80 && n >= 7) {
      const q1 = Math.max(1, Math.floor((n - 1) / 3));
      const q2 = Math.min(n - 2, Math.floor(((n - 1) * 2) / 3));
      finalInteriorIndices = q1 !== q2 ? [q1, q2] : [bestIdx];
    } else {
      finalInteriorIndices = [bestIdx];
    }
  }

  return [0, ...finalInteriorIndices, n - 1];
}

/**
 * Smoothly deforms a freehand stroke when the user drags one of its sparse Key Nodes (`keyNodePosIdx`),
 * using a C1-continuous Cosine Hermite bell curve anchored at the neighboring key nodes (`keyNodePosIdx - 1` and `keyNodePosIdx + 1`).
 */
export function deformStrokeAtKeyNode(
  pts: BezierPoint[],
  keyNodeIndices: number[],
  keyNodePosIdx: number,
  targetX: number,
  targetY: number
): BezierPoint[] {
  const n = pts.length;
  if (n === 0 || keyNodePosIdx < 0 || keyNodePosIdx >= keyNodeIndices.length) return pts;

  const centerIdx = Math.max(0, Math.min(n - 1, keyNodeIndices[keyNodePosIdx]));
  const dx = targetX - pts[centerIdx].x;
  const dy = targetY - pts[centerIdx].y;
  if (Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) return pts;

  const isWeldedClosed =
    pts[0]?.twist === 999 &&
    keyNodeIndices.length >= 3 &&
    (keyNodePosIdx === 0 || keyNodePosIdx === keyNodeIndices.length - 1);

  if (isWeldedClosed) {
    // Move BOTH the start segment [0 .. keyNodeIndices[1]] and end segment [keyNodeIndices[last-1] .. n-1] together as 1 unified node!
    const firstInteriorIdx = Math.min(n - 1, Math.max(1, keyNodeIndices[1]));
    const lastInteriorIdx = Math.max(0, Math.min(n - 2, keyNodeIndices[keyNodeIndices.length - 2]));

    const cumStart = new Float64Array(firstInteriorIdx + 1);
    for (let i = 1; i <= firstInteriorIdx; i++) {
      cumStart[i] = cumStart[i - 1] + distance(pts[i - 1], pts[i]);
    }
    const startSpan = Math.max(1e-4, cumStart[firstInteriorIdx]);

    const cumEnd = new Float64Array(n);
    for (let i = lastInteriorIdx + 1; i < n; i++) {
      cumEnd[i] = cumEnd[i - 1] + distance(pts[i - 1], pts[i]);
    }
    const endSpan = Math.max(1e-4, cumEnd[n - 1] - cumEnd[lastInteriorIdx]);

    const weights = new Float64Array(n);
    for (let i = 0; i <= firstInteriorIdx; i++) {
      const v = cumStart[i] / startSpan; // 0 at idx=0 -> 1 at firstInteriorIdx
      weights[i] = Math.max(weights[i], 0.5 + 0.5 * Math.cos(Math.PI * v));
    }
    for (let i = lastInteriorIdx; i < n; i++) {
      const u = (cumEnd[i] - cumEnd[lastInteriorIdx]) / endSpan; // 0 at lastInteriorIdx -> 1 at n-1
      weights[i] = Math.max(weights[i], 0.5 - 0.5 * Math.cos(Math.PI * u));
    }
    weights[0] = 1.0;
    weights[n - 1] = 1.0;

    return pts.map((p, i) => {
      const w = weights[i];
      const wPrev = i > 0 ? weights[i - 1] : w;
      const wCtrl = 0.5 * (wPrev + w);
      if (w === 0 && wCtrl === 0) return p;
      return {
        ...p,
        x: p.x + w * dx,
        y: p.y + w * dy,
        cx: p.cx !== undefined ? p.cx + wCtrl * dx : undefined,
        cy: p.cy !== undefined ? p.cy + wCtrl * dy : undefined,
      };
    });
  }

  const leftIdx = keyNodePosIdx > 0 ? Math.max(0, keyNodeIndices[keyNodePosIdx - 1]) : 0;
  const rightIdx =
    keyNodePosIdx < keyNodeIndices.length - 1
      ? Math.min(n - 1, keyNodeIndices[keyNodePosIdx + 1])
      : n - 1;

  // Precompute cumulative arc lengths along [leftIdx .. rightIdx]
  const cum = new Float64Array(n);
  for (let i = leftIdx + 1; i <= rightIdx; i++) {
    cum[i] = cum[i - 1] + distance(pts[i - 1], pts[i]);
  }

  const leftSpan = Math.max(1e-4, cum[centerIdx] - cum[leftIdx]);
  const rightSpan = Math.max(1e-4, cum[rightIdx] - cum[centerIdx]);

  const weights = new Float64Array(n);
  weights[centerIdx] = 1.0;

  if (centerIdx > leftIdx) {
    for (let i = leftIdx; i < centerIdx; i++) {
      if (keyNodePosIdx === 0 && i === leftIdx) {
        weights[i] = 1.0;
      } else {
        const u = (cum[i] - cum[leftIdx]) / leftSpan; // 0 at leftIdx -> 1 at centerIdx
        weights[i] = 0.5 - 0.5 * Math.cos(Math.PI * u);
      }
    }
  }

  if (rightIdx > centerIdx) {
    for (let i = centerIdx + 1; i <= rightIdx; i++) {
      if (keyNodePosIdx === keyNodeIndices.length - 1 && i === rightIdx) {
        weights[i] = 1.0;
      } else {
        const v = (cum[i] - cum[centerIdx]) / rightSpan; // 0 at centerIdx -> 1 at rightIdx
        weights[i] = 0.5 + 0.5 * Math.cos(Math.PI * v);
      }
    }
  }

  return pts.map((p, i) => {
    const w = weights[i];
    const wPrev = i > 0 ? weights[i - 1] : w;
    const wCtrl = 0.5 * (wPrev + w);
    if (w === 0 && wCtrl === 0) return p;
    return {
      ...p,
      x: p.x + w * dx,
      y: p.y + w * dy,
      cx: p.cx !== undefined ? p.cx + wCtrl * dx : undefined,
      cy: p.cy !== undefined ? p.cy + wCtrl * dy : undefined,
    };
  });
}

/**
 * Magnetically welds and smoothly blends the two endpoints of a freehand stroke into a single unified vertex
 * at `(targetX, targetY)`, smoothing the transition near the seam and marking `twist: 999` on `pts[0]` and `pts[n-1]`
 * so they behave permanently as 1 single node!
 */
export function weldFreehandEndpointsSmoothly(
  pts: BezierPoint[],
  keyNodeIndices: number[],
  draggedKeyPosIdx: number,
  targetX: number,
  targetY: number
): BezierPoint[] {
  if (pts.length < 3) return pts;
  const deformed = deformStrokeAtKeyNode(pts, keyNodeIndices, draggedKeyPosIdx, targetX, targetY);
  const n = deformed.length;
  const res = deformed.map((p) => ({ ...p }));

  // Lock both endpoints to exact targetX, targetY and mark twist = 999 (welded single node)
  res[0].x = targetX;
  res[0].y = targetY;
  res[0].twist = 999;
  res[n - 1].x = targetX;
  res[n - 1].y = targetY;
  res[n - 1].twist = 999;

  // Apply 2 passes of gentle Laplacian smoothing near the seam (points 1..min(5, n-2) and max(1, n-6)..n-2)
  // so the curve enters and leaves the welded vertex with zero jagged step ("ψιλοτέλεια ένωση")!
  const seamWindow = Math.min(5, Math.floor((n - 2) / 3));
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 1; i <= seamWindow; i++) {
      const prev = res[i - 1];
      const curr = res[i];
      const next = res[i + 1];
      curr.x = 0.25 * prev.x + 0.5 * curr.x + 0.25 * next.x;
      curr.y = 0.25 * prev.y + 0.5 * curr.y + 0.25 * next.y;
    }
    for (let i = n - 2; i >= n - 1 - seamWindow && i >= 1; i--) {
      const prev = res[i - 1];
      const curr = res[i];
      const next = res[i + 1];
      curr.x = 0.25 * prev.x + 0.5 * curr.x + 0.25 * next.x;
      curr.y = 0.25 * prev.y + 0.5 * curr.y + 0.25 * next.y;
    }
  }

  // Recompute smooth midpoint quadratic Bézier control points (cx, cy) near both ends
  for (let i = 1; i < n; i++) {
    if (i <= seamWindow + 1 || i >= n - 1 - seamWindow) {
      res[i].cx = (res[i - 1].x + res[i].x) / 2;
      res[i].cy = (res[i - 1].y + res[i].y) / 2;
    }
  }

  return res;
}

/**
 * Checks whether a freehand stroke forms a closed (or nearly closed) loop where one end touches/approaches the other,
 * so it can be filled automatically when drawn with Fill ON (without waiting for Hold-to-Snap!) or toggled via Lasso.
 */
export function isFreehandLoopClosed(pts: BezierPoint[], lenientForManualToggle = false): boolean {
  const n = pts.length;
  if (pts[0]?.twist === 999 && n >= 2) return true;
  if (n < 5) return false;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let totalLen = 0;

  for (let i = 0; i < n; i++) {
    const p = pts[i];
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    if (i > 0) {
      totalLen += distance(pts[i - 1], p);
    }
  }

  const w = maxX - minX;
  const h = maxY - minY;
  const diag = Math.hypot(w, h);

  // Must have a meaningful 2D area (not a tiny dot or flat straight line)
  if (diag < 18 || Math.min(w, h) < 8 || totalLen < Math.max(45, diag * 1.4)) {
    return false;
  }

  const directDist = distance(pts[0], pts[n - 1]);
  const closeThreshold = lenientForManualToggle
    ? Math.max(68, diag * 0.48, totalLen * 0.22)
    : Math.max(44, diag * 0.32, totalLen * 0.16);

  if (directDist <= closeThreshold) {
    return true;
  }

  // Also check if the ending tail crossed or touched near the starting tail (first 20% vs last 20% of points)
  const headCount = Math.max(2, Math.floor(n * 0.2));
  const tailStart = Math.min(n - 2, Math.ceil(n * 0.8));
  const crossThreshold = lenientForManualToggle
    ? Math.max(48, diag * 0.35)
    : Math.max(32, diag * 0.24);

  for (let i = 0; i < headCount; i++) {
    for (let j = tailStart; j < n; j++) {
      if (distance(pts[i], pts[j]) <= crossThreshold) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Tessellates parametric shapes (4-node circle/ellipse, 2-node sine/cosine, 3-node parabola/hyperbola/arc)
 * into a high-resolution polyline of BezierPoints when intersected by the Pixel Eraser.
 */
function tessellateParametricShapeForErase(s: StrokeObject): BezierPoint[] {
  if ((s.shapeType === 'ellipse' || s.shapeType === 'circle') && s.points.length === 4) {
    const pts = s.points;
    const kappa = 0.55228475;
    const out: BezierPoint[] = [];
    const stepsPerQuad = 24;
    for (let i = 0; i < 4; i++) {
      const pA = pts[i];
      const pB = pts[(i + 1) % 4];
      const pPrev = pts[(i + 3) % 4];
      const pNext = pts[(i + 2) % 4];
      const cp1x = pA.x + ((pB.x - pPrev.x) / 2) * kappa;
      const cp1y = pA.y + ((pB.y - pPrev.y) / 2) * kappa;
      const cp2x = pB.x - ((pNext.x - pA.x) / 2) * kappa;
      const cp2y = pB.y - ((pNext.y - pA.y) / 2) * kappa;
      const startStep = i === 0 ? 0 : 1;
      for (let step = startStep; step <= stepsPerQuad; step++) {
        const t = step / stepsPerQuad;
        const u = 1 - t;
        const x =
          u * u * u * pA.x +
          3 * u * u * t * cp1x +
          3 * u * t * t * cp2x +
          t * t * t * pB.x;
        const y =
          u * u * u * pA.y +
          3 * u * u * t * cp1y +
          3 * u * t * t * cp2y +
          t * t * t * pB.y;
        out.push({ x, y, pressure: pA.pressure ?? 0.7 });
      }
    }
    return out;
  }

  if ((s.shapeType === 'sine' || s.shapeType === 'cosine') && s.points.length >= 2) {
    const wavePts = ensureWaveBezierPoints(s);
    const out: BezierPoint[] = [];
    for (let i = 0; i < wavePts.length - 1; i++) {
      const pA = wavePts[i];
      const pB = wavePts[i + 1];
      const ctrl = getCubicSegmentControlPoints(pA, pB);
      const segSteps = 20;
      for (let k = i === 0 ? 0 : 1; k <= segSteps; k++) {
        const t = k / segSteps;
        const u = 1 - t;
        if (ctrl) {
          out.push({
            x: u * u * u * pA.x + 3 * u * u * t * ctrl.cp1x + 3 * u * t * t * ctrl.cp2x + t * t * t * pB.x,
            y: u * u * u * pA.y + 3 * u * u * t * ctrl.cp1y + 3 * u * t * t * ctrl.cp2y + t * t * t * pB.y,
            pressure: pA.pressure ?? 0.7,
          });
        } else {
          out.push({
            x: pA.x + t * (pB.x - pA.x),
            y: pA.y + t * (pB.y - pA.y),
            pressure: pA.pressure ?? 0.7,
          });
        }
      }
    }
    return out;
  }

  if ((s.shapeType === 'parabola' || s.shapeType === 'arc') && s.points.length === 3) {
    const [p0, pMid, p2] = s.points;
    const ctrlX = 2 * pMid.x - (p0.x + p2.x) / 2;
    const ctrlY = 2 * pMid.y - (p0.y + p2.y) / 2;
    const steps = 56;
    const out: BezierPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      out.push({
        x: u * u * p0.x + 2 * u * t * ctrlX + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * ctrlY + t * t * p2.y,
        pressure: p0.pressure ?? 0.7,
      });
    }
    return out;
  }

  if (s.shapeType === 'hyperbola' && s.points.length === 3) {
    const [p0, pMid, p2] = s.points;
    const wHyp = 1.85;
    const midX = (p0.x + p2.x) / 2;
    const midY = (p0.y + p2.y) / 2;
    const ctrlX = midX + ((1 + wHyp) / wHyp) * (pMid.x - midX);
    const ctrlY = midY + ((1 + wHyp) / wHyp) * (pMid.y - midY);
    const steps = 64;
    const out: BezierPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const b0 = u * u;
      const b1 = 2 * wHyp * u * t;
      const b2 = t * t;
      const denom = b0 + b1 + b2;
      out.push({
        x: (b0 * p0.x + b1 * ctrlX + b2 * p2.x) / denom,
        y: (b0 * p0.y + b1 * ctrlY + b2 * p2.y) / denom,
        pressure: p0.pressure ?? 0.7,
      });
    }
    return out;
  }

  if ((s.shapeType === 'resistor' || s.shapeType === 'spring') && s.points.length >= 4) {
    return computeResistorOrSpringPoints(s.shapeType, s.points);
  }

  return s.points;
}

/**
 * Returns the exact drawn polyline sub-paths for 3D shapes ('cuboid', 'cylinder', 'sphere', 'pyramid')
 * so hit-testing and erasing operate strictly on the visible 3D wireframe curves/edges (never the invisible bounding box).
 */
export function get3DShapeSubPaths(s: StrokeObject): BezierPoint[][] {
  if (
    (s.shapeType !== 'cuboid' &&
      s.shapeType !== 'cylinder' &&
      s.shapeType !== 'sphere' &&
      s.shapeType !== 'pyramid') ||
    s.points.length < 4
  ) {
    return [];
  }

  const [p0, p1, p2, p3] = s.points;
  const pr = p0.pressure ?? 0.7;
  const bilerp = (u: number, v: number): BezierPoint => ({
    x: (1 - u) * (1 - v) * p0.x + u * (1 - v) * p1.x + u * v * p2.x + (1 - u) * v * p3.x,
    y: (1 - u) * (1 - v) * p0.y + u * (1 - v) * p1.y + u * v * p2.y + (1 - u) * v * p3.y,
    pressure: pr,
  });

  const sampleEllipseBilerp = (
    uc: number,
    vc: number,
    ru: number,
    rv: number,
    startAng = 0,
    endAng = Math.PI * 2,
    steps = 48
  ): BezierPoint[] => {
    const pts: BezierPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const ang = startAng + ((endAng - startAng) * i) / steps;
      pts.push(bilerp(uc + ru * Math.cos(ang), vc + rv * Math.sin(ang)));
    }
    return pts;
  };

  if (s.shapeType === 'sphere') {
    return [
      sampleEllipseBilerp(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, 48),
      sampleEllipseBilerp(0.5, 0.5, 0.5, 0.18, 0, Math.PI, 28),
    ];
  }

  if (s.shapeType === 'cylinder') {
    const topLeft = bilerp(0, 0.14);
    const topRight = bilerp(1, 0.14);
    const botLeft = bilerp(0, 0.86);
    const botRight = bilerp(1, 0.86);
    return [
      sampleEllipseBilerp(0.5, 0.14, 0.5, 0.14, 0, Math.PI * 2, 40),
      sampleEllipseBilerp(0.5, 0.86, 0.5, 0.14, 0, Math.PI * 2, 40),
      [topLeft, botLeft],
      [topRight, botRight],
    ];
  }

  if (s.shapeType === 'cuboid') {
    const fTL = bilerp(0, 0.26);
    const fTR = bilerp(0.78, 0.26);
    const fBR = bilerp(0.78, 1.0);
    const fBL = bilerp(0, 1.0);
    const bTL = bilerp(0.22, 0);
    const bTR = bilerp(1.0, 0);
    const bBR = bilerp(1.0, 0.74);
    return [
      [fTL, fTR, fBR, fBL, fTL],
      [fTL, bTL, bTR, fTR],
      [bTR, bBR, fBR],
    ];
  }

  // 'pyramid'
  const pApex = bilerp(0.5, 0);
  const pLeft = bilerp(0, 0.76);
  const pFront = bilerp(0.5, 1.0);
  const pRight = bilerp(1.0, 0.76);
  return [
    [pApex, pLeft, pFront, pRight, pApex],
    [pApex, pFront],
  ];
}

/**
 * Pixel-accurate Eraser ("Ακριβείας / Pixel"):
 * Analytically intersects a stroke (including 2-point straight lines, polygons, parametric curves, and freehand curves)
 * against the eraser circle (center, radius), removing ONLY the exact segment(s) inside the circle
 * and splitting the stroke into clean independent sub-strokes where needed.
 */
export function eraseStrokeByCircle(
  s: StrokeObject,
  center: { x: number; y: number },
  radius: number
): { modified: boolean; pieces: StrokeObject[] } {
  if (s.points.length === 0) return { modified: false, pieces: [] };

  const strokeHalfW = s.tool === 'highlighter' ? (s.width || 3) * 1.9 : Math.min(4, (s.width || 2) * 0.5);
  const effRadius = Math.max(2, radius + strokeHalfW);

  // If 3D shape ('cuboid', 'cylinder', 'sphere', 'pyramid'), test against its true drawn 3D sub-paths (never the invisible 4-corner bounding box!)
  const subPaths3D = get3DShapeSubPaths(s);
  if (subPaths3D.length > 0) {
    let hit3D = false;
    for (const sp of subPaths3D) {
      for (let i = 1; i < sp.length; i++) {
        const a = sp[i - 1];
        const b = sp[i];
        const vx = b.x - a.x;
        const vy = b.y - a.y;
        const lenSq = vx * vx + vy * vy;
        const t = lenSq > 0.001 ? Math.max(0, Math.min(1, ((center.x - a.x) * vx + (center.y - a.y) * vy) / lenSq)) : 0;
        const projX = a.x + t * vx;
        const projY = a.y + t * vy;
        if (Math.hypot(center.x - projX, center.y - projY) <= effRadius) {
          hit3D = true;
          break;
        }
      }
      if (hit3D) break;
    }
    if (!hit3D) {
      return { modified: false, pieces: [s] };
    }
    // Convert hit 3D shape into its independent sub-path strokes and erase the touched segment(s)
    const piecesOut: StrokeObject[] = [];
    const grpId = s.groupId || `grp-3d-${s.id}`;
    subPaths3D.forEach((sp, idx) => {
      const subStroke: StrokeObject = {
        ...s,
        id: `${s.id}-3d-${idx}`,
        isShape: false,
        shapeType: undefined,
        fillStyle: 'none',
        fillColor: undefined,
        groupId: grpId,
        points: sp,
      };
      const subRes = eraseStrokeByCircle(subStroke, center, radius);
      piecesOut.push(...subRes.pieces);
    });
    return { modified: true, pieces: piecesOut };
  }

  const isParametric =
    ((s.shapeType === 'ellipse' || s.shapeType === 'circle') && s.points.length === 4) ||
    ((s.shapeType === 'sine' || s.shapeType === 'cosine') && s.points.length >= 2) ||
    ((s.shapeType === 'parabola' || s.shapeType === 'arc' || s.shapeType === 'hyperbola') && s.points.length === 3) ||
    ((s.shapeType === 'resistor' || s.shapeType === 'spring') && s.points.length >= 4);

  const basePts = isParametric ? tessellateParametricShapeForErase(s) : s.points;

  // Quick bounding-box rejection
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of basePts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    if (p.cx !== undefined && p.cy !== undefined) {
      if (p.cx < minX) minX = p.cx;
      if (p.cy < minY) minY = p.cy;
      if (p.cx > maxX) maxX = p.cx;
      if (p.cy > maxY) maxY = p.cy;
    }
  }
  if (
    center.x < minX - effRadius ||
    center.x > maxX + effRadius ||
    center.y < minY - effRadius ||
    center.y > maxY + effRadius
  ) {
    return { modified: false, pieces: [s] };
  }

  // Single-point dot
  if (basePts.length === 1) {
    if (distance(basePts[0], center) <= effRadius) {
      return { modified: true, pieces: [] };
    }
    return { modified: false, pieces: [s] };
  }

  // Expand any non-collinear quadratic Bezier segment that lies near the eraser circle into fine linear steps
  const expandedPts: BezierPoint[] = [{ ...basePts[0], cx: undefined, cy: undefined }];
  for (let i = 1; i < basePts.length; i++) {
    const pA = basePts[i - 1];
    const pB = basePts[i];
    if (pB.cx !== undefined && pB.cy !== undefined) {
      const midX = (pA.x + pB.x) / 2;
      const midY = (pA.y + pB.y) / 2;
      const ctrlDev = Math.hypot(pB.cx - midX, pB.cy - midY);
      const segMinX = Math.min(pA.x, pB.x, pB.cx) - effRadius;
      const segMaxX = Math.max(pA.x, pB.x, pB.cx) + effRadius;
      const segMinY = Math.min(pA.y, pB.y, pB.cy) - effRadius;
      const segMaxY = Math.max(pA.y, pB.y, pB.cy) + effRadius;
      const nearCircle =
        center.x >= segMinX && center.x <= segMaxX && center.y >= segMinY && center.y <= segMaxY;

      if (ctrlDev > 0.5 && nearCircle) {
        const approxLen = distance(pA, { x: pB.cx, y: pB.cy }) + distance({ x: pB.cx, y: pB.cy }, pB);
        const subSteps = Math.max(3, Math.min(14, Math.ceil(approxLen / 3)));
        for (let k = 1; k <= subSteps; k++) {
          const t = k / subSteps;
          const u = 1 - t;
          expandedPts.push({
            x: u * u * pA.x + 2 * u * t * pB.cx + t * t * pB.x,
            y: u * u * pA.y + 2 * u * t * pB.cy + t * t * pB.y,
            pressure: (pA.pressure ?? 0.65) + t * ((pB.pressure ?? 0.65) - (pA.pressure ?? 0.65)),
            tiltX: pB.tiltX,
            tiltY: pB.tiltY,
            twist: pB.twist,
          });
        }
        continue;
      }
    }
    expandedPts.push(pB);
  }

  let modified = false;
  const chains: BezierPoint[][] = [];
  let currentChain: BezierPoint[] = [];
  const rSq = effRadius * effRadius;

  for (let i = 1; i < expandedPts.length; i++) {
    const A = expandedPts[i - 1];
    const B = expandedPts[i];
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const a = dx * dx + dy * dy;
    const segLen = Math.sqrt(a);

    if (segLen < 1e-4) {
      if (distance(A, center) <= effRadius) {
        modified = true;
        if (currentChain.length >= 2) {
          chains.push(currentChain);
        }
        currentChain = [];
      }
      continue;
    }

    const fx = A.x - center.x;
    const fy = A.y - center.y;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - rSq;
    const disc = b * b - 4 * a * c;

    let intersects = false;
    let t1 = -1;
    let t2 = -1;

    if (disc > 0) {
      const sqrtDisc = Math.sqrt(disc);
      t1 = (-b - sqrtDisc) / (2 * a);
      t2 = (-b + sqrtDisc) / (2 * a);
      if (t2 > 0 && t1 < 1) {
        intersects = true;
      }
    }

    if (!intersects) {
      if (currentChain.length === 0) {
        currentChain.push({ ...A, cx: undefined, cy: undefined });
      }
      currentChain.push({ ...B });
    } else {
      modified = true;
      const lerpPt = (t: number): BezierPoint => ({
        x: A.x + t * dx,
        y: A.y + t * dy,
        pressure: (A.pressure ?? 0.65) + t * ((B.pressure ?? 0.65) - (A.pressure ?? 0.65)),
        tiltX: A.tiltX,
        tiltY: A.tiltY,
        twist: A.twist,
      });

      // 1. Portion of segment A -> B before entering the eraser circle (t in [0, t1])
      if (t1 > 0) {
        const q1 = lerpPt(t1);
        if (currentChain.length === 0) {
          if (t1 * segLen >= 0.6) {
            chains.push([{ ...A, cx: undefined, cy: undefined }, q1]);
          }
        } else {
          if (t1 * segLen >= 0.25) {
            currentChain.push(q1);
          }
          if (currentChain.length >= 2) {
            chains.push(currentChain);
          }
          currentChain = [];
        }
      } else {
        // Point A itself is inside or on the boundary of the eraser circle
        if (currentChain.length >= 2) {
          chains.push(currentChain);
        }
        currentChain = [];
      }

      // 2. Portion of segment A -> B after exiting the eraser circle (t in [t2, 1])
      if (t2 < 1) {
        const q2 = lerpPt(t2);
        if ((1 - t2) * segLen >= 0.25) {
          currentChain = [q2, { ...B, cx: undefined, cy: undefined }];
        }
      }
    }
  }

  if (!modified) {
    return { modified: false, pieces: [s] };
  }

  if (currentChain.length >= 2) {
    chains.push(currentChain);
  }

  // If the original stroke was a closed loop (e.g. rectangle, triangle, circle, closed freehand)
  // and was cut elsewhere, weld the last chain and the first chain across the original seam!
  const origFirst = basePts[0];
  const origLast = basePts[basePts.length - 1];
  if (basePts.length >= 3 && distance(origFirst, origLast) < 1.5 && chains.length >= 2) {
    const firstChain = chains[0];
    const lastChain = chains[chains.length - 1];
    if (distance(lastChain[lastChain.length - 1], firstChain[0]) < 1.5) {
      chains[0] = [...lastChain, ...firstChain.slice(1)];
      chains.pop();
    }
  }

  // Filter out microscopic dust chains (< 1.0px total length)
  const validChains = chains.filter((ch) => {
    if (ch.length < 2) return false;
    let len = 0;
    for (let i = 1; i < ch.length; i++) {
      len += distance(ch[i - 1], ch[i]);
      if (len >= 1.0) return true;
    }
    return false;
  });

  if (validChains.length === 0) {
    return { modified: true, pieces: [] };
  }

  const wasStraightLine =
    s.shapeType === 'line' ||
    s.shapeType === 'arrow' ||
    s.shapeType === 'double-arrow' ||
    basePts.length === 2;

  const pieces: StrokeObject[] = validChains.map((ch, idx) => {
    const pieceId =
      idx === 0
        ? s.id
        : `${s.id}-seg${idx}-${Math.random().toString(36).slice(2, 6)}`;
    const endsAtOriginalEnd = distance(ch[ch.length - 1], origLast) < 1.2;
    const startsAtOriginalStart = distance(ch[0], origFirst) < 1.2;

    if (wasStraightLine && ch.length === 2) {
      const p0 = ch[0];
      const p1 = ch[1];
      const keepArrowEnd = Boolean(
        (s.arrowEnd || s.shapeType === 'arrow' || s.shapeType === 'double-arrow') && endsAtOriginalEnd
      );
      const keepArrowStart = Boolean(
        (s.arrowStart || s.shapeType === 'double-arrow') && startsAtOriginalStart
      );
      return {
        ...s,
        id: pieceId,
        isShape: true,
        shapeType:
          keepArrowStart && keepArrowEnd
            ? 'double-arrow'
            : keepArrowEnd && (s.shapeType === 'arrow' || s.shapeType === 'double-arrow')
            ? 'arrow'
            : 'line',
        arrowEnd: keepArrowEnd,
        arrowStart: keepArrowStart,
        fillStyle: 'none',
        fillColor: undefined,
        keyNodeIndices: undefined,
        points: [
          { ...p0, cx: undefined, cy: undefined },
          { ...p1, cx: (p0.x + p1.x) / 2, cy: (p0.y + p1.y) / 2 },
        ],
      };
    }

    return {
      ...s,
      id: pieceId,
      isShape: false,
      shapeType: undefined,
      arrowEnd: Boolean(
        (s.arrowEnd || s.shapeType === 'arrow' || s.shapeType === 'double-arrow') && endsAtOriginalEnd
      ),
      arrowStart: Boolean((s.arrowStart || s.shapeType === 'double-arrow') && startsAtOriginalStart),
      fillStyle: 'none',
      fillColor: undefined,
      points: ch,
      keyNodeIndices: computeFreehandKeyNodeIndices(ch),
    };
  });

  return { modified: true, pieces };
}

/**
 * Strips Greek diacritics/accents (τόνους, διαλυτικά) and normalizes final sigma (ς -> σ).
 */
export function normalizeGreekSearchText(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ς/g, 'σ')
    .trim();
}

/**
 * Computes the inflection-insensitive Greek stem of a single normalized word
 * so e.g. "νερο", "νερου", "νερα" -> "νερ" and "βροχη", "βροχησ", "βροχεσ" -> "βροχ".
 */
export function stemGreekWord(rawWord: string): string {
  const w = normalizeGreekSearchText(rawWord).replace(/[^a-zα-ω0-9]/g, '');
  if (w.length <= 3) return w;

  // Ordered longest-first common Greek inflectional suffixes
  const suffixes = [
    'ιουσ',
    'ιων',
    'ιου',
    'ουδ',
    'ματ',
    'αδων',
    'ηδων',
    'εων',
    'ουσ',
    'ων',
    'ου',
    'οι',
    'εσ',
    'ησ',
    'ασ',
    'οσ',
    'ια',
    'εισ',
    'ησε',
    'ησα',
    'α',
    'ο',
    'η',
    'ε',
    'υ',
    'ι',
    'ω',
  ];

  for (const suf of suffixes) {
    if (w.endsWith(suf) && w.length - suf.length >= 3) {
      return w.slice(0, w.length - suf.length);
    }
  }
  return w;
}

/**
 * Checks whether a single normalized query token matches a candidate text string
 * using both accent-insensitive substring matching and Greek inflectional stem matching.
 */
export function matchesSingleGreekToken(candidateText: string, rawToken: string): boolean {
  const normCandidate = normalizeGreekSearchText(candidateText);
  const normToken = normalizeGreekSearchText(rawToken).replace(/^#+/, '');
  if (!normToken) return true;
  if (!normCandidate) return false;

  // 1. Direct accent-insensitive substring match (great while typing partial words)
  if (normCandidate.includes(normToken)) return true;

  // 2. Word-level Greek stem match (e.g. query "νερο" -> stem "νερ" matches "Νερού" -> stem "νερ")
  const tokenStem = stemGreekWord(normToken);
  if (tokenStem.length < 3) return false;

  const candidateWords = normCandidate.split(/[^a-zα-ω0-9]+/).filter(Boolean);
  for (const cw of candidateWords) {
    if (cw.includes(tokenStem)) return true;
    const cwStem = stemGreekWord(cw);
    if (cwStem.length >= 3 && (cwStem.startsWith(tokenStem) || tokenStem.startsWith(cwStem))) {
      return true;
    }
  }
  return false;
}

/**
 * Smart Greek query matcher for folders or simple titles.
 * - Comma-separated groups ("βροχη, νερο") act as OR.
 * - Space-separated words within a group ("κυκλος νερο") act as AND.
 */
export function matchesGreekSmartQuery(candidateText: string, rawQuery: string): boolean {
  const q = rawQuery.trim();
  if (!q) return true;
  const orGroups = q
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);
  if (orGroups.length === 0) return true;

  return orGroups.some((group) => {
    const andTokens = group
      .split(/\s+/)
      .map((t) => t.replace(/^#+/, '').trim())
      .filter(Boolean);
    return andTokens.every((tok) => matchesSingleGreekToken(candidateText, tok));
  });
}

/**
 * Searches across a Notebook's title, folder, tags, page titles, page tags, and typed page texts/LaTeX.
 * Returns whether it matches and a list of matched tags/snippets to highlight in the UI.
 */
export function matchesNotebookSmartSearch(
  nb: Notebook,
  rawQuery: string
): { matched: boolean; matchedTags: string[]; matchedTextSnippet?: string } {
  const q = rawQuery.trim();
  if (!q) return { matched: true, matchedTags: [] };

  const allTags = Array.from(
    new Set([
      ...(nb.tags || []),
      ...nb.pages.flatMap((p) => p.tags || []),
    ])
  );
  const pageTitles = nb.pages.map((p) => p.title || '');
  const pageTexts = nb.pages.flatMap((p) =>
    (p.texts || []).flatMap((t) => [t.text || '', t.latex || ''])
  );

  const combinedCorpus = [
    nb.title || '',
    nb.folder || '',
    ...allTags,
    ...pageTitles,
    ...pageTexts,
  ].join(' ');

  const orGroups = q
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);
  if (orGroups.length === 0) return { matched: true, matchedTags: [] };

  const matched = orGroups.some((group) => {
    const andTokens = group
      .split(/\s+/)
      .map((t) => t.replace(/^#+/, '').trim())
      .filter(Boolean);
    return andTokens.every((tok) => matchesSingleGreekToken(combinedCorpus, tok));
  });

  if (!matched) {
    return { matched: false, matchedTags: [] };
  }

  const allQueryTokens = q
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#+/, '').trim())
    .filter(Boolean);

  const matchedTags = allTags.filter((tag) =>
    allQueryTokens.some((tok) => matchesSingleGreekToken(tag, tok))
  );

  let matchedTextSnippet: string | undefined;
  for (const txt of pageTexts) {
    if (txt && allQueryTokens.some((tok) => matchesSingleGreekToken(txt, tok))) {
      matchedTextSnippet = txt.length > 48 ? txt.slice(0, 48) + '…' : txt;
      break;
    }
  }

  return { matched: true, matchedTags, matchedTextSnippet };
}

/**
 * Downscales a dataUrl image to a compact <= 480px JPEG base64 payload (~20 KB) for fast, low-token Vision tagging.
 */
async function downscaleImageDataUrlForVision(dataUrl: string): Promise<{ mimeType: string; base64: string } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxDim = 720;
      const scale = Math.min(1, maxDim / Math.max(1, img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      // Fill white background so transparent-bg dark text or light text is clearly legible
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const jpegUrl = canvas.toDataURL('image/jpeg', 0.82);
      const m = jpegUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!m) {
        resolve(null);
        return;
      }
      resolve({ mimeType: m[1], base64: m[2] });
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

/**
 * Renders handwritten strokes (`page.strokes`) onto a crisp white offscreen canvas
 * so Gemini Vision can read handwritten Greek notes, equations, and diagrams!
 */
export function renderPageStrokesToSnapshotDataUrl(strokes: StrokeObject[]): string | null {
  if (!strokes || strokes.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of strokes) {
    for (const pt of s.points || []) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
  const pad = 36;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  const rawW = Math.max(160, maxX - minX);
  const rawH = Math.max(120, maxY - minY);
  const maxDim = 800;
  const scale = Math.min(1.5, maxDim / Math.max(rawW, rawH));
  const w = Math.max(160, Math.round(rawW * scale));
  const h = Math.max(120, Math.round(rawH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-minX, -minY);

  for (const s of strokes) {
    const pts = s.points || [];
    if (pts.length === 0) continue;
    ctx.save();
    ctx.strokeStyle = s.color || '#0f172a';
    ctx.lineWidth = Math.max(2, s.width || 3);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = s.opacity ?? (s.tool === 'highlighter' ? 0.35 : 1);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.85);
}

let cachedWorkingVisionModel: string | null = null;

/**
 * Staggered-hedge execution across Gemini Vision models:
 * - Fires ONLY the primary model at t = 0ms so normal fast calls (~1.2s) consume just 1 API request!
 * - If the primary model errors (503/429) OR takes longer than `hedgeDelayMs` (1900ms), immediately launches
 *   the backup models in parallel so temporary 503 spikes never slow down the user.
 */
async function runVisionWithStaggeredHedge<T>(
  models: string[],
  runner: (modelName: string, timeoutMs: number) => Promise<T | null>,
  hedgeDelayMs = 1900,
  timeoutMs = 7500
): Promise<T | null> {
  if (models.length === 0) return null;
  const primary = models[0];
  const backups = models.slice(1);
  if (backups.length === 0) {
    return runner(primary, timeoutMs);
  }

  let backupPromise: Promise<T> | null = null;
  const startBackups = (): Promise<T> => {
    if (!backupPromise) {
      backupPromise = Promise.any(
        backups.map(async (m) => {
          const r = await runner(m, timeoutMs);
          if (!r) throw new Error('empty');
          return r;
        })
      );
    }
    return backupPromise;
  };

  return new Promise<T | null>((resolve) => {
    let settled = false;
    const hedgeTimer = window.setTimeout(() => {
      if (!settled) {
        startBackups()
          .then((res) => {
            if (!settled) {
              settled = true;
              resolve(res);
            }
          })
          .catch(() => {
            // primary might still finish
          });
      }
    }, hedgeDelayMs);

    runner(primary, timeoutMs)
      .then((res) => {
        window.clearTimeout(hedgeTimer);
        if (settled) return;
        if (res) {
          settled = true;
          resolve(res);
        } else {
          startBackups()
            .then((bRes) => {
              if (!settled) {
                settled = true;
                resolve(bRes);
              }
            })
            .catch(() => {
              if (!settled) {
                settled = true;
                resolve(null);
              }
            });
        }
      })
      .catch(() => {
        window.clearTimeout(hedgeTimer);
        if (settled) return;
        startBackups()
          .then((bRes) => {
            if (!settled) {
              settled = true;
              resolve(bRes);
            }
          })
          .catch(() => {
            if (!settled) {
              settled = true;
              resolve(null);
            }
          });
      });
  });
}

/**
 * Uses Gemini Flash Vision (free tier on project bestnotes-2026) to inspect up to 4 images/texts
 * on a notebook page and return 3-4 clean Greek keyword tags in nominative singular.
 * Includes automatic evergreen model resolution ('gemini-flash-latest', 'gemini-3.8-flash',
 * 'gemini-3.5-flash', 'gemini-flash-lite-latest') plus live /v1beta/models auto-discovery
 * so future model upgrades (3.8 -> 4.0 -> 5.0) work automatically without code changes.
 */
export async function generateSmartGreekTagsFromImages(
  notebookTitle: string,
  imageDataUrls: string[],
  pageTexts: string[] = []
): Promise<string[]> {
  const partA = ((import.meta as any).env?.VITE_GV_A || '') as string;
  const partB = ((import.meta as any).env?.VITE_GV_B || '') as string;
  if (!partA || !partB) return [];
  const apiKey = (partA + partB).split('').reverse().join('');

  const parts: any[] = [
    {
      text: `Δες το περιεχόμενο της σχολικής σημείωσης${
        !/^(νέα\s+)?σημείωση\s*\d*$/i.test(notebookTitle.trim()) ? ` με τίτλο "${notebookTitle}"` : ''
      }${
        pageTexts.length > 0 ? ` και κείμενα: "${pageTexts.join(' | ').slice(0, 400)}"` : ''
      }. Διάβασε προσεκτικά το ΕΛΛΗΝΙΚΟ ΧΕΙΡΟΓΡΑΦΟ ή τυπωμένο κείμενο, τους τύπους και τα σχήματα μέσα στις εικόνες και επέστρεψε ΑΥΣΤΗΡΑ ένα JSON array με τις 3 έως 4 πιο σημαντικές ελληνικές λέξεις-κλειδιά (tags) στην ονομαστική ενικού (π.χ. ["νεύτωνας", "ισορροπία", "νόμος", "δύναμη"] ή ["φωτοσύνθεση", "γλυκόζη", "οξυγόνο", "φως"]). Μόνο 3 έως 4 ουσιαστικές ελληνικές λέξεις!`,
    },
  ];

  for (const url of imageDataUrls.slice(0, 4)) {
    const compact = await downscaleImageDataUrlForVision(url);
    if (compact) {
      parts.push({
        inlineData: {
          mimeType: compact.mimeType,
          data: compact.base64,
        },
      });
    }
  }

  const candidateModels = Array.from(
    new Set([
      ...(cachedWorkingVisionModel ? [cachedWorkingVisionModel] : []),
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-flash-lite-latest',
    ])
  );

  const tryGenerateWithModel = async (modelName: string): Promise<string[] | null> => {
    try {
      const cleanName = modelName.replace(/^models\//, '');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        const tags = parsed
          .map((t) => String(t || '').replace(/^#+/, '').trim().toLowerCase())
          .filter((t) => t.length >= 2)
          .slice(0, 4);
        if (tags.length > 0) {
          cachedWorkingVisionModel = cleanName;
          return tags;
        }
      }
    } catch {
      // try next model
    }
    return null;
  };

  for (const modelName of candidateModels) {
    const tags = await tryGenerateWithModel(modelName);
    if (tags && tags.length > 0) return tags;
  }

  // Automatic Future-Proof Discovery: query /v1beta/models dynamically if all known aliases/versions rotated
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      const discovered: string[] = (listData?.models || [])
        .filter(
          (m: any) =>
            Array.isArray(m?.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes('generateContent') &&
            typeof m.name === 'string' &&
            m.name.includes('gemini') &&
            m.name.includes('flash') &&
            !m.name.includes('tts') &&
            !m.name.includes('transcribe') &&
            !m.name.includes('embedding')
        )
        .map((m: any) => String(m.name).replace(/^models\//, ''))
        .sort((a: string, b: string) => b.localeCompare(a, undefined, { numeric: true }));

      for (const dynModel of discovered) {
        if (candidateModels.includes(dynModel)) continue;
        const tags = await tryGenerateWithModel(dynModel);
        if (tags && tags.length > 0) return tags;
      }
    }
  } catch {
    // ignore discovery error
  }

  return [];
}

/**
 * Uses Gemini Flash Vision to transcribe Lasso-selected Greek handwritten strokes into clean
 * Greek text (preserving line breaks and accents) so it can be rendered in a Calligraphic font.
 */
export async function transcribeHandwrittenStrokesWithGemini(
  imageDataUrl: string,
  notebookTitle = ''
): Promise<string | null> {
  const partA = ((import.meta as any).env?.VITE_GV_A || '') as string;
  const partB = ((import.meta as any).env?.VITE_GV_B || '') as string;
  if (!partA || !partB) return null;
  const apiKey = (partA + partB).split('').reverse().join('');

  const compact = await downscaleImageDataUrlForVision(imageDataUrl);
  if (!compact) return null;

  const contextHint =
    notebookTitle && !/^(νέα\s+)?σημείωση\s*\d*$/i.test(notebookTitle.trim())
      ? ` (από σχολική σημείωση με θέμα "${notebookTitle}")`
      : '';

  const parts: any[] = [
    {
      text: `Διάβασε με απόλυτη ακρίβεια το ΕΛΛΗΝΙΚΟ ΧΕΙΡΟΓΡΑΦΟ κείμενο (ή αριθμούς/σύμβολα) που φαίνεται στην εικόνα${contextHint}. Διόρθωσε αυτόματα τυχόν ατελή γράμματα ή τόνους ώστε οι ελληνικές λέξεις να είναι ορθογραφικά σωστές και να βγάζουν νόημα, διατήρησε τις αλλαγές γραμμής (\\n) αν το κείμενο είναι γραμμένο σε πολλές σειρές, και επέστρεψε ΑΥΣΤΗΡΑ JSON της μορφής {"text": "..."} χωρίς κανένα άλλο σχόλιο.`,
    },
    {
      inlineData: {
        mimeType: compact.mimeType,
        data: compact.base64,
      },
    },
  ];

  const candidateModels = Array.from(
    new Set([
      ...(cachedWorkingVisionModel ? [cachedWorkingVisionModel] : []),
      'gemini-3-flash-preview',
      'gemini-flash-lite-latest',
      'gemini-flash-latest',
    ])
  );

  const tryTranscribeWithModel = async (
    modelName: string,
    timeoutMs = 7500
  ): Promise<string | null> => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const cleanName = modelName.replace(/^models\//, '');
      const isLite = cleanName.includes('lite');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseMimeType: 'application/json',
              ...(isLite ? {} : { thinkingConfig: { thinkingBudget: 0 } }),
            },
          }),
        }
      );
      if (!res.ok) {
        if (cachedWorkingVisionModel === cleanName) cachedWorkingVisionModel = null;
        return null;
      }
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;
      const parsed = JSON.parse(rawText);
      const transcribed =
        typeof parsed?.text === 'string'
          ? parsed.text.trim()
          : Array.isArray(parsed)
          ? parsed.join(' ').trim()
          : '';
      if (transcribed.length > 0) {
        cachedWorkingVisionModel = cleanName;
        return transcribed;
      }
    } catch {
      if (cachedWorkingVisionModel === modelName.replace(/^models\//, '')) {
        cachedWorkingVisionModel = null;
      }
    } finally {
      window.clearTimeout(timer);
    }
    return null;
  };

  return runVisionWithStaggeredHedge(candidateModels, tryTranscribeWithModel, 1900, 7500);
}

/**
 * Splits a single-line or multi-line LaTeX string into clean individual row strings
 * so each row can be rendered cleanly on its own line in KaTeX without broken `\[6pt]`
 * or `\begin{aligned}` escaping artifacts.
 */
export function splitAndCleanMathLatexLines(rawLatex: string): string[] {
  if (!rawLatex || !rawLatex.trim()) return [];
  const stripped = rawLatex
    .replace(/^\$\$+|\$\$+$/g, '')
    .replace(/^\\\[|\\\]$/g, '')
    .replace(/\\begin\{(aligned|align\*?|gathered|gather\*?|split)\}/gi, '\n')
    .replace(/\\end\{(aligned|align\*?|gathered|gather\*?|split)\}/gi, '\n')
    // Replace `\\[6pt]`, `\[6pt]`, or `[6pt]` with a clean newline break
    .replace(/\\*\[\s*\d+(?:\.\d+)?\s*(?:pt|px|em|ex|mm|cm)\s*\]/gi, '\n')
    // Replace `\\` (LaTeX newline) or `\newline` / `\cr` with a clean newline break
    .replace(/\\\\+/g, '\n')
    .replace(/\\(?:newline|cr)\b/g, '\n');

  return stripped
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/\\*\[\s*\d+(?:\.\d+)?\s*(?:pt|px|em|ex|mm|cm)\s*\]/gi, '')
        .replace(/^\s*&\s*/, '')
        .replace(/\s*&\s*/g, ' ')
        .trim()
    )
    .filter((line) => line.length > 0);
}

/**
 * MathOCR via Gemini Flash Vision:
 * Reads Lasso-selected handwritten Physics / Mathematics / Chemistry equations and derivations
 * (simple & compound fractions, implication arrows \Rightarrow, equals =, multiplication \cdot,
 * deltas \Delta, subscripts/superscripts, roots, circled numbers, and units of measurement like s, m/s, kg, N)
 * and returns KaTeX-ready LaTeX + plain text fallback.
 */
export async function transcribeHandwrittenMathWithGemini(
  imageDataUrl: string,
  notebookTitle = ''
): Promise<{ latex: string; plainText: string } | null> {
  const partA = ((import.meta as any).env?.VITE_GV_A || '') as string;
  const partB = ((import.meta as any).env?.VITE_GV_B || '') as string;
  if (!partA || !partB) return null;
  const apiKey = (partA + partB).split('').reverse().join('');

  const compact = await downscaleImageDataUrlForVision(imageDataUrl);
  if (!compact) return null;

  const contextHint =
    notebookTitle && !/^(νέα\s+)?σημείωση\s*\d*$/i.test(notebookTitle.trim())
      ? ` (από σχολική σημείωση με θέμα "${notebookTitle}")`
      : '';

  const parts: any[] = [
    {
      text: `Είσαι εξειδικευμένο σύστημα MathOCR για ελληνικές σημειώσεις Φυσικής, Μαθηματικών και Χημείας${contextHint}.
Διάβασε με απόλυτη ακρίβεια τις χειρόγραφες εξισώσεις, κλάσματα, συνεπαγωγές, σύμβολα και μονάδες μέτρησης που φαίνονται στην εικόνα και μετάτρεψέ τα σε έγκυρο κώδικα KaTeX LaTeX:
1. Απλά & σύνθετα κλάσματα: χρησιμοποίησε \\frac{αριθμητής}{παρονομαστής} (π.χ. \\frac{\\Delta x}{\\Delta t}, \\frac{5}{1}, \\frac{20}{\\Delta t}, \\frac{20}{5}).
2. Συνεπαγωγές & βέλη: χρησιμοποίησε \\Rightarrow (για συνεπάγεται), \\Leftrightarrow (ισοδύναμα), \\rightarrow.
3. Πολλαπλασιασμός & σύμβολα: χρησιμοποίησε \\cdot για την τελεία πολλαπλασιασμού (π.χ. 5 \\cdot \\Delta t = 20), \\Delta για το Δέλτα (π.χ. \\Delta x, \\Delta t), δείκτες/εκθέτες (x_1, v_0, t^2), ρίζες (\\sqrt{...}), διανύσματα (\\vec{F}, \\vec{u}, \\vec{a}).
4. Κυκλωμένοι αριθμοί ασκήσεων (αν υπάρχουν στην αρχή, π.χ. ①, ②, ③): γράψε τους ως \\text{①}\\; ή \\text{②}\\; ή \\text{③}\\;.
5. Μονάδες μέτρησης & ελληνικές λέξεις: βάλε τις μονάδες μέτρησης σε \\text{ ... } με ένα μικρό κενό πριν (π.χ. 4\\,\\text{s}, 10\\,\\text{m/s}, 5\\,\\text{kg}, 25\\,\\text{N}). Αν υπάρχουν ελληνικές λέξεις, βάλε τες μέσα σε \\text{...}.
6. Πολλές γραμμές (σειρές): αν το χειρόγραφο έχει 2 ή περισσότερες σειρές (η μία κάτω από την άλλη), βάλε κάθε σειρά ως ξεχωριστό στοιχείο στον πίνακα "lines" (και ένωσέ τες με απλό χαρακτήρα αλλαγής γραμμής "\\n" στο "latex"). ΜΗΝ χρησιμοποιείς ΠΟΤΕ \\[6pt], \\\\[6pt] ή \\begin{aligned}.
7. ΜΗΝ βάζεις εξωτερικά σύμβολα $$ ή \\[ \\] γύρω από το latex string.
Επέστρεψε ΑΥΣΤΗΡΑ JSON της μορφής:
{"lines": ["σειρά 1 σε LaTeX", "σειρά 2 σε LaTeX"], "latex": "σειρά 1\\nσειρά 2", "plainText": "..."}
χωρίς κανένα άλλο σχόλιο.`,
    },
    {
      inlineData: {
        mimeType: compact.mimeType,
        data: compact.base64,
      },
    },
  ];

  const candidateModels = Array.from(
    new Set([
      ...(cachedWorkingVisionModel ? [cachedWorkingVisionModel] : []),
      'gemini-3-flash-preview',
      'gemini-flash-lite-latest',
      'gemini-flash-latest',
    ])
  );

  const tryMathWithModel = async (
    modelName: string,
    timeoutMs = 7500
  ): Promise<{ latex: string; plainText: string } | null> => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const cleanName = modelName.replace(/^models\//, '');
      const isLite = cleanName.includes('lite');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseMimeType: 'application/json',
              ...(isLite ? {} : { thinkingConfig: { thinkingBudget: 0 } }),
            },
          }),
        }
      );
      if (!res.ok) {
        if (cachedWorkingVisionModel === cleanName) cachedWorkingVisionModel = null;
        return null;
      }
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;
      const parsed = JSON.parse(rawText);
      const fromLines = Array.isArray(parsed?.lines)
        ? parsed.lines
            .map((l: any) => (typeof l === 'string' ? l.trim() : ''))
            .filter((l: string) => l.length > 0)
            .join('\n')
        : '';
      const rawLatex =
        fromLines ||
        (typeof parsed?.latex === 'string'
          ? parsed.latex.trim()
          : typeof parsed?.text === 'string'
          ? parsed.text.trim()
          : '');
      const cleanedRows = splitAndCleanMathLatexLines(rawLatex);
      const cleanLatex = cleanedRows.join('\n').trim();
      const plainText =
        typeof parsed?.plainText === 'string' && parsed.plainText.trim().length > 0
          ? splitAndCleanMathLatexLines(parsed.plainText).join('\n').trim()
          : cleanLatex;
      if (cleanLatex.length > 0) {
        cachedWorkingVisionModel = cleanName;
        return { latex: cleanLatex, plainText };
      }
    } catch {
      if (cachedWorkingVisionModel === modelName.replace(/^models\//, '')) {
        cachedWorkingVisionModel = null;
      }
    } finally {
      window.clearTimeout(timer);
    }
    return null;
  };

  return runVisionWithStaggeredHedge(candidateModels, tryMathWithModel, 1900, 7500);
}

/**
 * Returns the two cubic Bézier control points `(cp1x, cp1y, cp2x, cp2y)` for a segment `pA -> pB`
 * when either `pA` has outgoing Illustrator handle `(outDx, outDy)` or `pB` has incoming handle `(inDx, inDy)`,
 * or `null` if the segment does not use cubic Bézier tangent handles.
 */
export function getCubicSegmentControlPoints(
  pA: BezierPoint,
  pB: BezierPoint
): { cp1x: number; cp1y: number; cp2x: number; cp2y: number } | null {
  const hasOutA = pA.outDx !== undefined && pA.outDy !== undefined;
  const hasInB = pB.inDx !== undefined && pB.inDy !== undefined;
  if (!hasOutA && !hasInB) return null;

  const hInBx = hasInB ? pB.x + (pB.inDx as number) : pB.x;
  const hInBy = hasInB ? pB.y + (pB.inDy as number) : pB.y;
  const hOutAx = hasOutA ? pA.x + (pA.outDx as number) : pA.x;
  const hOutAy = hasOutA ? pA.y + (pA.outDy as number) : pA.y;

  const cp1x = hasOutA ? hOutAx : pA.x + 0.5 * (hInBx - pA.x);
  const cp1y = hasOutA ? hOutAy : pA.y + 0.5 * (hInBy - pA.y);
  const cp2x = hasInB ? hInBx : pB.x + 0.5 * (hOutAx - pB.x);
  const cp2y = hasInB ? hInBy : pB.y + 0.5 * (hOutAy - pB.y);
  return { cp1x, cp1y, cp2x, cp2y };
}

/**
 * Recomputes symmetrical Catmull-Rom / Cardinal Bézier tangent handles (`inDx, inDy, outDx, outDy`)
 * for all nodes in `pts` that have `smooth === true` and have not been manually locked (`twist !== 777`).
 * Guarantees that dragging an interior node on a line creates a 100% symmetrical smooth arch (τόξο)!
 */
export function recomputeAutoSmoothHandles(pts: BezierPoint[], isClosed = false): BezierPoint[] {
  if (pts.length < 2) return pts;
  const out = pts.map((p) => ({ ...p }));
  const n = out.length;
  const hasClosingDup = isClosed && n > 2 && distance(out[0], out[n - 1]) < 1.5;
  const uniqueN = hasClosingDup ? n - 1 : n;

  for (let i = 0; i < uniqueN; i++) {
    const p = out[i];
    if (!p.smooth || p.twist === 777) continue;

    if (isClosed && uniqueN >= 3) {
      const pPrev = out[(i - 1 + uniqueN) % uniqueN];
      const pNext = out[(i + 1) % uniqueN];
      const tx = pNext.x - pPrev.x;
      const ty = pNext.y - pPrev.y;
      const tLen = Math.hypot(tx, ty) || 1;
      const ux = tx / tLen;
      const uy = ty / tLen;
      const dPrev = distance(p, pPrev);
      const dNext = distance(pNext, p);
      p.inDx = -ux * dPrev * 0.36;
      p.inDy = -uy * dPrev * 0.36;
      p.outDx = ux * dNext * 0.36;
      p.outDy = uy * dNext * 0.36;
      p.cx = undefined;
      p.cy = undefined;
    } else if (i > 0 && i < n - 1) {
      const pPrev = out[i - 1];
      const pNext = out[i + 1];
      const tx = pNext.x - pPrev.x;
      const ty = pNext.y - pPrev.y;
      const tLen = Math.hypot(tx, ty) || 1;
      const ux = tx / tLen;
      const uy = ty / tLen;
      const dPrev = distance(p, pPrev);
      const dNext = distance(pNext, p);
      p.inDx = -ux * dPrev * 0.38;
      p.inDy = -uy * dPrev * 0.38;
      p.outDx = ux * dNext * 0.38;
      p.outDy = uy * dNext * 0.38;
      p.cx = undefined;
      p.cy = undefined;
      if (out[i + 1]) {
        out[i + 1].cx = undefined;
        out[i + 1].cy = undefined;
      }
    } else if (i === 0 && n >= 2) {
      const pNext = out[1];
      p.outDx = (pNext.x - p.x) * 0.38;
      p.outDy = (pNext.y - p.y) * 0.38;
      p.inDx = -p.outDx;
      p.inDy = -p.outDy;
      p.cx = undefined;
      p.cy = undefined;
    } else if (i === n - 1 && n >= 2) {
      const pPrev = out[n - 2];
      p.inDx = (pPrev.x - p.x) * 0.38;
      p.inDy = (pPrev.y - p.y) * 0.38;
      p.outDx = -p.inDx;
      p.outDy = -p.inDy;
      p.cx = undefined;
      p.cy = undefined;
    }
  }

  if (hasClosingDup && uniqueN >= 3) {
    out[n - 1] = {
      ...out[n - 1],
      x: out[0].x,
      y: out[0].y,
      inDx: out[0].inDx,
      inDy: out[0].inDy,
      outDx: out[0].outDx,
      outDy: out[0].outDy,
      smooth: out[0].smooth,
      twist: out[0].twist,
    };
  }

  return out;
}

/**
 * Reverses a `BezierPoint[]` spline array so the drawn curve remains 100% identical pixel-for-pixel,
 * upgrading any quadratic `(cx, cy)` control points to cubic `(inDx, inDy, outDx, outDy)` and swapping
 * incoming/outgoing tangent handles on every vertex.
 */
export function reverseBezierPointsExact(pts: BezierPoint[]): BezierPoint[] {
  const n = pts.length;
  if (n === 0) return [];
  const upgraded = pts.map((p) => ({ ...p }));
  for (let i = 1; i < n; i++) {
    const prev = upgraded[i - 1];
    const curr = upgraded[i];
    if (
      curr.cx !== undefined &&
      curr.cy !== undefined &&
      prev.outDx === undefined &&
      curr.inDx === undefined
    ) {
      prev.outDx = (2 / 3) * (curr.cx - prev.x);
      prev.outDy = (2 / 3) * (curr.cy - prev.y);
      curr.inDx = (2 / 3) * (curr.cx - curr.x);
      curr.inDy = (2 / 3) * (curr.cy - curr.y);
      curr.cx = undefined;
      curr.cy = undefined;
    }
  }
  const out: BezierPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const p = upgraded[i];
    out.push({
      ...p,
      inDx: p.outDx,
      inDy: p.outDy,
      outDx: p.inDx,
      outDy: p.inDy,
      cx: undefined,
      cy: undefined,
    });
  }
  return out;
}

/**
 * Converts any open stroke (`!s.isShape` freehand curve, 3-point parabola/arc/hyperbola, or `'line'` spline)
 * into a sparse cubic Bézier spline (`BezierPoint[]`) that preserves the exact curve geometry and key nodes.
 */
export function convertOpenStrokeToBezierSplinePoints(s: StrokeObject): BezierPoint[] {
  if (!s.isShape) {
    const kIndices =
      s.keyNodeIndices && s.keyNodeIndices.length >= 2
        ? s.keyNodeIndices
        : computeFreehandKeyNodeIndices(s.points);
    const nodes: BezierPoint[] = kIndices.map((kIdx) => {
      const kp = s.points[Math.max(0, Math.min(s.points.length - 1, kIdx))];
      return {
        x: kp.x,
        y: kp.y,
        pressure: kp.pressure ?? 0.7,
        smooth: false,
        twist: 777,
      };
    });

    const sampleAtFraction = (idxA: number, idxB: number, frac: number): { x: number; y: number } => {
      if (idxB <= idxA) {
        const p = s.points[idxA];
        return { x: p.x, y: p.y };
      }
      let totalArc = 0;
      const cum: number[] = [0];
      for (let i = idxA + 1; i <= idxB; i++) {
        totalArc += distance(s.points[i - 1], s.points[i]);
        cum.push(totalArc);
      }
      if (totalArc < 1e-4) {
        const p = s.points[idxA];
        return { x: p.x, y: p.y };
      }
      const targetArc = totalArc * frac;
      for (let k = 1; k < cum.length; k++) {
        if (cum[k] >= targetArc) {
          const segStart = cum[k - 1];
          const segLen = Math.max(1e-4, cum[k] - segStart);
          const u = (targetArc - segStart) / segLen;
          const p1 = s.points[idxA + k - 1];
          const p2 = s.points[idxA + k];
          return {
            x: p1.x + u * (p2.x - p1.x),
            y: p1.y + u * (p2.y - p1.y),
          };
        }
      }
      const pEnd = s.points[idxB];
      return { x: pEnd.x, y: pEnd.y };
    };

    for (let pos = 0; pos < kIndices.length - 1; pos++) {
      const idxA = Math.max(0, Math.min(s.points.length - 1, kIndices[pos]));
      const idxB = Math.max(0, Math.min(s.points.length - 1, kIndices[pos + 1]));
      const p0 = nodes[pos];
      const p3 = nodes[pos + 1];
      const q1 = sampleAtFraction(idxA, idxB, 1 / 3);
      const q2 = sampleAtFraction(idxA, idxB, 2 / 3);
      const cp1x = (-5 * p0.x + 18 * q1.x - 9 * q2.x + 2 * p3.x) / 6;
      const cp1y = (-5 * p0.y + 18 * q1.y - 9 * q2.y + 2 * p3.y) / 6;
      const cp2x = (2 * p0.x - 9 * q1.x + 18 * q2.x - 5 * p3.x) / 6;
      const cp2y = (2 * p0.y - 9 * q1.y + 18 * q2.y - 5 * p3.y) / 6;
      p0.outDx = cp1x - p0.x;
      p0.outDy = cp1y - p0.y;
      p3.inDx = cp2x - p3.x;
      p3.inDy = cp2y - p3.y;
    }
    return nodes;
  }

  if (
    (s.shapeType === 'parabola' || s.shapeType === 'arc' || s.shapeType === 'hyperbola') &&
    s.points.length >= 3
  ) {
    const rawPts = s.points.map((p, idx) => ({
      ...p,
      smooth: idx === 1,
    }));
    return recomputeAutoSmoothHandles(rawPts, false);
  }

  if (s.shapeType === 'sine' || s.shapeType === 'cosine') {
    return ensureWaveBezierPoints(s).map((p) => ({ ...p }));
  }

  const out = s.points.map((p) => ({ ...p }));
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1];
    const curr = out[i];
    if (
      curr.cx !== undefined &&
      curr.cy !== undefined &&
      prev.outDx === undefined &&
      curr.inDx === undefined
    ) {
      prev.outDx = (2 / 3) * (curr.cx - prev.x);
      prev.outDy = (2 / 3) * (curr.cy - prev.y);
      curr.inDx = (2 / 3) * (curr.cx - curr.x);
      curr.inDy = (2 / 3) * (curr.cy - curr.y);
      curr.cx = undefined;
      curr.cy = undefined;
    }
  }
  return out;
}

// ============================================================================
// CIRCUIT TERMINALS, AUTO-SPLIT WIRE ROUTING, 1-CLICK CONVERSION & SIMULATION
// ============================================================================

export type CircuitComponentKind =
  | 'battery'
  | 'voltage-source'
  | 'bulb'
  | 'resistor'
  | 'switch'
  | 'fan';

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
  switchClosed?: boolean;
}

function classifyCircuitStrokeKind(s: StrokeObject): CircuitComponentKind | null {
  const st = s.shapeType;
  if (st === 'battery') return 'battery';
  if (st === 'voltage-source') return 'voltage-source';
  if (st === 'bulb') return 'bulb';
  if (st === 'resistor') return 'resistor';
  if (st === 'switch' || st === 'switch-blade' || st === 'switch-knob') return 'switch';
  if (st === 'fan' || st === 'fan-blade' || st === 'fan-hub') return 'fan';
  return null;
}

export function getCircuitComponentsWithTerminals(
  strokes: StrokeObject[]
): CircuitComponentInfo[] {
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

    const key =
      isDedicatedCompGroup &&
      !clusters.some((cl) => cl.key === seedGrp)
        ? seedGrp!
        : `comp-${seed.kind}-${seed.stroke.id}`;
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
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    let leftTerm = { x: minX, y: cy };
    let rightTerm = { x: maxX, y: cy };

    if (entry.kind === 'bulb') {
      const baseY = minY + h * 0.8;
      const baseHalfW = Math.max(8, w * 0.23);
      leftTerm = { x: cx - baseHalfW, y: baseY };
      rightTerm = { x: cx + baseHalfW, y: baseY };
    } else if (entry.kind === 'switch') {
      const wireY = minY + h * 0.68;
      leftTerm = { x: minX, y: wireY };
      rightTerm = { x: maxX, y: wireY };
    } else if (entry.kind === 'battery') {
      const bodyStroke = entry.strokes.find((s) => s.points.length >= 6);
      if (bodyStroke) {
        let bMinX = Infinity;
        let bMaxX = -Infinity;
        for (const p of bodyStroke.points) {
          if (p.x < bMinX) bMinX = p.x;
          if (p.x > bMaxX) bMaxX = p.x;
        }
        leftTerm = { x: Number.isFinite(bMinX) ? bMinX : minX + w * 0.16, y: cy };
        rightTerm = { x: Number.isFinite(bMaxX) ? bMaxX : maxX - w * 0.16, y: cy };
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
      switchClosed: entry.kind === 'switch' ? (switchClosed ?? true) : undefined,
    });
  }

  return out;
}

export function splitWiresUnderCircuitComponent(
  strokes: StrokeObject[],
  componentStrokeIds: string[]
): StrokeObject[] {
  if (componentStrokeIds.length === 0) return strokes;
  const compSet = new Set(componentStrokeIds);
  const targetStrokes = strokes.filter((s) => compSet.has(s.id));
  if (targetStrokes.length === 0) return strokes;

  const comps = getCircuitComponentsWithTerminals(targetStrokes);
  if (comps.length === 0) return strokes;

  let currentStrokes = [...strokes];

  for (const comp of comps) {
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
                  { x: leftEndPt.x, y: leftEndPt.y, pressure: 0.7 },
                  {
                    x: comp.leftTerm.x,
                    y: leftEndPt.y,
                    cx: (leftEndPt.x + comp.leftTerm.x) / 2,
                    cy: leftEndPt.y,
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
                  { x: comp.rightTerm.x, y: rightEndPt.y, pressure: 0.7 },
                  {
                    x: rightEndPt.x,
                    y: rightEndPt.y,
                    cx: (comp.rightTerm.x + rightEndPt.x) / 2,
                    cy: rightEndPt.y,
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
            if (Math.abs(newP1.y - comp.leftTerm.y) < 18) newP0.y = newP1.y;
            else newP0.y = comp.leftTerm.y;
          } else if (dStartR <= SNAP_R && newP1.x > comp.rightTerm.x) {
            newP0.x = comp.rightTerm.x;
            if (Math.abs(newP1.y - comp.rightTerm.y) < 18) newP0.y = newP1.y;
            else newP0.y = comp.rightTerm.y;
          }
          if (dEndL <= SNAP_R && dEndL <= dEndR && newP0.x < comp.leftTerm.x) {
            newP1.x = comp.leftTerm.x;
            if (Math.abs(newP0.y - comp.leftTerm.y) < 18) newP1.y = newP0.y;
            else newP1.y = comp.leftTerm.y;
          } else if (dEndR <= SNAP_R && newP0.x > comp.rightTerm.x) {
            newP1.x = comp.rightTerm.x;
            if (Math.abs(newP0.y - comp.rightTerm.y) < 18) newP1.y = newP0.y;
            else newP1.y = comp.rightTerm.y;
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

export function autoAlignAndConnectCircuit(strokes: StrokeObject[]): StrokeObject[] {
  let currentStrokes = strokes.map((s) => ({
    ...s,
    points: s.points.map((p) => ({ ...p })),
  }));

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
        width: 2.8,
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
        s.shapeType === 'fan'
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
    if (s.shapeType && s.shapeType !== 'line') return;
    if (s.points[0]?.twist === 999) return;
    if (!s.isShape && s.points.length > 2) return;
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
    for (const wi of row.wireIndices) {
      wireRefs[wi].y1 = row.yRow;
      wireRefs[wi].y2 = row.yRow;
      wireRefs[wi].avgY = row.yRow;
    }
  }
  for (const col of vCols) {
    col.xCol = Math.round(col.xCol);
    for (const wi of col.wireIndices) {
      wireRefs[wi].x1 = col.xCol;
      wireRefs[wi].x2 = col.xCol;
      wireRefs[wi].avgX = col.xCol;
    }
  }

  // 3. Vertically align each circuit component to its nearest horizontal wire row ONLY if visibly close
  const maxRowAlignDist = repairedOversizedComp ? 95 : 42;
  for (const comp of initialComps) {
    const termY = comp.leftTerm.y;
    let bestRow: (typeof hRows)[number] | null = null;
    let bestDist = maxRowAlignDist;
    for (const row of hRows) {
      const d = Math.abs(row.yRow - termY);
      if (d <= bestDist) {
        bestDist = d;
        bestRow = row;
      }
    }
    if (bestRow) {
      const dy = bestRow.yRow - termY;
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
    }
  }

  // Recompute component terminal positions after vertical alignment
  const alignedComps = getCircuitComponentsWithTerminals(currentStrokes);
  const CLOSE_SNAP_TOL = 44;
  const TERM_SNAP_TOL = 56;

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
      .filter((c) => Math.abs(c.leftTerm.y - yRow) <= 34)
      .sort((a, b) => a.cx - b.cx);

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
        newWireStrokes.push(
          makeCleanWireStroke(m.stroke, m.xL, yRow, m.xR, yRow, `h${rIdx}-${mIdx}`)
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
              newWireStrokes.push(
                makeCleanWireStroke(
                  templateWireStroke,
                  c.rightTerm.x,
                  yRow,
                  col.xCol,
                  yRow,
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
              newWireStrokes.push(
                makeCleanWireStroke(
                  templateWireStroke,
                  col.xCol,
                  yRow,
                  c.leftTerm.x,
                  yRow,
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
            newWireStrokes.push(
              makeCleanWireStroke(
                templateWireStroke,
                cLeft.rightTerm.x,
                yRow,
                cRight.leftTerm.x,
                yRow,
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
  const hWireEndpoints: { x: number; y: number }[] = [];
  for (const nw of newWireStrokes) {
    if (nw.points.length >= 2) {
      hWireEndpoints.push(nw.points[0], nw.points[1]);
    }
  }

  for (let cIdx = 0; cIdx < vCols.length; cIdx++) {
    const col = vCols[cIdx];
    const xCol = col.xCol;
    const vIntervals: { yT: number; yB: number; stroke: StrokeObject }[] = [];

    for (const wi of col.wireIndices) {
      const w = wireRefs[wi];
      replacedWireStrokeIds.add(w.stroke.id);
      let yT = Math.min(w.y1, w.y2);
      let yB = Math.max(w.y1, w.y2);

      for (const hep of hWireEndpoints) {
        if (Math.abs(hep.x - xCol) <= CLOSE_SNAP_TOL) {
          if (Math.abs(yT - hep.y) <= CLOSE_SNAP_TOL && yB > hep.y + 8) {
            yT = hep.y;
          }
          if (Math.abs(yB - hep.y) <= CLOSE_SNAP_TOL && yT < hep.y - 8) {
            yB = hep.y;
          }
        }
      }
      if (yB - yT >= 6) {
        vIntervals.push({ yT, yB, stroke: w.stroke });
      }
    }

    vIntervals.sort((a, b) => a.yT - b.yT);
    const mergedV: { yT: number; yB: number; stroke: StrokeObject }[] = [];
    for (const seg of vIntervals) {
      if (mergedV.length === 0) {
        mergedV.push({ ...seg });
      } else {
        const prev = mergedV[mergedV.length - 1];
        if (seg.yT - prev.yB <= 38) {
          prev.yB = Math.max(prev.yB, seg.yB);
        } else {
          mergedV.push({ ...seg });
        }
      }
    }

    for (let mIdx = 0; mIdx < mergedV.length; mIdx++) {
      const mv = mergedV[mIdx];
      const yBreaks: number[] = [mv.yT];
      for (const hep of hWireEndpoints) {
        if (
          Math.abs(hep.x - xCol) <= CLOSE_SNAP_TOL &&
          hep.y > mv.yT + 10 &&
          hep.y < mv.yB - 10 &&
          !yBreaks.some((yb) => Math.abs(yb - hep.y) <= 8)
        ) {
          yBreaks.push(hep.y);
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
          ? Math.max(58, Math.min(84, Math.round(comp.w)))
          : Math.max(62, Math.min(76, Math.round(comp.w * 0.88)));
      const picH =
        comp.kind === 'bulb'
          ? Math.max(78, Math.min(108, Math.round(comp.h)))
          : Math.max(82, Math.min(98, Math.round(picW * 1.32)));
      const schW =
        comp.kind === 'resistor' && comp.w <= 110
          ? Math.max(68, Math.min(88, Math.round(comp.w)))
          : Math.max(68, Math.min(84, Math.round(picW * 1.08)));
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
        width: 2.8,
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
      const bw = box.pictorialW;
      const bh = box.pictorialH;
      const bx = box.cx - bw / 2;
      const by = box.termY - bh * 0.8;
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

function pointToSegmentDist(
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
        pointToSegmentDist(pt.x, pt.y, c.cx - c.w * 0.25, yTop, c.cx - c.w * 0.15, yBot),
        Math.hypot(pt.x - c.leftTerm.x, pt.y - c.leftTerm.y)
      );
    }
    return Math.min(
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

export function analyzeCircuitForSimulation(
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
    if (s.shapeType && s.shapeType !== 'line') {
      continue;
    }

    if (s.shapeType === 'line' || s.points.length <= 6) {
      for (let i = 0; i < s.points.length - 1; i++) {
        const a = s.points[i];
        const b = s.points[i + 1];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        if (len >= 6) {
          rawWires.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, length: len });
        }
      }
    } else {
      let lastPt = s.points[0];
      for (let i = 1; i < s.points.length; i++) {
        const pt = s.points[i];
        const len = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
        if (len >= 18 || i === s.points.length - 1) {
          if (len >= 4) {
            rawWires.push({ x1: lastPt.x, y1: lastPt.y, x2: pt.x, y2: pt.y, length: len });
          }
          lastPt = pt;
        }
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

  for (const cn of compNodes) {
    if (cn.comp.kind === 'battery' || cn.comp.kind === 'voltage-source') {
      continue;
    }
    if (cn.comp.kind === 'switch') {
      if (cn.comp.switchClosed === false) continue;
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

    const dfs = (curr: number, depth: number) => {
      if (depth > 32) return;
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

  if (anyClosedLoop) {
    const primarySourceNode = compNodes.find(
      (cn) => cn.comp.kind === 'battery' || cn.comp.kind === 'voltage-source'
    )!;
    const V = new Float64Array(nodeCenters.length).fill(0.5);
    const isFixed = new Uint8Array(nodeCenters.length);
    V[primarySourceNode.u] = 1.0;
    isFixed[primarySourceNode.u] = 1;
    V[primarySourceNode.v] = 0.0;
    isFixed[primarySourceNode.v] = 1;

    for (let iter = 0; iter < 120; iter++) {
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
          V[u] = sumGV / sumG;
        }
      }
    }

    const voltageBoost = Math.min(2.2, 1 + (sources.length - 1) * 0.45);

    for (const wn of wireNodes) {
      if (!wireInLoop[wn.idx] || wn.u === wn.v) continue;
      const dV = V[wn.u] - V[wn.v];
      // Normalize wire speed smoothly while preserving exact sign of (V[u] - V[v])
      const sign = dV >= 0 ? 1 : -1;
      const mag = Math.abs(dV) > 1e-5 ? Math.max(0.75, Math.min(1.6, Math.abs(dV) * 18 * voltageBoost)) : 0.75;
      wireFlowSum[wn.idx] = sign * mag;
      wireHighEnergy[wn.idx] = (V[wn.u] + V[wn.v]) / 2 >= 0.5;
    }

    for (const cn of compNodes) {
      if (!compInLoop.has(cn.comp.key)) continue;
      const dV = V[cn.u] - V[cn.v];
      const pwr = Math.max(0.5, Math.min(1.8, Math.abs(dV) * 1.15 * voltageBoost));
      compPowerMap.set(cn.comp.key, pwr);
      compSignedFlowMap.set(cn.comp.key, (dV >= 0 ? 1 : -1) * Math.max(0.75, pwr));
    }
  }

  // Detect the Left Vertical Conductor (among active closed-loop wires!) for the automatic interactive switch!
  let autoSwitch: AutoVerticalSwitchInfo | null = null;
  if (anyClosedLoop && wires.length > 0) {
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

    for (const cn of compNodes) {
      const c = cn.comp;
      if (c.kind === 'resistor' && compInLoop.has(c.key)) {
        const flow = compSignedFlowMap.get(c.key) ?? 0.85;
        addComponentLeadSegment(c.minX, c.cy, c.maxX, c.cy, flow);
      } else if (c.kind === 'fan' && compInLoop.has(c.key)) {
        const rOuter = Math.max(20, Math.min(c.w * 0.36, c.h * 0.45));
        const flow = compSignedFlowMap.get(c.key) ?? 0.85;
        addComponentLeadSegment(c.minX, c.cy, c.cx - rOuter, c.cy, flow);
        addComponentLeadSegment(c.cx + rOuter, c.cy, c.maxX, c.cy, flow);
      } else if (c.kind === 'voltage-source') {
        const plateGap = Math.max(10, Math.min(26, c.w * 0.11));
        // Conventional current leaves (+) on the left (cx - plateGap/2 -> minX) and enters (-) on the right (maxX -> cx + plateGap/2)
        addComponentLeadSegment(c.cx - plateGap / 2, c.cy, c.minX, c.cy, 0.85);
        addComponentLeadSegment(c.maxX, c.cy, c.cx + plateGap / 2, c.cy, 0.85);
      } else if (c.kind === 'battery') {
        const batCapLeftX = c.minX + c.w * 0.16;
        const batBodyRightX = c.maxX - c.w * 0.16;
        addComponentLeadSegment(batCapLeftX, c.cy, c.minX, c.cy, 0.85);
        addComponentLeadSegment(c.maxX, c.cy, batBodyRightX, c.cy, 0.85);
      } else if (c.kind === 'switch' && compInLoop.has(c.key)) {
        const wireY = c.minY + c.h * 0.68;
        const flow = compSignedFlowMap.get(c.key) ?? 0.85;
        addComponentLeadSegment(c.minX, wireY, c.minX + c.w * 0.26, wireY, flow);
        addComponentLeadSegment(c.minX + c.w * 0.74, wireY, c.maxX, wireY, flow);
      }
    }

    // Merge contiguous collinear horizontal segments that touch/overlap along the same row and flow in the same direction
    // so electrons march at a 100% uniform 32px spacing across wires, fan leads, resistors, and source leads!
    let mergedAny = true;
    while (mergedAny) {
      mergedAny = false;
      for (let i = 0; i < simulatedWires.length; i++) {
        const a = simulatedWires[i];
        if (!a.inClosedLoop) continue;
        const dax = a.x2 - a.x1;
        const day = a.y2 - a.y1;
        if (Math.abs(day) > Math.abs(dax) * 0.2 || Math.abs(dax) < 4) continue;
        const dirA = dax >= 0 ? 1 : -1;
        const yA = (a.y1 + a.y2) / 2;
        const minAx = Math.min(a.x1, a.x2);
        const maxAx = Math.max(a.x1, a.x2);

        for (let j = i + 1; j < simulatedWires.length; j++) {
          const b = simulatedWires[j];
          if (!b.inClosedLoop) continue;
          const dbx = b.x2 - b.x1;
          const dby = b.y2 - b.y1;
          if (Math.abs(dby) > Math.abs(dbx) * 0.2 || Math.abs(dbx) < 4) continue;
          const dirB = dbx >= 0 ? 1 : -1;
          if (dirA !== dirB) continue;
          const yB = (b.y1 + b.y2) / 2;
          if (Math.abs(yA - yB) > 8) continue;

          const minBx = Math.min(b.x1, b.x2);
          const maxBx = Math.max(b.x1, b.x2);
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

    // Splice exact zig-zag polyline vertices of active Resistors into the merged horizontal wire segments
    // so electrons climb up and down every peak and valley of the resistor zig-zag seamlessly!
    const activeResistors = comps.filter((c) => c.kind === 'resistor' && compInLoop.has(c.key));
    if (activeResistors.length > 0) {
      for (let i = 0; i < simulatedWires.length; i++) {
        const sw = simulatedWires[i];
        if (!sw.inClosedLoop) continue;
        const dx = sw.x2 - sw.x1;
        const dy = sw.y2 - sw.y1;
        if (Math.abs(dy) > Math.abs(dx) * 0.25 || Math.abs(dx) < 8) continue;
        const dir = dx >= 0 ? 1 : -1;
        const yRow = (sw.y1 + sw.y2) / 2;
        const segMinX = Math.min(sw.x1, sw.x2);
        const segMaxX = Math.max(sw.x1, sw.x2);

        const rowResistors = activeResistors
          .filter(
            (r) =>
              Math.abs(r.cy - yRow) <= 14 &&
              r.maxX > segMinX + 4 &&
              r.minX < segMaxX - 4
          )
          .sort((a, b) => (dir > 0 ? a.cx - b.cx : b.cx - a.cx));

        if (rowResistors.length === 0) continue;

        const pathPts: { x: number; y: number }[] = [{ x: sw.x1, y: yRow }];
        for (const r of rowResistors) {
          const resStroke = strokes.find(
            (s) => r.strokeIds.includes(s.id) && s.shapeType === 'resistor'
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
              { x: r.minX, y: yRow },
              { x: r.minX + uStart * r.w, y: yRow },
            ];
            for (let k = 0; k < numPeaks; k++) {
              const u = uStart + ((k + 0.5) / numPeaks) * (uEnd - uStart);
              const vy = k % 2 === 0 ? r.minY + 0.04 * r.h : r.minY + 0.96 * r.h;
              zigPts.push({ x: r.minX + u * r.w, y: vy });
            }
            zigPts.push({ x: r.minX + uEnd * r.w, y: yRow });
            zigPts.push({ x: r.maxX, y: yRow });
          }

          if (zigPts.length >= 4) {
            if (zigPts[0].x > zigPts[zigPts.length - 1].x) {
              zigPts.reverse();
            }
            zigPts[0].y = yRow;
            zigPts[1].y = yRow;
            zigPts[zigPts.length - 2].y = yRow;
            zigPts[zigPts.length - 1].y = yRow;

            const oriented = dir > 0 ? zigPts : zigPts.slice().reverse();
            for (const pt of oriented) {
              const prev = pathPts[pathPts.length - 1];
              if (Math.hypot(pt.x - prev.x, pt.y - prev.y) >= 1.5) {
                pathPts.push(pt);
              }
            }
          }
        }

        const endPt = { x: sw.x2, y: yRow };
        const lastPt = pathPts[pathPts.length - 1];
        if (Math.hypot(endPt.x - lastPt.x, endPt.y - lastPt.y) >= 1.5) {
          pathPts.push(endPt);
        }

        let effectiveLen = 0;
        for (let k = 0; k < pathPts.length - 1; k++) {
          const sdx = pathPts[k + 1].x - pathPts[k].x;
          const sdy = pathPts[k + 1].y - pathPts[k].y;
          const isDiagonalTooth = Math.abs(sdx) > 0.5 && Math.abs(sdy) > 2;
          effectiveLen += isDiagonalTooth
            ? Math.hypot(sdx, sdy * 0.35)
            : Math.hypot(sdx, sdy);
        }

        simulatedWires[i] = {
          ...sw,
          length: Math.max(8, effectiveLen),
          pathPoints: pathPts,
        };
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

/**
 * Converts plain-text mathematical expressions typed in a Text Box (without requiring LaTeX syntax)
 * into clean KaTeX LaTeX so `(x^2)/9 + y^3 = 1/8` renders as `\frac{x^{2}}{9} + y^{3} = \frac{1}{8}`,
 * while preserving the user's original plain text for inline editing.
 */
export function convertPlainTextToMathLatex(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  const isAtomChar = (ch: string) => /[a-zA-Zα-ωΑ-Ω0-9.^_]/.test(ch);

  const convertSingleExpr = (input: string, depth = 0): string => {
    if (!input || depth > 12) return input;
    let s = input
      .replace(/[−–—]/g, '-')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/⁴/g, '^4');

    // 1. Convert sqrt(...) or √(...)
    let sqrtSafety = 0;
    while (sqrtSafety++ < 16) {
      const m = s.match(/(?:sqrt|√)\s*\(/i);
      if (!m || m.index === undefined) break;
      const openIdx = s.indexOf('(', m.index);
      let d = 0;
      let closeIdx = -1;
      for (let i = openIdx; i < s.length; i++) {
        if (s[i] === '(') d++;
        else if (s[i] === ')') {
          d--;
          if (d === 0) {
            closeIdx = i;
            break;
          }
        }
      }
      if (closeIdx === -1) break;
      const inside = s.slice(openIdx + 1, closeIdx);
      s = `${s.slice(0, m.index)}\\sqrt{${convertSingleExpr(inside, depth + 1)}}${s.slice(closeIdx + 1)}`;
    }
    s = s.replace(/√([a-zA-Zα-ωΑ-Ω0-9.]+)/g, '\\sqrt{$1}');

    // 2. Convert fractions `/` into `\frac{num}{den}`
    let fracSafety = 0;
    while (fracSafety++ < 24) {
      const slashIdx = s.indexOf('/');
      if (slashIdx === -1) break;

      // Find numerator end (skip spaces to the left of `/`)
      let numEnd = slashIdx - 1;
      while (numEnd >= 0 && /\s/.test(s[numEnd])) numEnd--;
      if (numEnd < 0) {
        s = `${s.slice(0, slashIdx)}\\div ${s.slice(slashIdx + 1)}`;
        continue;
      }

      let numStart = numEnd;
      let stripOuterNumParens = false;

      if (s[numEnd] === ')') {
        // Walk back to matching '('
        let d = 0;
        let openIdx = -1;
        for (let i = numEnd; i >= 0; i--) {
          if (s[i] === ')') d++;
          else if (s[i] === '(') {
            d--;
            if (d === 0) {
              openIdx = i;
              break;
            }
          }
        }
        if (openIdx !== -1) {
          // Check if preceded by `^` or `_` or a function name (e.g. `x^(2n)/9` or `(x+1)^2` handled below)
          let prevIdx = openIdx - 1;
          while (prevIdx >= 0 && /\s/.test(s[prevIdx])) prevIdx--;
          if (prevIdx >= 0 && (s[prevIdx] === '^' || s[prevIdx] === '_')) {
            numStart = prevIdx;
            while (numStart > 0 && isAtomChar(s[numStart - 1])) numStart--;
          } else {
            numStart = openIdx;
            stripOuterNumParens = true;
          }
        }
      } else {
        // Walk backwards across atom chars (`x^2`, `3x^2`, `u_max`, `(x+1)^2`, `\frac{...}{...}`, `\sqrt{...}`)
        let i = numEnd;
        while (i >= 0) {
          if (s[i] === ')' || s[i] === '}') {
            const closeCh = s[i];
            const openCh = closeCh === ')' ? '(' : '{';
            let d = 0;
            let openPos = -1;
            for (let j = i; j >= 0; j--) {
              if (s[j] === closeCh) d++;
              else if (s[j] === openCh) {
                d--;
                if (d === 0) {
                  openPos = j;
                  break;
                }
              }
            }
            if (openPos !== -1) {
              i = openPos - 1;
              continue;
            }
          }
          if (isAtomChar(s[i]) || s[i] === '\\') {
            i--;
          } else {
            break;
          }
        }
        numStart = i + 1;
      }

      // Find denominator start (skip spaces to the right of `/`)
      let denStart = slashIdx + 1;
      while (denStart < s.length && /\s/.test(s[denStart])) denStart++;
      if (denStart >= s.length) {
        s = `${s.slice(0, slashIdx)}\\div ${s.slice(slashIdx + 1)}`;
        continue;
      }

      let denEnd = denStart;
      let stripOuterDenParens = false;

      if (s[denStart] === '(') {
        let d = 0;
        let closeIdx = -1;
        for (let i = denStart; i < s.length; i++) {
          if (s[i] === '(') d++;
          else if (s[i] === ')') {
            d--;
            if (d === 0) {
              closeIdx = i;
              break;
            }
          }
        }
        if (closeIdx !== -1) {
          // Check if followed by `^` or `_` (e.g. `1/(x+1)^2`)
          let afterIdx = closeIdx + 1;
          while (afterIdx < s.length && /\s/.test(s[afterIdx])) afterIdx++;
          if (afterIdx < s.length && (s[afterIdx] === '^' || s[afterIdx] === '_')) {
            let i = afterIdx + 1;
            while (i < s.length && /\s/.test(s[i])) i++;
            if (i < s.length && s[i] === '(') {
              let d2 = 0;
              for (let j = i; j < s.length; j++) {
                if (s[j] === '(') d2++;
                else if (s[j] === ')') {
                  d2--;
                  if (d2 === 0) {
                    i = j + 1;
                    break;
                  }
                }
              }
            } else {
              if (i < s.length && (s[i] === '-' || s[i] === '+')) i++;
              while (i < s.length && isAtomChar(s[i])) i++;
            }
            denEnd = i - 1;
          } else {
            denEnd = closeIdx;
            stripOuterDenParens = true;
          }
        }
      } else {
        const preNum = stripOuterNumParens
          ? s.slice(numStart + 1, numEnd).trim()
          : s.slice(numStart, numEnd + 1).trim();
        const isPureNumericNum = /^\d+(?:\.\d+)?$/.test(preNum);
        const denLeadingNumMatch = s.slice(denStart).match(/^-?\d+(?:\.\d+)?/);

        if (isPureNumericNum && denLeadingNumMatch) {
          // e.g. `1/2mu^2` or `3/4x^2` -> fraction is `\frac{1}{2}` followed by `mu^2`!
          denEnd = denStart + denLeadingNumMatch[0].length - 1;
        } else {
          let i = denStart;
          if (s[i] === '-' || s[i] === '+') i++;
          while (i < s.length) {
            if ((s[i] === '^' || s[i] === '_') && i + 1 < s.length) {
              i++;
              while (i < s.length && /\s/.test(s[i])) i++;
              if (i < s.length && s[i] === '(') {
                let d = 0;
                for (let j = i; j < s.length; j++) {
                  if (s[j] === '(') d++;
                  else if (s[j] === ')') {
                    d--;
                    if (d === 0) {
                      i = j + 1;
                      break;
                    }
                  }
                }
                continue;
              }
              if (i < s.length && (s[i] === '-' || s[i] === '+')) i++;
              if (i < s.length && /\d/.test(s[i])) {
                while (i < s.length && /[\d.]/.test(s[i])) i++;
                break;
              }
              if (i < s.length && /[a-zA-Zα-ωΑ-Ω]/.test(s[i])) {
                i++;
                break;
              }
            }
            if (isAtomChar(s[i])) {
              i++;
            } else {
              break;
            }
          }
          denEnd = Math.max(denStart, i - 1);
        }
      }

      const rawNum = stripOuterNumParens
        ? s.slice(numStart + 1, numEnd).trim()
        : s.slice(numStart, numEnd + 1).trim();
      const rawDen = stripOuterDenParens
        ? s.slice(denStart + 1, denEnd).trim()
        : s.slice(denStart, denEnd + 1).trim();

      const convNum = convertSingleExpr(rawNum, depth + 1);
      const convDen = convertSingleExpr(rawDen, depth + 1);
      s = `${s.slice(0, numStart)}\\frac{${convNum}}{${convDen}}${s.slice(denEnd + 1)}`;
    }

    // 3. Convert parenthesized exponents `^(...)` and subscripts `_(...)`
    let expSafety = 0;
    while (expSafety++ < 24) {
      const m = s.match(/([\^_])\s*\(/);
      if (!m || m.index === undefined) break;
      const op = m[1];
      const openIdx = s.indexOf('(', m.index);
      let d = 0;
      let closeIdx = -1;
      for (let i = openIdx; i < s.length; i++) {
        if (s[i] === '(') d++;
        else if (s[i] === ')') {
          d--;
          if (d === 0) {
            closeIdx = i;
            break;
          }
        }
      }
      if (closeIdx === -1) break;
      const inside = s.slice(openIdx + 1, closeIdx).trim();
      s = `${s.slice(0, m.index)}${op}{${convertSingleExpr(inside, depth + 1)}}${s.slice(closeIdx + 1)}`;
    }

    // 4. Convert simple exponents `^2`, `^-2`, `^n` (without swallowing the next variable in `x^2y^3`!) and subscripts `_max`, `_0`
    s = s.replace(/\^\s*(-?(?:\d+(?:\.\d+)?|[a-zA-Zα-ωΑ-Ω]))/g, '^{$1}');
    s = s.replace(/_\s*([a-zA-Zα-ωΑ-Ω0-9.]+)/g, '_{$1}');
    // Guard against any stacked double superscripts `a^{b}^{c}` which cause a KaTeX parse error
    s = s.replace(/([a-zA-Zα-ωΑ-Ω0-9)}])\^\{([^}]+)\}\s*\^\{([^}]+)\}/g, '{$1^{$2}}^{$3}');

    // 5. Convert trig functions & common operators / arrows
    s = s
      .replace(/(?<!\\)\b(sin|cos|tan|ln|log)\b/gi, (_, fn) => `\\${fn.toLowerCase()}`)
      .replace(/(?<!\\text\{)(ημιτ|ημ|συνημ|συν|εφ|σφ)(?=\s*\(|\s*[a-zA-Zα-ωΑ-Ω0-9])/gi, '\\text{$1}')
      .replace(/<=>/g, ' \\Leftrightarrow ')
      .replace(/=>|->/g, ' \\Rightarrow ')
      .replace(/<=/g, ' \\le ')
      .replace(/>=/g, ' \\ge ')
      .replace(/!=/g, ' \\ne ')
      .replace(/\+-|±/g, ' \\pm ')
      .replace(/\*/g, ' \\cdot ');

    return s.trim();
  };

  return rawText
    .split('\n')
    .map((line) => convertSingleExpr(line, 0))
    .join('\n');
}

/**
 * Uses Gemini Flash Vision to recognize a handwritten mathematical equation or function
 * selected with the Lasso tool so we can plot its 2D diagram right next to it.
 */
export async function transcribeEquationForGraphWithGemini(
  imageDataUrl: string,
  notebookTitle = ''
): Promise<{
  equation: string;
  normalizedEquation?: string;
  latex?: string;
  kind?: string;
} | null> {
  const partA = ((import.meta as any).env?.VITE_GV_A || '') as string;
  const partB = ((import.meta as any).env?.VITE_GV_B || '') as string;
  if (!partA || !partB) return null;
  const apiKey = (partA + partB).split('').reverse().join('');

  const compact = await downscaleImageDataUrlForVision(imageDataUrl);
  if (!compact) return null;

  const contextHint =
    notebookTitle && !/^(νέα\s+)?σημείωση\s*\d*$/i.test(notebookTitle.trim())
      ? ` (από σημείωση "${notebookTitle}")`
      : '';

  const parts: any[] = [
    {
      text: `Είσαι εξειδικευμένο σύστημα αναγνώρισης μαθηματικών εξισώσεων, συναρτήσεων και εξισώσεων Απλής Αρμονικής Ταλάντωσης (Φυσικής) για σχεδίαση διαγράμματος${contextHint}.
Διάβασε τη χειρόγραφη εξίσωση ή συνάρτηση στην εικόνα (π.χ. y = sin(x), y = ημ(x), y = ημ(χ), y = cos(x), y = συν(x), y = συν(χ), K = 1/2 m u^2, U = 1/2 D x^2, ΣF = -D x, F = -k x, a = -ω^2 x, K = E - 1/2 D x^2, x = A ημ(ωt), u = u_max συν(ωt), a = -a_max ημ(ωt), ευθεία, παραβολή, κύκλος, έλλειψη, υπερβολή, πολυώνυμο κ.λπ.).
Κανόνες:
1. Στο πεδίο "equation" γράψε ΑΚΡΙΒΩΣ την εξίσωση που έγραψε ο χρήστης σε καθαρή μορφή κρατώντας τα σύμβολα Φυσικής αν πρόκειται για ταλάντωση/ενέργεια/δύναμη (π.χ. "y = sin(x)", "y = ημ(x)", "y = cos(x)", "y = συν(x)", "K = 1/2*m*u^2", "U = 1/2*D*x^2", "ΣF = -D*x", "F = -k*x", "a = -ω^2*x", "K = E - 1/2*D*x^2", "x = A*ημ(ω*t)", "u = u_max*συν(ω*t)", "a = -a_max*ημ(ω*t)", ή για μαθηματικά "x^2 + y^2 = 1", "(x^2)/9 + (y^2)/16 = 25", "y = 2*x + 3", "y = a*x + b", "y = α*x + β", "y = x^2 - 4", "y = 1/x", "y = x^3 - 3*x").
2. Στο πεδίο "normalizedEquation", αν δεν είναι εξίσωση ταλάντωσης και έχει συμβολικές παραμέτρους χωρίς αριθμούς (π.χ. y = ax + b, y = αχ + β, x^2/a^2 + y^2/b^2 = 1), θεώρησε τις παραμέτρους ΘΕΤΙΚΟΥΣ αριθμούς και γράψε την αντίστοιχη εξίσωση σε x και y.
Επέστρεψε ΑΥΣΤΗΡΑ JSON της μορφής:
{"equation": "...", "normalizedEquation": "...", "latex": "...", "kind": "oscillation|circle|ellipse|parabola|hyperbola|line|polynomial|function"}
χωρίς κανένα άλλο σχόλιο.`,
    },
    {
      inlineData: {
        mimeType: compact.mimeType,
        data: compact.base64,
      },
    },
  ];

  const candidateModels = Array.from(
    new Set([
      ...(cachedWorkingVisionModel ? [cachedWorkingVisionModel] : []),
      'gemini-3-flash-preview',
      'gemini-flash-lite-latest',
      'gemini-flash-latest',
    ])
  );

  const tryWithModel = async (
    modelName: string,
    timeoutMs = 8000
  ): Promise<{
    equation: string;
    normalizedEquation?: string;
    latex?: string;
    kind?: string;
  } | null> => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const cleanName = modelName.replace(/^models\//, '');
      const isLite = cleanName.includes('lite');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseMimeType: 'application/json',
              ...(isLite ? {} : { thinkingConfig: { thinkingBudget: 0 } }),
            },
          }),
        }
      );
      if (!res.ok) {
        if (cachedWorkingVisionModel === cleanName) cachedWorkingVisionModel = null;
        return null;
      }
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;
      const cleanJsonText = String(rawText)
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      const parsedRaw = JSON.parse(cleanJsonText);
      const parsed = Array.isArray(parsedRaw) ? parsedRaw[0] : parsedRaw;
      const eq =
        typeof parsed?.equation === 'string' && parsed.equation.trim()
          ? parsed.equation.trim()
          : typeof parsed?.normalizedEquation === 'string' && parsed.normalizedEquation.trim()
          ? parsed.normalizedEquation.trim()
          : typeof parsed?.latex === 'string' && parsed.latex.trim()
          ? parsed.latex.trim()
          : typeof parsed?.text === 'string' && parsed.text.trim()
          ? parsed.text.trim()
          : '';
      if (eq) {
        cachedWorkingVisionModel = cleanName;
        return {
          equation: eq,
          normalizedEquation:
            typeof parsed?.normalizedEquation === 'string'
              ? parsed.normalizedEquation.trim()
              : undefined,
          latex: typeof parsed?.latex === 'string' ? parsed.latex.trim() : undefined,
          kind: typeof parsed?.kind === 'string' ? parsed.kind.trim() : undefined,
        };
      }
    } catch {
      if (cachedWorkingVisionModel === modelName.replace(/^models\//, '')) {
        cachedWorkingVisionModel = null;
      }
    } finally {
      window.clearTimeout(timer);
    }
    return null;
  };

  return runVisionWithStaggeredHedge(candidateModels, tryWithModel, 1900, 8000);
}

/**
 * Helper to replace LaTeX `\frac{A}{B}` (including nested braces) with `((A)/(B))`
 * and `\sqrt{A}` with `SQRT(A)`.
 */
function expandLatexConstructs(input: string): string {
  let s = input;
  const extractBraceGroup = (str: string, startIdx: number): { content: string; nextIdx: number } | null => {
    let i = startIdx;
    while (i < str.length && /\s/.test(str[i])) i++;
    if (str[i] !== '{') return null;
    let depth = 0;
    const contentStart = i + 1;
    for (; i < str.length; i++) {
      if (str[i] === '{') depth++;
      else if (str[i] === '}') {
        depth--;
        if (depth === 0) {
          return { content: str.slice(contentStart, i), nextIdx: i + 1 };
        }
      }
    }
    return null;
  };

  // Expand \frac{A}{B}, \dfrac{A}{B}, \tfrac{A}{B}
  for (let pass = 0; pass < 8; pass++) {
    const fracMatch = s.match(/\\(?:d|t)?frac\b/);
    if (!fracMatch || fracMatch.index === undefined) break;
    const start = fracMatch.index;
    const afterCmd = start + fracMatch[0].length;
    const num = extractBraceGroup(s, afterCmd);
    if (!num) break;
    const den = extractBraceGroup(s, num.nextIdx);
    if (!den) break;
    s = `${s.slice(0, start)}((${num.content})/(${den.content}))${s.slice(den.nextIdx)}`;
  }

  // Expand \sqrt{A}
  for (let pass = 0; pass < 6; pass++) {
    const sqrtMatch = s.match(/\\sqrt\b/);
    if (!sqrtMatch || sqrtMatch.index === undefined) break;
    const start = sqrtMatch.index;
    const afterCmd = start + sqrtMatch[0].length;
    const arg = extractBraceGroup(s, afterCmd);
    if (!arg) break;
    s = `${s.slice(0, start)}SQRT(${arg.content})${s.slice(arg.nextIdx)}`;
  }

  // Expand ^{...} -> ^(...)
  for (let pass = 0; pass < 8; pass++) {
    const powMatch = s.match(/\^\s*\{/);
    if (!powMatch || powMatch.index === undefined) break;
    const start = powMatch.index;
    const braceStart = s.indexOf('{', start);
    const grp = extractBraceGroup(s, braceStart);
    if (!grp) break;
    s = `${s.slice(0, start)}^(${grp.content})${s.slice(grp.nextIdx)}`;
  }

  return s;
}

/**
 * Normalizes a raw math equation string (from Text box, MathOCR LaTeX, or Gemini Vision)
 * into a clean algebraic equation in `x` and `y` with positive symbolic parameter substitution.
 */
export function normalizeMathEquationForPlot(rawInput: string): string {
  if (!rawInput || !rawInput.trim()) return '';

  // Take the last non-empty equation line or last implication step
  const lines = splitAndCleanMathLatexLines(rawInput);
  let line = lines.length > 0 ? lines[lines.length - 1] : rawInput.trim();
  const arrowParts = line.split(/\\Rightarrow|\\Leftrightarrow|\\implies|⇒|⇔|->/);
  if (arrowParts.length > 1) {
    const lastPart = arrowParts[arrowParts.length - 1].trim();
    if (lastPart) line = lastPart;
  }

  // Repair any legacy `x^{2y}^{3}` (where a digit and a variable were merged inside `^{...}` before another `^`)
  line = line.replace(/\^\{(-?\d+(?:\.\d+)?)([a-zA-Zα-ωΑ-Ω])\}\s*\^/g, '^{$1}*$2^');

  let s = expandLatexConstructs(line);

  // Strip LaTeX formatting wrappers
  s = s
    .replace(/\\left\s*\|([^|]+)\\right\s*\|/g, 'ABS($1)')
    .replace(/\|([^|=]+)\|/g, 'ABS($1)')
    .replace(/\\left\b|\\right\b|\\displaystyle\b/g, '')
    .replace(/\\(?:text|operatorname|mathrm)\{([^}]*)\}/g, '$1')
    .replace(/\\(?:cdot|times)\b/g, '*')
    .replace(/[·×∙]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/\\alpha\b/g, 'α')
    .replace(/\\beta\b/g, 'β')
    .replace(/\\gamma\b/g, 'γ')
    .replace(/\\delta\b/g, 'δ')
    .replace(/\\kappa\b/g, 'κ')
    .replace(/\\lambda\b/g, 'λ')
    .replace(/\\mu\b/g, 'μ')
    .replace(/\\rho\b/g, 'ρ')
    .replace(/\\omega\b/g, 'ω')
    .replace(/\\pi\b|π/g, '3.14159265');

  // Convert Unicode superscripts (e.g. x², y³, x⁻²) to ^(2), ^(3), ^(-2)
  const supMap: Record<string, string> = {
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
    '⁺': '+',
    '⁻': '-',
  };
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, (match) => {
    const digits = match
      .split('')
      .map((ch) => supMap[ch] ?? '')
      .join('');
    return `^(${digits})`;
  });

  // Normalize trig & standard functions into uppercase tokens before single-letter variable splitting
  // Note: Do NOT use `\b` after Greek words (`ημ`, `συν`, `εφ`) or unparenthesized `sinx`/`cosx` because JS `\b` only matches ASCII!
  s = s
    .replace(/\\?(?:sin(?!h)|ημιτ|ημ)/gi, 'SIN')
    .replace(/\\?(?:cos(?!h)|συνημ|συν)/gi, 'COS')
    .replace(/\\?(?:tan(?!h)|tg|εφ)/gi, 'TAN')
    .replace(/\\?(?:ln)\b/gi, 'LN')
    .replace(/\\?(?:log)\b/gi, 'LOG')
    .replace(/\\?(?:exp)\b/gi, 'EXP')
    .replace(/\\?(?:sqrt)\b/gi, 'SQRT')
    .replace(/√\s*\(([^)]+)\)/g, 'SQRT($1)')
    .replace(/√\s*([a-zA-Zα-ωΑ-Ω0-9]+)/g, 'SQRT($1)')
    .replace(/\\?(?:abs)\b/gi, 'ABS');

  // Convert f(x), g(x), y(x), x(t), u(t), v(t) (also accepting Greek χ)
  s = s
    .replace(/(?<![A-Z])\b[fghyFGH]\s*\(\s*[xχ]\s*\)/g, 'y')
    .replace(/(?<![A-Z])\b[xuvXUV]\s*\(\s*t\s*\)/g, 'y');

  // Remove subscripts like x_0, y_0, u_0, v_0 -> treat as symbolic positive constant k
  s = s
    .replace(/\b([xyuvα-ωa-z])\s*_\s*\{?\s*0\s*\}?/gi, 'b')
    .replace(/\\[a-zA-Z]+/g, '');

  // Replace Greek χ/Χ with x, and ψ/Ψ with y
  s = s.replace(/[χΧ]/g, 'x').replace(/[ψΨ]/g, 'y');

  // If equation has 't' on RHS and no 'x' (e.g. x = 2t + 1 or u = a*t), map LHS variable to y and t to x
  if (!s.includes('y') && /\bt\b/.test(s) && s.includes('=')) {
    const [lhs, rhs] = s.split('=');
    if (lhs && rhs && /\bt\b/.test(rhs)) {
      s = `y = ${rhs.replace(/\bt\b/g, 'x')}`;
    }
  }

  // Handle uppercase X, Y as x, y
  s = s.replace(/X/g, 'x').replace(/Y/g, 'y');

  // Replace comma decimals (e.g. 1,5 -> 1.5)
  s = s.replace(/(\d),(\d)/g, '$1.$2');

  // If no '=' sign is present, treat the expression as `y = <expr>`
  if (!s.includes('=')) {
    s = `y = ${s}`;
  } else {
    // If multiple '=' exist (e.g. f(x) = y = 2x + 1), keep last two parts
    const eqParts = s.split('=').map((p) => p.trim()).filter(Boolean);
    if (eqParts.length >= 2) {
      s = `${eqParts[eqParts.length - 2]} = ${eqParts[eqParts.length - 1]}`;
    }
  }

  // Smart Physical / Non-(x,y) Variable Mapping:
  // If an equation uses Physics symbols like `K = 1/2 m u^2`, `U = 1/2 D x^2`, `P = I^2 R`, `F = k/r^2`,
  // automatically map the LHS dependent variable to `y` and the primary RHS independent variable to `x`!
  if (s.includes('=')) {
    const eqPos = s.indexOf('=');
    let lhsPart = s.slice(0, eqPos).trim();
    let rhsPart = s.slice(eqPos + 1).trim();

    const hasY = /\by\b/.test(s);
    const hasX = /\bx\b/.test(s);

    // 1. If there is no `y` in the equation and the LHS is a single variable/symbol (e.g. K, U, E, F, ΣF, P, V, a, u, v, s), map LHS -> `y`
    if (!hasY && /^(?:Σ?[a-zA-Zα-ωΑ-Ω](?:_[a-zA-Z0-9]+)?)$/.test(lhsPart) && lhsPart !== 'x') {
      lhsPart = 'y';
    }

    // 2. If there is still no `x` on the RHS (e.g. `K = 1/2 m u^2` where RHS has `m` and `u`), map the primary RHS variable -> `x`
    if (!hasX) {
      const strippedRhs = rhsPart.replace(/\b(SIN|COS|TAN|SQRT|ABS|EXP|LN|LOG)\b/g, '');
      // Prefer a variable raised to a power (like `u^(2)` or `v^2` or `r^2` or `t^2`)
      const powVarMatch = strippedRhs.match(/([a-zA-Zα-ωΑ-Ω])\s*\^/);
      if (powVarMatch && powVarMatch[1] && powVarMatch[1] !== 'y' && powVarMatch[1] !== 'e') {
        const targetVar = powVarMatch[1];
        rhsPart = rhsPart.replace(new RegExp(targetVar, 'g'), 'x');
      } else {
        // Otherwise prefer common physics independent variables (u, v, υ, t, r, s, I, T, q, z)
        const prefMatch = strippedRhs.match(/[uvυtrsITqz]/);
        if (prefMatch && prefMatch[0]) {
          rhsPart = rhsPart.replace(new RegExp(prefMatch[0], 'g'), 'x');
        }
      }
    }

    s = `${lhsPart} = ${rhsPart}`;
  }

  return s.trim();
}

type MathExprToken =
  | { type: 'num'; value: number }
  | { type: 'var'; name: 'x' | 'y' }
  | { type: 'func'; name: 'SIN' | 'COS' | 'TAN' | 'LN' | 'LOG' | 'EXP' | 'SQRT' | 'ABS' }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'paren'; value: '(' | ')' };

/**
 * Compiles an algebraic expression string (after `normalizeMathEquationForPlot`)
 * into a fast numerical evaluator `(x: number, y: number) => number`.
 * Automatically substitutes positive constants for symbolic parameters (`a, b, c, α, β, γ, k, m, p, R, r...`)
 * and inserts implicit multiplication (`2x` -> `2*x`, `ax` -> `a*x`, `(x+1)(x-1)` -> `(x+1)*(x-1)`).
 */
function compileMathExprEvaluator(
  exprStr: string,
  paramOverrides?: Record<string, number>
): (x: number, y: number) => number {
  const defaultParams: Record<string, number> = {
    a: 1.35,
    α: 1.35,
    A: 1.35,
    b: 1.5,
    β: 1.5,
    B: 1.5,
    c: 0.8,
    γ: 0.8,
    C: 0.8,
    d: 1.0,
    δ: 1.0,
    k: 1.2,
    κ: 1.2,
    l: 1.0,
    λ: 1.0,
    m: 1.2,
    μ: 1.2,
    n: 1.0,
    ν: 1.0,
    p: 1.2,
    q: 1.0,
    r: 1.5,
    ρ: 1.5,
    R: 1.5,
    u: 1.2,
    v: 1.2,
    w: 1.0,
    ω: 1.0,
    e: Math.E,
    ...(paramOverrides || {}),
  };

  const rawTokens: MathExprToken[] = [];
  const fnNames = ['SIN', 'COS', 'TAN', 'SQRT', 'ABS', 'EXP', 'LOG', 'LN'] as const;
  let i = 0;
  while (i < exprStr.length) {
    const ch = exprStr[i];
    if (/\s/.test(ch) || ch === '{' || ch === '}') {
      i++;
      continue;
    }
    // Check function names first
    let matchedFn: (typeof fnNames)[number] | null = null;
    for (const fn of fnNames) {
      if (exprStr.startsWith(fn, i)) {
        matchedFn = fn;
        break;
      }
    }
    if (matchedFn) {
      rawTokens.push({ type: 'func', name: matchedFn });
      i += matchedFn.length;
      continue;
    }

    // Number literal
    if (/\d/.test(ch) || (ch === '.' && i + 1 < exprStr.length && /\d/.test(exprStr[i + 1]))) {
      let j = i;
      while (j < exprStr.length && /[\d.]/.test(exprStr[j])) j++;
      const numVal = parseFloat(exprStr.slice(i, j));
      rawTokens.push({ type: 'num', value: Number.isFinite(numVal) ? numVal : 1 });
      i = j;
      continue;
    }

    // Operators
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      rawTokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    // Parentheses / brackets
    if (ch === '(' || ch === '[') {
      rawTokens.push({ type: 'paren', value: '(' });
      i++;
      continue;
    }
    if (ch === ')' || ch === ']') {
      rawTokens.push({ type: 'paren', value: ')' });
      i++;
      continue;
    }

    // Variable x or y
    if (ch === 'x' || ch === 'y') {
      rawTokens.push({ type: 'var', name: ch });
      i++;
      continue;
    }

    // Any symbolic parameter letter (Latin or Greek: a, b, c, α, β, γ, R, r, k, m, etc.) -> positive constant!
    if (/[a-zA-Zα-ωΑ-Ω]/.test(ch)) {
      const val = defaultParams[ch] ?? 1.2;
      rawTokens.push({ type: 'num', value: val });
      i++;
      continue;
    }

    i++;
  }

  // Insert implicit '*' tokens where needed:
  // Left is ('num' | 'var' | ')') and Right is ('num' | 'var' | 'func' | '(')
  const tokens: MathExprToken[] = [];
  for (let k = 0; k < rawTokens.length; k++) {
    const cur = rawTokens[k];
    if (tokens.length > 0) {
      const prev = tokens[tokens.length - 1];
      const leftCanMul =
        prev.type === 'num' ||
        prev.type === 'var' ||
        (prev.type === 'paren' && prev.value === ')');
      const rightCanMul =
        cur.type === 'num' ||
        cur.type === 'var' ||
        cur.type === 'func' ||
        (cur.type === 'paren' && cur.value === '(');
      if (leftCanMul && rightCanMul) {
        tokens.push({ type: 'op', value: '*' });
      }
    }
    tokens.push(cur);
  }

  // Recursive descent AST compiler so `-x^2` is evaluated as `-(x^2)` (power binds tighter than unary minus!)
  type EvalNode = (x: number, y: number) => number;
  let pos = 0;

  const parseExpr = (): EvalNode => {
    let left = parseTerm();
    while (pos < tokens.length) {
      const tok = tokens[pos];
      if (tok.type === 'op' && (tok.value === '+' || tok.value === '-')) {
        pos++;
        const op = tok.value;
        const right = parseTerm();
        const prevLeft = left;
        left = op === '+' ? (x, y) => prevLeft(x, y) + right(x, y) : (x, y) => prevLeft(x, y) - right(x, y);
      } else {
        break;
      }
    }
    return left;
  };

  const parseTerm = (): EvalNode => {
    let left = parseUnary();
    while (pos < tokens.length) {
      const tok = tokens[pos];
      if (tok.type === 'op' && (tok.value === '*' || tok.value === '/')) {
        pos++;
        const op = tok.value;
        const right = parseUnary();
        const prevLeft = left;
        left =
          op === '*'
            ? (x, y) => prevLeft(x, y) * right(x, y)
            : (x, y) => {
                const den = right(x, y);
                return Math.abs(den) < 1e-9 ? NaN : prevLeft(x, y) / den;
              };
      } else {
        break;
      }
    }
    return left;
  };

  // Unary +/- is LOWER precedence than Power (`^`), so `-x^2` = `-(x^2)`!
  const parseUnary = (): EvalNode => {
    if (pos < tokens.length) {
      const tok = tokens[pos];
      if (tok.type === 'op' && (tok.value === '+' || tok.value === '-')) {
        pos++;
        const operand = parseUnary();
        return tok.value === '-' ? (x, y) => -operand(x, y) : operand;
      }
    }
    return parsePower();
  };

  const parsePower = (): EvalNode => {
    const base = parsePrimary();
    if (pos < tokens.length) {
      const tok = tokens[pos];
      if (tok.type === 'op' && tok.value === '^') {
        pos++;
        const exp = parseUnary();
        return (x, y) => {
          const bVal = base(x, y);
          const eVal = exp(x, y);
          if (!Number.isFinite(bVal) || !Number.isFinite(eVal)) return NaN;
          // Handle integer powers (including odd powers of negative numbers like (-2)^3 = -8)
          const roundedExp = Math.round(eVal);
          if (Math.abs(eVal - roundedExp) < 1e-7) {
            return Math.pow(bVal, roundedExp);
          }
          return bVal < 0 ? NaN : Math.pow(bVal, eVal);
        };
      }
    }
    return base;
  };

  const parsePrimary = (): EvalNode => {
    if (pos >= tokens.length) return () => 0;
    const tok = tokens[pos];
    if (tok.type === 'num') {
      pos++;
      const v = tok.value;
      return () => v;
    }
    if (tok.type === 'var') {
      pos++;
      return tok.name === 'x' ? (x) => x : (_x, y) => y;
    }
    if (tok.type === 'func') {
      pos++;
      const fnName = tok.name;
      let argNode: EvalNode;
      const openTok = tokens[pos];
      if (openTok && openTok.type === 'paren' && openTok.value === '(') {
        pos++;
        argNode = parseExpr();
        const closeTok = tokens[pos];
        if (closeTok && closeTok.type === 'paren' && closeTok.value === ')') {
          pos++;
        }
      } else {
        argNode = parseTerm();
      }
      return (x, y) => {
        const val = argNode(x, y);
        if (!Number.isFinite(val)) return NaN;
        switch (fnName) {
          case 'SIN':
            return Math.sin(val);
          case 'COS':
            return Math.cos(val);
          case 'TAN': {
            const c = Math.cos(val);
            return Math.abs(c) < 1e-3 ? NaN : Math.tan(val);
          }
          case 'SQRT':
            return val < 0 ? NaN : Math.sqrt(val);
          case 'ABS':
            return Math.abs(val);
          case 'EXP':
            return Math.exp(val);
          case 'LN':
            return val <= 0 ? NaN : Math.log(val);
          case 'LOG':
            return val <= 0 ? NaN : Math.log10(val);
        }
      };
    }
    if (tok.type === 'paren' && tok.value === '(') {
      pos++;
      const inner = parseExpr();
      const closeTok = tokens[pos];
      if (closeTok && closeTok.type === 'paren' && closeTok.value === ')') {
        pos++;
      }
      return inner;
    }
    pos++;
    return () => 0;
  };

  const root = parseExpr();
  return root;
}

/**
 * Renders clean textbook vector strokes for physics/math axis labels & extrema annotations
 * (e.g. `K`, `U`, `E`, `F`, `ΣF`, `x`, `y`, `u`, `a`, `t`, `-u_max`, `+u_max`, `K_max`, `U_max`, `-A`, `+A`, `+F_max`, `-F_max`, `+4`, `-4`)
 * so that all labels are native `StrokeObject`s inside the diagram group that move and scale seamlessly!
 */
function createVectorMathLabelStrokes(
  label: string,
  anchorX: number,
  anchorY: number,
  align: 'left' | 'center' | 'right',
  fontH: number,
  color: string,
  layerId: string,
  groupId: string,
  idPrefix: string
): StrokeObject[] {
  const glyphPaths = (ch: string): [number, number][][] => {
    switch (ch) {
      case '+':
        return [
          [
            [0.1, 0.52],
            [0.9, 0.52],
          ],
          [
            [0.5, 0.18],
            [0.5, 0.86],
          ],
        ];
      case '-':
        return [
          [
            [0.12, 0.52],
            [0.88, 0.52],
          ],
        ];
      case 'x':
        return [
          [
            [0.12, 0.28],
            [0.88, 0.94],
          ],
          [
            [0.88, 0.28],
            [0.12, 0.94],
          ],
        ];
      case 'y':
        return [
          [
            [0.12, 0.28],
            [0.48, 0.72],
          ],
          [
            [0.88, 0.28],
            [0.2, 1.22],
          ],
        ];
      case 'u':
      case 'υ':
      case 'v':
        return [
          [
            [0.14, 0.3],
            [0.14, 0.72],
            [0.26, 0.9],
            [0.54, 0.9],
            [0.76, 0.72],
          ],
          [
            [0.76, 0.3],
            [0.76, 0.92],
          ],
        ];
      case 'a':
      case 'α':
        return [
          [
            [0.76, 0.42],
            [0.58, 0.32],
            [0.3, 0.32],
            [0.14, 0.48],
            [0.14, 0.76],
            [0.3, 0.92],
            [0.58, 0.92],
            [0.76, 0.78],
          ],
          [
            [0.76, 0.32],
            [0.76, 0.92],
          ],
        ];
      case 't':
        return [
          [
            [0.45, 0.08],
            [0.45, 0.84],
            [0.62, 0.94],
            [0.82, 0.9],
          ],
          [
            [0.16, 0.36],
            [0.8, 0.36],
          ],
        ];
      case 'K':
      case 'k':
        return [
          [
            [0.16, 0.08],
            [0.16, 0.94],
          ],
          [
            [0.86, 0.1],
            [0.18, 0.54],
          ],
          [
            [0.34, 0.44],
            [0.88, 0.94],
          ],
        ];
      case 'U':
        return [
          [
            [0.14, 0.08],
            [0.14, 0.68],
            [0.3, 0.92],
            [0.7, 0.92],
            [0.86, 0.68],
            [0.86, 0.08],
          ],
        ];
      case 'E':
        return [
          [
            [0.84, 0.08],
            [0.16, 0.08],
            [0.16, 0.92],
            [0.86, 0.92],
          ],
          [
            [0.16, 0.5],
            [0.74, 0.5],
          ],
        ];
      case 'F':
        return [
          [
            [0.18, 0.08],
            [0.18, 0.94],
          ],
          [
            [0.18, 0.08],
            [0.88, 0.08],
          ],
          [
            [0.18, 0.48],
            [0.74, 0.48],
          ],
        ];
      case 'Σ':
        return [
          [
            [0.88, 0.08],
            [0.14, 0.08],
            [0.58, 0.5],
            [0.14, 0.92],
            [0.88, 0.92],
          ],
        ];
      case 'A':
        return [
          [
            [0.1, 0.94],
            [0.5, 0.08],
            [0.9, 0.94],
          ],
          [
            [0.25, 0.62],
            [0.75, 0.62],
          ],
        ];
      case 'm':
        return [
          [
            [0.08, 0.32],
            [0.08, 0.92],
          ],
          [
            [0.08, 0.46],
            [0.22, 0.32],
            [0.38, 0.32],
            [0.5, 0.46],
            [0.5, 0.92],
          ],
          [
            [0.5, 0.46],
            [0.64, 0.32],
            [0.8, 0.32],
            [0.92, 0.46],
            [0.92, 0.92],
          ],
        ];
      case '0':
        return [
          [
            [0.5, 0.1],
            [0.2, 0.25],
            [0.15, 0.52],
            [0.2, 0.8],
            [0.5, 0.94],
            [0.8, 0.8],
            [0.85, 0.52],
            [0.8, 0.25],
            [0.5, 0.1],
          ],
        ];
      case '1':
        return [
          [
            [0.24, 0.28],
            [0.52, 0.1],
            [0.52, 0.92],
          ],
          [
            [0.26, 0.92],
            [0.78, 0.92],
          ],
        ];
      case '2':
        return [
          [
            [0.18, 0.28],
            [0.38, 0.1],
            [0.72, 0.12],
            [0.84, 0.32],
            [0.16, 0.92],
            [0.86, 0.92],
          ],
        ];
      case '3':
        return [
          [
            [0.18, 0.2],
            [0.52, 0.1],
            [0.82, 0.26],
            [0.68, 0.48],
            [0.42, 0.5],
            [0.74, 0.56],
            [0.84, 0.78],
            [0.52, 0.94],
            [0.18, 0.84],
          ],
        ];
      case '4':
        return [
          [
            [0.68, 0.94],
            [0.68, 0.1],
            [0.14, 0.66],
            [0.88, 0.66],
          ],
        ];
      case '5':
        return [
          [
            [0.82, 0.1],
            [0.22, 0.1],
            [0.18, 0.48],
            [0.62, 0.46],
            [0.84, 0.64],
            [0.76, 0.88],
            [0.44, 0.94],
            [0.16, 0.84],
          ],
        ];
      case '6':
        return [
          [
            [0.76, 0.14],
            [0.42, 0.12],
            [0.18, 0.42],
            [0.18, 0.78],
            [0.48, 0.94],
            [0.8, 0.78],
            [0.76, 0.52],
            [0.46, 0.46],
            [0.18, 0.58],
          ],
        ];
      case '7':
        return [
          [
            [0.16, 0.12],
            [0.86, 0.12],
            [0.36, 0.94],
          ],
        ];
      case '8':
        return [
          [
            [0.5, 0.5],
            [0.22, 0.34],
            [0.26, 0.14],
            [0.5, 0.1],
            [0.74, 0.14],
            [0.78, 0.34],
            [0.5, 0.5],
            [0.18, 0.68],
            [0.22, 0.88],
            [0.5, 0.94],
            [0.78, 0.88],
            [0.82, 0.68],
            [0.5, 0.5],
          ],
        ];
      case '9':
        return [
          [
            [0.82, 0.46],
            [0.52, 0.56],
            [0.2, 0.44],
            [0.22, 0.18],
            [0.52, 0.1],
            [0.82, 0.22],
            [0.82, 0.66],
            [0.56, 0.92],
            [0.24, 0.9],
          ],
        ];
      case '.':
        return [
          [
            [0.45, 0.86],
            [0.55, 0.94],
          ],
        ];
      case 'R':
      case 'r':
        return [
          [
            [0.18, 0.94],
            [0.18, 0.1],
            [0.62, 0.1],
            [0.82, 0.24],
            [0.82, 0.42],
            [0.62, 0.52],
            [0.18, 0.52],
          ],
          [
            [0.52, 0.52],
            [0.86, 0.94],
          ],
        ];
      case 'b':
      case 'β':
        return [
          [
            [0.18, 0.08],
            [0.18, 0.92],
            [0.58, 0.92],
            [0.82, 0.78],
            [0.82, 0.54],
            [0.58, 0.42],
            [0.18, 0.42],
          ],
        ];
      default:
        return [];
    }
  };

  // Split into main part and optional subscript part after '_' (e.g. `-u_max` -> main `-u`, sub `max`)
  const [mainPart, subPart] = label.split('_');
  const mainCharW = fontH * 0.66;
  const mainGap = fontH * 0.14;
  const subH = fontH * 0.62;
  const subCharW = subH * 0.68;
  const subGap = subH * 0.12;

  const mainTotalW =
    mainPart.length > 0 ? mainPart.length * mainCharW + (mainPart.length - 1) * mainGap : 0;
  const subTotalW =
    subPart && subPart.length > 0
      ? subPart.length * subCharW + (subPart.length - 1) * subGap + fontH * 0.08
      : 0;
  const totalW = mainTotalW + subTotalW;

  let curX =
    align === 'center'
      ? anchorX - totalW / 2
      : align === 'right'
      ? anchorX - totalW
      : anchorX;
  const topY = anchorY - fontH / 2;

  const out: StrokeObject[] = [];
  let sCounter = 0;

  for (const ch of mainPart) {
    const paths = glyphPaths(ch);
    for (const poly of paths) {
      out.push({
        id: `${idPrefix}-m-${sCounter++}`,
        tool: 'pen',
        color,
        width: 2.1,
        opacity: 1,
        points: poly.map(([u, v]) => ({
          x: curX + u * mainCharW,
          y: topY + v * fontH,
          pressure: 0.7,
        })),
        layerId,
        groupId,
        isShape: false,
      });
    }
    curX += mainCharW + mainGap;
  }

  if (subPart) {
    curX += fontH * 0.05;
    const subTopY = topY + fontH * 0.46;
    for (const ch of subPart) {
      const paths = glyphPaths(ch);
      for (const poly of paths) {
        out.push({
          id: `${idPrefix}-s-${sCounter++}`,
          tool: 'pen',
          color,
          width: 1.85,
          opacity: 1,
          points: poly.map(([u, v]) => ({
            x: curX + u * subCharW,
            y: subTopY + v * subH,
            pressure: 0.7,
          })),
          layerId,
          groupId,
          isShape: false,
        });
      }
      curX += subCharW + subGap;
    }
  }

  return out;
}

/**
 * Specialized Greek Physics Oscillation Diagram Builder:
 * Recognizes and plots textbook oscillation diagrams (qualitative or quantitative) with blue dashed
 * amplitude/extrema projection lines and textbook axis/extrema labels:
 * 1. Kinetic Energy vs Velocity: `K = 1/2 m u^2`, `K - u` -> Parabola with `-u_max`, `+u_max`, `K_max`
 * 2. Potential Energy vs Displacement: `U = 1/2 D x^2`, `U = 1/2 k x^2`, `U - x` -> Parabola with `-A`, `+A`, `U_max`
 * 3. Kinetic Energy vs Displacement: `K = E - 1/2 D x^2`, `K = 1/2 D (A^2 - x^2)`, `K - x` -> Inverted Parabola with `-A`, `+A`, `K_max`
 * 4. Restoring Force vs Displacement: `ΣF = -D x`, `F = -D x`, `F = -k x`, `ΣF - x`, `F - x` -> Negative slope line with `-A`, `+A`, `+F_max`, `-F_max`
 * 5. Acceleration vs Displacement: `a = -ω^2 x`, `a - x` -> Negative slope line with `-A`, `+A`, `+a_max`, `-a_max`
 * 6. Time diagrams: `x = A ημ(ωt)`, `u = u_max συν(ωt)`, `a = -a_max ημ(ωt)`, `x - t`, `u - t`, `a - t`
 */
function tryBuildOscillationDiagramStrokes(
  rawInput: string,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  curveColor: string,
  axisColor: string,
  layerId: string
): { strokes: StrokeObject[]; groupId: string; kindLabel: string } | null {
  if (!rawInput || !rawInput.trim()) return null;

  const lines = splitAndCleanMathLatexLines(rawInput);
  let raw = lines.length > 0 ? lines[lines.length - 1] : rawInput.trim();
  const arrowParts = raw.split(/\\Rightarrow|\\Leftrightarrow|\\implies|⇒|⇔|->/);
  if (arrowParts.length > 1) {
    const lastPart = arrowParts[arrowParts.length - 1].trim();
    if (lastPart) raw = lastPart;
  }

  let expanded = expandLatexConstructs(raw)
    .replace(/\\Sigma\b/g, 'Σ')
    .replace(/\\Delta\b/g, 'D')
    .replace(/\\omega\b/g, 'ω')
    .replace(/\\alpha\b/g, 'α')
    .replace(/\\mu\b/g, 'm')
    .replace(/\\(?:upsilon|nu)\b/g, 'u')
    .replace(/\\kappa\b/g, 'k')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\(?:cdot|times)\b/g, '*')
    .replace(/[·×∙]/g, '*')
    .replace(/[−–—]/g, '-')
    .replace(/²/g, '^2')
    .replace(/\^\(\s*2\s*\)/g, '^2')
    .replace(/Κ/g, 'K')
    .replace(/Ε/g, 'E')
    .replace(/Α/g, 'A')
    .replace(/Υ/g, 'U')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\s+/g, ' ')
    .trim();

  // Unwrap redundant parentheses around simple tokens/fractions like `((1)/(2))` -> `1/2`
  for (let pass = 0; pass < 4; pass++) {
    expanded = expanded
      .replace(/\(\s*([0-9.]+|[a-zA-Zα-ωΑ-Ω]+(?:\^2)?)\s*\)/g, '$1')
      .replace(/\(\s*(1\/2|0\.5)\s*\)/g, '$1');
  }

  const compact = expanded.replace(/\s+/g, '');
  const groupId = `math-graph-grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const nowId = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  const halfW = Math.max(85, width / 2);
  const halfH = Math.max(85, height / 2);
  const blueGuide = '#2563eb';
  const strokes: StrokeObject[] = [];

  const addDashedGuide = (x1: number, y1: number, x2: number, y2: number, idx: number) => {
    strokes.push({
      id: `st-${nowId}-gd-${idx}`,
      tool: 'pen',
      color: blueGuide,
      width: 2.0,
      opacity: 1,
      lineStyle: 'dashed',
      points: [
        { x: x1, y: y1, pressure: 0.7 },
        { x: x2, y: y2, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-guide-top',
    });
  };

  // Helper for Non-Negative Energy Parabola Diagrams (K-u, U-x, K-x, E-x) where vertical axis starts near the bottom!
  const buildEnergyParabolaDiagram = (opts: {
    yAxisLabel: string;
    xAxisLabel: string;
    leftXLabel: string;
    rightXLabel: string;
    topYLabel: string;
    inverted?: boolean;
    alsoPlotComplement?: boolean;
    kindLabel: string;
  }) => {
    const axisY = centerY + halfH * 0.48;
    const axisTopY = centerY - halfH * 0.88;
    const axisBotY = axisY + 24;
    const xMaxPx = halfW * 0.68;
    const yPeakPx = axisY - (axisY - axisTopY) * 0.74;

    // 1. Horizontal axis (u or x)
    strokes.push({
      id: `st-${nowId}-axx`,
      tool: 'pen',
      color: axisColor,
      width: 2.5,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x: centerX - halfW, y: axisY, pressure: 0.7 },
        { x: centerX + halfW, y: axisY, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-x',
    });

    // 2. Vertical axis (K or U or E)
    strokes.push({
      id: `st-${nowId}-axy`,
      tool: 'pen',
      color: axisColor,
      width: 2.5,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x: centerX, y: axisBotY, pressure: 0.7 },
        { x: centerX, y: axisTopY, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-y',
    });

    // 3. Axis tip labels (e.g. K at top-right of vertical arrow, u/x at right of horizontal arrow)
    strokes.push(
      ...createVectorMathLabelStrokes(
        opts.yAxisLabel,
        centerX + 9,
        axisTopY + 8,
        'left',
        17.5,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-ly`
      )
    );
    strokes.push(
      ...createVectorMathLabelStrokes(
        opts.xAxisLabel,
        centerX + halfW + 9,
        axisY + 1,
        'left',
        17.5,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-lx`
      )
    );

    // 4. Blue dashed projection box
    if (!opts.inverted) {
      // Left & right vertical dashed lines from (-xMax, 0) and (+xMax, 0) up to yPeakPx + top horizontal dashed line
      addDashedGuide(centerX - xMaxPx, axisY, centerX - xMaxPx, yPeakPx, 1);
      addDashedGuide(centerX + xMaxPx, axisY, centerX + xMaxPx, yPeakPx, 2);
      addDashedGuide(centerX - xMaxPx, yPeakPx, centerX + xMaxPx, yPeakPx, 3);
    } else {
      // Top horizontal dashed guide at K_max
      addDashedGuide(centerX - xMaxPx, yPeakPx, centerX + xMaxPx, yPeakPx, 1);
      addDashedGuide(centerX - xMaxPx, axisY, centerX - xMaxPx, yPeakPx, 2);
      addDashedGuide(centerX + xMaxPx, axisY, centerX + xMaxPx, yPeakPx, 3);
    }

    // 5. Parabola curve (upward for K-u and U-x; downward for K-x)
    const steps = 72;
    const curvePts: { x: number; y: number; pressure: number }[] = [];
    const ampH = axisY - yPeakPx;
    for (let i = 0; i <= steps; i++) {
      const uNorm = -1 + (2 * i) / steps;
      const px = centerX + uNorm * xMaxPx;
      const py = opts.inverted
        ? axisY - (1 - uNorm * uNorm) * ampH
        : axisY - uNorm * uNorm * ampH;
      curvePts.push({ x: px, y: py, pressure: 0.7 });
    }
    strokes.push({
      id: `st-${nowId}-crv-main`,
      tool: 'pen',
      color: curveColor,
      width: 2.8,
      opacity: 1,
      points: curvePts,
      layerId,
      groupId,
      isShape: false,
    });

    if (opts.alsoPlotComplement) {
      const compPts: { x: number; y: number; pressure: number }[] = [];
      for (let i = 0; i <= steps; i++) {
        const uNorm = -1 + (2 * i) / steps;
        const px = centerX + uNorm * xMaxPx;
        const py = axisY - (1 - uNorm * uNorm) * ampH;
        compPts.push({ x: px, y: py, pressure: 0.7 });
      }
      strokes.push({
        id: `st-${nowId}-crv-comp`,
        tool: 'pen',
        color: '#16a34a',
        width: 2.6,
        opacity: 1,
        points: compPts,
        layerId,
        groupId,
        isShape: false,
      });
    }

    // 6. Extrema labels: `-u_max` / `-A` on left, `+u_max` / `+A` on right, `K_max` / `U_max` below top dashed line
    strokes.push(
      ...createVectorMathLabelStrokes(
        opts.leftXLabel,
        centerX - xMaxPx,
        axisY + 16,
        'center',
        15.5,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-ll`
      )
    );
    strokes.push(
      ...createVectorMathLabelStrokes(
        opts.rightXLabel,
        centerX + xMaxPx,
        axisY + 16,
        'center',
        15.5,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-lr`
      )
    );
    strokes.push(
      ...createVectorMathLabelStrokes(
        opts.topYLabel,
        centerX + 8,
        opts.inverted ? yPeakPx - 13 : yPeakPx + 15,
        'left',
        15.5,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-lt`
      )
    );

    return { strokes, groupId, kindLabel: opts.kindLabel };
  };

  // CASE 1: Kinetic Energy vs Velocity `K = 1/2 m u^2` or `K - u`
  const isKineticVelocity =
    /^(?:[KΚκ]|E_?[kKκ])(?:\([uvυ]\))?=(?:(?:\(?1\/2\)?|0\.5)\*?[mμM]?\*?[uvυ]\^2|[mμM]?\*?[uvυ]\^2\/2|[0-9.]*\*?[mμM]?\*?[uvυ]\^2)$/i.test(
      compact
    ) || /^[KΚκ]-[uvυ]$/i.test(compact);

  if (isKineticVelocity) {
    return buildEnergyParabolaDiagram({
      yAxisLabel: 'K',
      xAxisLabel: 'u',
      leftXLabel: '-u_max',
      rightXLabel: '+u_max',
      topYLabel: 'K_max',
      inverted: false,
      kindLabel: 'Κινητική Ενέργεια K(u)',
    });
  }

  // CASE 2: Potential Energy vs Displacement `U = 1/2 D x^2` or `U = 1/2 k x^2` or `U - x`
  const isPotentialDisplacement =
    /^(?:U|E_?[pU])(?:\([xχ]\))?=(?:(?:\(?1\/2\)?|0\.5)\*?[DkκΔδ]?\*?[xχ]\^2|[DkκΔδ]?\*?[xχ]\^2\/2|[0-9.]*\*?[DkκΔδ]?\*?[xχ]\^2)$/i.test(
      compact
    ) || /^U-[xχ]$/i.test(compact);

  if (isPotentialDisplacement) {
    return buildEnergyParabolaDiagram({
      yAxisLabel: 'U',
      xAxisLabel: 'x',
      leftXLabel: '-A',
      rightXLabel: '+A',
      topYLabel: 'U_max',
      inverted: false,
      kindLabel: 'Δυναμική Ενέργεια U(x)',
    });
  }

  // CASE 3: Kinetic Energy vs Displacement `K = E - 1/2 D x^2` or `K = 1/2 D (A^2 - x^2)` or `K - x`
  const isKineticDisplacement =
    /^K\s*=\s*(?:(?:E|K_?max)\s*-\s*(?:\(?1\/2\)?|0\.5)?\s*\*?\s*[Dkκ]?\s*\*?\s*[xχ]\^2|(?:\(?1\/2\)?|0\.5)?\s*\*?\s*[Dkκ]?\s*\*?\s*\(\s*A\^2\s*-\s*[xχ]\^2\s*\))$/i.test(
      compact
    ) || /^K\s*-\s*[xχ]$/i.test(compact);

  if (isKineticDisplacement) {
    return buildEnergyParabolaDiagram({
      yAxisLabel: 'K',
      xAxisLabel: 'x',
      leftXLabel: '-A',
      rightXLabel: '+A',
      topYLabel: 'K_max',
      inverted: true,
      kindLabel: 'Κινητική Ενέργεια K(x)',
    });
  }

  // CASE 4: Combined Energy `E = K + U` or `E = 1/2 D A^2` or `E - x`
  const isTotalEnergy =
    /^E\s*=\s*(?:K\s*\+\s*U|U\s*\+\s*K|(?:\(?1\/2\)?|0\.5)\s*\*?\s*[Dkκ]\s*\*?\s*A\^2)$/i.test(
      compact
    ) || /^E\s*-\s*[xχ]$/i.test(compact);

  if (isTotalEnergy) {
    return buildEnergyParabolaDiagram({
      yAxisLabel: 'E',
      xAxisLabel: 'x',
      leftXLabel: '-A',
      rightXLabel: '+A',
      topYLabel: 'E',
      inverted: false,
      alsoPlotComplement: /K\s*\+\s*U|U\s*\+\s*K/i.test(compact),
      kindLabel: 'Ενέργεια Ταλάντωσης E(x)',
    });
  }

  // CASE 5: Restoring Force `ΣF = -D x` / `F = -k x` / `ΣF - x` OR Acceleration `a = -ω^2 x` / `a - x`
  const isForceDisplacement =
    /^(?:ΣF|F)\s*=\s*-\s*(?:[Dkκ]|[0-9.]+)\s*\*?\s*[xχ]$/i.test(compact) ||
    /^(?:ΣF|F)\s*-\s*[xχ]$/i.test(compact);
  const isAccelDisplacement =
    /^[aα]\s*=\s*-\s*(?:ω\^2|[0-9.]+)\s*\*?\s*[xχ]$/i.test(compact) ||
    /^[aα]\s*-\s*[xχ]$/i.test(compact);

  if (isForceDisplacement || isAccelDisplacement) {
    const isSigmaF = /ΣF/i.test(compact);
    const yAxisTitle = isForceDisplacement ? (isSigmaF ? 'ΣF' : 'F') : 'a';
    const topValLabel = isForceDisplacement ? '+F_max' : '+a_max';
    const botValLabel = isForceDisplacement ? '-F_max' : '-a_max';
    const xMaxPx = halfW * 0.64;
    const yMaxPx = halfH * 0.64;

    // 1. Horizontal x-axis
    strokes.push({
      id: `st-${nowId}-axx`,
      tool: 'pen',
      color: axisColor,
      width: 2.5,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x: centerX - halfW, y: centerY, pressure: 0.7 },
        { x: centerX + halfW, y: centerY, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-x',
    });

    // 2. Vertical ΣF / F / a axis
    strokes.push({
      id: `st-${nowId}-axy`,
      tool: 'pen',
      color: axisColor,
      width: 2.5,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x: centerX, y: centerY + halfH, pressure: 0.7 },
        { x: centerX, y: centerY - halfH, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-y',
    });

    // 3. Axis tip labels
    strokes.push(
      ...createVectorMathLabelStrokes(
        yAxisTitle,
        centerX + 8,
        centerY - halfH + 8,
        'left',
        16,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-ly`
      )
    );
    strokes.push(
      ...createVectorMathLabelStrokes(
        'x',
        centerX + halfW + 8,
        centerY + 2,
        'left',
        16,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-lx`
      )
    );

    // 4. 4 Blue dashed projection lines from (-A, +F_max) and (+A, -F_max) to axes
    const pTL = { x: centerX - xMaxPx, y: centerY - yMaxPx };
    const pBR = { x: centerX + xMaxPx, y: centerY + yMaxPx };
    addDashedGuide(pTL.x, pTL.y, pTL.x, centerY, 1);
    addDashedGuide(pTL.x, pTL.y, centerX, pTL.y, 2);
    addDashedGuide(pBR.x, pBR.y, pBR.x, centerY, 3);
    addDashedGuide(pBR.x, pBR.y, centerX, pBR.y, 4);

    // 5. Red negative-slope straight line from (-A, +F_max) through (0,0) to (+A, -F_max)
    strokes.push({
      id: `st-${nowId}-crv-line`,
      tool: 'pen',
      color: curveColor,
      width: 3.0,
      opacity: 1,
      points: [
        { x: pTL.x, y: pTL.y, pressure: 0.7 },
        { x: pBR.x, y: pBR.y, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'line',
    });

    // 6. Labels: `-A` below -A, `+A` above +A, `+F_max` right of axis, `-F_max` left of axis
    strokes.push(
      ...createVectorMathLabelStrokes(
        '-A',
        centerX - xMaxPx,
        centerY + 15,
        'center',
        13.5,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-la1`
      )
    );
    strokes.push(
      ...createVectorMathLabelStrokes(
        '+A',
        centerX + xMaxPx,
        centerY - 14,
        'center',
        13.5,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-la2`
      )
    );
    strokes.push(
      ...createVectorMathLabelStrokes(
        topValLabel,
        centerX + 7,
        centerY - yMaxPx,
        'left',
        13.5,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-lf1`
      )
    );
    strokes.push(
      ...createVectorMathLabelStrokes(
        botValLabel,
        centerX - 7,
        centerY + yMaxPx,
        'right',
        13.5,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-lf2`
      )
    );

    return {
      strokes,
      groupId,
      kindLabel: isForceDisplacement ? `Διάγραμμα ${yAxisTitle}(x)` : 'Διάγραμμα a(x)',
    };
  }

  // CASE 6: Time Oscillation Diagrams `x(t)`, `u(t)`, `a(t)`, `ΣF(t)`
  const timeOscMatch = compact.match(
    /^(x|u|υ|v|a|α|ΣF|F)\s*(?:\(\s*t\s*\))?\s*=\s*(-?)\s*([0-9.]+|A|u_?max|v_?max|a_?max|F_?max|ω\*?A|ω\^2\*?A)?\s*\*?\s*(ημιτ|ημ|sin|συνημ|συν|cos)\s*\(?.*t/i
  );
  const shorthandTimeMatch = compact.match(/^(x|u|υ|v|a|α|ΣF|F)\s*-\s*t$/i);

  if (timeOscMatch || shorthandTimeMatch) {
    const rawVar = (timeOscMatch ? timeOscMatch[1] : shorthandTimeMatch![1]).trim();
    const yVar =
      /^(?:u|υ|v)$/i.test(rawVar)
        ? 'u'
        : /^(?:a|α)$/i.test(rawVar)
        ? 'a'
        : /^ΣF$/i.test(rawVar)
        ? 'ΣF'
        : /^F$/i.test(rawVar)
        ? 'F'
        : 'x';

    let waveKind: 'sin' | 'cos' | '-sin' | '-cos' =
      yVar === 'u' ? 'cos' : yVar === 'a' || yVar === 'ΣF' || yVar === 'F' ? '-sin' : 'sin';

    let numAmp = '';
    if (timeOscMatch) {
      const isNeg = timeOscMatch[2] === '-';
      const ampStr = timeOscMatch[3] || '';
      if (/^[0-9.]+$/.test(ampStr)) {
        numAmp = ampStr;
      }
      const trig = timeOscMatch[4].toLowerCase();
      const isCos = trig === 'συν' || trig === 'συνημ' || trig === 'cos';
      waveKind = isCos ? (isNeg ? '-cos' : 'cos') : isNeg ? '-sin' : 'sin';
    }

    const posLabel = numAmp
      ? `+${numAmp}`
      : yVar === 'x'
      ? '+A'
      : yVar === 'u'
      ? '+u_max'
      : yVar === 'a'
      ? '+a_max'
      : '+F_max';
    const negLabel = numAmp
      ? `-${numAmp}`
      : yVar === 'x'
      ? '-A'
      : yVar === 'u'
      ? '-u_max'
      : yVar === 'a'
      ? '-a_max'
      : '-F_max';

    const axisLeftX = centerX - halfW * 0.72;
    const axisRightX = centerX + halfW * 0.92;
    const ampPx = halfH * 0.62;

    // 1. Vertical axis on left
    strokes.push({
      id: `st-${nowId}-axy`,
      tool: 'pen',
      color: axisColor,
      width: 2.5,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x: axisLeftX, y: centerY + halfH * 0.9, pressure: 0.7 },
        { x: axisLeftX, y: centerY - halfH * 0.9, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-y',
    });

    // 2. Horizontal t-axis from axisLeftX to axisRightX
    strokes.push({
      id: `st-${nowId}-axx`,
      tool: 'pen',
      color: axisColor,
      width: 2.5,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x: axisLeftX, y: centerY, pressure: 0.7 },
        { x: axisRightX, y: centerY, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-x',
    });

    // 3. Upper & Lower Blue Dashed Envelope Lines
    addDashedGuide(axisLeftX, centerY - ampPx, axisRightX - 14, centerY - ampPx, 1);
    addDashedGuide(axisLeftX, centerY + ampPx, axisRightX - 14, centerY + ampPx, 2);

    // 4. Wave curve (1.5 periods)
    const waveW = axisRightX - axisLeftX - 18;
    const steps = 96;
    const wavePts: { x: number; y: number; pressure: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const theta = u * Math.PI * 3; // 1.5 periods
      const val =
        waveKind === 'sin'
          ? Math.sin(theta)
          : waveKind === 'cos'
          ? Math.cos(theta)
          : waveKind === '-sin'
          ? -Math.sin(theta)
          : -Math.cos(theta);
      wavePts.push({
        x: axisLeftX + u * waveW,
        y: centerY - val * ampPx,
        pressure: 0.7,
      });
    }
    strokes.push({
      id: `st-${nowId}-crv-wave`,
      tool: 'pen',
      color: curveColor,
      width: 2.8,
      opacity: 1,
      points: wavePts,
      layerId,
      groupId,
      isShape: false,
    });

    // 5. Labels: yVar at top, t at right, +Max and -Max to the left of vertical axis
    strokes.push(
      ...createVectorMathLabelStrokes(
        yVar,
        axisLeftX + 8,
        centerY - halfH * 0.9 + 6,
        'left',
        16,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-ly`
      )
    );
    strokes.push(
      ...createVectorMathLabelStrokes(
        't',
        axisRightX + 7,
        centerY + 2,
        'left',
        16,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-lx`
      )
    );
    strokes.push(
      ...createVectorMathLabelStrokes(
        posLabel,
        axisLeftX - 6,
        centerY - ampPx,
        'right',
        13,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-lp`
      )
    );
    strokes.push(
      ...createVectorMathLabelStrokes(
        negLabel,
        axisLeftX - 6,
        centerY + ampPx,
        'right',
        13,
        axisColor,
        layerId,
        groupId,
        `st-${nowId}-ln`
      )
    );

    return { strokes, groupId, kindLabel: `Διάγραμμα Ταλάντωσης ${yVar}(t)` };
  }

  return null;
}

/**
 * Generates editable vector `StrokeObject[]` (grouped under a single `math-graph-grp-...` ID)
 * representing a Cartesian $(x, y)$ coordinate diagram and plotted curve(s) for any equation:
 * - Physics Oscillation Diagrams (`K = 1/2 m u^2`, `U = 1/2 D x^2`, `ΣF = -D x`, `a = -ω^2 x`, `x = A ημ(ωt)`, etc.)
 * - Circle (`x^2 + y^2 = 1`, `(x - a)^2 + (y - b)^2 = R^2`)
 * - Ellipse (`(x^2)/9 + (y^2)/16 = 25`, `x^2/a^2 + y^2/b^2 = 1`)
 * - Hyperbola (`y = a/x`, `xy = c`, `x^2/a^2 - y^2/b^2 = 1`, `y^2/b^2 - x^2/a^2 = 1`)
 * - Parabola (`y = ax^2 + bx + c`, `y = x^2 - 4`, `y^2 = 2px`)
 * - Line (`y = ax + b`, `y = αχ + β`, `2x + 3y = 6`, `x = c`, `y = c`)
 * - Polynomials & Functions (`y = x^3 - 3x`, `y = x^4 - 2x^2`, `y = sin(x)`, `y = e^x`, `y = ln(x)`, `y = sqrt(x)`, `y = |x|`)
 * - General Implicit Curves (`F(x, y) = 0`)
 */
export function buildMathGraphStrokesFromEquation(
  rawEquation: string,
  centerX: number,
  centerY: number,
  width = 250,
  height = 250,
  curveColor = '#dc2626',
  axisColor = '#0f172a',
  layerId = 'layer-1'
): { strokes: StrokeObject[]; groupId: string; kindLabel: string } | null {
  // First check specialized Physics Oscillation Diagrams (K-u, U-x, K-x, E-x, ΣF-x, a-x, x-t, u-t, a-t)
  const oscDiag = tryBuildOscillationDiagramStrokes(
    rawEquation,
    centerX,
    centerY,
    width,
    height,
    curveColor,
    axisColor,
    layerId
  );
  if (oscDiag) return oscDiag;
  const normalized = normalizeMathEquationForPlot(rawEquation);
  if (!normalized || !normalized.includes('=')) return null;

  const eqIdx = normalized.indexOf('=');
  const lhsStr = normalized.slice(0, eqIdx).trim();
  const rhsStr = normalized.slice(eqIdx + 1).trim();
  if (!lhsStr || !rhsStr) return null;

  // Check if symbolic ellipse/hyperbola with a^2 and b^2 so we give distinct semi-axes a != b
  const hasBothAB =
    (/[aαA]/.test(normalized) && /[bβB]/.test(normalized)) ||
    (/[aαA]/.test(lhsStr) && /[bβB]/.test(rhsStr));
  const paramOverrides: Record<string, number> = hasBothAB
    ? { a: 1.5, α: 1.5, A: 1.5, b: 1.0, β: 1.0, B: 1.0, c: 0.4, γ: 0.4, C: 0.4 }
    : { a: 1.2, α: 1.2, A: 1.2, b: 1.4, β: 1.4, B: 1.4, c: 0.5, γ: 0.5, C: 0.5 };

  const evalLhs = compileMathExprEvaluator(lhsStr, paramOverrides);
  const evalRhs = compileMathExprEvaluator(rhsStr, paramOverrides);
  const evalF = (x: number, y: number): number => evalLhs(x, y) - evalRhs(x, y);

  const halfW = Math.max(70, width / 2);
  const halfH = Math.max(70, height / 2);
  const plotHalfW = halfW * 0.85;
  const plotHalfH = halfH * 0.85;
  const groupId = `math-graph-grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const nowId = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

  const strokes: StrokeObject[] = [];

  // 1. Horizontal X-axis with open arrow at right
  strokes.push({
    id: `st-${nowId}-axx`,
    tool: 'pen',
    color: axisColor,
    width: 2.5,
    opacity: 1,
    arrowEnd: true,
    points: [
      { x: centerX - halfW, y: centerY, pressure: 0.7 },
      { x: centerX + halfW, y: centerY, pressure: 0.7 },
    ],
    layerId,
    groupId,
    isShape: true,
    shapeType: 'wave-axis-x',
  });

  // 2. Vertical Y-axis with open arrow at top
  strokes.push({
    id: `st-${nowId}-axy`,
    tool: 'pen',
    color: axisColor,
    width: 2.5,
    opacity: 1,
    arrowEnd: true,
    points: [
      { x: centerX, y: centerY + halfH, pressure: 0.7 },
      { x: centerX, y: centerY - halfH, pressure: 0.7 },
    ],
    layerId,
    groupId,
    isShape: true,
    shapeType: 'wave-axis-y',
  });

  // 3. Vector label 'x' near right arrow tip (drawn as 2 strokes so it scales & moves with the diagram)
  const lx = centerX + halfW + 10;
  const ly = centerY - 14;
  strokes.push({
    id: `st-${nowId}-lblx1`,
    tool: 'pen',
    color: axisColor,
    width: 2.1,
    opacity: 1,
    points: [
      { x: lx - 5, y: ly - 5.5, pressure: 0.7 },
      { x: lx + 5, y: ly + 5.5, pressure: 0.7 },
    ],
    layerId,
    groupId,
    isShape: true,
    shapeType: 'wave-axis-x',
  });
  strokes.push({
    id: `st-${nowId}-lblx2`,
    tool: 'pen',
    color: axisColor,
    width: 2.1,
    opacity: 1,
    points: [
      { x: lx - 5, y: ly + 5.5, pressure: 0.7 },
      { x: lx + 5, y: ly - 5.5, pressure: 0.7 },
    ],
    layerId,
    groupId,
    isShape: true,
    shapeType: 'wave-axis-x',
  });

  // 4. Vector label 'y' near top arrow tip
  const yx = centerX - 18;
  const yy = centerY - halfH + 6;
  strokes.push({
    id: `st-${nowId}-lbly1`,
    tool: 'pen',
    color: axisColor,
    width: 2.1,
    opacity: 1,
    points: [
      { x: yx - 4.5, y: yy - 6, pressure: 0.7 },
      { x: yx + 0.5, y: yy + 1, pressure: 0.7 },
    ],
    layerId,
    groupId,
    isShape: true,
    shapeType: 'wave-axis-y',
  });
  strokes.push({
    id: `st-${nowId}-lbly2`,
    tool: 'pen',
    color: axisColor,
    width: 2.1,
    opacity: 1,
    points: [
      { x: yx + 5.5, y: yy - 6, pressure: 0.7 },
      { x: yx - 3.5, y: yy + 8.5, pressure: 0.7 },
    ],
    layerId,
    groupId,
    isShape: true,
    shapeType: 'wave-axis-y',
  });

  const addCurveStroke = (pts: { x: number; y: number }[], idx: number, asLineShape = false) => {
    if (pts.length < 2) return;
    strokes.push({
      id: `st-${nowId}-crv-${idx}`,
      tool: 'pen',
      color: curveColor,
      width: 3.0,
      opacity: 1,
      points: pts.map((p) => ({ x: p.x, y: p.y, pressure: 0.7 })),
      layerId,
      groupId,
      isShape: asLineShape,
      shapeType: asLineShape ? 'line' : undefined,
    });
  };

  // Detect whether the equation is quantitative (numerical constants only, no symbolic parameters like a, b, c, R)
  // Note: exclude `x`, `y` (coordinate variables) and `e` (Euler's constant) from the symbolic parameter check!
  const strippedForVars = normalized.replace(/\b(SIN|COS|TAN|SQRT|ABS|EXP|LN|LOG|PI)\b/gi, '');
  const isQuantitative = !/[a-df-wzA-DF-WZα-ωΑ-Ω]/.test(strippedForVars);

  const formatNumLabel = (val: number): string => {
    if (!Number.isFinite(val) || Math.abs(val) < 1e-5) return '0';
    if (Math.abs(val - Math.round(val)) < 1e-3) {
      return String(Math.round(val));
    }
    const decimals = Math.abs(val) < 10 ? 2 : 1;
    return Number(val.toFixed(decimals)).toString();
  };

  let tickCounter = 0;
  const placedLabelBoxes: { minX: number; maxX: number; minY: number; maxY: number }[] = [
    // Reserve boxes around the 'x' and 'y' axis-tip labels so tick numbers never collide with them
    { minX: lx - 8, maxX: lx + 8, minY: ly - 8, maxY: ly + 8 },
    { minX: yx - 8, maxX: yx + 8, minY: yy - 8, maxY: yy + 10 },
  ];

  const getDenseCurvePointsForClearance = (): { x: number; y: number }[] => {
    const pts: { x: number; y: number }[] = [];
    for (const s of strokes) {
      if (
        !s.id.includes('-crv-') &&
        !s.id.includes('-proj') &&
        !s.id.includes('-trig-')
      ) {
        continue;
      }
      if ((s.shapeType === 'ellipse' || s.shapeType === 'circle') && s.points.length >= 4) {
        const [pTop, pRight, pBot, pLeft] = s.points;
        const ecx = (pLeft.x + pRight.x) / 2;
        const ecy = (pTop.y + pBot.y) / 2;
        const erx = Math.abs(pRight.x - pLeft.x) / 2;
        const ery = Math.abs(pBot.y - pTop.y) / 2;
        for (let k = 0; k < 64; k++) {
          const ang = (k / 64) * Math.PI * 2;
          pts.push({ x: ecx + erx * Math.cos(ang), y: ecy + ery * Math.sin(ang) });
        }
        continue;
      }
      for (let i = 0; i < s.points.length; i++) {
        const pA = s.points[i];
        pts.push({ x: pA.x, y: pA.y });
        if (i + 1 < s.points.length) {
          const pB = s.points[i + 1];
          const segLen = Math.hypot(pB.x - pA.x, pB.y - pA.y);
          if (segLen > 3.5) {
            const subSteps = Math.min(40, Math.ceil(segLen / 3.5));
            for (let k = 1; k < subSteps; k++) {
              const t = k / subSteps;
              pts.push({
                x: pA.x + (pB.x - pA.x) * t,
                y: pA.y + (pB.y - pA.y) * t,
              });
            }
          }
        }
      }
    }
    return pts;
  };

  const computeLabelBox = (
    labelText: string,
    anchorX: number,
    anchorY: number,
    align: 'left' | 'center' | 'right',
    fontH: number
  ) => {
    const [mainPart, subPart] = labelText.split('_');
    const mainCharW = fontH * 0.66;
    const mainGap = fontH * 0.14;
    const subH = fontH * 0.62;
    const subCharW = subH * 0.68;
    const subGap = subH * 0.12;
    const mainTotalW =
      mainPart.length > 0 ? mainPart.length * mainCharW + (mainPart.length - 1) * mainGap : 0;
    const subTotalW =
      subPart && subPart.length > 0
        ? subPart.length * subCharW + (subPart.length - 1) * subGap + fontH * 0.08
        : 0;
    const totalW = mainTotalW + subTotalW;
    const minX =
      align === 'center'
        ? anchorX - totalW / 2
        : align === 'right'
        ? anchorX - totalW
        : anchorX;
    return {
      minX: minX - 2,
      maxX: minX + totalW + 2,
      minY: anchorY - fontH / 2 - 2,
      maxY: anchorY + fontH / 2 + 2,
    };
  };

  const scoreCandidateBox = (
    box: { minX: number; maxX: number; minY: number; maxY: number },
    curvePts: { x: number; y: number }[]
  ): number => {
    let minClearance = 36;
    for (const p of curvePts) {
      const dx = Math.max(box.minX - p.x, 0, p.x - box.maxX);
      const dy = Math.max(box.minY - p.y, 0, p.y - box.maxY);
      let d: number;
      if (dx === 0 && dy === 0) {
        d = -Math.min(p.x - box.minX, box.maxX - p.x, p.y - box.minY, box.maxY - p.y) - 2;
      } else {
        d = Math.hypot(dx, dy);
      }
      if (d < minClearance) minClearance = d;
    }
    for (const ob of placedLabelBoxes) {
      const ox = Math.max(box.minX - ob.maxX, 0, ob.minX - box.maxX);
      const oy = Math.max(box.minY - ob.maxY, 0, ob.minY - box.maxY);
      const od = ox === 0 && oy === 0 ? -12 : Math.hypot(ox, oy);
      if (od < minClearance) minClearance = od;
    }
    // Also keep at least 5px clear of the two axes themselves so labels don't sit on the axis lines
    const distToXAxis = Math.max(box.minY - centerY, 0, centerY - box.maxY);
    const distToYAxis = Math.max(box.minX - centerX, 0, centerX - box.maxX);
    if (distToXAxis < 4) minClearance = Math.min(minClearance, distToXAxis - 4);
    if (distToYAxis < 4) minClearance = Math.min(minClearance, distToYAxis - 4);
    return minClearance;
  };

  const addXAxisTickAndLabel = (
    px: number,
    labelText: string,
    placeAbove = false,
    xLabelOffset = 0
  ) => {
    if (Math.abs(px - centerX) > halfW - 6 || Math.abs(px - centerX) < 11) return;
    const tId = tickCounter++;
    strokes.push({
      id: `math-graph-lbl-${nowId}-xtick-${tId}`,
      tool: 'pen',
      color: axisColor,
      width: 2.1,
      opacity: 1,
      points: [
        { x: px, y: centerY - 6.5, pressure: 0.7 },
        { x: px, y: centerY + 6.5, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-x',
    });

    const fontH = 14.5;
    const curvePts = getDenseCurvePointsForClearance();
    const outDir = px < centerX ? -1 : 1;
    const dxCandidates = [
      xLabelOffset,
      0,
      outDir * 13,
      -outDir * 13,
      outDir * 20,
      -outDir * 20,
    ];
    const aboveOptions = [placeAbove, !placeAbove];

    let bestAx = px + xLabelOffset;
    let bestAy = placeAbove ? centerY - 18 : centerY + 19;
    let bestBox = computeLabelBox(labelText, bestAx, bestAy, 'center', fontH);
    let bestScore = -Infinity;

    for (const isAbove of aboveOptions) {
      const candY = isAbove ? centerY - 18 : centerY + 19;
      for (const dx of dxCandidates) {
        const candX = px + dx;
        if (Math.abs(candX - centerX) < 10) continue;
        const box = computeLabelBox(labelText, candX, candY, 'center', fontH);
        const clearance = scoreCandidateBox(box, curvePts);
        const prefBonus =
          (isAbove === placeAbove ? 1.2 : 0) +
          (Math.abs(dx - xLabelOffset) < 2 ? 0.8 : 0) -
          Math.abs(dx) * 0.08;
        const score = Math.min(clearance, 18) * 3.0 + prefBonus;
        if (score > bestScore) {
          bestScore = score;
          bestAx = candX;
          bestAy = candY;
          bestBox = box;
        }
      }
    }

    placedLabelBoxes.push(bestBox);
    strokes.push(
      ...createVectorMathLabelStrokes(
        labelText,
        bestAx,
        bestAy,
        'center',
        fontH,
        axisColor,
        layerId,
        groupId,
        `math-graph-lbl-${nowId}-xlbl-${tId}`
      )
    );
  };

  const addYAxisTickAndLabel = (
    py: number,
    labelText: string,
    placeLeft = false,
    yLabelOffset = 0
  ) => {
    if (Math.abs(py - centerY) > halfH - 6 || Math.abs(py - centerY) < 11) return;
    const tId = tickCounter++;
    strokes.push({
      id: `math-graph-lbl-${nowId}-ytick-${tId}`,
      tool: 'pen',
      color: axisColor,
      width: 2.1,
      opacity: 1,
      points: [
        { x: centerX - 6.5, y: py, pressure: 0.7 },
        { x: centerX + 6.5, y: py, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-y',
    });

    const fontH = 14.5;
    const curvePts = getDenseCurvePointsForClearance();
    const outDirY = py < centerY ? -1 : 1;
    const dyCandidates = [
      yLabelOffset,
      0,
      outDirY * 13,
      -outDirY * 13,
      outDirY * 18,
      -outDirY * 18,
    ];
    const leftOptions = [placeLeft, !placeLeft];

    let bestAx = placeLeft ? centerX - 10 : centerX + 10;
    let bestAy = py + yLabelOffset;
    let bestAlign: 'left' | 'right' = placeLeft ? 'right' : 'left';
    let bestBox = computeLabelBox(labelText, bestAx, bestAy, bestAlign, fontH);
    let bestScore = -Infinity;

    for (const isLeft of leftOptions) {
      const candX = isLeft ? centerX - 10 : centerX + 10;
      const candAlign: 'left' | 'right' = isLeft ? 'right' : 'left';
      for (const dy of dyCandidates) {
        const candY = py + dy;
        if (Math.abs(candY - centerY) < 10) continue;
        const box = computeLabelBox(labelText, candX, candY, candAlign, fontH);
        const clearance = scoreCandidateBox(box, curvePts);
        const prefBonus =
          (isLeft === placeLeft ? 1.2 : 0) +
          (Math.abs(dy - yLabelOffset) < 2 ? 0.8 : 0) -
          Math.abs(dy) * 0.08;
        const score = Math.min(clearance, 18) * 3.0 + prefBonus;
        if (score > bestScore) {
          bestScore = score;
          bestAx = candX;
          bestAy = candY;
          bestAlign = candAlign;
          bestBox = box;
        }
      }
    }

    placedLabelBoxes.push(bestBox);
    strokes.push(
      ...createVectorMathLabelStrokes(
        labelText,
        bestAx,
        bestAy,
        bestAlign,
        fontH,
        axisColor,
        layerId,
        groupId,
        `math-graph-lbl-${nowId}-ylbl-${tId}`
      )
    );
  };

  const addDashedCoordProjection = (
    px: number,
    py: number,
    vxLabel: string,
    vyLabel: string
  ) => {
    const tId = tickCounter++;
    if (Math.abs(px - centerX) >= 12 && Math.abs(py - centerY) >= 12) {
      strokes.push({
        id: `st-${nowId}-projv-${tId}`,
        tool: 'pen',
        color: '#2563eb',
        width: 1.7,
        opacity: 0.9,
        lineStyle: 'dashed',
        points: [
          { x: px, y: py, pressure: 0.7 },
          { x: px, y: centerY, pressure: 0.7 },
        ],
        layerId,
        groupId,
        isShape: true,
        shapeType: 'wave-guide-top',
      });
      strokes.push({
        id: `st-${nowId}-projh-${tId}`,
        tool: 'pen',
        color: '#2563eb',
        width: 1.7,
        opacity: 0.9,
        lineStyle: 'dashed',
        points: [
          { x: px, y: py, pressure: 0.7 },
          { x: centerX, y: py, pressure: 0.7 },
        ],
        layerId,
        groupId,
        isShape: true,
        shapeType: 'wave-guide-bottom',
      });
    }
    if (vxLabel && vxLabel !== '0') {
      addXAxisTickAndLabel(px, vxLabel, py > centerY);
    }
    if (vyLabel && vyLabel !== '0') {
      addYAxisTickAndLabel(py, vyLabel, px > centerX);
    }
  };

  let kindLabel = 'Συνάρτηση';

  // Step A: Test if F(x, y) is an exact polynomial of degree <= 2 (Line, Circle, Ellipse, Parabola, or Conic Hyperbola):
  // F(x, y) = A*x^2 + B*x*y + C*y^2 + D*x + E*y + G
  const f00 = evalF(0, 0);
  const f10 = evalF(1, 0);
  const fm10 = evalF(-1, 0);
  const f01 = evalF(0, 1);
  const f0m1 = evalF(0, -1);
  const f11 = evalF(1, 1);

  const canBeConic =
    Number.isFinite(f00) &&
    Number.isFinite(f10) &&
    Number.isFinite(fm10) &&
    Number.isFinite(f01) &&
    Number.isFinite(f0m1) &&
    Number.isFinite(f11);

  if (canBeConic) {
    const G = f00;
    const D = (f10 - fm10) / 2;
    const E = (f01 - f0m1) / 2;
    const A = (f10 + fm10) / 2 - G;
    const C = (f01 + f0m1) / 2 - G;
    const B = f11 - (A + C + D + E + G);

    const testPts = [
      [2.3, -1.7],
      [-0.7, 3.1],
      [1.4, 2.2],
      [-2.1, -1.3],
      [0.6, -0.9],
    ];
    const isExactQuadraticOrLinear = testPts.every(([tx, ty]) => {
      const actual = evalF(tx, ty);
      if (!Number.isFinite(actual)) return false;
      const pred = A * tx * tx + B * tx * ty + C * ty * ty + D * tx + E * ty + G;
      const scale = Math.max(1, Math.abs(actual), Math.abs(pred));
      return Math.abs(actual - pred) <= 1e-5 * scale;
    });

    if (isExactQuadraticOrLinear) {
      const eps = 1e-6;
      const hasQuad = Math.abs(A) > eps || Math.abs(B) > eps || Math.abs(C) > eps;

      // 1. LINE: D*x + E*y + G = 0
      if (!hasQuad && (Math.abs(D) > eps || Math.abs(E) > eps)) {
        kindLabel = 'Ευθεία';
        const xInt = Math.abs(D) > eps ? -G / D : 0;
        const yInt = Math.abs(E) > eps ? -G / E : 0;
        const maxIntercept = Math.max(
          1.25,
          Math.abs(xInt) > eps ? Math.abs(xInt) * 1.35 : 0,
          Math.abs(yInt) > eps ? Math.abs(yInt) * 1.35 : 0
        );
        const wSpan = maxIntercept;
        const hSpan = maxIntercept;

        // Clip infinite line D*x + E*y + G = 0 to [-wSpan, wSpan] x [-hSpan, hSpan]
        const boxHits: { x: number; y: number }[] = [];
        if (Math.abs(E) > eps) {
          for (const bx of [-wSpan, wSpan]) {
            const by = (-G - D * bx) / E;
            if (by >= -hSpan - 1e-5 && by <= hSpan + 1e-5) {
              boxHits.push({ x: bx, y: by });
            }
          }
        }
        if (Math.abs(D) > eps) {
          for (const by of [-hSpan, hSpan]) {
            const bx = (-G - E * by) / D;
            if (bx >= -wSpan - 1e-5 && bx <= wSpan + 1e-5) {
              if (!boxHits.some((p) => Math.hypot(p.x - bx, p.y - by) < 1e-4)) {
                boxHits.push({ x: bx, y: by });
              }
            }
          }
        }
        if (boxHits.length >= 2) {
          const p0 = boxHits[0];
          const p1 = boxHits[boxHits.length - 1];
          addCurveStroke(
            [
              {
                x: centerX + (p0.x / wSpan) * plotHalfW,
                y: centerY - (p0.y / hSpan) * plotHalfH,
              },
              {
                x: centerX + (p1.x / wSpan) * plotHalfW,
                y: centerY - (p1.y / hSpan) * plotHalfH,
              },
            ],
            0,
            true
          );
          if (isQuantitative) {
            if (Math.abs(D) > eps && Math.abs(xInt) > 1e-4) {
              const pxInt = centerX + (xInt / wSpan) * plotHalfW;
              addXAxisTickAndLabel(pxInt, formatNumLabel(xInt), yInt < -1e-4);
            }
            if (Math.abs(E) > eps && Math.abs(yInt) > 1e-4) {
              const pyInt = centerY - (yInt / hSpan) * plotHalfH;
              addYAxisTickAndLabel(pyInt, formatNumLabel(yInt), xInt > 1e-4);
            }
            if (Math.abs(G) <= eps && Math.abs(D) > eps && Math.abs(E) > eps) {
              const slope = -D / E;
              const px1 = centerX + (1 / wSpan) * plotHalfW;
              const py1 = centerY - (slope / hSpan) * plotHalfH;
              addDashedCoordProjection(px1, py1, '1', formatNumLabel(slope));
            }
          }
          return { strokes, groupId, kindLabel };
        }
      }

      // 2. CIRCLE OR ELLIPSE: B ≈ 0 and A * C > 0
      if (Math.abs(B) <= eps && A * C > eps * eps) {
        const x0 = -D / (2 * A);
        const y0 = -E / (2 * C);
        const rhsConst = A * x0 * x0 + C * y0 * y0 - G;
        const absK = Math.abs(rhsConst) > eps ? Math.abs(rhsConst) : Math.abs(A);
        const aSemi = Math.sqrt(absK / Math.abs(A));
        const bSemi = Math.sqrt(absK / Math.abs(C));
        const isCircle = Math.abs(aSemi - bSemi) <= 1e-3 * Math.max(aSemi, bSemi);
        kindLabel = isCircle ? 'Κύκλος' : 'Έλλειψη';

        const maxCenterOffset = Math.max(Math.abs(x0), Math.abs(y0));
        const baseRadiusPx = Math.min(plotHalfW, plotHalfH) * (maxCenterOffset > 0.05 ? 0.58 : 0.80);
        let rxPx = baseRadiusPx;
        let ryPx = baseRadiusPx;

        if (!isCircle) {
          if (aSemi > bSemi) {
            const ratio = Math.min(0.64, Math.max(0.34, bSemi / aSemi));
            rxPx = baseRadiusPx * 1.08;
            ryPx = rxPx * ratio;
          } else {
            const ratio = Math.min(0.64, Math.max(0.34, aSemi / bSemi));
            ryPx = baseRadiusPx * 1.08;
            rxPx = ryPx * ratio;
          }
        }

        const worldRef = Math.max(aSemi, bSemi, 1e-4);
        const cxPx = centerX + (x0 / (worldRef * 1.8)) * plotHalfW;
        const cyPx = centerY - (y0 / (worldRef * 1.8)) * plotHalfH;

        strokes.push({
          id: `st-${nowId}-crv-ellipse`,
          tool: 'pen',
          color: curveColor,
          width: 3.0,
          opacity: 1,
          points: [
            { x: cxPx, y: cyPx - ryPx, pressure: 0.7 },
            { x: cxPx + rxPx, y: cyPx, pressure: 0.7 },
            { x: cxPx, y: cyPx + ryPx, pressure: 0.7 },
            { x: cxPx - rxPx, y: cyPx, pressure: 0.7 },
          ],
          layerId,
          groupId,
          isShape: true,
          shapeType: 'ellipse',
        });

        if (maxCenterOffset <= 0.05) {
          let lblXPos = '';
          let lblXNeg = '';
          let lblYPos = '';
          let lblYNeg = '';
          if (isQuantitative) {
            const aStr = formatNumLabel(aSemi);
            const bStr = formatNumLabel(bSemi);
            lblXPos = aStr;
            lblXNeg = `-${aStr}`;
            lblYPos = bStr;
            lblYNeg = `-${bStr}`;
          } else if (/\b[rR]\b/.test(normalized)) {
            lblXPos = 'R';
            lblXNeg = '-R';
            lblYPos = 'R';
            lblYNeg = '-R';
          } else if (hasBothAB) {
            lblXPos = 'a';
            lblXNeg = '-a';
            lblYPos = 'b';
            lblYNeg = '-b';
          }
          if (lblXPos) {
            addXAxisTickAndLabel(cxPx - rxPx, lblXNeg, true, -11);
            addXAxisTickAndLabel(cxPx + rxPx, lblXPos, true, 10);
            addYAxisTickAndLabel(cyPx - ryPx, lblYPos, false, -10);
            addYAxisTickAndLabel(cyPx + ryPx, lblYNeg, false, 11);
          }
        } else if (isQuantitative) {
          addDashedCoordProjection(cxPx, cyPx, formatNumLabel(x0), formatNumLabel(y0));
        }

        return { strokes, groupId, kindLabel };
      }

      // 3. VERTICAL PARABOLA: A != 0, C ≈ 0, B ≈ 0, E != 0 -> y = a*x^2 + b*x + c
      if (Math.abs(B) <= eps && Math.abs(A) > eps && Math.abs(C) <= eps && Math.abs(E) > eps) {
        kindLabel = 'Παραβολή';
        const pa = -A / E;
        const pb = -D / E;
        const pc = -G / E;
        const xv = -pb / (2 * pa);
        const yv = pa * xv * xv + pb * xv + pc;
        const disc = pb * pb - 4 * pa * pc;
        const rootSpan = disc > 0 ? Math.sqrt(disc) / Math.abs(2 * pa) : 0;
        const halfDomainX = Math.max(1.45, rootSpan * 1.4, Math.abs(xv) * 0.6 + 1.35);
        const xSpan = Math.max(Math.abs(xv) + halfDomainX, 1.55);
        const yAtEdge1 = pa * (xv + halfDomainX) * (xv + halfDomainX) + pb * (xv + halfDomainX) + pc;
        const ySpan = Math.max(Math.abs(yv) * 1.3, Math.abs(yAtEdge1) * 0.96, Math.abs(pc) * 1.25, 1.25);

        const pts: { x: number; y: number }[] = [];
        const steps = 80;
        const xMin = Math.max(-xSpan, xv - halfDomainX);
        const xMax = Math.min(xSpan, xv + halfDomainX);
        for (let i = 0; i <= steps; i++) {
          const wx = xMin + ((xMax - xMin) * i) / steps;
          const wy = pa * wx * wx + pb * wx + pc;
          if (Math.abs(wy) <= ySpan * 1.08) {
            pts.push({
              x: centerX + (wx / xSpan) * plotHalfW,
              y: centerY - (wy / ySpan) * plotHalfH,
            });
          }
        }
        addCurveStroke(pts, 0, false);

        if (isQuantitative) {
          // 1. Roots on X-axis (where y = 0)
          if (disc > 1e-5) {
            const sqrtD = Math.sqrt(disc);
            const r1 = (-pb - sqrtD) / (2 * pa);
            const r2 = (-pb + sqrtD) / (2 * pa);
            const roots = [Math.min(r1, r2), Math.max(r1, r2)];
            for (const r of roots) {
              if (Math.abs(r) > 1e-4) {
                const px = centerX + (r / xSpan) * plotHalfW;
                addXAxisTickAndLabel(px, formatNumLabel(r), pa < 0, r < xv ? -5 : 5);
              }
            }
          } else if (Math.abs(disc) <= 1e-5 && Math.abs(xv) > 1e-4) {
            const px = centerX + (xv / xSpan) * plotHalfW;
            addXAxisTickAndLabel(px, formatNumLabel(xv), pa < 0);
          }

          // 2. Y-intercept (x = 0, y = pc)
          if (Math.abs(pc) > 1e-4) {
            const pyc = centerY - (pc / ySpan) * plotHalfH;
            addYAxisTickAndLabel(pyc, formatNumLabel(pc), true, pc < 0 ? 11 : -10);
          }

          // 3. Off-axis vertex projection (xv, yv)
          if (Math.abs(xv) > 0.08 && Math.abs(yv) > 1e-4) {
            const pxv = centerX + (xv / xSpan) * plotHalfW;
            const pyv = centerY - (yv / ySpan) * plotHalfH;
            addDashedCoordProjection(pxv, pyv, formatNumLabel(xv), formatNumLabel(yv));
          }
        }

        return { strokes, groupId, kindLabel };
      }

      // 4. HORIZONTAL PARABOLA: C != 0, A ≈ 0, B ≈ 0, D != 0 -> x = a*y^2 + b*y + c (e.g. y^2 = 2px)
      if (Math.abs(B) <= eps && Math.abs(C) > eps && Math.abs(A) <= eps && Math.abs(D) > eps) {
        kindLabel = 'Παραβολή';
        const pa = -C / D;
        const pb = -E / D;
        const pc = -G / D;
        const yv = -pb / (2 * pa);
        const xv = pa * yv * yv + pb * yv + pc;
        const disc = pb * pb - 4 * pa * pc;
        const rootSpan = disc > 0 ? Math.sqrt(disc) / Math.abs(2 * pa) : 0;
        const halfDomainY = Math.max(1.45, rootSpan * 1.4, Math.abs(yv) * 0.6 + 1.35);
        const ySpan = Math.max(Math.abs(yv) + halfDomainY, 1.55);
        const xAtEdge = pa * (yv + halfDomainY) * (yv + halfDomainY) + pb * (yv + halfDomainY) + pc;
        const xSpan = Math.max(Math.abs(xv) * 1.3, Math.abs(xAtEdge) * 0.96, Math.abs(pc) * 1.25, 1.25);

        const pts: { x: number; y: number }[] = [];
        const steps = 80;
        const yMin = Math.max(-ySpan, yv - halfDomainY);
        const yMax = Math.min(ySpan, yv + halfDomainY);
        for (let i = 0; i <= steps; i++) {
          const wy = yMin + ((yMax - yMin) * i) / steps;
          const wx = pa * wy * wy + pb * wy + pc;
          if (Math.abs(wx) <= xSpan * 1.08) {
            pts.push({
              x: centerX + (wx / xSpan) * plotHalfW,
              y: centerY - (wy / ySpan) * plotHalfH,
            });
          }
        }
        addCurveStroke(pts, 0, false);

        if (isQuantitative) {
          if (disc > 1e-5) {
            const sqrtD = Math.sqrt(disc);
            const r1 = (-pb - sqrtD) / (2 * pa);
            const r2 = (-pb + sqrtD) / (2 * pa);
            for (const r of [Math.min(r1, r2), Math.max(r1, r2)]) {
              if (Math.abs(r) > 1e-4) {
                const py = centerY - (r / ySpan) * plotHalfH;
                addYAxisTickAndLabel(py, formatNumLabel(r), pa > 0, r < yv ? 8 : -8);
              }
            }
          }
          if (Math.abs(pc) > 1e-4) {
            const pxc = centerX + (pc / xSpan) * plotHalfW;
            addXAxisTickAndLabel(pxc, formatNumLabel(pc), false);
          }
        }

        return { strokes, groupId, kindLabel };
      }

      // 5. CONIC HYPERBOLA: B ≈ 0 and A * C < 0 (e.g. x^2/a^2 - y^2/b^2 = 1 or y^2/b^2 - x^2/a^2 = 1)
      if (Math.abs(B) <= eps && A * C < -eps * eps) {
        kindLabel = 'Υπερβολή';
        const x0 = -D / (2 * A);
        const y0 = -E / (2 * C);
        const K = A * x0 * x0 + C * y0 * y0 - G;
        const effK = Math.abs(K) > eps ? K : A;
        const aSemi = Math.sqrt(Math.abs(effK / A));
        const bSemi = Math.sqrt(Math.abs(effK / C));
        const opensEastWest = effK / A > 0;

        const xSpan = Math.max(aSemi * 2.15, Math.abs(x0) + aSemi * 1.95, 1.5);
        const ySpan = Math.max(bSemi * 2.15, Math.abs(y0) + bSemi * 1.95, 1.5);
        const steps = 72;

        if (opensEastWest) {
          // x = x0 ± a * sqrt(1 + (y - y0)^2 / b^2)
          const branchRight: { x: number; y: number }[] = [];
          const branchLeft: { x: number; y: number }[] = [];
          const yRange = ySpan * 0.92;
          for (let i = 0; i <= steps; i++) {
            const wy = -yRange + (2 * yRange * i) / steps;
            const rad = aSemi * Math.sqrt(1 + ((wy - y0) * (wy - y0)) / (bSemi * bSemi));
            const wxR = x0 + rad;
            const wxL = x0 - rad;
            if (Math.abs(wxR) <= xSpan * 1.08) {
              branchRight.push({
                x: centerX + (wxR / xSpan) * plotHalfW,
                y: centerY - (wy / ySpan) * plotHalfH,
              });
            }
            if (Math.abs(wxL) <= xSpan * 1.08) {
              branchLeft.push({
                x: centerX + (wxL / xSpan) * plotHalfW,
                y: centerY - (wy / ySpan) * plotHalfH,
              });
            }
          }
          addCurveStroke(branchRight, 0, false);
          addCurveStroke(branchLeft, 1, false);
          if (isQuantitative && Math.abs(y0) <= 0.05) {
            const pxL = centerX + ((x0 - aSemi) / xSpan) * plotHalfW;
            const pxR = centerX + ((x0 + aSemi) / xSpan) * plotHalfW;
            addXAxisTickAndLabel(pxL, formatNumLabel(x0 - aSemi), false, -6);
            addXAxisTickAndLabel(pxR, formatNumLabel(x0 + aSemi), false, 6);
          }
          return { strokes, groupId, kindLabel };
        } else {
          // y = y0 ± b * sqrt(1 + (x - x0)^2 / a^2)
          const branchTop: { x: number; y: number }[] = [];
          const branchBot: { x: number; y: number }[] = [];
          const xRange = xSpan * 0.92;
          for (let i = 0; i <= steps; i++) {
            const wx = -xRange + (2 * xRange * i) / steps;
            const rad = bSemi * Math.sqrt(1 + ((wx - x0) * (wx - x0)) / (aSemi * aSemi));
            const wyT = y0 + rad;
            const wyB = y0 - rad;
            if (Math.abs(wyT) <= ySpan * 1.08) {
              branchTop.push({
                x: centerX + (wx / xSpan) * plotHalfW,
                y: centerY - (wyT / ySpan) * plotHalfH,
              });
            }
            if (Math.abs(wyB) <= ySpan * 1.08) {
              branchBot.push({
                x: centerX + (wx / xSpan) * plotHalfW,
                y: centerY - (wyB / ySpan) * plotHalfH,
              });
            }
          }
          addCurveStroke(branchTop, 0, false);
          addCurveStroke(branchBot, 1, false);
          if (isQuantitative && Math.abs(x0) <= 0.05) {
            const pyT = centerY - ((y0 + bSemi) / ySpan) * plotHalfH;
            const pyB = centerY - ((y0 - bSemi) / ySpan) * plotHalfH;
            addYAxisTickAndLabel(pyT, formatNumLabel(y0 + bSemi), false, -8);
            addYAxisTickAndLabel(pyB, formatNumLabel(y0 - bSemi), false, 8);
          }
          return { strokes, groupId, kindLabel };
        }
      }

      // 6. RECTANGULAR HYPERBOLA: B != 0, A ≈ 0, C ≈ 0 -> B*x*y + D*x + E*y + G = 0 (e.g. x*y = c)
      if (Math.abs(B) > eps && Math.abs(A) <= eps && Math.abs(C) <= eps) {
        kindLabel = 'Υπερβολή';
        const xAsym = -E / B;
        const yAsym = -D / B;
        const numK = (D * E) / (B * B) - G / B;
        const effC = Math.abs(numK) > eps ? numK : 1.2;
        const sVal = Math.sqrt(Math.abs(effC));
        const span = Math.max(sVal * 3.0, Math.abs(xAsym) + sVal * 2.5, Math.abs(yAsym) + sVal * 2.5, 2.5);

        const branch1: { x: number; y: number }[] = [];
        const branch2: { x: number; y: number }[] = [];
        const steps = 64;
        const tMin = sVal * 0.36;
        const tMax = sVal * 2.75;
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const dx = tMin * Math.pow(tMax / tMin, u);
          const dy = effC / dx;
          // Positive dx branch
          branch1.push({
            x: centerX + ((xAsym + dx) / span) * plotHalfW,
            y: centerY - ((yAsym + dy) / span) * plotHalfH,
          });
          // Negative dx branch
          branch2.push({
            x: centerX + ((xAsym - dx) / span) * plotHalfW,
            y: centerY - ((yAsym - dy) / span) * plotHalfH,
          });
        }
        addCurveStroke(branch1, 0, false);
        addCurveStroke(branch2, 1, false);
        return { strokes, groupId, kindLabel };
      }
    }
  }

  // Step B: Check if explicit function y = f(x) (either LHS is 'y' and RHS has no 'y', or RHS is 'y' and LHS has no 'y')
  const isLhsY = lhsStr === 'y' && !/\by\b/.test(rhsStr);
  const isRhsY = rhsStr === 'y' && !/\by\b/.test(lhsStr);
  if (isLhsY || isRhsY) {
    const fnEval = isLhsY ? (x: number) => evalRhs(x, 0) : (x: number) => evalLhs(x, 0);
    const fnStr = isLhsY ? rhsStr : lhsStr;

    if (/\//.test(fnStr) && /x/.test(fnStr.split('/')[1] || '')) {
      kindLabel = 'Υπερβολή';
    } else if (/\^/.test(fnStr)) {
      kindLabel = 'Πολυώνυμο';
    } else if (/SIN|COS|TAN/i.test(fnStr)) {
      kindLabel = 'Τριγωνομετρική';
    }

    // Choose domain xSpan and range ySpan to capture roots, extrema, or periods cleanly
    let xSpan = /SIN|COS|TAN/i.test(fnStr) ? 6.5 : 3.2;
    const sampleCheck: { x: number; y: number }[] = [];
    for (let sx = -4.5; sx <= 4.5; sx += 0.1) {
      const sy = fnEval(sx);
      if (Number.isFinite(sy) && Math.abs(sy) < 80) {
        sampleCheck.push({ x: sx, y: sy });
      }
    }
    // Find turning points (local extrema) to size window cleanly
    let maxExtremaX = 0;
    let maxExtremaY = 0;
    for (let i = 1; i < sampleCheck.length - 1; i++) {
      const yPrev = sampleCheck[i - 1].y;
      const yCur = sampleCheck[i].y;
      const yNext = sampleCheck[i + 1].y;
      if ((yCur > yPrev && yCur > yNext) || (yCur < yPrev && yCur < yNext)) {
        maxExtremaX = Math.max(maxExtremaX, Math.abs(sampleCheck[i].x));
        maxExtremaY = Math.max(maxExtremaY, Math.abs(yCur));
      }
    }
    if (maxExtremaX > 0.2 && !/SIN|COS|TAN/i.test(fnStr)) {
      xSpan = Math.max(2.4, Math.min(6.0, maxExtremaX * 2.1));
    }

    // Compute robust ySpan (75th percentile / extrema so vertical asymptotes like 1/x don't flatten the curve!)
    const validAbsY: number[] = [];
    for (let i = 0; i <= 120; i++) {
      const wx = -xSpan + (2 * xSpan * i) / 120;
      if (Math.abs(wx) < 0.08) continue;
      const wy = fnEval(wx);
      if (Number.isFinite(wy) && Math.abs(wy) < 200) {
        validAbsY.push(Math.abs(wy));
      }
    }
    validAbsY.sort((a, b) => a - b);
    const p75 = validAbsY.length > 0 ? validAbsY[Math.floor(validAbsY.length * 0.75)] : 2.5;
    const ySpan =
      /SIN|COS/i.test(fnStr) && maxExtremaY > 1e-4
        ? maxExtremaY * 1.18
        : Math.max(1.1, maxExtremaY * 1.25, Math.min(18, p75 * 1.18));

    // Sample continuous branches, splitting across vertical asymptotes or domain gaps
    const numSteps = 160;
    let currentBranch: { x: number; y: number }[] = [];
    let branchIdx = 0;
    let prevWy: number | null = null;

    for (let i = 0; i <= numSteps; i++) {
      const wx = -xSpan + (2 * xSpan * i) / numSteps;
      const wy = fnEval(wx);
      const isJump =
        prevWy !== null &&
        Number.isFinite(wy) &&
        Math.abs(wy - prevWy) > ySpan * 1.35 &&
        wy * prevWy < 0;

      if (!Number.isFinite(wy) || Math.abs(wy) > ySpan * 1.06 || isJump) {
        if (currentBranch.length >= 2) {
          addCurveStroke(currentBranch, branchIdx++, false);
        }
        currentBranch = [];
        prevWy = Number.isFinite(wy) ? wy : null;
        if (Number.isFinite(wy) && Math.abs(wy) <= ySpan * 1.06 && isJump) {
          currentBranch.push({
            x: centerX + (wx / xSpan) * plotHalfW,
            y: centerY - (wy / ySpan) * plotHalfH,
          });
        }
        continue;
      }

      currentBranch.push({
        x: centerX + (wx / xSpan) * plotHalfW,
        y: centerY - (wy / ySpan) * plotHalfH,
      });
      prevWy = wy;
    }
    if (currentBranch.length >= 2) {
      addCurveStroke(currentBranch, branchIdx++, false);
    }

    if (strokes.length > 6 && /SIN|COS/i.test(fnStr) && maxExtremaY > 1e-4) {
      // For sine / cosine functions (sin(x), ημ(χ), cos(x), συν(χ)), mark +ymax and -ymax on Y-axis with dashed amplitude guides!
      const pyTop = centerY - (maxExtremaY / ySpan) * plotHalfH;
      const pyBot = centerY + (maxExtremaY / ySpan) * plotHalfH;
      const topLbl = isQuantitative ? formatNumLabel(maxExtremaY) : 'A';
      const botLbl = isQuantitative ? `-${formatNumLabel(maxExtremaY)}` : '-A';
      strokes.push({
        id: `st-${nowId}-trig-gtop`,
        tool: 'pen',
        color: '#2563eb',
        width: 1.6,
        opacity: 0.85,
        lineStyle: 'dashed',
        points: [
          { x: centerX - plotHalfW, y: pyTop, pressure: 0.7 },
          { x: centerX + plotHalfW, y: pyTop, pressure: 0.7 },
        ],
        layerId,
        groupId,
        isShape: true,
        shapeType: 'wave-guide-top',
      });
      strokes.push({
        id: `st-${nowId}-trig-gbot`,
        tool: 'pen',
        color: '#2563eb',
        width: 1.6,
        opacity: 0.85,
        lineStyle: 'dashed',
        points: [
          { x: centerX - plotHalfW, y: pyBot, pressure: 0.7 },
          { x: centerX + plotHalfW, y: pyBot, pressure: 0.7 },
        ],
        layerId,
        groupId,
        isShape: true,
        shapeType: 'wave-guide-bottom',
      });
      addYAxisTickAndLabel(pyTop, topLbl, true, -9);
      addYAxisTickAndLabel(pyBot, botLbl, true, 10);
    } else if (strokes.length > 6 && isQuantitative) {
      // 1. Y-intercept (x = 0, y0 = f(0))
      const y0Val = fnEval(0);
      if (Number.isFinite(y0Val) && Math.abs(y0Val) > 1e-4 && Math.abs(y0Val) <= ySpan * 0.95) {
        const py0 = centerY - (y0Val / ySpan) * plotHalfH;
        addYAxisTickAndLabel(py0, formatNumLabel(y0Val), true, y0Val < 0 ? 10 : -10);
      }

      // 2. X-intercepts (real roots f(x) = 0 in [-xSpan * 0.92, xSpan * 0.92])
      const foundRoots: number[] = [];
      const rootScanSteps = 160;
      const scanRange = xSpan * 0.92;
      for (let i = 0; i < rootScanSteps; i++) {
        const xA = -scanRange + (2 * scanRange * i) / rootScanSteps;
        const xB = -scanRange + (2 * scanRange * (i + 1)) / rootScanSteps;
        const yA = fnEval(xA);
        const yB = fnEval(xB);
        if (!Number.isFinite(yA) || !Number.isFinite(yB)) continue;
        if (Math.abs(yA - yB) > ySpan * 1.2) continue; // skip asymptote jumps
        let rootCand: number | null = null;
        if (Math.abs(yA) <= 1e-5) {
          rootCand = xA;
        } else if (yA * yB < 0) {
          let lo = xA;
          let hi = xB;
          let fLo = yA;
          for (let iter = 0; iter < 14; iter++) {
            const mid = 0.5 * (lo + hi);
            const fMid = fnEval(mid);
            if (!Number.isFinite(fMid)) break;
            if (fLo * fMid <= 0) {
              hi = mid;
            } else {
              lo = mid;
              fLo = fMid;
            }
          }
          rootCand = 0.5 * (lo + hi);
        }
        if (
          rootCand !== null &&
          Math.abs(rootCand) > 0.07 * xSpan &&
          !foundRoots.some((r) => Math.abs(r - rootCand!) < 0.14 * xSpan)
        ) {
          foundRoots.push(rootCand);
        }
      }
      if (foundRoots.length <= 4) {
        for (const r of foundRoots) {
          const px = centerX + (r / xSpan) * plotHalfW;
          addXAxisTickAndLabel(px, formatNumLabel(r), false);
        }
      }
    }

    if (strokes.length > 6) {
      return { strokes, groupId, kindLabel };
    }
  }

  // Step C: General Implicit Contour Plotter (2-Pass Adaptive Marching Squares on F(x, y) = 0 so the curve fills ~80% of the axes!)
  const findContourExtent = (testSpan: number, nSteps: number) => {
    let maxAbsX = 0;
    let maxAbsY = 0;
    let count = 0;
    const vals: number[][] = [];
    for (let r = 0; r <= nSteps; r++) {
      const row: number[] = [];
      const wy = testSpan - (2 * testSpan * r) / nSteps;
      for (let c = 0; c <= nSteps; c++) {
        const wx = -testSpan + (2 * testSpan * c) / nSteps;
        row.push(evalF(wx, wy));
      }
      vals.push(row);
    }
    const updatePt = (x1: number, y1: number, v1: number, x2: number, y2: number, v2: number) => {
      const denom = v1 - v2;
      const t = Math.abs(denom) > 1e-9 ? Math.max(0, Math.min(1, v1 / denom)) : 0.5;
      const wx = x1 + (x2 - x1) * t;
      const wy = y1 + (y2 - y1) * t;
      maxAbsX = Math.max(maxAbsX, Math.abs(wx));
      maxAbsY = Math.max(maxAbsY, Math.abs(wy));
      count++;
    };
    for (let r = 0; r < nSteps; r++) {
      const wyTop = testSpan - (2 * testSpan * r) / nSteps;
      const wyBot = testSpan - (2 * testSpan * (r + 1)) / nSteps;
      for (let c = 0; c < nSteps; c++) {
        const wxLeft = -testSpan + (2 * testSpan * c) / nSteps;
        const wxRight = -testSpan + (2 * testSpan * (c + 1)) / nSteps;
        const vTL = vals[r][c];
        const vTR = vals[r][c + 1];
        const vBR = vals[r + 1][c + 1];
        const vBL = vals[r + 1][c];
        if (!Number.isFinite(vTL) || !Number.isFinite(vTR) || !Number.isFinite(vBR) || !Number.isFinite(vBL)) {
          continue;
        }
        if ((vTL >= 0) !== (vTR >= 0)) updatePt(wxLeft, wyTop, vTL, wxRight, wyTop, vTR);
        if ((vTR >= 0) !== (vBR >= 0)) updatePt(wxRight, wyTop, vTR, wxRight, wyBot, vBR);
        if ((vBR >= 0) !== (vBL >= 0)) updatePt(wxRight, wyBot, vBR, wxLeft, wyBot, vBL);
        if ((vBL >= 0) !== (vTL >= 0)) updatePt(wxLeft, wyBot, vBL, wxLeft, wyTop, vTL);
      }
    }
    return { maxAbsX, maxAbsY, count };
  };

  let scout = findContourExtent(3.2, 48);
  if (scout.count === 0) {
    scout = findContourExtent(10.0, 56);
  }

  const gridN = 76;
  const maxCurveSpan = Math.max(scout.maxAbsX, scout.maxAbsY, 0.4);
  const aspectRatio =
    scout.maxAbsX > 0.1 && scout.maxAbsY > 0.1
      ? Math.max(scout.maxAbsX / scout.maxAbsY, scout.maxAbsY / scout.maxAbsX)
      : 1;
  // Fit the contour tightly so it occupies ~80% of the coordinate axes!
  const wSpan =
    scout.count > 0
      ? (aspectRatio > 1.8 ? Math.max(0.25, scout.maxAbsX) : maxCurveSpan) * 1.04
      : 3.0;
  const hSpan =
    scout.count > 0
      ? (aspectRatio > 1.8 ? Math.max(0.25, scout.maxAbsY) : maxCurveSpan) * 1.04
      : 3.0;
  const gridVals: number[][] = [];
  for (let r = 0; r <= gridN; r++) {
    const row: number[] = [];
    const wy = hSpan - (2 * hSpan * r) / gridN;
    for (let c = 0; c <= gridN; c++) {
      const wx = -wSpan + (2 * wSpan * c) / gridN;
      row.push(evalF(wx, wy));
    }
    gridVals.push(row);
  }

  type Seg = { p1: { x: number; y: number }; p2: { x: number; y: number }; used?: boolean };
  const segs: Seg[] = [];

  const interpPt = (
    x1: number,
    y1: number,
    v1: number,
    x2: number,
    y2: number,
    v2: number
  ): { x: number; y: number } => {
    const denom = v1 - v2;
    const t = Math.abs(denom) > 1e-9 ? Math.max(0, Math.min(1, v1 / denom)) : 0.5;
    const wx = x1 + (x2 - x1) * t;
    const wy = y1 + (y2 - y1) * t;
    return {
      x: centerX + (wx / wSpan) * plotHalfW,
      y: centerY - (wy / hSpan) * plotHalfH,
    };
  };

  for (let r = 0; r < gridN; r++) {
    const wyTop = hSpan - (2 * hSpan * r) / gridN;
    const wyBot = hSpan - (2 * hSpan * (r + 1)) / gridN;
    for (let c = 0; c < gridN; c++) {
      const wxLeft = -wSpan + (2 * wSpan * c) / gridN;
      const wxRight = -wSpan + (2 * wSpan * (c + 1)) / gridN;
      const vTL = gridVals[r][c];
      const vTR = gridVals[r][c + 1];
      const vBR = gridVals[r + 1][c + 1];
      const vBL = gridVals[r + 1][c];
      if (
        !Number.isFinite(vTL) ||
        !Number.isFinite(vTR) ||
        !Number.isFinite(vBR) ||
        !Number.isFinite(vBL)
      ) {
        continue;
      }
      const edgePts: { x: number; y: number }[] = [];
      if ((vTL >= 0) !== (vTR >= 0)) {
        edgePts.push(interpPt(wxLeft, wyTop, vTL, wxRight, wyTop, vTR));
      }
      if ((vTR >= 0) !== (vBR >= 0)) {
        edgePts.push(interpPt(wxRight, wyTop, vTR, wxRight, wyBot, vBR));
      }
      if ((vBR >= 0) !== (vBL >= 0)) {
        edgePts.push(interpPt(wxRight, wyBot, vBR, wxLeft, wyBot, vBL));
      }
      if ((vBL >= 0) !== (vTL >= 0)) {
        edgePts.push(interpPt(wxLeft, wyBot, vBL, wxLeft, wyTop, vTL));
      }
      if (edgePts.length === 2) {
        segs.push({ p1: edgePts[0], p2: edgePts[1] });
      }
    }
  }

  // Chain segments into continuous polylines
  let chainIdx = 0;
  for (let i = 0; i < segs.length; i++) {
    if (segs[i].used) continue;
    segs[i].used = true;
    const poly: { x: number; y: number }[] = [segs[i].p1, segs[i].p2];
    let extended = true;
    while (extended) {
      extended = false;
      const tail = poly[poly.length - 1];
      const head = poly[0];
      for (let j = 0; j < segs.length; j++) {
        if (segs[j].used) continue;
        if (Math.hypot(segs[j].p1.x - tail.x, segs[j].p1.y - tail.y) < 3.5) {
          segs[j].used = true;
          poly.push(segs[j].p2);
          extended = true;
          break;
        }
        if (Math.hypot(segs[j].p2.x - tail.x, segs[j].p2.y - tail.y) < 3.5) {
          segs[j].used = true;
          poly.push(segs[j].p1);
          extended = true;
          break;
        }
        if (Math.hypot(segs[j].p1.x - head.x, segs[j].p1.y - head.y) < 3.5) {
          segs[j].used = true;
          poly.unshift(segs[j].p2);
          extended = true;
          break;
        }
        if (Math.hypot(segs[j].p2.x - head.x, segs[j].p2.y - head.y) < 3.5) {
          segs[j].used = true;
          poly.unshift(segs[j].p1);
          extended = true;
          break;
        }
      }
    }
    if (poly.length >= 3) {
      addCurveStroke(poly, chainIdx++, false);
    }
  }

  if (strokes.length <= 6) {
    return null;
  }

  // Quantitative Axis Intercepts for General Implicit Curves F(x, y) = 0
  // (e.g. Heart curve `(x^2+y^2-1)^3 - x^2*y^3 = 0` -> x-intercepts at -1, 1 and y-intercepts at -1, 1)
  if (isQuantitative) {
    const find1DRoots = (fn1D: (t: number) => number, span: number): number[] => {
      const roots: number[] = [];
      const steps = 200;
      const range = span * 0.98;
      for (let i = 0; i < steps; i++) {
        const tA = -range + (2 * range * i) / steps;
        const tB = -range + (2 * range * (i + 1)) / steps;
        const vA = fn1D(tA);
        const vB = fn1D(tB);
        if (!Number.isFinite(vA) || !Number.isFinite(vB)) continue;
        let rootCand: number | null = null;
        if (Math.abs(vA) <= 1e-6) {
          rootCand = tA;
        } else if ((vA > 0) !== (vB > 0)) {
          let lo = tA;
          let hi = tB;
          let fLo = vA;
          for (let iter = 0; iter < 18; iter++) {
            const mid = 0.5 * (lo + hi);
            const fMid = fn1D(mid);
            if (!Number.isFinite(fMid)) break;
            if ((fLo > 0) !== (fMid > 0) || fMid === 0) {
              hi = mid;
            } else {
              lo = mid;
              fLo = fMid;
            }
          }
          rootCand = 0.5 * (lo + hi);
        }
        if (
          rootCand !== null &&
          Math.abs(rootCand) > 0.08 * span &&
          !roots.some((r) => Math.abs(r - rootCand!) < 0.14 * span)
        ) {
          roots.push(rootCand);
        }
      }
      return roots;
    };

    const xIntercepts = find1DRoots((wx) => evalF(wx, 0), wSpan);
    if (xIntercepts.length <= 4) {
      for (const rx of xIntercepts) {
        const px = centerX + (rx / wSpan) * plotHalfW;
        addXAxisTickAndLabel(px, formatNumLabel(rx), true, rx < 0 ? -10 : 10);
      }
    }

    const yIntercepts = find1DRoots((wy) => evalF(0, wy), hSpan);
    if (yIntercepts.length <= 4) {
      for (const ry of yIntercepts) {
        const py = centerY - (ry / hSpan) * plotHalfH;
        addYAxisTickAndLabel(py, formatNumLabel(ry), false, ry > 0 ? -10 : 11);
      }
    }
  }

  return { strokes, groupId, kindLabel };
}

/**
 * Prepares the strokes of a generated math diagram for progressive drawing animation:
 * - Closed contour loops (e.g. heart curve) are rotated so point 0 is at the top peak (minimum y).
 * - Open curves / lines are oriented left-to-right (or top-to-bottom if vertical).
 */
export function prepareMathGraphStrokesForAnimation(strokes: StrokeObject[]): StrokeObject[] {
  return strokes.map((s) => {
    if (!s.id.includes('-crv-') || s.shapeType === 'ellipse' || s.shapeType === 'circle') {
      return s;
    }
    const pts = s.points;
    if (pts.length < 2) return s;

    // Check if closed contour loop (start and end within 18px)
    const isClosedLoop =
      pts.length >= 6 &&
      Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) <= 18;

    if (isClosedLoop) {
      let topIdx = 0;
      let minY = Infinity;
      for (let i = 0; i < pts.length; i++) {
        if (pts[i].y < minY) {
          minY = pts[i].y;
          topIdx = i;
        }
      }
      const corePts =
        Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) < 2
          ? pts.slice(0, -1)
          : pts;
      const safeTopIdx = Math.min(topIdx, corePts.length - 1);
      const rotated = [
        ...corePts.slice(safeTopIdx),
        ...corePts.slice(0, safeTopIdx),
        { ...corePts[safeTopIdx] },
      ];
      return { ...s, points: rotated };
    }

    // For open curves / lines, ensure left-to-right drawing direction
    const first = pts[0];
    const last = pts[pts.length - 1];
    if (first.x > last.x + 2) {
      return { ...s, points: [...pts].reverse() };
    }
    return s;
  });
}

/**
 * Computes an intermediate frame of `StrokeObject[]` at `elapsedMs` (out of `totalDurationMs`, default 1750ms):
 * 1. 0ms - 260ms: Fast fade-in of coordinate axes and axis tip labels (`x`, `y`, `K`, `U`, `u`, `t`, etc.)
 * 2. 200ms - 1620ms: Progressive drawing of the curve from one side to the other, or from the top peak around the circumference for circles/ellipses/closed loops
 * 3. 1200ms - 1750ms: Smooth fade-in of dashed projection guides and quantitative tick marks / numbers
 */
export function computeMathGraphAnimationFrame(
  preparedStrokes: StrokeObject[],
  elapsedMs: number,
  totalDurationMs = 1750
): StrokeObject[] {
  if (elapsedMs >= totalDurationMs) {
    return preparedStrokes;
  }

  const axisFadeDuration = 260;
  const curveStartMs = 200;
  const curveDrawDuration = 1420;
  const guidesStartMs = 1180;
  const guidesFadeDuration = totalDurationMs - guidesStartMs;

  const axisAlpha = Math.min(1, Math.max(0.05, elapsedMs / axisFadeDuration));
  const rawCurveU = Math.min(1, Math.max(0, (elapsedMs - curveStartMs) / curveDrawDuration));
  // Smooth ease-in-out cubic progression for the curve sweep
  const curveProgress =
    rawCurveU < 0.5
      ? 2 * rawCurveU * rawCurveU
      : 1 - Math.pow(-2 * rawCurveU + 2, 2) / 2;
  const guidesAlpha = Math.min(1, Math.max(0, (elapsedMs - guidesStartMs) / guidesFadeDuration));

  const out: StrokeObject[] = [];

  for (const s of preparedStrokes) {
    const isPrimaryAxisOrTip = /-axx|-axy|-lblx|-lbly|-ly-|-lx-|-lt-/.test(s.id);
    const isCurve = s.id.includes('-crv-');

    if (isPrimaryAxisOrTip) {
      out.push(axisAlpha >= 0.995 ? s : { ...s, opacity: (s.opacity ?? 1) * axisAlpha });
      continue;
    }

    if (isCurve) {
      if (curveProgress <= 0.005) continue;
      if (curveProgress >= 0.998) {
        out.push(s);
        continue;
      }

      // Circle or Ellipse: sweep clockwise starting from the top peak (theta = -pi/2) around the perimeter
      if ((s.shapeType === 'ellipse' || s.shapeType === 'circle') && s.points.length >= 4) {
        const topPt = s.points[0];
        const rightPt = s.points[1];
        const botPt = s.points[2];
        const leftPt = s.points[3];
        const cx = (rightPt.x + leftPt.x) / 2;
        const cy = (botPt.y + topPt.y) / 2;
        const rx = Math.abs(rightPt.x - leftPt.x) / 2;
        const ry = Math.abs(botPt.y - topPt.y) / 2;
        const steps = Math.max(4, Math.ceil(76 * curveProgress));
        const maxAngle = Math.PI * 2 * curveProgress;
        const arcPts: BezierPoint[] = [];
        for (let i = 0; i <= steps; i++) {
          const theta = -Math.PI / 2 + (maxAngle * i) / steps;
          arcPts.push({
            x: cx + rx * Math.cos(theta),
            y: cy + ry * Math.sin(theta),
            pressure: 0.7,
          });
        }
        out.push({
          ...s,
          isShape: false,
          shapeType: undefined,
          points: arcPts,
        });
        continue;
      }

      // Polyline or 2-point Line: slice progressively by arc length from start to end
      const pts = s.points;
      if (pts.length === 2) {
        const p0 = pts[0];
        const p1 = pts[1];
        out.push({
          ...s,
          points: [
            p0,
            {
              x: p0.x + (p1.x - p0.x) * curveProgress,
              y: p0.y + (p1.y - p0.y) * curveProgress,
              pressure: 0.7,
            },
          ],
        });
        continue;
      }

      if (pts.length > 2) {
        const cumLen: number[] = [0];
        let totalLen = 0;
        for (let i = 1; i < pts.length; i++) {
          totalLen += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
          cumLen.push(totalLen);
        }
        if (totalLen <= 1e-4) {
          out.push(s);
          continue;
        }
        const targetLen = totalLen * curveProgress;
        const slicedPts: BezierPoint[] = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
          if (cumLen[i] <= targetLen) {
            slicedPts.push(pts[i]);
          } else {
            const segLen = cumLen[i] - cumLen[i - 1];
            const frac = segLen > 1e-5 ? (targetLen - cumLen[i - 1]) / segLen : 1;
            slicedPts.push({
              x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * frac,
              y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * frac,
              pressure: 0.7,
            });
            break;
          }
        }
        if (slicedPts.length >= 2) {
          out.push({
            ...s,
            points: slicedPts,
          });
        }
      }
      continue;
    }

    // Dashed Projection Guides & Quantitative Tick Marks / Numbers
    if (guidesAlpha > 0.01) {
      out.push(guidesAlpha >= 0.995 ? s : { ...s, opacity: (s.opacity ?? 1) * guidesAlpha });
    }
  }

  return out;
}







